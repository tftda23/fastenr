-- Drop all existing tables and functions to start fresh
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS adoption_metrics CASCADE;
DROP TABLE IF EXISTS customer_goals CASCADE;
DROP TABLE IF EXISTS health_scores CASCADE;
DROP TABLE IF EXISTS nps_surveys CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS get_user_organization_id() CASCADE;
DROP FUNCTION IF EXISTS is_user_admin() CASCADE;
DROP FUNCTION IF EXISTS calculate_churn_risk(uuid) CASCADE;

-- Create organizations table
CREATE TABLE organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text,
  role text DEFAULT 'read' CHECK (role IN ('read', 'read_write', 'read_write_delete', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- DISABLE RLS on user_profiles to avoid infinite recursion
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create accounts table
CREATE TABLE accounts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  industry text,
  size text CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  arr numeric(12,2),
  health_score integer DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk_score integer DEFAULT 50 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  status text DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'churned')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies for accounts (no circular dependencies)
CREATE POLICY "Users can access accounts in their organization" ON accounts
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create engagements table
CREATE TABLE engagements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'note', 'demo', 'training')),
  title text NOT NULL,
  description text,
  outcome text CHECK (outcome IN ('positive', 'neutral', 'negative')),
  attendees text[],
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on engagements
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for engagements
CREATE POLICY "Users can access engagements in their organization" ON engagements
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create NPS surveys table
CREATE TABLE nps_surveys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback text,
  survey_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on nps_surveys
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for nps_surveys
CREATE POLICY "Users can access NPS surveys in their organization" ON nps_surveys
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create health scores table
CREATE TABLE health_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  factors jsonb,
  recorded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on health_scores
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for health_scores
CREATE POLICY "Users can access health scores in their organization" ON health_scores
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create customer goals table
CREATE TABLE customer_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'achieved', 'missed')),
  target_date date,
  completion_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on customer_goals
ALTER TABLE customer_goals ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for customer_goals
CREATE POLICY "Users can access goals in their organization" ON customer_goals
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create adoption metrics table
CREATE TABLE adoption_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric,
  metric_type text CHECK (metric_type IN ('usage', 'feature_adoption', 'engagement', 'custom')),
  recorded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on adoption_metrics
ALTER TABLE adoption_metrics ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for adoption_metrics
CREATE POLICY "Users can access adoption metrics in their organization" ON adoption_metrics
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create API keys table
CREATE TABLE api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  permissions text[] DEFAULT ARRAY['read'],
  last_used_at timestamp with time zone,
  created_by uuid REFERENCES auth.users ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamp with time zone
);

-- Enable RLS on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for api_keys
CREATE POLICY "Users can access API keys in their organization" ON api_keys
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create simple churn risk calculation function
CREATE OR REPLACE FUNCTION calculate_churn_risk(account_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  health_score_val integer;
  nps_score_val integer;
  goals_at_risk integer;
  churn_risk integer;
BEGIN
  -- Get latest health score
  SELECT score INTO health_score_val
  FROM health_scores
  WHERE account_id = account_uuid
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Get average NPS score
  SELECT AVG(score)::integer INTO nps_score_val
  FROM nps_surveys
  WHERE account_id = account_uuid
  AND survey_date >= CURRENT_DATE - INTERVAL '90 days';

  -- Count goals at risk
  SELECT COUNT(*)::integer INTO goals_at_risk
  FROM customer_goals
  WHERE account_id = account_uuid
  AND status = 'at_risk';

  -- Calculate churn risk (simple algorithm)
  churn_risk := GREATEST(0, LEAST(100, 
    100 - COALESCE(health_score_val, 50) - 
    (COALESCE(nps_score_val, 5) * 5) + 
    (goals_at_risk * 10)
  ));

  RETURN churn_risk;
END;
$$;

-- Insert sample data
INSERT INTO organizations (id, name) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization');

-- Note: user_profiles will be created during signup process
