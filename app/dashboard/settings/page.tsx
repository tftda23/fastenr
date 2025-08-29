import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import UserSettingsClient from "@/components/settings/user-settings-client"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Settings | fastenr",
  description: "Manage your personal settings and preferences",
}

export default async function SettingsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your personal settings and preferences</p>
      </div>
      <UserSettingsClient userId={user.id} organizationId={organization.id} />
    </div>
  )
}
