// app/api/integrations/hubspot/sync/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type SyncObject = "company" | "contact" | "deal"

const OBJECTS: SyncObject[] = ["company", "contact", "deal"] as const
const PATH: Record<SyncObject, string> = {
  company: "crm/v3/objects/companies",
  contact: "crm/v3/objects/contacts",
  deal: "crm/v3/objects/deals",
}
const PROPS: Record<SyncObject, string[]> = {
  company: ["name", "domain", "lifecyclestage", "annualrevenue", "hs_lastmodifieddate"],
  contact: ["email", "firstname", "lastname", "company", "lifecyclestage", "hs_lastmodifieddate"],
  deal: ["dealname", "amount", "dealstage", "pipeline", "closedate", "hs_lastmodifieddate"],
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase envs missing (URL or SERVICE_ROLE_KEY)")
  // @ts-ignore
  return createClient(url, key)
}

async function getConnection(sb: any, orgId: string) {
  const { data, error } = await sb
    .from("integration_connections")
    .select("*")
    .eq("organization_id", orgId)
    .eq("provider", "hubspot")
    .maybeSingle()
  if (error) throw new Error("DB read failed (integration_connections): " + error.message)
  if (!data) throw new Error("No HubSpot connection for organization")
  return data
}

async function getValidToken(sb: any, conn: any) {
  const exp = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
  if (exp > Date.now() + 30_000) return conn.access_token as string

  // refresh
  const res = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      refresh_token: conn.refresh_token,
    }),
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`HubSpot refresh failed: ${res.status} ${txt}`)
  const j = JSON.parse(txt)
  const expiresAt = new Date(Date.now() + (j.expires_in - 60) * 1000).toISOString()
  const { error } = await sb
    .from("integration_connections")
    .update({ access_token: j.access_token, token_expires_at: expiresAt })
    .eq("id", conn.id)
  if (error) throw new Error("DB write failed (update token): " + error.message)
  return j.access_token as string
}

async function fetchPage({
  token,
  object,
  cursor,
  since,
  limit,
}: {
  token: string
  object: SyncObject
  cursor?: any
  since?: string | null
  limit: number
}) {
  const url = new URL(`https://api.hubapi.com/${PATH[object]}`)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("archived", "false")
  url.searchParams.set("properties", PROPS[object].join(","))
  if (cursor?.after) url.searchParams.set("after", cursor.after)
  if (since) url.searchParams.set("updatedAfter", new Date(since).toISOString())

  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
  const txt = await res.text()
  if (!res.ok) throw new Error(`HubSpot fetch ${object} failed: ${res.status} ${txt}`)
  const j = JSON.parse(txt)

  const results = (j.results || []).map((r: any) => {
    const updatedAt =
      r.updatedAt || r.properties?.hs_lastmodifieddate || new Date().toISOString()
    return {
      id: String(r.id),
      properties: r.properties ?? {},
      updatedAt: new Date(updatedAt).toISOString(),
    }
  })
  const nextCursor = j.paging?.next ? { after: j.paging.next.after } : null
  return { results, nextCursor }
}

async function upsertRaw(sb: any, orgId: string, object: SyncObject, rows: any[]) {
  if (!rows.length) return
  const toUpsert = rows.map((r) => ({
    organization_id: orgId,
    provider: "hubspot",
    object_type: object,
    object_id: r.id,
    properties: r.properties,
    updated_at: r.updatedAt,
    last_seen_at: new Date().toISOString(),
  }))
  const { error } = await sb.from("integration_objects_raw").upsert(toUpsert)
  if (error) throw new Error("DB write failed (integration_objects_raw): " + error.message)
}

async function getState(sb: any, orgId: string, object: SyncObject) {
  const { data, error } = await sb
    .from("integration_sync_state")
    .select("*")
    .eq("organization_id", orgId)
    .eq("provider", "hubspot")
    .eq("object_type", object)
    .maybeSingle()
  if (error) throw new Error("DB read failed (integration_sync_state): " + error.message)
  return data || null
}

async function ensureState(sb: any, orgId: string) {
  const seeds = OBJECTS.map((o) => ({
    organization_id: orgId,
    provider: "hubspot",
    object_type: o,
    phase: "initial",
  }))
  await sb.from("integration_sync_state").upsert(seeds, {
    onConflict: "organization_id,provider,object_type",
  })
}

async function updateState(sb: any, orgId: string, object: SyncObject, patch: any) {
  const { error } = await sb
    .from("integration_sync_state")
    .update(patch)
    .eq("organization_id", orgId)
    .eq("provider", "hubspot")
    .eq("object_type", object)
  if (error) throw new Error("DB write failed (integration_sync_state): " + error.message)
}

async function runOne(sb: any, orgId: string, token: string, object: SyncObject, pageLimit: number) {
  let state = await getState(sb, orgId, object)
  if (!state) {
    await ensureState(sb, orgId)
    state = await getState(sb, orgId, object)
  }

  const phase = (state?.phase ?? "initial") as "initial" | "continuous"
  let cursor = state?.cursor ?? null
  const since = phase === "continuous" ? state?.since : null

  let pages = 0
  let maxUpdated = state?.since ? new Date(state.since).getTime() : 0
  let total = 0

  while (pages < pageLimit) {
    const { results, nextCursor } = await fetchPage({
      token,
      object,
      cursor,
      since,
      limit: 100,
    })

    await upsertRaw(sb, orgId, object, results)
    total += results.length

    for (const r of results) {
      const t = new Date(r.updatedAt).getTime()
      if (t > maxUpdated) maxUpdated = t
    }

    cursor = nextCursor
    pages += 1
    if (!cursor) break
  }

  const nextPhase = phase === "initial" && !cursor ? "continuous" : phase
  await updateState(sb, orgId, object, {
    phase: nextPhase,
    cursor: cursor ?? null,
    since:
      nextPhase === "continuous"
        ? new Date(maxUpdated || Date.now()).toISOString()
        : state?.since ?? null,
    last_run_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    last_error: null,
  })

  return { object, pages, total, phase: nextPhase, nextCursor: cursor, since: maxUpdated }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const orgId = body.organizationId as string
    const pageLimit = Math.max(1, Math.min(10, Number(body.pageLimit ?? 2)))

    if (!orgId) return NextResponse.json({ ok: false, error: "organizationId required" }, { status: 400 })

    const sb = admin()
    const conn = await getConnection(sb, orgId)
    const token = await getValidToken(sb, conn)

    // Order matters: companies then contacts then deals
    const results = []
    for (const obj of OBJECTS) {
      results.push(await runOne(sb, orgId, token, obj, pageLimit))
    }

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    // Return the exact error so the client can show it
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}
