import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server" // or your admin client

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const err = url.searchParams.get("error")
  const errDesc = url.searchParams.get("error_description")

  if (err) {
    return NextResponse.json({ ok: false, error: `${err}: ${errDesc || ""}` }, { status: 400 })
  }
  if (!code || !state) {
    return NextResponse.json({ ok: false, error: "Missing code/state" }, { status: 400 })
  }

  const cookieStore = cookies()
  const cookieState = cookieStore.get("sf_oauth_state")?.value
  const codeVerifier = cookieStore.get("sf_pkce_verifier")?.value
  if (!cookieState || cookieState !== state) {
    return NextResponse.json({ ok: false, error: "State mismatch" }, { status: 400 })
  }
  if (!codeVerifier) {
    return NextResponse.json({ ok: false, error: "Missing PKCE verifier cookie" }, { status: 400 })
  }

  const [, organizationId] = state.split(":")
  if (!organizationId) {
    return NextResponse.json({ ok: false, error: "Bad state" }, { status: 400 })
  }

  const tokenUrl = (process.env.SALESFORCE_LOGIN_BASE || "https://login.salesforce.com") + "/services/oauth2/token"
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.SALESFORCE_CLIENT_ID || "",
    client_secret: process.env.SALESFORCE_CLIENT_SECRET || "",
    redirect_uri: process.env.SALESFORCE_REDIRECT_URI || "",
    code_verifier: codeVerifier, // <-- PKCE
  })

  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  if (!resp.ok) {
    const txt = await resp.text()
    return NextResponse.json({ ok: false, error: `Token exchange failed: ${txt}` }, { status: 400 })
  }

  const json = await resp.json()
  const { access_token, refresh_token, instance_url } = json

  // token expiry: set ~110 minutes from now (Salesforce access tokens are short-lived)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 110).toISOString()

  const supabase = createClient()
  const { error } = await supabase.from("integration_connections").upsert(
    {
      organization_id: organizationId,
      provider: "salesforce",
      status: "connected",
      access_token,
      refresh_token,
      instance_url,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id,provider" } as any
  )
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // Clear cookies after use
  const res = NextResponse.redirect("/integrations")
  res.cookies.set("sf_oauth_state", "", { maxAge: 0, path: "/" })
  res.cookies.set("sf_pkce_verifier", "", { maxAge: 0, path: "/" })
  return res
}
