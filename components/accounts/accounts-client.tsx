"use client"

import { useState, useCallback, useEffect } from "react"
import AccountList from "@/components/accounts/account-list"
import type { Account } from "@/lib/types"
import { useTour } from "@/lib/hooks/use-tour"
import { TOUR_DUMMY_ACCOUNTS } from "@/lib/tour-dummy-data"

interface AccountsClientProps {
  initialAccounts: Account[]
  canCreate: boolean
}

const apiCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5000 // 5 seconds (reduced for better consistency)

export default function AccountsClient({ initialAccounts, canCreate }: AccountsClientProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [loading, setLoading] = useState(true) // Start with loading true to prevent flickering
  const { shouldShowDummyData } = useTour()

  const loadAccounts = useCallback(async (search?: string, bustCache = false) => {
    const cacheKey = `accounts-${search || "all"}`
    const cached = apiCache.get(cacheKey)

    // Return cached data if still valid (unless cache is being busted)
    if (!bustCache && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAccounts(cached.data)
      setLoading(false)
      return
    }

    // Only show loading if not using cached data
    if (!cached || bustCache) {
      setLoading(true)
    }

    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("dynamic_health", "true") // Enable dynamic health score calculation
      params.set("limit", "50") // Get more accounts for better overview

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
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear cache and reload on mount to ensure fresh data
  useEffect(() => {
    apiCache.clear()
    loadAccounts(undefined, true) // Bust cache on initial load
  }, [loadAccounts])

  const handleSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        loadAccounts(query)
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    },
    [loadAccounts],
  )

  // Transform dummy data to match Account interface
  const displayAccounts = shouldShowDummyData ? TOUR_DUMMY_ACCOUNTS.map(acc => ({
    id: acc.id,
    name: acc.name,
    health_score: acc.health_score,
    churn_risk_score: acc.churn_risk === 'very_low' ? 10 : acc.churn_risk === 'low' ? 25 : acc.churn_risk === 'high' ? 75 : 50,
    arr: acc.mrr * 12,
    mrr: acc.mrr,
    status: acc.status as any,
    last_engagement: acc.last_engagement,
    contacts_count: acc.contacts_count,
    growth_trend: acc.growth_trend
  })) : accounts

  // Let dashboard layout handle all loading states for consistent UX

  return <AccountList accounts={displayAccounts} onSearch={handleSearch} canCreate={canCreate} loading={loading} />
}
