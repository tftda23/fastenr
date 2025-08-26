import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import IntegrationsClient from "@/components/admin/integrations-client"

export const metadata: Metadata = {
  title: "Integrations - Admin | fastenr",
  description: "Manage third-party integrations and API connections",
}

export default async function AdminIntegrationsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Manage third-party integrations and API connections</p>
      </div>
      <IntegrationsClient organizationId={organization.id} />
    </div>
  )
}
