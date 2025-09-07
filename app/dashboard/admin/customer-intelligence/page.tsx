import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { CustomerIntelligenceClient } from "@/components/admin/customer-intelligence-client"
import { redirect } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function CustomerIntelligencePage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customer Intelligence</h1>
        <p className="text-muted-foreground">
          Configure health scoring, churn risk calculations, and analytics settings.
        </p>
      </div>

      <CustomerIntelligenceClient organizationId={organization.id} />
    </div>
  )
}