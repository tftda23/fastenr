"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Building, TrendingUp, AlertTriangle, Grid3X3, List, Filter, User } from "lucide-react"
import Link from "next/link"
import type { Account } from "@/lib/types"
import { AIInsightsButton } from "@/components/ai/ai-insights-button"

interface AccountListProps {
  accounts: Account[]
  onSearch: (query: string) => void
  canCreate: boolean
}

export default function AccountList({ accounts, onSearch, canCreate }: AccountListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [churnRiskFilter, setChurnRiskFilter] = useState<string>("all")
  const [sizeFilter, setSizeFilter] = useState<string>("all")
  const [arrFilter, setArrFilter] = useState<string>("all")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  // Helper functions (moved above filtering logic)
  const getStatusColor = (status: string) => {
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

  const formatStatus = (status: string) => {
    if (!status) return ""
    return status
      .split("_")
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
  }

  const getSizeLabel = (size: string | null) => {
    if (!size) return "Unknown"
    return size.charAt(0).toUpperCase() + size.slice(1)
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Critical", color: "text-red-600" }
    if (score >= 60) return { label: "High", color: "text-orange-600" }
    if (score >= 40) return { label: "Medium", color: "text-yellow-600" }
    return { label: "Low", color: "text-green-600" }
  }

  // Filter accounts based on selected filters
  const filteredAccounts = accounts.filter(account => {
    // Churn risk filter
    if (churnRiskFilter && churnRiskFilter !== 'all') {
      const risk = getRiskLevel(account.churn_risk_score)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <div className="flex items-center gap-3">
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
                <SelectItem value="under-10k">Under $10k</SelectItem>
                <SelectItem value="10k-50k">$10k - $50k</SelectItem>
                <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                <SelectItem value="over-100k">Over $100k</SelectItem>
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

      {/* Account Display */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => {
            const risk = getRiskLevel(account.churn_risk_score)
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
                      <p className={`text-lg font-semibold ${getHealthScoreColor(account.health_score)}`}>
                        {account.health_score}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Churn Risk</span>
                      </div>
                      <p className={`text-lg font-semibold ${risk.color}`}>{risk.label}</p>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="flex items-center gap-1">
                        {account.owner_name ? (
                          <>
                            <User className="h-3 w-3" />
                            {account.owner_name}
                          </>
                        ) : (
                          "Unassigned"
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
      ) : (
        <div className="space-y-4">
          {/* List Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-md text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Account</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-1">Industry</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2">ARR</div>
            <div className="col-span-1">Health</div>
            <div className="col-span-2">Risk</div>
          </div>
          
          {/* List Items */}
          {filteredAccounts.map((account) => {
            const risk = getRiskLevel(account.churn_risk_score)
            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{account.name}</p>
                          {account.domain && <p className="text-sm text-muted-foreground">{account.domain}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm flex items-center gap-1">
                        {account.owner_name ? (
                          <>
                            <User className="h-3 w-3" />
                            {account.owner_name}
                          </>
                        ) : (
                          "Unassigned"
                        )}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm">{account.industry || "N/A"}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm">{getSizeLabel(account.size)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium">{formatCurrency(account.arr)}</span>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${getHealthScoreColor(account.health_score)}`}>
                          {account.health_score}%
                        </span>
                        <Badge className={getStatusColor(account.status)} variant="outline">
                          {formatStatus(account.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className={`text-sm font-semibold ${risk.color}`}>{risk.label}</span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/accounts/${account.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || (churnRiskFilter !== 'all') || (sizeFilter !== 'all') || (arrFilter !== 'all')
              ? "Try adjusting your search terms or filters" 
              : "Get started by adding your first account"}
          </p>
          {canCreate && !searchQuery && churnRiskFilter === 'all' && sizeFilter === 'all' && arrFilter === 'all' && (
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
