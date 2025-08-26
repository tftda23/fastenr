-- Create comprehensive automation system
-- This creates the missing tables and a proper job execution system

-- Create automation workflows table
CREATE TABLE IF NOT EXISTS automation_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  enabled BOOLEAN DEFAULT FALSE,
  scope_all_accounts BOOLEAN DEFAULT TRUE,
  
  -- Trigger configuration
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  
  -- Conditions (optional filters)
  condition_config JSONB DEFAULT '{}',
  
  -- Action configuration  
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  
  -- Execution tracking
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create automation workflow accounts (for scoped workflows)
CREATE TABLE IF NOT EXISTS automation_workflow_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(workflow_id, account_id)
);

-- Create automation runs (execution history)
CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed', 'skipped')),
  trigger_data JSONB,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create automation jobs queue (for background processing)
CREATE TABLE IF NOT EXISTS automation_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES automation_workflows(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'trigger_check', 'execute_action', 'scheduled_run'
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflows_status ON automation_workflows(status, enabled);
CREATE INDEX IF NOT EXISTS idx_automation_workflow_accounts_workflow ON automation_workflow_accounts(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_workflow_accounts_account ON automation_workflow_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_workflow ON automation_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_account ON automation_runs(account_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_status ON automation_runs(status);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON automation_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_workflow ON automation_jobs(workflow_id);

-- Disable RLS for simplicity (following existing pattern)
ALTER TABLE automation_workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflow_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_jobs DISABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_automation_workflows_updated_at ON automation_workflows;
CREATE TRIGGER update_automation_workflows_updated_at 
    BEFORE UPDATE ON automation_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automation_jobs_updated_at ON automation_jobs;
CREATE TRIGGER update_automation_jobs_updated_at 
    BEFORE UPDATE ON automation_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample automation templates
INSERT INTO automation_workflows (
  organization_id, 
  name, 
  description, 
  trigger_type, 
  trigger_config,
  action_type, 
  action_config,
  status,
  enabled
) VALUES 
-- Get the first organization ID for demo data
((SELECT id FROM organizations LIMIT 1),
 'Health Score Alert',
 'Send alert when account health score drops below 70',
 'health_score_below',
 '{"threshold": 70}',
 'send_email',
 '{"template": "health_alert", "recipients": ["csm@company.com"]}',
 'draft',
 false),

((SELECT id FROM organizations LIMIT 1),
 'Contract Renewal Reminder', 
 'Send reminder 30 days before contract expires',
 'contract_ends_in',
 '{"days": 30}',
 'send_email',
 '{"template": "renewal_reminder", "recipients": ["account_manager@company.com"]}',
 'draft',
 false),

((SELECT id FROM organizations LIMIT 1),
 'New Account Onboarding',
 'Start onboarding sequence when new account is created',
 'account_created',
 '{}',
 'send_email_sequence',
 '{"sequence": "onboarding", "delay_hours": 24}',
 'draft',
 false)
ON CONFLICT DO NOTHING;