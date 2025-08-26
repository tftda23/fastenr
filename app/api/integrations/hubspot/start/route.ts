// app/api/integrations/hubspot/start/route.ts
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const organizationId = url.searchParams.get("organizationId")
  if (!organizationId) {
    return new NextResponse("organizationId required", { status: 400 })
  }

  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    scope: process.env.HUBSPOT_SCOPES!, // e.g. "crm.objects.companies.read crm.objects.contacts.read crm.objects.deals.read oauth"
    redirect_uri: process.env.HUBSPOT_REDIRECT_URI!, // e.g. "http://localhost:3000/api/integrations/hubspot/callback"
    state: JSON.stringify({ organizationId }),
  })

  const authUrl = `https://app.hubspot.com/oauth/authorize?${params.toString()}`
  return NextResponse.redirect(authUrl)
}
