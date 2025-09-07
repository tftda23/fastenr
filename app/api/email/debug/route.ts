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

    // Get user profile to check permissions
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Only allow admins to see debug info
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check environment variables and configuration
    const config = {
      resend: {
        apiKeyExists: !!process.env.RESEND_API_KEY,
        apiKeyPrefix: process.env.RESEND_API_KEY ? 
          process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'Not set'
      },
      emailConfig: {
        fromEmail: process.env.EMAIL_FROM_NOTIFICATIONS || 'onboarding@resend.dev (FALLBACK)',
        fromName: process.env.EMAIL_FROM_NAME || 'Fastenr Customer Success (DEFAULT)',
        appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || 'Not configured'
      },
      status: {
        canSendEmails: !!process.env.RESEND_API_KEY,
        usingDefaults: !process.env.EMAIL_FROM_NOTIFICATIONS
      }
    }

    // Test Resend connectivity if API key exists
    let resendTest = null
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        // Try to get domains (this tests API connectivity)
        const domainsResponse = await resend.domains.list()
        resendTest = {
          apiConnected: true,
          domains: domainsResponse.data?.data || [],
          error: null
        }
      } catch (error) {
        resendTest = {
          apiConnected: false,
          domains: [],
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      config,
      resendTest,
      recommendations: generateRecommendations(config, resendTest)
    })

  } catch (error) {
    console.error('Email debug error:', error)
    return NextResponse.json(
      { error: 'Failed to get debug information' },
      { status: 500 }
    )
  }
}

function generateRecommendations(config: any, resendTest: any) {
  const recommendations = []

  if (!config.resend.apiKeyExists) {
    recommendations.push({
      level: 'error',
      title: 'Missing RESEND_API_KEY',
      message: 'Add your Resend API key to environment variables',
      action: 'Set RESEND_API_KEY=re_your_key_here in your .env file'
    })
  }

  if (config.status.usingDefaults) {
    recommendations.push({
      level: 'info', 
      title: 'Using Resend fallback address',
      message: 'Configure your own verified domain for production',
      action: 'Set EMAIL_FROM_NOTIFICATIONS=noreply@yourdomain.com (after verifying domain in Resend dashboard)'
    })
  }

  if (resendTest && !resendTest.apiConnected) {
    recommendations.push({
      level: 'error',
      title: 'Resend API connection failed',
      message: resendTest.error,
      action: 'Check your RESEND_API_KEY is valid and active'
    })
  }

  if (resendTest && resendTest.domains && resendTest.domains.length === 0) {
    recommendations.push({
      level: 'warning',
      title: 'No verified domains in Resend',
      message: 'You need at least one verified domain to send emails',
      action: 'Add and verify a domain in your Resend dashboard'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      level: 'success',
      title: 'Configuration looks good!',
      message: 'Your email setup appears to be configured correctly',
      action: 'Try sending a test email'
    })
  }

  return recommendations
}

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMITS.DEFAULT, getUserIdFromSupabase)(
    request,
    () => handleGET(request)
  )
}