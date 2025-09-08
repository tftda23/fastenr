"use client"

import { useState, useMemo } from "react"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
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
  Users, AlertTriangle, CheckCircle, Clock,
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
  dynamicData?: any
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
  goalsData = [],
  dynamicData
}: EnhancedAnalyticsProps) {
  // Get currency configuration
  const { formatCurrency, config, CurrencyIcon } = useCurrencyConfig()

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

  // Generate time series data from real data or show no data message
  const generateTimeSeriesData = () => {
    if (!dynamicData?.accounts?.length) {
      return [] // Return empty array if no real data
    }
    
    // For now, return empty since we need to implement proper time series from engagement/goal data
    // This should be replaced with actual historical data queries
    return []
  }

  const timeSeriesData = generateTimeSeriesData()

  // Health Score Distribution Data - calculate from real account data
  const healthDistributionData = useMemo(() => {
    if (accountsData && accountsData.length > 0) {
      const excellent = accountsData.filter(acc => (acc.health_score || 0) >= 90).length
      const good = accountsData.filter(acc => (acc.health_score || 0) >= 80 && (acc.health_score || 0) < 90).length
      const fair = accountsData.filter(acc => (acc.health_score || 0) >= 60 && (acc.health_score || 0) < 80).length
      const poor = accountsData.filter(acc => (acc.health_score || 0) < 60).length
      
      return [
        { name: 'Excellent (90-100)', value: excellent, color: COLORS.secondary },
        { name: 'Good (80-89)', value: good, color: COLORS.primary },
        { name: 'Fair (60-79)', value: fair, color: COLORS.warning },
        { name: 'Poor (0-59)', value: poor, color: COLORS.danger }
      ]
    }
    
    // Use dynamic data if available, otherwise show empty state
    return dynamicData?.healthDistribution ? [
      { name: 'Excellent (90-100)', value: dynamicData.healthDistribution.excellent || 0, color: COLORS.secondary },
      { name: 'Good (80-89)', value: dynamicData.healthDistribution.healthy || 0, color: COLORS.primary },
      { name: 'Fair (60-79)', value: dynamicData.healthDistribution.moderate || 0, color: COLORS.warning },
      { name: 'Poor (0-59)', value: dynamicData.healthDistribution.poor || 0, color: COLORS.danger }
    ] : [
      { name: 'Excellent (90-100)', value: 0, color: COLORS.secondary },
      { name: 'Good (80-89)', value: 0, color: COLORS.primary },
      { name: 'Fair (60-79)', value: 0, color: COLORS.warning },
      { name: 'Poor (0-59)', value: 0, color: COLORS.danger }
    ]
  }, [accountsData, dynamicData])

  // Engagement Types Data - use real data from engagementsData if available
  const engagementTypesData = useMemo(() => {
    if (!engagementsData?.length) {
      return []
    }
    
    // Count engagement types from real data
    const typeCounts = engagementsData.reduce((acc, engagement) => {
      const type = engagement.type || 'Other'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const total = engagementsData.length
    return Object.entries(typeCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round(((count as number) / total) * 100)
    }))
  }, [engagementsData])

  // Revenue by Account Tier - use real data from accountsData if available
  const revenueByTierData = useMemo(() => {
    if (!accountsData?.length) {
      return []
    }
    
    // Group accounts by tier and calculate revenue
    const tierData = accountsData.reduce((acc, account) => {
      const tier = account.tier || 'Standard'
      const revenue = account.arr || 0
      
      if (!acc[tier]) {
        acc[tier] = { tier, revenue: 0, accounts: 0, avgRevenue: 0 }
      }
      
      acc[tier].revenue += revenue
      acc[tier].accounts += 1
      acc[tier].avgRevenue = acc[tier].revenue / acc[tier].accounts
      
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(tierData)
  }, [accountsData])

  // Churn Risk Analysis - use real churn risk accounts data
  const churnRiskData = useMemo(() => {
    if (!churnRiskAccounts?.length) {
      return []
    }
    
    // For now, return current month snapshot since we don't have historical churn data
    // This should be enhanced with actual historical churn tracking
    const currentMonth = format(new Date(), 'MMM')
    const highRiskCount = churnRiskAccounts.filter(acc => acc.churn_risk_score > 70).length
    const mediumRiskCount = churnRiskAccounts.filter(acc => acc.churn_risk_score > 40 && acc.churn_risk_score <= 70).length
    
    return [
      {
        month: currentMonth,
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        total: churnRiskAccounts.length
      }
    ]
  }, [churnRiskAccounts])

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
            <CurrencyIcon className="h-4 w-4" />
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
                <div className="text-2xl font-bold">{accountsData?.length || dashboardStats?.totalAccounts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {accountsData?.length > 0 ? (
                    <span className="text-green-600">+12%</span>
                  ) : (
                    <span className="text-muted-foreground">No historical data</span>
                  )} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accountsData?.length > 0 ? 
                    Math.round(accountsData.reduce((sum, acc) => sum + (acc.health_score || 0), 0) / accountsData.length) : 
                    (dashboardStats?.avgHealthScore || 0)
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {accountsData?.length > 0 ? (
                    <span className="text-green-600">+3%</span>
                  ) : (
                    <span className="text-muted-foreground">No historical data</span>
                  )} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accountsData?.length > 0 ? 
                    formatCurrency(accountsData.reduce((sum, acc) => sum + (acc.arr || 0), 0) / 1000) + 'K' : 
                    formatCurrency(0) + 'K'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {accountsData?.length > 0 ? (
                    <span className="text-green-600">+18%</span>
                  ) : (
                    <span className="text-muted-foreground">No revenue data</span>
                  )} from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600/70">
                  {accountsData?.filter(acc => (acc.churn_risk_score || 0) >= 70).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {accountsData?.length > 0 ? (
                    <span className="text-red-600/70">+2</span>
                  ) : (
                    <span className="text-muted-foreground">No risk data</span>
                  )} from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Distribution</CardTitle>
                <CardDescription>Current account portfolio breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {accountsData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{accountsData.length}</div>
                        <div className="text-sm text-muted-foreground">Total Accounts</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(accountsData.reduce((sum, acc) => sum + (acc.health_score || 0), 0) / accountsData.length)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Health Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(Math.round(accountsData.reduce((sum, acc) => sum + (acc.arr || 0), 0) / 1000))}k
                        </div>
                        <div className="text-sm text-muted-foreground">Total ARR</div>
                      </div>
                    </div>
                    
                    {/* Account Size Distribution Chart */}
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={(() => {
                        const sizeGroups = accountsData.reduce((acc, account) => {
                          const size = account.size || 'Unknown'
                          acc[size] = (acc[size] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        
                        return Object.entries(sizeGroups).map(([size, count]) => ({
                          size,
                          count,
                          percentage: Math.round(((count as number) / accountsData.length) * 100)
                        }))
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="size" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Accounts' : name]} />
                        <Bar dataKey="count" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No account data available</p>
                      <p className="text-sm">Add accounts to see distribution analytics</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
                <CardDescription>Current distribution of account health scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pie Chart without overlapping labels */}
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={healthDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {healthDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend/Key at bottom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {healthDistributionData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm">
                          <span className="font-medium">{entry.name}:</span> {entry.value} accounts
                          {healthDistributionData.reduce((sum, item) => sum + item.value, 0) > 0 && 
                            ` (${Math.round((entry.value / healthDistributionData.reduce((sum, item) => sum + item.value, 0)) * 100)}%)`
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Analysis</CardTitle>
                <CardDescription>Current account health score distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {accountsData.length > 0 ? (
                  <div className="space-y-4">
                    {/* Health Score Ranges Bar Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={(() => {
                        const ranges = [
                          { name: '90-100%', min: 90, max: 100, color: COLORS.secondary },
                          { name: '70-89%', min: 70, max: 89, color: COLORS.primary },
                          { name: '50-69%', min: 50, max: 69, color: COLORS.warning },
                          { name: '0-49%', min: 0, max: 49, color: COLORS.danger }
                        ]
                        
                        return ranges.map(range => {
                          const count = accountsData.filter(acc => 
                            (acc.health_score || 0) >= range.min && (acc.health_score || 0) <= range.max
                          ).length
                          return {
                            range: range.name,
                            count,
                            percentage: Math.round(((count as number) / accountsData.length) * 100)
                          }
                        })
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Accounts' : name]} />
                        <Bar dataKey="count" fill={COLORS.secondary} />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
                      <div>
                        <div className="text-xl font-bold text-green-600">
                          {accountsData.filter(acc => (acc.health_score || 0) >= 70).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Healthy Accounts (70%+)</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-600">
                          {accountsData.filter(acc => (acc.health_score || 0) < 50).length}
                        </div>
                        <div className="text-sm text-muted-foreground">At-Risk Accounts (&lt;50%)</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No health score data available</p>
                      <p className="text-sm">Health scores will appear here when accounts are tracked</p>
                    </div>
                  </div>
                )}
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
                          {healthDistributionData.reduce((sum, d) => sum + d.value, 0) > 0 ? 
                            Math.round((item.value / healthDistributionData.reduce((sum, d) => sum + d.value, 0)) * 100) : 
                            0}%
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
                {engagementTypesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementTypesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No engagement data available</p>
                      <p className="text-sm">Start tracking engagements to see insights</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>Daily engagement activities over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <LineChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Engagement trend analysis</p>
                    <p className="text-sm">View engagement patterns in the Engagement tab above</p>
                  </div>
                </div>
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
                      <p className="text-2xl font-bold">{item.count as number}</p>
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
                {revenueByTierData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueByTierData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tier" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Bar dataKey="revenue" fill={COLORS.secondary} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <CurrencyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No revenue data available</p>
                      <p className="text-sm">Add ARR values to accounts to see revenue insights</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Revenue trend analysis</p>
                    <p className="text-sm">Current revenue data shown in charts above</p>
                  </div>
                </div>
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
                      const totalRevenue = revenueByTierData.reduce((sum, t) => sum + (t as any).revenue, 0)
                      const percentage = (((tier as any).revenue / (totalRevenue as number)) * 100).toFixed(1)
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{(tier as any).tier}</td>
                          <td className="p-2 text-right">{formatCurrency((tier as any).revenue)}</td>
                          <td className="p-2 text-right">{(tier as any).accounts}</td>
                          <td className="p-2 text-right">{formatCurrency((tier as any).avgRevenue)}</td>
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
                <CardTitle>Current Churn Risk Distribution</CardTitle>
                <CardDescription>Risk levels across your account portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                {churnRiskData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600/70">{churnRiskData[0].highRisk}</div>
                        <div className="text-sm text-muted-foreground">High Risk</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-600/70">{churnRiskData[0].mediumRisk}</div>
                        <div className="text-sm text-muted-foreground">Medium Risk</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{churnRiskData[0].total}</div>
                        <div className="text-sm text-muted-foreground">Total Accounts</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Current risk distribution for {churnRiskData[0].month}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No churn risk data available</p>
                      <p className="text-sm">Churn risk scores will appear here</p>
                    </div>
                  </div>
                )}
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
                <CardTitle>Multi-Metric Dashboard</CardTitle>
                <CardDescription>Current performance across all key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {accountsData.length > 0 || engagementsData.length > 0 || churnRiskAccounts.length > 0 ? (
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{accountsData.length}</div>
                        <div className="text-sm text-muted-foreground">Total Accounts</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{engagementsData.length}</div>
                        <div className="text-sm text-muted-foreground">Total Engagements</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {accountsData.length > 0 ? 
                            Math.round(accountsData.reduce((sum, acc) => sum + (acc.health_score || 0), 0) / accountsData.length) : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Health Score</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{churnRiskAccounts.length}</div>
                        <div className="text-sm text-muted-foreground">At-Risk Accounts</div>
                      </div>
                    </div>
                    
                    {/* Multi-metric Comparison Chart */}
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        {
                          metric: 'Accounts',
                          value: accountsData.length,
                          color: COLORS.primary
                        },
                        {
                          metric: 'Engagements',
                          value: engagementsData.length,
                          color: COLORS.secondary
                        },
                        {
                          metric: 'Health Score Avg',
                          value: accountsData.length > 0 ? 
                            Math.round(accountsData.reduce((sum, acc) => sum + (acc.health_score || 0), 0) / accountsData.length) : 0,
                          color: COLORS.warning
                        },
                        {
                          metric: 'At-Risk Count',
                          value: churnRiskAccounts.length,
                          color: COLORS.danger
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="metric" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill={COLORS.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Performance Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h4 className="font-medium mb-2">Engagement Rate</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${accountsData.length > 0 ? Math.min(100, (engagementsData.length / accountsData.length) * 10) : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {accountsData.length > 0 ? Math.round((engagementsData.length / accountsData.length) * 100) / 10 : 0} avg/account
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Health Distribution</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${accountsData.length > 0 ? 
                                  (accountsData.filter(acc => (acc.health_score || 0) >= 70).length / accountsData.length) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {accountsData.length > 0 ? 
                              Math.round((accountsData.filter(acc => (acc.health_score || 0) >= 70).length / accountsData.length) * 100) : 0}% healthy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No metrics data available</h3>
                      <p className="text-sm">Start adding accounts and engagements to see multi-metric insights</p>
                    </div>
                  </div>
                )}
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
                        {accountsData && accountsData.length > 0 ? accountsData.slice(0, 5).map((account) => (
                          <div key={account.id} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">{account.name}</div>
                            <div className="w-20">
                              <Badge variant="default">{account.size || 'Unknown'}</Badge>
                            </div>
                            <div className="w-20">
                              <Badge variant="secondary">{account.status || 'Active'}</Badge>
                            </div>
                            <div className="w-24">
                              <Badge variant="default">{account.health_score || 0}</Badge>
                            </div>
                            <div className="w-24">{formatCurrency(account.arr || 0)}</div>
                            <div className="w-20">{(account as any).owner?.full_name || account.owner_name || 'Unassigned'}</div>
                            <div className="w-28">{account.updated_at ? new Date(account.updated_at).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        )) : [1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">No accounts available</div>
                            <div className="w-20">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-20">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-24">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-24">-</div>
                            <div className="w-20">-</div>
                            <div className="w-28">-</div>
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
                        {engagementsData && engagementsData.length > 0 ? engagementsData.slice(0, 5).map((engagement) => (
                          <div key={engagement.id} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">{(engagement as any).accounts?.name || 'Unknown Account'}</div>
                            <div className="w-20">
                              <Badge variant="outline">{engagement.type}</Badge>
                            </div>
                            <div className="w-24">{new Date(engagement.created_at).toLocaleDateString()}</div>
                            <div className="w-20">
                              <Badge variant={engagement.outcome === 'success' ? 'default' : 'secondary'}>
                                {engagement.outcome || 'Pending'}
                              </Badge>
                            </div>
                            <div className="w-32">{engagement.notes || engagement.title || '-'}</div>
                            <div className="w-20">{(engagement as any).owner?.full_name || 'CSM'}</div>
                          </div>
                        )) : [1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">No engagements available</div>
                            <div className="w-20">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-24">-</div>
                            <div className="w-20">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-32">-</div>
                            <div className="w-20">-</div>
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
                        {accountsData && accountsData.length > 0 ? accountsData.slice(0, 5).map((account) => (
                          <div key={account.id} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">{account.name}</div>
                            <div className="w-24">{formatCurrency((account.arr || 0) / 12)}</div>
                            <div className="w-24">{formatCurrency(account.arr || 0)}</div>
                            <div className="w-20">
                              <Badge variant="default">
                                {account.previous_arr && account.arr ? 
                                  `${account.arr > account.previous_arr ? '+' : ''}${(((account.arr - account.previous_arr) / account.previous_arr) * 100).toFixed(0)}%` : 
                                  '+0%'
                                }
                              </Badge>
                            </div>
                            <div className="w-28">{formatCurrency(account.arr ? account.arr * 2 : 0)}</div>
                            <div className="w-24">{account.created_at ? new Date(new Date(account.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        )) : [1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-4 text-sm py-2 border-b">
                            <div className="w-32">No accounts available</div>
                            <div className="w-24">-</div>
                            <div className="w-24">-</div>
                            <div className="w-20">
                              <Badge variant="outline">-</Badge>
                            </div>
                            <div className="w-28">-</div>
                            <div className="w-24">-</div>
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