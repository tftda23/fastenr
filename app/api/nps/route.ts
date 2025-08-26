import { type NextRequest, NextResponse } from "next/server"
import { getNPSSurveys, createNPSSurvey, checkUserPermission } from "@/lib/supabase/queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId") || undefined

    const surveys = await getNPSSurveys(accountId)

    return NextResponse.json({ data: surveys })
  } catch (error) {
    console.error("Error fetching NPS surveys:", error)
    return NextResponse.json({ error: "Failed to fetch NPS surveys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const survey = await createNPSSurvey(body)

    return NextResponse.json({ data: survey }, { status: 201 })
  } catch (error) {
    console.error("Error creating NPS survey:", error)
    return NextResponse.json({ error: "Failed to create NPS survey" }, { status: 500 })
  }
}
