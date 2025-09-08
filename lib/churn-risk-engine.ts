import { createServerClient } from './supabase/server'

interface ChurnRiskSettings {
  churn_risk_template?: 'balanced' | 'contract_focused' | 'usage_focused' | 'custom'
  churn_risk_contract_weight?: number
  churn_risk_usage_weight?: number
  churn_risk_relationship_weight?: number
  churn_risk_satisfaction_weight?: number
  churn_risk_time_horizon?: 30 | 60 | 90
}

interface AccountData {
  id: string
  organization_id: string
  arr?: number
  created_at?: string
  churn_risk_score?: number
}

interface ChurnRiskComponents {
  contract: number
  usage: number
  relationship: number
  satisfaction: number
  overall: number
  breakdown?: {
    contractRisk: {
      score: number
      weight: number
      daysToRenewal: number
      paymentIssues: number
      details: string
    }
    usageRisk: {
      score: number
      weight: number
      usageDecline: number
      adoptionIssues: number
      details: string
    }
    relationshipRisk: {
      score: number
      weight: number
      engagementDecline: number
      stakeholderChanges: number
      details: string
    }
    satisfactionRisk: {
      score: number
      weight: number
      npsDetractors: number
      supportIssues: number
      details: string
    }
  }
}

// Cache for org settings to avoid repeated DB calls
const churnSettingsCache = new Map<string, { settings: ChurnRiskSettings; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get churn risk settings for an organization
 */
export async function getChurnRiskSettings(organizationId: string): Promise<ChurnRiskSettings> {
  // Check cache first
  const cached = churnSettingsCache.get(organizationId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.settings
  }

  const supabase = createServerClient()
  
  try {
    const { data } = await supabase
      .from('app_settings')
      .select(`
        churn_risk_template,
        churn_risk_contract_weight,
        churn_risk_usage_weight,
        churn_risk_relationship_weight,
        churn_risk_satisfaction_weight,
        churn_risk_time_horizon
      `)
      .eq('organization_id', organizationId)
      .single()

    const settings: ChurnRiskSettings = {
      churn_risk_template: data?.churn_risk_template || 'balanced',
      churn_risk_contract_weight: data?.churn_risk_contract_weight ?? 40,
      churn_risk_usage_weight: data?.churn_risk_usage_weight ?? 25,
      churn_risk_relationship_weight: data?.churn_risk_relationship_weight ?? 20,
      churn_risk_satisfaction_weight: data?.churn_risk_satisfaction_weight ?? 15,
      churn_risk_time_horizon: data?.churn_risk_time_horizon ?? 90,
    }

    // Cache the settings
    churnSettingsCache.set(organizationId, { settings, timestamp: Date.now() })
    
    return settings
  } catch (error) {
    console.error('Error fetching churn risk settings:', error)
    
    // Return default balanced settings
    const defaultSettings: ChurnRiskSettings = {
      churn_risk_template: 'balanced',
      churn_risk_contract_weight: 40,
      churn_risk_usage_weight: 25,
      churn_risk_relationship_weight: 20,
      churn_risk_satisfaction_weight: 15,
      churn_risk_time_horizon: 90,
    }
    
    churnSettingsCache.set(organizationId, { settings: defaultSettings, timestamp: Date.now() })
    return defaultSettings
  }
}

/**
 * Calculate contract risk based on renewal dates and payment issues
 */
async function calculateContractRisk(accountId: string, organizationId: string, timeHorizon: number): Promise<{score: number, daysToRenewal: number, paymentIssues: number}> {
  const supabase = createServerClient()
  
  try {
    // Get account contract information
    const { data: account } = await supabase
      .from('accounts')
      .select('created_at, arr, updated_at')
      .eq('id', accountId)
      .eq('organization_id', organizationId)
      .single()

    if (!account) {
      return { score: 50, daysToRenewal: 999, paymentIssues: 0 }
    }

    // Calculate estimated renewal date (assuming 12-month contracts)
    const accountAge = Date.now() - new Date(account.created_at).getTime()
    const ageInMonths = accountAge / (1000 * 60 * 60 * 24 * 30)
    const monthsToNextRenewal = 12 - (ageInMonths % 12)
    const daysToRenewal = Math.round(monthsToNextRenewal * 30)

    // Check for payment issues (simplified - would integrate with billing system)
    const paymentIssues = 0
    // TODO: Integrate with actual billing/payment data
    
    // Calculate risk score based on proximity to renewal
    let score = 0
    if (daysToRenewal <= timeHorizon) {
      // High risk if renewal is within time horizon
      const proximityFactor = 1 - (daysToRenewal / timeHorizon)
      score = 30 + (proximityFactor * 50) // 30-80 range based on proximity
    } else {
      // Lower risk if renewal is far away
      score = Math.max(10, 30 - (daysToRenewal - timeHorizon) / 30)
    }

    // Increase risk for payment issues
    score += paymentIssues * 20

    return { 
      score: Math.min(100, Math.max(0, Math.round(score))), 
      daysToRenewal, 
      paymentIssues 
    }
  } catch (error) {
    console.error('Error calculating contract risk:', error)
    return { score: 50, daysToRenewal: 999, paymentIssues: 0 }
  }
}

/**
 * Calculate usage risk based on product adoption and activity trends
 */
async function calculateUsageRisk(accountId: string, organizationId: string): Promise<{score: number, usageDecline: number, adoptionIssues: number}> {
  const supabase = createServerClient()
  
  try {
    // Get recent engagement data as proxy for usage
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const [recentEngagements, olderEngagements] = await Promise.all([
      supabase
        .from('engagements')
        .select('id, type')
        .eq('account_id', accountId)
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('engagements')
        .select('id, type')
        .eq('account_id', accountId)
        .eq('organization_id', organizationId)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
    ])

    const recentCount = recentEngagements.data?.length || 0
    const olderCount = olderEngagements.data?.length || 0

    // Calculate usage decline
    const usageDecline = olderCount > 0 
      ? Math.max(0, ((olderCount - recentCount) / olderCount) * 100)
      : (recentCount === 0 ? 100 : 0)

    // Simple adoption scoring (would be more sophisticated with actual product data)
    const adoptionIssues = recentCount < 2 ? 1 : 0

    // Calculate risk score
    let score = 20 // Base score
    score += usageDecline * 0.6 // Usage decline contributes heavily
    score += adoptionIssues * 30 // Adoption issues are significant

    return { 
      score: Math.min(100, Math.max(0, Math.round(score))), 
      usageDecline: Math.round(usageDecline), 
      adoptionIssues 
    }
  } catch (error) {
    console.error('Error calculating usage risk:', error)
    return { score: 50, usageDecline: 0, adoptionIssues: 0 }
  }
}

/**
 * Calculate relationship risk based on engagement quality and stakeholder changes
 */
async function calculateRelationshipRisk(accountId: string, organizationId: string): Promise<{score: number, engagementDecline: number, stakeholderChanges: number}> {
  const supabase = createServerClient()
  
  try {
    // Get engagement trends
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const [recentEngagements, olderEngagements] = await Promise.all([
      supabase
        .from('engagements')
        .select('type, completed_at')
        .eq('account_id', accountId)
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      supabase
        .from('engagements')
        .select('type, completed_at')
        .eq('account_id', accountId)
        .eq('organization_id', organizationId)
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString())
    ])

    const recentQuality = recentEngagements.data?.filter(e => e.completed_at).length || 0
    const olderQuality = olderEngagements.data?.filter(e => e.completed_at).length || 0

    // Calculate engagement decline
    const engagementDecline = olderQuality > 0 
      ? Math.max(0, ((olderQuality - recentQuality) / olderQuality) * 100)
      : (recentQuality === 0 ? 100 : 0)

    // Stakeholder changes (simplified - would track actual contact changes)
    const stakeholderChanges = 0 // TODO: Implement contact change tracking

    // Calculate risk score
    let score = 15 // Base score
    score += engagementDecline * 0.5
    score += stakeholderChanges * 25

    return { 
      score: Math.min(100, Math.max(0, Math.round(score))), 
      engagementDecline: Math.round(engagementDecline), 
      stakeholderChanges 
    }
  } catch (error) {
    console.error('Error calculating relationship risk:', error)
    return { score: 30, engagementDecline: 0, stakeholderChanges: 0 }
  }
}

/**
 * Calculate satisfaction risk based on NPS and support issues
 */
async function calculateSatisfactionRisk(accountId: string, organizationId: string): Promise<{score: number, npsDetractors: number, supportIssues: number}> {
  const supabase = createServerClient()
  
  try {
    // Get recent NPS data
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    const { data: npsData } = await supabase
      .from('nps_surveys')
      .select('score')
      .eq('account_id', accountId)
      .eq('organization_id', organizationId)
      .gte('survey_date', ninetyDaysAgo.toISOString())
      .order('survey_date', { ascending: false })
      .limit(3)

    // Count detractors (NPS 0-6)
    const npsDetractors = npsData?.filter(survey => survey.score <= 6).length || 0
    const totalResponses = npsData?.length || 0

    // Support issues (simplified - would integrate with support system)
    const supportIssues = 0 // TODO: Integrate with support ticket data

    // Calculate risk score
    let score = 10 // Base score
    
    if (totalResponses > 0) {
      const detractorRatio = npsDetractors / totalResponses
      score += detractorRatio * 60 // Heavy weight for detractors
    } else if (totalResponses === 0) {
      score += 20 // Risk for no feedback
    }
    
    score += supportIssues * 15

    return { 
      score: Math.min(100, Math.max(0, Math.round(score))), 
      npsDetractors, 
      supportIssues 
    }
  } catch (error) {
    console.error('Error calculating satisfaction risk:', error)
    return { score: 25, npsDetractors: 0, supportIssues: 0 }
  }
}

/**
 * Generate analysis details for each risk component
 */
function getContractRiskAnalysis(daysToRenewal: number, paymentIssues: number): string {
  if (daysToRenewal <= 30) {
    return `Contract renewal due in ${daysToRenewal} days. Immediate attention required for renewal discussions.`
  }
  if (daysToRenewal <= 90) {
    return `Contract renewal approaching in ${daysToRenewal} days. Begin renewal planning and stakeholder engagement.`
  }
  if (paymentIssues > 0) {
    return `${paymentIssues} payment issues detected. Address billing concerns to prevent churn.`
  }
  return `Contract renewal not due for ${daysToRenewal} days. Low contract-related risk.`
}

function getUsageRiskAnalysis(usageDecline: number, adoptionIssues: number): string {
  if (usageDecline > 50) {
    return `Significant usage decline of ${usageDecline}%. Investigate adoption barriers and provide additional training.`
  }
  if (usageDecline > 25) {
    return `Moderate usage decline of ${usageDecline}%. Monitor closely and consider proactive outreach.`
  }
  if (adoptionIssues > 0) {
    return `Low adoption detected. Focus on onboarding and feature training to increase engagement.`
  }
  return `Stable usage patterns. Continue monitoring for any declining trends.`
}

function getRelationshipRiskAnalysis(engagementDecline: number, stakeholderChanges: number): string {
  if (engagementDecline > 50) {
    return `Significant engagement decline of ${engagementDecline}%. Reach out immediately to re-establish connection.`
  }
  if (engagementDecline > 25) {
    return `Moderate engagement decline of ${engagementDecline}%. Schedule check-in meetings to maintain relationship.`
  }
  if (stakeholderChanges > 0) {
    return `${stakeholderChanges} stakeholder changes detected. Rebuild relationships with new contacts.`
  }
  return `Stable relationship engagement. Maintain regular touchpoints.`
}

function getSatisfactionRiskAnalysis(npsDetractors: number, supportIssues: number): string {
  if (npsDetractors > 0) {
    return `${npsDetractors} detractor responses detected. Address concerns immediately to prevent churn.`
  }
  if (supportIssues > 2) {
    return `Multiple support issues (${supportIssues}) indicate potential dissatisfaction. Review and resolve quickly.`
  }
  if (supportIssues > 0) {
    return `${supportIssues} support issues detected. Monitor resolution and follow up on satisfaction.`
  }
  return `No recent satisfaction concerns. Continue monitoring NPS and support feedback.`
}

/**
 * Calculate overall churn risk for an account
 */
export async function calculateChurnRisk(accountData: AccountData): Promise<ChurnRiskComponents> {
  try {
    const settings = await getChurnRiskSettings(accountData.organization_id)
    
    // Calculate individual components
    const [contractData, usageData, relationshipData, satisfactionData] = await Promise.all([
      calculateContractRisk(accountData.id, accountData.organization_id, settings.churn_risk_time_horizon || 90),
      calculateUsageRisk(accountData.id, accountData.organization_id),
      calculateRelationshipRisk(accountData.id, accountData.organization_id),
      calculateSatisfactionRisk(accountData.id, accountData.organization_id)
    ])
    
    // Apply weights from settings
    const weights = {
      contract: settings.churn_risk_contract_weight ?? 40,
      usage: settings.churn_risk_usage_weight ?? 25,
      relationship: settings.churn_risk_relationship_weight ?? 20,
      satisfaction: settings.churn_risk_satisfaction_weight ?? 15,
    }
    
    // Calculate weighted overall risk
    const overall = Math.round(
      (contractData.score * weights.contract / 100) +
      (usageData.score * weights.usage / 100) +
      (relationshipData.score * weights.relationship / 100) +
      (satisfactionData.score * weights.satisfaction / 100)
    )
    
    return {
      contract: contractData.score,
      usage: usageData.score,
      relationship: relationshipData.score,
      satisfaction: satisfactionData.score,
      overall: Math.min(100, Math.max(0, overall)),
      breakdown: {
        contractRisk: {
          score: contractData.score,
          weight: weights.contract,
          daysToRenewal: contractData.daysToRenewal,
          paymentIssues: contractData.paymentIssues,
          details: getContractRiskAnalysis(contractData.daysToRenewal, contractData.paymentIssues)
        },
        usageRisk: {
          score: usageData.score,
          weight: weights.usage,
          usageDecline: usageData.usageDecline,
          adoptionIssues: usageData.adoptionIssues,
          details: getUsageRiskAnalysis(usageData.usageDecline, usageData.adoptionIssues)
        },
        relationshipRisk: {
          score: relationshipData.score,
          weight: weights.relationship,
          engagementDecline: relationshipData.engagementDecline,
          stakeholderChanges: relationshipData.stakeholderChanges,
          details: getRelationshipRiskAnalysis(relationshipData.engagementDecline, relationshipData.stakeholderChanges)
        },
        satisfactionRisk: {
          score: satisfactionData.score,
          weight: weights.satisfaction,
          npsDetractors: satisfactionData.npsDetractors,
          supportIssues: satisfactionData.supportIssues,
          details: getSatisfactionRiskAnalysis(satisfactionData.npsDetractors, satisfactionData.supportIssues)
        }
      }
    }
  } catch (error) {
    console.error('Error calculating churn risk for account:', accountData.id, error)
    
    // Return default scores in case of error
    return {
      contract: 50,
      usage: 50,
      relationship: 50,
      satisfaction: 50,
      overall: 50
    }
  }
}

/**
 * Calculate churn risks for multiple accounts (batch processing)
 */
export async function calculateChurnRisksForAccounts(accounts: AccountData[]): Promise<Map<string, ChurnRiskComponents>> {
  const results = new Map<string, ChurnRiskComponents>()
  
  // Process accounts in batches to avoid overwhelming the database
  const batchSize = 10
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (account) => {
      const risks = await calculateChurnRisk(account)
      results.set(account.id, risks)
    })
    
    await Promise.all(batchPromises)
  }
  
  return results
}

/**
 * Clear settings cache (call when settings are updated)
 */
export function clearChurnRiskSettingsCache(organizationId?: string) {
  if (organizationId) {
    churnSettingsCache.delete(organizationId)
  } else {
    churnSettingsCache.clear()
  }
}