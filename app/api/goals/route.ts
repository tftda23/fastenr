import { type NextRequest, NextResponse } from "next/server"
import { getCustomerGoals, createCustomerGoal, checkUserPermission } from "@/lib/supabase/queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId") || undefined

    const goals = await getCustomerGoals(accountId)

    return NextResponse.json({ data: goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const goal = await createCustomerGoal(body)

    return NextResponse.json({ data: goal }, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
