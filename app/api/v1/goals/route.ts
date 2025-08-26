import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const accountId = searchParams.get("accountId")
      const status = searchParams.get("status")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)

      const supabase = createClient()
      const offset = (page - 1) * limit

      let query = supabase
        .from("customer_goals")
        .select(
          `
          *,
          accounts!inner(name, organization_id)
        `,
          { count: "exact" },
        )
        .eq("accounts.organization_id", context.organizationId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (accountId) {
        query = query.eq("account_id", accountId)
      }

      if (status) {
        query = query.eq("status", status)
      }

      const { data, error, count } = await query

      if (error) {
        return createApiError("Failed to fetch goals", 500)
      }

      return createApiResponse({
        goals: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: (count || 0) > offset + limit,
        },
      })
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}

export async function POST(request: NextRequest) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const body = await req.json()

      // Validate required fields
      if (!body.account_id || !body.title || !body.target_date) {
        return createApiError("Account ID, title, and target date are required", 400)
      }

      const supabase = createClient()

      // Verify account belongs to organization
      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", body.account_id)
        .eq("organization_id", context.organizationId)
        .single()

      if (!account) {
        return createApiError("Account not found", 404)
      }

      const { data, error } = await supabase
        .from("customer_goals")
        .insert({
          ...body,
          status: body.status || "on_track",
        })
        .select()
        .single()

      if (error) {
        return createApiError("Failed to create goal", 500)
      }

      return createApiResponse(data, 201)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
