"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, User } from 'lucide-react'
import StatsCards from './stats-cards'
import ChurnRiskChart from './churn-risk-chart'
import HealthScoreDistribution from './health-score-distribution'
import RecentActivity from './recent-activity'
import { AIInsightsButton } from '@/components/ai/ai-insights-button'

interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  atRiskAccounts: number
  churnedAccounts: number
  averageHealthScore: number
  averageChurnRisk: number
  totalARR: number
  npsScore: number
}

interface Account {
  id: string
  name: string
  churn_risk_score: number
  health_score: number
  arr?: number
  owner_id?: string
  engagements?: { completed_at: string }[]
}

interface Activity {
  id: string
  type: 'engagement' | 'goal' | 'nps'
  title: string
  description: string
  timestamp: string
  account: string
  user: string
  account_id?: string
}

interface DashboardClientProps {
  initialStats: DashboardStats
  initialChurnRiskAccounts: Account[]
  initialAccounts: Account[]
  initialActivities: Activity[]
  currentUserId: string
  userFullName?: string
  userRole: string
}

export function DashboardClient({
  initialStats,
  initialChurnRiskAccounts,
  initialAccounts,
  initialActivities,
  currentUserId,
  userFullName,
  userRole
}: DashboardClientProps) {
  const [selectedTab, setSelectedTab] = useState('all')
  const [stats, setStats] = useState(initialStats)
  const [churnRiskAccounts, setChurnRiskAccounts] = useState(initialChurnRiskAccounts)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [activities, setActivities] = useState(initialActivities)
  const [loading, setLoading] = useState(false)

  // Debug initial data
  console.log('DashboardClient received initial data:')
  console.log('- Initial activities:', initialActivities?.length || 0)
  console.log('- Current activities state:', activities?.length || 0)

  const refreshDashboardData = useCallback(async (ownerId?: string) => {
    setLoading(true)
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch(`/api/dashboard/stats${ownerId ? `?owner_id=${ownerId}` : ''}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch churn risk accounts
      const churnResponse = await fetch(`/api/dashboard/churn-risk${ownerId ? `?owner_id=${ownerId}` : ''}`)
      if (churnResponse.ok) {
        const churnData = await churnResponse.json()
        setChurnRiskAccounts(churnData)
      }

      // Fetch accounts for health distribution
      const accountsResponse = await fetch(`/api/accounts${ownerId ? `?owner_id=${ownerId}` : ''}`)
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData.data || [])
      }

      // Fetch recent activities
      const activitiesResponse = await fetch(`/api/dashboard/activities${ownerId ? `?owner_id=${ownerId}` : ''}`)
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        console.log('Client: Received activities:', activitiesData.length, 'activities')
        setActivities(activitiesData)
      } else {
        console.error('Client: Failed to fetch activities:', activitiesResponse.status)
      }
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleTabChange = useCallback(async (tab: string) => {
    setSelectedTab(tab)
    const ownerId = tab === 'my' ? currentUserId : undefined
    await refreshDashboardData(ownerId)
  }, [currentUserId, refreshDashboardData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userFullName} • {userRole}
          </p>
        </div>
        <AIInsightsButton 
          pageType="dashboard" 
          pageContext={{ 
            activeTab: selectedTab,
            ownerId: selectedTab === 'my' ? currentUserId : undefined
          }}
        />
      </div>

      {/* Account Filter Tabs */}
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="all" className="flex-1 flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4" />
            All Accounts
          </TabsTrigger>
          <TabsTrigger value="my" className="flex-1 flex items-center justify-center gap-2">
            <User className="h-4 w-4" />
            My Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats as any} loading={loading} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Distribution */}
            <HealthScoreDistribution accounts={accounts} loading={loading} />

            {/* Recent Activity */}
            <RecentActivity activities={activities} />

            {/* Churn Risk Analysis */}
            <div className="lg:col-span-2">
              <ChurnRiskChart
                accounts={churnRiskAccounts.map((account) => ({
                  ...account,
                  href: `/dashboard/accounts/${account.id}`,
                })) as any}
                loading={loading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats as any} loading={loading} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Distribution */}
            <HealthScoreDistribution accounts={accounts} loading={loading} />

            {/* Recent Activity */}
            <RecentActivity activities={activities} />

            {/* Churn Risk Analysis */}
            <div className="lg:col-span-2">
              <ChurnRiskChart
                accounts={churnRiskAccounts.map((account) => ({
                  ...account,
                  href: `/dashboard/accounts/${account.id}`,
                })) as any}
                loading={loading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}