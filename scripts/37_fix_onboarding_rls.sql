-- Fix RLS policies for onboarding tables
-- Use user_profiles instead of users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view processes in their organization" ON onboarding_processes;
DROP POLICY IF EXISTS "Users can manage processes in their organization" ON onboarding_processes;
DROP POLICY IF EXISTS "Users can view checklist items in their organization" ON onboarding_checklist_items;
DROP POLICY IF EXISTS "Users can manage checklist items in their organization" ON onboarding_checklist_items;

-- Create correct RLS policies using user_profiles table
CREATE POLICY "Users can view processes in their organization" ON onboarding_processes
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage processes in their organization" ON onboarding_processes
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- RLS policies for checklist items
CREATE POLICY "Users can view checklist items in their organization" ON onboarding_checklist_items
    FOR SELECT USING (
        process_id IN (
            SELECT id FROM onboarding_processes 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage checklist items in their organization" ON onboarding_checklist_items
    FOR ALL USING (
        process_id IN (
            SELECT id FROM onboarding_processes 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );