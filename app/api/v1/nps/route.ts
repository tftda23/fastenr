import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const body = await req.json()

      // Validate required fields
      if (!body.account_id || typeof body.score !== "number" || body.score < 0 || body.score > 10) {
        return createApiError("account_id and score (0-10) are required", 400)
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
        .from("nps_surveys")
        .insert({
          ...body,
          organization_id: context.organizationId,
        })
        .select()
        .single()

      if (error) {
        return createApiError("Failed to create NPS survey", 500)
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
        .from("nps_surveys")
        .select(`
          *,
          accounts(name)
        `)
        .eq("organization_id", context.organizationId)
        .order("survey_date", { ascending: false })

      if (accountId) {
        query = query.eq("account_id", accountId)
      }

      if (startDate) {
        query = query.gte("survey_date", startDate)
      }

      if (endDate) {
        query = query.lte("survey_date", endDate)
      }

      const { data, error } = await query

      if (error) {
        return createApiError("Failed to fetch NPS surveys", 500)
      }

      return createApiResponse(data)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
