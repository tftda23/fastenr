import { getChurnRiskAccounts, getDashboardStats } from "@/lib/supabase/queries"
import { HealthClient } from "@/components/health/health-client"
import { HealthHelp } from "@/components/ui/help-system"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function HealthPage() {
  try {
    const supabase = createClient()

    // Try to fetch accounts with dynamic health scores
    let accountsWithDynamicScores
    let dashboardStats

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get more accounts for health analysis
      const { data: accounts } = await supabase
        .from("accounts")
        .select("id, organization_id, arr, created_at, churn_risk_score, name, owner_id, status")
        .eq("organization_id", profile.organization_id)
        .limit(50) // Get more accounts for comprehensive health analysis

      if (accounts && accounts.length > 0) {
        // Import and use health score engine
        const { calculateHealthScoresForAccounts } = await import('@/lib/health-score-engine')
        const healthScores = await calculateHealthScoresForAccounts(accounts)

        // Build accounts with dynamic health scores
        accountsWithDynamicScores = accounts.map(account => ({
          ...account,
          health_score: healthScores.get(account.id)?.overall || 0,
          health_components: healthScores.get(account.id)
        }))

        // Calculate dashboard stats with dynamic scores
        dashboardStats = {
          averageHealthScore: Math.round(accountsWithDynamicScores.reduce((sum, acc) => sum + acc.health_score, 0) / accountsWithDynamicScores.length),
          atRiskAccounts: accounts.filter(acc => acc.churn_risk_score > 70).length,
          averageChurnRisk: Math.round(accounts.reduce((sum, acc) => sum + (acc.churn_risk_score || 0), 0) / accounts.length)
        }
      }
    } catch (dynamicError) {
      console.log('Dynamic health scores calculation failed, using fallback:', dynamicError.message)
    }

    // Fallback to original queries if dynamic calculation fails
    if (!accountsWithDynamicScores) {
      const [churnRiskAccounts, fallbackStats] = await Promise.all([
        getChurnRiskAccounts(20), // Get more accounts for health analysis
        getDashboardStats(),
      ])

      accountsWithDynamicScores = churnRiskAccounts
      dashboardStats = fallbackStats
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Scores</h1>
            <p className="text-muted-foreground">Monitor and analyze customer health scores and risk indicators.</p>
          </div>
          <div className="flex items-center gap-3">
            <HealthHelp variant="icon" size="md" />
          </div>
        </div>

        <HealthClient accounts={accountsWithDynamicScores} dashboardStats={dashboardStats} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Scores</h1>
            <p className="text-muted-foreground">Monitor and analyze customer health scores and risk indicators.</p>
          </div>
          <div className="flex items-center gap-3">
            <HealthHelp variant="icon" size="md" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading health data. Please try again later.</p>
        </div>
      </div>
    )
  }
}
