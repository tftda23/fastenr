import type { NextRequest } from "next/server"
import { createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify HubSpot webhook signature (in production, verify the signature)
    const hubspotSignature = request.headers.get("x-hubspot-signature-v3")
    if (!hubspotSignature) {
      return createApiError("Missing HubSpot signature", 401)
    }

    // Process HubSpot webhook events
    for (const event of body) {
      if (event.subscriptionType === "company.propertyChange") {
        await handleCompanyUpdate(event)
      } else if (event.subscriptionType === "contact.propertyChange") {
        await handleContactUpdate(event)
      }
    }

    return createApiResponse({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("HubSpot webhook error:", error)
    return createApiError("Failed to process webhook", 500)
  }
}

async function handleCompanyUpdate(event: any) {
  const supabase = createClient()

  // Map HubSpot company to our account
  const hubspotCompanyId = event.objectId
  const properties = event.propertyName

  // Update account based on HubSpot data
  const { error } = await supabase
    .from("accounts")
    .update({
      // Map HubSpot properties to our schema
      external_id: hubspotCompanyId,
      last_sync: new Date().toISOString(),
    })
    .eq("external_id", hubspotCompanyId)

  if (error) {
    console.error("Failed to update account from HubSpot:", error)
  }
}

async function handleContactUpdate(event: any) {
  // Handle contact updates if needed
  // Contact update received
}
