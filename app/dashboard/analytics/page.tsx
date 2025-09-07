import { getDashboardStats, getChurnRiskAccounts, getNPSSurveys, getCurrentUserOrganization } from "@/lib/supabase/queries"
import { EnhancedAnalyticsClient } from "@/components/analytics/enhanced-analytics-client"
import { createClient } from "@/lib/supabase/server"
import FeatureGate from "@/components/feature-gate"
import { redirect } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive analytics and insights powered by fastenr.</p>
      </div>

      <FeatureGate organizationId={organization.id} feature="advanced_analytics">
        <AnalyticsContent />
      </FeatureGate>
    </div>
  )
}

async function AnalyticsContent() {
  try {
    const supabase = createClient()
    
    // Try to fetch dynamic analytics data, fall back to regular data if needed
    let dynamicAnalytics
    let churnRiskAccounts
    let npsData

    try {
      // Fetch from dynamic API (this will use internal Supabase calls, not HTTP)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get accounts for dynamic health score calculation
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, organization_id, arr, created_at, churn_risk_score, name, owner_id, status")
        .eq("organization_id", profile.organization_id)

      if (accounts && accounts.length > 0) {
        // Import and use health score engine
        const { calculateHealthScoresForAccounts } = await import('@/lib/health-score-engine')
        const healthScores = await calculateHealthScoresForAccounts(accounts)

        // Build accounts with dynamic health scores
        const accountsWithScores = accounts.map(account => ({
          ...account,
          health_score: healthScores.get(account.id)?.overall || 0,
          health_components: healthScores.get(account.id)
        }))

        // Calculate health distribution
        const healthDistribution = { healthy: 0, moderate: 0, poor: 0, excellent: 0 }
        accountsWithScores.forEach(account => {
          const healthScore = account.health_score
          if (healthScore >= 90) healthDistribution.excellent++
          else if (healthScore >= 80) healthDistribution.healthy++
          else if (healthScore >= 60) healthDistribution.moderate++
          else healthDistribution.poor++
        })

        dynamicAnalytics = {
          overview: {
            totalAccounts: accounts.length,
            activeAccounts: accounts.filter(a => a.status === 'active').length,
            totalRevenue: accounts.reduce((sum, acc) => sum + (acc.arr || 0), 0),
            averageHealthScore: Math.round(accountsWithScores.reduce((sum, acc) => sum + acc.health_score, 0) / accountsWithScores.length)
          },
          accounts: accountsWithScores,
          healthDistribution
        }
      }
    } catch (dynamicError) {
      console.log('Dynamic analytics calculation failed, using fallback:', dynamicError.message)
    }

    // Fetch other data as fallback or supplement
    const [dashboardStats, fallbackChurnRisk, fallbackNpsData] = await Promise.all([
      getDashboardStats(),
      getChurnRiskAccounts(10),
      getNPSSurveys(),
    ])

    return (
      <EnhancedAnalyticsClient 
        dashboardStats={dynamicAnalytics || dashboardStats} 
        churnRiskAccounts={churnRiskAccounts || fallbackChurnRisk} 
        npsData={npsData || fallbackNpsData}
        dynamicData={dynamicAnalytics} 
      />
    )
  } catch {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics data. Please try again later.</p>
      </div>
    )
  }
}
