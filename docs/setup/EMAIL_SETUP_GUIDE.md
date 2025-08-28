# Email Configuration Guide

This guide will help you configure email functionality in your Customer Success Platform.

## Overview

The platform supports professional email sending for:
- **Survey Distribution**: Send customer surveys via email with branded templates
- **Automation Notifications**: Automated alerts for churn risk, health score drops, renewals
- **Team Notifications**: Keep your team informed about important account changes

## Administrator Setup

### Email Service Configuration
The platform uses a reliable third-party email service to ensure high deliverability rates. Contact your system administrator or hosting provider to configure the email service.

### Environment Configuration
Configure the following environment variables in your deployment:

```bash
# Email Settings (customize these for your organization)
EMAIL_FROM_SURVEYS=surveys@yourdomain.com
EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com
EMAIL_FROM_NAME=Your Company Name
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Application Restart
After configuration changes, restart your application to apply the new settings.

## Testing Your Setup

### Option 1: Admin Panel (Recommended)
1. Go to `/dashboard/admin/email` in your application
2. Click "Test Configuration" to verify setup
3. Enter your email and click "Send Test Email"

### Option 2: API Endpoint
```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testType": "configuration"}'
```

## Email Templates

The platform includes pre-built email templates for:

### Survey Emails
- Professional branded layout
- Customizable content and logos
- Clear call-to-action buttons
- Responsive design

### Automation Emails
- **Churn Risk Alerts**: When accounts show high churn probability
- **Health Score Drops**: When account health decreases significantly
- **Renewal Reminders**: 30-day and 7-day contract renewal alerts
- **Onboarding Welcome**: Welcome new customers

## Customization Options

### Email Addresses
Update these environment variables to customize sender addresses:
- `EMAIL_FROM_SURVEYS`: For survey invitations
- `EMAIL_FROM_NOTIFICATIONS`: For automated alerts
- `EMAIL_FROM_NAME`: Display name for all emails

### Email Templates
Templates are defined in `lib/automation-email.ts` and can be customized:

```typescript
const EMAIL_TEMPLATES = {
  churn_risk_alert: {
    subject: "Your Custom Subject",
    content: "Your custom message...",
    type: 'churn_risk'
  }
  // Add more templates...
}
```

### HTML Email Design
Email HTML templates are in `lib/email.ts`. You can customize:
- Colors and branding
- Layout and styling
- Logo placement
- Footer content

## Production Considerations

### Domain Authentication
- **Required for production**: Add your domain to Resend
- **Improves deliverability**: Emails are less likely to go to spam
- **Professional appearance**: Emails come from your domain

### Email Limits
- **Free tier**: 3,000 emails/month, 100 emails/day
- **Paid plans**: Start at $20/month for 50,000 emails
- **Rate limits**: 10 emails/second (adjustable)

### Monitoring
- **Resend Dashboard**: View delivery stats, bounces, complaints
- **Application Logs**: Check console for email sending status
- **Error Handling**: Failed emails are logged and can be retried

## Troubleshooting

### Common Issues

#### "Email not configured" message
- Check `RESEND_API_KEY` is set correctly
- Restart your application after adding environment variables
- Verify API key is valid in Resend dashboard

#### Emails not being received
- Check spam/junk folders
- Verify domain is properly configured in Resend
- Test with different email providers (Gmail, Outlook, etc.)

#### "Unauthorized" errors
- Verify API key has correct permissions
- Check if domain verification is required

### Debug Mode
Set `NODE_ENV=development` to see detailed email logs:

```bash
NODE_ENV=development npm run dev
```

### Mock Mode
If `RESEND_API_KEY` is not set, the system automatically falls back to mock mode:
- Emails are logged to console instead of being sent
- Useful for development and testing
- No actual emails are delivered

## Advanced Configuration

### Custom SMTP (Alternative to Resend)
If you prefer to use your own SMTP server, you can modify `lib/email.ts` to use Nodemailer:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

### Email Analytics
Resend provides built-in analytics, or you can integrate with:
- SendGrid Analytics
- Mailgun Analytics
- Custom tracking pixels

### Webhook Integration
Set up webhooks in Resend to track:
- Email deliveries
- Opens and clicks
- Bounces and complaints

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **API Key Rotation**: Regularly rotate your Resend API keys
3. **Domain Verification**: Always verify your sending domain
4. **Rate Limiting**: Monitor and respect email sending limits
5. **Unsubscribe Links**: Include unsubscribe options in marketing emails

## Support

### Getting Help
- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: Available in their dashboard
- **Application Logs**: Check browser console and server logs

### Common Resources
- [Resend React Email](https://react.email): For advanced email templates
- [Email Testing Tools](https://mailtrap.io): Test emails without sending
- [Email Deliverability Guide](https://resend.com/docs/knowledge-base/deliverability)

---

## Quick Reference

### Environment Variables
```bash
RESEND_API_KEY=re_your_key_here
EMAIL_FROM_SURVEYS=surveys@yourdomain.com
EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com
EMAIL_FROM_NAME=Your Company
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Test Commands
```bash
# Test configuration
curl -X POST /api/email/test -d '{"testType":"configuration"}'

# Send test email
curl -X POST /api/email/test -d '{"testType":"send","testEmail":"test@example.com"}'
```

### Key Files
- `lib/email.ts` - Core email functionality
- `lib/surveys.ts` - Survey email integration
- `lib/automation-email.ts` - Automation email templates
- `app/api/email/test/route.ts` - Email testing endpoint
- `components/admin/email-settings-client.tsx` - Admin interface
```