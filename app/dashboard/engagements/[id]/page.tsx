import { checkUserPermission } from "@/lib/supabase/queries"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import EngagementDetails from "@/components/engagements/engagement-details"

export const dynamic = "force-dynamic"

export default async function EngagementDetailsPage({ params }: { params: { id: string } }) {
  if (params.id === "new") {
    redirect("/dashboard/engagements/new")
  }

  try {
    const supabase = createClient()

    // ✅ get logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) return notFound()

    // ✅ fetch engagement by ID
    const { data: engagement, error } = await supabase
      .from("engagements")
      .select("*")
      .eq("id", params.id)
      .maybeSingle()

    if (error || !engagement) {
      // console.error("Engagement fetch error:", error)
      return notFound()
    }

    // ✅ permissions
    const [canEdit, canDelete] = await Promise.all([
      checkUserPermission("read_write"),
      checkUserPermission("read_write_delete"),
    ])

    return (
      <EngagementDetails
        engagement={engagement}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    )
  } catch (err) {
    // console.error("[EngagementDetailsPage] Unexpected error:", err)
    return notFound()
  }
}
