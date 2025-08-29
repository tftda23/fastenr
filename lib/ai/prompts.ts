export function getDashboardPrompt(data: any, activeTab: string) {
  const scope = activeTab === 'my' ? 'my assigned accounts' : 'all organization accounts'
  
  return `You are a Customer Success AI assistant analyzing ${scope} data. Provide actionable insights and recommendations.

CONTEXT:
- Analyzing ${data.summary.totalAccounts} accounts (${scope})
- ${data.summary.atRiskAccounts} accounts are at risk (status 'at_risk' or churn_risk_score >= 70)
- Average health score: ${data.summary.avgHealthScore}%
- ${data.summary.recentEngagements} engagements in last 30 days out of ${data.summary.totalEngagements} total in 90 days
- Average NPS: ${data.summary.avgNPS}

DATA SUMMARY:
Accounts by industry: ${getIndustryBreakdown(data.accounts)}
Accounts by size: ${getSizeBreakdown(data.accounts)}
Accounts by health score: ${getHealthScoreBreakdown(data.accounts)}
Recent engagement patterns: ${getEngagementPatterns(data.engagements)}
NPS trends: ${getNPSTrends(data.npsData)}

INSTRUCTIONS:
1. Analyze the overall portfolio health and identify key patterns
2. Highlight accounts needing immediate attention (high churn risk, low health scores, no recent engagements)
3. Identify opportunities for growth (healthy accounts, high NPS, good engagement)
4. Suggest specific actions for at-risk accounts
5. Provide industry or size-based insights if relevant
6. Flag any concerning trends (declining engagement, health scores, etc.)

FORMAT your response as JSON with:
{
  "summary": "2-3 sentence executive summary",
  "keyMetrics": {
    "totalAccounts": number,
    "atRiskAccounts": number,
    "avgHealthScore": number,
    "opportunityAccounts": number
  },
  "insights": [
    {
      "type": "risk|opportunity|action|trend",
      "title": "Brief insight title",
      "description": "Detailed description with context",
      "priority": "high|medium|low",
      "category": "Health|Engagement|Growth|Retention",
      "actionable": boolean,
      "accountId": "if specific to an account",
      "accountName": "account name if specific",
      "suggestedAction": "specific action if actionable"
    }
  ]
}`
}

export function getAccountsPrompt(data: any) {
  return `You are a Customer Success AI assistant analyzing accounts portfolio data. Provide high-level strategic insights.

CONTEXT:
- Total accounts: ${data.summary.totalAccounts}
- At risk accounts: ${data.summary.atRiskAccounts}
- Average health score: ${data.summary.avgHealthScore}%
- Total engagements (90 days): ${data.summary.totalEngagements}

PORTFOLIO ANALYSIS:
Industry distribution: ${getIndustryBreakdown(data.accounts)}
Company size distribution: ${getSizeBreakdown(data.accounts)}
ARR distribution: ${getARRBreakdown(data.accounts)}
Health vs Churn correlation: ${getHealthChurnCorrelation(data.accounts)}
Engagement frequency: ${getEngagementFrequency(data.engagements, data.accounts)}

INSTRUCTIONS:
1. Analyze portfolio composition and identify strategic insights
2. Look for patterns between industry, size, ARR, and success metrics
3. Identify underperforming segments that need attention
4. Suggest portfolio-level optimizations
5. Highlight any concerning distribution patterns
6. Recommend focus areas for account management

Provide insights focused on strategic account management and portfolio optimization.`
}

export function getAccountDetailPrompt(data: any, accountId: string) {
  const account = data.accounts.find((a: any) => a.id === accountId)
  const accountEngagements = data.engagements.filter((e: any) => e.account_id === accountId)
  const accountContacts = data.contacts?.filter((c: any) => c.account_id === accountId) || []
  const accountNPS = data.npsData?.filter((n: any) => n.account_id === accountId) || []
  const accountGoals = data.goals?.filter((g: any) => g.account_id === accountId) || []

  return `You are a Customer Success AI assistant analyzing a specific account. Provide detailed account-specific insights.

ACCOUNT OVERVIEW:
- Industry: ${account?.industry || 'Unknown'}
- Size: ${account?.size || 'Unknown'}
- ARR: $${account?.arr || 'Unknown'}
- Health Score: ${account?.health_score || 'Unknown'}%
- Churn Risk: ${account?.churn_risk_score || 'Unknown'}%
- Status: ${account?.status || 'Unknown'}
- Account Age: ${account?.account_age_months || 'Unknown'} months
- Has Owner: ${account?.has_owner ? 'Yes' : 'No'}

ENGAGEMENT HISTORY (90 days):
- Total engagements: ${accountEngagements.length}
- Recent engagements (30 days): ${accountEngagements.filter((e: any) => e.days_ago <= 30).length}
- Engagement types: ${getEngagementTypes(accountEngagements)}
- Last engagement: ${accountEngagements[0] ? accountEngagements[0].days_ago + ' days ago' : 'None'}

CONTACT COVERAGE:
- Total contacts: ${accountContacts.length}
- Decision makers: ${accountContacts.filter((c: any) => c.decision_maker_level === 'primary').length}
- Department coverage: ${getDepartmentCoverage(accountContacts)}
- Relationship strength: ${getRelationshipStrength(accountContacts)}

NPS & GOALS:
- NPS scores: ${accountNPS.map((n: any) => n.score).join(', ') || 'None'}
- Active goals: ${accountGoals.filter((g: any) => g.status === 'active').length}
- Overdue goals: ${accountGoals.filter((g: any) => g.overdue).length}

INSTRUCTIONS:
1. Provide a comprehensive account health assessment
2. Identify immediate risks and opportunities
3. Suggest specific actions for this account
4. Highlight gaps in engagement or relationship coverage
5. Assess goal progress and alignment
6. Recommend next best actions for the CSM

Focus on actionable recommendations specific to this account's situation.`
}

export function getCalendarPrompt(data: any, viewMode: string, currentDate?: string) {
  const dateContext = currentDate ? new Date(currentDate) : new Date()
  const formattedDate = dateContext.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `You are a Customer Success AI assistant analyzing calendar and engagement data for ${viewMode} view on ${formattedDate}.

CONTEXT:
- Viewing calendar in ${viewMode} mode
- Analyzing ${data.summary.totalAccounts} accounts with ${data.summary.totalEngagements} engagements
- ${data.summary.recentEngagements} recent engagements in last 30 days
- ${data.summary.atRiskAccounts} accounts currently at risk

ENGAGEMENT PATTERNS:
${getEngagementCalendarInsights(data.engagements, viewMode)}

ACCOUNT HEALTH CORRELATION:
- Accounts without recent engagements: ${data.accounts.filter((a: any) => !data.engagements.some((e: any) => e.account_id === a.id && new Date(e.scheduled_at || e.completed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))).length}
- At-risk accounts with upcoming engagements: ${data.accounts.filter((a: any) => (a.status === 'at_risk' || a.churn_risk_score >= 70) && data.engagements.some((e: any) => e.account_id === a.id && new Date(e.scheduled_at) > new Date())).length}

INSTRUCTIONS:
1. Analyze engagement frequency and patterns across accounts
2. Identify scheduling gaps that could lead to relationship deterioration
3. Highlight accounts that need immediate outreach or follow-up
4. Suggest optimal times for future engagements based on patterns
5. Flag any concerning trends in engagement cadence
6. Recommend calendar optimization strategies

FORMAT your response as JSON with:
{
  "summary": "2-3 sentence summary of calendar insights",
  "keyMetrics": {
    "totalAccounts": number,
    "scheduledEngagements": number,
    "engagementsThisWeek": number,
    "accountsNeedingOutreach": number
  },
  "insights": [
    {
      "type": "risk|opportunity|action|trend",
      "title": "Brief insight title",
      "description": "Detailed description with context",
      "priority": "high|medium|low", 
      "category": "Scheduling|Engagement|Cadence|Follow-up",
      "actionable": boolean,
      "accountId": "if specific to an account",
      "accountName": "account name if specific",
      "suggestedAction": "specific scheduling action if actionable"
    }
  ]
}`
}

export function getContactsPrompt(data: any) {
  return `You are a Customer Success AI assistant analyzing contact and relationship data. Focus on relationship mapping and coverage gaps.

CONTACT INTELLIGENCE:
- Total contacts: ${data.contacts?.length || 0}
- Accounts with contacts: ${new Set(data.contacts?.map((c: any) => c.account_id)).size || 0}
- Decision makers: ${data.contacts?.filter((c: any) => c.decision_maker_level === 'primary').length || 0}
- Department coverage: ${getDepartmentCoverage(data.contacts || [])}
- Relationship strength: ${getRelationshipStrength(data.contacts || [])}

COVERAGE ANALYSIS:
- Accounts without contacts: ${data.accounts.length - (new Set(data.contacts?.map((c: any) => c.account_id)).size || 0)}
- Single-point-of-failure accounts: ${getSingleContactAccounts(data.contacts || [], data.accounts)}
- Missing decision maker accounts: ${getMissingDecisionMakers(data.contacts || [], data.accounts)}

INSTRUCTIONS:
1. Analyze contact coverage across the account portfolio
2. Identify accounts with relationship risks (single contact, no decision makers)
3. Highlight departments or seniority levels that are underrepresented
4. Suggest strategies to improve relationship mapping
5. Flag accounts needing immediate attention for relationship building
6. Do NOT include any personal information (names, emails, etc.)

Focus on strategic relationship intelligence and coverage optimization.`
}

// Helper functions
function getIndustryBreakdown(accounts: any[]) {
  const industries = accounts.reduce((acc, account) => {
    const industry = account.industry || 'Unknown'
    acc[industry] = (acc[industry] || 0) + 1
    return acc
  }, {})
  return Object.entries(industries).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function getSizeBreakdown(accounts: any[]) {
  const sizes = accounts.reduce((acc, account) => {
    const size = account.size || 'Unknown'
    acc[size] = (acc[size] || 0) + 1
    return acc
  }, {})
  return Object.entries(sizes).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function getHealthScoreBreakdown(accounts: any[]) {
  const excellent = accounts.filter(a => a.health_score >= 80).length
  const good = accounts.filter(a => a.health_score >= 60 && a.health_score < 80).length
  const fair = accounts.filter(a => a.health_score >= 40 && a.health_score < 60).length
  const poor = accounts.filter(a => a.health_score < 40).length
  return `Excellent (80+): ${excellent}, Good (60-79): ${good}, Fair (40-59): ${fair}, Poor (<40): ${poor}`
}

function getARRBreakdown(accounts: any[]) {
  const tiers = {
    'Enterprise (>100K)': accounts.filter(a => a.arr > 100000).length,
    'Mid-market (10K-100K)': accounts.filter(a => a.arr >= 10000 && a.arr <= 100000).length,
    'SMB (<10K)': accounts.filter(a => a.arr < 10000).length,
    'Unknown': accounts.filter(a => !a.arr).length
  }
  return Object.entries(tiers).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function getEngagementPatterns(engagements: any[]) {
  const byType = engagements.reduce((acc, eng) => {
    acc[eng.type] = (acc[eng.type] || 0) + 1
    return acc
  }, {})
  return Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(', ')
}

function getNPSTrends(npsData: any[]) {
  if (!npsData.length) return 'No NPS data available'
  const avgScore = npsData.reduce((sum, n) => sum + n.score, 0) / npsData.length
  const recent = npsData.filter(n => n.days_ago <= 90).length
  return `Average: ${Math.round(avgScore * 10) / 10}, Recent responses (90d): ${recent}`
}

function getHealthChurnCorrelation(accounts: any[]) {
  const lowHealthHighChurn = accounts.filter(a => a.health_score < 50 && a.churn_risk_score > 70).length
  const highHealthLowChurn = accounts.filter(a => a.health_score > 80 && a.churn_risk_score < 30).length
  return `Low health + high churn risk: ${lowHealthHighChurn}, High health + low churn risk: ${highHealthLowChurn}`
}

function getEngagementCalendarInsights(engagements: any[], viewMode: string) {
  if (!engagements?.length) return 'No engagement data available'
  
  const now = new Date()
  const upcoming = engagements.filter(e => e.scheduled_at && new Date(e.scheduled_at) > now)
  const past = engagements.filter(e => (e.scheduled_at && new Date(e.scheduled_at) <= now) || e.completed_at)
  
  const typeBreakdown = engagements.reduce((acc: any, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {})
  
  const typeText = Object.entries(typeBreakdown)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ')
  
  return `${upcoming.length} upcoming, ${past.length} completed. Types: ${typeText}`
}

function getEngagementFrequency(engagements: any[], accounts: any[]) {
  const accountEngagements = accounts.map(acc => ({
    id: acc.id,
    count: engagements.filter(eng => eng.account_id === acc.id).length
  }))
  const highEngagement = accountEngagements.filter(a => a.count >= 5).length
  const lowEngagement = accountEngagements.filter(a => a.count <= 1).length
  return `High engagement (5+): ${highEngagement}, Low engagement (<=1): ${lowEngagement}`
}

function getEngagementTypes(engagements: any[]) {
  const types = engagements.reduce((acc, eng) => {
    acc[eng.type] = (acc[eng.type] || 0) + 1
    return acc
  }, {})
  return Object.entries(types).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'
}

function getDepartmentCoverage(contacts: any[]) {
  const departments = Array.from(new Set(contacts.map(c => c.department).filter(Boolean)))
  return departments.join(', ') || 'None'
}

function getRelationshipStrength(contacts: any[]) {
  const strong = contacts.filter(c => c.relationship_strength === 'strong').length
  const medium = contacts.filter(c => c.relationship_strength === 'medium').length
  const weak = contacts.filter(c => c.relationship_strength === 'weak').length
  return `Strong: ${strong}, Medium: ${medium}, Weak: ${weak}`
}

function getSingleContactAccounts(contacts: any[], accounts: any[]) {
  const contactCounts = contacts.reduce((acc, contact) => {
    acc[contact.account_id] = (acc[contact.account_id] || 0) + 1
    return acc
  }, {})
  return Object.values(contactCounts).filter(count => count === 1).length
}

function getMissingDecisionMakers(contacts: any[], accounts: any[]) {
  const accountsWithDecisionMakers = new Set(
    contacts
      .filter(c => c.decision_maker_level === 'primary')
      .map(c => c.account_id)
  )
  return accounts.length - accountsWithDecisionMakers.size
}