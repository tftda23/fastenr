"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client Supabase configuration check

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Global singleton instance to ensure connection reuse
let globalClientInstance: ReturnType<typeof createClientComponentClient> | null = null

export const createClient = () => {
  // Return existing instance if available (connection reuse)
  if (globalClientInstance) {
    return globalClientInstance
  }
  
  if (!isSupabaseConfigured) {
    throw new Error("Supabase configuration missing")
  }
  
  // Create new instance only if none exists
  globalClientInstance = createClientComponentClient()
  return globalClientInstance
}

// Export singleton instance for direct use
export const supabase = createClient()

// Reset function for testing/hot reload
export const resetClient = () => {
  globalClientInstance = null
}
