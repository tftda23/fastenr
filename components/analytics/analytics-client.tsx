"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Heart, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { NPSSurvey } from "@/lib/types"

interface AnalyticsClientProps {
  dashboardStats: any
  churnRiskAccounts: any[]
  npsData: (NPSSurvey & { accounts: { name: string } })[]
}

export function AnalyticsClient({ dashboardStats, churnRiskAccounts, npsData }: AnalyticsClientProps) {
  const accountStatusData = useMemo(
    () => [
      { name: "Active", value: dashboardStats?.activeAccounts || 0, color: "#10b981" },
      { name: "At Risk", value: dashboardStats?.atRiskAccounts || 0, color: "#f59e0b" },
      { name: "Churned", value: dashboardStats?.churnedAccounts || 0, color: "#ef4444" },
    ],
    [dashboardStats],
  )

  const npsOverTime = useMemo(
    () =>
      npsData?.slice(-12).map((survey, index) => ({
        month: new Date(survey.survey_date).toLocaleDateString("en-US", { month: "short" }),
        score: survey.score,
      })) || [],
    [npsData],
  )

  const riskDistribution = useMemo(
    () =>
      churnRiskAccounts?.map((account) => ({
        name: account.name,
        risk: account.churn_risk_score,
        health: account.health_score,
        arr: account.arr,
      })) || [],
    [churnRiskAccounts],
  )

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.activeAccounts} active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardStats.totalARR?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Annual recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageHealthScore}</div>
            <p className="text-xs text-muted-foreground">Out of 100 points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.npsScore}</div>
            <p className="text-xs text-muted-foreground">Last 90 days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Account Status Distribution</CardTitle>
            <CardDescription>Current status of all accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accountStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {accountStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {accountStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NPS Trend */}
        <Card>
          <CardHeader>
            <CardTitle>NPS Score Trend</CardTitle>
            <CardDescription>Net Promoter Score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={npsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Analysis</CardTitle>
          <CardDescription>Accounts with highest churn risk scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={riskDistribution.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk" fill="#ef4444" name="Churn Risk" />
              <Bar dataKey="health" fill="#10b981" name="Health Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* High Risk Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>High Risk Accounts</CardTitle>
          <CardDescription>Accounts requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {churnRiskAccounts?.slice(0, 5).map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium">{account.name}</h4>
                    <p className="text-sm text-muted-foreground">ARR: ${account.arr?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Risk: {account.churn_risk_score}%</Badge>
                  <Badge variant="secondary">Health: {account.health_score}</Badge>
                </div>
              </div>
            )) || []}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
