import type { NextRequest } from "next/server"
import { createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

// Webhook handler for Salesforce integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (in production, you'd verify against Salesforce's signature)
    const signature = request.headers.get("x-salesforce-signature")
    if (!signature) {
      return createApiError("Missing webhook signature", 401)
    }

    // Process different Salesforce events
    const { event_type, data } = body

    const supabase = createClient()

    switch (event_type) {
      case "account.created":
      case "account.updated":
        await handleAccountSync(supabase, data)
        break

      case "opportunity.created":
      case "opportunity.updated":
        await handleOpportunitySync(supabase, data)
        break

      default:
        // Unhandled Salesforce event
    }

    return createApiResponse({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Salesforce webhook error:", error)
    return createApiError("Webhook processing failed", 500)
  }
}

async function handleAccountSync(supabase: any, data: any) {
  try {
    // Find existing account by Salesforce ID
    const { data: existingAccount } = await supabase.from("accounts").select("id").eq("salesforce_id", data.Id).single()

    const accountData = {
      name: data.Name,
      domain: data.Website,
      industry: data.Industry,
      salesforce_id: data.Id,
      // Map other Salesforce fields as needed
    }

    if (existingAccount) {
      // Update existing account
      await supabase.from("accounts").update(accountData).eq("id", existingAccount.id)
    } else {
      // Create new account (would need organization mapping logic)
      // New Salesforce account would be created
    }
  } catch (error) {
    console.error("Error syncing Salesforce account:", error)
  }
}

async function handleOpportunitySync(supabase: any, data: any) {
  try {
    // Find account by Salesforce Account ID
    const { data: account } = await supabase.from("accounts").select("id").eq("salesforce_id", data.AccountId).single()

    if (account) {
      // Create engagement record for opportunity updates
      await supabase.from("engagements").insert({
        account_id: account.id,
        organization_id: account.organization_id,
        user_id: "salesforce-sync",
        type: "note",
        title: `Salesforce Opportunity: ${data.Name}`,
        description: `Stage: ${data.StageName}, Amount: ${data.Amount}, Close Date: ${data.CloseDate}`,
        completed_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error syncing Salesforce opportunity:", error)
  }
}
