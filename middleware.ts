// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Server-to-server and third-party callbacks must NEVER be intercepted by app auth.
 * We bypass ALL /api routes (covers HubSpot, Salesforce, ETL, webhooks, etc.).
 * The session middleware runs only for actual app pages.
 */

// Extra explicit prefixes (not strictly needed since we bypass /api entirely,
// but kept for clarity and future readers).
const BYPASS_PREFIXES = [
  "/api/integrations/hubspot",
  "/api/integrations/salesforce",
  "/api/etl",
  "/api/webhooks",
  "/api/health",
  "/home", // Public home page - no auth required
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Hard bypass for listed prefixes (defensive; redundant with matcher but harmless)
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Everything else (non-API pages) goes through your Supabase session handler
  return await updateSession(request)
}

/**
 * Match ALL paths EXCEPT:
 * - /api/**      → all API routes are excluded from middleware
 * - /_next/**    → Next.js internals
 * - static assets (by extension)
 * - favicon
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|home|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt)$).*)",
  ],
}

// Use Node.js runtime to avoid Edge Runtime compatibility issues with Supabase
export const runtime = 'nodejs'
