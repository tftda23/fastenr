import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const { data: profile } = await supabase.from("user_profiles").select("role, organization_id").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }
  return { user, organizationId: profile.organization_id as string }
}

/** ---------- GET: subscription audit logs and billing events ---------- */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId") || admin.organizationId
    const limit = parseInt(searchParams.get("limit") || "50")

    // Get audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from("subscription_audit_log")
      .select(`
        id,
        action,
        old_values,
        new_values,
        metadata,
        created_at,
        user_profiles!inner(email, full_name)
      `)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (auditError) {
      console.error("Audit logs error:", auditError)
    }

    // Get billing events
    const { data: billingEvents, error: billingError } = await supabase
      .from("billing_events")
      .select("*")
      .eq("organization_id", organizationId)
      .order("effective_date", { ascending: false })
      .limit(limit)

    if (billingError) {
      console.error("Billing events error:", billingError)
    }

    return NextResponse.json({
      auditLogs: auditLogs || [],
      billingEvents: billingEvents || [],
      organizationId,
    })
  } catch (e) {
    console.error("Audit GET error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}