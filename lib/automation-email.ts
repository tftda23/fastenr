import { sendNotificationEmail, EmailRecipient, NotificationEmailData } from "@/lib/email"
import { supabase } from "@/lib/supabase/client"

export interface AutomationEmailContext {
  accountId: string
  accountName: string
  organizationId: string
  triggerType: string
  triggerData?: any
}

export interface EmailTemplate {
  subject: string
  content: string
  type: 'churn_risk' | 'health_score_drop' | 'renewal_reminder' | 'onboarding'
}

// Predefined email templates for common automation scenarios
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  churn_risk_alert: {
    subject: "Action Required: Account at Risk",
    content: "This account has been flagged as having high churn risk. Please review and take appropriate action to retain this customer.",
    type: 'churn_risk'
  },
  health_score_drop: {
    subject: "Health Score Alert",
    content: "The health score for this account has dropped significantly. Consider reaching out to understand any issues they may be experiencing.",
    type: 'health_score_drop'
  },
  renewal_reminder: {
    subject: "Renewal Approaching",
    content: "This account's contract is approaching renewal. Please ensure all renewal activities are on track.",
    type: 'renewal_reminder'
  },
  onboarding_welcome: {
    subject: "Welcome to Your Customer Success Journey",
    content: "Welcome! We're excited to help you succeed. Your Customer Success Manager will be in touch soon to ensure you get the most out of our platform.",
    type: 'onboarding'
  },
  contract_ends_in_30: {
    subject: "Contract Renewal - 30 Days",
    content: "This account's contract expires in 30 days. Please initiate renewal discussions and ensure all stakeholders are aligned.",
    type: 'renewal_reminder'
  },
  contract_ends_in_7: {
    subject: "Urgent: Contract Renewal - 7 Days",
    content: "This account's contract expires in 7 days. Immediate action required to secure renewal.",
    type: 'renewal_reminder'
  }
}

// Get team members who should receive automation emails
async function getAutomationRecipients(organizationId: string, accountId?: string): Promise<EmailRecipient[]> {
  try {
    // Get all users in the organization who have email notifications enabled
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select(`
        email,
        full_name,
        user_preferences (email_notifications)
      `)
      .eq("organization_id", organizationId)
      .in("role", ["admin", "read_write", "read_write_delete"])

    if (error) {
      console.error("Error fetching automation recipients:", error)
      return []
    }

    // Filter users who have email notifications enabled
    const recipients: EmailRecipient[] = users
      .filter(user => {
        const preferences = (user as any).user_preferences as any
        return !preferences || preferences.email_notifications !== false
      })
      .map(user => ({
        email: (user as any).email,
        name: (user as any).full_name || undefined
      }))

    return recipients
  } catch (error) {
    console.error("Error getting automation recipients:", error)
    return []
  }
}

// Send automation email based on trigger
export async function sendAutomationEmail(
  context: AutomationEmailContext,
  templateKey: string,
  customTemplate?: Partial<EmailTemplate>
): Promise<{ success: boolean; sent_count: number; error?: string }> {
  try {
    // Get the email template
    const template = customTemplate 
      ? { ...EMAIL_TEMPLATES[templateKey], ...customTemplate }
      : EMAIL_TEMPLATES[templateKey]

    if (!template) {
      throw new Error(`Email template '${templateKey}' not found`)
    }

    // Get recipients
    const recipients = await getAutomationRecipients(context.organizationId, context.accountId)
    
    if (recipients.length === 0) {
      console.warn("No recipients found for automation email")
      return { success: true, sent_count: 0 }
    }

    // Prepare notification data
    const notificationData: NotificationEmailData = {
      type: template.type,
      accountName: context.accountName,
      message: template.content,
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts/${context.accountId}`
    }

    // Send the email
    const result = await sendNotificationEmail(
      recipients,
      notificationData,
      process.env.EMAIL_FROM_NOTIFICATIONS || 'notifications@yourdomain.com',
      process.env.EMAIL_FROM_NAME || 'Customer Success Platform'
    )

    // Log the automation email activity
    await logAutomationEmail(context, templateKey, recipients.length, result.sent_count)

    return {
      success: true,
      sent_count: result.sent_count
    }
  } catch (error) {
    console.error("Error sending automation email:", error)
    return {
      success: false,
      sent_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Log automation email activity for tracking
async function logAutomationEmail(
  context: AutomationEmailContext,
  templateKey: string,
  recipientCount: number,
  sentCount: number
) {
  try {
    // This could be expanded to log to a dedicated automation_logs table
    // Automation email sent successfully
  } catch (error) {
    console.error("Error logging automation email:", error)
  }
}

// Trigger automation emails based on common scenarios
export async function triggerChurnRiskEmail(accountId: string, accountName: string, organizationId: string) {
  return sendAutomationEmail(
    {
      accountId,
      accountName,
      organizationId,
      triggerType: 'churn_risk'
    },
    'churn_risk_alert'
  )
}

export async function triggerHealthScoreDropEmail(accountId: string, accountName: string, organizationId: string) {
  return sendAutomationEmail(
    {
      accountId,
      accountName,
      organizationId,
      triggerType: 'health_score_drop'
    },
    'health_score_drop'
  )
}

export async function triggerRenewalReminderEmail(accountId: string, accountName: string, organizationId: string, daysUntilRenewal: number) {
  const templateKey = daysUntilRenewal <= 7 ? 'contract_ends_in_7' : 'contract_ends_in_30'
  
  return sendAutomationEmail(
    {
      accountId,
      accountName,
      organizationId,
      triggerType: 'renewal_reminder',
      triggerData: { daysUntilRenewal }
    },
    templateKey
  )
}

export async function triggerOnboardingEmail(accountId: string, accountName: string, organizationId: string) {
  return sendAutomationEmail(
    {
      accountId,
      accountName,
      organizationId,
      triggerType: 'onboarding'
    },
    'onboarding_welcome'
  )
}

// Get available email templates
export function getAvailableEmailTemplates(): Record<string, EmailTemplate> {
  return EMAIL_TEMPLATES
}