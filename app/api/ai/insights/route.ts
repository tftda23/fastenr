import { NextRequest, NextResponse } from 'next/server'
import { aggregateDataForAI, sanitizeDataForAI } from '@/lib/ai/data-aggregator'
import { getDashboardPrompt, getAccountsPrompt, getAccountDetailPrompt, getContactsPrompt, getCalendarPrompt } from '@/lib/ai/prompts'
import { aiService } from '@/lib/ai/service'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageType, pageContext } = body

    logger.apiRequest('POST', '/api/ai/insights', { pageType, component: 'AI' })

    // Aggregate data based on page type and context
    const data = await aggregateDataForAI({ pageType, pageContext })
    logger.debug('Data aggregated for AI', { pageType, component: 'AI' }, {
      accountsCount: data.accounts.length,
      engagementsCount: data.engagements.length,
      contactsCount: data.contacts?.length || 0
    })

    // Sanitize data for AI (remove PII)
    const sanitizedData = sanitizeDataForAI(data)

    // Generate appropriate prompt based on page type
    let prompt: string
    switch (pageType) {
      case 'dashboard':
        prompt = getDashboardPrompt(sanitizedData, pageContext?.activeTab || 'all')
        break
      case 'accounts':
        prompt = getAccountsPrompt(sanitizedData)
        break
      case 'account-detail':
        prompt = getAccountDetailPrompt(sanitizedData, pageContext?.accountId || '')
        break
      case 'contacts':
        prompt = getContactsPrompt(sanitizedData)
        break
      case 'calendar':
        prompt = getCalendarPrompt(sanitizedData, pageContext?.viewMode || 'month', pageContext?.currentDate)
        break
      default:
        throw new Error(`Unsupported page type: ${pageType}`)
    }

    logger.debug('Generated AI prompt', { pageType, component: 'AI' }, { promptLength: prompt.length })

    let response
    
    // Check if AI is configured, otherwise fall back to mock
    const fallbackToMock = process.env.AI_FALLBACK_TO_MOCK !== 'false'
    
    if (aiService.isConfigured()) {
      try {
        logger.debug('Using real AI service', { pageType, component: 'AI' })
        response = await aiService.generateInsights(prompt)
        logger.info('AI insights generated successfully', { pageType, component: 'AI' }, { insightsCount: response.insights.length })
      } catch (aiError) {
        logger.error('Real AI service failed', { pageType, component: 'AI' }, aiError)
        
        if (fallbackToMock) {
          logger.warn('Falling back to mock insights due to AI error', { pageType, component: 'AI' })
          response = await generateMockInsights(pageType, sanitizedData, pageContext)
        } else {
          throw aiError
        }
      }
    } else {
      if (fallbackToMock) {
        logger.info('Using mock insights (AI not configured)', { pageType, component: 'AI' })
        response = await generateMockInsights(pageType, sanitizedData, pageContext)
      } else {
        throw new Error('AI service is not configured. Please set OPENAI_API_KEY environment variable.')
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.apiError('POST', '/api/ai/insights', error instanceof Error ? error : new Error(String(error)), { component: 'AI' })
    
    // Determine appropriate error status and message
    let status = 500
    let message = 'Failed to generate insights'
    
    if (error instanceof Error) {
      if (error.message.includes('not configured') || error.message.includes('API key')) {
        status = 503 // Service Unavailable
        message = 'AI service is not configured. Please contact your administrator.'
      } else if (error.message.includes('rate limit')) {
        status = 429 // Too Many Requests
        message = 'AI service is temporarily busy. Please try again in a moment.'
      } else if (error.message.includes('network') || error.message.includes('connect')) {
        status = 503 // Service Unavailable
        message = 'AI service is temporarily unavailable. Please try again later.'
      } else if (error.message.includes('Invalid') || error.message.includes('Unauthorized')) {
        status = 503 // Service Unavailable
        message = 'AI service configuration issue. Please contact your administrator.'
      } else {
        message = error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: message,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : String(error) : undefined
      },
      { status }
    )
  }
}

// Mock AI response generator - replace with actual AI service
async function generateMockInsights(pageType: string, data: any, pageContext: any) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const atRiskAccounts = data.accounts.filter((a: any) => a.status === 'at_risk' || a.churn_risk_score >= 70)
  const healthyAccounts = data.accounts.filter((a: any) => a.health_score >= 80)
  const lowEngagementAccounts = data.accounts.filter((a: any) => {
    const accountEngagements = data.engagements.filter((e: any) => e.account_id === a.id && e.days_ago <= 30)
    return accountEngagements.length === 0
  })

  switch (pageType) {
    case 'dashboard':
      return {
        summary: `Your ${pageContext?.activeTab === 'my' ? 'assigned' : 'organization'} portfolio shows ${data.summary.atRiskAccounts} accounts at immediate risk and ${healthyAccounts.length} performing well. Recent engagement activity is ${data.summary.recentEngagements > data.summary.totalEngagements * 0.3 ? 'strong' : 'declining'}, requiring focused attention on relationship maintenance.`,
        keyMetrics: {
          totalAccounts: data.summary.totalAccounts,
          atRiskAccounts: data.summary.atRiskAccounts,
          avgHealthScore: data.summary.avgHealthScore,
          opportunityAccounts: healthyAccounts.length
        },
        insights: [
          ...(atRiskAccounts.length > 0 ? [{
            type: 'risk' as const,
            title: `${atRiskAccounts.length} Accounts Need Immediate Attention`,
            description: `These accounts have high churn risk scores or are marked as at-risk. They represent significant revenue exposure and require immediate intervention.`,
            priority: 'high' as const,
            category: 'Retention',
            actionable: true,
            suggestedAction: 'Schedule emergency check-in calls within 48 hours'
          }] : []),
          ...(lowEngagementAccounts.length > 0 ? [{
            type: 'action' as const,
            title: `${lowEngagementAccounts.length} Accounts Without Recent Engagement`,
            description: `These accounts haven't been engaged with in the last 30 days, creating potential relationship gaps and missing early warning signals.`,
            priority: 'medium' as const,
            category: 'Engagement',
            actionable: true,
            suggestedAction: 'Schedule proactive outreach calls this week'
          }] : []),
          ...(healthyAccounts.length > 0 ? [{
            type: 'opportunity' as const,
            title: `${healthyAccounts.length} High-Health Accounts Ready for Growth`,
            description: `These accounts show strong health scores and engagement patterns, making them ideal candidates for expansion conversations and advocacy programs.`,
            priority: 'medium' as const,
            category: 'Growth',
            actionable: true,
            suggestedAction: 'Identify upsell opportunities and referral potential'
          }] : []),
          {
            type: 'trend' as const,
            title: 'Portfolio Health Analysis',
            description: `Average health score of ${data.summary.avgHealthScore}% ${data.summary.avgHealthScore >= 70 ? 'indicates a strong' : 'suggests room for improvement in your'} portfolio. ${data.summary.avgNPS > 0 ? `NPS of ${data.summary.avgNPS} shows customer satisfaction trends.` : 'Consider implementing NPS surveys for better insights.'}`,
            priority: 'low' as const,
            category: 'Health',
            actionable: false
          }
        ]
      }

    case 'accounts':
      const industryBreakdown = data.accounts.reduce((acc: any, account: any) => {
        const industry = account.industry || 'Unknown'
        acc[industry] = (acc[industry] || 0) + 1
        return acc
      }, {})
      
      return {
        summary: `Your account portfolio spans ${Object.keys(industryBreakdown).length} industries with ${data.summary.atRiskAccounts} accounts requiring immediate attention. The current health distribution suggests ${data.summary.avgHealthScore >= 70 ? 'strong' : 'moderate'} overall portfolio performance.`,
        keyMetrics: {
          totalAccounts: data.summary.totalAccounts,
          atRiskAccounts: data.summary.atRiskAccounts,
          avgHealthScore: data.summary.avgHealthScore,
          opportunityAccounts: healthyAccounts.length
        },
        insights: [
          {
            type: 'trend' as const,
            title: 'Industry Distribution Insights',
            description: `Your portfolio is distributed across: ${Object.entries(industryBreakdown).map(([k, v]) => `${k} (${v} accounts)`).join(', ')}. Consider industry-specific engagement strategies.`,
            priority: 'medium' as const,
            category: 'Strategy',
            actionable: true,
            suggestedAction: 'Develop industry-specific success plans'
          },
          {
            type: 'risk' as const,
            title: 'Health Score Distribution Analysis',
            description: `${Math.round((data.accounts.filter((a: any) => a.health_score < 60).length / data.summary.totalAccounts) * 100)}% of accounts have health scores below 60, indicating systematic issues that need addressing.`,
            priority: 'high' as const,
            category: 'Health',
            actionable: true,
            suggestedAction: 'Implement health score improvement initiatives'
          }
        ]
      }

    case 'account-detail':
      const account = data.accounts[0]
      const accountEngagements = data.engagements.filter((e: any) => e.account_id === account?.id)
      const accountContacts = data.contacts?.filter((c: any) => c.account_id === account?.id) || []
      
      return {
        summary: `This ${account?.industry || 'unknown industry'} account with ${account?.health_score || 'unknown'}% health score ${accountEngagements.length > 0 ? `has ${accountEngagements.length} recent engagements` : 'lacks recent engagement activity'}. ${accountContacts.length} contacts mapped with ${accountContacts.filter((c: any) => c.decision_maker_level === 'primary').length} decision makers.`,
        insights: [
          {
            type: account?.health_score < 60 ? 'risk' : 'opportunity',
            title: `Account Health: ${account?.health_score || 'Unknown'}%`,
            description: `Health score ${account?.health_score >= 70 ? 'indicates strong account performance' : account?.health_score >= 40 ? 'suggests moderate risk requiring attention' : 'shows critical risk requiring immediate action'}.`,
            priority: account?.health_score < 60 ? 'high' : 'medium',
            category: 'Health',
            actionable: account?.health_score < 60,
            accountId: account?.id,
            suggestedAction: account?.health_score < 60 ? 'Schedule urgent health assessment call' : undefined
          },
          {
            type: accountEngagements.length === 0 ? 'risk' : 'action',
            title: `Engagement Activity: ${accountEngagements.length} interactions (90 days)`,
            description: accountEngagements.length === 0 ? 'No recent engagements detected - relationship at risk' : `Recent activity includes: ${Array.from(new Set(accountEngagements.map((e: any) => e.type))).join(', ')}`,
            priority: accountEngagements.length === 0 ? 'high' : 'low',
            category: 'Engagement',
            actionable: true,
            accountId: account?.id,
            suggestedAction: accountEngagements.length === 0 ? 'Schedule immediate check-in call' : 'Continue regular engagement cadence'
          }
        ]
      }

    case 'calendar':
      const upcomingEngagements = data.engagements.filter((e: any) => 
        e.scheduled_at && new Date(e.scheduled_at) > new Date()
      ).length
      const thisWeekEngagements = data.engagements.filter((e: any) => {
        if (!e.scheduled_at) return false
        const engDate = new Date(e.scheduled_at)
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        return engDate > new Date() && engDate <= weekFromNow
      }).length
      
      return {
        summary: `Calendar analysis shows ${upcomingEngagements} upcoming engagements with ${thisWeekEngagements} scheduled this week. ${data.accounts.filter((a: any) => !data.engagements.some((e: any) => e.account_id === a.id && new Date(e.scheduled_at || e.completed_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))).length} accounts need immediate outreach scheduling.`,
        keyMetrics: {
          totalAccounts: data.summary.totalAccounts,
          scheduledEngagements: upcomingEngagements,
          engagementsThisWeek: thisWeekEngagements,
          accountsNeedingOutreach: data.accounts.filter((a: any) => !data.engagements.some((e: any) => e.account_id === a.id)).length
        },
        insights: [
          {
            type: 'action' as const,
            title: `${thisWeekEngagements} Engagements This Week`,
            description: 'Your calendar shows good activity this week with multiple customer touchpoints scheduled across different engagement types.',
            priority: 'medium' as const,
            category: 'Scheduling',
            actionable: true,
            suggestedAction: 'Review meeting preparation and ensure follow-up actions are planned'
          },
          ...(data.accounts.filter((a: any) => !data.engagements.some((e: any) => e.account_id === a.id && new Date(e.scheduled_at || e.completed_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))).length > 0 ? [{
            type: 'risk' as const,
            title: 'Accounts Without Recent Engagement',
            description: 'Several accounts have no scheduled or recent engagements, creating potential relationship gaps and missed early warning signals.',
            priority: 'high' as const,
            category: 'Engagement',
            actionable: true,
            suggestedAction: 'Schedule proactive check-in calls for unengaged accounts'
          }] : []),
          {
            type: 'trend' as const,
            title: 'Engagement Distribution Analysis',
            description: `Current engagement types: ${Array.from(new Set(data.engagements.map((e: any) => e.type))).join(', ')}. Balance of meeting types supports comprehensive relationship management.`,
            priority: 'low' as const,
            category: 'Cadence',
            actionable: false
          }
        ]
      }

    case 'contacts':
      const accountsWithoutContacts = data.accounts.length - new Set(data.contacts?.map((c: any) => c.account_id)).size
      const decisionMakers = data.contacts?.filter((c: any) => c.decision_maker_level === 'primary').length || 0
      
      return {
        summary: `Contact coverage spans ${data.contacts?.length || 0} contacts across ${new Set(data.contacts?.map((c: any) => c.account_id)).size || 0} accounts. ${accountsWithoutContacts} accounts lack contact information and ${decisionMakers} decision makers are mapped.`,
        insights: [
          ...(accountsWithoutContacts > 0 ? [{
            type: 'risk' as const,
            title: `${accountsWithoutContacts} Accounts Missing Contact Data`,
            description: 'These accounts have no mapped contacts, creating blind spots in relationship management and early warning systems.',
            priority: 'high' as const,
            category: 'Relationships',
            actionable: true,
            suggestedAction: 'Initiate contact mapping for uncovered accounts'
          }] : []),
          {
            type: 'opportunity' as const,
            title: 'Decision Maker Coverage Analysis',
            description: `${decisionMakers} primary decision makers identified. ${data.contacts?.filter((c: any) => c.relationship_strength === 'strong').length || 0} contacts have strong relationships.`,
            priority: 'medium' as const,
            category: 'Relationships',
            actionable: true,
            suggestedAction: 'Focus on strengthening relationships with key decision makers'
          }
        ]
      }

    default:
      throw new Error(`Unsupported page type: ${pageType}`)
  }
}