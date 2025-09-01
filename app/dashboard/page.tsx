import { getDashboardStats, getChurnRiskAccounts, getRecentActivities } from "@/lib/supabase/queries"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { redirect } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

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
    const [stats, churnRiskAccounts, recentActivities] = await Promise.all([
      getDashboardStats(), 
      getChurnRiskAccounts(10),
      getRecentActivities(10) // Get latest 10 activities
    ])

    // Get accounts for health distribution
    const { data: accounts } = await supabase.from("accounts").select("id, health_score, name, owner_id").eq("organization_id", profile.organization_id)

    console.log('Dashboard server-side data:')
    console.log('- Stats:', !!stats)
    console.log('- Churn risk accounts:', churnRiskAccounts?.length || 0)
    console.log('- Recent activities:', recentActivities?.length || 0)
    console.log('- Accounts:', accounts?.length || 0)

    if (!stats) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      )
    }

    return (
      <DashboardClient
        initialStats={stats}
        initialChurnRiskAccounts={churnRiskAccounts || []}
        initialAccounts={(accounts || []) as any}
        initialActivities={recentActivities}
        currentUserId={profile.id}
        userFullName={profile.full_name}
        userRole={profile.role}
      />
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
