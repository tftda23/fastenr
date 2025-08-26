import { getChurnRiskAccounts, getDashboardStats } from "@/lib/supabase/queries"
import { HealthClient } from "@/components/health/health-client"

export default async function HealthPage() {
  try {
    const [churnRiskAccounts, dashboardStats] = await Promise.all([
      getChurnRiskAccounts(20), // Get more accounts for health analysis
      getDashboardStats(),
    ])

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Scores</h1>
          <p className="text-muted-foreground">Monitor and analyze customer health scores and risk indicators.</p>
        </div>

        <HealthClient accounts={churnRiskAccounts} dashboardStats={dashboardStats} />
      </div>
    )
  } catch (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Scores</h1>
          <p className="text-muted-foreground">Monitor and analyze customer health scores and risk indicators.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading health data. Please try again later.</p>
        </div>
      </div>
    )
  }
}
