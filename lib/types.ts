// Enhanced types file with contacts system

// Existing types (keeping for compatibility)
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: 'admin' | 'user'
  organization_id?: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  name: string
  organization_id: string
  health_score?: number
  arr?: number
  churn_risk_score?: number
  status?: 'active' | 'churned' | 'at_risk' | 'onboarding'
  created_at: string
  updated_at: string
}

export interface Engagement {
  id: string
  account_id: string
  type: string
  outcome?: string
  notes?: string
  engagement_date: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface CustomerGoal {
  id: string
  account_id: string
  title: string
  description?: string
  target_value?: number
  current_value?: number
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk'
  due_date?: string
  created_at: string
  updated_at: string
}

export interface NPSSurvey {
  id: string
  account_id: string
  score: number
  feedback?: string
  survey_date: string
  created_at: string
}

// New Contacts System Types

export interface Contact {
  id: string
  organization_id: string
  account_id?: string
  
  // Basic information
  first_name: string
  last_name: string
  full_name?: string // Computed field
  email?: string
  phone?: string
  title?: string
  department?: string
  
  // Hierarchy and relationships
  manager_id?: string
  manager_name?: string // Computed field
  reports_to_external?: string
  seniority_level?: 'C-Level' | 'VP' | 'Director' | 'Manager' | 'Individual Contributor' | 'Other'
  decision_maker_level?: 'Primary' | 'Influencer' | 'User' | 'Gatekeeper' | 'Unknown'
  
  // Contact preferences and status
  primary_contact?: boolean
  contact_status?: 'active' | 'inactive' | 'left_company' | 'unresponsive'
  preferred_communication?: 'email' | 'phone' | 'slack' | 'teams' | 'in_person'
  timezone?: string
  
  // Engagement and relationship data
  last_engagement_date?: string
  engagement_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'rarely'
  relationship_strength?: 'champion' | 'supporter' | 'neutral' | 'detractor' | 'unknown'
  
  // Additional metadata
  linkedin_url?: string
  notes?: string
  tags?: string[]
  custom_fields?: Record<string, any>
  
  // Computed fields
  account_name?: string
  group_count?: number
  direct_reports_count?: number
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ContactGroup {
  id: string
  organization_id: string
  name: string
  description?: string
  color?: string
  created_at: string
  updated_at: string
  created_by?: string
  
  // Computed fields
  member_count?: number
  contacts?: Contact[]
}

export interface ContactGroupMembership {
  id: string
  contact_id: string
  group_id: string
  added_at: string
  added_by?: string
  
  // Populated fields
  contact?: Contact
  group?: ContactGroup
}

export interface ContactGoalRole {
  id: string
  contact_id: string
  goal_id: string
  role: string
  influence_level?: 'high' | 'medium' | 'low'
  created_at: string
  
  // Populated fields
  contact?: Contact
  goal?: CustomerGoal
}

export interface EngagementParticipant {
  id: string
  engagement_id: string
  contact_id: string
  participation_type?: 'organizer' | 'attendee' | 'optional' | 'mentioned'
  response_status?: 'accepted' | 'declined' | 'tentative' | 'no_response'
  added_at: string
  
  // Populated fields
  contact?: Contact
  engagement?: Engagement
}

export interface ContactHierarchy {
  id: string
  organization_id: string
  contact_id: string
  parent_contact_id?: string
  hierarchy_level?: number
  department_head?: boolean
  created_at: string
  
  // Populated fields
  contact?: Contact
  parent_contact?: Contact
  children?: ContactHierarchy[]
}

export interface AutomationRecipient {
  id: string
  automation_id: string
  contact_id?: string
  group_id?: string
  recipient_type: 'individual' | 'group'
  added_at: string
  
  // Populated fields
  contact?: Contact
  group?: ContactGroup
}

// Decision maker analysis type
export interface DecisionMakerAnalysis {
  account_id: string
  account_name: string
  organization_id: string
  primary_decision_makers: number
  influencers: number
  users: number
  gatekeepers: number
  unknown_role: number
  c_level_contacts: number
  vp_contacts: number
  champions: number
  supporters: number
  detractors: number
  total_contacts: number
}

// Contact form types
export interface ContactFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  title?: string
  department?: string
  account_id?: string
  manager_id?: string
  seniority_level?: Contact['seniority_level']
  decision_maker_level?: Contact['decision_maker_level']
  primary_contact?: boolean
  preferred_communication?: Contact['preferred_communication']
  relationship_strength?: Contact['relationship_strength']
  linkedin_url?: string
  notes?: string
  tags?: string[]
  group_ids?: string[]
}

export interface ContactGroupFormData {
  name: string
  description?: string
  color?: string
}

// API response types
export interface ContactsResponse {
  data: Contact[]
  count?: number
  page?: number
  limit?: number
}

export interface ContactGroupsResponse {
  data: ContactGroup[]
  count?: number
}

// Filter and search types
export interface ContactFilters {
  account_id?: string
  group_id?: string
  seniority_level?: Contact['seniority_level']
  decision_maker_level?: Contact['decision_maker_level']
  contact_status?: Contact['contact_status']
  relationship_strength?: Contact['relationship_strength']
  search?: string
  tags?: string[]
}

export interface ContactSortOptions {
  field: 'name' | 'title' | 'last_engagement_date' | 'created_at'
  direction: 'asc' | 'desc'
}

// Org chart types
export interface OrgChartNode {
  id: string
  contact: Contact
  children: OrgChartNode[]
  level: number
  isExpanded?: boolean
}

export interface OrgChartData {
  roots: OrgChartNode[]
  orphans: Contact[] // Contacts without manager relationships
  stats: {
    total_contacts: number
    levels: number
    departments: string[]
  }
}

// Automation integration types
export interface AutomationContactTarget {
  type: 'individual' | 'group'
  id: string
  name: string
  count?: number // For groups, number of contacts
}

// Enhanced engagement type with participants
export interface EngagementWithParticipants extends Engagement {
  participants?: EngagementParticipant[]
  participant_contacts?: Contact[]
}

// Enhanced goal type with contact roles
export interface GoalWithContacts extends CustomerGoal {
  contact_roles?: ContactGoalRole[]
  contacts?: Contact[]
}

// Contact analytics types
export interface ContactAnalytics {
  total_contacts: number
  by_seniority: Record<string, number>
  by_decision_maker_level: Record<string, number>
  by_relationship_strength: Record<string, number>
  by_account: Array<{
    account_id: string
    account_name: string
    contact_count: number
    decision_maker_coverage: number
  }>
  engagement_frequency: Record<string, number>
  recent_additions: Contact[]
  stale_contacts: Contact[] // Contacts without recent engagement
}

// Export all types
export type {
  // Keep existing exports for compatibility
  User,
  Organization,
  Account,
  Engagement,
  CustomerGoal,
  NPSSurvey,
  
  // New contact system exports
  Contact,
  ContactGroup,
  ContactGroupMembership,
  ContactGoalRole,
  EngagementParticipant,
  ContactHierarchy,
  AutomationRecipient,
  DecisionMakerAnalysis,
  ContactFormData,
  ContactGroupFormData,
  ContactsResponse,
  ContactGroupsResponse,
  ContactFilters,
  ContactSortOptions,
  OrgChartNode,
  OrgChartData,
  AutomationContactTarget,
  EngagementWithParticipants,
  GoalWithContacts,
  ContactAnalytics
}