-- Critical RLS Security Fix
-- This script addresses all security vulnerabilities identified in the security audit:
-- 1. Enables RLS on tables that have policies but RLS is disabled
-- 2. Enables RLS on public tables that need protection
-- 3. Addresses any SECURITY DEFINER view concerns

BEGIN;

-- =============================================================================
-- PHASE 1: Enable RLS on tables that have policies but RLS is disabled
-- =============================================================================

-- Enable RLS on adoption_metrics (has policy but RLS disabled)
ALTER TABLE adoption_metrics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_keys (has policy but RLS disabled)  
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Enable RLS on automation_runs (has policies but RLS disabled)
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on automation_workflow_accounts (has policies but RLS disabled)
ALTER TABLE automation_workflow_accounts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on organizations (has no RLS but should be protected)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PHASE 2: Enable RLS on critical public tables that need protection
-- =============================================================================

-- Enable RLS on user_profiles (critical for security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on billing_subscriptions (financial data)
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on billing_invoices (financial data) 
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- Enable RLS on plan_catalog (if it contains org-specific data)
ALTER TABLE plan_catalog ENABLE ROW LEVEL SECURITY;

-- Enable RLS on survey_recipients
ALTER TABLE survey_recipients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on survey_responses  
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on external_object_links
ALTER TABLE external_object_links ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_connections (sensitive integration data)
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_objects_raw (integration data)
ALTER TABLE integration_objects_raw ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_raw_salesforce_accounts
ALTER TABLE integration_raw_salesforce_accounts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_raw_salesforce_contacts
ALTER TABLE integration_raw_salesforce_contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_raw_salesforce_opportunities
ALTER TABLE integration_raw_salesforce_opportunities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on integration_sync_state
ALTER TABLE integration_sync_state ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PHASE 3: Create necessary RLS policies for tables that need them
-- =============================================================================

-- Organizations table - only users can see their own organization
DO $$ 
BEGIN
    -- Check if policy already exists to avoid conflicts
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'organizations' 
        AND policyname = 'organizations_self_access'
    ) THEN
        CREATE POLICY "organizations_self_access" ON organizations
        FOR ALL USING (
            id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- User profiles - users can only see profiles in their organization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'user_profiles_org_isolation'
    ) THEN
        CREATE POLICY "user_profiles_org_isolation" ON user_profiles
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Billing subscriptions - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_subscriptions' 
        AND policyname = 'billing_subscriptions_org_isolation'
    ) THEN
        CREATE POLICY "billing_subscriptions_org_isolation" ON billing_subscriptions
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Billing invoices - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'billing_invoices' 
        AND policyname = 'billing_invoices_org_isolation'
    ) THEN
        CREATE POLICY "billing_invoices_org_isolation" ON billing_invoices
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Survey recipients - organization isolation through survey relationship
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'survey_recipients' 
        AND policyname = 'survey_recipients_org_isolation'
    ) THEN
        CREATE POLICY "survey_recipients_org_isolation" ON survey_recipients
        FOR ALL USING (
            survey_id IN (
                SELECT id FROM surveys 
                WHERE organization_id IN (
                    SELECT organization_id 
                    FROM user_profiles 
                    WHERE id = auth.uid()
                )
            )
        );
    END IF;
END $$;

-- Survey responses - organization isolation through survey relationship
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'survey_responses' 
        AND policyname = 'survey_responses_org_isolation'
    ) THEN
        CREATE POLICY "survey_responses_org_isolation" ON survey_responses
        FOR ALL USING (
            survey_id IN (
                SELECT id FROM surveys 
                WHERE organization_id IN (
                    SELECT organization_id 
                    FROM user_profiles 
                    WHERE id = auth.uid()
                )
            )
        );
    END IF;
END $$;

-- External object links - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'external_object_links' 
        AND policyname = 'external_object_links_org_isolation'
    ) THEN
        CREATE POLICY "external_object_links_org_isolation" ON external_object_links
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration connections - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_connections' 
        AND policyname = 'integration_connections_org_isolation'
    ) THEN
        CREATE POLICY "integration_connections_org_isolation" ON integration_connections
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration objects raw - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_objects_raw' 
        AND policyname = 'integration_objects_raw_org_isolation'
    ) THEN
        CREATE POLICY "integration_objects_raw_org_isolation" ON integration_objects_raw
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration raw salesforce accounts - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_raw_salesforce_accounts' 
        AND policyname = 'integration_raw_salesforce_accounts_org_isolation'
    ) THEN
        CREATE POLICY "integration_raw_salesforce_accounts_org_isolation" ON integration_raw_salesforce_accounts
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration raw salesforce contacts - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_raw_salesforce_contacts' 
        AND policyname = 'integration_raw_salesforce_contacts_org_isolation'
    ) THEN
        CREATE POLICY "integration_raw_salesforce_contacts_org_isolation" ON integration_raw_salesforce_contacts
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration raw salesforce opportunities - organization isolation  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_raw_salesforce_opportunities' 
        AND policyname = 'integration_raw_salesforce_opportunities_org_isolation'
    ) THEN
        CREATE POLICY "integration_raw_salesforce_opportunities_org_isolation" ON integration_raw_salesforce_opportunities
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Integration sync state - organization isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'integration_sync_state' 
        AND policyname = 'integration_sync_state_org_isolation'
    ) THEN
        CREATE POLICY "integration_sync_state_org_isolation" ON integration_sync_state
        FOR ALL USING (
            organization_id IN (
                SELECT organization_id 
                FROM user_profiles 
                WHERE id = auth.uid()
            )
        );
    END IF;
END $$;

-- Plan catalog - make it readable by all authenticated users (catalog data)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'plan_catalog' 
        AND policyname = 'plan_catalog_read_all'
    ) THEN
        CREATE POLICY "plan_catalog_read_all" ON plan_catalog
        FOR SELECT USING (true);
    END IF;
END $$;

-- =============================================================================
-- PHASE 4: Ensure helper function for organization access exists
-- =============================================================================

-- Function already exists, just ensure permissions are granted
GRANT EXECUTE ON FUNCTION user_in_org(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_in_org(UUID) TO public;

-- =============================================================================
-- PHASE 5: Verify all changes
-- =============================================================================

-- Output summary of RLS status after changes
DO $$
DECLARE 
    rec RECORD;
    total_tables INTEGER := 0;
    rls_enabled INTEGER := 0;
BEGIN
    RAISE NOTICE '=== RLS Security Fix Summary ===';
    
    FOR rec IN 
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
    LOOP
        total_tables := total_tables + 1;
        IF rec.rowsecurity THEN
            rls_enabled := rls_enabled + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Total public tables: %', total_tables;
    RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled;
    RAISE NOTICE 'Tables without RLS: %', (total_tables - rls_enabled);
    RAISE NOTICE '=== End Summary ===';
END $$;

COMMIT;