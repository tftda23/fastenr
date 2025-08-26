import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import AutomationClient from "@/components/admin/automation-client"
import { getAutomations } from "@/lib/supabase/automation.server"

export const metadata: Metadata = {
  title: "Automation - Admin | fastenr",
  description: "Manage automated workflows and triggers",
}

export default async function AdminAutomationPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  const automations = await getAutomations(organization.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
        <p className="text-muted-foreground">
          Manage automated workflows and customer success triggers
        </p>
      </div>
      <AutomationClient
        organizationId={organization.id}
        initialAutomations={automations}
      />
    </div>
  )
}
