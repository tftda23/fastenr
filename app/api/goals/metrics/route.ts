import { type NextRequest, NextResponse } from "next/server"
import { getMetricBasedGoalSuggestions } from "@/lib/supabase/queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId")

    if (!accountId) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    }

    const metrics = await getMetricBasedGoalSuggestions(accountId)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching goal metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}
