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
  AlertTriangle,
  X,
  Info
} from "lucide-react"
import { format } from "date-fns"

interface SimplifiedHealthScoreCardProps {
  account: {
    id: string
    name: string
    health_score: number
    churn_risk_score: number
    health_components?: {
      engagement: number
      nps: number
      activity: number
      growth: number
      breakdown: {
        engagementScore: {
          score: number
          weight: number
          details: string
        }
        npsScore: {
          score: number
          weight: number
          details: string
        }
        activityScore: {
          score: number
          weight: number
          details: string
        }
        growthScore: {
          score: number
          weight: number
          details: string
        }
      }
    }
    arr?: number
    created_at?: string
  }
  onClose?: () => void
  showCloseButton?: boolean
}

export function SimplifiedHealthScoreCard({ account, onClose, showCloseButton = false }: SimplifiedHealthScoreCardProps) {
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

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 60) return { label: "Good", color: "bg-yellow-100 text-yellow-800" }
    if (score >= 40) return { label: "Fair", color: "bg-orange-100 text-orange-800" }
    return { label: "Poor", color: "bg-red-100 text-red-800" }
  }

  const healthLevel = getHealthLevel(account.health_score)

  // Component data for display
  const componentData = [
    {
      name: "Engagement",
      score: breakdown?.engagementScore?.score || 0,
      weight: breakdown?.engagementScore?.weight || 0.3,
      details: breakdown?.engagementScore?.details || "No engagement data available",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      name: "NPS Score", 
      score: breakdown?.npsScore?.score || 0,
      weight: breakdown?.npsScore?.weight || 0.25,
      details: breakdown?.npsScore?.details || "No NPS data available",
      icon: Star,
      color: "text-yellow-600"
    },
    {
      name: "Activity",
      score: breakdown?.activityScore?.score || 0,
      weight: breakdown?.activityScore?.weight || 0.25,
      details: breakdown?.activityScore?.details || "No activity data available", 
      icon: Activity,
      color: "text-blue-600"
    },
    {
      name: "Growth",
      score: breakdown?.growthScore?.score || 0,
      weight: breakdown?.growthScore?.weight || 0.2,
      details: breakdown?.growthScore?.details || "No growth data available",
      icon: TrendingUp,
      color: "text-green-600"
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
              <CardDescription>Health Score Analysis</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold">{account.health_score}%</div>
              <div className="text-sm text-muted-foreground">
                <Badge className={healthLevel.color}>{healthLevel.label}</Badge>
              </div>
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
            <span className="text-muted-foreground">{account.health_score}%</span>
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
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
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

        {/* Component Breakdown - Simplified Layout */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Health Components</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {componentData.map((component, index) => {
              const Icon = component.icon
              return (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${component.color}`} />
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{component.score}%</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(component.weight * 100)}% weight
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress value={component.score} className="h-2" />
                  
                  <p className="text-sm text-muted-foreground">
                    {component.details}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Health Assessment Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Health Assessment</p>
              <p className="text-muted-foreground">
                {account.health_score >= 80 && "This account shows excellent health with strong engagement and growth patterns."}
                {account.health_score >= 60 && account.health_score < 80 && "This account shows good health with room for improvement in some areas."}
                {account.health_score >= 40 && account.health_score < 60 && "This account shows fair health. Consider targeted improvements to key metrics."}
                {account.health_score < 40 && "This account shows poor health. Immediate attention and improvement plan recommended."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}