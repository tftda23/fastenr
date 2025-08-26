// app/api/etl/accounts/from-crm/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Provider = "hubspot" | "salesforce"

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase envs missing (URL or SERVICE_ROLE_KEY)")
  // @ts-ignore service-role client (bypasses RLS)
  return createClient(url, key, { auth: { persistSession: false } })
}

type RawRow = {
  object_id: string
  organization_id: string
  properties: any
  updated_at: string
}

// ---------- helpers ----------
function domainFromName(name?: string | null) {
  const base = (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return (base || "unknown") + ".local"
}

function cleanHostish(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9.-]/g, "")
}

function domainFromWebsite(url?: string | null) {
  if (!url) return null
  try {
    const norm = url.startsWith("http") ? url : `https://${url}`
    const u = new URL(norm)
    const host = u.hostname.toLowerCase().replace(/^www\./, "")
    return host || null
  } catch {
    const salvaged = cleanHostish(url).replace(/^www\./, "")
    return salvaged || null
  }
}

// HubSpot -> Account
function mapHsCompanyToAccount(p: any) {
  const name = p?.name ?? null
  const hsDomain = (p?.domain ?? "").toString().trim().toLowerCase() || null
  const arr =
    p?.annualrevenue != null && !Number.isNaN(Number(p.annualrevenue))
      ? Number(p.annualrevenue)
      : null
  const domain = hsDomain || domainFromName(name || undefined)
  return { name, domain, arr }
}

// Salesforce -> Account
function mapSfAccountToAccount(p: any) {
  const name = p?.Name ?? null
  const website = p?.Website ?? null
  const domain = domainFromWebsite(website) || domainFromName(name || undefined)
  const arr =
    p?.AnnualRevenue != null && !Number.isNaN(Number(p.AnnualRevenue))
      ? Number(p.AnnualRevenue)
      : null
  return { name, domain, arr }
}

// Choose best candidate when multiple rows collide on (org, domain)
function chooseBetter(a: any, b: any) {
  const aReal = a.domain && !a.domain.endsWith(".local")
  const bReal = b.domain && !b.domain.endsWith(".local")
  if (aReal !== bReal) return aReal ? a : b

  const aArr = typeof a.arr === "number"
  const bArr = typeof b.arr === "number"
  if (aArr !== bArr) return aArr ? a : b

  const aT = a.updated_at ? Date.parse(a.updated_at) : 0
  const bT = b.updated_at ? Date.parse(b.updated_at) : 0
  if (aT !== bT) return aT > bT ? a : b

  if ((a.name || "").length !== (b.name || "").length) {
    return (a.name || "").length > (b.name || "").length ? a : b
  }
  return a
}

// ---------- handler ----------
export async function POST(req: Request) {
  const diag: any = { ok: false, step: "start" }
  try {
    const body = await req.json()
    const organizationId: string | undefined = body.organizationId
    const provider: Provider = (body.provider as Provider) ?? "hubspot"
    const lookbackMinutes: number =
      body.lookbackMinutes ?? (provider === "salesforce" ? 60 * 24 * 30 : 240) // 30d default on first SF run

    if (!organizationId) {
      return NextResponse.json({ ok: false, error: "organizationId required" }, { status: 400 })
    }

    const sb = admin()
    const sinceIso = new Date(Date.now() - lookbackMinutes * 60_000).toISOString()

    // 1) Read raw
    diag.step = "read_raw"
    let rows: RawRow[] = []

    if (provider === "hubspot") {
      const { data, error } = await sb
        .from("integration_objects_raw")
        .select("object_id, organization_id, properties, updated_at, last_seen_at")
        .eq("organization_id", organizationId)
        .eq("provider", "hubspot")
        .eq("object_type", "company")
        .gte("last_seen_at", sinceIso)
        .limit(5000)
      if (error) throw new Error("read raw failed: " + error.message)
      rows =
        (data as any[])?.map((r) => ({
          object_id: r.object_id,
          organization_id: r.organization_id,
          properties: typeof r.properties === "string" ? safeParse(r.properties) : r.properties,
          updated_at: r.updated_at,
        })) ?? []
    } else {
      const { data, error } = await sb
        .from("integration_raw_salesforce_accounts")
        .select("sf_id, organization_id, data, system_modstamp")
        .eq("organization_id", organizationId)
        .gte("system_modstamp", sinceIso)
        .order("system_modstamp", { ascending: true })
        .limit(5000)
      if (error) throw new Error("read raw failed: " + error.message)
      rows =
        (data as any[])?.map((r) => ({
          object_id: r.sf_id,
          organization_id: r.organization_id,
          properties: typeof r.data === "string" ? safeParse(r.data) : r.data,
          updated_at: r.system_modstamp,
        })) ?? []
    }

    if (!rows.length) {
      return NextResponse.json({
        ok: true,
        provider,
        upsertedAccounts: 0,
        linked: 0,
        note: "no recent company changes",
      })
    }

    // 2) Build candidate upserts, DEDUPE by (organization_id, domain)
    diag.step = "upsert_accounts"
    const candidateMap = new Map<string, any>()

    for (const r of rows) {
      const props = r.properties
      const m = provider === "hubspot" ? mapHsCompanyToAccount(props) : mapSfAccountToAccount(props)
      if (!m.name || !m.domain) continue

      const up = {
        organization_id: r.organization_id,
        name: m.name,
        domain: m.domain,
        arr: m.arr,
        updated_at: r.updated_at,
      }
      const key = `${up.organization_id}::${up.domain}`
      const prev = candidateMap.get(key)
      candidateMap.set(key, prev ? chooseBetter(prev, up) : up)
    }

    const acctUpserts = Array.from(candidateMap.values())

    if (acctUpserts.length) {
      const { error: acctErr } = await sb
        .from("accounts")
        .upsert(acctUpserts, { onConflict: "organization_id,domain" })
      if (acctErr) {
        diag.details = { upserts: acctUpserts.length }
        throw new Error("upsert accounts failed: " + acctErr.message)
      }
    }

    // 3) Fetch accounts to build links (based on the domains we actually upserted)
    diag.step = "read_accounts"
    const domains = acctUpserts.map((a: any) => a.domain)
    const { data: accs, error: accReadErr } = await sb
      .from("accounts")
      .select("id, organization_id, domain")
      .eq("organization_id", organizationId)
      .in("domain", domains)
    if (accReadErr) throw new Error("read accounts failed: " + accReadErr.message)

    const domainToId = new Map<string, string>()
    for (const a of accs || []) domainToId.set(a.domain, a.id)

    // 4) Upsert external links for ALL source rows (even if duplicates by domain; object_id is unique per provider)
    diag.step = "upsert_links"
    const links = rows
      .map((r) => {
        const m = provider === "hubspot" ? mapHsCompanyToAccount(r.properties) : mapSfAccountToAccount(r.properties)
        const account_id = m.domain ? domainToId.get(m.domain) : null
        if (!account_id) return null
        return {
          organization_id: organizationId,
          domain_table: "accounts",
          domain_id: account_id,
          provider,
          object_type: "company",
          object_id: r.object_id,
        }
      })
      .filter(Boolean) as any[]

    let linked = 0
    if (links.length) {
      const { error: linkErr } = await sb.from("external_object_links").upsert(links)
      if (linkErr) throw new Error("upsert links failed: " + linkErr.message)
      linked = links.length
    }

    return NextResponse.json({
      ok: true,
      provider,
      upsertedAccounts: acctUpserts.length,
      linked,
    })
  } catch (e: any) {
    const out = { ...diag, error: String(e?.message ?? e) }
    return NextResponse.json(out, { status: 500 })
  }
}

function safeParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return {}
  }
}