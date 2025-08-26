"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import type { ChurnRiskAccount } from "@/lib/types"

interface ChurnRiskChartProps {
  accounts: ChurnRiskAccount[]
}

export default function ChurnRiskChart({ accounts }: ChurnRiskChartProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Critical", color: "bg-red-100 text-red-800", icon: AlertTriangle }
    if (score >= 60) return { label: "High", color: "bg-orange-100 text-orange-800", icon: TrendingDown }
    if (score >= 40) return { label: "Medium", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown }
    return { label: "Low", color: "bg-green-100 text-green-800", icon: TrendingUp }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Churn Risk Analysis
        </CardTitle>
        <CardDescription>Accounts ranked by churn risk score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => {
            const risk = getRiskLevel(account.churn_risk_score)
            const RiskIcon = risk.icon

            return (
              <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RiskIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-foreground">{account.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ARR: {formatCurrency(account.arr)} • Contract ends: {formatDate(account.contract_end_date)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Health: {account.health_score}%</div>
                    <div className="text-sm text-muted-foreground">
                      Last engagement: {formatDate(account.last_engagement)}
                    </div>
                  </div>
                  <Badge className={risk.color}>{risk.label}</Badge>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{account.churn_risk_score}%</div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
