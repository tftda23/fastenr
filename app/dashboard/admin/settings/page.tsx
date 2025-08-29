import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import AppSettingsClient from "@/components/admin/app-settings-client"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "App Settings - Admin | fastenr",
  description: "Manage application settings and configuration",
}

export default async function AdminSettingsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
        <p className="text-muted-foreground">Configure application settings and preferences</p>
      </div>
      <AppSettingsClient organizationId={organization.id} />
    </div>
  )
}
