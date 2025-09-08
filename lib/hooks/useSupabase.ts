"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Centralized hook to manage Supabase client connection
// Ensures proper connection reuse and reduces PostgREST configuration calls

export function useSupabase() {
  const [client] = useState(() => {
    // Use the singleton client instance
    return createClient()
  })

  useEffect(() => {
    // Optional: Log connection reuse for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.debug('[useSupabase] Using singleton client connection')
    }
  }, [])

  return client
}

// Alternative hook for components that need to handle connection state
export function useSupabaseWithState() {
  const [client] = useState(() => createClient())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Test connection and set state
    const testConnection = async () => {
      try {
        const { data, error } = await client.from('organizations').select('id').limit(1)
        if (!error) {
          setIsConnected(true)
        }
      } catch (err) {
        console.error('[useSupabaseWithState] Connection test failed:', err)
        setIsConnected(false)
      }
    }

    testConnection()
  }, [client])

  return { client, isConnected }
}