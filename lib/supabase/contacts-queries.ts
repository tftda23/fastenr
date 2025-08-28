import { createClient, createServerClient } from './server'
import { getCurrentUserOrganization } from './queries'
import { 
  Contact, 
  ContactGroup, 
  ContactFormData, 
  ContactGroupFormData,
  ContactFilters,
  ContactSortOptions,
  DecisionMakerAnalysis,
  OrgChartData
} from '../types'

// Contact CRUD operations
export async function getContacts(
  filters?: ContactFilters,
  sort?: ContactSortOptions,
  page = 1,
  limit = 50
) {
  console.log('getContacts - Called with:', { filters, sort, page, limit })
  const { user, organization } = await getCurrentUserOrganization()
  console.log('getContacts - user:', user?.id, 'organization:', organization?.id)
  console.log('getContacts - user object:', JSON.stringify(user, null, 2))
  console.log('getContacts - organization object:', JSON.stringify(organization, null, 2))
  if (!user || !organization) {
    console.error('getContacts - Authentication failed: user or organization missing')
    throw new Error("User not authenticated")
  }

  const supabase = createClient()
  
  let query = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('organization_id', organization.id)

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
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
  }

  // Apply sorting
  if (sort) {
    const column = sort.field === 'name' ? 'first_name' : sort.field
    query = query.order(column, { ascending: sort.direction === 'asc' })
  } else {
    query = query.order('first_name', { ascending: true })
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  console.log('getContacts - About to execute query for org:', organization.id)
  const { data, error, count } = await query

  console.log('getContacts - Query result:', { 
    dataLength: data?.length, 
    count, 
    error: error ? JSON.stringify(error, null, 2) : null,
    sampleData: data?.slice(0, 2)
  })
  
  if (error) {
    console.error('getContacts - Database error:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to fetch contacts: ${error.message}`)
  }

  const result = {
    data: data as Contact[],
    count,
    page,
    limit
  }
  
  console.log('getContacts - Returning result:', result)
  return result
}

export async function getContactById(contactId: string) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', contactId)
    .eq('organization_id', organization.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch contact: ${error.message}`)
  }

  return data as Contact
}

export async function createContact(contactData: ContactFormData) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  // Extract group_ids from contactData since it's not a database column
  const { group_ids, ...dbContactData } = contactData
  
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      ...dbContactData,
      organization_id: organization.id,
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`)
  }

  // If group_ids provided, add to groups
  if (group_ids && group_ids.length > 0) {
    await addContactToGroups(data.id, group_ids, user.id)
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
export async function getContactGroups() {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('contact_groups')
    .select(`
      *,
      contact_group_memberships(
        contact_id,
        contacts(id, first_name, last_name, email, title)
      )
    `)
    .eq('organization_id', organization.id)
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

export async function createContactGroup(groupData: ContactGroupFormData) {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) throw new Error("User not authenticated")

  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('contact_groups')
    .insert({
      ...groupData,
      organization_id: organization.id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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