"use client"

import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  Activity, 
  MessageSquare, 
  HeadphonesIcon,
  FileText,
  X,
  Info,
  Clock,
  TrendingUp,
  Calendar
} from "lucide-react"
import { format } from "date-fns"

interface ChurnRiskCardProps {
  account: {
    id: string
    name: string
    health_score: number
    churn_risk_score: number
    churn_components?: {
      activity: number
      engagement: number
      support: number
      contract: number
      breakdown: {
        activityRisk: {
          score: number
          weight: number
          details: string
        }
        engagementRisk: {
          score: number
          weight: number
          details: string
        }
        supportRisk: {
          score: number
          weight: number
          details: string
        }
        contractRisk: {
          score: number
          weight: number
          details: string
        }
      }
    }
    arr?: number
    health_score?: number
    created_at?: string
  }
  onClose?: () => void
  showCloseButton?: boolean
}

export function ChurnRiskCard({ account, onClose, showCloseButton = false }: ChurnRiskCardProps) {
  const { formatCurrency, CurrencyIcon } = useCurrencyConfig()
  const churnComponents = account.churn_components
  const breakdown = churnComponents?.breakdown

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-green-600 bg-green-50 border-green-200"
    if (score <= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getScoreIcon = (score: number) => {
    if (score <= 30) return "text-green-600"
    if (score <= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: "Low Risk", color: "bg-green-100 text-green-800" }
    if (score <= 50) return { label: "Medium Risk", color: "bg-yellow-100 text-yellow-800" }
    if (score <= 75) return { label: "High Risk", color: "bg-orange-100 text-orange-800" }
    return { label: "Critical Risk", color: "bg-red-100 text-red-800" }
  }

  const riskLevel = getRiskLevel(account.churn_risk_score)

  // Component data for display
  const componentData = [
    {
      name: "Activity Risk",
      score: breakdown?.activityRisk?.score || 0,
      weight: breakdown?.activityRisk?.weight || 0.3,
      details: breakdown?.activityRisk?.details || "No activity risk data available",
      icon: Activity,
      color: "text-blue-600"
    },
    {
      name: "Engagement Risk", 
      score: breakdown?.engagementRisk?.score || 0,
      weight: breakdown?.engagementRisk?.weight || 0.25,
      details: breakdown?.engagementRisk?.details || "No engagement risk data available",
      icon: MessageSquare,
      color: "text-purple-600"
    },
    {
      name: "Support Risk",
      score: breakdown?.supportRisk?.score || 0,
      weight: breakdown?.supportRisk?.weight || 0.25,
      details: breakdown?.supportRisk?.details || "No support risk data available", 
      icon: HeadphonesIcon,
      color: "text-orange-600"
    },
    {
      name: "Contract Risk",
      score: breakdown?.contractRisk?.score || 0,
      weight: breakdown?.contractRisk?.weight || 0.2,
      details: breakdown?.contractRisk?.details || "No contract risk data available",
      icon: FileText,
      color: "text-green-600"
    }
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${getScoreColor(account.churn_risk_score)}`}>
              <AlertTriangle className={`h-6 w-6 ${getScoreIcon(account.churn_risk_score)}`} />
            </div>
            <div>
              <CardTitle className="text-xl">{account.name}</CardTitle>
              <CardDescription>Churn Risk Analysis</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-bold">{account.churn_risk_score}%</div>
              <div className="text-sm text-muted-foreground">
                <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
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
        {/* Overall Churn Risk Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Churn Risk Level</span>
            <span className="text-muted-foreground">{account.churn_risk_score}%</span>
          </div>
          <Progress 
            value={account.churn_risk_score} 
            className="h-3"
            // Use different color for churn risk (higher is worse)
            style={{
              background: account.churn_risk_score > 75 ? '#fee2e2' :
                         account.churn_risk_score > 50 ? '#fef3c7' : '#dcfce7'
            }}
          />
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
              <div className="font-medium">{account.health_score || 0}%</div>
              <div className="text-muted-foreground">Health Score</div>
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
          <h3 className="text-lg font-semibold">Risk Factors</h3>
          
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
                  
                  <Progress 
                    value={component.score} 
                    className="h-2"
                    style={{
                      background: component.score > 75 ? '#fee2e2' :
                                 component.score > 50 ? '#fef3c7' : '#dcfce7'
                    }}
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {component.details}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Risk Assessment</p>
              <p className="text-muted-foreground">
                {account.churn_risk_score <= 30 && "This account shows low churn risk with healthy engagement and activity patterns."}
                {account.churn_risk_score > 30 && account.churn_risk_score <= 50 && "This account shows moderate churn risk. Consider proactive engagement to improve retention."}
                {account.churn_risk_score > 50 && account.churn_risk_score <= 75 && "This account shows high churn risk. Immediate attention and intervention recommended."}
                {account.churn_risk_score > 75 && "This account shows critical churn risk. Urgent intervention required to prevent churn."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}