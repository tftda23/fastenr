// lib/surveys.ts
import { supabase } from "@/lib/supabase/client"
import { sendSurveyEmail, EmailRecipient, SurveyEmailData } from "@/lib/email"

export interface CreateSurveyData {
  title: string
  subject: string
  content: string
  logo_url?: string | null
  links?: any[]
  account_id: string
  template_type?: string
  contributes_to_health_score?: boolean
  scheduled_date?: string | null
  is_scheduled?: boolean
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
  const { data: survey, error } = await (supabase as any)
    .from("surveys")
    .insert({
      organization_id: organizationId,
      created_by: userId,
      account_id: data.account_id,
      title: data.title,
      subject: data.subject,
      content: data.content,
      logo_url: data.logo_url,
      links: data.links || [],
      status: data.is_scheduled ? "scheduled" : "draft",
      template_type: data.template_type || "custom",
      contributes_to_health_score: data.contributes_to_health_score || false,
      scheduled_date: data.scheduled_date,
      is_scheduled: data.is_scheduled || false,
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

  const { error: recipientError } = await (supabase as any).from("survey_recipients").insert(recipientData)
  if (recipientError) throw recipientError

  // Prepare email data
  const surveyEmailData: SurveyEmailData = {
    surveyId: surveyId,
    title: (survey as any).title,
    subject: (survey as any).subject,
    content: (survey as any).content,
    logoUrl: (survey as any).logo_url,
    organizationName: (organization as any).name
  }

  // Convert recipients to email format
  const emailRecipients: EmailRecipient[] = recipients.map(recipient => ({
    email: recipient.email,
    name: recipient.name
  }))

  try {
    // Send actual emails using Resend
    const emailResult = await sendSurveyEmail(emailRecipients, surveyEmailData, organizationId)
    
    // Update survey status to active
    const { error: surveyError } = await (supabase as any)
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
    await (supabase as any)
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

export async function processSurveyResponse(
  surveyId: string,
  recipientId: string,
  responseData: any,
  organizationId: string
) {
  // First, save the survey response
  const { data: response, error: responseError } = await (supabase as any)
    .from("survey_responses")
    .insert({
      survey_id: surveyId,
      recipient_id: recipientId,
      response_data: responseData,
    })
    .select()
    .single()

  if (responseError) throw responseError

  // Update recipient status
  await (supabase as any)
    .from("survey_recipients")
    .update({ 
      status: "responded", 
      responded_at: new Date().toISOString() 
    })
    .eq("id", recipientId)

  // Check if this survey contributes to health score
  const { data: survey } = await supabase
    .from("surveys")
    .select("contributes_to_health_score, account_id, template_type")
    .eq("id", surveyId)
    .eq("organization_id", organizationId)
    .single()

  if ((survey as any)?.contributes_to_health_score && (survey as any).account_id) {
    // Calculate health score based on response
    let healthScore = 50 // default neutral score
    
    if ((survey as any).template_type?.includes("nps")) {
      // NPS scoring: 0-6 = detractor (low score), 7-8 = passive (neutral), 9-10 = promoter (high score)
      const npsScore = responseData.nps_score || responseData.rating
      if (npsScore >= 9) healthScore = 85
      else if (npsScore >= 7) healthScore = 65
      else if (npsScore >= 4) healthScore = 40
      else healthScore = 20
    } else if ((survey as any).template_type === "quarterly") {
      // For quarterly surveys, use average of all ratings
      const ratings = Object.values(responseData).filter(val => typeof val === 'number') as number[]
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        healthScore = Math.round((avgRating / 5) * 100) // Convert 5-star to 100-point scale
      }
    }

    // Create health score entry
    const { error: healthError } = await (supabase as any)
      .from("nps_scores")
      .insert({
        organization_id: organizationId,
        account_id: (survey as any).account_id,
        score: healthScore,
        source: "survey",
        metadata: {
          survey_id: surveyId,
          survey_type: (survey as any).template_type,
          response_data: responseData
        }
      })

    if (healthError) {
      console.error("Failed to create health score entry:", healthError)
    }
  }

  return response
}
