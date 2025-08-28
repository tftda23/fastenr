"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, AlertTriangle, TrendingUp, Calendar, ExternalLink, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface AIInsight {
  type: 'risk' | 'opportunity' | 'action' | 'trend'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  actionable?: boolean
  accountId?: string
  accountName?: string
  suggestedAction?: string
}

interface AIInsightsData {
  summary: string
  insights: AIInsight[]
  keyMetrics?: {
    totalAccounts?: number
    atRiskAccounts?: number
    opportunityAccounts?: number
    avgHealthScore?: number
    trendDirection?: 'up' | 'down' | 'stable'
  }
}

interface AIInsightsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageType: 'dashboard' | 'accounts' | 'account-detail' | 'contacts'
  pageContext?: {
    accountId?: string
    ownerId?: string
    activeTab?: string
    filters?: any
  }
}

export function AIInsightsModal({ open, onOpenChange, pageType, pageContext }: AIInsightsModalProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AIInsightsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType,
          pageContext
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('AI Insights Modal Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = () => {
    switch (pageType) {
      case 'dashboard':
        return pageContext?.activeTab === 'my' ? 'My Accounts Dashboard' : 'All Accounts Dashboard'
      case 'accounts':
        return 'Accounts Overview'
      case 'account-detail':
        return 'Account Analysis'
      case 'contacts':
        return 'Contacts Intelligence'
      default:
        return 'AI Insights'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'action':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      default:
        return <Sparkles className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Insights - {getPageTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!data && !loading && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Generate AI Insights</h3>
              <p className="text-muted-foreground mb-6">
                Get intelligent analysis and actionable recommendations based on your current data.
              </p>
              <Button onClick={handleAnalyze} className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Now
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analyzing Your Data</h3>
              <p className="text-muted-foreground">
                AI is processing your account data and generating insights...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analysis Failed</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleAnalyze} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{data.summary}</p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              {data.keyMetrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {data.keyMetrics.totalAccounts && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">{data.keyMetrics.totalAccounts}</div>
                          <div className="text-sm text-muted-foreground">Total Accounts</div>
                        </div>
                      )}
                      {data.keyMetrics.atRiskAccounts !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{data.keyMetrics.atRiskAccounts}</div>
                          <div className="text-sm text-muted-foreground">At Risk</div>
                        </div>
                      )}
                      {data.keyMetrics.avgHealthScore && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{data.keyMetrics.avgHealthScore}%</div>
                          <div className="text-sm text-muted-foreground">Avg Health</div>
                        </div>
                      )}
                      {data.keyMetrics.opportunityAccounts && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{data.keyMetrics.opportunityAccounts}</div>
                          <div className="text-sm text-muted-foreground">Opportunities</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Detailed Insights</h3>
                {data.insights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getInsightIcon(insight.type)}
                          <h4 className="font-medium">{insight.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {insight.category}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                            {insight.priority} priority
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>

                      {insight.actionable && (
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                          <div className="flex-1">
                            {insight.suggestedAction && (
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Suggested Action: {insight.suggestedAction}
                              </p>
                            )}
                            {insight.accountName && (
                              <p className="text-sm text-gray-600">
                                Account: {insight.accountName}
                              </p>
                            )}
                          </div>
                          {insight.accountId && (
                            <Link href={`/dashboard/accounts/${insight.accountId}`}>
                              <Button size="sm" variant="outline" className="ml-4">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Account
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button onClick={handleAnalyze} variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}