import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", params.id)
        .eq("organization_id", context.organizationId)
        .single()

      if (error || !data) {
        return createApiError("Account not found", 404)
      }

      return createApiResponse(data)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withApiAuth(request, "write", async (req, context) => {
    try {
      const body = await req.json()

      const supabase = createClient()
      const { data, error } = await supabase
        .from("accounts")
        .update(body)
        .eq("id", params.id)
        .eq("organization_id", context.organizationId)
        .select()
        .single()

      if (error || !data) {
        return createApiError("Account not found or update failed", 404)
      }

      return createApiResponse(data)
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withApiAuth(request, "delete", async (req, context) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", params.id)
        .eq("organization_id", context.organizationId)

      if (error) {
        return createApiError("Account not found or delete failed", 404)
      }

      return createApiResponse({ message: "Account deleted successfully" })
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
