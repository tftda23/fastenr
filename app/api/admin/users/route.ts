import { type NextRequest, NextResponse } from "next/server"
import { sendInvitationEmail, EmailRecipient, InvitationEmailData } from "@/lib/email"
import { createServerClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

const ROLE_SET = new Set(["read", "write", "admin"])

/** ---------- Helpers ---------- */

async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const { data: profile } = await supabase.from("user_profiles").select("role, organization_id").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }
  return { user, organizationId: profile.organization_id as string }
}

function planPricing(plan: string, seatCap: number) {
  // Centralised pricing
  const TRIAL_FREE_SEATS = 10
  const PREMIUM_PRICE_PER_USER = 6   // £6 / seat / mo for 11–100
  const PREMIUM_DISCOUNT_PRICE = 4   // £4 / seat / mo for 101+
  const currency = "£"

  let perSeat = 0
  if (plan === "free_trial") {
    perSeat = 0
  } else if (plan === "premium") {
    perSeat = PREMIUM_PRICE_PER_USER
  } else if (plan === "premium_discount") {
    perSeat = PREMIUM_DISCOUNT_PRICE
  }

  const monthly = plan === "free_trial"
    ? 0
    : (seatCap * perSeat)

  return { currency, monthly, perSeat, trialFreeSeats: TRIAL_FREE_SEATS }
}

/** ---------- GET: list users (and usage) ---------- */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId") || admin.organizationId

    // Users
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("id, full_name, email, role, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Org subscription snapshot
    const { data: org } = await supabase
      .from("organizations")
      .select("id, seat_cap, plan, trial_ends_at")
      .eq("id", organizationId)
      .single()

    const activeUsers = users?.length ?? 0
    const seatCap = org?.seat_cap ?? 10
    const plan = org?.plan ?? "free_trial"
    const pricing = planPricing(plan, seatCap)

    return NextResponse.json({
      users,
      usage: {
        activeUsers,
        seatCap,
        plan,
        trialEndsAt: org?.trial_ends_at ?? null,
        pricing,
      },
    })
  } catch (e) {
    console.error("Error in admin users GET:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** ---------- POST: invite user (returns a copyable link) ---------- */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const body = await request.json().catch(() => ({}))
    const { email, role = "read", organizationId } = body as { email?: string; role?: string; organizationId?: string }

    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })
    if (!ROLE_SET.has(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 })

    const orgId = organizationId || admin.organizationId

    // Enforce seat cap on *accept*, not invite; but we can do a soft warning by reading counts now
    const { data: users } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("organization_id", orgId)

    const { data: org } = await supabase
      .from("organizations")
      .select("seat_cap")
      .eq("id", orgId)
      .single()

    const current = users?.length ?? 0
    const seatCap = org?.seat_cap ?? 10
    const softWillExceed = current + 1 > seatCap

    // Create token and store invitation
    const token = randomBytes(24).toString("hex")
    const { data: inv, error: invErr } = await supabase
      .from("org_invitations")
      .insert({
        organization_id: orgId,
        email,
        role,
        token,
        created_by: admin.user!.id,
      })
      .select("id, token")
      .single()

    if (invErr) {
      console.error("Invite insert error:", invErr)
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
    }

    // Create invitation link
    const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite?token=${inv.token}`

    // Get organization details for email
    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .single()

    // Send invitation email
    try {
      const emailRecipient: EmailRecipient = {
        email: email,
        name: email.split('@')[0] // Use email prefix as fallback name
      }

      const invitationData: InvitationEmailData = {
        organizationName: organization?.name || 'Organization',
        role: role,
        inviteUrl: link
      }

      await sendInvitationEmail(
        emailRecipient,
        invitationData,
        process.env.EMAIL_FROM_NOTIFICATIONS || 'invitations@yourdomain.com',
        process.env.EMAIL_FROM_NAME || 'Customer Success Platform'
      )
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError)
      // Don't fail the invitation creation if email fails
    }

    return NextResponse.json({ ok: true, link, softWillExceed })
  } catch (e) {
    console.error("Error in admin users POST:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** ---------- PATCH: change a user's role ---------- */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { userId, role } = await request.json()
    if (!userId || !ROLE_SET.has(role)) {
      return NextResponse.json({ error: "userId and valid role required" }, { status: 400 })
    }

    // Cannot demote yourself out of admin (safety)
    const { data: me } = await supabase.auth.getUser()
    if (me?.user?.id === userId && role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 })
    }

    const { error } = await supabase.from("user_profiles").update({ role }).eq("id", userId)
    if (error) {
      console.error("Role update error:", error)
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Error in admin users PATCH:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** ---------- DELETE: remove a user from org ---------- */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // Prevent deleting self
    const { data: me } = await supabase.auth.getUser()
    if (me?.user?.id === userId) {
      return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 })
    }

    // Soft delete: clear org and role (or implement a real membership table)
    const { error } = await supabase.from("user_profiles").update({
      organization_id: null,
      role: "read",
    }).eq("id", userId)

    if (error) {
      console.error("Remove user error:", error)
      return NextResponse.json({ error: "Failed to remove user" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("Error in admin users DELETE:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}