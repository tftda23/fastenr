import { createClient } from "@/lib/supabase/server"
import type { Account, Engagement, NPSSurvey, CustomerGoal, User } from "@/lib/types"
import type { AutomationWorkflow } from '@/lib/types';
import type { CurrencyConfig } from '@/lib/currency';

// Get current user's organization ID
export async function getCurrentUserOrganization() {
  const supabase = createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr) {
    console.error("auth.getUser error:", authErr)
  }
  if (!user) return { user: null, organization: null }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("organization_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !profile) return { user: null, organization: null }

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  if (orgError || !organization) return { user: null, organization: null }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: profile.role,
      full_name: profile.full_name,
    },
    organization,
  }
}

// Get organization's currency configuration
export async function getOrganizationCurrencyConfig(organizationId?: string): Promise<CurrencyConfig> {
  const supabase = createClient()
  
  let orgId = organizationId
  if (!orgId) {
    const { organization } = await getCurrentUserOrganization()
    if (!organization) {
      // Return default GBP config if no organization found
      return {
        currency_code: 'GBP',
        currency_symbol: '£',
        currency_name: 'British Pound',
        decimal_places: 2,
        symbol_position: 'before',
        thousands_separator: ',',
        decimal_separator: '.'
      }
    }
    orgId = organization.id
  }

  const { data, error } = await supabase
    .rpc('get_org_currency_config', { org_id: orgId })
    .single()

  if (error || !data) {
    // Return default GBP config on error
    return {
      currency_code: 'GBP',
      currency_symbol: '£',
      currency_name: 'British Pound',
      decimal_places: 2,
      symbol_position: 'before',
      thousands_separator: ',',
      decimal_separator: '.'
    }
  }

  return {
    currency_code: data.currency_code,
    currency_symbol: data.currency_symbol,
    currency_name: data.currency_name,
    decimal_places: data.decimal_places,
    symbol_position: data.symbol_position as 'before' | 'after',
    thousands_separator: data.thousands_separator,
    decimal_separator: data.decimal_separator
  }
}

// Check user permissions
export async function checkUserPermission(requiredRole: "read" | "read_write" | "read_write_delete" | "admin") {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) return false

  const roleHierarchy: Record<string, number> = {
    read: 1,
    read_write: 2,
    read_write_delete: 3,
    admin: 4,
  }

  return (roleHierarchy[user.role] ?? 0) >= roleHierarchy[requiredRole]
}

// Account queries
export async function getAccounts(page = 1, limit = 20, search?: string, ownerId?: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from("accounts")
    .select("*", { count: "exact" })
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`)
  }

  if (ownerId) {
    query = query.eq("owner_id", ownerId)
  }

  const { data, error, count } = await query

  if (error) throw error

  // Get owner information for accounts that have owner_id
  const accountsWithOwnerIds = (data || []).filter(account => account.owner_id)
  const ownerIds = accountsWithOwnerIds.map(account => account.owner_id)
  
  let owners: User[] = []
  if (ownerIds.length > 0) {
    const { data: ownersData, error: ownersError } = await supabase
      .from("user_profiles")
      .select("id, full_name, email")
      .in("id", ownerIds)
    
    if (!ownersError) {
      owners = ownersData || []
    }
  }

  // Add owner information to accounts
  const accountsWithOwner = (data || []).map(account => {
    const owner = owners.find(o => o.id === account.owner_id) || null
    return {
      ...account,
      owner,
      owner_name: owner?.full_name || null
    }
  })

  return {
    data: accountsWithOwner as Account[],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function getAccountById(id: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organization.id)
    .maybeSingle()

  if (error) throw error
  
  if (!data) return null
  
  // Get owner information if account has owner_id
  let owner: User | null = null
  if (data.owner_id) {
    const { data: ownerData, error: ownerError } = await supabase
      .from("user_profiles")
      .select("id, full_name, email")
      .eq("id", data.owner_id)
      .maybeSingle()
    
    if (!ownerError && ownerData) {
      owner = ownerData
    }
  }
  
  // Add owner information to account
  const accountWithOwner = {
    ...data,
    owner,
    owner_name: owner?.full_name || null
  }
  
  return accountWithOwner as Account | null
}

export async function createAccount(account: Omit<Account, "id" | "created_at" | "updated_at" | "organization_id">) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      ...account,
      organization_id: organization.id,
    })
    .select()
    .single()

  if (error) throw error
  return data as Account
}

export async function updateAccount(id: string, updates: Partial<Account>) {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  const { data, error } = await supabase.from("accounts").update(updates).eq("id", id).select().single()

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw new Error(`Database error: ${error.message} (${error.code})`)
  }
  return data as Account
}

export async function deleteAccount(id: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const { error } = await supabase.from("accounts").delete().eq("id", id)

  if (error) throw error
}

// Engagement queries
export async function getEngagements(
  accountId?: string,
  page = 1,
  limit = 20,
  search?: string,
  type?: string,
  outcome?: string,
  accountFilter?: string,
  startDate?: string,
  endDate?: string,
) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const offset = (page - 1) * limit

  // Keep it resilient: base row with *, then join the account fields we need
  let query = supabase
    .from("engagements")
    .select(
      `
      *,
      accounts:accounts (
        id,
        name,
        churn_risk_score,
        arr
      )
    `,
      { count: "exact" },
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (accountId) query = query.eq("account_id", accountId)
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  if (type && type !== "all") query = query.eq("type", type)
  if (outcome && outcome !== "all") query = query.eq("outcome", outcome)
  if (accountFilter && accountFilter !== "all") query = query.eq("account_id", accountFilter)
  
  // Date range filtering for calendar view
  if (startDate) query = query.gte("scheduled_at", startDate)
  if (endDate) query = query.lte("scheduled_at", endDate)

  const { data, error, count } = await query

  if (error) {
    console.error("getEngagements supabase error:", error)
    throw error
  }

  // normalise numerics so the UI filters work
  const engagements = (data ?? []).map((e: any) => {
    const acc = e.accounts ?? null
    return {
      ...e,
      accounts: acc
        ? {
            ...acc,
            churn_risk_score:
              acc.churn_risk_score === null || acc.churn_risk_score === undefined
                ? null
                : Number(acc.churn_risk_score),
            arr:
              acc.arr === null || acc.arr === undefined
                ? null
                : Number(acc.arr),
          }
        : null,
    }
  })

  return {
    data: engagements as (Engagement & {
      accounts: { id: string; name: string; churn_risk_score: number | null; arr: number | null } | null
    })[],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > offset + limit,
  }
}

export async function createEngagement(
  engagement: Omit<Engagement, "id" | "created_at" | "updated_at" | "organization_id" | "created_by"> & {
    participants?: string[] // Contact IDs
  },
) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  // Extract participants from engagement data
  const { participants, ...engagementData } = engagement
  
  const { data, error } = await supabase
    .from("engagements")
    .insert({
      ...engagementData,
      organization_id: organization.id,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error
  
  // If participants were provided, create participant records
  if (participants && participants.length > 0) {
    const participantRecords = participants.map(contactId => ({
      engagement_id: data.id,
      contact_id: contactId,
      participation_type: 'attendee' as const,
      response_status: 'no_response' as const,
      added_at: new Date().toISOString()
    }))
    
    const { error: participantsError } = await supabase
      .from("engagement_participants")
      .insert(participantRecords)
    
    if (participantsError) {
      console.error("Failed to create participants:", participantsError)
      // Don't throw error here as the engagement was already created successfully
    }
  }
  
  return data as Engagement
}

// NPS queries
export async function getNPSSurveys(accountId?: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()

  let query = supabase
    .from("nps_surveys")
    .select(`
      *,
      accounts(name)
    `)
    .eq("organization_id", organization.id)
    .order("survey_date", { ascending: false })

  if (accountId) {
    query = query.eq("account_id", accountId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as (NPSSurvey & { accounts: { name: string } })[]
}

export async function createNPSSurvey(surveyData: Partial<NPSSurvey>) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("nps_surveys")
    .insert({
      ...surveyData,
      organization_id: organization.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Goals queries
export async function getCustomerGoals(accountId?: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()

  try {
    let query = supabase
      .from("customer_goals")
      .select(
        `
        id, title, description, status, goal_type, target_date,
        current_value, target_value, unit, metric_type, account_id, organization_id, created_at, updated_at,
        accounts:accounts ( id, name )
      `,
        { count: "exact" },
      )
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })

    if (accountId) {
      query = query.eq("account_id", accountId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("getCustomerGoals error:", error)
      throw error
    }

    // Optional: log to help distinguish empty vs blocked
    // Customer goals count retrieved

    return data as any
  } catch (e) {
    console.error("getCustomerGoals fatal error:", e)
    throw e
  }
}

export async function createCustomerGoal(
  goal: Omit<CustomerGoal, "id" | "created_at" | "updated_at" | "organization_id">,
) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  const { data, error } = await supabase
    .from("customer_goals")
    .insert({
      ...goal,
      organization_id: organization.id,
      created_by: user.id,
    })
    .select(
      `
      id, title, description, status, goal_type, target_date,
      current_value, target_value, unit, metric_type, account_id, organization_id, created_at, updated_at,
      accounts:accounts ( id, name )
    `,
    )
    .single()

  if (error) throw error
  return data as any
}

export async function getMetricBasedGoalSuggestions(accountId: string) {
  const supabase = createClient()

  // Get current account metrics
  const { data: account } = await supabase
    .from("accounts")
    .select("arr, health_score, churn_risk_score")
    .eq("id", accountId)
    .single()

  // Get latest NPS score
  const { data: latestNPS } = await supabase
    .from("nps_surveys")
    .select("score")
    .eq("account_id", accountId)
    .order("survey_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get adoption metrics
  const { data: adoptionMetrics } = await supabase
    .from("adoption_metrics")
    .select("metric_value")
    .eq("account_id", accountId)
    .eq("metric_type", "feature_adoption")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    currentARR: account?.arr || 0,
    currentHealthScore: account?.health_score || 0,
    currentNPS: latestNPS?.score || 0,
    currentAdoption: adoptionMetrics?.metric_value || 0,
    churnRisk: account?.churn_risk_score || 0,
  }
}

export async function updateGoalProgress(goalId: string) {
  const supabase = createClient()

  // Get the goal details
  const { data: goal } = await supabase.from("customer_goals").select("*").eq("id", goalId).single()

  if (!goal || !goal.metric_type) return

  let currentValue = 0

  // Calculate current value based on metric type
  switch (goal.metric_type) {
    case "arr": {
      const { data: account } = await supabase.from("accounts").select("arr").eq("id", goal.account_id).single()
      currentValue = account?.arr || 0
      break
    }
    case "health_score": {
      const { data: healthAccount } = await supabase
        .from("accounts")
        .select("health_score")
        .eq("id", goal.account_id)
        .single()
      currentValue = healthAccount?.health_score || 0
      break
    }
    case "nps": {
      const { data: npsData } = await supabase
        .from("nps_surveys")
        .select("score")
        .eq("account_id", goal.account_id)
        .order("survey_date", { ascending: false })
        .limit(1)
        .maybeSingle()
      currentValue = npsData?.score || 0
      break
    }
    case "adoption": {
      const { data: adoptionData } = await supabase
        .from("adoption_metrics")
        .select("metric_value")
        .eq("account_id", goal.account_id)
        .eq("metric_type", "feature_adoption")
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      currentValue = adoptionData?.metric_value || 0
      break
    }
  }

  // Update the goal with current value
  const { error } = await supabase.from("customer_goals").update({ current_value: currentValue }).eq("id", goalId)

  if (error) throw error
}

// Dashboard queries
export async function getDashboardStats(ownerId?: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()

  // Get account statistics
  let query = supabase
    .from("accounts")
    .select("status, health_score, churn_risk_score, arr, owner_id")
    .eq("organization_id", organization.id)

  // Filter by owner if specified
  if (ownerId) {
    query = query.eq("owner_id", ownerId)
  }

  const { data: accounts } = await query

  if (!accounts) return null

  const totalAccounts = accounts.length
  const activeAccounts = accounts.filter((a) => a.status === "active").length
  const atRiskAccounts = accounts.filter((a) => a.status === "at_risk").length
  const churnedAccounts = accounts.filter((a) => a.status === "churned").length

  const averageHealthScore = accounts.reduce((sum, a) => sum + a.health_score, 0) / totalAccounts || 0
  const averageChurnRisk = accounts.reduce((sum, a) => sum + a.churn_risk_score, 0) / totalAccounts || 0
  const totalARR = accounts.reduce((sum, a) => sum + (a.arr || 0), 0)

  // Get NPS score (last 90 days)
  const { data: npsData } = await supabase
    .from("nps_surveys")
    .select("score")
    .gte("survey_date", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .eq("organization_id", organization.id)

  const npsScore = npsData && npsData.length > 0 ? npsData.reduce((sum, n) => sum + n.score, 0) / npsData.length : 0

  return {
    totalAccounts,
    activeAccounts,
    atRiskAccounts,
    churnedAccounts,
    averageHealthScore: Math.round(averageHealthScore),
    averageChurnRisk: Math.round(averageChurnRisk),
    totalARR,
    npsScore: Math.round(npsScore * 10) / 10,
  }
}

export async function getChurnRiskAccounts(limit = 10, ownerId?: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()

  let query = supabase
    .from("accounts")
    .select(`
      id,
      name,
      churn_risk_score,
      health_score,
      arr,
      owner_id,
      engagements(completed_at)
    `)
    .eq("organization_id", organization.id)
    .order("churn_risk_score", { ascending: false })
    .limit(limit)

  // Filter by owner if specified
  if (ownerId) {
    query = query.eq("owner_id", ownerId)
  }

  const { data, error } = await query

  if (error) throw error

  return (
    data?.map((account) => ({
      ...account,
      last_engagement: account.engagements?.[0]?.completed_at || null,
      engagements: undefined,
    })) || []
  )
}

export async function getAutomations(organizationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('automation_workflows')
    .select(`
      *,
      automation_workflow_accounts (account_id)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (AutomationWorkflow & { automation_workflow_accounts: { account_id: string }[] })[];
}

export async function createAutomation(input: {
  organization_id: string;
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused';
  enabled?: boolean;
  scope_all_accounts: boolean;
  account_ids?: string[]; // only if scope_all_accounts = false
  trigger_type: string;
  trigger_config?: Record<string, any>;
  condition_config?: Record<string, any>;
  action_type: string;
  action_config?: Record<string, any>;
}) {
  const supabase = createClient();

  const { data: workflow, error } = await supabase
    .from('automation_workflows')
    .insert([{
      organization_id: input.organization_id,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? 'draft',
      enabled: input.enabled ?? false,
      scope_all_accounts: input.scope_all_accounts,
      trigger_type: input.trigger_type,
      trigger_config: input.trigger_config ?? {},
      condition_config: input.condition_config ?? {},
      action_type: input.action_type,
      action_config: input.action_config ?? {},
    }])
    .select()
    .single();

  if (error) throw error;

  if (!input.scope_all_accounts && input.account_ids?.length) {
    const rows = input.account_ids.map((account_id) => ({
      workflow_id: workflow.id,
      account_id,
    }));
    const { error: waErr } = await supabase.from('automation_workflow_accounts').insert(rows);
    if (waErr) throw waErr;
  }

  return workflow as AutomationWorkflow;
}

export async function updateAutomation(workflowId: string, updates: Partial<AutomationWorkflow> & {
  account_ids?: string[];
}) {
  const supabase = createClient();
  const { account_ids, ...wfUpdates } = updates;

  if (Object.keys(wfUpdates).length) {
    const { error } = await supabase
      .from('automation_workflows')
      .update(wfUpdates)
      .eq('id', workflowId);
    if (error) throw error;
  }

  if (account_ids) {
    const { error: delErr } = await supabase
      .from('automation_workflow_accounts')
      .delete()
      .eq('workflow_id', workflowId);
    if (delErr) throw delErr;

    if (account_ids.length) {
      const rows = account_ids.map((account_id) => ({ workflow_id: workflowId, account_id }));
      const { error: insErr } = await supabase.from('automation_workflow_accounts').insert(rows);
      if (insErr) throw insErr;
    }
  }
}

// Get organization users for owner selection
export async function getOrganizationUsers() {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, email")
    .eq("organization_id", organization.id)
    .order("full_name")
  
  if (error) throw error
  return data as User[]
}

export async function toggleAutomation(workflowId: string, enabled: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('automation_workflows')
    .update({ enabled, status: enabled ? 'active' : 'paused' })
    .eq('id', workflowId);
  if (error) throw error;
}

// Recent Activity queries
export interface RecentActivity {
  id: string
  type: "engagement" | "goal" | "nps"
  title: string
  description: string
  timestamp: string
  account: string
  user: string
  account_id?: string
}

export async function getRecentActivities(limit: number = 10, filterByUserId?: string): Promise<RecentActivity[]> {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) {
    console.log('No user or organization found in getRecentActivities')
    return []
  }

  console.log('Fetching activities for organization:', organization.id, 'filterByUserId:', filterByUserId)

  const supabase = createClient()
  const activities: RecentActivity[] = []

  try {
    // Get recent engagements (both completed and recent ones)
    let engagementQuery = supabase
      .from('engagements')
      .select(`
        id,
        title,
        type,
        completed_at,
        created_at,
        updated_at,
        account_id,
        created_by
      `)
      .eq('organization_id', organization.id)
      .order('updated_at', { ascending: false })
      .limit(10)

    // Filter by user if specified
    if (filterByUserId) {
      engagementQuery = engagementQuery.eq('created_by', filterByUserId)
    }

    const { data: engagements, error: engError } = await engagementQuery

    console.log('Engagements query result:', { engagements: engagements?.length, error: engError })
    if (engagements && engagements.length > 0) {
      console.log('Sample engagement:', engagements[0])
    }

    if (!engError && engagements && engagements.length > 0) {
      // Get account names for all engagements in one query
      const accountIds = engagements.map(e => e.account_id).filter(Boolean)
      let accountNames: { [key: string]: string } = {}
      
      if (accountIds.length > 0) {
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id, name')
          .in('id', accountIds)
        
        if (accounts) {
          accountNames = Object.fromEntries(accounts.map(a => [a.id, a.name]))
        }
      }

      // Get user names for all creators in one query
      const creatorIds = engagements.map(e => e.created_by).filter(Boolean)
      let creatorNames: { [key: string]: string } = {}
      
      if (creatorIds.length > 0) {
        const { data: creators } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', creatorIds)
        
        if (creators) {
          creatorNames = Object.fromEntries(creators.map(u => [u.id, u.full_name || 'Unknown User']))
        }
      }

      for (const engagement of engagements) {
        const isCompleted = engagement.completed_at
        const actionType = engagement.type || 'engagement'
        const accountName = accountNames[engagement.account_id] || 'Unknown Account'
        const creatorName = creatorNames[engagement.created_by] || 'Unknown User'
        
        activities.push({
          id: `engagement-${engagement.id}`,
          type: 'engagement',
          title: engagement.title || `${actionType} ${isCompleted ? 'Completed' : 'Created'}`,
          description: `${isCompleted ? 'Completed' : 'Created'} ${actionType} with ${accountName}`,
          timestamp: engagement.completed_at || engagement.updated_at || engagement.created_at,
          account: accountName,
          user: creatorName,
          account_id: engagement.account_id
        })
      }
    }

    // Get recent goal updates
    let goalQuery = supabase
      .from('customer_goals')
      .select(`
        id,
        title,
        status,
        updated_at,
        created_at,
        account:accounts(id, name),
        creator:user_profiles!customer_goals_created_by_fkey(full_name)
      `)
      .eq('organization_id', organization.id)
      .order('updated_at', { ascending: false })
      .limit(5)

    // Filter by user if specified
    if (filterByUserId) {
      goalQuery = goalQuery.eq('created_by', filterByUserId)
    }

    const { data: goals, error: goalError } = await goalQuery

    if (!goalError && goals) {
      for (const goal of goals) {
        // Only include if updated recently (within last 30 days)
        const updatedAt = new Date(goal.updated_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        
        if (updatedAt > thirtyDaysAgo) {
          activities.push({
            id: `goal-${goal.id}`,
            type: 'goal',
            title: 'Goal Updated',
            description: `${goal.title} ${goal.status ? `marked as ${goal.status}` : 'updated'}`,
            timestamp: goal.updated_at,
            account: goal.account?.name || 'Unknown Account',
            user: goal.creator?.full_name || 'Unknown User',
            account_id: goal.account?.id
          })
        }
      }
    }

    // Get recent NPS surveys
    const npsQuery = supabase
      .from('nps_surveys')
      .select(`
        id,
        score,
        feedback,
        survey_date,
        respondent_name,
        account:accounts(id, name)
      `)
      .eq('organization_id', organization.id)
      .not('score', 'is', null)
      .order('survey_date', { ascending: false })
      .limit(5)

    const { data: npsResponses, error: npsError } = await npsQuery

    if (!npsError && npsResponses) {
      for (const nps of npsResponses) {
        activities.push({
          id: `nps-${nps.id}`,
          type: 'nps',
          title: 'NPS Survey Completed',
          description: `New NPS score of ${nps.score} received${nps.feedback ? ' with feedback' : ''}`,
          timestamp: nps.survey_date,
          account: nps.account?.name || 'Unknown Account',
          user: nps.respondent_name || 'Anonymous',
          account_id: nps.account?.id
        })
      }
    }

  } catch (error) {
    console.error('Error fetching recent activities:', error)
  }

  // Sort all activities by timestamp and limit
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)

  console.log('Final activities count:', sortedActivities.length)
  if (sortedActivities.length > 0) {
    console.log('Sample final activity:', sortedActivities[0])
  }

  return sortedActivities
}

// Dynamic Health Score queries
export async function getDashboardStatsWithDynamicHealthScores(ownerId?: string) {
  try {
    const endpoint = `/api/dashboard/stats-dynamic${ownerId ? `?owner_id=${ownerId}` : ''}`
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch dynamic stats')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching dynamic dashboard stats:', error)
    // Fallback to regular stats if dynamic fails
    return getDashboardStats()
  }
}
