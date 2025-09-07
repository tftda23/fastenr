-- Add onboarding/offboarding processes and checklist tables
-- This enables premium onboarding management functionality

-- Main onboarding processes table
CREATE TABLE IF NOT EXISTS onboarding_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
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
    
    -- Ownership and assignment
    created_by UUID REFERENCES users(id),
    owner_id UUID REFERENCES users(id),
    
    -- Process details
    description TEXT,
    success_criteria TEXT,
    notes TEXT,
    
    -- Progress tracking
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    is_template BOOLEAN DEFAULT FALSE,
    template_id UUID REFERENCES onboarding_processes(id),
    
    UNIQUE(organization_id, account_id, process_type)
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
    is_blocking BOOLEAN DEFAULT FALSE, -- If true, blocks progress until complete
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    
    -- Dates and scheduling
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Assignment and tracking
    assignee_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    
    -- Status and notes
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
    completion_notes TEXT,
    
    -- Dependencies
    depends_on_item_id UUID REFERENCES onboarding_checklist_items(id),
    
    -- External references
    external_link TEXT,
    attachment_urls TEXT[],
    
    CONSTRAINT valid_completion CHECK (
        (completed_at IS NULL AND completed_by IS NULL AND status != 'completed') OR
        (completed_at IS NOT NULL AND completed_by IS NOT NULL AND status = 'completed')
    )
);

-- Process templates for reusable onboarding workflows
CREATE TABLE IF NOT EXISTS onboarding_process_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    process_type TEXT NOT NULL DEFAULT 'onboarding' CHECK (process_type IN ('onboarding', 'offboarding')),
    
    -- Template metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Template settings
    is_active BOOLEAN DEFAULT TRUE,
    estimated_duration_days INTEGER,
    default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0
);

-- Template checklist items
CREATE TABLE IF NOT EXISTS onboarding_template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES onboarding_process_templates(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    
    is_required BOOLEAN DEFAULT TRUE,
    is_blocking BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    
    -- Relative scheduling (days from process start)
    due_days_offset INTEGER,
    
    -- Assignment defaults
    default_assignee_role TEXT, -- 'owner', 'admin', 'specific_user'
    default_assignee_id UUID REFERENCES users(id),
    
    external_link TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log for process tracking
CREATE TABLE IF NOT EXISTS onboarding_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID NOT NULL REFERENCES onboarding_processes(id) ON DELETE CASCADE,
    checklist_item_id UUID REFERENCES onboarding_checklist_items(id) ON DELETE CASCADE,
    
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'process_created', 'process_started', 'process_completed', 'process_cancelled',
        'item_assigned', 'item_started', 'item_completed', 'item_blocked',
        'comment_added', 'due_date_changed', 'status_changed'
    )),
    
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    description TEXT NOT NULL,
    metadata JSONB,
    
    -- For comments
    comment_text TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_org_account ON onboarding_processes(organization_id, account_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_status ON onboarding_processes(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_owner ON onboarding_processes(owner_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_processes_target_date ON onboarding_processes(target_completion_date);

CREATE INDEX IF NOT EXISTS idx_checklist_items_process ON onboarding_checklist_items(process_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_assignee ON onboarding_checklist_items(assignee_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_due_date ON onboarding_checklist_items(due_date);
CREATE INDEX IF NOT EXISTS idx_checklist_items_status ON onboarding_checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON onboarding_checklist_items(process_id, order_index);

CREATE INDEX IF NOT EXISTS idx_templates_org ON onboarding_process_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_template_items_template ON onboarding_template_items(template_id, order_index);

CREATE INDEX IF NOT EXISTS idx_activity_log_process ON onboarding_activity_log(process_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_performed_at ON onboarding_activity_log(performed_at);

-- Triggers to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_processes_updated_at
    BEFORE UPDATE ON onboarding_processes
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_checklist_items_updated_at
    BEFORE UPDATE ON onboarding_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_process_templates_updated_at
    BEFORE UPDATE ON onboarding_process_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_template_items_updated_at
    BEFORE UPDATE ON onboarding_template_items
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

-- Function to automatically update process completion percentage
CREATE OR REPLACE FUNCTION update_process_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE onboarding_processes
    SET completion_percentage = (
        SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::DECIMAL / COUNT(*)) * 100)
        END
        FROM onboarding_checklist_items
        WHERE process_id = COALESCE(NEW.process_id, OLD.process_id)
        AND is_required = TRUE
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.process_id, OLD.process_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update completion percentage when checklist items change
CREATE TRIGGER update_process_completion_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON onboarding_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_process_completion_percentage();

-- Insert some sample data for testing
DO $$
DECLARE
    sample_org_id UUID;
    sample_account_id UUID;
    sample_user_id UUID;
    sample_process_id UUID;
    sample_template_id UUID;
BEGIN
    -- Get a sample organization, account, and user for demo data
    SELECT id INTO sample_org_id FROM organizations LIMIT 1;
    SELECT id INTO sample_account_id FROM accounts LIMIT 1;
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    IF sample_org_id IS NOT NULL AND sample_account_id IS NOT NULL THEN
        -- Insert a sample onboarding process template
        INSERT INTO onboarding_process_templates (
            id, organization_id, name, description, process_type, 
            estimated_duration_days, created_by
        ) VALUES (
            gen_random_uuid(), sample_org_id, 
            'Standard Customer Onboarding',
            'Complete onboarding process for new enterprise customers',
            'onboarding', 30, sample_user_id
        ) RETURNING id INTO sample_template_id;
        
        -- Insert template checklist items
        IF sample_template_id IS NOT NULL THEN
            INSERT INTO onboarding_template_items (
                template_id, title, description, category, order_index, 
                is_required, estimated_hours, due_days_offset
            ) VALUES
            (sample_template_id, 'Initial Discovery Call', 'Conduct comprehensive discovery session with customer stakeholders', 'kickoff', 1, TRUE, 2, 1),
            (sample_template_id, 'Technical Requirements Review', 'Review and document technical requirements and integrations needed', 'technical', 2, TRUE, 4, 3),
            (sample_template_id, 'Account Configuration Setup', 'Configure customer account with initial settings and preferences', 'configuration', 3, TRUE, 3, 5),
            (sample_template_id, 'Integration Planning', 'Plan and document required integrations and data connections', 'technical', 4, TRUE, 6, 7),
            (sample_template_id, 'User Training Schedule', 'Schedule and plan user training sessions for customer team', 'training', 5, TRUE, 2, 10),
            (sample_template_id, 'Security Review', 'Complete security assessment and implement required controls', 'compliance', 6, TRUE, 4, 12),
            (sample_template_id, 'Pilot Program Launch', 'Launch limited pilot program with select users', 'deployment', 7, TRUE, 8, 15),
            (sample_template_id, 'User Acceptance Testing', 'Conduct comprehensive UAT with customer team', 'testing', 8, TRUE, 6, 20),
            (sample_template_id, 'Production Deployment', 'Deploy solution to production environment', 'deployment', 9, TRUE, 4, 25),
            (sample_template_id, 'Go-Live Support', 'Provide dedicated support during go-live period', 'support', 10, TRUE, 8, 28);
        END IF;
        
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
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_processes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_checklist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_process_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_template_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_activity_log TO authenticated;

-- Row Level Security policies
ALTER TABLE onboarding_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_activity_log ENABLE ROW LEVEL SECURITY;

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

-- Similar RLS policies for templates and activity log
CREATE POLICY "Users can view templates in their organization" ON onboarding_process_templates
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage templates in their organization" ON onboarding_process_templates
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view template items in their organization" ON onboarding_template_items
    FOR SELECT USING (
        template_id IN (
            SELECT id FROM onboarding_process_templates 
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage template items in their organization" ON onboarding_template_items
    FOR ALL USING (
        template_id IN (
            SELECT id FROM onboarding_process_templates 
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can view activity log in their organization" ON onboarding_activity_log
    FOR SELECT USING (
        process_id IN (
            SELECT id FROM onboarding_processes 
            WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );