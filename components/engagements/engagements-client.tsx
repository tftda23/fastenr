"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import EngagementList from "@/components/engagements/engagement-list"
import type { Engagement } from "@/lib/types"

type NumLike = number | string | null | undefined

interface EngagementWithDetails extends Engagement {
  accounts: { name?: string; churn_risk_score?: NumLike; arr?: NumLike } | null
  created_by_profile: { full_name: string } | null
}

interface EngagementsClientProps {
  initialEngagements: EngagementWithDetails[]
  canCreate: boolean
}

const apiCache = new Map<string, { data: EngagementWithDetails[]; timestamp: number }>()
const CACHE_DURATION = 30000 // 30s

const toNum = (v: NumLike) => {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const normalize = (rows: EngagementWithDetails[]): EngagementWithDetails[] =>
  rows.map((e) => {
    const acc = e.accounts ?? null
    return {
      ...e,
      accounts: acc
        ? {
            ...acc,
            churn_risk_score:
              acc.churn_risk_score === null || acc.churn_risk_score === undefined
                ? null
                : toNum(acc.churn_risk_score),
            arr: acc.arr === null || acc.arr === undefined ? null : toNum(acc.arr),
          }
        : null,
    }
  })

export default function EngagementsClient({ initialEngagements, canCreate }: EngagementsClientProps) {
  const [engagements, setEngagements] = useState<EngagementWithDetails[]>(normalize(initialEngagements))
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<{ search?: string; type?: string; outcome?: string; accountFilter?: string }>({})

  const loadEngagements = useCallback(
    async (search?: string, type?: string, outcome?: string, accountFilter?: string) => {
      const cacheKey = JSON.stringify({ search, type, outcome, accountFilter })
      const cached = apiCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setEngagements(cached.data)
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (type && type !== "all") params.set("type", type)
        if (outcome && outcome !== "all") params.set("outcome", outcome)
        if (accountFilter && accountFilter !== "all") params.set("account_id", accountFilter) // FIX: was accountFilter

        const response = await fetch(`/api/engagements?${params}`)
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const result = await response.json()
        // your API returns { data: ... } via createApiResponse
        const raw = (result?.data ?? []) as EngagementWithDetails[]
        const data = normalize(raw)

        apiCache.set(cacheKey, { data, timestamp: Date.now() })
        setEngagements(data)
      } catch (error) {
        console.error("[engagements] load error:", error)
        setEngagements([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const { search, type, outcome, accountFilter } = currentFilters
    if (search || type || outcome || accountFilter) {
      loadEngagements(search, type, outcome, accountFilter)
    }
  }, [currentFilters, loadEngagements])

  const handleSearch = useCallback((query: string) => {
    setCurrentFilters((prev) => ({ ...prev, search: query }))
  }, [])

  const handleFilter = useCallback((type: string, outcome: string, accountFilter?: string) => {
    setCurrentFilters((prev) => ({ ...prev, type, outcome, accountFilter }))
  }, [])

  const loadingComponent = useMemo(
    () => (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading engagements...</p>
      </div>
    ),
    [],
  )

  if (loading) return loadingComponent

  return <EngagementList engagements={engagements} onSearch={handleSearch} onFilter={handleFilter} canCreate={canCreate} />
}
