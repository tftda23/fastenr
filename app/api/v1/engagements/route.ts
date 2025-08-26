import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)
      const accountId = searchParams.get("account_id")
      const type = searchParams.get("type")

      const supabase = createClient()
      const offset = (page - 1) * limit

      // Select only fields the UI actually uses + joined data
      let query = supabase
        .from("engagements")
        .select(
          `
          id,
          organization_id,
          account_id,
          user_id,
          type,
          title,
          description,
          outcome,
          created_at,
          completed_at,
          scheduled_at,
          duration_minutes,
          accounts:accounts (
            id,
            name,
            churn_risk_score,
            arr
          ),
          created_by_profile:user_profiles (
            full_name
          )
        `,
          { count: "exact" },
        )
        .eq("organization_id", context.organizationId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (accountId) {
        query = query.eq("account_id", accountId)
      }
      if (type) {
        query = query.eq("type", type)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Supabase error (GET engagements):", error)
        return createApiError("Failed to fetch engagements", 500)
      }

      // Normalise possible numeric strings -> numbers so client filters work
      const engagements = (data ?? []).map((e: any) => {
        const acc = e.accounts ?? null
        return {
          ...e,
          accounts: acc
            ? {
                ...acc,
                churn_risk_score:
                  acc.churn_risk_score === null || acc.churn_risk_score === undefined
                    ? null
                    : Number(acc.churn_risk_score),
                arr:
                  acc.arr === null || acc.arr === undefined
                    ? null
                    : Number(acc.arr),
              }
            : null,
        }
      })

      return createApiResponse({
        engagements,
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
      if (!body.account_id || !body.type || !body.title) {
        return createApiError("account_id, type, and title are required", 400)
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
        .from("engagements")
        .insert({
          ...body,
          organization_id: context.organizationId,
          user_id: "api-user", // Special user ID for API-created engagements
        })
        .select(
          `
          id,
          organization_id,
          account_id,
          user_id,
          type,
          title,
          description,
          outcome,
          created_at,
          completed_at,
          scheduled_at,
          duration_minutes,
          accounts:accounts (
            id,
            name,
            churn_risk_score,
            arr
          ),
          created_by_profile:user_profiles (
            full_name
          )
        `,
        )
        .single()

      if (error) {
        console.error("Supabase error (POST engagements):", error)
        return createApiError("Failed to create engagement", 500)
      }

      // Normalise numeric fields on response too
      const acc = (data as any)?.accounts ?? null
      const engagement =
        acc
          ? {
              ...data,
              accounts: {
                ...acc,
                churn_risk_score:
                  acc.churn_risk_score === null || acc.churn_risk_score === undefined
                    ? null
                    : Number(acc.churn_risk_score),
                arr:
                  acc.arr === null || acc.arr === undefined
                    ? null
                    : Number(acc.arr),
              },
            }
          : data

      return createApiResponse(engagement, 201)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
