-- Drop all RLS policies first to remove dependencies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their organization" ON user_profiles;

DROP POLICY IF EXISTS "Users can view accounts in their organization" ON accounts;
DROP POLICY IF EXISTS "Users can manage accounts based on permissions" ON accounts;

DROP POLICY IF EXISTS "Users can view engagements in their organization" ON engagements;
DROP POLICY IF EXISTS "Users can manage engagements based on permissions" ON engagements;

DROP POLICY IF EXISTS "Users can view NPS surveys in their organization" ON nps_surveys;
DROP POLICY IF EXISTS "Users can manage NPS surveys based on permissions" ON nps_surveys;

DROP POLICY IF EXISTS "Users can view health metrics in their organization" ON health_metrics;
DROP POLICY IF EXISTS "Users can manage health metrics based on permissions" ON health_metrics;

DROP POLICY IF EXISTS "Users can view goals in their organization" ON goals;
DROP POLICY IF EXISTS "Users can manage goals based on permissions" ON goals;

DROP POLICY IF EXISTS "Users can view adoption metrics in their organization" ON adoption_metrics;
DROP POLICY IF EXISTS "Users can manage adoption metrics based on permissions" ON adoption_metrics;

-- Now drop the functions
DROP FUNCTION IF EXISTS get_user_organization_id();
DROP FUNCTION IF EXISTS is_user_admin();

-- Disable RLS on user_profiles to prevent recursion
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create simple policies for other tables that don't reference user_profiles
-- Organizations - users can only see their own organization
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (id::text = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can update their own organization" ON organizations
    FOR UPDATE USING (id::text = auth.jwt() ->> 'organization_id');

-- Accounts - simple organization-based access
CREATE POLICY "Organization access" ON accounts
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- Engagements - simple organization-based access
CREATE POLICY "Organization access" ON engagements
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- NPS Surveys - simple organization-based access
CREATE POLICY "Organization access" ON nps_surveys
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- Health Metrics - simple organization-based access
CREATE POLICY "Organization access" ON health_metrics
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- Goals - simple organization-based access
CREATE POLICY "Organization access" ON goals
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- Adoption Metrics - simple organization-based access
CREATE POLICY "Organization access" ON adoption_metrics
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');

-- API Keys - simple organization-based access
CREATE POLICY "Organization access" ON api_keys
    FOR ALL USING (organization_id::text = auth.jwt() ->> 'organization_id');
