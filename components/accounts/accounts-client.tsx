"use client"

import { useState, useCallback } from "react"
import AccountList from "@/components/accounts/account-list"
import type { Account } from "@/lib/types"

interface AccountsClientProps {
  initialAccounts: Account[]
  canCreate: boolean
}

const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

export default function AccountsClient({ initialAccounts, canCreate }: AccountsClientProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  // const [loading, setLoading] = useState(false)

  const loadAccounts = useCallback(async (search?: string) => {
    const cacheKey = `accounts-${search || "all"}`
    const cached = apiCache.get(cacheKey)

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAccounts(cached.data)
      return
    }

    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)

      const response = await fetch(`/api/accounts?${params}`)
      const result = await response.json()

      if (response.ok) {
        const accountsData = result.data || []
        setAccounts(accountsData)
        // Cache the response
        apiCache.set(cacheKey, { data: accountsData, timestamp: Date.now() })
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
    }
  }, [])

  const handleSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        loadAccounts(query)
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    },
    [loadAccounts],
  )

  // Let dashboard layout handle all loading states for consistent UX

  return <AccountList accounts={accounts} onSearch={handleSearch} canCreate={canCreate} />
}
