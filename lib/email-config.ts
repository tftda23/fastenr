// Email configuration utilities
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export function getEmailConfig() {
  return {
    configured: isEmailConfigured(),
    apiKey: process.env.RESEND_API_KEY ? '***configured***' : 'not set',
    fromSurveys: process.env.EMAIL_FROM_SURVEYS || 'surveys@yourdomain.com',
    fromNotifications: process.env.EMAIL_FROM_NOTIFICATIONS || 'notifications@yourdomain.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Customer Success Team',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is not set')
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is not set (surveys links will use localhost)')
  }
  
  const fromSurveys = process.env.EMAIL_FROM_SURVEYS
  const fromNotifications = process.env.EMAIL_FROM_NOTIFICATIONS
  
  if (fromSurveys && !fromSurveys.includes('@')) {
    errors.push('EMAIL_FROM_SURVEYS must be a valid email address')
  }
  
  if (fromNotifications && !fromNotifications.includes('@')) {
    errors.push('EMAIL_FROM_NOTIFICATIONS must be a valid email address')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}