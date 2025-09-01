import { getDashboardStats, getChurnRiskAccounts, getNPSSurveys, getCurrentUserOrganization } from "@/lib/supabase/queries"
import { EnhancedAnalyticsClient } from "@/components/analytics/enhanced-analytics-client"
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
    const [dashboardStats, churnRiskAccounts, npsData] = await Promise.all([
      getDashboardStats(),
      getChurnRiskAccounts(10),
      getNPSSurveys(),
    ])

    return <EnhancedAnalyticsClient dashboardStats={dashboardStats} churnRiskAccounts={churnRiskAccounts} npsData={npsData} />
  } catch {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading analytics data. Please try again later.</p>
      </div>
    )
  }
}
