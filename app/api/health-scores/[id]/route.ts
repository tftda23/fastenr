import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateHealthScore } from '@/lib/health-score-engine'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: accountId } = params

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Get account data
    const supabase = createClient()
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Calculate health score with detailed breakdown
    const healthData = await calculateHealthScore(account.id)

    return NextResponse.json({
      health_score: healthData.overall,
      churn_risk_score: account.churn_risk_score || 0,
      health_components: {
        engagement: Math.round(healthData.engagement * 100),
        nps: Math.round(healthData.nps * 100),
        activity: Math.round(healthData.activity * 100),
        growth: Math.round(healthData.growth * 100),
        breakdown: {
          engagementScore: {
            score: Math.round(healthData.engagement * 100),
            weight: 0.3,
            recentEngagements: healthData.breakdown?.engagementScore?.recentEngagements || 0,
            lastEngagementDays: healthData.breakdown?.engagementScore?.lastEngagementDays || 0,
            details: healthData.breakdown?.engagementScore?.details || 'No engagement data available'
          },
          npsScore: {
            score: Math.round(healthData.nps * 100),
            weight: 0.25,
            averageNps: healthData.breakdown?.npsScore?.averageNps || 0,
            responseCount: healthData.breakdown?.npsScore?.responseCount || 0,
            details: healthData.breakdown?.npsScore?.details || 'No NPS data available'
          },
          activityScore: {
            score: Math.round(healthData.activity * 100),
            weight: 0.25,
            totalActivities: healthData.breakdown?.activityScore?.totalActivities || 0,
            details: healthData.breakdown?.activityScore?.details || 'No activity data available'
          },
          growthScore: {
            score: Math.round(healthData.growth * 100),
            weight: 0.2,
            arrGrowth: healthData.breakdown?.growthScore?.growthPercentage || 0,
            details: healthData.breakdown?.growthScore?.details || 'No growth data available'
          }
        }
      }
    })

  } catch (error) {
    console.error('Health score API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate health score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}