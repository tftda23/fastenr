import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// Pricing model (edit anytime)
const PRICING = {
  TIER_A_MAX: 10,    // 1–10 seats
  TIER_B_MAX: 100,   // 11–100 seats
  PRICE_A: 3,        // £3 for 1–10
  PRICE_B: 5,        // £5 for 11–100
  PRICE_C: 4,        // £4 for 101+
  CURRENCY: "£",
  TRIAL_MONTHS: 3,   // 3-month free trial
}

function perSeatFor(seatCap: number) {
  if (seatCap <= PRICING.TIER_A_MAX) return PRICING.PRICE_A
  if (seatCap <= PRICING.TIER_B_MAX) return PRICING.PRICE_B
  return PRICING.PRICE_C
}

function planFrom(seatCap: number) {
  // purely cosmetic: "premium" vs "premium_discount"
  return seatCap > PRICING.TIER_B_MAX ? "premium_discount" : "premium"
}

function monthlyCostAfterTrial(seatCap: number) {
  const per = perSeatFor(seatCap)
  return seatCap * per
}

async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const { data: profile } = await supabase.from("user_profiles").select("role, organization_id").eq("id", user.id).single()
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }
  return { user, organizationId: profile.organization_id as string }
}

/** ---------- GET: subscription snapshot ---------- */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId") || admin.organizationId

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, seat_cap, plan, trial_ends_at, premium_addon")
      .eq("id", organizationId)
      .single()

    if (orgError) {
      console.error("Error fetching organization for GET:", orgError)
      return NextResponse.json({ 
        error: "Database migration required. Please run scripts/25_add_subscription_fields.sql first.",
        details: orgError.message 
      }, { status: 500 })
    }

    const { data: users } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("organization_id", organizationId)

    const activeUsers = users?.length ?? 0
    const seatCap = org?.seat_cap ?? PRICING.TIER_A_MAX
    const trialEndsAt = org?.trial_ends_at ?? null
    const now = new Date()
    const trialActive = trialEndsAt ? new Date(trialEndsAt) > now : false

    // Compute current plan purely from seat cap
    const plan = planFrom(seatCap)
    const perSeat = perSeatFor(seatCap)
    const monthlyAfterTrial = monthlyCostAfterTrial(seatCap)

    return NextResponse.json({
      plan,
      seatCap,
      activeUsers,
      trialEndsAt,
      trialActive,
      premiumAddon: org?.premium_addon ?? false,
      pricing: {
        currency: PRICING.CURRENCY,
        perSeat,                 // per-seat for current seatCap
        monthlyAfterTrial,       // what you'll pay after trial
        tiers: {
          a: { range: `1–${PRICING.TIER_A_MAX}`, perSeat: PRICING.PRICE_A },
          b: { range: `${PRICING.TIER_A_MAX + 1}–${PRICING.TIER_B_MAX}`, perSeat: PRICING.PRICE_B },
          c: { range: `${PRICING.TIER_B_MAX + 1}+`, perSeat: PRICING.PRICE_C },
        },
        trialMonths: PRICING.TRIAL_MONTHS,
      },
    })
  } catch (e) {
    console.error("SUB GET error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** ---------- POST: update seat cap; plan updates automatically ---------- */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const admin = await requireAdmin(supabase)
    if ("error" in admin) return admin.error

    const body = await request.json().catch(() => ({}))
    const { seatCap, organizationId, premiumAddon } = body as { seatCap?: number; organizationId?: string; premiumAddon?: boolean }
    if (!seatCap || seatCap < 1) return NextResponse.json({ error: "seatCap must be >= 1" }, { status: 400 })

    const orgId = organizationId || admin.organizationId
    const newPlan = planFrom(seatCap)

    // Get current values for audit logging
    const { data: currentOrg, error: fetchError } = await supabase
      .from("organizations")
      .select("seat_cap, plan, trial_ends_at, premium_addon")
      .eq("id", orgId)
      .single()

    if (fetchError) {
      console.error("Error fetching organization:", fetchError)
      // If columns don't exist, try without the new columns
      const { data: basicOrg, error: basicError } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("id", orgId)
        .single()
      
      if (basicError || !basicOrg) {
        console.error("Organization lookup failed:", basicError)
        return NextResponse.json({ error: "Organization not found" }, { status: 404 })
      }
      
      // Organization exists but missing subscription columns
      return NextResponse.json({ 
        error: "Database migration required. Please run scripts/25_add_subscription_fields.sql first." 
      }, { status: 500 })
    }

    if (!currentOrg) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Determine final premium addon state (auto-included for 100+ seats)
    const finalPremiumAddon = seatCap > PRICING.TIER_B_MAX ? true : (premiumAddon ?? false)

    // Update organization
    const { error } = await supabase
      .from("organizations")
      .update({ 
        seat_cap: seatCap, 
        plan: newPlan,
        premium_addon: finalPremiumAddon
      })
      .eq("id", orgId)

    if (error) {
      console.error("SUB update error:", error)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    // Log audit trail
    const auditData = {
      organization_id: orgId,
      user_id: admin.user.id,
      action: "subscription_change",
      old_values: {
        seat_cap: currentOrg.seat_cap,
        plan: currentOrg.plan,
        premium_addon: currentOrg.premium_addon
      },
      new_values: {
        seat_cap: seatCap,
        plan: newPlan,
        premium_addon: finalPremiumAddon
      },
      metadata: {
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
        user_agent: request.headers.get("user-agent")
      }
    }

    await supabase.from("subscription_audit_log").insert(auditData)

    // Create billing event
    const trialActive = currentOrg.trial_ends_at ? new Date(currentOrg.trial_ends_at) > new Date() : false
    const premiumAddonCostPerSeat = finalPremiumAddon ? (seatCap > PRICING.TIER_B_MAX ? 0 : 2) : 0
    const baseMonthlyCost = monthlyCostAfterTrial(seatCap)
    const totalMonthlyCost = baseMonthlyCost + (seatCap * premiumAddonCostPerSeat)
    
    const billingEvent = {
      organization_id: orgId,
      event_type: "subscription_change",
      seat_count: seatCap,
      plan: newPlan,
      base_cost_per_seat: perSeatFor(seatCap),
      premium_addon_cost_per_seat: premiumAddonCostPerSeat,
      total_monthly_cost: totalMonthlyCost,
      effective_date: new Date().toISOString(),
      trial_active: trialActive,
      metadata: {
        triggered_by: "admin_update",
        previous_seat_cap: currentOrg.seat_cap,
        previous_premium_addon: currentOrg.premium_addon,
        premium_addon_enabled: finalPremiumAddon
      }
    }

    await supabase.from("billing_events").insert(billingEvent)

    return NextResponse.json({
      ok: true,
      plan: newPlan,
      seatCap,
      pricing: {
        currency: PRICING.CURRENCY,
        perSeat: perSeatFor(seatCap),
        monthlyAfterTrial: monthlyCostAfterTrial(seatCap),
      },
    })
  } catch (e) {
    console.error("SUB POST error:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}