"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Users, CheckCircle2, Info, AlertTriangle, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface SubscriptionClientProps {
  organizationId: string
}

type PlanType = "premium" | "premium_discount" | string

interface Snapshot {
  plan: PlanType
  seatCap: number
  activeUsers: number
  trialEndsAt: string | null
  trialActive: boolean
  premiumAddon: boolean
  pricing: {
    currency: string
    perSeat: number               // base per-seat for current seatCap (no add-on)
    monthlyAfterTrial: number     // base monthly (no add-on)
    tiers: {
      a: { range: string; perSeat: number }  // 1–10
      b: { range: string; perSeat: number }  // 11–100
      c: { range: string; perSeat: number }  // 101+
    }
    trialMonths: number
  }
}

const PREMIUM_ADDON_PER_SEAT = 15 // £15/user add-on when <100 seats; included (free) at 100+

export default function SubscriptionClient({ organizationId }: SubscriptionClientProps) {
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSeats, setNewSeats] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [premiumAddon, setPremiumAddon] = useState<boolean>(false)

  useEffect(() => {
    void load()
  }, [organizationId])

  // Debounced validation for input
  useEffect(() => {
    const timer = setTimeout(() => {
      const numValue = parseInt(inputValue) || 0
      if (inputValue && numValue < 5) {
        setValidationMessage("5 minimum seat license")
        setNewSeats(null)
      } else if (inputValue && numValue >= 5) {
        setValidationMessage("")
        setNewSeats(numValue)
      } else {
        setValidationMessage("")
        setNewSeats(null)
      }
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [inputValue])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty input or valid numbers
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value)
    }
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/subscription?organizationId=${organizationId}`, { cache: "no-store" })
      const data = await res.json()
      if (res.ok) {
        setSnap(data)
        setNewSeats(data.seatCap)
        setInputValue(data.seatCap.toString())
        // Use the premium addon state from the database, or default based on seat count
        setPremiumAddon(data.premiumAddon ?? ((data.seatCap ?? 0) >= 100))
      } else {
        console.error(data.error || "Failed to load subscription")
      }
    } finally {
      setLoading(false)
    }
  }

  async function saveSeatCap() {
    if (!newSeats || newSeats < 5) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          seatCap: newSeats, 
          organizationId,
          premiumAddon: premiumAddon
        }),
      })
      const data = await res.json()
      if (res.ok) {
        await load()
      } else {
        alert(data.error || "Failed to update subscription")
      }
    } finally {
      setSaving(false)
    }
  }

  // Local preview for edited seat cap and add-on toggle
  const preview = useMemo(() => {
    if (!snap) return null
    const seats = Math.max(5, newSeats ?? snap.seatCap)
    const { a, b, c } = snap.pricing.tiers

    const aMax = parseInt(a.range.split("–")[1] || "100")
    const bMax = 100 // Premium included at 100+ seats

    let basePerSeat = a.perSeat
    if (seats >= bMax) basePerSeat = b?.perSeat || a.perSeat

    const inDiscountBand = seats >= bMax
    const addonIncluded = inDiscountBand // premium included at 100+
    const addonEnabled = addonIncluded ? true : premiumAddon

    const addonPerSeat = addonIncluded ? 0 : (addonEnabled ? PREMIUM_ADDON_PER_SEAT : 0)

    const baseMonthly = seats * basePerSeat
    const monthlyWithAddon = baseMonthly + seats * addonPerSeat

    const plan: PlanType = inDiscountBand ? "premium_discount" : "premium"
    return {
      seats,
      basePerSeat,
      baseMonthly,
      addonPerSeat,
      addonEnabled,
      monthlyWithAddon,
      inDiscountBand,
      plan,
      currency: snap.pricing.currency,
    }
  }, [snap, newSeats, premiumAddon])

  if (loading || !snap || !preview) {
    return (
      <div className="space-y-6">
        {/* Current subscription skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
          </CardContent>
        </Card>
        
        {/* Two-column skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Seat cap skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-40" />
              </div>
              <div className="rounded-md border p-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
          
          {/* Cost summary skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Loading spinner in center */}
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const seatBarPct = Math.min(100, (snap.activeUsers / Math.max(1, snap.seatCap)) * 100)
  const willBeOverage = preview.seats < snap.activeUsers
  const planLabel = (p: PlanType) => {
    if (p === "premium_discount") return "Enterprise (100+ seats)"
    if (p === "premium") return "Standard (5-99 seats)"
    return "Standard"
  }

  return (
    <div className="space-y-6">
      {/* Current subscription */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Current subscription</span>
            <div className="flex items-center gap-2">
              <Badge className="cursor-default hover:bg-inherit hover:text-inherit">
                <CreditCard className="h-3.5 w-3.5 mr-1" />
                {planLabel(snap.plan)}
              </Badge>
              <Badge variant="outline" className="cursor-default hover:bg-inherit hover:text-inherit">
                {snap.pricing.currency}{snap.pricing.monthlyAfterTrial}/mo <span className="text-muted-foreground ml-1">(after trial)</span>
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Seat‑based pricing with a {snap.pricing.trialMonths}-month free trial (minimum 5 seats){snap.trialActive && snap.trialEndsAt ? ` until ${new Date(snap.trialEndsAt).toLocaleDateString()}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Active users</div>
            <div className="text-lg font-semibold">{snap.activeUsers} / {snap.seatCap} seats</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${seatBarPct}%` }} />
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Per‑user (base)</div>
            <div className="text-lg font-semibold">{snap.pricing.currency}{snap.pricing.perSeat} / user</div>
            <div className="text-xs text-muted-foreground mt-1">Billed after trial ends</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Base after‑trial monthly</div>
            <div className="text-lg font-semibold">{snap.pricing.currency}{snap.pricing.monthlyAfterTrial} / month</div>
            {snap.trialActive && (
              <div className="text-xs text-green-700 mt-1 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Trial active — you won’t be charged yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Seat cap (left) & Cost summary (right) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Seat cap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Seat cap
            </CardTitle>
            <CardDescription>Type the number of seats you need (minimum 5). Premium features are included automatically at 100+ seats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Seats</label>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                className="w-40"
                type="text"
                placeholder="Enter seats"
              />
              {validationMessage && (
                <div className="text-sm text-amber-600 mt-1">{validationMessage}</div>
              )}
            </div>

            {/* Premium add-on toggle */}
            <div className="rounded-md border p-3 flex items-start justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Premium add‑on</div>
                <div className="text-muted-foreground">
                  AI insights, automation, surveys & advanced analytics. <span className="font-medium">Included at 100+ seats.</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preview.inDiscountBand ? (
                  <Badge className="cursor-default">Included</Badge>
                ) : (
                  <Badge variant="outline" className="cursor-default">{snap.pricing.currency}{PREMIUM_ADDON_PER_SEAT}/user</Badge>
                )}
                <Switch
                  checked={preview.addonEnabled}
                  onCheckedChange={(v) => setPremiumAddon(v)}
                  disabled={preview.inDiscountBand}
                />
              </div>
            </div>

            {/* Overage warning */}
            {willBeOverage && (
              <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-rose-900 text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <div>Active users: {snap.activeUsers}. Seat cap must be at least {Math.max(5, snap.activeUsers)}.</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost summary */}
        <Card>
          <CardHeader>
            <CardTitle>Cost summary</CardTitle>
            <CardDescription>We show after‑trial pricing so there are no surprises.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Seat cap (after saving)" value={`${preview.seats} seats`} />
            <Row label="Plan" value={planLabel(preview.plan)} />
            <Row label="Per‑user (base)" value={`${preview.currency}${preview.basePerSeat}`} />
            <Row label="Base after‑trial monthly" value={`${preview.currency}${preview.baseMonthly}`} />

            <div className="h-px bg-border my-2" />

            <Row label="Premium add‑on" value={preview.addonEnabled ? (preview.inDiscountBand ? "Included at 100+" : `${preview.currency}${PREMIUM_ADDON_PER_SEAT}/user`) : "Not added"} />
            <Row label="Monthly with add‑on" value={`${preview.currency}${preview.monthlyWithAddon}`} strong />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={saveSeatCap} disabled={saving || willBeOverage || (newSeats ?? 0) < 5}>
          {willBeOverage ? "Increase seats to save" : (newSeats ?? 0) < 5 ? "Minimum 5 seats required" : (saving ? "Saving…" : "Save changes")}
        </Button>
      </div>

      {/* Promo block */}
      <Card>
        <CardHeader>
          <CardTitle>Why Premium?</CardTitle>
          <CardDescription>Power features that scale with your team — discounted at 101+ seats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Feature>Advanced permissions (read, write, admin)</Feature>
          <Feature>Invites & user lifecycle controls</Feature>
          <Feature>Priority support & higher limits</Feature>
          <Feature>Audit trails & API automation</Feature>
          <div className="rounded-md border p-3 mt-2 text-muted-foreground flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5" />
            <div>
              Premium features are **included** for teams with 100+ seats. Below 100 seats, you can toggle it on or off anytime.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---- tiny presentational helpers ---- */

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" /> <span>{children}</span></div>
}