"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search, Plus, MessageSquare, Phone, Mail, FileText, Monitor, GraduationCap,
  Calendar, Clock, AlertTriangle, TrendingUp,
} from "lucide-react"
import Link from "next/link"
import type { Engagement } from "@/lib/types"
import { AIInsightsButton } from "@/components/ai/ai-insights-button"
import { EngagementsHelp } from "@/components/ui/help-system"

interface EngagementWithDetails extends Engagement {
  accounts?: { name?: string; churn_risk_score?: number | string | null; arr?: number | string | null } | null
  created_by_profile: { full_name: string } | null
}

interface EngagementListProps {
  engagements: EngagementWithDetails[]
  onSearch: (query: string) => void
  onFilter: (type: string, outcome: string) => void
  canCreate: boolean
}

const toNum = (v: unknown) => {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export default function EngagementList({ engagements, onSearch, onFilter, canCreate }: EngagementListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [outcomeFilter, setOutcomeFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isPremium, setIsPremium] = useState(false)

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/debug/org')
        if (response.ok) {
          const data = await response.json()
          
          if (data.organization_id) {
            const premiumResponse = await fetch(`/api/features/premium?org_id=${data.organization_id}`)
            if (premiumResponse.ok) {
              const premiumData = await premiumResponse.json()
              setIsPremium(premiumData.isPremium || false)
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

  // ---- Normalize data once per render ----
  const normalized = engagements.map((e) => {
    const acc = e.accounts ?? null
    const _churn = toNum(acc?.churn_risk_score)
    const _arr = toNum(acc?.arr)
    const _accountName = acc?.name ?? "Unknown account"
    return { ...e, _churn, _arr, _accountName }
  })

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault()
  }
  const handleFormSubmit = (e: React.FormEvent) => e.preventDefault()
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value); onFilter?.(value, outcomeFilter)
  }
  const handleOutcomeFilter = (value: string) => {
    setOutcomeFilter(value); onFilter?.(typeFilter, value)
  }
  const handleTabChange = (value: string) => setActiveTab(value)

  const getFilteredEngagements = () => {
    let filtered = normalized

    // Tabs first
    switch (activeTab) {
      case "recent":
        filtered = normalized
          .filter((e) => e.completed_at || e.scheduled_at)
          .sort((a, b) => {
            const dateA = new Date(a.completed_at || a.scheduled_at || 0).getTime()
            const dateB = new Date(b.completed_at || b.scheduled_at || 0).getTime()
            return dateB - dateA
          })
          .slice(0, 20)
        break
      case "high-risk":
        filtered = normalized.filter((e) => e._churn > 40) // threshold adjustable
        break
      case "top-accounts":
        filtered = normalized.filter((e) => e._arr > 250000) // threshold adjustable
        break
      default:
        filtered = normalized
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((e) => {
        const title = e.title?.toLowerCase() ?? ""
        const desc = e.description?.toLowerCase() ?? ""
        const acct = e._accountName.toLowerCase()
        return title.includes(q) || desc.includes(q) || acct.includes(q)
      })
    }

    // Dropdown filters
    if (typeFilter !== "all") filtered = filtered.filter((e) => e.type === typeFilter)
    if (outcomeFilter !== "all") filtered = filtered.filter((e) => e.outcome === outcomeFilter)

    return filtered
  }

  const filteredEngagements = getFilteredEngagements()

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case "meeting": return Calendar
      case "call": return Phone
      case "email": return Mail
      case "note": return FileText
      case "demo": return Monitor
      case "training": return GraduationCap
      default: return MessageSquare
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return "bg-blue-100 text-blue-800"
      case "call": return "bg-green-100 text-green-800"
      case "email": return "bg-purple-100 text-purple-800"
      case "note": return "bg-gray-100 text-gray-800"
      case "demo": return "bg-orange-100 text-orange-800"
      case "training": return "bg-indigo-100 text-indigo-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case "positive": return "bg-green-100 text-green-800"
      case "negative": return "bg-red-100 text-red-800"
      case "neutral": return "bg-yellow-100 text-yellow-800"
      case "action_required": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Engagements</h1>
          <p className="text-muted-foreground">Track customer interactions and touchpoints</p>
        </div>
        <div className="flex items-center gap-3">
          <EngagementsHelp variant="icon" size="md" />
          <AIInsightsButton
            pageType="engagements"
            pageContext={{}}
          />
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/engagements/new">
                <Plus className="h-4 w-4 mr-2" />
                Log Engagement
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> All Engagements
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Recent Activity
          </TabsTrigger>
          <TabsTrigger value="high-risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> High Risk Accounts
          </TabsTrigger>
          <TabsTrigger value="top-accounts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Top Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search engagements..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="demo">Demos</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={handleOutcomeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="action_required">Action Required</SelectItem>
              </SelectContent>
            </Select>
          </form>

          {/* Engagement List */}
          <div className="space-y-4">
            {filteredEngagements.map((engagement) => {
              const Icon = getEngagementIcon(engagement.type)
              return (
                <Card key={engagement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-muted rounded-md">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground truncate">{engagement.title}</h3>
                            <Badge className={getTypeColor(engagement.type)}>{engagement.type}</Badge>
                            {engagement.outcome && (
                              <Badge className={getOutcomeColor(engagement.outcome)}>{engagement.outcome}</Badge>
                            )}
                            {engagement._churn > 70 && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                High Risk
                              </Badge>
                            )}
                            {engagement._arr > 50000 && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Top Account
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{engagement.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">Account:</span>
                              <Link href={`/dashboard/accounts/${engagement.account_id}`} className="text-primary hover:underline">
                                {engagement._accountName}
                              </Link>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="font-medium">By:</span>
                              <span>{engagement.created_by_profile?.full_name || "Unknown"}</span>
                            </div>
                            {engagement.duration_minutes && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(engagement.duration_minutes)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {engagement.completed_at ? (
                            <div>
                              <span className="font-medium">Completed:</span><br />
                              {formatDate(engagement.completed_at)}
                            </div>
                          ) : engagement.scheduled_at ? (
                            <div>
                              <span className="font-medium">Scheduled:</span><br />
                              {formatDate(engagement.scheduled_at)}
                            </div>
                          ) : (
                            <span>No date set</span>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/engagements/${engagement.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredEngagements.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No engagements found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" || outcomeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : activeTab === "recent"
                    ? "No recent engagements to display"
                    : activeTab === "high-risk"
                      ? "No engagements with high-risk accounts"
                      : activeTab === "top-accounts"
                        ? "No engagements with top accounts"
                        : "Start tracking customer interactions"}
              </p>
              {canCreate && !searchQuery && typeFilter === "all" && outcomeFilter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/engagements/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Log First Engagement
                  </Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
