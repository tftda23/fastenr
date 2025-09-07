import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calculateHealthScoresForAccounts } from '@/lib/health-score-engine'
import { calculateChurnRisksForAccounts } from '@/lib/churn-risk-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Get current user and organization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const ownerId = searchParams.get('owner_id') // For filtering by owner

    // Get basic stats (these don't depend on health scores)
    const [
      { count: totalAccounts },
      { count: activeAccounts },
      { count: atRiskAccounts },
      { count: totalEngagements },
      { data: recentNps }
    ] = await Promise.all([
      // Total accounts
      supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id),

      // Active accounts
      supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("status", "active"),

      // At-risk accounts placeholder (will be calculated dynamically)
      Promise.resolve({ count: 0 }),

      // Total engagements this month
      supabase
        .from("engagements")
        .select(`*, accounts!inner(organization_id)`, { count: "exact", head: true })
        .eq("accounts.organization_id", profile.organization_id)
        .gte("created_at", new Date(new Date().setDate(1)).toISOString()),

      // Recent NPS surveys
      supabase
        .from("nps_surveys")
        .select("score")
        .eq("organization_id", profile.organization_id)
        .gte("survey_date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    // Get accounts for dynamic health score calculation
    let accountsQuery = supabase
      .from("accounts")
      .select("id, organization_id, arr, created_at, churn_risk_score, name, owner_id")
      .eq("organization_id", profile.organization_id)

    // Filter by owner if specified
    if (ownerId) {
      accountsQuery = accountsQuery.eq('owner_id', ownerId)
    }

    const { data: accounts } = await accountsQuery

    if (!accounts) {
      return NextResponse.json({
        overview: {
          totalAccounts: totalAccounts || 0,
          activeAccounts: activeAccounts || 0,
          atRiskAccounts: atRiskAccounts || 0,
          totalEngagements: totalEngagements || 0,
          averageNps: 0,
        },
        healthDistribution: { healthy: 0, moderate: 0, poor: 0 },
        churnRiskAccounts: [],
        recentNps: recentNps || [],
      })
    }

    // Calculate dynamic health scores and churn risks
    const [healthScores, churnRisks] = await Promise.all([
      calculateHealthScoresForAccounts(accounts),
      calculateChurnRisksForAccounts(accounts)
    ])

    // Calculate health score distribution using dynamic scores
    const healthStats = { healthy: 0, moderate: 0, poor: 0 }
    
    accounts.forEach(account => {
      const scores = healthScores.get(account.id)
      const healthScore = scores?.overall || 0
      
      if (healthScore >= 80) healthStats.healthy++
      else if (healthScore >= 60) healthStats.moderate++
      else healthStats.poor++
    })

    // Get top churn risk accounts with dynamic scores
    const churnRiskAccounts = accounts
      .map(account => ({
        ...account,
        churn_risk_score: churnRisks.get(account.id)?.overall || account.churn_risk_score || 0,
        health_score: healthScores.get(account.id)?.overall || 0
      }))
      .filter(account => account.churn_risk_score > 70)
      .sort((a, b) => (b.churn_risk_score || 0) - (a.churn_risk_score || 0))
      .slice(0, 5)

    // Calculate average NPS
    const avgNps = recentNps && recentNps.length > 0
      ? recentNps.reduce((sum, survey) => sum + survey.score, 0) / recentNps.length
      : 0

    // Calculate average health score from dynamic scores
    const avgHealthScore = accounts.length > 0
      ? accounts.reduce((sum, account) => {
          const scores = healthScores.get(account.id)
          return sum + (scores?.overall || 0)
        }, 0) / accounts.length
      : 0

    // Calculate total ARR
    const totalARR = accounts.reduce((sum, account) => sum + (account.arr || 0), 0)

    // Calculate at-risk accounts using dynamic churn risk scores
    const atRiskAccountsCount = accounts.filter(account => {
      const churnRisk = churnRisks.get(account.id)?.overall || account.churn_risk_score || 0
      return churnRisk > 70
    }).length

    // Return accounts with dynamic health scores and churn risks for components that need them
    const accountsWithScores = accounts.map(account => ({
      ...account,
      health_score: healthScores.get(account.id)?.overall || 0,
      health_components: healthScores.get(account.id),
      churn_risk_score: churnRisks.get(account.id)?.overall || account.churn_risk_score || 0,
      churn_risk_components: churnRisks.get(account.id)
    }))

    return NextResponse.json({
      totalAccounts: totalAccounts || 0,
      activeAccounts: activeAccounts || 0,
      atRiskAccounts: atRiskAccountsCount,
      churnedAccounts: 0, // Calculate if needed
      averageHealthScore: Math.round(avgHealthScore),
      averageChurnRisk: accounts.length > 0 
        ? Math.round(accounts.reduce((sum, acc) => {
            const churnRisk = churnRisks.get(acc.id)?.overall || acc.churn_risk_score || 0
            return sum + churnRisk
          }, 0) / accounts.length)
        : 0,
      totalARR: totalARR,
      npsScore: Math.round(avgNps),
      overview: {
        totalAccounts: totalAccounts || 0,
        activeAccounts: activeAccounts || 0,
        atRiskAccounts: atRiskAccounts || 0,
        totalEngagements: totalEngagements || 0,
        averageNps: Math.round(avgNps),
      },
      healthDistribution: healthStats,
      churnRiskAccounts,
      accounts: accountsWithScores,
      recentNps: recentNps || [],
      calculated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching dynamic dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}