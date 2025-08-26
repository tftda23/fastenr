import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const body = await req.json()

      // Validate required fields
      if (!body.account_id) {
        return createApiError("account_id is required", 400)
      }

      // Verify account belongs to organization
      const supabase = createClient()
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
        .from("health_metrics")
        .insert({
          ...body,
          organization_id: context.organizationId,
        })
        .select()
        .single()

      if (error) {
        return createApiError("Failed to create health metric", 500)
      }

      return createApiResponse(data, 201)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const accountId = searchParams.get("account_id")
      const startDate = searchParams.get("start_date")
      const endDate = searchParams.get("end_date")

      const supabase = createClient()

      let query = supabase
        .from("health_metrics")
        .select(`
          *,
          accounts(name)
        `)
        .eq("organization_id", context.organizationId)
        .order("metric_date", { ascending: false })

      if (accountId) {
        query = query.eq("account_id", accountId)
      }

      if (startDate) {
        query = query.gte("metric_date", startDate)
      }

      if (endDate) {
        query = query.lte("metric_date", endDate)
      }

      const { data, error } = await query

      if (error) {
        return createApiError("Failed to fetch health metrics", 500)
      }

      return createApiResponse(data)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
