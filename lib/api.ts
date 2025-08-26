export async function getEngagements(
  params: {
    accountId?: string
    page?: number
    limit?: number
    search?: string
    type?: string
    outcome?: string
    accountFilter?: string
  } = {},
) {
  const searchParams = new URLSearchParams()

  if (params.accountId) searchParams.set("accountId", params.accountId)
  if (params.page) searchParams.set("page", params.page.toString())
  if (params.limit) searchParams.set("limit", params.limit.toString())
  if (params.search) searchParams.set("search", params.search)
  if (params.type) searchParams.set("type", params.type)
  if (params.outcome) searchParams.set("outcome", params.outcome)
  if (params.accountFilter) searchParams.set("accountFilter", params.accountFilter)

  const response = await fetch(`/api/engagements?${searchParams}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

export async function createEngagement(engagement: any) {
  const response = await fetch("/api/engagements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(engagement),
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}
