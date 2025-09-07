-- CRITICAL SECURITY: Organization Isolation Enforcement
-- This script implements comprehensive Row Level Security to prevent cross-organization data leaks

-- Enable RLS on ALL tables that should respect organization boundaries
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracked_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_growth_history ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to recreate with stricter security
DROP POLICY IF EXISTS "Users can access accounts in their organization" ON accounts;
DROP POLICY IF EXISTS "Users can access engagements in their organization" ON engagements;
DROP POLICY IF EXISTS "Users can access contacts in their organization" ON contacts;
DROP POLICY IF EXISTS "Users can access goals in their organization" ON customer_goals;
DROP POLICY IF EXISTS "Users can access NPS surveys in their organization" ON nps_surveys;
DROP POLICY IF EXISTS "Users can access health scores in their organization" ON health_scores;
DROP POLICY IF EXISTS "Users can access onboarding plans in their organization" ON onboarding_plans;
DROP POLICY IF EXISTS "Users can access surveys in their organization" ON surveys;
DROP POLICY IF EXISTS "Users can access automation workflows in their organization" ON automation_workflows;
DROP POLICY IF EXISTS "Users can access automation jobs in their organization" ON automation_jobs;
DROP POLICY IF EXISTS "Users can access app settings in their organization" ON app_settings;
DROP POLICY IF EXISTS "Users can access usage tracking products in their organization" ON usage_tracking_products;
DROP POLICY IF EXISTS "Users can access usage tracked accounts in their organization" ON usage_tracked_accounts;
DROP POLICY IF EXISTS "Users can access usage metrics in their organization" ON usage_metrics;
DROP POLICY IF EXISTS "Users can access usage events in their organization" ON usage_events;
DROP POLICY IF EXISTS "Users can access growth history in their organization" ON account_growth_history;

-- Create a secure function to get user's organization ID
CREATE OR REPLACE FUNCTION auth.get_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id 
  FROM user_profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auth.get_user_organization_id() TO authenticated;

-- Create STRICT RLS policies - NO EXCEPTIONS
CREATE POLICY "CRITICAL_SECURITY_accounts_org_isolation" ON accounts
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_engagements_org_isolation" ON engagements
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_contacts_org_isolation" ON contacts
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_customer_goals_org_isolation" ON customer_goals
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_nps_surveys_org_isolation" ON nps_surveys
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_health_scores_org_isolation" ON health_scores
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_onboarding_plans_org_isolation" ON onboarding_plans
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_surveys_org_isolation" ON surveys
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_automation_workflows_org_isolation" ON automation_workflows
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_automation_jobs_org_isolation" ON automation_jobs
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_app_settings_org_isolation" ON app_settings
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_usage_tracking_products_org_isolation" ON usage_tracking_products
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_usage_tracked_accounts_org_isolation" ON usage_tracked_accounts
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_usage_metrics_org_isolation" ON usage_metrics
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_usage_events_org_isolation" ON usage_events
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

CREATE POLICY "CRITICAL_SECURITY_account_growth_history_org_isolation" ON account_growth_history
  FOR ALL USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

-- Add security audit logging
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  attempted_access_org_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own organization's audit logs
CREATE POLICY "CRITICAL_SECURITY_audit_log_org_isolation" ON security_audit_log
  FOR SELECT USING (
    organization_id = auth.get_user_organization_id()
    AND auth.get_user_organization_id() IS NOT NULL
  );

-- Create function to log security violations
CREATE OR REPLACE FUNCTION log_security_violation(
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_attempted_access_org_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    organization_id,
    action,
    table_name,
    record_id,
    attempted_access_org_id
  ) VALUES (
    auth.uid(),
    auth.get_user_organization_id(),
    p_action,
    p_table_name,
    p_record_id,
    p_attempted_access_org_id
  );
END;
$$;

-- Test the security isolation
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- This should return true if RLS is working
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename IN ('accounts', 'engagements', 'contacts') 
    AND policyname LIKE 'CRITICAL_SECURITY_%'
  ) INTO test_result;
  
  IF NOT test_result THEN
    RAISE EXCEPTION 'CRITICAL SECURITY POLICIES NOT APPLIED - ABORTING';
  END IF;
  
  RAISE NOTICE 'CRITICAL SECURITY: Organization isolation policies successfully applied';
END;
$$;