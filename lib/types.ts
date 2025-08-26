export interface Organization {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  organization_id: string
  email: string
  full_name: string | null
  role: "read" | "read_write" | "read_write_delete" | "admin"
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  organization_id: string
  name: string
  industry: string | null
  size: "startup" | "small" | "medium" | "large" | "enterprise" | null
  arr: number | null
  status: "active" | "churned" | "at_risk" | "onboarding"
  health_score: number
  churn_risk_score: number
  created_at: string
  updated_at: string
}

export interface Engagement {
  id: string
  organization_id: string
  account_id: string
  created_by: string
  type: "meeting" | "call" | "email" | "note" | "demo" | "training"
  title: string
  description: string | null
  outcome: "positive" | "neutral" | "negative" | "action_required" | null
  scheduled_at: string | null
  completed_at: string | null
  attendees: any[]
  created_at: string
  updated_at: string
}

export interface NPSSurvey {
  id: string
  organization_id: string
  account_id: string
  score: number
  feedback: string | null
  survey_date: string
  respondent_name: string | null
  respondent_email: string | null
  created_at: string
}

export interface HealthMetric {
  id: string
  organization_id: string
  account_id: string
  metric_date: string
  login_frequency: number
  feature_adoption_score: number
  support_tickets: number
  training_completion_rate: number
  overall_health_score: number
  created_at: string
}

export interface CustomerGoal {
  id: string
  organization_id: string
  account_id: string
  title: string
  description: string | null
  metric_type?: "accounts" | "arr" | "nps" | "health_score" | "adoption" | "renewals" | "seat_count" | "custom" | null
  current_value: number
  target_value: number | null
  unit?: string | null
  measurement_period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | null
  created_by?: string | null
  status: "on_track" | "at_risk" | "achieved" | "missed"
  target_date: string | null
  completion_date?: string | null
  created_at: string
  updated_at: string
}

export interface AdoptionMetric {
  id: string
  organization_id: string
  account_id: string
  metric_name: string
  metric_value: number
  metric_type: "usage" | "feature_adoption" | "engagement" | "custom"
  recorded_at: string
  created_at: string
}

export interface MetricSuggestions {
  currentARR: number
  currentHealthScore: number
  currentNPS: number
  currentAdoption: number
  churnRisk: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Dashboard types
export interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  atRiskAccounts: number
  churnedAccounts: number
  averageHealthScore: number
  averageChurnRisk: number
  totalARR: number
  npsScore: number
}

export interface ChurnRiskAccount {
  id: string
  name: string
  churn_risk_score: number
  health_score: number
  arr: number | null
  last_engagement: string | null
}

export type AutomationStatus = 'draft' | 'active' | 'paused';

export interface AutomationWorkflow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: AutomationStatus;
  enabled: boolean;
  scope_all_accounts: boolean;

  trigger_type: string;
  trigger_config: Record<string, any>;
  condition_config: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;

  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationRun {
  id: string;
  workflow_id: string;
  status: 'queued' | 'running' | 'success' | 'failed' | 'skipped';
  started_at: string | null;
  finished_at: string | null;
  result?: Record<string, any> | null;
  error?: string | null;
}
