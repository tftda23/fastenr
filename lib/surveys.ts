// lib/surveys.ts
import { supabase } from "@/lib/supabase/client"
import { sendSurveyEmail, EmailRecipient, SurveyEmailData } from "@/lib/email"

export interface CreateSurveyData {
  title: string
  subject: string
  content: string
  logo_url?: string | null
  links?: any[]
  account_id: string            // <-- NEW
}

export interface Recipient {
  id: string
  email: string
  name?: string
}

export async function createSurvey(
  data: CreateSurveyData,
  userId: string,
  organizationId: string
) {
  const { data: survey, error } = await supabase
    .from("surveys")
    .insert({
      organization_id: organizationId,
      created_by: userId,
      account_id: data.account_id,         // <-- NEW
      title: data.title,
      subject: data.subject,
      content: data.content,
      logo_url: data.logo_url,
      links: data.links || [],
      status: "draft",
    })
    .select()
    .single()

  if (error) throw error
  return survey
}

export async function sendSurvey(surveyId: string, recipients: Recipient[], organizationId: string) {
  // First, get the survey details for email content
  const { data: survey, error: surveyFetchError } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", surveyId)
    .eq("organization_id", organizationId)
    .single()

  if (surveyFetchError) throw surveyFetchError

  // Get organization details for branding
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .single()

  if (orgError) throw orgError

  const recipientData = recipients.map((recipient) => ({
    survey_id: surveyId,
    email: recipient.email,
    name: recipient.name || null,
    status: "sent",
    sent_at: new Date().toISOString(),
  }))

  const { error: recipientError } = await supabase.from("survey_recipients").insert(recipientData)
  if (recipientError) throw recipientError

  // Prepare email data
  const surveyEmailData: SurveyEmailData = {
    surveyId: surveyId,
    title: survey.title,
    subject: survey.subject,
    content: survey.content,
    logoUrl: survey.logo_url,
    organizationName: organization.name
  }

  // Convert recipients to email format
  const emailRecipients: EmailRecipient[] = recipients.map(recipient => ({
    email: recipient.email,
    name: recipient.name
  }))

  try {
    // Send actual emails using Resend
    const emailResult = await sendSurveyEmail(emailRecipients, surveyEmailData)
    
    // Update survey status to active
    const { error: surveyError } = await supabase
      .from("surveys")
      .update({ status: "active" })
      .eq("id", surveyId)
      .eq("organization_id", organizationId)

    if (surveyError) throw surveyError

    return {
      success: true,
      sent_count: emailResult.sent_count,
      failed_count: emailResult.failed_count || 0,
      mock: emailResult.mock || false
    }
  } catch (emailError) {
    console.error("Error sending survey emails:", emailError)
    
    // Update recipient status to failed for those that didn't send
    await supabase
      .from("survey_recipients")
      .update({ status: "failed" })
      .eq("survey_id", surveyId)

    throw new Error("Failed to send survey emails")
  }
}

export async function getSurveyRecipients(surveyId: string, organizationId: string) {
  const { data, error } = await supabase
    .from("survey_recipients")
    .select("*")
    .eq("survey_id", surveyId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
