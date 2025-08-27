import { createServerClient } from './server'
import { 
  Contact, 
  ContactGroup, 
  ContactFormData, 
  ContactGroupFormData,
  ContactFilters,
  ContactSortOptions,
  DecisionMakerAnalysis,
  OrgChartData,
  ContactAnalytics
} from '../types'

// Contact CRUD operations
export async function getContacts(
  organizationId: string,
  filters?: ContactFilters,
  sort?: ContactSortOptions,
  page = 1,
  limit = 50
) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('contact_summary')
    .select('*')
    .eq('organization_id', organizationId)

  // Apply filters
  if (filters) {
    if (filters.account_id) {
      query = query.eq('account_id', filters.account_id)
    }
    if (filters.seniority_level) {
      query = query.eq('seniority_level', filters.seniority_level)
    }
    if (filters.decision_maker_level) {
      query = query.eq('decision_maker_level', filters.decision_maker_level)
    }
    if (filters.contact_status) {
      query = query.eq('contact_status', filters.contact_status)
    }
    if (filters.relationship_strength) {
      query = query.eq('relationship_strength', filters.relationship_strength)
    }
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
  }

  // Apply sorting
  if (sort) {
    const column = sort.field === 'name' ? 'full_name' : sort.field
    query = query.order(column, { ascending: sort.direction === 'asc' })
  } else {
    query = query.order('full_name', { ascending: true })
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch contacts: ${error.message}`)
  }

  return {
    data: data as Contact[],
    count,
    page,
    limit
  }
}

export async function getContactById(contactId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_summary')
    .select('*')
    .eq('id', contactId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch contact: ${error.message}`)
  }

  return data as Contact
}

export async function createContact(contactData: ContactFormData, organizationId: string, userId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...contactData,
      organization_id: organizationId,
      created_by: userId,
      updated_by: userId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`)
  }

  // If group_ids provided, add to groups
  if (contactData.group_ids && contactData.group_ids.length > 0) {
    await addContactToGroups(data.id, contactData.group_ids, userId)
  }

  return data as Contact
}

export async function updateContact(contactId: string, contactData: Partial<ContactFormData>, userId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contacts')
    .update({
      ...contactData,
      updated_by: userId
    })
    .eq('id', contactId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update contact: ${error.message}`)
  }

  return data as Contact
}

export async function deleteContact(contactId: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId)

  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`)
  }

  return true
}

// Contact Groups operations
export async function getContactGroups(organizationId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_groups')
    .select(`
      *,
      contact_group_memberships(
        contact_id,
        contacts(id, first_name, last_name, email, title)
      )
    `)
    .eq('organization_id', organizationId)
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch contact groups: ${error.message}`)
  }

  // Transform data to include member count
  const groups = data.map(group => ({
    ...group,
    member_count: group.contact_group_memberships?.length || 0,
    contacts: group.contact_group_memberships?.map((m: any) => m.contacts) || []
  }))

  return groups as ContactGroup[]
}

export async function createContactGroup(groupData: ContactGroupFormData, organizationId: string, userId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_groups')
    .insert({
      ...groupData,
      organization_id: organizationId,
      created_by: userId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create contact group: ${error.message}`)
  }

  return data as ContactGroup
}

export async function updateContactGroup(groupId: string, groupData: Partial<ContactGroupFormData>) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_groups')
    .update(groupData)
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update contact group: ${error.message}`)
  }

  return data as ContactGroup
}

export async function deleteContactGroup(groupId: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('contact_groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    throw new Error(`Failed to delete contact group: ${error.message}`)
  }

  return true
}

// Group membership operations
export async function addContactToGroups(contactId: string, groupIds: string[], userId: string) {
  const supabase = createServerClient()
  
  const memberships = groupIds.map(groupId => ({
    contact_id: contactId,
    group_id: groupId,
    added_by: userId
  }))

  const { error } = await supabase
    .from('contact_group_memberships')
    .insert(memberships)

  if (error) {
    throw new Error(`Failed to add contact to groups: ${error.message}`)
  }

  return true
}

export async function removeContactFromGroup(contactId: string, groupId: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('contact_group_memberships')
    .delete()
    .eq('contact_id', contactId)
    .eq('group_id', groupId)

  if (error) {
    throw new Error(`Failed to remove contact from group: ${error.message}`)
  }

  return true
}

// Hierarchy and org chart operations
export async function getOrgChart(organizationId: string, accountId?: string): Promise<OrgChartData> {
  const supabase = createServerClient()
  
  let query = supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      title,
      department,
      manager_id,
      seniority_level,
      decision_maker_level,
      contact_status
    `)
    .eq('organization_id', organizationId)
    .eq('contact_status', 'active')

  if (accountId) {
    query = query.eq('account_id', accountId)
  }

  const { data: contacts, error } = await query

  if (error) {
    throw new Error(`Failed to fetch org chart data: ${error.message}`)
  }

  // Build hierarchy tree
  const contactMap = new Map(contacts.map(c => [c.id, c]))
  const roots: any[] = []
  const orphans: any[] = []

  // Find root contacts (no manager or manager not in dataset)
  contacts.forEach(contact => {
    if (!contact.manager_id || !contactMap.has(contact.manager_id)) {
      roots.push(buildOrgNode(contact, contactMap, 0))
    }
  })

  // Find orphans (contacts not included in any hierarchy)
  const includedIds = new Set()
  function markIncluded(node: any) {
    includedIds.add(node.id)
    node.children.forEach(markIncluded)
  }
  roots.forEach(markIncluded)

  contacts.forEach(contact => {
    if (!includedIds.has(contact.id)) {
      orphans.push(contact)
    }
  })

  const departments = [...new Set(contacts.map(c => c.department).filter(Boolean))]

  return {
    roots,
    orphans,
    stats: {
      total_contacts: contacts.length,
      levels: Math.max(...roots.map(getMaxDepth)) + 1,
      departments
    }
  }
}

function buildOrgNode(contact: any, contactMap: Map<string, any>, level: number): any {
  const children = Array.from(contactMap.values())
    .filter(c => c.manager_id === contact.id)
    .map(c => buildOrgNode(c, contactMap, level + 1))

  return {
    id: contact.id,
    contact,
    children,
    level,
    isExpanded: level < 2 // Auto-expand first 2 levels
  }
}

function getMaxDepth(node: any): number {
  if (node.children.length === 0) return node.level
  return Math.max(...node.children.map(getMaxDepth))
}

// Decision maker analysis
export async function getDecisionMakerAnalysis(organizationId: string, accountId?: string) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('decision_maker_analysis')
    .select('*')
    .eq('organization_id', organizationId)

  if (accountId) {
    query = query.eq('account_id', accountId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch decision maker analysis: ${error.message}`)
  }

  return data as DecisionMakerAnalysis[]
}

// Contact analytics
export async function getContactAnalytics(organizationId: string): Promise<ContactAnalytics> {
  const supabase = createServerClient()
  
  // Get all contacts for analysis
  const { data: contacts, error } = await supabase
    .from('contact_summary')
    .select('*')
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to fetch contact analytics: ${error.message}`)
  }

  // Calculate analytics
  const total_contacts = contacts.length

  const by_seniority = contacts.reduce((acc, c) => {
    const level = c.seniority_level || 'Unknown'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const by_decision_maker_level = contacts.reduce((acc, c) => {
    const level = c.decision_maker_level || 'Unknown'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const by_relationship_strength = contacts.reduce((acc, c) => {
    const strength = c.relationship_strength || 'unknown'
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Group by account
  const accountGroups = contacts.reduce((acc, c) => {
    if (!c.account_id) return acc
    
    if (!acc[c.account_id]) {
      acc[c.account_id] = {
        account_id: c.account_id,
        account_name: c.account_name || 'Unknown',
        contacts: []
      }
    }
    acc[c.account_id].contacts.push(c)
    return acc
  }, {} as Record<string, any>)

  const by_account = Object.values(accountGroups).map((group: any) => ({
    account_id: group.account_id,
    account_name: group.account_name,
    contact_count: group.contacts.length,
    decision_maker_coverage: group.contacts.filter((c: any) => 
      ['Primary', 'Influencer'].includes(c.decision_maker_level)
    ).length
  }))

  const engagement_frequency = contacts.reduce((acc, c) => {
    const freq = c.engagement_frequency || 'unknown'
    acc[freq] = (acc[freq] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Recent additions (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recent_additions = contacts.filter(c => 
    new Date(c.created_at) > thirtyDaysAgo
  ).slice(0, 10)

  // Stale contacts (no engagement in 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const stale_contacts = contacts.filter(c => 
    !c.last_engagement_date || new Date(c.last_engagement_date) < ninetyDaysAgo
  ).slice(0, 10)

  return {
    total_contacts,
    by_seniority,
    by_decision_maker_level,
    by_relationship_strength,
    by_account,
    engagement_frequency,
    recent_additions,
    stale_contacts
  }
}

// Engagement participants
export async function addEngagementParticipants(engagementId: string, contactIds: string[]) {
  const supabase = createServerClient()
  
  const participants = contactIds.map(contactId => ({
    engagement_id: engagementId,
    contact_id: contactId,
    participation_type: 'attendee'
  }))

  const { error } = await supabase
    .from('engagement_participants')
    .insert(participants)

  if (error) {
    throw new Error(`Failed to add engagement participants: ${error.message}`)
  }

  return true
}

export async function getEngagementParticipants(engagementId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('engagement_participants')
    .select(`
      *,
      contacts(id, first_name, last_name, email, title)
    `)
    .eq('engagement_id', engagementId)

  if (error) {
    throw new Error(`Failed to fetch engagement participants: ${error.message}`)
  }

  return data
}

// Goal contact roles
export async function addContactToGoal(goalId: string, contactId: string, role: string, influenceLevel?: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_goal_roles')
    .insert({
      goal_id: goalId,
      contact_id: contactId,
      role,
      influence_level: influenceLevel
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add contact to goal: ${error.message}`)
  }

  return data
}

export async function getGoalContacts(goalId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('contact_goal_roles')
    .select(`
      *,
      contacts(id, first_name, last_name, email, title, decision_maker_level)
    `)
    .eq('goal_id', goalId)

  if (error) {
    throw new Error(`Failed to fetch goal contacts: ${error.message}`)
  }

  return data
}