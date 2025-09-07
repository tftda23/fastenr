"use client"

import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, Loader2, Eye } from "lucide-react"
import { useState } from "react"

interface Account {
  id: string
  name: string
  health_score: number
  churn_risk_score: number
  arr?: number
  status?: string
}

interface HealthChurnScatterProps {
  accounts: Account[]
  loading?: boolean
  onAccountClick?: (account: Account) => void
  onQuadrantClick?: (quadrant: 'expand' | 'retain' | 'improve' | 'emergency', accounts: Account[]) => void
}

export default function HealthChurnScatter({ accounts, loading = false, onAccountClick, onQuadrantClick }: HealthChurnScatterProps) {
  const { formatCurrency, config } = useCurrencyConfig()
  const [hoveredAccount, setHoveredAccount] = useState<Account | null>(null)
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Health vs Churn Risk Analysis
          </CardTitle>
          <CardDescription>Account positioning and risk assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeleton for quadrant stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border animate-pulse">
                <div className="h-8 w-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-20 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Skeleton for scatter plot */}
          <div className="relative">
            <div className="w-full h-96 bg-gray-50 rounded-lg border relative overflow-hidden animate-pulse">
              {/* Grid lines - same as actual */}
              <div className="absolute inset-0">
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="absolute top-[50%] left-0 right-0 h-px bg-gray-300"></div>
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-200"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
              </div>
              
              {/* Skeleton dots scattered around */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gray-200 rounded-full animate-pulse"
                  style={{
                    left: `${20 + (i * 8) + (i % 3) * 10}%`,
                    top: `${15 + (i * 7) + (i % 4) * 12}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
              
              {/* Axis labels skeleton */}
              <div className="absolute bottom-0 left-0 transform translate-y-6">
                <div className="h-3 w-4 bg-gray-200 rounded"></div>
              </div>
              <div className="absolute bottom-0 right-0 transform translate-y-6">
                <div className="h-3 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="absolute top-0 left-0 transform -translate-x-8">
                <div className="h-3 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="absolute bottom-0 left-0 transform -translate-x-8">
                <div className="h-3 w-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate quadrant statistics
  // Expand: High Health (>=50), Low Churn Risk (<=50) - Top Right
  // Retain: Low Health (<50), Low Churn Risk (<=50) - Top Left  
  // Improve: High Health (>=50), High Churn Risk (>50) - Bottom Right
  // Emergency: Low Health (<50), High Churn Risk (>50) - Bottom Left
  const quadrants = {
    expand: accounts.filter(a => a.health_score >= 50 && a.churn_risk_score <= 50),
    retain: accounts.filter(a => a.health_score < 50 && a.churn_risk_score <= 50),
    improve: accounts.filter(a => a.health_score >= 50 && a.churn_risk_score > 50),
    emergency: accounts.filter(a => a.health_score < 50 && a.churn_risk_score > 50),
  }

  const getQuadrantColor = (health: number, churn: number) => {
    if (health >= 50 && churn <= 50) return "bg-green-500/60" // Expand (Top Right) - muted green
    if (health < 50 && churn <= 50) return "bg-yellow-500/60" // Retain (Top Left) - muted yellow
    if (health >= 50 && churn > 50) return "bg-blue-500/60" // Improve (Bottom Right) - muted blue
    return "bg-red-500/60" // Emergency (Bottom Left) - muted red
  }

  const getQuadrantLabel = (health: number, churn: number) => {
    if (health >= 50 && churn <= 50) return "Expand"
    if (health < 50 && churn <= 50) return "Retain" 
    if (health >= 50 && churn > 50) return "Improve"
    return "Emergency"
  }

  const getBubbleSize = (arr: number) => {
    if (arr > 50000) return 20
    if (arr > 20000) return 16
    if (arr > 10000) return 12
    if (arr > 5000) return 10
    return 8
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Health vs Churn Risk Analysis
        </CardTitle>
        <CardDescription>Account positioning and strategic prioritization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Quadrant Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => onQuadrantClick?.('emergency', quadrants.emergency)}
              className="text-center p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-red-700">{quadrants.emergency.length}</div>
              <div className="text-sm text-red-600">Emergency</div>
              <div className="text-xs text-red-500">Low Health, High Risk</div>
            </button>
            <button 
              onClick={() => onQuadrantClick?.('improve', quadrants.improve)}
              className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-blue-700">{quadrants.improve.length}</div>
              <div className="text-sm text-blue-600">Improve</div>
              <div className="text-xs text-blue-500">High Health, High Risk</div>
            </button>
            <button 
              onClick={() => onQuadrantClick?.('retain', quadrants.retain)}
              className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-yellow-700">{quadrants.retain.length}</div>
              <div className="text-sm text-yellow-600">Retain</div>
              <div className="text-xs text-yellow-500">Low Health, Low Risk</div>
            </button>
            <button 
              onClick={() => onQuadrantClick?.('expand', quadrants.expand)}
              className="text-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
            >
              <div className="text-2xl font-bold text-green-700">{quadrants.expand.length}</div>
              <div className="text-sm text-green-600">Expand</div>
              <div className="text-xs text-green-500">High Health, Low Risk</div>
            </button>
          </div>

          {/* Scatter Plot */}
          <div className="relative">
            <div className="w-full h-96 bg-gray-50 rounded-lg border relative overflow-hidden" data-tour="health-scatter">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {/* Vertical line at 50% health */}
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gray-400"></div>
                {/* Horizontal line at 50% churn risk */}
                <div className="absolute top-[50%] left-0 right-0 h-px bg-gray-400"></div>
                {/* Additional grid lines */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
              </div>

              {/* Axis Labels with Values */}
              <div className="absolute bottom-0 left-0 transform translate-y-6 text-xs text-gray-500 font-medium">
                0
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-gray-500 font-medium">
                50
              </div>
              <div className="absolute bottom-0 right-0 transform translate-y-6 text-xs text-gray-500 font-medium">
                100
              </div>
              <div className="absolute left-0 bottom-0 transform -translate-x-8 text-xs text-gray-500 font-medium">
                0
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-x-8 -translate-y-1/2 text-xs text-gray-500 font-medium">
                50
              </div>
              <div className="absolute left-0 top-0 transform -translate-x-8 text-xs text-gray-500 font-medium">
                100
              </div>

              {/* Quadrant Labels */}
              <div className="absolute top-2 right-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                Expand
              </div>
              <div className="absolute top-2 left-2 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Retain
              </div>
              <div className="absolute bottom-2 right-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Improve
              </div>
              <div className="absolute bottom-2 left-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                Emergency
              </div>

              {/* Axis Titles */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 text-xs text-gray-600 font-medium">
                Health Score →
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 -rotate-90 text-xs text-gray-600 font-medium">
                Churn Risk →
              </div>

              {/* Data Points */}
              {accounts.map((account) => {
                const x = (account.health_score / 100) * 100 // Convert to percentage of width
                const y = (account.churn_risk_score / 100) * 100 // Y axis: high risk at bottom, low risk at top
                const size = getBubbleSize(account.arr || 0)
                
                return (
                  <div
                    key={account.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-all hover:scale-110 ${getQuadrantColor(account.health_score, account.churn_risk_score)} hover:opacity-100`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                    onMouseEnter={() => setHoveredAccount(account)}
                    onMouseLeave={() => setHoveredAccount(null)}
                    onClick={() => onAccountClick?.(account)}
                    title={`${account.name}: ${account.health_score}% health, ${account.churn_risk_score}% risk`}
                  />
                )
              })}

              {/* Hover Tooltip */}
              {hoveredAccount && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-48">
                  <div className="font-medium text-sm">{hoveredAccount.name}</div>
                  <div className="text-xs text-gray-600 space-y-1 mt-1">
                    <div>Health: {hoveredAccount.health_score}%</div>
                    <div>Churn Risk: {hoveredAccount.churn_risk_score}%</div>
                    <div>ARR: {formatCurrency(hoveredAccount.arr || 0)}</div>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {getQuadrantLabel(hoveredAccount.health_score, hoveredAccount.churn_risk_score)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scale Legend */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Bubble size = ARR</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>&lt;{config.currency_symbol}5K</span>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>{config.currency_symbol}5K-{config.currency_symbol}20K</span>
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  <span>{config.currency_symbol}20K+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          {quadrants.emergency.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Immediate Action Required</span>
              </div>
              <p className="text-sm text-red-700 mb-3">
                {quadrants.emergency.length} accounts in emergency quadrant need immediate intervention.
              </p>
              <div className="flex flex-wrap gap-2">
                {quadrants.emergency.slice(0, 3).map((account) => (
                  <Button
                    key={account.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onAccountClick?.(account)}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {account.name}
                  </Button>
                ))}
                {quadrants.emergency.length > 3 && (
                  <Badge variant="secondary">
                    +{quadrants.emergency.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}