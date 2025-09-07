import { type NextRequest, NextResponse } from "next/server"
import { createAccount, checkUserPermission } from "@/lib/supabase/queries"
import { getSecureAccounts } from "@/lib/supabase/secure-queries"
import { calculateHealthScoresForAccounts } from "@/lib/health-score-engine"
import { calculateChurnRisksForAccounts } from "@/lib/churn-risk-engine"
import { logger } from "@/lib/logger"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || undefined
    const ownerId = searchParams.get("owner_id") || undefined
    const includeDynamicHealth = searchParams.get("dynamic_health") === "true"

    logger.apiRequest('GET', '/api/accounts', { page, limit, search, ownerId, includeDynamicHealth })

    // CRITICAL SECURITY: Use secure accounts query with organization isolation
    const result = await getSecureAccounts(page, limit, search, ownerId)

    // If dynamic health scores are requested and we have accounts, calculate them
    if (includeDynamicHealth && result.data && result.data.length > 0) {
      try {
        const [healthScores, churnRisks] = await Promise.all([
          calculateHealthScoresForAccounts(result.data),
          calculateChurnRisksForAccounts(result.data)
        ])
        
        // Update accounts with dynamic health scores and churn risks
        result.data = result.data.map(account => ({
          ...account,
          health_score: healthScores.get(account.id)?.overall || account.health_score || 0,
          health_components: healthScores.get(account.id),
          churn_risk_score: churnRisks.get(account.id)?.overall || account.churn_risk_score || 0,
          churn_risk_components: churnRisks.get(account.id)
        }))
        
        logger.apiResponse('GET', '/api/accounts', 200, undefined, { 
          count: result.data.length, 
          dynamicHealthCalculated: true,
          dynamicChurnRiskCalculated: true
        })
      } catch (calculationError) {
        console.error('Failed to calculate dynamic scores:', calculationError)
        logger.apiResponse('GET', '/api/accounts', 200, undefined, { 
          count: result.data.length, 
          dynamicHealthCalculated: false,
          dynamicChurnRiskCalculated: false,
          calculationError: calculationError instanceof Error ? calculationError.message : 'Unknown error'
        })
      }
    } else {
      logger.apiResponse('GET', '/api/accounts', 200, undefined, { count: result.data?.length || 0 })
    }

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
