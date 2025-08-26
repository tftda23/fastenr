// app/api/integrations/hubspot/callback/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase envs missing")
  // @ts-ignore
  return createClient(url, key)
}

async function exchangeCode(code: string) {
  const res = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: process.env.HUBSPOT_REDIRECT_URI!,
      code,
    }),
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`HubSpot token exchange failed: ${res.status} ${txt}`)
  return JSON.parse(txt) as {
    access_token: string
    refresh_token: string
    expires_in: number
    hub_id: number
    scope: string
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get("code")
    const stateRaw = url.searchParams.get("state")
    if (!code || !stateRaw) throw new Error("Invalid OAuth response")

    const { organizationId } = JSON.parse(stateRaw)
    if (!organizationId) throw new Error("Missing organizationId in state")

    // Exchange code for tokens
    const t = await exchangeCode(code)
    const expiresAt = new Date(Date.now() + (t.expires_in - 60) * 1000).toISOString()
    const scopes = (t.scope || "").split(" ").filter(Boolean)

    const sb = admin()

    // Save connection
    await sb.from("integration_connections").upsert(
      {
        organization_id: organizationId,
        provider: "hubspot",
        external_account_id: String(t.hub_id),
        access_token: t.access_token,
        refresh_token: t.refresh_token,
        token_expires_at: expiresAt,
        scopes,
        status: "active",
      },
      { onConflict: "organization_id,provider" }
    )

    // Seed sync state
    const seeds = ["company", "contact", "deal"].map((object_type) => ({
      organization_id: organizationId,
      provider: "hubspot",
      object_type,
      phase: "initial",
    }))
    await sb.from("integration_sync_state").upsert(seeds, {
      onConflict: "organization_id,provider,object_type",
    })

    // ✅ Redirect back to dashboard integrations page
    const base = process.env.APP_BASE_URL ?? "http://localhost:3000"
    return NextResponse.redirect(
      new URL(`/dashboard/admin/integrations?connected=hubspot`, base)
    )
  } catch (e: any) {
    console.error("HubSpot callback error:", e)
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}
