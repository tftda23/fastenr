import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers for cross-origin tracking
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      trackingKey, 
      fingerprint, 
      sessionId, 
      eventType, 
      eventData, 
      timestamp,
      account // Account context for multi-tenant tracking
    } = body

    // Validate required fields
    if (!trackingKey || !fingerprint || !sessionId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required tracking parameters' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createClient()

    // Get the tracking product
    const { data: product, error: productError } = await supabase
      .from('usage_tracking_products')
      .select('id, organization_id, is_active, allowed_domains, track_by_account')
      .eq('tracking_key', trackingKey)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Invalid tracking key or inactive product' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Handle account-based tracking
    let trackedAccountId = null
    if (product.track_by_account && account) {
      // Look up or create tracked account
      let accountRecord
      
      // Try to find existing account by different identifiers
      let accountQuery = supabase
        .from('usage_tracked_accounts')
        .select('id')
        .eq('product_id', product.id)
        .eq('is_active', true)

      if (account.id) {
        accountQuery = accountQuery.eq('account_id', account.id)
      } else if (account.domain) {
        accountQuery = accountQuery.eq('account_domain', account.domain)
      } else if (account.customId) {
        accountQuery = accountQuery.eq('custom_identifier', account.customId)
      } else {
        // No valid account identifier provided
        if (product.track_by_account) {
          return NextResponse.json(
            { error: 'Account context required for multi-tenant tracking' },
            { status: 400, headers: corsHeaders }
          )
        }
      }

      const { data: existingAccount } = await accountQuery.single()
      
      if (existingAccount) {
        trackedAccountId = existingAccount.id
        
        // Update last activity
        await supabase
          .from('usage_tracked_accounts')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', existingAccount.id)
      } else {
        // Create new tracked account
        const newAccountData: any = {
          product_id: product.id,
          last_activity_at: new Date().toISOString(),
          is_active: true
        }

        if (account.id) newAccountData.account_id = account.id
        if (account.domain) newAccountData.account_domain = account.domain
        if (account.name) newAccountData.account_name = account.name
        if (account.customId) newAccountData.custom_identifier = account.customId

        const { data: newAccount, error: accountError } = await supabase
          .from('usage_tracked_accounts')
          .insert(newAccountData)
          .select('id')
          .single()

        if (accountError) {
          console.error('Error creating tracked account:', accountError)
          // Continue without account tracking rather than failing
        } else {
          trackedAccountId = newAccount.id
        }
      }
    }

    // Validate domain if restricted
    const origin = request.headers.get('origin') || request.headers.get('referer')
    if (product.allowed_domains?.length > 0 && origin) {
      const domain = new URL(origin).hostname
      const isAllowed = product.allowed_domains.some(allowed => 
        domain === allowed || domain.endsWith(`.${allowed}`)
      )
      
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Domain not allowed' },
          { status: 403, headers: corsHeaders }
        )
      }
    }

    // Get or create user fingerprint
    let fingerprintRecord
    let fingerprintQuery = supabase
      .from('user_fingerprints')
      .select('id, session_count, total_time_spent')
      .eq('product_id', product.id)
      .eq('fingerprint_hash', fingerprint)
    
    // If account-based tracking, include account in fingerprint lookup
    if (trackedAccountId) {
      fingerprintQuery = fingerprintQuery.eq('tracked_account_id', trackedAccountId)
    }
    
    const { data: existingFingerprint, error: fingerprintError } = await fingerprintQuery.single()

    if (existingFingerprint) {
      fingerprintRecord = existingFingerprint
    } else {
      // Create new fingerprint record
      const fingerprintData: any = {
        product_id: product.id,
        fingerprint_hash: fingerprint,
        browser_fingerprint: eventData?.browserFingerprint || {},
        behavioral_signature: eventData?.behavioralSignature || {},
        session_persistence: eventData?.persistentId ? { id: eventData.persistentId } : {},
        user_type: 'anonymous',
        confidence_score: eventData?.confidence || 0.5,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        session_count: 1,
        total_time_spent: 0
      }
      
      // Add account context if available
      if (trackedAccountId) {
        fingerprintData.tracked_account_id = trackedAccountId
      }
      
      const { data: newFingerprint, error: createError } = await supabase
        .from('user_fingerprints')
        .insert(fingerprintData)
        .select('id, session_count, total_time_spent')
        .single()

      if (createError) {
        console.error('Error creating fingerprint:', createError)
        return NextResponse.json(
          { error: 'Failed to create user fingerprint' },
          { status: 500, headers: corsHeaders }
        )
      }

      fingerprintRecord = newFingerprint
    }

    // Handle different event types
    let sessionRecord
    switch (eventType) {
      case 'session_start':
        // Create or update session
        const sessionData: any = {
          product_id: product.id,
          fingerprint_id: fingerprintRecord.id,
          session_token: sessionId,
          started_at: new Date().toISOString(),
          user_agent: eventData?.userAgent || '',
          ip_address: request.ip || '0.0.0.0',
          referrer: eventData?.referrer || '',
          landing_page: eventData?.landingPage || '',
          page_views: 0,
          click_events: 0,
          scroll_depth_max: 0.0,
          form_interactions: 0
        }
        
        // Add account context if available
        if (trackedAccountId) {
          sessionData.tracked_account_id = trackedAccountId
        }
        
        const { data: session, error: sessionError } = await supabase
          .from('usage_sessions')
          .upsert(sessionData, {
            onConflict: 'product_id,session_token',
            ignoreDuplicates: false
          })
          .select()
          .single()

        if (sessionError) {
          console.error('Error creating session:', sessionError)
        }

        // Update product last activity
        await supabase
          .from('usage_tracking_products')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', product.id)

        sessionRecord = session
        break

      case 'page_view':
        // Update session page views
        await supabase
          .from('usage_sessions')
          .update({ 
            page_views: supabase.sql`page_views + 1`,
            ended_at: new Date().toISOString()
          })
          .eq('session_token', sessionId)

        // Log page view event
        await supabase
          .from('usage_events')
          .insert({
            session_id: sessionId,
            event_type: 'page_view',
            page_url: eventData?.url || '',
            event_data: { title: eventData?.title },
            timestamp: new Date().toISOString()
          })
        break

      case 'click':
        // Update session click count
        await supabase
          .from('usage_sessions')
          .update({ 
            click_events: supabase.sql`click_events + 1`,
            ended_at: new Date().toISOString()
          })
          .eq('session_token', sessionId)

        // Log click event
        await supabase
          .from('usage_events')
          .insert({
            session_id: sessionId,
            event_type: 'click',
            element_selector: eventData?.element || '',
            event_data: {
              x: eventData?.x,
              y: eventData?.y
            },
            timestamp: new Date().toISOString()
          })
        break

      case 'form_interaction':
        // Update session form interactions
        await supabase
          .from('usage_sessions')
          .update({ 
            form_interactions: supabase.sql`form_interactions + 1`,
            ended_at: new Date().toISOString()
          })
          .eq('session_token', sessionId)

        // Log form interaction
        await supabase
          .from('usage_events')
          .insert({
            session_id: sessionId,
            event_type: 'form_interaction',
            element_selector: eventData?.element || '',
            event_data: { type: eventData?.type },
            timestamp: new Date().toISOString()
          })
        break

      case 'heartbeat':
        // Update session with engagement metrics
        await supabase
          .from('usage_sessions')
          .update({
            page_views: eventData?.pageViews || 0,
            click_events: eventData?.clickCount || 0,
            scroll_depth_max: eventData?.maxScrollDepth || 0.0,
            form_interactions: eventData?.formInteractions || 0,
            duration_seconds: Math.floor((eventData?.sessionDuration || 0) / 1000),
            ended_at: new Date().toISOString()
          })
          .eq('session_token', sessionId)

        // Update fingerprint behavioral signature
        if (eventData?.behavioralSignature) {
          await supabase
            .from('user_fingerprints')
            .update({
              behavioral_signature: eventData.behavioralSignature,
              last_seen: new Date().toISOString(),
              total_time_spent: fingerprintRecord.total_time_spent + Math.floor((eventData.sessionDuration || 0) / 1000)
            })
            .eq('id', fingerprintRecord.id)
        }
        break

      case 'session_end':
        // Finalize session
        await supabase
          .from('usage_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: Math.floor((eventData?.sessionDuration || 0) / 1000),
            page_views: eventData?.pageViews || 0,
            click_events: eventData?.clickCount || 0,
            scroll_depth_max: eventData?.maxScrollDepth || 0.0,
            form_interactions: eventData?.formInteractions || 0,
            exit_page: eventData?.exitPage || ''
          })
          .eq('session_token', sessionId)

        // Update fingerprint
        await supabase
          .from('user_fingerprints')
          .update({
            last_seen: new Date().toISOString(),
            session_count: fingerprintRecord.session_count + 1,
            total_time_spent: fingerprintRecord.total_time_spent + Math.floor((eventData.sessionDuration || 0) / 1000),
            behavioral_signature: eventData?.behavioralSignature || {}
          })
          .eq('id', fingerprintRecord.id)
        break

      case 'identify':
        // User provided identification
        await supabase
          .from('user_fingerprints')
          .update({
            user_type: 'identified',
            user_email: eventData?.properties?.email || null,
            user_name: eventData?.properties?.name || null,
            custom_user_id: eventData?.userId || null,
            confidence_score: 1.0, // Max confidence for identified users
            last_seen: new Date().toISOString()
          })
          .eq('id', fingerprintRecord.id)
        break

      case 'custom':
        // Custom event tracking
        await supabase
          .from('usage_events')
          .insert({
            session_id: sessionId,
            event_type: 'custom',
            event_name: eventData?.eventName || '',
            event_data: eventData?.properties || {},
            timestamp: new Date().toISOString()
          })
        break
    }

    return NextResponse.json(
      { success: true, received: eventType },
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error processing tracking event:', error)
    return NextResponse.json(
      { error: 'Failed to process tracking event' },
      { status: 500, headers: corsHeaders }
    )
  }
}