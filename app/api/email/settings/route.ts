import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, RATE_LIMITS, getUserIdFromSupabase } from '@/lib/rate-limiting'

async function handleGET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check organization
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get available domains for this organization
    const { data: availableDomains } = await supabase
      .rpc('get_org_email_domains', { org_id: profile.organization_id })

    const defaultDomain = availableDomains?.find((d: any) => d.is_default)?.domain_name || 'fastenr.co'
    const customDomain = availableDomains?.find((d: any) => !d.is_default && d.status === 'verified')?.domain_name

    // Use custom domain if available and verified, otherwise use fastenr.co
    const activeDomain = customDomain || defaultDomain

    // Get email settings for the organization
    const { data: settings, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Ensure email addresses use the correct domain
    const defaultFromEmail = settings?.from_email || `noreply@${activeDomain}`
    const fromEmailDomain = defaultFromEmail.split('@')[1]
    
    // If stored email doesn't match current domain, update it
    const correctedFromEmail = fromEmailDomain === activeDomain 
      ? defaultFromEmail 
      : `${defaultFromEmail.split('@')[0]}@${activeDomain}`

    return NextResponse.json({ 
      success: true, 
      data: {
        ...settings,
        from_email: correctedFromEmail,
        from_name: settings?.from_name || 'Customer Success',
        reply_to_email: settings?.reply_to_email || `no-reply@${activeDomain}`,
        logo_url: settings?.logo_url || '',
        organization_name: settings?.organization_name || 'Your Organization',
        provider: settings?.provider || 'resend',
        provider_config: settings?.provider_config || {}
      },
      meta: {
        activeDomain: activeDomain,
        isUsingCustomDomain: !!customDomain,
        canChangeEmailDomain: false, // Email domain is locked to organization's domain
        availablePrefix: defaultFromEmail.split('@')[0]
      }
    })

  } catch (error) {
    console.error('Error fetching email settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    )
  }
}

async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check organization
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Only allow admins to update email settings
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      from_name, 
      reply_to_email, 
      logo_url, 
      organization_name,
      provider,
      provider_config 
    } = body

    // Get available domains for this organization to enforce email domain restrictions
    const { data: availableDomains } = await supabase
      .rpc('get_org_email_domains', { org_id: profile.organization_id })

    const defaultDomain = availableDomains?.find((d: any) => d.is_default)?.domain_name || 'fastenr.co'
    const customDomain = availableDomains?.find((d: any) => !d.is_default && d.status === 'verified')?.domain_name

    // Use custom domain if available and verified, otherwise use fastenr.co
    const activeDomain = customDomain || defaultDomain

    // Extract email prefix from submitted from_email or use default
    const submittedPrefix = body.from_email ? body.from_email.split('@')[0] : 'noreply'
    
    // Validate prefix (basic email validation)
    if (!/^[a-zA-Z0-9._-]+$/.test(submittedPrefix)) {
      return NextResponse.json({ 
        error: 'Invalid email prefix. Use only letters, numbers, dots, hyphens, and underscores.' 
      }, { status: 400 })
    }

    // Force the email to use the organization's domain
    const from_email = `${submittedPrefix}@${activeDomain}`
    const corrected_reply_to = reply_to_email 
      ? `${reply_to_email.split('@')[0]}@${activeDomain}`
      : `no-reply@${activeDomain}`

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from('email_settings')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .single()

    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('email_settings')
        .update({
          from_email,
          from_name,
          reply_to_email: corrected_reply_to,
          logo_url,
          organization_name,
          provider: provider || 'resend',
          provider_config: provider_config || {},
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', profile.organization_id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('email_settings')
        .insert({
          organization_id: profile.organization_id,
          from_email,
          from_name,
          reply_to_email: corrected_reply_to,
          logo_url,
          organization_name,
          provider: provider || 'resend',
          provider_config: provider_config || {},
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    })

  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json(
      { error: 'Failed to save email settings' },
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
  return withRateLimit(RATE_LIMITS.STRICT, getUserIdFromSupabase)(
    request,
    () => handlePOST(request)
  )
}