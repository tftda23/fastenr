import { NextRequest, NextResponse } from "next/server"
import { getDashboardStats, getChurnRiskAccounts } from "@/lib/supabase/queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    
    const stats = await getDashboardStats(ownerId || undefined)
    
    if (!stats) {
      return NextResponse.json({ error: 'Unable to load dashboard stats' }, { status: 500 })
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
