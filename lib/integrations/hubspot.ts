export type SyncObject = 'company' | 'contact' | 'deal';

const PATH: Record<SyncObject, string> = {
  company: "crm/v3/objects/companies",
  contact: "crm/v3/objects/contacts",
  deal:    "crm/v3/objects/deals",
};

// request only what you map now; add more later
const COMPANY_PROPS = ["name","domain","lifecyclestage","annualrevenue","hs_lastmodifieddate"];
const CONTACT_PROPS = ["email","firstname","lastname","company","lifecyclestage","hs_lastmodifieddate"];
const DEAL_PROPS    = ["dealname","amount","dealstage","pipeline","closedate","hs_lastmodifieddate"];

function propsFor(object: SyncObject) {
  if (object === 'company') return COMPANY_PROPS;
  if (object === 'contact') return CONTACT_PROPS;
  return DEAL_PROPS;
}

export async function hubspotFetchPage({
  accessToken,
  object,
  cursor,
  since,                   // ISO timestamp or undefined
  limit = 100,
}: {
  accessToken: string;
  object: SyncObject;
  cursor?: any;
  since?: string;
  limit?: number;
}) {
  const url = new URL(`https://api.hubapi.com/${PATH[object]}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("properties", propsFor(object).join(","));
  url.searchParams.set("archived", "false");
  if (cursor?.after) url.searchParams.set("after", cursor.after);
  // HubSpot supports updatedAfter for some objects on v3 (companies/contacts/deals)
  if (since) url.searchParams.set("updatedAfter", new Date(since).toISOString());

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HubSpot ${object} ${res.status}: ${txt}`);
  }
  const j = await res.json();

  const results = (j.results || []).map((r: any) => ({
    id: String(r.id),
    properties: r.properties ?? {},
    updatedAt: new Date(r.updatedAt || r.properties?.hs_lastmodifieddate || Date.now()).toISOString(),
  }));

  return {
    results,
    nextCursor: j.paging?.next ? { after: j.paging.next.after } : null,
  };
}
