// app/(dashboard)/surveys/page.tsx
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getCurrentUserOrganization } from "@/lib/auth"
import SurveysClient from "@/components/surveys/surveys-client"

export default async function SurveysPage() {
  const supabase = createClient()
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) redirect("/auth/login")

  const [{ data: surveys }, { data: accounts }] = await Promise.all([
    supabase
      .from("surveys")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("accounts")
      .select("id,name")
      .eq("organization_id", organization.id)
      .order("name", { ascending: true }),
  ])

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
          surveys={surveys || []}
          accounts={accounts || []}                 // <-- pass accounts
          currentUserId={user.id}
          organizationId={organization.id}
        />
      </Suspense>
    </div>
  )
}
