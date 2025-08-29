import type { NextRequest } from "next/server"
import { withApiAuth, createApiResponse, createApiError } from "@/lib/api-middleware"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return withApiAuth(request, "read", async (req, context) => {
    try {
      const supabase = createClient()

      // Get dashboard statistics
      const [
        { count: totalAccounts },
        { count: activeAccounts },
        { count: atRiskAccounts },
        { count: totalEngagements },
        { data: recentNps },
        { data: churnRiskAccounts },
      ] = await Promise.all([
        // Total accounts
        supabase
          .from("accounts")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", context.organizationId),

        // Active accounts
        supabase
          .from("accounts")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", context.organizationId)
          .eq("status", "active"),

        // At-risk accounts (churn risk > 70)
        supabase
          .from("accounts")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", context.organizationId)
          .gt("churn_risk_score", 70),

        // Total engagements this month
        supabase
          .from("engagements")
          .select(
            `
            *,
            accounts!inner(organization_id)
          `,
            { count: "exact", head: true },
          )
          .eq("accounts.organization_id", context.organizationId)
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

        // Recent NPS scores
        supabase
          .from("nps_surveys")
          .select(`
            score,
            created_at,
            accounts!inner(name, organization_id)
          `)
          .eq("accounts.organization_id", context.organizationId)
          .order("created_at", { ascending: false })
          .limit(10),

        // Top churn risk accounts
        supabase
          .from("accounts")
          .select("id, name, churn_risk_score, health_score")
          .eq("organization_id", context.organizationId)
          .order("churn_risk_score", { ascending: false })
          .limit(5),
      ])

      // Calculate average NPS
      const avgNps =
        recentNps && recentNps.length > 0
          ? recentNps.reduce((sum, survey) => sum + survey.score, 0) / recentNps.length
          : 0

      // Calculate health score distribution
      const { data: healthDistribution } = await supabase
        .from("accounts")
        .select("health_score")
        .eq("organization_id", context.organizationId)

      const healthStats = healthDistribution?.reduce(
        (acc, account) => {
          if (account.health_score >= 80) acc.healthy++
          else if (account.health_score >= 60) acc.moderate++
          else acc.poor++
          return acc
        },
        { healthy: 0, moderate: 0, poor: 0 },
      ) || { healthy: 0, moderate: 0, poor: 0 }

      return createApiResponse({
        overview: {
          totalAccounts: totalAccounts || 0,
          activeAccounts: activeAccounts || 0,
          atRiskAccounts: atRiskAccounts || 0,
          totalEngagements: totalEngagements || 0,
          averageNps: Math.round(avgNps),
        },
        healthDistribution: healthStats,
        churnRiskAccounts: churnRiskAccounts || [],
        recentNps: recentNps || [],
      })
    } catch (error) {
      console.error("API error:", error)
      return createApiError("Internal server error", 500)
    }
  })
}
