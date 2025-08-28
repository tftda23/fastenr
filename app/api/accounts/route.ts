import { type NextRequest, NextResponse } from "next/server"
import { getAccounts, createAccount, checkUserPermission } from "@/lib/supabase/queries"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || undefined
    const ownerId = searchParams.get("owner_id") || undefined

    logger.apiRequest('GET', '/api/accounts', { page, limit, search, ownerId })

    const result = await getAccounts(page, limit, search, ownerId)

    logger.apiResponse('GET', '/api/accounts', 200, undefined, { count: result.data?.length || 0 })
    return NextResponse.json(result)
  } catch (error) {
    logger.apiError('GET', '/api/accounts', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.apiRequest('POST', '/api/accounts')

    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      logger.security('Insufficient permissions for account creation')
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const account = await createAccount(body)

    logger.apiResponse('POST', '/api/accounts', 201, undefined, { accountId: account.id })
    return NextResponse.json({ data: account }, { status: 201 })
  } catch (error) {
    logger.apiError('POST', '/api/accounts', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
