"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

console.log("[v0] Client Supabase config:", {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
})

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

let clientInstance: ReturnType<typeof createClientComponentClient> | null = null

export const createClient = () => {
  if (!clientInstance) {
    clientInstance = createClientComponentClient()
  }
  return clientInstance
}

export const supabase = createClient()
