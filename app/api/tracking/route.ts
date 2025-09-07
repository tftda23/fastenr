import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tracking_key,
      event_type,
      session_id,
      user_fingerprint,
      timestamp,
      page_url,
      page_title,
      referrer,
      user_agent,
      screen_resolution,
      viewport_size,
      session_data,
      account,
      ...eventData
    } = body

    if (!tracking_key) {
      return NextResponse.json({ error: 'Tracking key is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find the product by tracking key
    const { data: product, error: productError } = await supabase
      .from('usage_tracking_products')
      .select('*')
      .eq('tracking_key', tracking_key)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Invalid tracking key' }, { status: 401 })
    }

    // Handle account-based tracking if product is configured for it
    let trackedAccountId = null
    if (product.track_by_account && account) {
      // Find or create tracked account
      const { data: existingAccount } = await supabase
        .from('usage_tracked_accounts')
        .select('id')
        .eq('product_id', product.id)
        .eq('account_id', account.id)
        .single()

      if (existingAccount) {
        trackedAccountId = existingAccount.id
        
        // Update last activity
        await supabase
          .from('usage_tracked_accounts')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', existingAccount.id)
      } else {
        // Create new tracked account
        const { data: newAccount, error: accountError } = await supabase
          .from('usage_tracked_accounts')
          .insert({
            product_id: product.id,
            account_id: account.id,
            account_name: account.name || null,
            account_domain: account.domain || null,
            last_activity_at: new Date().toISOString(),
            is_active: true
          })
          .select('id')
          .single()

        if (!accountError && newAccount) {
          trackedAccountId = newAccount.id
        }
      }
    }

    // Process different event types
    if (event_type === 'page_view') {
      // Record page view event
      await supabase
        .from('usage_events')
        .insert({
          product_id: product.id,
          tracked_account_id: trackedAccountId,
          session_id,
          user_fingerprint,
          event_type: 'page_view',
          event_data: {
            page_url,
            page_title,
            referrer,
            ...eventData
          },
          timestamp: new Date(timestamp).toISOString(),
          user_agent,
          screen_resolution,
          viewport_size
        })

      // Update product last activity
      await supabase
        .from('usage_tracking_products')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', product.id)
    }

    if (event_type === 'click') {
      await supabase
        .from('usage_events')
        .insert({
          product_id: product.id,
          tracked_account_id: trackedAccountId,
          session_id,
          user_fingerprint,
          event_type: 'click',
          event_data: eventData,
          timestamp: new Date(timestamp).toISOString(),
          user_agent,
          screen_resolution,
          viewport_size
        })
    }

    if (event_type === 'scroll') {
      await supabase
        .from('usage_events')
        .insert({
          product_id: product.id,
          tracked_account_id: trackedAccountId,
          session_id,
          user_fingerprint,
          event_type: 'scroll',
          event_data: eventData,
          timestamp: new Date(timestamp).toISOString(),
          user_agent,
          screen_resolution,
          viewport_size
        })
    }

    if (event_type === 'form_interaction') {
      await supabase
        .from('usage_events')
        .insert({
          product_id: product.id,
          tracked_account_id: trackedAccountId,
          session_id,
          user_fingerprint,
          event_type: 'form_interaction',
          event_data: eventData,
          timestamp: new Date(timestamp).toISOString(),
          user_agent,
          screen_resolution,
          viewport_size
        })
    }

    if (event_type === 'session_end') {
      // Record session end and calculate metrics
      const sessionEndTime = new Date(timestamp)
      const sessionStartTime = new Date(session_data.startTime)
      const sessionDuration = Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000)

      // Insert session end event
      await supabase
        .from('usage_events')
        .insert({
          product_id: product.id,
          tracked_account_id: trackedAccountId,
          session_id,
          user_fingerprint,
          event_type: 'session_end',
          event_data: {
            session_duration: sessionDuration,
            page_views: session_data.pageViews || 0,
            clicks: session_data.clicks || 0,
            scroll_depth: session_data.scrollDepth || 0,
            ...eventData
          },
          timestamp: sessionEndTime.toISOString(),
          user_agent,
          screen_resolution,
          viewport_size
        })

      // Aggregate metrics for this session
      const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

      // Check if we already have metrics for today
      const { data: existingMetrics } = await supabase
        .from('usage_metrics')
        .select('*')
        .eq('product_id', product.id)
        .eq('tracked_account_id', trackedAccountId)
        .gte('recorded_at', `${currentDate}T00:00:00.000Z`)
        .lt('recorded_at', `${currentDate}T23:59:59.999Z`)
        .single()

      if (existingMetrics) {
        // Update existing metrics
        await supabase
          .from('usage_metrics')
          .update({
            unique_users: existingMetrics.unique_users + (existingMetrics.unique_users === 0 ? 1 : 0), // Simplified unique user logic
            total_sessions: existingMetrics.total_sessions + 1,
            avg_session_duration: Math.round(
              ((existingMetrics.avg_session_duration * existingMetrics.total_sessions) + sessionDuration) / 
              (existingMetrics.total_sessions + 1)
            ),
            page_views: existingMetrics.page_views + (session_data.pageViews || 0),
            feature_usage: {
              ...existingMetrics.feature_usage,
              clicks: (existingMetrics.feature_usage?.clicks || 0) + (session_data.clicks || 0),
              scroll_interactions: (existingMetrics.feature_usage?.scroll_interactions || 0) + (session_data.scrollDepth > 50 ? 1 : 0)
            },
            recorded_at: new Date().toISOString()
          })
          .eq('id', existingMetrics.id)
      } else {
        // Create new daily metrics
        await supabase
          .from('usage_metrics')
          .insert({
            product_id: product.id,
            tracked_account_id: trackedAccountId,
            unique_users: 1, // Simplified - in reality would need better unique user tracking
            total_sessions: 1,
            avg_session_duration: sessionDuration,
            page_views: session_data.pageViews || 0,
            feature_usage: {
              clicks: session_data.clicks || 0,
              scroll_interactions: session_data.scrollDepth > 50 ? 1 : 0
            },
            recorded_at: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}