import { getCustomerGoals, getAccounts, getCurrentUserOrganization } from "@/lib/supabase/queries"
import { GoalsClient } from "@/components/goals/goals-client"
import FeatureGate from "@/components/feature-gate"
import { redirect } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }
  // Always attempt both requests; don’t hide the UI if one fails
  let goals: Awaited<ReturnType<typeof getCustomerGoals>> = []
  let accounts: Awaited<ReturnType<typeof getAccounts>>["data"] = []
  let loadError: string | null = null

  try {
    const [goalsRes, accountsRes] = await Promise.allSettled([
      getCustomerGoals(),      // now returns CustomerGoal[] with no join
      getAccounts(1, 100),     // returns { data, total, ... }
    ])

    if (goalsRes.status === "fulfilled") {
      goals = goalsRes.value ?? []
    } else {
      loadError = goalsRes.reason?.message ?? "Failed to load goals"
    }

    if (accountsRes.status === "fulfilled") {
      accounts = Array.isArray(accountsRes.value?.data) ? accountsRes.value.data : []
    } else {
      loadError = [loadError, accountsRes.reason?.message ?? "Failed to load accounts"]
        .filter(Boolean)
        .join(" · ")
    }
  } catch (err: any) {
    loadError = err?.message ?? "Unknown error"
  }

  // Build a lookup so GoalsClient can still show account names
  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]))

  // GoalsClient expects each goal to have goal.accounts?.name.
  // We synthesize that shape here to keep the UI unchanged.
  const initialGoals = (goals ?? []).map((g: any) => ({
    ...g,
    accounts: { name: accountNameById.get(g.account_id) ?? "—" },
    user_profiles: null, // optional in the component
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Goals</h1>
        <p className="text-muted-foreground">
          Track and manage goals and milestones with fastenr.
        </p>
      </div>

      <FeatureGate organizationId={organization.id} feature="goals_management">
        {/* Small debug banner (only in dev) */}
        {process.env.NODE_ENV !== "production" && loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <GoalsClient initialGoals={initialGoals as any} accounts={accounts as any} />
      </FeatureGate>
    </div>
  )
}
