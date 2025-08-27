import { getDashboardStats, getChurnRiskAccounts, getNPSSurveys } from "@/lib/supabase/queries"
import { AnalyticsClient } from "@/components/analytics/analytics-client"

export default async function AnalyticsPage() {
  try {
    const [dashboardStats, churnRiskAccounts, npsData] = await Promise.all([
      getDashboardStats(),
      getChurnRiskAccounts(10),
      getNPSSurveys(),
    ])

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights powered by fastenr.</p>
        </div>

        <AnalyticsClient dashboardStats={dashboardStats} churnRiskAccounts={churnRiskAccounts} npsData={npsData} />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights powered by fastenr.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading analytics data. Please try again later.</p>
        </div>
      </div>
    )
  }
}
