"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Building, Edit, Trash2, TrendingUp, AlertTriangle, DollarSign,
  Calendar, Globe, MessageSquare, Target, Star, Plus, Users, Mail, Phone, UserPlus,
} from "lucide-react"
import type {
  Account, Engagement, CustomerGoal, HealthMetric, ApiResponse, PaginatedResponse, Contact,
} from "@/lib/types"
import { OrgChartView } from "@/components/contacts/org-chart-view"
import { AIInsightsButton } from "@/components/ai/ai-insights-button"

type HealthBlock = {
  health_score: number
  churn_risk_score: number
  nps: {
    latest_score: number | null
    last_response_date: string | null
    recent_responses: Array<{ score: number; feedback?: string | null; survey_date: string; respondent_name?: string | null }>
  }
}

/* ---------- helpers ---------- */
const fmtCurrency = (amount: number | null) =>
  amount == null
    ? "N/A"
    : new Intl.NumberFormat("en-GB", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount)

const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString() : "N/A")

const sizeLabel = (size: Account["size"]) => {
  if (!size) return "Unknown"
  const map = {
    startup: "Startup (1–10)",
    small: "Small (11–50)",
    medium: "Medium (51–200)",
    large: "Large (201–1000)",
    enterprise: "Enterprise (1000+)",
  } as const
  return map[size]
}

const statusPill = (status: Account["status"]) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800"
    case "at_risk": return "bg-red-100 text-red-800"
    case "churned": return "bg-gray-200 text-gray-800"
    case "onboarding": return "bg-blue-100 text-blue-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const healthColour = (score: number) => (score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600")
const churnRiskMeta = (score: number) =>
  score >= 80 ? { label: "Critical", color: "text-red-600" }
  : score >= 60 ? { label: "High", color: "text-orange-600" }
  : score >= 40 ? { label: "Medium", color: "text-yellow-600" }
  : { label: "Low", color: "text-green-600" }

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init })
  if (!res.ok) throw new Error(await res.text().catch(() => `Request failed: ${res.status}`))
  const body = (await res.json()) as ApiResponse<T> | T
  if ((body as ApiResponse<T>) && Object.prototype.hasOwnProperty.call(body as any, "error")) {
    const api = body as ApiResponse<T>
    if (api.error) throw new Error(api.error)
    return (api.data as T) ?? (undefined as unknown as T)
  }
  return body as T
}

/* ---------- small UI bits ---------- */
function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>
}
function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
      {icon}
      <h4 className="font-medium text-foreground">{title}</h4>
      {subtitle ? <Muted>{subtitle}</Muted> : null}
    </div>
  )
}
function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</div>
}
function LoadingRow() { return <Muted>Loading…</Muted> }

/* ---------- Engagements UI ---------- */
function EngagementList({ items }: { items: Engagement[] }) {
  if (!items.length) {
    return <EmptyState title="No engagements yet" subtitle="Log your first touchpoint to see it here." icon={<MessageSquare className="h-6 w-6" />} />
  }
  return (
    <ul className="space-y-3">
      {items.map((e) => (
        <li key={e.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">{e.type}</Badge>
              <span className="text-sm text-muted-foreground">{fmtDate(e.completed_at || e.scheduled_at || e.created_at)}</span>
            </div>
            {e.outcome ? <span className="text-xs text-muted-foreground uppercase">{e.outcome}</span> : null}
          </div>
          <div className="mt-2">
            <div className="font-medium">{e.title}</div>
            {e.description ? <p className="text-sm text-muted-foreground mt-1">{e.description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- Goals UI ---------- */
function goalBadge(status: CustomerGoal["status"]) {
  switch (status) {
    case "achieved": return "bg-green-100 text-green-800"
    case "on_track": return "bg-blue-100 text-blue-800"
    case "at_risk": return "bg-yellow-100 text-yellow-800"
    case "missed": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}
function goalProgress(g: CustomerGoal) {
  if (g.target_value == null || g.target_value === 0) return 0
  return Math.max(0, Math.min(100, Math.round((g.current_value / g.target_value) * 100)))
}
function GoalsList({ items }: { items: CustomerGoal[] }) {
  if (!items.length) {
    return <EmptyState title="No goals yet" subtitle="Create measurable goals to track customer impact." icon={<Target className="h-6 w-6" />} />
  }
  return (
    <ul className="space-y-3">
      {items.map((g) => (
        <li key={g.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{g.title}</span>
              <Badge className={`capitalize ${goalBadge(g.status)}`}>{g.status.replaceAll("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {g.unit ? <span>{g.current_value}{g.unit ? ` ${g.unit}` : ""}{g.target_value ? ` / ${g.target_value}${g.unit ? ` ${g.unit}` : ""}` : ""}</span> : null}
              <span>Target: {fmtDate(g.target_date)}</span>
            </div>
          </div>
          <Progress value={goalProgress(g)} className="mt-3" />
          <div className="mt-1 text-xs text-muted-foreground">{goalProgress(g)}% complete</div>
          {g.description ? <p className="text-sm text-muted-foreground mt-2">{g.description}</p> : null}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Health & NPS UI ---------- */
function HealthPanel({ data }: { data: HealthBlock }) {
  const nps = data.nps
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Health Score</p>
              <p className={`text-2xl font-bold ${healthColour(data.health_score)}`}>{data.health_score}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <Progress value={data.health_score} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Churn Risk</p>
              <p className="text-2xl font-bold">{data.churn_risk_score}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          </div>
          <Progress value={data.churn_risk_score} className="mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Latest NPS</p>
              <p className="text-2xl font-bold">{nps.latest_score ?? "—"}</p>
              <p className="text-sm text-muted-foreground">as of {fmtDate(nps.last_response_date)}</p>
            </div>
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent NPS Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nps.recent_responses.length ? (
            <ul className="space-y-3">
              {nps.recent_responses.map((r, idx) => (
                <li key={idx} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Score {r.score}</Badge>
                      <span className="text-sm text-muted-foreground">{fmtDate(r.survey_date)}</span>
                    </div>
                    {r.respondent_name ? <span className="text-sm text-muted-foreground">{r.respondent_name}</span> : null}
                  </div>
                  {r.feedback ? <p className="text-sm text-muted-foreground mt-2">{r.feedback}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No recent NPS responses" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------- Main ---------- */
interface AccountDetailsProps {
  account: Account
  canEdit: boolean
  canDelete: boolean
  accountContacts?: Contact[]
}

export default function AccountDetails({ account, canEdit, canDelete, accountContacts = [] }: AccountDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const [activeTab, setActiveTab] = useState<"overview" | "engagements" | "goals" | "health" | "contacts">("overview")

  const [engagements, setEngagements] = useState<Engagement[] | null>(null)
  const [engagementsError, setEngagementsError] = useState<string | null>(null)
  const [engagementsLoading, setEngagementsLoading] = useState(false)

  const [goals, setGoals] = useState<CustomerGoal[] | null>(null)
  const [goalsError, setGoalsError] = useState<string | null>(null)
  const [goalsLoading, setGoalsLoading] = useState(false)

  const [health, setHealth] = useState<HealthBlock | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  useEffect(() => {
    const id = account.id

    // --- Engagements (browser-safe /api) ---
    if (activeTab === "engagements" && engagements === null && !engagementsLoading) {
      setEngagementsLoading(true)
      fetchJSON<PaginatedResponse<Engagement> | Engagement[] | { data: PaginatedResponse<Engagement> | Engagement[] }>(
        `/api/engagements?accountId=${id}&page=1&limit=20`
      )
        .then((res) => {
          const inner = (res as any).data ?? res
          if (Array.isArray(inner)) return setEngagements(inner as Engagement[])
          if ((inner as PaginatedResponse<Engagement>)?.data) {
            return setEngagements((inner as PaginatedResponse<Engagement>).data)
          }
          setEngagements([])
        })
        .catch((e) => setEngagementsError(e.message || "Failed to load engagements"))
        .finally(() => setEngagementsLoading(false))
    }

    // --- Goals (browser-safe /api) ---
    if (activeTab === "goals" && goals === null && !goalsLoading) {
      setGoalsLoading(true)
      fetchJSON<CustomerGoal[] | { data: CustomerGoal[] }>(`/api/goals?accountId=${id}`)
        .then((res) => setGoals(((res as any).data ?? res) as CustomerGoal[]))
        .catch((e) => setGoalsError(e.message || "Failed to load goals"))
        .finally(() => setGoalsLoading(false))
    }

    // --- Health (try clean /api first; fallback to v1 then to local) ---
    if (activeTab === "health" && health === null && !healthLoading) {
      setHealthLoading(true)

      const fromLocal = (): HealthBlock => ({
        health_score: account.health_score,
        churn_risk_score: account.churn_risk_score,
        nps: { latest_score: null, last_response_date: null, recent_responses: [] },
      })

      // Try a non-v1 health route if you add/proxy it later
      fetchJSON<HealthBlock>(`/api/accounts/${id}/health`)
        .then((hb) => setHealth(hb))
        .catch(async () => {
          // Fallback to v1 (may 401 if API key required)
          try {
            const v1 = await fetchJSON<{ data: HealthMetric[] } | HealthMetric[]>(
              `/api/v1/health?account_id=${id}`
            )
            const metrics: HealthMetric[] = Array.isArray((v1 as any)?.data) ? (v1 as any).data : (v1 as any)
            const latest = Array.isArray(metrics) ? metrics[0] : undefined
            setHealth({
              health_score: latest?.overall_health_score ?? account.health_score,
              churn_risk_score: account.churn_risk_score,
              nps: { latest_score: null, last_response_date: null, recent_responses: [] },
            })
          } catch {
            // Final graceful fallback
            setHealth(fromLocal())
          }
        })
        .finally(() => setHealthLoading(false))
    }
  }, [activeTab, account, engagements, engagementsLoading, goals, goalsLoading, health, healthLoading])

  const risk = useMemo(() => churnRiskMeta(account.churn_risk_score), [account.churn_risk_score])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this account? This action cannot be undone.")) return
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/accounts/${account.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete account")
      router.push("/dashboard/accounts")
      router.refresh()
    } catch (e) {
      console.error("Error deleting account:", e)
    } finally {
      setIsDeleting(false)
    }
  }
  const handleCreateEngagement = () => {
    router.push(`/dashboard/engagements/new?account_id=${account.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{account.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={`${statusPill(account.status)} hover:bg-inherit hover:text-inherit cursor-default`}>
                {account.status}
              </Badge>
              {account.industry && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{account.industry}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <AIInsightsButton 
            pageType="account-detail" 
            pageContext={{ accountId: account.id }}
          />
          <Button variant="outline" onClick={handleCreateEngagement}>
            <Plus className="h-4 w-4 mr-2" />
            Log Engagement
          </Button>
          {canEdit && (
            <Button asChild>
              <Link href={`/dashboard/accounts/${account.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className={`text-2xl font-bold ${healthColour(account.health_score)}`}>{account.health_score}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={account.health_score} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Risk</p>
                <p className={`text-2xl font-bold ${risk.color}`}>{risk.label}</p>
                <p className="text-sm text-muted-foreground">{account.churn_risk_score}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Annual Revenue</p>
                <p className="text-2xl font-bold text-foreground">{fmtCurrency(account.arr)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contract End</p>
                <p className="text-lg font-semibold text-foreground">{fmtDate(account.updated_at /* or contract_end_date */)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagements">Engagements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="health">Health & NPS</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({accountContacts.length})</TabsTrigger>
          <TabsTrigger value="orgchart">Org Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Industry</p>
                    <p className="text-foreground">{account.industry || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Company Size</p>
                    <p className="text-foreground">{sizeLabel(account.size)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Created</p>
                    <p className="text-foreground">{fmtDate(account.created_at)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-foreground">{fmtDate(account.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Engagements
                </div>
                <Button size="sm" onClick={handleCreateEngagement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Engagement
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementsLoading && <LoadingRow />}
              {engagementsError && <ErrorState message={engagementsError} />}
              {engagements && <EngagementList items={engagements} />}
              {engagements === null && !engagementsLoading && !engagementsError && <LoadingRow />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Customer Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goalsLoading && <LoadingRow />}
              {goalsError && <ErrorState message={goalsError} />}
              {goals && <GoalsList items={goals} />}
              {goals === null && !goalsLoading && !goalsError && <LoadingRow />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Health Metrics & NPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading && <LoadingRow />}
              {healthError && <ErrorState message={healthError} />}
              {health && <HealthPanel data={health} />}
              {health === null && !healthLoading && !healthError && <LoadingRow />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Account Contacts ({accountContacts.length})
                </div>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/contacts?account_id=${account.id}`}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accountContacts.length > 0 ? (
                <div className="space-y-4">
                  {accountContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-muted-foreground">{contact.title || 'No title'}</p>
                          <div className="flex items-center gap-4 mt-1">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.decision_maker_level && (
                          <Badge variant="secondary">{contact.decision_maker_level}</Badge>
                        )}
                        {contact.relationship_strength && (
                          <Badge 
                            variant={contact.relationship_strength === 'champion' ? 'default' : 'outline'}
                            className={contact.relationship_strength === 'champion' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {contact.relationship_strength}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add contacts to track stakeholders and decision makers for this account.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/contacts?account_id=${account.id}`}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Contact
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgchart">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Chart - {account.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrgChartView
                contacts={accountContacts}
                accountId={account.id}
                onRefresh={() => window.location.reload()}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
