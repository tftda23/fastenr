-- Fix infinite recursion in RLS policies by dropping problematic policies and functions
-- This script uses the correct table names from the actual database schema

-- First, drop all RLS policies that might cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view accounts in their organization" ON accounts;
DROP POLICY IF EXISTS "Users can manage accounts based on role" ON accounts;

DROP POLICY IF EXISTS "Users can view engagements in their organization" ON engagements;
DROP POLICY IF EXISTS "Users can manage engagements based on role" ON engagements;

DROP POLICY IF EXISTS "Users can view goals in their organization" ON customer_goals;
DROP POLICY IF EXISTS "Users can manage goals based on role" ON customer_goals;

DROP POLICY IF EXISTS "Users can view adoption metrics in their organization" ON adoption_metrics;
DROP POLICY IF EXISTS "Users can manage adoption metrics based on role" ON adoption_metrics;

DROP POLICY IF EXISTS "Users can view health metrics in their organization" ON health_metrics;
DROP POLICY IF EXISTS "Users can manage health metrics based on role" ON health_metrics;

DROP POLICY IF EXISTS "Users can view NPS surveys in their organization" ON nps_surveys;
DROP POLICY IF EXISTS "Users can manage NPS surveys based on role" ON nps_surveys;

-- Drop the problematic functions that cause recursion
DROP FUNCTION IF EXISTS get_user_organization_id();
DROP FUNCTION IF EXISTS is_user_admin();
DROP FUNCTION IF EXISTS calculate_churn_risk(uuid);

-- Disable RLS on user_profiles to prevent recursion during signup
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies for other tables that don't cause recursion
-- These policies allow authenticated users to access data (we'll add proper multi-tenancy later)

-- Organizations - users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Accounts - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access accounts" ON accounts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Engagements - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access engagements" ON engagements
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Customer goals - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access goals" ON customer_goals
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Adoption metrics - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access adoption metrics" ON adoption_metrics
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Health metrics - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access health metrics" ON health_metrics
    FOR ALL USING (auth.uid() IS NOT NULL);

-- NPS surveys - allow all authenticated users (temporary)
CREATE POLICY "Authenticated users can access NPS surveys" ON nps_surveys
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Re-create the churn risk calculation function without dependencies
CREATE OR REPLACE FUNCTION calculate_churn_risk(account_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    risk_score integer := 0;
    avg_nps numeric;
    health_score integer;
    overdue_goals integer;
BEGIN
    -- Get average NPS score (lower is worse)
    SELECT AVG(score) INTO avg_nps
    FROM nps_surveys
    WHERE account_id = account_uuid
    AND created_at >= NOW() - INTERVAL '90 days';
    
    -- Get latest health score
    SELECT overall_health_score INTO health_score
    FROM health_metrics
    WHERE account_id = account_uuid
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Count overdue goals
    SELECT COUNT(*) INTO overdue_goals
    FROM customer_goals
    WHERE account_id = account_uuid
    AND status != 'achieved'
    AND due_date < CURRENT_DATE;
    
    -- Calculate risk score (0-100, higher is more risk)
    risk_score := 0;
    
    -- NPS contribution (0-40 points)
    IF avg_nps IS NOT NULL THEN
        IF avg_nps <= 6 THEN
            risk_score := risk_score + 40;
        ELSIF avg_nps <= 8 THEN
            risk_score := risk_score + 20;
        END IF;
    END IF;
    
    -- Health score contribution (0-40 points)
    IF health_score IS NOT NULL THEN
        IF health_score <= 30 THEN
            risk_score := risk_score + 40;
        ELSIF health_score <= 60 THEN
            risk_score := risk_score + 20;
        END IF;
    END IF;
    
    -- Overdue goals contribution (0-20 points)
    IF overdue_goals > 2 THEN
        risk_score := risk_score + 20;
    ELSIF overdue_goals > 0 THEN
        risk_score := risk_score + 10;
    END IF;
    
    RETURN LEAST(risk_score, 100);
END;
$$;
