"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Loader2 } from "lucide-react"

interface HealthScoreDistributionProps {
  accounts: Array<{ health_score: number; name: string }>
  loading?: boolean
}

export default function HealthScoreDistribution({ accounts, loading = false }: HealthScoreDistributionProps) {
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Health Score Distribution
          </CardTitle>
          <CardDescription>Account health breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded">
                  <div 
                    className="h-2 bg-gray-200 rounded"
                    style={{ width: `${20 + (i * 15)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  // Calculate distribution
  const distribution = {
    excellent: accounts.filter((a) => a.health_score >= 80).length,
    good: accounts.filter((a) => a.health_score >= 60 && a.health_score < 80).length,
    fair: accounts.filter((a) => a.health_score >= 40 && a.health_score < 60).length,
    poor: accounts.filter((a) => a.health_score < 40).length,
  }

  const total = accounts.length
  const categories = [
    {
      name: "Excellent (80-100%)",
      count: distribution.excellent,
      color: "bg-green-500",
      percentage: (distribution.excellent / total) * 100,
    },
    {
      name: "Good (60-79%)",
      count: distribution.good,
      color: "bg-blue-500",
      percentage: (distribution.good / total) * 100,
    },
    {
      name: "Fair (40-59%)",
      count: distribution.fair,
      color: "bg-yellow-500",
      percentage: (distribution.fair / total) * 100,
    },
    {
      name: "Poor (0-39%)",
      count: distribution.poor,
      color: "bg-red-500",
      percentage: (distribution.poor / total) * 100,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Health Score Distribution
        </CardTitle>
        <CardDescription>Account health across your customer base</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="text-muted-foreground">
                  {category.count} accounts ({category.percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Average Health Score</p>
              <p className="text-2xl font-bold text-green-600">
                {(accounts.reduce((sum, a) => sum + a.health_score, 0) / accounts.length).toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Accounts</p>
              <p className="text-lg font-semibold">{total}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
