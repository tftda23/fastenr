import { NextRequest, NextResponse } from 'next/server'

// Rate limiting storage - in production, use Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked?: boolean }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
  blockDuration?: number // Block duration after limit exceeded (ms)
  keyGenerator?: (request: NextRequest, userId?: string) => string
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // General API rate limits
  DEFAULT: { windowMs: 60000, maxRequests: 100 },               // 100 requests per minute
  STRICT: { windowMs: 60000, maxRequests: 20 },                 // 20 requests per minute
  VERY_STRICT: { windowMs: 60000, maxRequests: 5 },             // 5 requests per minute
  
  // Email-specific rate limits
  EMAIL_SEND: { windowMs: 60000, maxRequests: 10, blockDuration: 300000 }, // 10 emails per minute, 5min block
  EMAIL_TEST: { windowMs: 300000, maxRequests: 5, blockDuration: 600000 }, // 5 tests per 5min, 10min block
  EMAIL_BULK: { windowMs: 3600000, maxRequests: 50 },          // 50 bulk operations per hour
  
  // Domain management
  DOMAIN_OPERATIONS: { windowMs: 300000, maxRequests: 10 },    // 10 domain ops per 5min
  
  // Authentication sensitive
  AUTH_SENSITIVE: { windowMs: 900000, maxRequests: 3, blockDuration: 1800000 }, // 3 per 15min, 30min block
  
  // Public endpoints
  PUBLIC: { windowMs: 60000, maxRequests: 200 },               // 200 requests per minute
} as const

function defaultKeyGenerator(request: NextRequest, userId?: string): string {
  const ip = getClientIP(request)
  return userId ? `user:${userId}` : `ip:${ip}`
}

function getClientIP(request: NextRequest): string {
  // Try multiple headers for IP detection
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // Fallback to a default value
  return 'unknown'
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): { allowed: boolean; remaining: number; resetTime: number; blocked?: boolean } {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator
  const key = keyGenerator(request, userId)
  const now = Date.now()
  
  const current = rateLimitStore.get(key)
  
  // Check if currently blocked
  if (current?.blocked && now < current.resetTime) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      blocked: true
    }
  }
  
  // Reset or initialize if window expired
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      blocked: false
    })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs
    }
  }
  
  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    // Apply blocking if configured
    if (config.blockDuration) {
      current.blocked = true
      current.resetTime = now + config.blockDuration
    }
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      blocked: !!config.blockDuration
    }
  }
  
  // Increment counter
  current.count++
  
  return {
    allowed: true,
    remaining: config.maxRequests - current.count,
    resetTime: current.resetTime
  }
}

export function createRateLimitResponse(limit: ReturnType<typeof checkRateLimit>): NextResponse {
  const status = limit.blocked ? 429 : 429 // Use 429 for both rate limit and blocking
  const message = limit.blocked 
    ? 'Too many requests. You have been temporarily blocked.' 
    : 'Too many requests. Please try again later.'
  
  const response = NextResponse.json({
    error: message,
    code: limit.blocked ? 'BLOCKED' : 'RATE_LIMITED',
    resetTime: limit.resetTime,
    retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000)
  }, { status })
  
  // Add standard rate limit headers
  response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
  response.headers.set('X-RateLimit-Reset', limit.resetTime.toString())
  response.headers.set('Retry-After', Math.ceil((limit.resetTime - Date.now()) / 1000).toString())
  
  return response
}

// Middleware wrapper for easy integration
export function withRateLimit(
  config: RateLimitConfig,
  getUserId?: (request: NextRequest) => Promise<string | null>
) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    let userId: string | undefined
    
    if (getUserId) {
      try {
        userId = (await getUserId(request)) || undefined
      } catch (error) {
        console.error('Error getting user ID for rate limiting:', error)
        // Continue without user ID - will fall back to IP-based limiting
      }
    }
    
    const limit = checkRateLimit(request, config, userId)
    
    if (!limit.allowed) {
      return createRateLimitResponse(limit)
    }
    
    // Add rate limit headers to successful responses
    const response = await handler()
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString())
    
    return response
  }
}

// Helper for Supabase auth-based user ID extraction
export async function getUserIdFromSupabase(request: NextRequest): Promise<string | null> {
  try {
    const { createServerActionClient } = await import('@supabase/auth-helpers-nextjs')
    const { cookies } = await import('next/headers')
    
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()
    
    return user?.id || null
  } catch (error) {
    console.error('Error extracting user from Supabase:', error)
    return null
  }
}