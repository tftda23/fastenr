import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const { accounts } = await req.json()

      if (!Array.isArray(accounts) || accounts.length === 0) {
        return createApiError("Accounts array is required", 400)
      }

      if (accounts.length > 100) {
        return createApiError("Maximum 100 accounts per bulk operation", 400)
      }

      // Validate each account
      for (const account of accounts) {
        if (!account.name) {
          return createApiError("All accounts must have a name", 400)
        }
      }

      const supabase = createClient()

      // Add organization_id to each account
      const accountsWithOrg = accounts.map((account) => ({
        ...account,
        organization_id: context.organizationId,
      }))

      const { data, error } = await supabase.from("accounts").insert(accountsWithOrg).select()

      if (error) {
        return createApiError("Failed to create accounts", 500)
      }

      return createApiResponse(
        {
          created: data.length,
          accounts: data,
        },
        201,
      )
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}

export async function PUT(request: NextRequest) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const { updates } = await req.json()

      if (!Array.isArray(updates) || updates.length === 0) {
        return createApiError("Updates array is required", 400)
      }

      if (updates.length > 100) {
        return createApiError("Maximum 100 updates per bulk operation", 400)
      }

      const supabase = createClient()
      const results = []

      // Process updates in batches
      for (const update of updates) {
        if (!update.id) {
          continue
        }

        const { data, error } = await supabase
          .from("accounts")
          .update(update)
          .eq("id", update.id)
          .eq("organization_id", context.organizationId)
          .select()
          .single()

        if (!error && data) {
          results.push(data)
        }
      }

      return createApiResponse({
        updated: results.length,
        accounts: results,
      })
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
