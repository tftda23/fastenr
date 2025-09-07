"use client"

import { useState, useMemo, useCallback } from "react"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Heart, AlertTriangle, TrendingUp, TrendingDown, Search, Eye, BarChart3, Building } from "lucide-react"
import { DataTable } from "@/components/analytics/data-table"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HealthClientProps {
  accounts: any[]
  dashboardStats: any
}

export function HealthClient({ accounts, dashboardStats }: HealthClientProps) {
  const { formatCurrency } = useCurrencyConfig()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  // Remove modal-related state since we're navigating to a page now

  const getHealthColor = useCallback((score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }, [])

  const getRiskColor = useCallback((score: number) => {
    if (score >= 70) return "bg-red-100 text-red-800"
    if (score >= 40) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }, [])

  const getHealthIcon = useCallback((score: number) => {
    if (score >= 80) return <Heart className="h-4 w-4 text-green-600" />
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }, [])

  // Remove handleViewHealthScore since we're using Link navigation now

  // Table columns definition
  const columns: ColumnDef<any>[] = useMemo(
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
                <div className="text-sm text-muted-foreground">
                  ARR: {formatCurrency(account.arr || 0)}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        id: "health_score",
        accessorKey: "health_score",
        header: "Health Score",
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
          const score = row.original.health_score
          return (
            <div className="flex items-center gap-2">
              {getHealthIcon(score)}
              <Badge className={getHealthColor(score)}>
                {score}/100
              </Badge>
            </div>
          )
        },
      },
      {
        id: "churn_risk",
        accessorKey: "churn_risk_score",
        header: "Churn Risk",
        size: 120,
        minSize: 100,
        cell: ({ row }) => {
          const riskScore = row.original.churn_risk_score
          return (
            <Badge className={getRiskColor(riskScore)}>
              {riskScore}%
            </Badge>
          )
        },
      },
      {
        id: "last_engagement",
        accessorKey: "last_engagement",
        header: "Last Engagement",
        size: 140,
        minSize: 120,
        cell: ({ row }) => {
          const lastEngagement = row.original.last_engagement
          if (!lastEngagement) return <span className="text-muted-foreground text-sm">Never</span>
          
          return (
            <span className="text-sm">
              {new Date(lastEngagement).toLocaleDateString()}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        size: 140,
        minSize: 120,
        cell: ({ row }) => {
          const account = row.original
          const url = `/dashboard/health/${account.id}`
          
          return (
            <a href={url} className="inline-block">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-3 w-3" />
                View Breakdown
              </Button>
            </a>
          )
        },
      },
    ],
    [getHealthIcon, getHealthColor, getRiskColor, router]
  )

  const filteredAccounts = useMemo(() => {
    return (
      accounts?.filter((account) => {
        const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRisk =
          riskFilter === "all" ||
          (riskFilter === "high" && account.churn_risk_score >= 70) ||
          (riskFilter === "medium" && account.churn_risk_score >= 40 && account.churn_risk_score < 70) ||
          (riskFilter === "low" && account.churn_risk_score < 40)
        const matchesHealth =
          healthFilter === "all" ||
          (healthFilter === "excellent" && account.health_score >= 80) ||
          (healthFilter === "good" && account.health_score >= 60 && account.health_score < 80) ||
          (healthFilter === "poor" && account.health_score < 60)

        return matchesSearch && matchesRisk && matchesHealth
      }) || []
    )
  }, [accounts, searchTerm, riskFilter, healthFilter])

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Health Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.averageHealthScore || 0}</div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Accounts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.atRiskAccounts || 0}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Churn Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.averageChurnRisk || 0}%</div>
            <p className="text-xs text-muted-foreground">Risk of churning</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Account Health Analysis</CardTitle>
          <CardDescription>Monitor and analyze customer health scores and risk indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Health Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health Scores</SelectItem>
                <SelectItem value="excellent">Excellent (80+)</SelectItem>
                <SelectItem value="good">Good (60-79)</SelectItem>
                <SelectItem value="poor">Poor (&lt;60)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Accounts Table */}
          <DataTable
            data={filteredAccounts}
            columns={columns}
            title={`Health Scores (${filteredAccounts.length})`}
            description="Account health scores and churn risk analysis"
            searchPlaceholder="Search accounts..."
            exportFilename="health-scores"
          />
        </CardContent>
      </Card>

    </div>
  )
}
