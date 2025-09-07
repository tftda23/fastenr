import { NextRequest, NextResponse } from 'next/server'
import { testEmailConfiguration, sendNotificationEmail } from '@/lib/email'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { withRateLimit, RATE_LIMITS, getUserIdFromSupabase } from '@/lib/rate-limiting'

async function handlePOST(request: NextRequest): Promise<NextResponse> {
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

    // Get saved email settings for this organization
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('from_email, from_name, reply_to_email, organization_name')
      .eq('organization_id', profile.organization_id)
      .single()

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
      // Check if RESEND_API_KEY is configured
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured');
        return NextResponse.json({
          success: true,
          sent: false,
          mock: true,
          message: 'Test email logged (mock mode - configure RESEND_API_KEY for real emails)'
        })
      }

      try {
        // Direct Resend API call for better error handling
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Use saved email settings, fallback to env vars, then to Resend onboarding domain
        const fromEmail = emailSettings?.from_email || process.env.EMAIL_FROM_NOTIFICATIONS || 'onboarding@resend.dev'
        const fromName = emailSettings?.from_name || process.env.EMAIL_FROM_NAME || 'Fastenr Customer Success'
        
        console.log(`Attempting to send test email to ${testEmail} from ${fromName} <${fromEmail}>`)
        
        const result = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: testEmail,
          subject: 'Test Email from Fastenr',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Test Email</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #007bff;">✅ Test Email Successful!</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <p><strong>Hi ${profile.full_name || 'there'},</strong></p>
                  <p>This is a test email from your ${emailSettings?.organization_name || 'Fastenr'} Customer Success Platform to verify that email delivery is working correctly.</p>
                  <p><strong>Test Details:</strong></p>
                  <ul>
                    <li><strong>Sent to:</strong> ${testEmail}</li>
                    <li><strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                    <li><strong>Provider:</strong> Resend</li>
                  </ul>
                </div>
                <p>If you received this email, your email configuration is working properly! 🎉</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="font-size: 12px; color: #666; text-align: center;">
                  This test email was sent from ${emailSettings?.organization_name || 'Fastenr'} Customer Success Platform
                </p>
              </body>
            </html>
          `
        })

        console.log('Resend API response status:', result ? 'success' : 'failed')

        // Enhanced logging for debugging
        console.log('Response structure analysis:', {
          hasData: !!result.data,
          hasId: !!(result.data?.id || result.id),
          hasError: !!(result.error || result.data?.error),
          responseKeys: Object.keys(result || {}),
          dataKeys: result.data ? Object.keys(result.data) : 'No data property'
        })

        // Check for different response structures from Resend
        const messageId = result.data?.id || result.id
        const error = result.error || result.data?.error
        
        if (error) {
          console.error('Resend API returned error:', error)
          return NextResponse.json({
            success: false,
            sent: false,
            mock: false,
            message: `Email sending failed: ${typeof error === 'object' ? error.message || JSON.stringify(error) : error}`,
            error: error,
            debug: {
              from: `${fromName} <${fromEmail}>`,
              to: testEmail,
              fullResponse: result
            }
          })
        }
        
        if (messageId) {
          return NextResponse.json({
            success: true,
            sent: true,
            mock: false,
            messageId: messageId,
            message: `Test email sent successfully to ${testEmail}`,
            debug: {
              from: `${fromName} <${fromEmail}>`,
              resendId: messageId,
              fullResponse: result
            }
          })
        } else {
          console.error('Resend API unexpected response structure:', result)
          
          // Check for common issues
          let suggestedFix = 'Check Resend API documentation for response format changes'
          if (result.error) {
            suggestedFix = 'API returned an error - check your domain verification and API key'
          } else if (!result.data) {
            suggestedFix = 'Response missing data property - possible API authentication issue'
          }
          
          return NextResponse.json({
            success: false,
            sent: false,
            mock: false,
            message: `Email sending failed - ${suggestedFix}`,
            error: 'No message ID in response',
            debug: {
              from: `${fromName} <${fromEmail}>`,
              to: testEmail,
              fullResponse: result,
              analysis: {
                hasData: !!result.data,
                hasId: !!(result.data?.id || result.id),
                hasError: !!(result.error || result.data?.error),
                responseKeys: Object.keys(result || {})
              }
            }
          })
        }
      } catch (emailError) {
        console.error('Direct email sending error:', emailError)
        return NextResponse.json({
          success: false,
          sent: false,
          mock: false,
          message: 'Email sending failed',
          error: emailError instanceof Error ? emailError.message : String(emailError)
        })
      }
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

export async function POST(request: NextRequest) {
  // Apply strict rate limiting for email testing
  return withRateLimit(RATE_LIMITS.EMAIL_TEST, getUserIdFromSupabase)(
    request,
    () => handlePOST(request)
  )
}