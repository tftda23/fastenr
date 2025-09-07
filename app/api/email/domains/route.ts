import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { withRateLimit, RATE_LIMITS, getUserIdFromSupabase } from '@/lib/rate-limiting'

async function handleGET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Clean up stale domains first
    await supabase.rpc('mark_stale_domains')
    await supabase.rpc('cleanup_abandoned_domains')

    // Get only domains owned by this organization
    const { data: ownedDomains, error: domainError } = await supabase
      .from('domain_ownership')
      .select('domain_name, resend_domain_id, status, is_default, created_at, verified_at')
      .eq('organization_id', profile.organization_id)
      .order('is_default', { ascending: false })

    if (domainError) {
      console.error('Error fetching owned domains:', domainError)
      return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Only fetch details for domains owned by this organization
    const domainsWithDetails = await Promise.all(
      (ownedDomains || []).map(async (ownedDomain: any) => {
        // Skip fetching DNS details for default fastenr.co domain
        if (ownedDomain.is_default) {
          return {
            id: ownedDomain.resend_domain_id,
            name: ownedDomain.domain_name,
            status: ownedDomain.status,
            region: 'us-east-1',
            createdAt: ownedDomain.created_at,
            records: [], // Hide DNS records for default domain
            isDefault: true,
            owned: true
          }
        }

        try {
          const domainDetail = await resend.domains.get(ownedDomain.resend_domain_id)
          
          // Update last checked timestamp
          await supabase
            .from('domain_ownership')
            .update({ 
              last_checked_at: new Date().toISOString(),
              status: domainDetail.data?.status || 'pending'
            })
            .eq('resend_domain_id', ownedDomain.resend_domain_id)

          return {
            ...domainDetail.data,
            records: domainDetail.data?.records || [],
            owned: true,
            isDefault: false
          }
        } catch (error) {
          console.error(`Failed to get details for domain ${ownedDomain.resend_domain_id}:`, error)
          
          // Mark as potentially stale if we can't fetch it
          await supabase
            .from('domain_ownership')
            .update({ status: 'stale' })
            .eq('resend_domain_id', ownedDomain.resend_domain_id)

          return {
            id: ownedDomain.resend_domain_id,
            name: ownedDomain.domain_name,
            status: 'stale',
            region: 'unknown',
            createdAt: ownedDomain.created_at,
            records: [],
            owned: true,
            isDefault: false
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      domains: domainsWithDetails.filter(Boolean) // Remove any null results
    })

  } catch (error) {
    console.error('Domain list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { domain } = body

    if (!domain) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 })
    }

    // Prevent adding fastenr.co domain
    if (domain.toLowerCase() === 'fastenr.co') {
      return NextResponse.json({ 
        error: 'fastenr.co is reserved for system use and cannot be added' 
      }, { status: 400 })
    }

    // Check if organization already has a domain (limit to one custom domain for now)
    const { data: existingDomains } = await supabase
      .from('domain_ownership')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .eq('is_default', false)

    if (existingDomains && existingDomains.length > 0) {
      return NextResponse.json({
        error: 'Your organization already has a custom domain. Please remove the existing domain first.'
      }, { status: 400 })
    }

    // Check if domain is already owned by another organization
    const { data: existingOwnership } = await supabase
      .from('domain_ownership')
      .select('organization_id')
      .eq('domain_name', domain)
      .single()

    if (existingOwnership) {
      return NextResponse.json({
        error: 'This domain is already registered by another organization'
      }, { status: 409 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.domains.create({ name: domain })

    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error
      })
    }

    // Record domain ownership
    const { error: ownershipError } = await supabase
      .from('domain_ownership')
      .insert({
        organization_id: profile.organization_id,
        domain_name: domain,
        resend_domain_id: result.data?.id,
        status: 'pending',
        created_by: user.id,
        is_default: false
      })

    if (ownershipError) {
      console.error('Error recording domain ownership:', ownershipError)
      // Try to clean up the Resend domain if ownership recording failed
      try {
        await resend.domains.remove(result.data?.id)
      } catch (cleanupError) {
        console.error('Failed to cleanup Resend domain:', cleanupError)
      }
      
      return NextResponse.json({
        error: 'Failed to register domain ownership'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      domain: {
        ...result.data,
        owned: true,
        isDefault: false
      }
    })

  } catch (error) {
    console.error('Domain creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create domain' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMITS.DEFAULT, getUserIdFromSupabase)(
    request,
    () => handleGET(request)
  )
}

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMITS.DOMAIN_OPERATIONS, getUserIdFromSupabase)(
    request,
    () => handlePOST(request)
  )
}