import { createClient } from "@/lib/supabase/server"

export interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: SlackAttachment[]
}

export interface SlackAttachment {
  color?: string
  title?: string
  title_link?: string
  text?: string
  fields?: SlackField[]
  footer?: string
  ts?: number
}

export interface SlackField {
  title: string
  value: string
  short?: boolean
}

export interface SlackNotificationConfig {
  organizationId: string
  notificationType: string
  message: SlackMessage
}

/**
 * Get Slack settings for an organization
 */
export async function getSlackSettings(organizationId: string) {
  const supabase = createClient()
  
  const { data: settings, error } = await supabase
    .from("app_settings")
    .select("slack_webhook_url, slack_default_channel, slack_notification_types, slack_integration_enabled")
    .eq("organization_id", organizationId)
    .single()

  if (error) {
    console.error("Error fetching Slack settings:", error)
    return null
  }

  return settings
}

/**
 * Send a message to Slack
 */
export async function sendSlackMessage(webhookUrl: string, message: SlackMessage): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error("Failed to send Slack message:", response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error("Error sending Slack message:", error)
    return false
  }
}

/**
 * Send a notification to Slack if enabled and configured
 */
export async function sendSlackNotification(config: SlackNotificationConfig): Promise<boolean> {
  const settings = await getSlackSettings(config.organizationId)
  
  if (!settings || !settings.slack_integration_enabled || !settings.slack_webhook_url) {
    return false
  }

  // Check if this notification type is enabled
  const enabledTypes = settings.slack_notification_types || []
  if (!enabledTypes.includes(config.notificationType)) {
    return false
  }

  // Use default channel if none specified
  const message = {
    ...config.message,
    channel: config.message.channel || settings.slack_default_channel,
  }

  return await sendSlackMessage(settings.slack_webhook_url, message)
}

/**
 * Create a formatted Slack message for health score changes
 */
export function createHealthScoreChangeMessage(
  accountName: string,
  oldScore: number,
  newScore: number,
  accountUrl?: string
): SlackMessage {
  const scoreChange = newScore - oldScore
  const emoji = scoreChange > 0 ? "📈" : "📉"
  const color = newScore >= 80 ? "good" : newScore >= 60 ? "warning" : "danger"
  
  return {
    text: `${emoji} Health Score Update`,
    attachments: [
      {
        color,
        title: accountName,
        title_link: accountUrl,
        fields: [
          {
            title: "Previous Score",
            value: `${oldScore}%`,
            short: true,
          },
          {
            title: "New Score",
            value: `${newScore}%`,
            short: true,
          },
          {
            title: "Change",
            value: `${scoreChange > 0 ? "+" : ""}${scoreChange}%`,
            short: true,
          },
        ],
        footer: "Customer Success Platform",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

/**
 * Create a formatted Slack message for churn risk alerts
 */
export function createChurnRiskAlertMessage(
  accountName: string,
  riskLevel: "high" | "medium" | "low",
  reasons: string[],
  accountUrl?: string
): SlackMessage {
  const emoji = riskLevel === "high" ? "🚨" : "⚠️"
  const color = riskLevel === "high" ? "danger" : "warning"
  
  return {
    text: `${emoji} Churn Risk Alert`,
    attachments: [
      {
        color,
        title: `${accountName} - ${riskLevel.toUpperCase()} Risk`,
        title_link: accountUrl,
        text: `Risk factors: ${reasons.join(", ")}`,
        footer: "Customer Success Platform",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

/**
 * Create a formatted Slack message for new engagements
 */
export function createEngagementUpdateMessage(
  accountName: string,
  engagementType: string,
  description: string,
  accountUrl?: string
): SlackMessage {
  return {
    text: "📝 New Customer Engagement",
    attachments: [
      {
        color: "good",
        title: accountName,
        title_link: accountUrl,
        fields: [
          {
            title: "Engagement Type",
            value: engagementType,
            short: true,
          },
          {
            title: "Description",
            value: description,
            short: false,
          },
        ],
        footer: "Customer Success Platform",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

/**
 * Create a formatted Slack message for goal achievements
 */
export function createGoalAchievementMessage(
  accountName: string,
  goalName: string,
  achievementDate: Date,
  accountUrl?: string
): SlackMessage {
  return {
    text: "🎉 Goal Achievement",
    attachments: [
      {
        color: "good",
        title: `${accountName} achieved: ${goalName}`,
        title_link: accountUrl,
        fields: [
          {
            title: "Achievement Date",
            value: achievementDate.toLocaleDateString(),
            short: true,
          },
        ],
        footer: "Customer Success Platform",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}

/**
 * Create a formatted Slack message for survey responses
 */
export function createSurveyResponseMessage(
  accountName: string,
  surveyType: string,
  score: number,
  feedback?: string,
  accountUrl?: string
): SlackMessage {
  const emoji = score >= 9 ? "😊" : score >= 7 ? "😐" : "😞"
  const color = score >= 9 ? "good" : score >= 7 ? "warning" : "danger"
  
  return {
    text: `${emoji} New Survey Response`,
    attachments: [
      {
        color,
        title: accountName,
        title_link: accountUrl,
        fields: [
          {
            title: "Survey Type",
            value: surveyType,
            short: true,
          },
          {
            title: "Score",
            value: `${score}/10`,
            short: true,
          },
          ...(feedback ? [
            {
              title: "Feedback",
              value: feedback,
              short: false,
            },
          ] : []),
        ],
        footer: "Customer Success Platform",
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  }
}