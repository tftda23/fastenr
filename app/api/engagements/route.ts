import { type NextRequest, NextResponse } from "next/server"
import { getEngagements, createEngagement, checkUserPermission } from "@/lib/supabase/queries"

// GET /api/engagements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const accountId = searchParams.get("accountId") ?? undefined
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10)

    const search = searchParams.get("search") ?? undefined
    const type = searchParams.get("type") ?? undefined
    const outcome = searchParams.get("outcome") ?? undefined
    const accountFilter = searchParams.get("accountFilter") ?? undefined

    console.log("[v0][GET] Params received:", { accountId, page, limit, search, type, outcome, accountFilter })

    const result = await getEngagements(accountId, page, limit, search, type, outcome, accountFilter)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[v0][GET] Error fetching engagements:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch engagements",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// POST /api/engagements
export async function POST(request: NextRequest) {
  try {
    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0][POST] Body received:", body)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const engagement = await createEngagement(body)
    console.log("[v0][POST] Engagement created:", engagement)

    return NextResponse.json({ data: engagement }, { status: 201 })
  } catch (error) {
    console.error("[v0][POST] Error creating engagement:", error)
    return NextResponse.json(
      {
        error: "Failed to create engagement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
