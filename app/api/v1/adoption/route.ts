import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const accountId = searchParams.get("accountId")
      const metricType = searchParams.get("type")

      const supabase = createClient()

      let query = supabase
        .from("adoption_metrics")
        .select(`
          *,
          accounts!inner(name, organization_id)
        `)
        .eq("accounts.organization_id", context.organizationId)
        .order("recorded_at", { ascending: false })

      if (accountId) {
        query = query.eq("account_id", accountId)
      }

      if (metricType) {
        query = query.eq("metric_type", metricType)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        return createApiError("Failed to fetch adoption metrics", 500)
      }

      return createApiResponse(data)
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
      if (!body.account_id || !body.metric_type || body.value === undefined) {
        return createApiError("Account ID, metric type, and value are required", 400)
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
        .from("adoption_metrics")
        .insert({
          ...body,
          recorded_at: body.recorded_at || new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return createApiError("Failed to record adoption metric", 500)
      }

      return createApiResponse(data, 201)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
