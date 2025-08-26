import { NextResponse } from "next/server"
import { getDashboardStats, getChurnRiskAccounts } from "@/lib/supabase/queries"

export async function GET() {
  try {
    const [stats, churnRiskAccounts] = await Promise.all([getDashboardStats(), getChurnRiskAccounts(10)])

    return NextResponse.json({
      data: {
        stats,
        churnRiskAccounts,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
