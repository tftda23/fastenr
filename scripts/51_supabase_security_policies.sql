-- CRITICAL SECURITY: Supabase-compatible Organization Isolation
-- This script implements Row Level Security policies for Supabase

-- Enable RLS on critical tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "accounts_org_isolation" ON accounts;
DROP POLICY IF EXISTS "engagements_org_isolation" ON engagements;
DROP POLICY IF EXISTS "contacts_org_isolation" ON contacts;
DROP POLICY IF EXISTS "customer_goals_org_isolation" ON customer_goals;
DROP POLICY IF EXISTS "nps_surveys_org_isolation" ON nps_surveys;
DROP POLICY IF EXISTS "onboarding_plans_org_isolation" ON onboarding_plans;

-- Create STRICT organization isolation policies
CREATE POLICY "accounts_org_isolation" ON accounts
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

CREATE POLICY "engagements_org_isolation" ON engagements
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

CREATE POLICY "contacts_org_isolation" ON contacts
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

CREATE POLICY "customer_goals_org_isolation" ON customer_goals
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

CREATE POLICY "nps_surveys_org_isolation" ON nps_surveys
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

CREATE POLICY "onboarding_plans_org_isolation" ON onboarding_plans
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

-- Create security audit table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  attempted_access_org_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their organization's audit logs
CREATE POLICY "security_audit_log_org_isolation" ON security_audit_log
  FOR SELECT USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Verify policies are created
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('accounts', 'engagements', 'contacts')
  AND policyname LIKE '%org_isolation';
  
  IF policy_count < 3 THEN
    RAISE EXCEPTION 'CRITICAL: Not all security policies were created - Found % policies', policy_count;
  END IF;
  
  RAISE NOTICE 'SUCCESS: Organization isolation policies created - % policies active', policy_count;
END;
$$;