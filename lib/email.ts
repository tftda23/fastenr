import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SurveyEmailData {
  surveyId: string;
  title: string;
  subject: string;
  content: string;
  logoUrl?: string;
  organizationName?: string;
}

export interface NotificationEmailData {
  type: 'churn_risk' | 'health_score_drop' | 'renewal_reminder' | 'onboarding' | 'invitation';
  accountName: string;
  message: string;
  actionUrl?: string;
}

export interface InvitationEmailData {
  organizationName: string;
  inviterName?: string;
  role: string;
  inviteUrl: string;
}

// Survey email template
function createSurveyEmailHtml(data: SurveyEmailData, recipientName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
          .content { margin-bottom: 30px; }
          .survey-link { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${data.logoUrl ? `<img src="${data.logoUrl}" alt="Logo" class="logo">` : ''}
            <h1>${data.title}</h1>
          </div>
          
          <div class="content">
            ${recipientName ? `<p>Hi ${recipientName},</p>` : '<p>Hello,</p>'}
            
            <div>${data.content}</div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL || 'http://localhost:3000'}/surveys/${data.surveyId}" class="survey-link">
                Take Survey
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent by ${data.organizationName || 'Customer Success Platform'}</p>
            <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Invitation email template
function createInvitationEmailHtml(data: InvitationEmailData, recipientName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Join ${data.organizationName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
          .content { margin-bottom: 30px; }
          .invite-button { display: inline-block; background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; font-size: 16px; }
          .role-badge { background-color: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 500; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <h2>Join ${data.organizationName}</h2>
          </div>
          
          <div class="content">
            ${recipientName ? `<p>Hi ${recipientName},</p>` : '<p>Hello,</p>'}
            
            <p>You've been invited to join <strong>${data.organizationName}</strong> on our Customer Success Platform.</p>
            
            <p>Your role will be: <span class="role-badge">${data.role.charAt(0).toUpperCase() + data.role.slice(1)}</span></p>
            
            ${data.inviterName ? `<p>This invitation was sent by ${data.inviterName}.</p>` : ''}
            
            <p>Click the button below to accept your invitation and set up your account:</p>
            
            <p style="text-align: center;">
              <a href="${data.inviteUrl}" class="invite-button">
                Accept Invitation
              </a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${data.inviteUrl}" style="color: #007bff; word-break: break-all;">${data.inviteUrl}</a>
            </p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by ${data.organizationName}</p>
            <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Notification email template
function createNotificationEmailHtml(data: NotificationEmailData, recipientName?: string): string {
  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'churn_risk': return '⚠️ Account at Risk';
      case 'health_score_drop': return '📉 Health Score Alert';
      case 'renewal_reminder': return '🔔 Renewal Reminder';
      case 'onboarding': return '🎉 Welcome to Your Journey';
      case 'invitation': return '🎉 You\'re Invited!';
      default: return '📧 Notification';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${getNotificationTitle(data.type)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .content { margin-bottom: 30px; }
          .action-button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${getNotificationTitle(data.type)}</h1>
          </div>
          
          <div class="content">
            ${recipientName ? `<p>Hi ${recipientName},</p>` : '<p>Hello,</p>'}
            
            <p><strong>Account:</strong> ${data.accountName}</p>
            
            <p>${data.message}</p>
            
            ${data.actionUrl ? `
              <p style="text-align: center;">
                <a href="${data.actionUrl}" class="action-button">
                  Take Action
                </a>
              </p>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>This is an automated notification from your Customer Success Platform</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Send survey email
export async function sendSurveyEmail(
  recipients: EmailRecipient[],
  surveyData: SurveyEmailData,
  fromEmail: string = 'surveys@yourdomain.com',
  fromName: string = 'Customer Success Team'
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, falling back to mock email');
    // Mock email sent for survey
    return { success: true, sent_count: recipients.length, mock: true };
  }

  try {
    const emailPromises = recipients.map(async (recipient) => {
      const html = createSurveyEmailHtml(surveyData, recipient.name);
      
      return getResendClient().emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient.email,
        subject: surveyData.subject,
        html,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected');
    
    if (failed.length > 0) {
      console.error('Some emails failed to send:', failed);
    }

    return {
      success: true,
      sent_count: successful,
      failed_count: failed.length,
      mock: false
    };
  } catch (error) {
    console.error('Error sending survey emails:', error);
    throw new Error('Failed to send survey emails');
  }
}

// Send notification email
export async function sendNotificationEmail(
  recipients: EmailRecipient[],
  notificationData: NotificationEmailData,
  fromEmail: string = 'notifications@yourdomain.com',
  fromName: string = 'Customer Success Platform'
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, falling back to mock email');
    // Mock notification email sent
    return { success: true, sent_count: recipients.length, mock: true };
  }

  try {
    const emailPromises = recipients.map(async (recipient) => {
      const html = createNotificationEmailHtml(notificationData, recipient.name);
      
      return getResendClient().emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: recipient.email,
        subject: `${notificationData.accountName} - ${notificationData.type.replace('_', ' ').toUpperCase()}`,
        html,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected');
    
    if (failed.length > 0) {
      console.error('Some notification emails failed to send:', failed);
    }

    return {
      success: true,
      sent_count: successful,
      failed_count: failed.length,
      mock: false
    };
  } catch (error) {
    console.error('Error sending notification emails:', error);
    throw new Error('Failed to send notification emails');
  }
}

// Send invitation email
export async function sendInvitationEmail(
  recipient: EmailRecipient,
  invitationData: InvitationEmailData,
  fromEmail: string = 'invitations@yourdomain.com',
  fromName: string = 'Customer Success Platform'
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, falling back to mock email');
    // Mock invitation email sent
    return { success: true, sent_count: 1, mock: true };
  }

  try {
    const html = createInvitationEmailHtml(invitationData, recipient.name);
    
    const result = await getResendClient().emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: recipient.email,
      subject: `You're invited to join ${invitationData.organizationName}`,
      html,
    });

    return {
      success: true,
      sent_count: 1,
      failed_count: 0,
      mock: false,
      messageId: result.data?.id
    };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    return false;
  }

  try {
    // Test with a simple email to verify configuration
    await getResendClient().emails.send({
      from: process.env.EMAIL_FROM_NOTIFICATIONS || 'notifications@fastenr.com',
      to: 'test@fastenr.com',
      subject: 'Test Email Configuration',
      html: '<p>This is a test email to verify Resend configuration.</p>',
    });
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}