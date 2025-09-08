import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SimplifiedHealthScoreCard } from '@/components/health/simplified-health-score-card'
import { ChurnRiskCard } from '@/components/health/churn-risk-card'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: {
    id: string
  }
}

async function getAccountHealthData(accountId: string) {
  // Get account basic data with timeout
  const supabase = createClient()
  
  try {
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error || !account) {
      console.error('Account not found:', error)
      return null
    }

    // Calculate health score and churn risk directly without HTTP request for better performance
    try {
      // Import both engines directly
      const { calculateHealthScore } = await import('@/lib/health-score-engine')
      const { calculateChurnRisk } = await import('@/lib/churn-risk-engine')
      
      const [healthData, churnData] = await Promise.all([
        calculateHealthScore(account.id),
        calculateChurnRisk(account.id)
      ])

    // Get NPS data from surveys
    const { data: npsData } = await supabase
      .from('nps_responses')
      .select('score, feedback, survey_date, respondent_name')
      .eq('account_id', accountId)
      .order('survey_date', { ascending: false })
      .limit(10)

    const latestNps = npsData && npsData.length > 0 ? npsData[0] : null

    return {
      ...account,
      health_score: Math.round(healthData.overall),
      churn_risk_score: Math.round(churnData.overall),
      health_components: {
        engagement: Math.round(healthData.engagement * 100),
        nps: Math.round(healthData.nps * 100),
        activity: Math.round(healthData.activity * 100),
        growth: Math.round(healthData.growth * 100),
        breakdown: {
          engagementScore: {
            score: Math.round(healthData.engagement * 100),
            weight: 0.3,
            recentEngagements: healthData.breakdown?.engagementScore?.recentEngagements || 0,
            lastEngagementDays: healthData.breakdown?.engagementScore?.lastEngagementDays || 0,
            details: healthData.breakdown?.engagementScore?.details || 'No engagement data available'
          },
          npsScore: {
            score: Math.round(healthData.nps * 100),
            weight: 0.25,
            averageNps: healthData.breakdown?.npsScore?.averageNps || 0,
            responseCount: healthData.breakdown?.npsScore?.responseCount || 0,
            details: healthData.breakdown?.npsScore?.details || 'No NPS data available'
          },
          activityScore: {
            score: Math.round(healthData.activity * 100),
            weight: 0.25,
            totalActivities: healthData.breakdown?.activityScore?.totalActivities || 0,
            details: healthData.breakdown?.activityScore?.details || 'No activity data available'
          },
          growthScore: {
            score: Math.round(healthData.growth * 100),
            weight: 0.2,
            arrGrowth: healthData.breakdown?.growthScore?.growthPercentage || 0,
            details: healthData.breakdown?.growthScore?.details || 'No growth data available'
          }
        }
      },
      churn_components: {
        usage: Math.round(churnData.usage * 100),
        relationship: Math.round(churnData.relationship * 100),  
        satisfaction: Math.round(churnData.satisfaction * 100),
        contract: Math.round(churnData.contract * 100),
        breakdown: {
          activityRisk: {
            score: Math.round(churnData.usage * 100),
            weight: 0.3,
            details: churnData.breakdown?.usageRisk?.details || 'No usage risk data available'
          },
          engagementRisk: {
            score: Math.round(churnData.relationship * 100),
            weight: 0.25,
            details: churnData.breakdown?.relationshipRisk?.details || 'No relationship risk data available'
          },
          supportRisk: {
            score: Math.round(churnData.satisfaction * 100),
            weight: 0.25,
            details: churnData.breakdown?.satisfactionRisk?.details || 'No satisfaction risk data available'
          },
          contractRisk: {
            score: Math.round(churnData.contract * 100),
            weight: 0.2,
            details: churnData.breakdown?.contractRisk?.details || 'No contract risk data available'
          }
        }
      }
    }
  } catch (error) {
    console.error('Error calculating health data:', error)
    // Return account with default health data
    return {
      ...account,
      health_score: account.health_score || 0,
      churn_risk_score: account.churn_risk_score || 0,
      health_components: undefined
    }
    }
  } catch (outerError) {
    console.error('Error in getAccountHealthData:', outerError)
    return null
  }
}

export default async function HealthScoreBreakdownPage({ params }: PageProps) {
  const account = await getAccountHealthData(params.id)

  if (!account) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/health">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Health Scores
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{account.name}</h1>
            <p className="text-muted-foreground">Health Score Analysis</p>
          </div>
        </div>
      </div>

      {/* Health & Churn Analysis Tabs */}
      <Suspense 
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading analysis...</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">Health Score Analysis</TabsTrigger>
            <TabsTrigger value="churn">Churn Risk Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="mt-6">
            <SimplifiedHealthScoreCard 
              account={account}
              showCloseButton={false}
            />
          </TabsContent>
          
          <TabsContent value="churn" className="mt-6">
            <ChurnRiskCard 
              account={account}
              showCloseButton={false}
            />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const account = await getAccountHealthData(params.id)
  
  if (!account) {
    return {
      title: 'Account Not Found'
    }
  }

  return {
    title: `${account.name} - Health Score Analysis`,
    description: `Detailed health score breakdown for ${account.name}`
  }
}