"use client"

import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Star,
  Calendar,
  DollarSign,
  Users,
  X,
  Info,
  Clock
} from "lucide-react"
import { format } from "date-fns"

interface HealthScoreCardProps {
  account: {
    id: string
    name: string
    health_score: number
    health_components?: {
      engagement: number
      nps: number
      activity: number
      growth: number
      breakdown: {
        engagementScore: {
          score: number
          weight: number
          recentEngagements: number
          lastEngagementDays: number
          details: string
        }
        npsScore: {
          score: number
          weight: number
          averageNps: number
          responseCount: number
          details: string
        }
        activityScore: {
          score: number
          weight: number
          totalActivities: number
          details: string
        }
        growthScore: {
          score: number
          weight: number
          arrGrowth: number
          details: string
        }
      }
    }
    arr?: number
    churn_risk_score?: number
    created_at?: string
  }
  onClose?: () => void
  showCloseButton?: boolean
}

export function HealthScoreCard({ account, onClose, showCloseButton = false }: HealthScoreCardProps) {
  const { formatCurrency, CurrencyIcon } = useCurrencyConfig()
  const healthComponents = account.health_components
  const breakdown = healthComponents?.breakdown

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const componentData = [
    {
      name: "Engagement",
      icon: MessageSquare,
      score: healthComponents?.engagement || 0,
      weight: breakdown?.engagementScore?.weight ?? 30,
      details: breakdown?.engagementScore?.details || "No engagement data available",
      metrics: [
        { 
          label: "Recent Engagements", 
          value: breakdown?.engagementScore?.recentEngagements || 0,
          suffix: " this month"
        },
        { 
          label: "Last Engagement", 
          value: breakdown?.engagementScore?.lastEngagementDays || 0,
          suffix: " days ago"
        }
      ]
    },
    {
      name: "Satisfaction (NPS)",
      icon: Star,
      score: healthComponents?.nps || 0,
      weight: breakdown?.npsScore?.weight ?? 25,
      details: breakdown?.npsScore?.details || "No NPS data available",
      metrics: [
        { 
          label: "Average NPS", 
          value: breakdown?.npsScore?.averageNps || 0,
          suffix: ""
        },
        { 
          label: "Survey Responses", 
          value: breakdown?.npsScore?.responseCount || 0,
          suffix: " surveys"
        }
      ]
    },
    {
      name: "Activity",
      icon: Activity,
      score: healthComponents?.activity || 0,
      weight: breakdown?.activityScore?.weight ?? 25,
      details: breakdown?.activityScore?.details || "No activity data available",
      metrics: [
        { 
          label: "Total Activities", 
          value: breakdown?.activityScore?.totalActivities || 0,
          suffix: " activities"
        }
      ]
    },
    {
      name: "Growth",
      icon: TrendingUp,
      score: healthComponents?.growth || 0,
      weight: breakdown?.growthScore?.weight ?? 20,
      details: breakdown?.growthScore?.details || "No growth data available",
      metrics: [
        { 
          label: "ARR Growth", 
          value: breakdown?.growthScore?.arrGrowth || 0,
          suffix: "%"
        }
      ]
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${getScoreColor(account.health_score)}`}>
              <Heart className={`h-6 w-6 ${getScoreIcon(account.health_score)}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <CardDescription>Health Score Breakdown</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold">{account.health_score}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Health Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Health Score</span>
            <span className="text-muted-foreground">{account.health_score}/100</span>
          </div>
          <Progress value={account.health_score} className="h-3" />
        </div>

        <Separator />

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{formatCurrency(account.arr || 0)}</div>
              <div className="text-muted-foreground">Annual Recurring Revenue</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">{account.churn_risk_score || 0}%</div>
              <div className="text-muted-foreground">Churn Risk</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <div className="font-medium">
                {account.created_at ? format(new Date(account.created_at), 'MMM yyyy') : 'N/A'}
              </div>
              <div className="text-muted-foreground">Customer Since</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Component Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Score Components</h3>
          </div>

          <div className="space-y-4">
            {componentData.map((component) => {
              const Icon = component.icon
              return (
                <Card key={component.name} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getScoreColor(component.score)} border`}>
                          <Icon className={`h-4 w-4 ${getScoreIcon(component.score)}`} />
                        </div>
                        <div>
                          <div className="font-medium">{component.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Weight: {component.weight}% of total score
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{component.score}</div>
                        <div className="text-sm text-muted-foreground">
                          Contributes {Math.round(component.score * component.weight / 100)} pts
                        </div>
                      </div>
                    </div>

                    {/* Component Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <Progress value={component.score} className="h-2" />
                    </div>

                    {/* Component Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {component.metrics.map((metric, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="text-sm font-medium">{metric.label}</span>
                          <Badge variant="secondary">
                            {metric.value}{metric.suffix}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Component Details */}
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                      <strong>Analysis:</strong> {component.details}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Calculation Summary */}
        <Separator />
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Score Calculation</h3>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="text-sm font-mono">
              Health Score = (Engagement × {breakdown?.engagementScore?.weight ?? 30}%) + 
              (NPS × {breakdown?.npsScore?.weight ?? 25}%) + 
              (Activity × {breakdown?.activityScore?.weight ?? 25}%) + 
              (Growth × {breakdown?.growthScore?.weight ?? 20}%)
            </div>
            <div className="text-sm font-mono">
              = ({healthComponents?.engagement || 0} × {((breakdown?.engagementScore?.weight ?? 30) / 100).toFixed(2)}) + 
              ({healthComponents?.nps || 0} × {((breakdown?.npsScore?.weight ?? 25) / 100).toFixed(2)}) + 
              ({healthComponents?.activity || 0} × {((breakdown?.activityScore?.weight ?? 25) / 100).toFixed(2)}) + 
              ({healthComponents?.growth || 0} × {((breakdown?.growthScore?.weight ?? 20) / 100).toFixed(2)})
            </div>
            <div className="text-sm font-mono font-bold">
              = {account.health_score} points
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            * Weights are configurable in Admin Settings → Health Score Configuration
          </div>
        </div>
      </CardContent>
    </Card>
  )
}