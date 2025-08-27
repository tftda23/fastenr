"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  Download, Filter, Calendar, TrendingUp, TrendingDown, 
  Users, DollarSign, AlertTriangle, CheckCircle, Clock,
  FileText, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"

// Enhanced Analytics Client with Interactive Features
interface EnhancedAnalyticsProps {
  dashboardStats: any
  churnRiskAccounts: any[]
  npsData: any[]
  accountsData?: any[]
  engagementsData?: any[]
  goalsData?: any[]
}

// Color palette for charts
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280'
}

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.danger, COLORS.info, COLORS.purple]

export function EnhancedAnalyticsClient({ 
  dashboardStats, 
  churnRiskAccounts, 
  npsData,
  accountsData = [],
  engagementsData = [],
  goalsData = []
}: EnhancedAnalyticsProps) {
  // Filter states
  const [dateRange, setDateRange] = useState('30d')
  const [accountFilter, setAccountFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Export functionality
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return

    const headers = Object.keys(data[0]).join(',')
    const csvContent = [
      headers,
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // Mock data generation for demonstration
  const generateMockData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: format(date, 'MMM dd'),
        fullDate: date,
        accounts: Math.floor(Math.random() * 50) + 100,
        engagements: Math.floor(Math.random() * 200) + 150,
        healthScore: Math.floor(Math.random() * 30) + 70,
        churnRisk: Math.floor(Math.random() * 10) + 5,
        revenue: Math.floor(Math.random() * 50000) + 100000,
        npsScore: Math.floor(Math.random() * 40) + 30
      }
    })

    return last30Days
  }

  const timeSeriesData = generateMockData()

  // Health Score Distribution Data
  const healthDistributionData = [
    { name: 'Excellent (90-100)', value: 25, color: COLORS.secondary },
    { name: 'Good (70-89)', value: 45, color: COLORS.primary },
    { name: 'Fair (50-69)', value: 20, color: COLORS.warning },
    { name: 'Poor (0-49)', value: 10, color: COLORS.danger }
  ]

  // Engagement Types Data
  const engagementTypesData = [
    { name: 'Email', count: 245, percentage: 35 },
    { name: 'Call', count: 180, percentage: 26 },
    { name: 'Meeting', count: 120, percentage: 17 },
    { name: 'Support', count: 95, percentage: 14 },
    { name: 'Other', count: 60, percentage: 8 }
  ]

  // Revenue by Account Tier
  const revenueByTierData = [
    { tier: 'Enterprise', revenue: 450000, accounts: 12, avgRevenue: 37500 },
    { tier: 'Professional', revenue: 280000, accounts: 35, avgRevenue: 8000 },
    { tier: 'Standard', revenue: 150000, accounts: 68, avgRevenue: 2200 },
    { tier: 'Starter', revenue: 45000, accounts: 125, avgRevenue: 360 }
  ]

  // Churn Risk Analysis
  const churnRiskData = [
    { month: 'Jan', predicted: 8, actual: 6 },
    { month: 'Feb', predicted: 12, actual: 10 },
    { month: 'Mar', predicted: 15, actual: 14 },
    { month: 'Apr', predicted: 9, actual: 7 },
    { month: 'May', predicted: 11, actual: 13 },
    { month: 'Jun', predicted: 7, actual: 5 }
  ]

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filtered = timeSeriesData

    if (dateRange === '7d') {
      filtered = filtered.slice(-7)
    } else if (dateRange === '14d') {
      filtered = filtered.slice(-14)
    }

    return filtered
  }, [timeSeriesData, dateRange])

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
          <CardDescription>
            Customize your analytics view with filters and date ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="14d">Last 14 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-filter">Account Type</Label>
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="health-filter">Health Score</Label>
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="excellent">Excellent (90-100)</SelectItem>
                  <SelectItem value="good">Good (70-89)</SelectItem>
                  <SelectItem value="fair">Fair (50-69)</SelectItem>
                  <SelectItem value="poor">Poor (0-49)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Accounts</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(filteredData, 'analytics-overview')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Overview
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(churnRiskAccounts, 'churn-risk-accounts')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Churn Risk
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(engagementTypesData, 'engagement-types')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Engagements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs with Multiple Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Data Tables
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.totalAccounts || 240}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.avgHealthScore || 78}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$925K</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">7</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+2</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Growth Trend</CardTitle>
                <CardDescription>Daily account metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="accounts" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                      name="Total Accounts"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke={COLORS.secondary} 
                      strokeWidth={2}
                      name="Avg Health Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
                <CardDescription>Current distribution of account health scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={healthDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {healthDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Trends</CardTitle>
                <CardDescription>Health score changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke={COLORS.secondary} 
                      fill={COLORS.secondary}
                      fillOpacity={0.3}
                      name="Health Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Distribution Details</CardTitle>
                <CardDescription>Detailed breakdown by health categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.value} accounts</Badge>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((item.value / 100) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Type</CardTitle>
                <CardDescription>Distribution of engagement activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementTypesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Daily engagement activities over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="engagements" 
                      stroke={COLORS.secondary} 
                      strokeWidth={2}
                      name="Total Engagements"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Details</CardTitle>
              <CardDescription>Detailed breakdown of engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagementTypesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm text-muted-foreground">activities</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Account Tier</CardTitle>
                <CardDescription>Revenue distribution across account tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByTierData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tier" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={COLORS.secondary} 
                      fill={COLORS.secondary}
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Tier Details</CardTitle>
              <CardDescription>Comprehensive revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tier</th>
                      <th className="text-right p-2">Total Revenue</th>
                      <th className="text-right p-2">Accounts</th>
                      <th className="text-right p-2">Avg Revenue</th>
                      <th className="text-right p-2">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueByTierData.map((tier, index) => {
                      const totalRevenue = revenueByTierData.reduce((sum, t) => sum + t.revenue, 0)
                      const percentage = ((tier.revenue / totalRevenue) * 100).toFixed(1)
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{tier.tier}</td>
                          <td className="p-2 text-right">${tier.revenue.toLocaleString()}</td>
                          <td className="p-2 text-right">{tier.accounts}</td>
                          <td className="p-2 text-right">${tier.avgRevenue.toLocaleString()}</td>
                          <td className="p-2 text-right">{percentage}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Risk Tab */}
        <TabsContent value="churn" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Prediction vs Actual</CardTitle>
                <CardDescription>Accuracy of churn risk predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={churnRiskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke={COLORS.warning} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted Churn"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke={COLORS.danger} 
                      strokeWidth={2}
                      name="Actual Churn"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Churn Risk Accounts</CardTitle>
                <CardDescription>Accounts currently at risk of churning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churnRiskAccounts.slice(0, 5).map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{account.name || `Account ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Health Score: {account.health_score || Math.floor(Math.random() * 30) + 20}
                        </p>
                      </div>
                      <Badge variant="destructive">High Risk</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Metric Trends</CardTitle>
                <CardDescription>Combined view of key metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="accounts" 
                      stroke={COLORS.primary} 
                      strokeWidth={2}
                      name="Total Accounts"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="engagements" 
                      stroke={COLORS.secondary} 
                      strokeWidth={2}
                      name="Engagements"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="healthScore" 
                      stroke={COLORS.warning} 
                      strokeWidth={2}
                      name="Health Score"
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="churnRisk" 
                      stroke={COLORS.danger} 
                      strokeWidth={2}
                      name="Churn Risk"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trend Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">+12%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Consistent growth over {dateRange}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">+3%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Improving customer health
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Churn Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="text-2xl font-bold">+2</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Slight increase in risk accounts
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Data Tables Tab */}
        <TabsContent value="data" className="space-y-4">
          <div className="space-y-6">
            {/* Import the AccountsDataTable component */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Interactive Data Tables</h3>
                  <p className="text-sm text-muted-foreground">
                    Sortable, filterable, and exportable data tables for detailed analysis
                  </p>
                </div>
              </div>
              
              {/* Accounts Data Table */}
              <div className="space-y-4">
                <div className="border rounded-lg p-6">
                  <h4 className="text-md font-medium mb-4">Accounts Overview</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive view of all customer accounts with key metrics, health scores, and engagement data.
                    Use the search and filters to find specific accounts, and export data for further analysis.
                  </p>
                  
                  {/* Mock accounts table preview */}
                  <div className="border rounded-md">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Accounts Data Table</h5>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="w-32 font-medium">Account Name</div>
                          <div className="w-20">Tier</div>
                          <div className="w-20">Status</div>
                          <div className="w-24">Health Score</div>
                          <div className="w-24">Revenue</div>
                          <div className="w-20">CSM</div>
                          <div className="w-28">Last Engagement</div>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">Account {i}</div>
                            <div className="w-20">
                              <Badge variant="default">Enterprise</Badge>
                            </div>
                            <div className="w-20">
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <div className="w-24">
                              <Badge variant="default">85</Badge>
                            </div>
                            <div className="w-24">${(Math.random() * 50000 + 10000).toFixed(0)}</div>
                            <div className="w-20">CSM {i}</div>
                            <div className="w-28">Aug {20 + i}, 2024</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Interactive data table with sorting, filtering, and export capabilities
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagements Data Table Preview */}
                <div className="border rounded-lg p-6">
                  <h4 className="text-md font-medium mb-4">Engagements Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Detailed engagement history with filtering by type, date range, and outcome.
                    Track all customer interactions and their effectiveness.
                  </p>
                  
                  <div className="border rounded-md">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Engagements Data Table</h5>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="w-32 font-medium">Account</div>
                          <div className="w-20">Type</div>
                          <div className="w-24">Date</div>
                          <div className="w-20">Outcome</div>
                          <div className="w-32">Notes</div>
                          <div className="w-20">CSM</div>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">Account {i}</div>
                            <div className="w-20">
                              <Badge variant="outline">Call</Badge>
                            </div>
                            <div className="w-24">Aug {25 + i}, 2024</div>
                            <div className="w-20">
                              <Badge variant="default">Success</Badge>
                            </div>
                            <div className="w-32">Quarterly review meeting</div>
                            <div className="w-20">CSM {i}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Comprehensive engagement tracking with advanced filtering
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Data Table Preview */}
                <div className="border rounded-lg p-6">
                  <h4 className="text-md font-medium mb-4">Revenue Analytics</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Revenue breakdown by account, time period, and product. Track ARR, MRR, and growth metrics
                    with detailed financial analytics.
                  </p>
                  
                  <div className="border rounded-md">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Revenue Data Table</h5>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="w-32 font-medium">Account</div>
                          <div className="w-24">MRR</div>
                          <div className="w-24">ARR</div>
                          <div className="w-20">Growth</div>
                          <div className="w-28">Contract Value</div>
                          <div className="w-24">Renewal Date</div>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">Account {i}</div>
                            <div className="w-24">${(Math.random() * 5000 + 1000).toFixed(0)}</div>
                            <div className="w-24">${(Math.random() * 60000 + 12000).toFixed(0)}</div>
                            <div className="w-20">
                              <Badge variant="default">+{(Math.random() * 20 + 5).toFixed(0)}%</Badge>
                            </div>
                            <div className="w-28">${(Math.random() * 500000 + 50000).toFixed(0)}</div>
                            <div className="w-24">Dec {15 + i}, 2024</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Financial analytics with revenue tracking and forecasting
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}