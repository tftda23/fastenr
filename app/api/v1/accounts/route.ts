import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100) // Max 100 per page
      const search = searchParams.get("search")
      const status = searchParams.get("status")

      const supabase = createClient()
      const offset = (page - 1) * limit

      let query = supabase
        .from("accounts")
        .select("*", { count: "exact" })
        .eq("organization_id", context.organizationId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`)
      }

      if (status) {
        query = query.eq("status", status)
      }

      const { data, error, count } = await query

      if (error) {
        return createApiError("Failed to fetch accounts", 500)
      }

      return createApiResponse({
        accounts: data,
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
      if (!body.name) {
        return createApiError("Account name is required", 400)
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("accounts")
        .insert({
          ...body,
          organization_id: context.organizationId,
        })
        .select()
        .single()

      if (error) {
        return createApiError("Failed to create account", 500)
      }

      return createApiResponse(data, 201)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
