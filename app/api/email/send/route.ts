import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendNotificationEmail, type EmailRecipient, type NotificationEmailData } from '@/lib/email'

interface CustomEmailData {
  type: 'engagement' | 'survey' | 'notification' | 'custom'
  subject: string
  content: string
  engagement_id?: string
  survey_id?: string
  account_id?: string
}

export async function POST(request: NextRequest) {
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
      .select('organization_id, role, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      recipients, 
      subject, 
      content, 
      type = 'custom',
      engagement_id,
      survey_id,
      account_id 
    }: { 
      recipients: EmailRecipient[]
      subject: string
      content: string
      type?: string
      engagement_id?: string
      survey_id?: string
      account_id?: string
    } = body

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ 
        error: 'Recipients required' 
      }, { status: 400 })
    }

    if (!subject || !content) {
      return NextResponse.json({ 
        error: 'Subject and content are required' 
      }, { status: 400 })
    }

    // Get account name if account_id provided
    let accountName = 'Unknown Account'
    if (account_id) {
      const { data: account } = await supabase
        .from('accounts')
        .select('name')
        .eq('id', account_id)
        .eq('organization_id', profile.organization_id)
        .single()
      
      if (account) {
        accountName = account.name
      }
    }

    // Process content with variables
    const processContent = (rawContent: string, recipient: EmailRecipient): string => {
      let processed = rawContent
      
      // Replace recipient variables
      processed = processed.replace(/\{\{recipient\.name\}\}/g, recipient.name || 'Customer')
      processed = processed.replace(/\{\{recipient\.email\}\}/g, recipient.email)
      
      // Replace account variables
      processed = processed.replace(/\{\{account\.name\}\}/g, accountName)
      
      // Replace other variables
      processed = processed.replace(/\{\{sender\.name\}\}/g, profile.full_name || 'Customer Success Team')
      processed = processed.replace(/\{\{current\.date\}\}/g, new Date().toLocaleDateString())
      
      return processed
    }

    // Create a custom email template for sending
    const emailHtml = (recipient: EmailRecipient): string => {
      const processedContent = processContent(content, recipient)
      
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0; 
                padding: 0; 
                background-color: #f4f4f4; 
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white; 
                padding: 20px; 
                border-radius: 8px; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                padding-bottom: 20px; 
                border-bottom: 1px solid #eee; 
              }
              .content { 
                margin-bottom: 30px; 
                white-space: pre-wrap;
              }
              .footer { 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #eee; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Customer Success Platform</h1>
              </div>
              
              <div class="content">
                ${processedContent.replace(/\n/g, '<br>')}
              </div>
              
              <div class="footer">
                <p>This email was sent from your Customer Success Platform</p>
                <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
              </div>
            </div>
          </body>
        </html>
      `
    }

    // Send custom emails using our email service
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, falling back to mock email')
      
      // Log the email send attempt
      await supabase
        .from('email_logs')
        .insert(recipients.map(recipient => ({
          organization_id: profile.organization_id,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject,
          content,
          type,
          engagement_id,
          survey_id,
          account_id,
          sent_by: user.id,
          status: 'mock_sent',
          sent_at: new Date().toISOString()
        })))
      
      return NextResponse.json({
        success: true,
        sent_count: recipients.length,
        mock: true,
        message: 'Email logged (mock mode - configure RESEND_API_KEY for real emails)'
      })
    }

    // Send real emails
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const emailPromises = recipients.map(async (recipient) => {
        const html = emailHtml(recipient)
        
        // Get organization's email settings
        const { getEmailSettings } = await import('@/lib/email')
        const emailSettings = await getEmailSettings(profile.organization_id)
        
        return resend.emails.send({
          from: `${profile.full_name || emailSettings.fromName} <${emailSettings.fromEmail}>`,
          to: recipient.email,
          subject: subject,
          html,
        })
      })

      const results = await Promise.allSettled(emailPromises)
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected')
      
      if (failed.length > 0) {
        console.error('Some emails failed to send:', failed)
      }

      // Log all email attempts
      await supabase
        .from('email_logs')
        .insert(recipients.map((recipient, index) => ({
          organization_id: profile.organization_id,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject,
          content,
          type,
          engagement_id,
          survey_id,
          account_id,
          sent_by: user.id,
          status: results[index].status === 'fulfilled' ? 'sent' : 'failed',
          sent_at: new Date().toISOString(),
          error_message: results[index].status === 'rejected' ? String(results[index].reason) : null
        })))

      return NextResponse.json({
        success: true,
        sent_count: successful,
        failed_count: failed.length,
        mock: false
      })

    } catch (error) {
      console.error('Error sending emails:', error)
      
      // Log failed attempts
      await supabase
        .from('email_logs')
        .insert(recipients.map(recipient => ({
          organization_id: profile.organization_id,
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          subject,
          content,
          type,
          engagement_id,
          survey_id,
          account_id,
          sent_by: user.id,
          status: 'failed',
          sent_at: new Date().toISOString(),
          error_message: String(error)
        })))

      throw error
    }

  } catch (error) {
    console.error('Error in email send endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}