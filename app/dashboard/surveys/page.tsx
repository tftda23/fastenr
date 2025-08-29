// app/(dashboard)/surveys/page.tsx
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCurrentUserOrganization } from "@/lib/auth"
import SurveysClient from "@/components/surveys/surveys-client"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function SurveysPage() {
  const supabase = createClient()
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) redirect("/auth/login")

  const [{ data: surveys }, { data: accounts }] = await Promise.all([
    supabase
      .from("surveys")
      .select(`
        *,
        survey_recipients(id, status)
      `)
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("accounts")
      .select("id,name")
      .eq("organization_id", organization.id)
      .order("name", { ascending: true }),
  ])

  // Add response and sent counts to surveys
  const surveysWithCounts = surveys?.map(survey => ({
    ...survey,
    sent_count: survey.survey_recipients?.length || 0,
    response_count: survey.survey_recipients?.filter((r: any) => r.status === 'responded').length || 0,
    created_by: survey.created_by
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Surveys</h1>
          <p className="text-muted-foreground">Create and manage customer surveys</p>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SurveysClient
          surveys={surveysWithCounts}
          accounts={accounts || []}
          currentUserId={user.id}
          organizationId={organization.id}
        />
      </Suspense>
    </div>
  )
}
