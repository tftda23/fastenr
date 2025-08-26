import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Obj = "company" | "contact" | "deal"

const SOQL: Record<Obj, string> = {
  company: "SELECT Id, Name, Industry, Website, AnnualRevenue, SystemModstamp FROM Account",
  contact: "SELECT Id, FirstName, LastName, Email, AccountId, SystemModstamp FROM Contact",
  deal:    "SELECT Id, Name, Amount, StageName, CloseDate, AccountId, SystemModstamp FROM Opportunity",
}

const RAW_TABLE_FN: Record<Obj, string> = {
  company: "upsert_raw_salesforce_account",
  contact: "upsert_raw_salesforce_contact",
  deal:    "upsert_raw_salesforce_opportunity",
}

async function ensureSyncRows(supabase: ReturnType<typeof createClient>, organizationId: string) {
  const objs: Obj[] = ["company", "contact", "deal"]
  for (const object_type of objs) {
    // relies on a UNIQUE index on (organization_id, provider, object_type)
    await supabase
      .from("integration_sync_state")
      .upsert(
        {
          organization_id: organizationId,
          provider: "salesforce",
          object_type,
          phase: "initial",
          since: null,
          last_error: null,
        },
        { onConflict: "organization_id,provider,object_type" } as any
      )
  }
}

async function getConnection(supabase: ReturnType<typeof createClient>, organizationId: string) {
  const { data, error } = await supabase
    .from("integration_connections")
    .select("access_token, refresh_token, instance_url, token_expires_at, status")
    .eq("organization_id", organizationId)
    .eq("provider", "salesforce")
    .maybeSingle()
  if (error || !data) throw new Error("Salesforce not connected")
  return data
}

async function refreshAccessToken(refresh_token: string) {
  const tokenUrl = (process.env.SALESFORCE_LOGIN_BASE || "https://login.salesforce.com") + "/services/oauth2/token"
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
    client_id: process.env.SALESFORCE_CLIENT_ID!,
    client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
  })
  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!resp.ok) {
    const txt = await resp.text()
    throw new Error(`Refresh failed: ${txt}`)
  }
  return resp.json() as Promise<{ access_token: string; instance_url?: string }>
}

async function ensureAccessToken(supabase: ReturnType<typeof createClient>, conn: any, organizationId: string) {
  const expires = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
  if (Date.now() < expires - 60_000 && conn.access_token) return conn // still valid

  const refreshed = await refreshAccessToken(conn.refresh_token)
  const newAccess = refreshed.access_token
  const instance_url = refreshed.instance_url || conn.instance_url
  const token_expires_at = new Date(Date.now() + 1000 * 60 * 110).toISOString()

  const { error } = await supabase
    .from("integration_connections")
    .update({
      access_token: newAccess,
      instance_url,
      token_expires_at,
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", organizationId)
    .eq("provider", "salesforce")
  if (error) throw error

  return { ...conn, access_token: newAccess, instance_url, token_expires_at }
}

async function sfFetch(instanceUrl: string, path: string, accessToken: string) {
  const url = `${instanceUrl}${path}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`SF API error: ${res.status} ${txt}`)
  }
  return res.json()
}

function toSFDateTimeLiteral(iso: string) {
  return `'${new Date(iso).toISOString().replace(".000Z", "Z")}'`
}
function soqlWithSince(base: string, since?: string | null) {
  const order = " ORDER BY SystemModstamp ASC"
  return since ? `${base} WHERE SystemModstamp >= ${toSFDateTimeLiteral(since)}${order}` : base + order
}

async function upsertBatch(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  obj: Obj,
  records: any[]
) {
  const fn = RAW_TABLE_FN[obj]
  for (const r of records) {
    const id = r.Id as string
    const mod = r.SystemModstamp ? new Date(r.SystemModstamp).toISOString() : null
    await supabase.rpc(fn, { p_org: organizationId, p_id: id, p_data: r, p_mod: mod })
  }
}

export async function POST(req: Request) {
  const supabase = createClient()
  let orgId = ""
  let objDuringError: Obj | undefined

  try {
    const { organizationId, pageLimit = 2 } = await req.json()
    if (!organizationId) {
      return NextResponse.json({ ok: false, error: "organizationId required" }, { status: 400 })
    }
    orgId = organizationId

    // NEW: make sure rows exist so UI has something to read
    await ensureSyncRows(supabase, organizationId)

    let conn = await getConnection(supabase, organizationId)
    conn = await ensureAccessToken(supabase, conn, organizationId)
    const apiV = "v59.0"

    // Read states (now guaranteed to exist)
    const { data: states, error: stErr } = await supabase
      .from("integration_sync_state")
      .select("object_type, since, phase")
      .eq("organization_id", organizationId)
      .eq("provider", "salesforce")
    if (stErr) throw stErr

    const results: Record<string, number> = { company: 0, contact: 0, deal: 0 }

    for (const obj of ["company", "contact", "deal"] as Obj[]) {
      objDuringError = obj
      const state = states?.find((s: any) => s.object_type === obj)
      const since = state?.since
      const soql = soqlWithSince(SOQL[obj], since)

      // last_run_at
      await supabase
        .from("integration_sync_state")
        .update({ last_run_at: new Date().toISOString() })
        .eq("organization_id", organizationId)
        .eq("provider", "salesforce")
        .eq("object_type", obj)

      let path = `/services/data/${apiV}/query?q=${encodeURIComponent(soql)}`
      let pages = 0
      let maxMod: string | null = since || null

      while (pages < pageLimit) {
        const j = await sfFetch(conn.instance_url, path, conn.access_token)
        const batch = j.records || []
        if (batch.length) {
          await upsertBatch(supabase, organizationId, obj, batch)
          results[obj] += batch.length

          for (const r of batch) {
            const m = r.SystemModstamp ? new Date(r.SystemModstamp).toISOString() : null
            if (m && (!maxMod || m > maxMod)) maxMod = m
          }
        }

        if (!j.done && j.nextRecordsUrl) {
          path = j.nextRecordsUrl
          pages += 1
        } else {
          break
        }
      }

      await supabase
        .from("integration_sync_state")
        .update({
          since: maxMod || since,
          phase: "continuous",
          last_success_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("organization_id", organizationId)
        .eq("provider", "salesforce")
        .eq("object_type", obj)
    }

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    // Optional: write last_error so UI can show it
    if (orgId && objDuringError) {
      await createClient()
        .from("integration_sync_state")
        .update({ last_error: String(e?.message ?? e) })
        .eq("organization_id", orgId)
        .eq("provider", "salesforce")
        .eq("object_type", objDuringError)
    }
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 })
  }
}