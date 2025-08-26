// app/dashboard/engagements/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { checkUserPermission } from "@/lib/supabase/queries"
import EngagementForm from "@/components/engagements/engagement-form"

export const dynamic = "force-dynamic"

export default async function EditEngagementPage({ params }: { params: { id: string } }) {
  if (params.id === "new") redirect("/dashboard/engagements/new")

  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return notFound()

  const canEdit = await checkUserPermission("read_write")
  if (!canEdit) return notFound()

  // fetch the engagement
  const { data: engagement, error } = await supabase
    .from("engagements")
    .select("*")
    .eq("id", params.id)
    .maybeSingle()

  if (error || !engagement) return notFound()

  // Normalise datetime strings (ensure 'YYYY-MM-DDTHH:mm' shape for the form)
  const normalise = (dt: string | null) =>
    dt ? new Date(dt).toISOString().slice(0, 16) : ""

  const hydrated = {
    ...engagement,
    scheduled_at: normalise(engagement.scheduled_at),
    completed_at: normalise(engagement.completed_at),
    // keep attendees as array for initial JSON.stringify in your form
    attendees: engagement.attendees ?? [],
  }

  return (
    <div className="space-y-6">
      <EngagementForm engagement={hydrated as any} isEditing />
    </div>
  )
}
