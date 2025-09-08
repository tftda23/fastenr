import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateHealthScoresForAccounts } from '@/lib/health-score-engine'
import { hasFeatureAccess } from '@/lib/features'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
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

    const hasAccess = await hasFeatureAccess(profile.organization_id, 'advanced_analytics')
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Advanced Analytics requires a Premium subscription',
          premium_required: true,
          feature: 'advanced_analytics'
        },
        { status: 402 }
      )
    }

    const dateRange = searchParams.get('date_range') || '30d'
    const ownerId = searchParams.get('owner_id')

    // Calculate date filter based on range
    let dateFilter = new Date()
    switch (dateRange) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '14d':
        dateFilter = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get accounts for dynamic health score calculation
    let accountsQuery = supabase
      .from("accounts")
      .select("id, organization_id, arr, created_at, churn_risk_score, name, owner_id, status")
      .eq("organization_id", profile.organization_id)

    // Filter by owner if specified
    if (ownerId) {
      accountsQuery = accountsQuery.eq('owner_id', ownerId)
    }

    const { data: accounts } = await accountsQuery

    if (!accounts) {
      return NextResponse.json({
        accounts: [],
        healthDistribution: { healthy: 0, moderate: 0, poor: 0 },
        engagementTrends: [],
        revenueTrends: []
      })
    }

    // Calculate dynamic health scores
    const healthScores = await calculateHealthScoresForAccounts(accounts)

    // Build accounts with dynamic health scores
    const accountsWithScores = accounts.map(account => ({
      ...account,
      health_score: healthScores.get(account.id)?.overall || 0,
      health_components: healthScores.get(account.id)
    }))

    // Calculate health score distribution using dynamic scores
    const healthDistribution = { healthy: 0, moderate: 0, poor: 0, excellent: 0 }
    
    accountsWithScores.forEach(account => {
      const healthScore = account.health_score
      
      if (healthScore >= 90) healthDistribution.excellent++
      else if (healthScore >= 80) healthDistribution.healthy++
      else if (healthScore >= 60) healthDistribution.moderate++
      else healthDistribution.poor++
    })

    // Get engagement data for trends
    const { data: engagements } = await supabase
      .from("engagements")
      .select(`
        id,
        type,
        created_at,
        accounts!inner(organization_id, owner_id)
      `)
      .eq("accounts.organization_id", profile.organization_id)
      .gte("created_at", dateFilter.toISOString())
      .eq(ownerId ? "accounts.owner_id" : "accounts.organization_id", ownerId || profile.organization_id)

    // Group engagements by date for trends
    const engagementTrends: Record<string, { date: string; count: number }> = {}
    engagements?.forEach(engagement => {
      const date = new Date(engagement.created_at).toISOString().split('T')[0]
      if (!engagementTrends[date]) {
        engagementTrends[date] = { date, count: 0 }
      }
      engagementTrends[date].count++
    })

    // Get engagement types distribution
    const engagementTypes: Record<string, number> = {}
    engagements?.forEach(engagement => {
      const type = engagement.type || 'other'
      if (!engagementTypes[type]) {
        engagementTypes[type] = 0
      }
      engagementTypes[type]++
    })

    // Calculate revenue trends (using ARR from accounts)
    const revenueTrends = accountsWithScores.reduce((acc: Record<string, { month: string; revenue: number; accounts: number }>, account) => {
      if (account.arr) {
        const month = new Date(account.created_at).toISOString().slice(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, accounts: 0 }
        }
        acc[month].revenue += account.arr
        acc[month].accounts++
      }
      return acc
    }, {})

    // Calculate aggregate statistics
    const totalRevenue = accountsWithScores.reduce((sum, account) => sum + (account.arr || 0), 0)
    const averageHealthScore = accountsWithScores.length > 0
      ? accountsWithScores.reduce((sum, account) => sum + account.health_score, 0) / accountsWithScores.length
      : 0

    // Get churn risk accounts
    const churnRiskAccounts = accountsWithScores
      .filter(account => account.churn_risk_score > 70)
      .sort((a, b) => (b.churn_risk_score || 0) - (a.churn_risk_score || 0))
      .slice(0, 10)

    return NextResponse.json({
      overview: {
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter(a => a.status === 'active').length,
        totalRevenue,
        averageHealthScore: Math.round(averageHealthScore),
        totalEngagements: engagements?.length || 0
      },
      accounts: accountsWithScores,
      healthDistribution,
      engagementTrends: Object.values(engagementTrends).sort((a, b) => a.date.localeCompare(b.date)),
      engagementTypes: Object.entries(engagementTypes).map(([name, count]) => ({ name, count })),
      revenueTrends: Object.values(revenueTrends).sort((a, b) => a.month.localeCompare(b.month)),
      churnRiskAccounts,
      calculated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching dynamic analytics stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics statistics' },
      { status: 500 }
    )
  }
}