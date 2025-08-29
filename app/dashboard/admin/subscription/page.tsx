import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import SubscriptionClient from "@/components/admin/subscription-client"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Subscription - Admin | fastenr",
  description: "Manage organization subscription and billing",
}

export default async function AdminSubscriptionPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your organization's subscription and billing</p>
      </div>
      <SubscriptionClient organizationId={organization.id} />
    </div>
  )
}
