import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("customer_goals")
        .select(`
          *,
          accounts!inner(name, organization_id)
        `)
        .eq("id", params.id)
        .eq("accounts.organization_id", context.organizationId)
        .single()

      if (error || !data) {
        return createApiError("Goal not found", 404)
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

      // Verify goal belongs to organization
      const { data: existingGoal } = await supabase
        .from("customer_goals")
        .select(`
          id,
          accounts!inner(organization_id)
        `)
        .eq("id", params.id)
        .eq("accounts.organization_id", context.organizationId)
        .single()

      if (!existingGoal) {
        return createApiError("Goal not found", 404)
      }

      const { data, error } = await supabase.from("customer_goals").update(body).eq("id", params.id).select().single()

      if (error) {
        return createApiError("Failed to update goal", 500)
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

      // Verify goal belongs to organization
      const { data: existingGoal } = await supabase
        .from("customer_goals")
        .select(`
          id,
          accounts!inner(organization_id)
        `)
        .eq("id", params.id)
        .eq("accounts.organization_id", context.organizationId)
        .single()

      if (!existingGoal) {
        return createApiError("Goal not found", 404)
      }

      const { error } = await supabase.from("customer_goals").delete().eq("id", params.id)

      if (error) {
        return createApiError("Failed to delete goal", 500)
      }

      return createApiResponse({ message: "Goal deleted successfully" })
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
