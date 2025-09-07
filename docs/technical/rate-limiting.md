# Rate Limiting System

## Overview

Fastenr implements comprehensive rate limiting to protect against abuse and ensure fair usage across all APIs. The system uses user-based and IP-based rate limiting with automatic blocking for repeated violations.

## Rate Limit Configuration

### Email APIs
- **Email Testing**: 5 requests per 5 minutes (with 10-minute block after limit)
- **Email Sending**: 10 requests per minute (with 5-minute block after limit)
- **Email Bulk Operations**: 50 requests per hour
- **Domain Operations**: 10 requests per 5 minutes

### General APIs
- **Default**: 100 requests per minute
- **Strict**: 20 requests per minute  
- **Very Strict**: 5 requests per minute
- **Public Endpoints**: 200 requests per minute
- **Auth Sensitive**: 3 requests per 15 minutes (with 30-minute block)

## Implementation

### User-Based Rate Limiting
- Authenticated users are rate limited by user ID
- More generous limits for authenticated requests
- Persistent tracking across sessions

### IP-Based Rate Limiting
- Unauthenticated requests are limited by IP address
- Handles proxy headers (X-Forwarded-For, X-Real-IP, CF-Connecting-IP)
- Fallback for anonymous access

### Automatic Blocking
- Repeated violations trigger temporary blocks
- Block duration increases with severity
- Critical endpoints (email, auth) have longer blocks

## Rate Limit Headers

All responses include standard rate limit headers:
```http
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

## Error Responses

### Rate Limited (429)
```json
{
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED", 
  "resetTime": 1640995200,
  "retryAfter": 60
}
```

### Temporarily Blocked (429)
```json
{
  "error": "Too many requests. You have been temporarily blocked.",
  "code": "BLOCKED",
  "resetTime": 1640999800,
  "retryAfter": 300
}
```

## Protected Endpoints

### Email APIs (`/api/email/...`)
- **POST /api/email/test**: EMAIL_TEST limits (5 per 5min, 10min block)
- **GET /api/email/domains**: DEFAULT limits (100 per minute)
- **POST /api/email/domains**: DOMAIN_OPERATIONS limits (10 per 5min)
- **DELETE /api/email/domains/[id]**: DOMAIN_OPERATIONS limits
- **POST /api/email/domains/[id]/verify**: DOMAIN_OPERATIONS limits
- **GET /api/email/domains/[id]/details**: DEFAULT limits
- **GET /api/email/debug**: DEFAULT limits
- **GET /api/email/settings**: DEFAULT limits
- **POST /api/email/settings**: STRICT limits (20 per minute)

### Future Considerations
- Redis-based storage for production scaling
- Per-organization rate limits
- Dynamic rate limiting based on subscription tiers
- Rate limit analytics and monitoring

## Usage Examples

### Implementing Rate Limiting
```typescript
import { withRateLimit, RATE_LIMITS, getUserIdFromSupabase } from '@/lib/rate-limiting'

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMITS.EMAIL_SEND, getUserIdFromSupabase)(
    request,
    () => handlePOST(request)
  )
}
```

### Custom Rate Limiting
```typescript
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limiting'

const customLimit = checkRateLimit(request, {
  windowMs: 60000,    // 1 minute
  maxRequests: 50,    // 50 requests
  blockDuration: 300000 // 5 minute block
}, userId)

if (!customLimit.allowed) {
  return createRateLimitResponse(customLimit)
}
```

## Monitoring

Rate limiting events are logged for monitoring:
- Successful requests with remaining count
- Rate limit violations 
- Temporary blocks applied
- Block duration and reset times

This enables tracking of:
- API usage patterns
- Potential abuse attempts
- Rate limit effectiveness
- Need for limit adjustments