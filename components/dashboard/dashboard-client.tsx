"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, User } from 'lucide-react'
import StatsCards from './stats-cards'
import ChurnRiskChart from './churn-risk-chart'
import HealthScoreDistribution from './health-score-distribution'
import HealthChurnScatter from './health-churn-scatter'
import RecentActivity from './recent-activity'
import { AIInsightsButton } from '@/components/ai/ai-insights-button'
import { useTour, useShouldAutoStartTour } from '@/lib/hooks/use-tour'
import { TourStartButton } from '@/components/ui/tour-overlay'
import { DashboardHelp } from '@/components/ui/help-system'
import { TOUR_DUMMY_ACCOUNTS, TOUR_DUMMY_STATS, TOUR_DUMMY_ACTIVITIES } from '@/lib/tour-dummy-data'

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
  const router = useRouter()
  const { shouldShowDummyData, startTour } = useTour()
  const shouldAutoStart = useShouldAutoStartTour()
  
  const [selectedTab, setSelectedTab] = useState('all')
  const [stats, setStats] = useState(initialStats)
  const [churnRiskAccounts, setChurnRiskAccounts] = useState(initialChurnRiskAccounts)
  const [accounts, setAccounts] = useState(initialAccounts)
  const [activities, setActivities] = useState(initialActivities)
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  // Debug initial data
  console.log('DashboardClient received initial data:')
  console.log('- Initial activities:', initialActivities?.length || 0)
  console.log('- Current activities state:', activities?.length || 0)

  // Auto-start tour for new users
  useEffect(() => {
    if (shouldAutoStart && !shouldShowDummyData) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        startTour()
      }, 1000)
    }
  }, [shouldAutoStart, shouldShowDummyData, startTour])

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/debug/org')
        if (response.ok) {
          const data = await response.json()
          setOrganizationId(data.organization_id)
          
          if (data.organization_id) {
            const premiumResponse = await fetch(`/api/features/premium?org_id=${data.organization_id}`)
            if (premiumResponse.ok) {
              const premiumData = await premiumResponse.json()
              setIsPremium(premiumData.isPremium || false)
              setIsTrialActive(premiumData.trialActive || false)
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
  
  // Get display data - use dummy data during tour, real data otherwise
  const displayStats = shouldShowDummyData ? TOUR_DUMMY_STATS : stats
  const displayAccounts = shouldShowDummyData ? TOUR_DUMMY_ACCOUNTS.map(acc => ({
    id: acc.id,
    name: acc.name,
    health_score: acc.health_score,
    churn_risk_score: acc.churn_risk === 'very_low' ? 10 : acc.churn_risk === 'low' ? 25 : acc.churn_risk === 'high' ? 75 : 50,
    arr: acc.mrr * 12,
    owner_id: currentUserId,
    status: acc.status
  })) : accounts
  const displayActivities = shouldShowDummyData ? TOUR_DUMMY_ACTIVITIES : activities

  const refreshDashboardData = useCallback(async (ownerId?: string) => {
    setLoading(true)
    try {
      // Fetch dashboard stats with dynamic health scores - this now includes everything we need
      const statsResponse = await fetch(`/api/dashboard/stats-dynamic${ownerId ? `?owner_id=${ownerId}` : ''}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        
        // Set all the data from the single dynamic API call
        setStats(statsData)
        
        // Update accounts with dynamic health scores if available
        if (statsData.accounts) {
          setAccounts(statsData.accounts)
        }
        
        // Update churn risk accounts if available
        if (statsData.churnRiskAccounts) {
          setChurnRiskAccounts(statsData.churnRiskAccounts)
        }
      } else {
        // Fallback to regular stats if dynamic fails
        const fallbackResponse = await fetch(`/api/dashboard/stats${ownerId ? `?owner_id=${ownerId}` : ''}`)
        if (fallbackResponse.ok) {
          const statsData = await fallbackResponse.json()
          setStats(statsData)
        }
        
        // Fallback: Fetch churn risk accounts separately
        const churnResponse = await fetch(`/api/dashboard/churn-risk${ownerId ? `?owner_id=${ownerId}` : ''}`)
        if (churnResponse.ok) {
          const churnData = await churnResponse.json()
          setChurnRiskAccounts(churnData)
        }

        // Fallback: Fetch accounts separately
        const accountsParams = new URLSearchParams()
        if (ownerId) accountsParams.set('owner_id', ownerId)
        accountsParams.set('dynamic_health', 'true')
        accountsParams.set('limit', '100')
        
        const accountsResponse = await fetch(`/api/accounts?${accountsParams.toString()}`)
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json()
          setAccounts(accountsData.data || [])
        }
      }

      // Fetch recent activities (this is separate as it's not in stats-dynamic yet)
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

  // Load dynamic data on initial render
  useEffect(() => {
    refreshDashboardData()
  }, [refreshDashboardData])

  const handleTabChange = useCallback(async (tab: string) => {
    setSelectedTab(tab)
    const ownerId = tab === 'my' ? currentUserId : undefined
    await refreshDashboardData(ownerId)
  }, [currentUserId, refreshDashboardData])

  const handleAccountClick = useCallback((account: any) => {
    router.push(`/dashboard/accounts/${account.id}`)
  }, [router])

  const handleQuadrantClick = useCallback((quadrant: 'expand' | 'retain' | 'improve' | 'emergency', accounts: any[]) => {
    // Navigate to accounts page with quadrant filter
    const params = new URLSearchParams()
    params.set('quadrant', quadrant)
    router.push(`/dashboard/accounts?${params.toString()}`)
  }, [router])

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
        <div className="flex items-center gap-3">
          <DashboardHelp variant="icon" size="md" />
          <TourStartButton />
          <AIInsightsButton
            pageType="dashboard"
            pageContext={{
              activeTab: selectedTab,
              ownerId: selectedTab === 'my' ? currentUserId : undefined
            }}
          />
        </div>
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
          <div data-tour="dashboard-stats">
            <StatsCards stats={displayStats as any} loading={loading} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health vs Churn Risk Scatter Plot */}
            <div className="lg:col-span-2">
              <HealthChurnScatter 
                accounts={displayAccounts.map(account => ({
                  ...account,
                  churn_risk_score: account.churn_risk_score || 0
                }))}
                loading={loading}
                onAccountClick={handleAccountClick}
                onQuadrantClick={handleQuadrantClick}
              />
            </div>

            {/* Health Score Distribution */}
            <HealthScoreDistribution accounts={displayAccounts} loading={loading} />

            {/* Recent Activity */}
            <RecentActivity activities={displayActivities as any} />
          </div>
        </TabsContent>

        <TabsContent value="my" className="space-y-6">
          {/* Stats Cards */}
          <div data-tour="dashboard-stats">
            <StatsCards stats={displayStats as any} loading={loading} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health vs Churn Risk Scatter Plot */}
            <div className="lg:col-span-2">
              <HealthChurnScatter 
                accounts={displayAccounts.map(account => ({
                  ...account,
                  churn_risk_score: account.churn_risk_score || 0
                }))}
                loading={loading}
                onAccountClick={handleAccountClick}
                onQuadrantClick={handleQuadrantClick}
              />
            </div>

            {/* Health Score Distribution */}
            <HealthScoreDistribution accounts={displayAccounts} loading={loading} />

            {/* Recent Activity */}
            <RecentActivity activities={displayActivities as any} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}