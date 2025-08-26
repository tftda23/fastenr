import { type NextRequest, NextResponse } from "next/server"
import { verifyApiKey, extractApiKey, hasPermission, checkRateLimit } from "./api-auth"

export interface ApiContext {
  organizationId: string
  permissions: string[]
}

export async function withApiAuth(
  request: NextRequest,
  requiredPermission: string,
  handler: (request: NextRequest, context: ApiContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    // Extract API key
    const apiKey = extractApiKey(request)
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    // Verify API key
    const auth = await verifyApiKey(apiKey)
    if (!auth) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check permissions
    if (!hasPermission(auth.permissions, requiredPermission)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Check rate limit
    if (!checkRateLimit(auth.organization_id)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Call handler with context
    return await handler(request, {
      organizationId: auth.organization_id,
      permissions: auth.permissions,
    })
  } catch (error) {
    console.error("API middleware error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export function createApiResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}

export function createApiError(message: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status },
  )
}
