import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"

// API Key management
export interface ApiKey {
  id: string
  organization_id: string
  name: string
  key_hash: string
  permissions: string[]
  last_used_at: string | null
  created_at: string
  expires_at: string | null
  is_active: boolean
}

// Generate a new API key
export function generateApiKey(): string {
  return `cs_${crypto.randomBytes(32).toString("hex")}`
}

// Hash API key for storage
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

// Verify API key and get organization
export async function verifyApiKey(key: string): Promise<{ organization_id: string; permissions: string[] } | null> {
  if (!key || !key.startsWith("cs_")) {
    return null
  }

  const keyHash = hashApiKey(key)
  const supabase = createClient()

  try {
    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .select("organization_id, permissions, expires_at, is_active")
      .eq("key_hash", keyHash)
      .single()

    if (error || !apiKey || !apiKey.is_active) {
      return null
    }

    // Check if key is expired
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return null
    }

    // Update last used timestamp
    await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("key_hash", keyHash)

    return {
      organization_id: apiKey.organization_id,
      permissions: apiKey.permissions || [],
    }
  } catch (error) {
    console.error("Error verifying API key:", error)
    return null
  }
}

// Extract API key from request
export function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key")
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  return null
}

// Check if API key has required permission
export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes("admin") || permissions.includes(required)
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(organizationId: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const key = organizationId
  const current = rateLimitMap.get(key)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= limit) {
    return false
  }

  current.count++
  return true
}
