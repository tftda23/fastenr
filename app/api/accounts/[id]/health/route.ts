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

    // Calculate health score with basic data
    try {
      const healthData = await calculateHealthScore(account.id)

      // Get NPS data from surveys
      const { data: npsData } = await supabase
        .from('nps_responses')
        .select('score, feedback, survey_date, respondent_name')
        .eq('account_id', accountId)
        .order('survey_date', { ascending: false })
        .limit(10)

      const latestNps = npsData && npsData.length > 0 ? npsData[0] : null
      const avgNps = npsData && npsData.length > 0 
        ? npsData.reduce((sum, response) => sum + (response.score || 0), 0) / npsData.length 
        : null

      return NextResponse.json({
        health_score: Math.round(healthData.score),
        churn_risk_score: account.churn_risk_score || 0,
        nps: {
          latest_score: latestNps?.score || null,
          last_response_date: latestNps?.survey_date || null,
          recent_responses: npsData || []
        }
      })

    } catch (healthError) {
      console.error('Health calculation error:', healthError)
      
      // Return basic data if health calculation fails
      return NextResponse.json({
        health_score: account.health_score || 0,
        churn_risk_score: account.churn_risk_score || 0,
        nps: {
          latest_score: null,
          last_response_date: null,
          recent_responses: []
        }
      })
    }

  } catch (error) {
    console.error('Account health API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch account health data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}