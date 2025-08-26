import { NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function base64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function genCodeVerifier() {
  // 43–128 chars per RFC 7636
  return base64url(crypto.randomBytes(32))
}

function toS256Challenge(verifier: string) {
  const hash = crypto.createHash("sha256").update(verifier).digest()
  return base64url(hash)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const organizationId = url.searchParams.get("organizationId")
  if (!organizationId) {
    return NextResponse.json({ ok: false, error: "organizationId required" }, { status: 400 })
  }

  const clientId = process.env.SALESFORCE_CLIENT_ID
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI
  const base = process.env.SALESFORCE_LOGIN_BASE || "https://login.salesforce.com"
  if (!clientId || !redirectUri) {
    return NextResponse.json({ ok: false, error: "Salesforce env vars missing" }, { status: 500 })
  }

  const state = `${crypto.randomBytes(16).toString("hex")}:${organizationId}`
  const codeVerifier = genCodeVerifier()
  const codeChallenge = toS256Challenge(codeVerifier)

  const authUrl = new URL(base + "/services/oauth2/authorize")
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", "api refresh_token offline_access openid email profile")
  authUrl.searchParams.set("state", state)
  authUrl.searchParams.set("code_challenge", codeChallenge)
  authUrl.searchParams.set("code_challenge_method", "S256")

  const res = NextResponse.redirect(authUrl.toString())
  // Store verifier + state for 10 minutes (httpOnly)
  res.cookies.set("sf_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" })
  res.cookies.set("sf_pkce_verifier", codeVerifier, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" })
  return res
}
