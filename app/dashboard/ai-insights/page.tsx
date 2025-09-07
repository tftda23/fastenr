import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import FeatureGate from "@/components/feature-gate"
import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function AIInsightsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          AI Insights
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered analysis and actionable recommendations for your accounts
        </p>
      </div>

      <FeatureGate organizationId={organization.id} feature="ai_insights">
        <div className="text-center py-8">
          <p className="text-muted-foreground">AI Insights content would appear here for premium users.</p>
        </div>
      </FeatureGate>
    </div>
  )
}