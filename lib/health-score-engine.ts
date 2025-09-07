import { createServerClient } from './supabase/server'

interface HealthScoreSettings {
  health_score_template?: 'balanced' | 'engagement_focused' | 'satisfaction_focused' | 'custom'
  health_score_engagement_weight?: number
  health_score_nps_weight?: number
  health_score_activity_weight?: number
  health_score_growth_weight?: number
  health_score_support_weight?: number
}

interface AccountData {
  id: string
  organization_id: string
  arr?: number
  mrr?: number
  seat_count?: number
  growth_tracking_method?: 'arr' | 'mrr' | 'seat_count'
  previous_arr?: number
  previous_mrr?: number
  previous_seat_count?: number
  last_growth_update?: string
  created_at?: string
}

interface HealthScoreComponents {
  engagement: number
  nps: number
  activity: number
  growth: number
  support: number
  overall: number
  breakdown?: {
    engagementScore: {
      score: number
      weight: number
      recentEngagements: number
      lastEngagementDays: number
      details: string
    }
    npsScore: {
      score: number
      weight: number
      averageNps: number
      responseCount: number
      details: string
    }
    activityScore: {
      score: number
      weight: number
      totalActivities: number
      details: string
    }
    growthScore: {
      score: number
      weight: number
      growthPercentage: number
      trackingMethod: string
      currentValue: number
      previousValue: number
      details: string
    }
    supportScore: {
      score: number
      weight: number
      ticketTrend: string
      avgResolutionHours: number
      escalationRate: number
      supportIntegrations: number
      details: string
    }
  }
}

// Cache for org settings to avoid repeated DB calls
const settingsCache = new Map<string, { settings: HealthScoreSettings; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get health score settings for an organization
 */
export async function getHealthScoreSettings(organizationId: string): Promise<HealthScoreSettings> {
  // Check cache first
  const cached = settingsCache.get(organizationId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.settings
  }

  const supabase = createServerClient()
  
  try {
    const { data } = await supabase
      .from('app_settings')
      .select(`
        health_score_template,
        health_score_engagement_weight,
        health_score_nps_weight,
        health_score_activity_weight,
        health_score_growth_weight,
        health_score_support_weight
      `)
      .eq('organization_id', organizationId)
      .single()

    const settings: HealthScoreSettings = {
      health_score_template: data?.health_score_template || 'balanced',
      health_score_engagement_weight: data?.health_score_engagement_weight ?? 25,
      health_score_nps_weight: data?.health_score_nps_weight ?? 20,
      health_score_activity_weight: data?.health_score_activity_weight ?? 20,
      health_score_growth_weight: data?.health_score_growth_weight ?? 20,
      health_score_support_weight: data?.health_score_support_weight ?? 15,
    }

    // Cache the settings
    settingsCache.set(organizationId, { settings, timestamp: Date.now() })
    
    return settings
  } catch (error) {
    console.error('Error fetching health score settings:', error)
    
    // Return default balanced settings
    const defaultSettings: HealthScoreSettings = {
      health_score_template: 'balanced',
      health_score_engagement_weight: 25,
      health_score_nps_weight: 20,
      health_score_activity_weight: 20,
      health_score_growth_weight: 20,
      health_score_support_weight: 15,
    }
    
    settingsCache.set(organizationId, { settings: defaultSettings, timestamp: Date.now() })
    return defaultSettings
  }
}

/**
 * Calculate engagement score based on recent interactions
 */
async function calculateEngagementScore(accountId: string, organizationId: string): Promise<{score: number, count: number, lastEngagementDays: number}> {
  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  try {
    // Get recent engagements
    const { data: engagements } = await supabase
      .from('engagements')
      .select('type, completed_at, created_at')
      .eq('account_id', accountId)
      .eq('organization_id', organizationId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    const engagementCount = engagements?.length || 0
    
    if (!engagements || engagements.length === 0) {
      return { score: 0, count: 0, lastEngagementDays: 999 }
    }

    // Calculate days since last engagement
    const lastEngagement = engagements[0]
    const lastEngagementDate = new Date(lastEngagement.created_at)
    const daysSinceLastEngagement = Math.floor((Date.now() - lastEngagementDate.getTime()) / (1000 * 60 * 60 * 24))

    // Score based on engagement frequency and types
    let score = 0
    const weights = {
      'call': 10,
      'meeting': 15,
      'email': 5,
      'demo': 20,
      'qbr': 25,
      'onboarding': 20,
      'support': 8
    }

    for (const engagement of engagements) {
      const weight = weights[engagement.type as keyof typeof weights] || 5
      const isCompleted = engagement.completed_at ? 1.2 : 1.0 // Bonus for completed
      score += weight * isCompleted
    }

    // Normalize to 0-100 scale (assuming 100 is about 6 high-value interactions per month)
    const normalizedScore = Math.min(100, Math.round(score / 1.5))
    
    return { 
      score: normalizedScore, 
      count: engagementCount, 
      lastEngagementDays: daysSinceLastEngagement 
    }
  } catch (error) {
    console.error('Error calculating engagement score:', error)
    return { score: 0, count: 0, lastEngagementDays: 999 }
  }
}

/**
 * Calculate NPS/satisfaction score
 */
async function calculateNPSScore(accountId: string, organizationId: string): Promise<{score: number, averageNps: number, responseCount: number}> {
  const supabase = createServerClient()
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  
  try {
    // Get recent NPS responses
    const { data: responses } = await supabase
      .from('nps_surveys')
      .select('score, survey_date')
      .eq('account_id', accountId)
      .eq('organization_id', organizationId)
      .gte('survey_date', ninetyDaysAgo.toISOString())
      .order('survey_date', { ascending: false })
      .limit(5) // Use last 5 responses

    const responseCount = responses?.length || 0

    if (!responses || responses.length === 0) {
      return { score: 50, averageNps: 0, responseCount: 0 } // Neutral if no data
    }

    // Calculate simple average NPS
    const averageNps = responses.reduce((sum, r) => sum + r.score, 0) / responses.length

    // Weight recent responses more heavily
    let weightedSum = 0
    let totalWeight = 0

    responses.forEach((response, index) => {
      const weight = Math.pow(0.8, index) // Decay factor for older responses
      const normalizedScore = (response.score + 100) / 2 // Convert -100-100 to 0-100
      weightedSum += normalizedScore * weight
      totalWeight += weight
    })

    const healthScore = Math.round(weightedSum / totalWeight)
    
    return { 
      score: healthScore, 
      averageNps: Math.round(averageNps), 
      responseCount 
    }
  } catch (error) {
    console.error('Error calculating NPS score:', error)
    return { score: 50, averageNps: 0, responseCount: 0 }
  }
}

/**
 * Calculate activity/usage score
 */
async function calculateActivityScore(accountId: string, organizationId: string): Promise<{score: number, totalActivities: number}> {
  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  try {
    // This is a placeholder - you would integrate with your actual usage tracking system
    // For now, we'll use engagement frequency as a proxy
    
    const { data: engagements } = await supabase
      .from('engagements')
      .select('id')
      .eq('account_id', accountId)
      .eq('organization_id', organizationId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const engagementCount = engagements?.length || 0
    
    // Simple scoring: more engagements = higher activity
    // This should be replaced with actual product usage metrics
    const score = Math.min(100, engagementCount * 15)
    
    return { score: Math.round(score), totalActivities: engagementCount }
  } catch (error) {
    console.error('Error calculating activity score:', error)
    return { score: 50, totalActivities: 0 }
  }
}

/**
 * Calculate growth/value score using account's preferred tracking method
 */
async function calculateGrowthScore(accountData: AccountData): Promise<{
  score: number, 
  growthPercentage: number,
  trackingMethod: string,
  currentValue: number,
  previousValue: number
}> {
  const supabase = createServerClient()
  
  try {
    const trackingMethod = accountData.growth_tracking_method || 'arr'
    
    // Get current and previous values based on tracking method
    let currentValue = 0
    let previousValue = 0
    
    switch (trackingMethod) {
      case 'arr':
        currentValue = accountData.arr || 0
        previousValue = accountData.previous_arr || 0
        break
      case 'mrr':
        currentValue = accountData.mrr || 0
        previousValue = accountData.previous_mrr || 0
        break
      case 'seat_count':
        currentValue = accountData.seat_count || 0
        previousValue = accountData.previous_seat_count || 0
        break
    }
    
    // Calculate growth percentage
    let growthPercentage = 0
    if (previousValue > 0 && currentValue !== null && currentValue !== undefined) {
      growthPercentage = Math.round(((currentValue - previousValue) / previousValue) * 100 * 10) / 10
    }
    
    // If no historical data, try to get from growth history table
    if (previousValue === 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const { data: historyData } = await supabase
        .from('account_growth_history')
        .select(`
          arr, mrr, seat_count,
          arr_growth_percentage, mrr_growth_percentage, seat_count_growth_percentage
        `)
        .eq('account_id', accountData.id)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single()
      
      if (historyData) {
        switch (trackingMethod) {
          case 'arr':
            growthPercentage = historyData.arr_growth_percentage || 0
            break
          case 'mrr':
            growthPercentage = historyData.mrr_growth_percentage || 0
            break
          case 'seat_count':
            growthPercentage = historyData.seat_count_growth_percentage || 0
            break
        }
      }
    }
    
    // Calculate score based on current value and growth
    let score = 50 // Base score
    
    // Bonus for having value
    if (currentValue > 0) {
      score += 20
      
      // Different value thresholds based on tracking method
      if (trackingMethod === 'arr') {
        if (currentValue > 100000) score += 15
        else if (currentValue > 50000) score += 12
        else if (currentValue > 10000) score += 10
        else if (currentValue > 5000) score += 5
      } else if (trackingMethod === 'mrr') {
        if (currentValue > 8333) score += 15 // ~100k ARR
        else if (currentValue > 4166) score += 12 // ~50k ARR
        else if (currentValue > 833) score += 10 // ~10k ARR
        else if (currentValue > 416) score += 5 // ~5k ARR
      } else if (trackingMethod === 'seat_count') {
        if (currentValue > 1000) score += 15
        else if (currentValue > 500) score += 12
        else if (currentValue > 100) score += 10
        else if (currentValue > 50) score += 5
      }
    }
    
    // Score adjustment based on growth percentage
    if (growthPercentage > 20) {
      score += 20 // Excellent growth
    } else if (growthPercentage > 10) {
      score += 15 // Good growth
    } else if (growthPercentage > 5) {
      score += 10 // Moderate growth
    } else if (growthPercentage > 0) {
      score += 5 // Some growth
    } else if (growthPercentage < -20) {
      score -= 30 // Significant decline
    } else if (growthPercentage < -10) {
      score -= 20 // Notable decline
    } else if (growthPercentage < 0) {
      score -= 10 // Slight decline
    }
    
    // Account age bonus (indicates stability)
    const accountAge = accountData.created_at 
      ? Date.now() - new Date(accountData.created_at).getTime() 
      : 0
    const ageInMonths = accountAge / (1000 * 60 * 60 * 24 * 30)
    
    if (ageInMonths > 12) score += 10
    else if (ageInMonths > 6) score += 7
    else if (ageInMonths > 3) score += 5
    
    return { 
      score: Math.min(100, Math.max(0, Math.round(score))), 
      growthPercentage,
      trackingMethod,
      currentValue,
      previousValue
    }
  } catch (error) {
    console.error('Error calculating growth score:', error)
    return { 
      score: 50, 
      growthPercentage: 0,
      trackingMethod: accountData.growth_tracking_method || 'arr',
      currentValue: 0,
      previousValue: 0
    }
  }
}

/**
 * Calculate support health score based on ticket metrics
 */
async function calculateSupportScore(accountId: string, organizationId: string): Promise<{
  score: number
  ticketTrend: string
  avgResolutionHours: number
  escalationRate: number
  supportIntegrations: number
}> {
  const supabase = createServerClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  try {
    // Get support metrics for the last 30 days
    const { data: supportMetrics, error } = await supabase
      .from('support_metrics')
      .select(`
        ticket_count,
        new_tickets,
        resolved_tickets,
        open_tickets,
        avg_resolution_time_hours,
        escalated_tickets,
        volume_trend,
        severity_score,
        provider
      `)
      .eq('account_id', accountId)
      .eq('organization_id', organizationId)
      .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching support metrics:', error)
      return {
        score: 75, // Default good score if no support data (no news is good news)
        ticketTrend: 'stable',
        avgResolutionHours: 0,
        escalationRate: 0,
        supportIntegrations: 0
      }
    }

    const metrics = supportMetrics || []
    
    if (metrics.length === 0) {
      return {
        score: 75, // Default good score if no support tickets
        ticketTrend: 'stable',
        avgResolutionHours: 0,
        escalationRate: 0,
        supportIntegrations: 0
      }
    }

    // Calculate aggregate metrics
    const totalTickets = metrics.reduce((sum, m) => sum + (m.ticket_count || 0), 0)
    const totalResolved = metrics.reduce((sum, m) => sum + (m.resolved_tickets || 0), 0)
    const totalEscalated = metrics.reduce((sum, m) => sum + (m.escalated_tickets || 0), 0)
    const avgResolutionHours = metrics
      .filter(m => m.avg_resolution_time_hours)
      .reduce((sum, m, _, arr) => sum + (m.avg_resolution_time_hours || 0) / arr.length, 0)
    
    const escalationRate = totalTickets > 0 ? (totalEscalated / totalTickets) * 100 : 0
    
    // Determine overall trend (most common trend in recent data)
    const trendCounts = metrics.reduce((acc, m) => {
      acc[m.volume_trend || 'stable'] = (acc[m.volume_trend || 'stable'] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const ticketTrend = Object.entries(trendCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'stable'

    // Calculate support health score (higher is better)
    let score = 100 // Start with perfect score

    // Volume impact (moderate tickets are normal, too many or escalating is bad)
    const avgTicketsPerDay = totalTickets / 30
    if (avgTicketsPerDay > 2) {
      score -= 20 // High volume is concerning
    } else if (avgTicketsPerDay > 1) {
      score -= 10 // Moderate volume
    }
    // No penalty for low volume (0-1 per day is good)

    // Trend impact
    if (ticketTrend === 'increasing') {
      score -= 25 // Increasing tickets is bad
    } else if (ticketTrend === 'decreasing') {
      score += 10 // Decreasing tickets is good
    }
    // No change for stable

    // Resolution time impact (faster is better)
    if (avgResolutionHours > 72) {
      score -= 25 // Very slow resolution
    } else if (avgResolutionHours > 48) {
      score -= 15 // Slow resolution
    } else if (avgResolutionHours > 24) {
      score -= 10 // Moderate resolution time
    } else if (avgResolutionHours > 0 && avgResolutionHours <= 12) {
      score += 5 // Fast resolution bonus
    }

    // Escalation rate impact (lower is better)
    if (escalationRate > 30) {
      score -= 30 // Very high escalation rate
    } else if (escalationRate > 15) {
      score -= 20 // High escalation rate  
    } else if (escalationRate > 5) {
      score -= 10 // Moderate escalation rate
    }
    // Bonus for low escalation rate
    if (escalationRate < 5 && totalTickets > 5) {
      score += 10
    }

    // Count unique support providers (having multiple support channels can be good or indicate complexity)
    const uniqueProviders = new Set(metrics.map(m => m.provider)).size

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      ticketTrend,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      supportIntegrations: uniqueProviders
    }
  } catch (error) {
    console.error('Error calculating support score:', error)
    return {
      score: 75, // Default neutral score on error
      ticketTrend: 'stable',
      avgResolutionHours: 0,
      escalationRate: 0,
      supportIntegrations: 0
    }
  }
}

/**
 * Generate engagement analysis details
 */
function getEngagementAnalysis(recentEngagements: number, lastEngagementDays: number): string {
  if (recentEngagements === 0) {
    return "No recent engagements recorded. Consider reaching out to this customer to maintain the relationship."
  }
  
  if (lastEngagementDays > 30) {
    return `Last engagement was ${lastEngagementDays} days ago. This customer may need immediate attention to prevent churn.`
  }
  
  if (lastEngagementDays > 14) {
    return `Last engagement was ${lastEngagementDays} days ago. Consider scheduling a check-in call soon.`
  }
  
  if (recentEngagements >= 5) {
    return `Excellent engagement with ${recentEngagements} interactions this month. Customer is highly engaged.`
  }
  
  if (recentEngagements >= 3) {
    return `Good engagement level with ${recentEngagements} interactions this month. Maintain regular contact.`
  }
  
  return `Limited engagement with ${recentEngagements} interactions this month. Consider increasing touchpoints.`
}

/**
 * Generate NPS analysis details
 */
function getNPSAnalysis(averageNps: number, responseCount: number): string {
  if (responseCount === 0) {
    return "No NPS surveys completed. Consider sending satisfaction surveys to gauge customer sentiment."
  }
  
  if (averageNps >= 50) {
    return `Excellent customer satisfaction with an average NPS of ${averageNps} from ${responseCount} surveys. Customer is a potential promoter.`
  }
  
  if (averageNps >= 0) {
    return `Neutral customer satisfaction with an average NPS of ${averageNps} from ${responseCount} surveys. Look for improvement opportunities.`
  }
  
  return `Poor customer satisfaction with an average NPS of ${averageNps} from ${responseCount} surveys. Immediate attention required.`
}

/**
 * Generate activity analysis details
 */
function getActivityAnalysis(totalActivities: number): string {
  if (totalActivities === 0) {
    return "No recorded activities. Customer may not be actively using the product or service."
  }
  
  if (totalActivities >= 10) {
    return `High activity level with ${totalActivities} recorded activities. Customer is actively engaged with your service.`
  }
  
  if (totalActivities >= 5) {
    return `Moderate activity level with ${totalActivities} recorded activities. Customer shows regular engagement.`
  }
  
  return `Low activity level with ${totalActivities} recorded activities. May need onboarding support or feature training.`
}

/**
 * Generate growth analysis details
 */
function getGrowthAnalysis(
  growthPercentage: number, 
  trackingMethod: string, 
  currentValue: number, 
  createdAt?: string
): string {
  const accountAge = createdAt ? 
    Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0
  
  const methodName = trackingMethod === 'arr' ? 'ARR' : 
                    trackingMethod === 'mrr' ? 'MRR' : 
                    'Seat Count'
  
  const valueFormatted = trackingMethod === 'seat_count' ? 
    `${currentValue} seats` : 
    `$${currentValue.toLocaleString()}`
  
  if (growthPercentage > 20) {
    return `Excellent growth with ${growthPercentage}% ${methodName} growth (${valueFormatted}). This customer represents significant expansion opportunity.`
  }
  
  if (growthPercentage > 10) {
    return `Strong growth with ${growthPercentage}% ${methodName} growth (${valueFormatted}). Customer shows excellent expansion potential.`
  }
  
  if (growthPercentage > 0) {
    return `Positive growth with ${growthPercentage}% ${methodName} growth (${valueFormatted}). Customer shows good expansion potential.`
  }
  
  if (growthPercentage === 0 && accountAge > 6) {
    return `Stable ${methodName} with no recent growth (${valueFormatted}). Consider discussing expansion opportunities.`
  }
  
  if (growthPercentage < -10) {
    return `Concerning decline with ${growthPercentage}% ${methodName} change (${valueFormatted}). This customer needs immediate attention to prevent further decline.`
  }
  
  if (growthPercentage < 0) {
    return `Minor decline with ${growthPercentage}% ${methodName} change (${valueFormatted}). Monitor closely and consider intervention.`
  }
  
  if (accountAge < 3) {
    return `New customer (${accountAge} months old) with ${valueFormatted} ${methodName}. Focus on successful onboarding and adoption.`
  }
  
  return `Stable customer with consistent ${methodName} of ${valueFormatted}. Monitor for expansion opportunities.`
}

/**
 * Generate support analysis details
 */
function getSupportAnalysis(
  ticketTrend: string, 
  avgResolutionHours: number, 
  escalationRate: number, 
  supportIntegrations: number
): string {
  if (supportIntegrations === 0) {
    return "No support ticket data available. Customer may be self-sufficient or using alternative support channels."
  }

  // Base message about integrations
  const integrationsText = supportIntegrations === 1 
    ? "1 support system integrated" 
    : `${supportIntegrations} support systems integrated`

  if (avgResolutionHours === 0) {
    return `Good support health with no recent tickets (${integrationsText}). Customer appears to be experiencing minimal issues.`
  }

  // Analyze trend
  let trendAnalysis = ""
  switch (ticketTrend) {
    case 'increasing':
      trendAnalysis = "Support ticket volume is increasing, which may indicate growing issues or expanding usage."
      break
    case 'decreasing':
      trendAnalysis = "Support ticket volume is decreasing, which is a positive trend indicating improved stability."
      break
    default:
      trendAnalysis = "Support ticket volume is stable."
  }

  // Analyze resolution time
  let resolutionAnalysis = ""
  if (avgResolutionHours <= 12) {
    resolutionAnalysis = `Excellent resolution time averaging ${avgResolutionHours} hours.`
  } else if (avgResolutionHours <= 24) {
    resolutionAnalysis = `Good resolution time averaging ${avgResolutionHours} hours.`
  } else if (avgResolutionHours <= 48) {
    resolutionAnalysis = `Moderate resolution time averaging ${avgResolutionHours} hours.`
  } else {
    resolutionAnalysis = `Slow resolution time averaging ${avgResolutionHours} hours - consider improving support processes.`
  }

  // Analyze escalation rate
  let escalationAnalysis = ""
  if (escalationRate === 0) {
    escalationAnalysis = "No ticket escalations."
  } else if (escalationRate <= 5) {
    escalationAnalysis = `Low escalation rate (${escalationRate}%).`
  } else if (escalationRate <= 15) {
    escalationAnalysis = `Moderate escalation rate (${escalationRate}%).`
  } else {
    escalationAnalysis = `High escalation rate (${escalationRate}%) - may indicate complex issues or support process gaps.`
  }

  return `${trendAnalysis} ${resolutionAnalysis} ${escalationAnalysis} (${integrationsText})`
}

/**
 * Calculate overall health score for an account
 */
export async function calculateHealthScore(accountData: AccountData): Promise<HealthScoreComponents> {
  try {
    const settings = await getHealthScoreSettings(accountData.organization_id)
    
    // Calculate individual components
    const [engagementData, npsData, activityData, growthData, supportData] = await Promise.all([
      calculateEngagementScore(accountData.id, accountData.organization_id),
      calculateNPSScore(accountData.id, accountData.organization_id),
      calculateActivityScore(accountData.id, accountData.organization_id),
      calculateGrowthScore(accountData),
      calculateSupportScore(accountData.id, accountData.organization_id)
    ])
    
    // Apply weights from settings
    const weights = {
      engagement: settings.health_score_engagement_weight ?? 25,
      nps: settings.health_score_nps_weight ?? 20,
      activity: settings.health_score_activity_weight ?? 20,
      growth: settings.health_score_growth_weight ?? 20,
      support: settings.health_score_support_weight ?? 15,
    }
    
    // Calculate weighted overall score
    const overall = Math.round(
      (engagementData.score * weights.engagement / 100) +
      (npsData.score * weights.nps / 100) +
      (activityData.score * weights.activity / 100) +
      (growthData.score * weights.growth / 100) +
      (supportData.score * weights.support / 100)
    )
    
    return {
      engagement: engagementData.score,
      nps: npsData.score,
      activity: activityData.score,
      growth: growthData.score,
      support: supportData.score,
      overall: Math.min(100, Math.max(0, overall)),
      breakdown: {
        engagementScore: {
          score: engagementData.score,
          weight: weights.engagement,
          recentEngagements: engagementData.count,
          lastEngagementDays: engagementData.lastEngagementDays,
          details: getEngagementAnalysis(engagementData.count, engagementData.lastEngagementDays)
        },
        npsScore: {
          score: npsData.score,
          weight: weights.nps,
          averageNps: npsData.averageNps,
          responseCount: npsData.responseCount,
          details: getNPSAnalysis(npsData.averageNps, npsData.responseCount)
        },
        activityScore: {
          score: activityData.score,
          weight: weights.activity,
          totalActivities: activityData.totalActivities,
          details: getActivityAnalysis(activityData.totalActivities)
        },
        growthScore: {
          score: growthData.score,
          weight: weights.growth,
          growthPercentage: growthData.growthPercentage,
          trackingMethod: growthData.trackingMethod,
          currentValue: growthData.currentValue,
          previousValue: growthData.previousValue,
          details: getGrowthAnalysis(
            growthData.growthPercentage, 
            growthData.trackingMethod, 
            growthData.currentValue, 
            accountData.created_at
          )
        },
        supportScore: {
          score: supportData.score,
          weight: weights.support,
          ticketTrend: supportData.ticketTrend,
          avgResolutionHours: supportData.avgResolutionHours,
          escalationRate: supportData.escalationRate,
          supportIntegrations: supportData.supportIntegrations,
          details: getSupportAnalysis(
            supportData.ticketTrend,
            supportData.avgResolutionHours,
            supportData.escalationRate,
            supportData.supportIntegrations
          )
        }
      }
    }
  } catch (error) {
    console.error('Error calculating health score for account:', accountData.id, error)
    
    // Return default scores in case of error
    return {
      engagement: 50,
      nps: 50,
      activity: 50,
      growth: 50,
      support: 75,
      overall: 50
    }
  }
}

/**
 * Calculate health scores for multiple accounts (batch processing)
 */
export async function calculateHealthScoresForAccounts(accounts: AccountData[]): Promise<Map<string, HealthScoreComponents>> {
  const results = new Map<string, HealthScoreComponents>()
  
  // Process accounts in batches to avoid overwhelming the database
  const batchSize = 10
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (account) => {
      const scores = await calculateHealthScore(account)
      results.set(account.id, scores)
    })
    
    await Promise.all(batchPromises)
  }
  
  return results
}

/**
 * Clear settings cache (call when settings are updated)
 */
export function clearHealthScoreSettingsCache(organizationId?: string) {
  if (organizationId) {
    settingsCache.delete(organizationId)
  } else {
    settingsCache.clear()
  }
}