import { getDashboardStats, getChurnRiskAccounts } from "@/lib/supabase/queries"
import { createClient } from "@/lib/supabase/server"
import StatsCards from "@/components/dashboard/stats-cards"
import ChurnRiskChart from "@/components/dashboard/churn-risk-chart"
import HealthScoreDistribution from "@/components/dashboard/health-score-distribution"
import RecentActivity from "@/components/dashboard/recent-activity"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, organization_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Profile lookup error:", profileError)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Error Loading Profile</p>
          <p className="text-muted-foreground">
            There was an error loading your profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
    // Profile not found, redirecting to onboarding
    redirect("/onboarding")
  }

  try {
    const [stats, churnRiskAccounts] = await Promise.all([getDashboardStats(), getChurnRiskAccounts(10)])

    // Get accounts for health distribution
    const { data: accounts } = await supabase.from("accounts").select("id, health_score, name")

    // Mock recent activities (in real app, this would come from a proper query)
    const recentActivities = [
      {
        id: "1",
        type: "engagement" as const,
        title: "Quarterly Business Review",
        description: "Completed QBR with TechCorp Inc",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        account: "TechCorp Inc",
        user: "John Smith",
      },
      {
        id: "2",
        type: "goal" as const,
        title: "Goal Updated",
        description: "User adoption goal marked as at risk",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        account: "StartupXYZ",
        user: "Sarah Johnson",
      },
      {
        id: "3",
        type: "nps" as const,
        title: "NPS Survey Completed",
        description: "New NPS score of 8 received",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        account: "Enterprise Solutions",
        user: "Mike Davis",
      },
    ]

    if (!stats) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.full_name} • {profile.role}
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Churn Risk Analysis */}
          <div className="lg:col-span-2">
            <ChurnRiskChart
              accounts={
                churnRiskAccounts?.map((account) => ({
                  ...account,
                  href: `/accounts/${account.id}`, // ✅ link to account detail
                })) || []
              }
            />
          </div>

          {/* Health Score Distribution */}
          <HealthScoreDistribution accounts={accounts || []} />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Error Loading Dashboard</p>
          <p className="text-muted-foreground">
            There was an error loading your dashboard. Please try refreshing the page.
          </p>
        </div>
      </div>
    )
  }
}
