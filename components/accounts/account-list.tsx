"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Building, TrendingUp, AlertTriangle, Grid3X3, List, Filter, User, Loader2, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import type { Account } from "@/lib/types"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { AIInsightsButton } from "@/components/ai/ai-insights-button"
import { AccountsHelp } from "@/components/ui/help-system"
import { DataTable } from "@/components/analytics/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface AccountListProps {
  accounts: Account[]
  onSearch: (query: string) => void
  canCreate: boolean
  loading?: boolean
}

export default function AccountList({ accounts, onSearch, canCreate, loading = false }: AccountListProps) {
  const { formatCurrency: formatCurrencyAmount } = useCurrencyConfig()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [churnRiskFilter, setChurnRiskFilter] = useState<string>("all")
  const [sizeFilter, setSizeFilter] = useState<string>("all")
  const [arrFilter, setArrFilter] = useState<string>("all")
  const [quadrantFilter, setQuadrantFilter] = useState<string>("all")
  const [isPremium, setIsPremium] = useState(false)

  // Table columns definition
  const columns: ColumnDef<Account>[] = useMemo(
    () => [
      {
        id: "account",
        accessorKey: "name",
        header: "Account",
        size: 250,
        minSize: 200,
        cell: ({ row }) => {
          const account = row.original
          return (
            <div className="flex items-center space-x-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{account.name}</div>
                {account.domain && (
                  <div className="text-sm text-muted-foreground">{account.domain}</div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: "owner",
        accessorKey: "owner_name",
        header: "Owner",
        size: 150,
        minSize: 120,
        cell: ({ row }) => {
          const ownerName = row.original.owner_name
          if (!ownerName) return <span className="text-muted-foreground text-sm">Unassigned</span>
          
          return (
            <div className="flex items-center gap-1 text-sm">
              <User className="h-3 w-3 text-muted-foreground" />
              {ownerName}
            </div>
          )
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge className={getStatusColor(status)} variant="outline">
              {formatStatus(status)}
            </Badge>
          )
        },
      },
      {
        id: "health_score",
        accessorKey: "health_score",
        header: "Health",
        size: 80,
        minSize: 70,
        cell: ({ row }) => {
          const score = row.original.health_score ?? 0
          return (
            <span className={`text-sm font-semibold ${getHealthScoreColor(score)}`}>
              {score}%
            </span>
          )
        },
      },
      {
        id: "churn_risk",
        accessorKey: "churn_risk_score",
        header: "Risk",
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
          const riskScore = row.original.churn_risk_score ?? 0
          const risk = getRiskLevel(riskScore)
          return (
            <span className={`text-sm font-semibold ${risk.color}`}>
              {risk.label}
            </span>
          )
        },
      },
      {
        id: "arr",
        accessorKey: "arr",
        header: "ARR",
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
          const arr = row.original.arr
          return (
            <span className="text-sm font-medium">
              {formatCurrency(arr)}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        size: 60,
        minSize: 50,
        cell: ({ row }) => {
          const account = row.original
          return (
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/accounts/${account.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>
          )
        },
      },
    ],
    []
  )

  // Read URL parameters on mount
  useEffect(() => {
    const quadrant = searchParams.get('quadrant')
    if (quadrant && ['expand', 'retain', 'improve', 'emergency'].includes(quadrant)) {
      setQuadrantFilter(quadrant)
    }
  }, [searchParams])

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/debug/org')
        if (response.ok) {
          const data = await response.json()
          
          if (data.organization_id) {
            const premiumResponse = await fetch(`/api/features/premium?org_id=${data.organization_id}`)
            if (premiumResponse.ok) {
              const premiumData = await premiumResponse.json()
              setIsPremium(premiumData.isPremium || false)
            }
          }
        }
      } catch (error) {
        console.error('Failed to check premium status:', error)
        setIsPremium(false)
      }
    }

    checkPremiumStatus()
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  // Helper functions (moved above filtering logic)
  const getStatusColor = (status: string | undefined) => {
    const staticFix = "cursor-default transition-none focus-visible:ring-0 select-none"
    switch (status) {
      case "active":
        return `${staticFix} !bg-green-100 !text-green-800 hover:!bg-green-100 hover:!text-green-800`
      case "at_risk":
        return `${staticFix} !bg-red-100 !text-red-800 hover:!bg-red-100 hover:!text-red-800`
      case "churned":
        return `${staticFix} !bg-gray-100 !text-gray-800 hover:!bg-gray-100 hover:!text-gray-800`
      case "onboarding":
        return `${staticFix} !bg-blue-100 !text-blue-800 hover:!bg-blue-100 hover:!text-blue-800`
      default:
        return `${staticFix} !bg-gray-100 !text-gray-800 hover:!bg-gray-100 hover:!text-gray-800`
    }
  }

  const formatStatus = (status: string | undefined) => {
    if (!status) return ""
    return status
      .split("_")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
  }

  const getSizeLabel = (size: string | null | undefined) => {
    if (!size) return "Unknown"
    return size.charAt(0).toUpperCase() + size.slice(1)
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A"
    return formatCurrencyAmount(amount)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600/80"
    if (score >= 60) return "text-amber-600/80"
    return "text-red-600/80"
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Critical", color: "text-red-600/70" }
    if (score >= 60) return { label: "High", color: "text-orange-600/70" }
    if (score >= 40) return { label: "Medium", color: "text-amber-600/70" }
    return { label: "Low", color: "text-emerald-600/70" }
  }

  // Helper function to get quadrant (matches scatter plot logic)
  const getQuadrant = (healthScore: number, churnRisk: number) => {
    if (healthScore >= 50 && churnRisk <= 50) return "expand"    // High Health, Low Risk (Top Right)
    if (healthScore < 50 && churnRisk <= 50) return "retain"     // Low Health, Low Risk (Top Left)
    if (healthScore >= 50 && churnRisk > 50) return "improve"    // High Health, High Risk (Bottom Right)
    return "emergency"                                           // Low Health, High Risk (Bottom Left)
  }

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter(account => {
    // Quadrant filter
    if (quadrantFilter && quadrantFilter !== 'all') {
      const quadrant = getQuadrant(account.health_score ?? 0, account.churn_risk_score ?? 0)
      if (quadrant !== quadrantFilter) {
        return false
      }
    }

    // Churn risk filter
    if (churnRiskFilter && churnRiskFilter !== 'all') {
      const risk = getRiskLevel(account.churn_risk_score ?? 0)
      if (risk.label.toLowerCase() !== churnRiskFilter.toLowerCase()) {
        return false
      }
    }

    // Size filter
    if (sizeFilter && sizeFilter !== 'all' && account.size !== sizeFilter) {
      return false
    }

    // ARR filter
    if (arrFilter && arrFilter !== 'all') {
      const arr = account.arr || 0
      switch (arrFilter) {
        case 'under-10k':
          if (arr >= 10000) return false
          break
        case '10k-50k':
          if (arr < 10000 || arr >= 50000) return false
          break
        case '50k-100k':
          if (arr < 50000 || arr >= 100000) return false
          break
        case 'over-100k':
          if (arr < 100000) return false
          break
      }
    }

    return true
  })

  return (
    <div className="space-y-6" data-tour="accounts-table">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <AccountsHelp variant="icon" size="md" />
          <AIInsightsButton
            pageType="accounts"
            pageContext={{}}
          />
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/accounts/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={quadrantFilter} onValueChange={setQuadrantFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Quadrant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quadrants</SelectItem>
                <SelectItem value="expand"><span className="inline-flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/70 border border-green-300"></div>Expand</span></SelectItem>
                <SelectItem value="retain"><span className="inline-flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/70 border border-yellow-300"></div>Retain</span></SelectItem>
                <SelectItem value="improve"><span className="inline-flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500/70 border border-blue-300"></div>Improve</span></SelectItem>
                <SelectItem value="emergency"><span className="inline-flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/70 border border-red-300"></div>Emergency</span></SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={churnRiskFilter} onValueChange={setChurnRiskFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={arrFilter} onValueChange={setArrFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="ARR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ARR</SelectItem>
                <SelectItem value="under-10k">Under 10k</SelectItem>
                <SelectItem value="10k-50k">10k - 50k</SelectItem>
                <SelectItem value="50k-100k">50k - 100k</SelectItem>
                <SelectItem value="over-100k">Over 100k</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Skeleton className="h-3 w-3 rounded" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                    
                    {/* Account Details */}
                    <div className="space-y-2 text-sm">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-2">
                      <Skeleton className="h-9 w-full rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Account Display */}
      {!loading && viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => {
            const risk = getRiskLevel(account.churn_risk_score ?? 0)
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(account.status)}>
                      {formatStatus(account.status)}
                    </Badge>
                  </div>
                  {account.domain && <p className="text-sm text-muted-foreground">{account.domain}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Health Score</span>
                      </div>
                      <p className={`text-lg font-semibold ${getHealthScoreColor(account.health_score ?? 0)}`}>
                        {account.health_score ?? 0}%
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <span className="text-xs text-muted-foreground">Churn Risk</span>
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className={`text-lg font-semibold ${risk.color}`}>{risk.label}</p>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="flex items-center gap-1">
                        {account.owner_name || (account as any).owner?.full_name ? (
                          <>
                            <User className="h-3 w-3" />
                            {account.owner_name || (account as any).owner?.full_name}
                          </>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => {/* TODO: Add assign owner functionality */}}
                          >
                            Assign Owner
                          </Button>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{account.industry || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{getSizeLabel(account.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ARR:</span>
                      <span className="font-medium">{formatCurrency(account.arr)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/dashboard/accounts/${account.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : !loading ? (
        <DataTable
          data={filteredAccounts}
          columns={columns}
          title={`Accounts (${filteredAccounts.length})`}
          description="Manage customer accounts and stakeholders"
          searchPlaceholder="Search accounts..."
          exportFilename="accounts"
        />
      ) : null}

      {!loading && filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || (quadrantFilter !== 'all') || (churnRiskFilter !== 'all') || (sizeFilter !== 'all') || (arrFilter !== 'all')
              ? "Try adjusting your search terms or filters" 
              : "Get started by adding your first account"}
          </p>
          {canCreate && !searchQuery && quadrantFilter === 'all' && churnRiskFilter === 'all' && sizeFilter === 'all' && arrFilter === 'all' && (
            <Button asChild>
              <Link href="/dashboard/accounts/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
