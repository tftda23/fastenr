-- Simple onboarding schema creation
-- Focus on core tables needed for the functionality

-- Main onboarding processes table
CREATE TABLE IF NOT EXISTS onboarding_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    account_id UUID NOT NULL,
    name TEXT NOT NULL DEFAULT 'Onboarding Process',
    process_type TEXT NOT NULL DEFAULT 'onboarding' CHECK (process_type IN ('onboarding', 'offboarding')),
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Dates
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    target_completion_date TIMESTAMPTZ,
    actual_completion_date TIMESTAMPTZ,
    
    -- Ownership
    owner_id UUID,
    created_by UUID,
    
    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Details
    description TEXT,
    notes TEXT
);

-- Checklist items for each onboarding process
CREATE TABLE IF NOT EXISTS onboarding_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES onboarding_processes(id) ON DELETE CASCADE,
    
    -- Item details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    
    -- Task metadata
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Dates and scheduling
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Assignment
    assignee_id UUID,
    completed_by UUID,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_org_account ON onboarding_processes(organization_id, account_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_status ON onboarding_processes(status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_process ON onboarding_checklist_items(process_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON onboarding_checklist_items(process_id, order_index);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_processes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_checklist_items TO authenticated;

-- Row Level Security
ALTER TABLE onboarding_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_processes
CREATE POLICY "Users can view processes in their organization" ON onboarding_processes
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage processes in their organization" ON onboarding_processes
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- RLS policies for checklist items
CREATE POLICY "Users can view checklist items in their organization" ON onboarding_checklist_items
    FOR SELECT USING (
        process_id IN (
            SELECT id FROM onboarding_processes 
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage checklist items in their organization" ON onboarding_checklist_items
    FOR ALL USING (
        process_id IN (
            SELECT id FROM onboarding_processes 
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Insert some sample data if there are existing organizations and accounts
DO $$
DECLARE
    sample_org_id UUID;
    sample_account_id UUID;
    sample_user_id UUID;
    sample_process_id UUID;
BEGIN
    -- Get sample data if it exists
    SELECT id INTO sample_org_id FROM organizations LIMIT 1;
    SELECT id INTO sample_account_id FROM accounts LIMIT 1;
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Only create sample data if we found existing records
    IF sample_org_id IS NOT NULL AND sample_account_id IS NOT NULL THEN
        -- Insert a sample active onboarding process
        INSERT INTO onboarding_processes (
            organization_id, account_id, name, status, priority,
            target_completion_date, owner_id, created_by,
            description
        ) VALUES (
            sample_org_id, sample_account_id, 
            'Enterprise Customer Onboarding',
            'active', 'high',
            NOW() + INTERVAL '25 days',
            sample_user_id, sample_user_id,
            'Comprehensive onboarding process for new enterprise customer'
        ) RETURNING id INTO sample_process_id;
        
        -- Insert sample checklist items for the active process
        IF sample_process_id IS NOT NULL THEN
            INSERT INTO onboarding_checklist_items (
                process_id, title, description, category, order_index,
                is_required, assignee_id, due_date, status, completed_at, completed_by
            ) VALUES
            (sample_process_id, 'Initial Discovery Call', 'Conduct comprehensive discovery session with customer stakeholders', 'kickoff', 1, TRUE, sample_user_id, NOW() + INTERVAL '1 day', 'completed', NOW() - INTERVAL '2 days', sample_user_id),
            (sample_process_id, 'Technical Requirements Review', 'Review and document technical requirements and integrations needed', 'technical', 2, TRUE, sample_user_id, NOW() + INTERVAL '3 days', 'completed', NOW() - INTERVAL '1 day', sample_user_id),
            (sample_process_id, 'Account Configuration Setup', 'Configure customer account with initial settings and preferences', 'configuration', 3, TRUE, sample_user_id, NOW() + INTERVAL '5 days', 'in_progress', NULL, NULL),
            (sample_process_id, 'Integration Planning', 'Plan and document required integrations and data connections', 'technical', 4, TRUE, sample_user_id, NOW() + INTERVAL '7 days', 'pending', NULL, NULL),
            (sample_process_id, 'User Training Schedule', 'Schedule and plan user training sessions for customer team', 'training', 5, TRUE, sample_user_id, NOW() + INTERVAL '10 days', 'pending', NULL, NULL);
        END IF;
    END IF;
EXCEPTION
    WHEN others THEN
        -- Ignore errors in sample data creation
        NULL;
END $$;