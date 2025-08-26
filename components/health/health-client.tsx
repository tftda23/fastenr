"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, AlertTriangle, TrendingUp, TrendingDown, Search } from "lucide-react"

interface HealthClientProps {
  accounts: any[]
  dashboardStats: any
}

export function HealthClient({ accounts, dashboardStats }: HealthClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")

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

          {/* Accounts List */}
          <div className="space-y-4">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getHealthIcon(account.health_score)}
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ARR: ${account.arr?.toLocaleString() || 0}
                      {account.last_engagement && (
                        <span className="ml-2">
                          • Last engagement: {new Date(account.last_engagement).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">Health Score</div>
                    <Badge className={getHealthColor(account.health_score)}>{account.health_score}/100</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Churn Risk</div>
                    <Badge className={getRiskColor(account.churn_risk_score)}>{account.churn_risk_score}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
