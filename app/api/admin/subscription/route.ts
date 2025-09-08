import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

// Pricing model (edit anytime)
const PRICING = {
  TIER_B_MAX: 99,    // Up to 99 seats get base pricing
  BASE_PRICE: 25,    // £25 base price per user (all tiers)
  ENTERPRISE_PRICE: 35, // £35 for 100+ (premium included)
  PREMIUM_ADDON: 15, // £15 premium add-on per user (makes total £40)
  CURRENCY: "£",
  TRIAL_MONTHS: 1,   // 1-month free trial
  MIN_SEATS: 5,      // Minimum 5 seats for all plans
}

function perSeatFor(seatCap: number) {
  if (seatCap <= PRICING.TIER_B_MAX) return PRICING.BASE_PRICE
  return PRICING.ENTERPRISE_PRICE // 101+ gets enterprise pricing with premium included
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
    const seatCap = org?.seat_cap ?? PRICING.MIN_SEATS
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
          a: { range: `${PRICING.MIN_SEATS}–${PRICING.TIER_B_MAX}`, perSeat: PRICING.BASE_PRICE },
          b: { range: `${PRICING.TIER_B_MAX + 1}+`, perSeat: PRICING.ENTERPRISE_PRICE },
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
    if (!seatCap || seatCap < PRICING.MIN_SEATS) return NextResponse.json({ error: `seatCap must be >= ${PRICING.MIN_SEATS}` }, { status: 400 })

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

    // Check if this is a license change and if it's allowed
    if (currentOrg.seat_cap !== seatCap) {
      try {
        // Try to use the database function first
        const { data: canChange, error: canChangeError } = await supabase.rpc('can_change_license', { org_id: orgId })
        
        if (canChangeError) {
          // Fallback to manual check if function doesn't exist
          console.log('Using fallback license change validation:', canChangeError.message)
          
          // Get current billing period manually
          const currentMonth = new Date()
          const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
          
          // Check for existing license changes this period
          const { data: existingChanges } = await supabase
            .from('billing_events')
            .select('id')
            .eq('organization_id', orgId)
            .eq('is_license_change', true)
            .gte('effective_date', periodStart.toISOString())
            .lte('effective_date', periodEnd.toISOString())
          
          if (existingChanges && existingChanges.length >= 1) {
            return NextResponse.json({ 
              error: "License change not allowed: Maximum one change per billing period" 
            }, { status: 400 })
          }
        } else if (!canChange) {
          return NextResponse.json({ 
            error: "License change not allowed: Maximum one change per billing period" 
          }, { status: 400 })
        }

        // Record the license change
        try {
          await supabase.rpc('record_license_change', {
            org_id: orgId,
            old_seat_count: currentOrg.seat_cap,
            new_seat_count: seatCap,
            user_id: admin.user.id
          })
        } catch (recordError) {
          // Fallback to manual recording
          console.log('Using fallback license change recording:', recordError instanceof Error ? recordError.message : String(recordError))
          
          // Create billing event manually
          await supabase.from('billing_events').insert({
            organization_id: orgId,
            event_type: 'license_change',
            seat_count: seatCap,
            previous_seat_count: currentOrg.seat_cap,
            is_license_change: true,
            change_effective_date: new Date().toISOString().split('T')[0],
            plan: newPlan,
            base_cost_per_seat: seatCap <= PRICING.TIER_B_MAX ? PRICING.BASE_PRICE : PRICING.ENTERPRISE_PRICE,
            total_monthly_cost: seatCap * (seatCap <= PRICING.TIER_B_MAX ? PRICING.BASE_PRICE : PRICING.ENTERPRISE_PRICE),
            effective_date: new Date().toISOString(),
            metadata: {
              changed_by: admin.user.id,
              old_seat_count: currentOrg.seat_cap,
              new_seat_count: seatCap,
              change_reason: 'admin_update'
            }
          })
        }
      } catch (licenseError) {
        console.error("License change validation error:", licenseError)
        return NextResponse.json({ 
          error: "Failed to validate license change" 
        }, { status: 500 })
      }
    }

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
    const premiumAddonCostPerSeat = finalPremiumAddon ? (seatCap > PRICING.TIER_B_MAX ? 0 : PRICING.PREMIUM_ADDON) : 0
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