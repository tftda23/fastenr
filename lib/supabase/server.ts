import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Check if Supabase environment variables are available
// Supabase configuration check

export const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Supabase configuration status logged

export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn("Supabase environment variables are not set. Using dummy client.")
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    }
  }

  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

export const createServerClient = createClient
