"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Building, TrendingUp, AlertTriangle } from "lucide-react"
import Link from "next/link"
import type { Account } from "@/lib/types"

interface AccountListProps {
  accounts: Account[]
  onSearch: (query: string) => void
  canCreate: boolean
}

export default function AccountList({ accounts, onSearch, canCreate }: AccountListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  // Base + forced hover overrides + static cursor/interaction styles
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

  // "at_risk" -> "At Risk", "active" -> "Active"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/dashboard/accounts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
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

      {accounts.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No accounts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Get started by adding your first account"}
          </p>
          {canCreate && !searchQuery && (
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
