import { NextRequest, NextResponse } from 'next/server'
import { testEmailConfiguration, sendNotificationEmail } from '@/lib/email'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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
      .select('role, organization_id, email, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Only allow admins to test email configuration
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { testType = 'configuration', testEmail } = body

    if (testType === 'configuration') {
      // Test basic email configuration
      const isConfigured = await testEmailConfiguration()
      
      return NextResponse.json({
        success: true,
        configured: isConfigured,
        message: isConfigured 
          ? 'Email configuration is working correctly' 
          : 'Email not configured - using mock emails. Add RESEND_API_KEY to enable real emails.'
      })
    }

    if (testType === 'send' && testEmail) {
      // Send a test email to the specified address
      const testRecipient = [{ 
        email: testEmail, 
        name: profile.full_name || 'Test User' 
      }]

      const testNotification = {
        type: 'onboarding' as const,
        accountName: 'Test Account',
        message: 'This is a test email to verify your email configuration is working correctly.',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      }

      const result = await sendNotificationEmail(
        testRecipient,
        testNotification,
        process.env.EMAIL_FROM_NOTIFICATIONS || 'notifications@yourdomain.com',
        process.env.EMAIL_FROM_NAME || 'Customer Success Platform'
      )

      return NextResponse.json({
        success: true,
        sent: result.sent_count > 0,
        mock: result.mock || false,
        message: result.mock 
          ? 'Test email logged (mock mode - configure RESEND_API_KEY for real emails)'
          : `Test email sent successfully to ${testEmail}`
      })
    }

    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: 'Failed to test email configuration' },
      { status: 500 }
    )
  }
}