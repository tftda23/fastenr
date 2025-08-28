import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"

export interface AIDataContext {
  pageType: 'dashboard' | 'accounts' | 'account-detail' | 'contacts' | 'calendar'
  pageContext?: {
    accountId?: string
    ownerId?: string
    activeTab?: string
    filters?: any
    viewMode?: string
    currentDate?: string
    selectedDate?: string
  }
}

export interface AggregatedData {
  accounts: any[]
  engagements: any[]
  contacts?: any[]
  npsData?: any[]
  healthScores?: any[]
  goals?: any[]
  summary: {
    totalAccounts: number
    atRiskAccounts: number
    avgHealthScore: number
    totalEngagements: number
    recentEngagements: number
    avgNPS: number
  }
}

export async function aggregateDataForAI(context: AIDataContext): Promise<AggregatedData> {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const { pageType, pageContext } = context

  let baseQuery = supabase
    .from("accounts")
    .select(`
      id,
      name,
      industry,
      size,
      arr,
      status,
      health_score,
      churn_risk_score,
      owner_id,
      created_at,
      updated_at
    `)
    .eq("organization_id", organization.id)

  // Apply filtering based on page context
  if (pageContext?.ownerId) {
    baseQuery = baseQuery.eq("owner_id", pageContext.ownerId)
  }

  if (pageContext?.accountId && pageType === 'account-detail') {
    baseQuery = baseQuery.eq("id", pageContext.accountId)
  }

  const { data: accounts, error: accountsError } = await baseQuery
  if (accountsError) throw accountsError

  // Get engagements for these accounts
  const accountIds = accounts?.map(a => a.id) || []
  let engagementTimeRange = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  
  // For calendar view, get a wider range of engagements
  if (pageType === 'calendar') {
    engagementTimeRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year back
  }
  
  let engagementQuery = supabase
    .from("engagements")
    .select(`
      id,
      account_id,
      type,
      description,
      outcome,
      scheduled_at,
      completed_at,
      created_at
    `)
    .in("account_id", accountIds.length > 0 ? accountIds : [''])
    .order("scheduled_at", { ascending: false })
    .limit(500) // Limit to prevent too much data

  // Use scheduled_at for calendar view, completed_at for others
  if (pageType === 'calendar') {
    engagementQuery = engagementQuery.gte("scheduled_at", engagementTimeRange)
  } else {
    engagementQuery = engagementQuery.gte("completed_at", engagementTimeRange)
  }

  const { data: engagements } = await engagementQuery

  // Get NPS data for context (last 6 months)
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  const { data: npsData } = await supabase
    .from("nps_surveys")
    .select(`
      id,
      account_id,
      score,
      feedback,
      survey_date
    `)
    .in("account_id", accountIds.length > 0 ? accountIds : [''])
    .gte("survey_date", sixMonthsAgo)
    .order("survey_date", { ascending: false })

  // Get goals for accounts
  const { data: goals } = await supabase
    .from("customer_goals")
    .select(`
      id,
      account_id,
      title,
      description,
      status,
      target_date,
      progress
    `)
    .in("account_id", accountIds.length > 0 ? accountIds : [''])

  let contactsData: any[] = []
  if (pageType === 'contacts' || pageType === 'account-detail') {
    const contactsQuery = supabase
      .from("contacts")
      .select(`
        id,
        account_id,
        seniority_level,
        decision_maker_level,
        department,
        contact_status,
        relationship_strength,
        created_at
      `)
      .eq("organization_id", organization.id)

    if (pageContext?.accountId && pageType === 'account-detail') {
      contactsQuery.eq("account_id", pageContext.accountId)
    } else if (accountIds.length > 0) {
      contactsQuery.in("account_id", accountIds)
    }

    const { data: contacts } = await contactsQuery
    contactsData = contacts || []
  }

  // Calculate summary metrics
  const totalAccounts = accounts?.length || 0
  const atRiskAccounts = accounts?.filter(a => a.status === 'at_risk' || a.churn_risk_score >= 70).length || 0
  const avgHealthScore = totalAccounts > 0 ? 
    Math.round((accounts?.reduce((sum, a) => sum + (a.health_score || 0), 0) || 0) / totalAccounts) : 0
  
  const totalEngagements = engagements?.length || 0
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const recentEngagements = engagements?.filter(e => e.completed_at >= thirtyDaysAgo).length || 0
  
  const avgNPS = npsData && npsData.length > 0 ? 
    Math.round((npsData.reduce((sum, n) => sum + n.score, 0) / npsData.length) * 10) / 10 : 0

  return {
    accounts: accounts || [],
    engagements: engagements || [],
    contacts: contactsData,
    npsData: npsData || [],
    goals: goals || [],
    summary: {
      totalAccounts,
      atRiskAccounts,
      avgHealthScore,
      totalEngagements,
      recentEngagements,
      avgNPS
    }
  }
}

export function sanitizeDataForAI(data: AggregatedData): any {
  // Remove PII and sensitive information before sending to AI
  const sanitizedAccounts = data.accounts.map(account => ({
    id: account.id,
    industry: account.industry,
    size: account.size,
    arr: account.arr,
    status: account.status,
    health_score: account.health_score,
    churn_risk_score: account.churn_risk_score,
    has_owner: !!account.owner_id,
    account_age_months: account.created_at ? 
      Math.floor((Date.now() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
  }))

  const sanitizedEngagements = data.engagements.map(eng => ({
    account_id: eng.account_id,
    type: eng.type,
    outcome: eng.outcome,
    completed_at: eng.completed_at,
    days_ago: Math.floor((Date.now() - new Date(eng.completed_at).getTime()) / (1000 * 60 * 60 * 24))
  }))

  const sanitizedContacts = data.contacts?.map(contact => ({
    account_id: contact.account_id,
    seniority_level: contact.seniority_level,
    decision_maker_level: contact.decision_maker_level,
    department: contact.department,
    contact_status: contact.contact_status,
    relationship_strength: contact.relationship_strength
  })) || []

  const sanitizedNPS = data.npsData?.map(nps => ({
    account_id: nps.account_id,
    score: nps.score,
    survey_date: nps.survey_date,
    days_ago: Math.floor((Date.now() - new Date(nps.survey_date).getTime()) / (1000 * 60 * 60 * 24))
  })) || []

  const sanitizedGoals = data.goals?.map(goal => ({
    account_id: goal.account_id,
    status: goal.status,
    progress: goal.progress,
    target_date: goal.target_date,
    overdue: goal.target_date ? new Date(goal.target_date) < new Date() : false
  })) || []

  return {
    accounts: sanitizedAccounts,
    engagements: sanitizedEngagements,
    contacts: sanitizedContacts,
    npsData: sanitizedNPS,
    goals: sanitizedGoals,
    summary: data.summary,
    metadata: {
      data_as_of: new Date().toISOString(),
      analysis_scope: sanitizedAccounts.length > 0 ? 'filtered_accounts' : 'all_accounts'
    }
  }
}