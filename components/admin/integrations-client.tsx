"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  Plug, Settings, RefreshCw, Clock, Link as LinkIcon,
  AlertCircle, CheckCircle2, MoreHorizontal, Database,
  MessageSquare, Ticket, HelpCircle, Headphones, Plus,
  TrendingUp, TrendingDown, Minus, ExternalLink, Users, Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CRMProvider = "hubspot" | "salesforce"
type SupportProvider = 'intercom' | 'zendesk' | 'jira'
type CommunicationProvider = 'slack' | 'teams'
type Provider = CRMProvider | SupportProvider
type SyncObject = "company" | "contact" | "deal"

interface IntegrationsClientProps {
  organizationId: string
}

type ConnectionRow = {
  provider: CRMProvider
  status: string | null
  token_expires_at: string | null
  updated_at: string | null
}

type SyncStateRow = {
  provider: CRMProvider
  object_type: SyncObject
  phase: "initial" | "continuous"
  since: string | null
  last_run_at: string | null
  last_success_at: string | null
  last_error: string | null
}

type SupportIntegration = {
  id: string
  provider: SupportProvider
  status: "connected" | "disconnected" | "error"
  api_endpoint?: string
  workspace_id?: string
  subdomain?: string
  project_key?: string
  sync_enabled: boolean
  sync_frequency_hours: number
  last_sync_at?: string
  last_sync_status?: string
  last_error?: string
  created_at: string
  updated_at: string
}

type ProviderState = {
  connection: ConnectionRow | null
  states: SyncStateRow[]
}

// Support Integration Card Component
const SupportIntegrationCard = ({ 
  provider, 
  supportIntegrations, 
  supportProviderConfig, 
  openSetupDialog, 
  toggleSupportSync, 
  deleteSupportIntegration 
}: { 
  provider: SupportProvider
  supportIntegrations: SupportIntegration[]
  supportProviderConfig: any
  openSetupDialog: (provider: SupportProvider) => void
  toggleSupportSync: (id: string, enabled: boolean) => void
  deleteSupportIntegration: (id: string) => void
}) => {
  const config = supportProviderConfig[provider]
  const integration = supportIntegrations.find(i => i.provider === provider)
  const isActive = integration?.status === "connected" && integration?.sync_enabled

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={config.logo} alt={config.name} className="w-8 h-8 object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription className="text-sm">Support ticket management</CardDescription>
            </div>
          </div>
          {integration ? (
            <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800">Not configured</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {integration ? (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Status: {integration.status}</div>
              <div>Sync: {integration.sync_enabled ? "Enabled" : "Disabled"}</div>
              <div>Last sync: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openSetupDialog(provider)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => deleteSupportIntegration(integration.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect {config.name} to track support metrics and customer interactions.
            </p>
            <Button onClick={() => openSetupDialog(provider)} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Setup {config.name}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function IntegrationsClient({ organizationId }: IntegrationsClientProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [supportLoading, setSupportLoading] = useState(true)
  const [syncing, setSyncing] = useState<null | { provider: CRMProvider; target: "all" | SyncObject }>(null)
  const [etlRunning, setEtlRunning] = useState<null | CRMProvider>(null)
  const [activeTab, setActiveTab] = useState("crm")
  const [supportIntegrations, setSupportIntegrations] = useState<SupportIntegration[]>([])
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<SupportProvider | CommunicationProvider | null>(null)
  const [setupForm, setSetupForm] = useState({
    api_endpoint: "",
    workspace_id: "",
    subdomain: "",
    project_key: "",
    api_token: "",
    sync_frequency_hours: 24
  })

  // provider → state
  const [byProvider, setByProvider] = useState<Record<CRMProvider, ProviderState>>({
    hubspot: { connection: null, states: [] },
    salesforce: { connection: null, states: [] },
  })

  const sortedStates = (provider: CRMProvider) =>
    (byProvider[provider].states || [])
      ? ["company", "contact", "deal"]
          .map((k) => byProvider[provider].states.find((s) => s.object_type === (k as SyncObject)))
          .filter(Boolean) as SyncStateRow[]
      : []

  async function loadCRM() {
    setLoading(true)
    try {
      // Fetch connections for both providers
      const [{ data: conns, error: connErr }, { data: states, error: stateErr }] = await Promise.all([
        supabase
          .from("integration_connections")
          .select("provider, status, token_expires_at, updated_at")
          .eq("organization_id", organizationId)
          .in("provider", ["hubspot", "salesforce"]),
        supabase
          .from("integration_sync_state")
          .select("provider, object_type, phase, since, last_run_at, last_success_at, last_error")
          .eq("organization_id", organizationId)
          .in("provider", ["hubspot", "salesforce"]),
      ])

      if (connErr) throw connErr
      if (stateErr) throw stateErr

      const next: Record<CRMProvider, ProviderState> = {
        hubspot: { connection: null, states: [] },
        salesforce: { connection: null, states: [] },
      }

      ;(conns ?? []).forEach((c: any) => {
        const p = c.provider as CRMProvider
        next[p].connection = c
      })
      ;(states ?? []).forEach((s: any) => {
        const p = s.provider as CRMProvider
        next[p].states.push(s)
      })

      setByProvider(next)
    } catch (e) {
      console.error(e)
      toast({ title: "Load failed", description: "Could not load integration status.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function loadSupportIntegrations() {
    setSupportLoading(true)
    try {
      const { data, error } = await supabase
        .from("support_integrations")
        .select("*")
        .eq("organization_id", organizationId)

      if (error) throw error
      setSupportIntegrations(data || [])
    } catch (e) {
      console.error(e)
      toast({ title: "Load failed", description: "Could not load support integrations.", variant: "destructive" })
    } finally {
      setSupportLoading(false)
    }
  }

  useEffect(() => {
    loadCRM()
    loadSupportIntegrations()
  }, [organizationId])

  // ---------- UI helpers ----------
  function fmt(ts?: string | null) {
    if (!ts) return "—"
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleString()
  }

  const connectStartByProvider: Record<CRMProvider, (orgId: string) => string> = {
    hubspot: (orgId) => `/api/integrations/hubspot/start?organizationId=${orgId}`,
    salesforce: (orgId) => `/api/integrations/salesforce/start?organizationId=${orgId}`,
  }

  const syncEndpointByProvider: Record<CRMProvider, string> = {
    hubspot: "/api/integrations/hubspot/sync",
    salesforce: "/api/integrations/salesforce/sync",
  }

  // Reuse your existing ETL endpoint, but include provider in the body.
  // (If you later split ETL endpoints, just swap this map to different URLs.)
  const etlEndpointByProvider: Record<CRMProvider, string> = {
    hubspot: "/api/etl/accounts/from-crm",
    salesforce: "/api/etl/accounts/from-crm",
  }

  const supportProviderConfig = {
    intercom: {
      name: "Intercom",
      logo: "/images/logos/intercom.svg",
      color: "bg-blue-500",
      description: "Customer support conversations and tickets",
      setupFields: ["api_token", "workspace_id"],
      docUrl: "https://developers.intercom.com/building-apps/docs/authorization"
    },
    zendesk: {
      name: "Zendesk", 
      logo: "/images/logos/zendesk.svg",
      color: "bg-green-500",
      description: "Support tickets and customer service data",
      setupFields: ["subdomain", "api_token"],
      docUrl: "https://developer.zendesk.com/api-reference/ticketing/introduction/"
    },
    jira: {
      name: "Jira Service Management",
      logo: "/images/logos/jira.svg",
      color: "bg-blue-600",
      description: "Service desk tickets and issues",
      setupFields: ["api_endpoint", "project_key", "api_token"],
      docUrl: "https://developer.atlassian.com/cloud/jira/service-desk/rest/intro/"
    }
  }

  const communicationProviderConfig = {
    slack: {
      name: "Slack",
      logo: "/images/logos/slack.svg",
      color: "bg-purple-500",
      description: "Team communication and customer notifications",
      setupFields: ["workspace_id", "api_token"],
      docUrl: "https://api.slack.com/authentication/basics"
    },
    teams: {
      name: "Microsoft Teams",
      logo: "/images/logos/microsoft-teams.svg",
      color: "bg-blue-700",
      description: "Team collaboration and customer communication",
      setupFields: ["api_endpoint", "api_token"],
      docUrl: "https://docs.microsoft.com/en-us/graph/teams-concept-overview"
    }
  }

  function openConnect(provider: CRMProvider) {
    window.location.href = connectStartByProvider[provider](organizationId)
  }

  async function runEtl(provider: CRMProvider, lookbackMinutes = 240) {
    try {
      setEtlRunning(provider)
      const etlUrl = etlEndpointByProvider[provider]
      const res = await fetch(etlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // include provider so backend can branch logic
        body: JSON.stringify({ organizationId, lookbackMinutes, provider }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      toast({
        title: `${titleFor(provider)} ETL complete`,
        description: `Accounts updated • upserted: ${data.upsertedAccounts ?? 0}, linked: ${data.linked ?? 0}`,
      })
    } catch (e: any) {
      toast({ title: "ETL failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setEtlRunning(null)
    }
  }

  async function syncNow(provider: CRMProvider, target: "all" | SyncObject, pageLimit = 2, withEtl = false) {
    try {
      setSyncing({ provider, target })
      const res = await fetch(syncEndpointByProvider[provider], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, pageLimit }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      toast({
        title: `${titleFor(provider)} sync complete`,
        description: target === "all" ? "Incremental sync ran successfully." : `Synced ${target}s.`,
      })
      await loadCRM()
      if (withEtl) {
        await runEtl(provider, 240)
      }
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setSyncing(null)
    }
  }

  async function syncObject(provider: CRMProvider, obj: SyncObject, withEtl = false) {
    await syncNow(provider, obj, 2, withEtl)
  }

  async function resetSyncState(provider: CRMProvider) {
    try {
      // Reset all object types for this provider
      const objectTypes = provider === "hubspot" ? ["company", "contact", "deal"] : ["company", "contact", "deal"]
      
      for (const objectType of objectTypes) {
        const resetPayload = {
          phase: "initial",
          cursor: null,
          since: null,
          last_error: null,
        }
        
        const { error } = await (supabase as any)
          .from("integration_sync_state")
          .update(resetPayload)
          .eq("organization_id", organizationId)
          .eq("provider", provider)
          .eq("object_type", objectType)
        if (error) throw error
      }
      
      toast({ title: `${titleFor(provider)} sync state reset`, description: "Initial backfill will resume on next sync." })
      await loadCRM()
    } catch (e: any) {
      toast({ title: "Reset failed", description: e?.message ?? "Could not reset sync state.", variant: "destructive" })
    }
  }

  async function setupSupportIntegration(provider: SupportProvider | CommunicationProvider) {
    try {
      const { error } = await (supabase as any)
        .from("support_integrations")
        .insert({
          organization_id: organizationId,
          provider,
          api_endpoint: setupForm.api_endpoint || null,
          workspace_id: setupForm.workspace_id || null,
          subdomain: setupForm.subdomain || null,
          project_key: setupForm.project_key || null,
          encrypted_token: setupForm.api_token, // In production, encrypt this
          sync_frequency_hours: setupForm.sync_frequency_hours,
          status: "disconnected" // Will be "connected" after first successful sync
        })

      if (error) throw error

      toast({ title: "Integration added", description: `${((supportProviderConfig as any)[provider] || (communicationProviderConfig as any)[provider])?.name || provider} integration configured successfully.` })
      setSetupDialogOpen(false)
      setSetupForm({ api_endpoint: "", workspace_id: "", subdomain: "", project_key: "", api_token: "", sync_frequency_hours: 24 })
      await loadSupportIntegrations()
    } catch (e: any) {
      toast({ title: "Setup failed", description: e?.message ?? "Could not setup integration.", variant: "destructive" })
    }
  }

  async function toggleSupportSync(integrationId: string, enabled: boolean) {
    try {
      const { error } = await (supabase as any)
        .from("support_integrations")
        .update({ sync_enabled: enabled })
        .eq("id", integrationId)
        .eq("organization_id", organizationId)

      if (error) throw error

      toast({ title: enabled ? "Sync enabled" : "Sync disabled", description: "Integration sync settings updated." })
      await loadSupportIntegrations()
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Could not update sync settings.", variant: "destructive" })
    }
  }

  async function deleteSupportIntegration(integrationId: string) {
    try {
      const { error } = await supabase
        .from("support_integrations")
        .delete()
        .eq("id", integrationId)
        .eq("organization_id", organizationId)

      if (error) throw error

      toast({ title: "Integration removed", description: "Support integration deleted successfully." })
      await loadSupportIntegrations()
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "Could not delete integration.", variant: "destructive" })
    }
  }

  function openSetupDialog(provider: SupportProvider | CommunicationProvider) {
    setSelectedProvider(provider)
    setSetupForm({ api_endpoint: "", workspace_id: "", subdomain: "", project_key: "", api_token: "", sync_frequency_hours: 24 })
    setSetupDialogOpen(true)
  }

  // ---------- Render helpers ----------
  const titleFor = (p: CRMProvider) => (p === "hubspot" ? "HubSpot" : "Salesforce")
  const emojiFor = (p: CRMProvider) => (p === "hubspot" ? "🔶" : "🌀")
  const isConnected = (p: CRMProvider) => !!byProvider[p].connection

  // Communication Integration Card Component
  const CommunicationIntegrationCard = ({ 
    provider, 
    supportIntegrations, 
    communicationProviderConfig, 
    openSetupDialog, 
    toggleSupportSync, 
    deleteSupportIntegration 
  }: {
    provider: CommunicationProvider
    supportIntegrations: SupportIntegration[]
    communicationProviderConfig: any
    openSetupDialog: (provider: CommunicationProvider) => void
    toggleSupportSync: (id: string, enabled: boolean) => void
    deleteSupportIntegration: (id: string) => void
  }) => {
    const config = communicationProviderConfig[provider]
    const integration = supportIntegrations.find(i => i.provider === provider as any)
    const isActive = integration?.status === "connected" && integration?.sync_enabled

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={config.logo} alt={config.name} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <CardTitle className="text-lg">{config.name}</CardTitle>
                <CardDescription className="text-sm">Team communication</CardDescription>
              </div>
            </div>
            {integration ? (
              <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">Not configured</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integration ? (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Status: {integration.status}</div>
                <div>Sync: {integration.sync_enabled ? "Enabled" : "Disabled"}</div>
                <div>Last sync: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openSetupDialog(provider)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => deleteSupportIntegration(integration.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect {config.name} to track team communication and customer interactions.
              </p>
              <Button onClick={() => openSetupDialog(provider)} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Setup {config.name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ConnectedBadge = ({ connected }: { connected: boolean }) =>
    connected ? (
      <Badge className="bg-green-100 text-green-800 cursor-default select-none">Connected</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700 cursor-default select-none">Not connected</Badge>
    )

  const CRMIntegrationCard = ({ provider }: { provider: CRMProvider }) => {
    const conn = byProvider[provider].connection
    const connected = isConnected(provider)
    const logoPath = provider === "hubspot" ? "/images/logos/hubspot.svg" : "/images/logos/salesforce.svg"

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={logoPath} alt={titleFor(provider)} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <CardTitle className="text-lg">{titleFor(provider)}</CardTitle>
                <CardDescription className="text-sm">CRM data synchronization</CardDescription>
              </div>
            </div>
            {connected ? (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Status: Connected</div>
                <div>Last sync: {fmt(conn?.updated_at)}</div>
                <div>Token expires: {fmt(conn?.token_expires_at)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openConnect(provider)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => syncNow(provider, "all", 2)}
                  disabled={syncing !== null}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect {titleFor(provider)} to sync companies, contacts, and deals.
              </p>
              <Button onClick={() => openConnect(provider)} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Connect {titleFor(provider)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const ProviderActions = ({ provider }: { provider: CRMProvider }) => {
    const connected = isConnected(provider)
    const conn = byProvider[provider].connection

    return (
      <div className="flex items-center gap-2">
        <ConnectedBadge connected={!!conn} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => openConnect(provider)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              {connected ? `Reconnect ${titleFor(provider)}` : `Connect ${titleFor(provider)}`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => syncObject(provider, "company")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync companies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => syncObject(provider, "contact")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync contacts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => syncObject(provider, "deal")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync deals
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={etlRunning === provider}
              onClick={() => runEtl(provider, 240)}
            >
              <Database className="h-4 w-4 mr-2" />
              Run ETL (accounts)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => resetSyncState(provider)}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Reset initial sync
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="default"
          size="sm"
          onClick={() => syncNow(provider, "all", 2)}
          disabled={syncing !== null || !connected}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {syncing?.provider === provider ? "Syncing..." : "Sync now"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => syncNow(provider, "all", 3, true)}
          disabled={etlRunning === provider || syncing !== null || !connected}
          title={`Run a short sync and then ETL companies into Accounts (${titleFor(provider)})`}
        >
          <Database className="h-4 w-4 mr-2" />
          {etlRunning === provider ? "ETL running..." : "Sync + ETL"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            CRM & Sales
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Support & Service
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Communication
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crm" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <>  
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <CRMIntegrationCard provider="hubspot" />
                <CRMIntegrationCard provider="salesforce" />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supportLoading ? (
              <>  
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <SupportIntegrationCard 
                  provider="intercom" 
                  supportIntegrations={supportIntegrations}
                  supportProviderConfig={supportProviderConfig}
                  openSetupDialog={openSetupDialog}
                  toggleSupportSync={toggleSupportSync}
                  deleteSupportIntegration={deleteSupportIntegration}
                />
                <SupportIntegrationCard 
                  provider="zendesk" 
                  supportIntegrations={supportIntegrations}
                  supportProviderConfig={supportProviderConfig}
                  openSetupDialog={openSetupDialog}
                  toggleSupportSync={toggleSupportSync}
                  deleteSupportIntegration={deleteSupportIntegration}
                />
                <SupportIntegrationCard 
                  provider="jira" 
                  supportIntegrations={supportIntegrations}
                  supportProviderConfig={supportProviderConfig}
                  openSetupDialog={openSetupDialog}
                  toggleSupportSync={toggleSupportSync}
                  deleteSupportIntegration={deleteSupportIntegration}
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supportLoading ? (
              <>  
                {[1, 2].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <CommunicationIntegrationCard 
                  provider="slack" 
                  supportIntegrations={supportIntegrations}
                  communicationProviderConfig={communicationProviderConfig}
                  openSetupDialog={openSetupDialog}
                  toggleSupportSync={toggleSupportSync}
                  deleteSupportIntegration={deleteSupportIntegration}
                />
                <CommunicationIntegrationCard 
                  provider="teams" 
                  supportIntegrations={supportIntegrations}
                  communicationProviderConfig={communicationProviderConfig}
                  openSetupDialog={openSetupDialog}
                  toggleSupportSync={toggleSupportSync}
                  deleteSupportIntegration={deleteSupportIntegration}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider && (() => {
                const config = (supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider]
                return config?.logo ? <img src={config.logo} alt={config.name} className="w-5 h-5 object-contain" /> : null
              })()}
              Setup {selectedProvider && ((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.name} Integration
            </DialogTitle>
            <DialogDescription>
              Configure your {selectedProvider && ((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.name} integration to track metrics and improve customer success.
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-4">
              {((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.setupFields.includes("api_endpoint") && (
                <div className="space-y-2">
                  <Label htmlFor="api_endpoint">API Endpoint</Label>
                  <Input
                    id="api_endpoint"
                    placeholder="https://your-domain.atlassian.net"
                    value={setupForm.api_endpoint}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, api_endpoint: e.target.value }))}
                  />
                </div>
              )}

              {((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.setupFields.includes("workspace_id") && (
                <div className="space-y-2">
                  <Label htmlFor="workspace_id">Workspace ID</Label>
                  <Input
                    id="workspace_id"
                    placeholder="abc123"
                    value={setupForm.workspace_id}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, workspace_id: e.target.value }))}
                  />
                </div>
              )}

              {((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.setupFields.includes("subdomain") && (
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    placeholder="your-company"
                    value={setupForm.subdomain}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, subdomain: e.target.value }))}
                  />
                </div>
              )}

              {((supportProviderConfig as any)[selectedProvider] || (communicationProviderConfig as any)[selectedProvider])?.setupFields.includes("project_key") && (
                <div className="space-y-2">
                  <Label htmlFor="project_key">Project Key</Label>
                  <Input
                    id="project_key"
                    placeholder="SERVICE"
                    value={setupForm.project_key}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, project_key: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="api_token">API Token</Label>
                <Input
                  id="api_token"
                  type="password"
                  placeholder="Your API token"
                  value={setupForm.api_token}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, api_token: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency">Sync Frequency (hours)</Label>
                <Input
                  id="sync_frequency"
                  type="number"
                  min="1"
                  max="168"
                  value={setupForm.sync_frequency_hours}
                  onChange={(e) => setSetupForm(prev => ({ ...prev, sync_frequency_hours: parseInt(e.target.value) || 24 }))}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">What we'll track</p>
                    <ul className="text-sm text-blue-600 mt-1 space-y-1">
                      <li>• Daily ticket volumes and trends</li>
                      <li>• Resolution times and escalation rates</li>
                      <li>• Customer satisfaction scores (if available)</li>
                      <li>• Support health metrics for account scores</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedProvider && setupSupportIntegration(selectedProvider)}
              disabled={!setupForm.api_token}
            >
              Setup Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}