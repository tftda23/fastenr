"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  Plug, Settings, RefreshCw, Clock, Link as LinkIcon,
  AlertCircle, CheckCircle2, MoreHorizontal, Database
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Provider = "hubspot" | "salesforce"
type SyncObject = "company" | "contact" | "deal"

interface IntegrationsClientProps {
  organizationId: string
}

type ConnectionRow = {
  provider: Provider
  status: string | null
  token_expires_at: string | null
  updated_at: string | null
}

type SyncStateRow = {
  provider: Provider
  object_type: SyncObject
  phase: "initial" | "continuous"
  since: string | null
  last_run_at: string | null
  last_success_at: string | null
  last_error: string | null
}

type ProviderState = {
  connection: ConnectionRow | null
  states: SyncStateRow[]
}

export default function IntegrationsClient({ organizationId }: IntegrationsClientProps) {
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<null | { provider: Provider; target: "all" | SyncObject }>(null)
  const [etlRunning, setEtlRunning] = useState<null | Provider>(null)

  // provider → state
  const [byProvider, setByProvider] = useState<Record<Provider, ProviderState>>({
    hubspot: { connection: null, states: [] },
    salesforce: { connection: null, states: [] },
  })

  const sortedStates = (provider: Provider) =>
    (byProvider[provider].states || [])
      ? ["company", "contact", "deal"]
          .map((k) => byProvider[provider].states.find((s) => s.object_type === (k as SyncObject)))
          .filter(Boolean) as SyncStateRow[]
      : []

  async function load() {
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

      const next: Record<Provider, ProviderState> = {
        hubspot: { connection: null, states: [] },
        salesforce: { connection: null, states: [] },
      }

      ;(conns ?? []).forEach((c: any) => {
        const p = c.provider as Provider
        next[p].connection = c
      })
      ;(states ?? []).forEach((s: any) => {
        const p = s.provider as Provider
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

  useEffect(() => {
    load()
  }, [organizationId])

  // ---------- UI helpers ----------
  function fmt(ts?: string | null) {
    if (!ts) return "—"
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return "—"
    return d.toLocaleString()
  }

  const connectStartByProvider: Record<Provider, (orgId: string) => string> = {
    hubspot: (orgId) => `/api/integrations/hubspot/start?organizationId=${orgId}`,
    salesforce: (orgId) => `/api/integrations/salesforce/start?organizationId=${orgId}`,
  }

  const syncEndpointByProvider: Record<Provider, string> = {
    hubspot: "/api/integrations/hubspot/sync",
    salesforce: "/api/integrations/salesforce/sync",
  }

  // Reuse your existing ETL endpoint, but include provider in the body.
  // (If you later split ETL endpoints, just swap this map to different URLs.)
  const etlEndpointByProvider: Record<Provider, string> = {
    hubspot: "/api/etl/accounts/from-crm",
    salesforce: "/api/etl/accounts/from-crm",
  }

  function openConnect(provider: Provider) {
    window.location.href = connectStartByProvider[provider](organizationId)
  }

  async function runEtl(provider: Provider, lookbackMinutes = 240) {
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

  async function syncNow(provider: Provider, target: "all" | SyncObject, pageLimit = 2, withEtl = false) {
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
      await load()
      if (withEtl) {
        await runEtl(provider, 240)
      }
    } catch (e: any) {
      toast({ title: "Sync failed", description: e?.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setSyncing(null)
    }
  }

  async function syncObject(provider: Provider, obj: SyncObject, withEtl = false) {
    await syncNow(provider, obj, 2, withEtl)
  }

  async function resetSyncState(provider: Provider) {
    try {
      const { error } = await supabase
        .from("integration_sync_state")
        .update({ phase: "initial", cursor: null, since: null, last_error: null })
        .eq("organization_id", organizationId)
        .eq("provider", provider)
      if (error) throw error
      toast({ title: `${titleFor(provider)} sync state reset`, description: "Initial backfill will resume on next sync." })
      await load()
    } catch (e: any) {
      toast({ title: "Reset failed", description: e?.message ?? "Could not reset sync state.", variant: "destructive" })
    }
  }

  // ---------- Render helpers ----------
  const titleFor = (p: Provider) => (p === "hubspot" ? "HubSpot" : "Salesforce")
  const emojiFor = (p: Provider) => (p === "hubspot" ? "🔶" : "🌀")
  const isConnected = (p: Provider) => !!byProvider[p].connection

  const ConnectedBadge = ({ connected }: { connected: boolean }) =>
    connected ? (
      <Badge className="bg-green-100 text-green-800 cursor-default select-none">Connected</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700 cursor-default select-none">Not connected</Badge>
    )

  const ProviderTile = ({ provider }: { provider: Provider }) => {
    const conn = byProvider[provider].connection
    const list = sortedStates(provider)
    const connected = isConnected(provider)

    return (
      <div className="flex items-start justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-2xl">{emojiFor(provider)}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{titleFor(provider)}</h3>
              {connected ? (
                <span className="inline-flex items-center text-xs text-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-gray-600">
                  <AlertCircle className="h-4 w-4 mr-1" /> Not connected
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Sync companies, contacts, and deals into fastenr. Then run ETL to materialise Accounts.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => openConnect(provider)}>
                <Settings className="h-4 w-4 mr-2" />
                {connected ? "Reconnect" : "Connect"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncNow(provider, "all", 5)}
                disabled={!connected || syncing !== null}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Full sync (page ×5)
              </Button>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Last updated: {fmt(conn?.updated_at)}
          </div>
          <div>Token expires: {fmt(conn?.token_expires_at)}</div>
        </div>
      </div>
    )
  }

  const ProviderActions = ({ provider }: { provider: Provider }) => {
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
      {/* HubSpot Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Plug className="h-5 w-5 mr-2" />
              Integrations — HubSpot
            </CardTitle>
            <CardDescription>Connect fastenr with your HubSpot CRM data source.</CardDescription>
          </div>
          <ProviderActions provider="hubspot" />
        </CardHeader>
        <CardContent>
          <ProviderTile provider="hubspot" />

          {/* Sync status table */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Sync status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {loading && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md">Loading…</div>
              )}

              {!loading &&
                (sortedStates("hubspot").length ? (
                  sortedStates("hubspot").map((s) => (
                    <div key={`hubspot-${s.object_type}`} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{s.object_type}</span>
                        <Badge
                          className={`cursor-default select-none ${
                            s.phase === "continuous"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {s.phase}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Since: {fmt(s.since)}</div>
                        <div>Last run: {fmt(s.last_run_at)}</div>
                        <div>Last success: {fmt(s.last_success_at)}</div>
                        {s.last_error ? (
                          <div className="text-red-700">Error: {s.last_error}</div>
                        ) : null}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncObject("hubspot", s.object_type)}
                          disabled={!isConnected("hubspot") || syncing !== null}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync
                        </Button>
                        {s.object_type === "company" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncObject("hubspot", "company", true)}
                            disabled={!isConnected("hubspot") || syncing !== null || etlRunning === "hubspot"}
                            title="Sync companies then run ETL"
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Sync companies + ETL
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md">
                    No sync state yet. Connect HubSpot, then run an initial sync.
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salesforce Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Plug className="h-5 w-5 mr-2" />
              Integrations — Salesforce
            </CardTitle>
            <CardDescription>Connect fastenr with your Salesforce CRM data source.</CardDescription>
          </div>
          <ProviderActions provider="salesforce" />
        </CardHeader>
        <CardContent>
          <ProviderTile provider="salesforce" />

          {/* Sync status table */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Sync status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {loading && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md">Loading…</div>
              )}

              {!loading &&
                (sortedStates("salesforce").length ? (
                  sortedStates("salesforce").map((s) => (
                    <div key={`salesforce-${s.object_type}`} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{s.object_type}</span>
                        <Badge
                          className={`cursor-default select-none ${
                            s.phase === "continuous"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {s.phase}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Since: {fmt(s.since)}</div>
                        <div>Last run: {fmt(s.last_run_at)}</div>
                        <div>Last success: {fmt(s.last_success_at)}</div>
                        {s.last_error ? (
                          <div className="text-red-700">Error: {s.last_error}</div>
                        ) : null}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncObject("salesforce", s.object_type)}
                          disabled={!isConnected("salesforce") || syncing !== null}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync
                        </Button>
                        {s.object_type === "company" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncObject("salesforce", "company", true)}
                            disabled={!isConnected("salesforce") || syncing !== null || etlRunning === "salesforce"}
                            title="Sync companies then run ETL"
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Sync companies + ETL
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border rounded-md">
                    No sync state yet. Connect Salesforce, then run an initial sync.
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
