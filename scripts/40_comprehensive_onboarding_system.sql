-- Comprehensive Onboarding System
-- This creates a realistic onboarding workflow system

-- First, add onboarding status to accounts table
DO $$
BEGIN
    -- Add onboarding_status column to accounts if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'onboarding_status'
    ) THEN
        ALTER TABLE accounts 
        ADD COLUMN onboarding_status TEXT DEFAULT 'not_started' 
        CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled'));
    END IF;
    
    -- Add onboarding plan assignment
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'onboarding_plan_id'
    ) THEN
        ALTER TABLE accounts ADD COLUMN onboarding_plan_id UUID;
    END IF;
    
    -- Add onboarding dates
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'onboarding_started_at'
    ) THEN
        ALTER TABLE accounts ADD COLUMN onboarding_started_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'onboarding_completed_at'
    ) THEN
        ALTER TABLE accounts ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
    END IF;
    
    -- Add customer success manager assignment
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'csm_id'
    ) THEN
        ALTER TABLE accounts ADD COLUMN csm_id UUID;
    END IF;
END $$;

-- Drop existing onboarding tables to rebuild with better structure
DROP TABLE IF EXISTS onboarding_checklist_items CASCADE;
DROP TABLE IF EXISTS onboarding_processes CASCADE;

-- Onboarding Plan Templates (reusable workflows)
CREATE TABLE onboarding_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    plan_type TEXT NOT NULL DEFAULT 'standard' CHECK (plan_type IN ('starter', 'standard', 'enterprise', 'custom')),
    
    -- Template settings
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    estimated_duration_days INTEGER DEFAULT 30,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0
);

-- Onboarding Plan Template Steps (the actual checklist items)
CREATE TABLE onboarding_template_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES onboarding_plan_templates(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    step_category TEXT DEFAULT 'general' CHECK (step_category IN ('kickoff', 'technical', 'training', 'configuration', 'testing', 'deployment', 'support', 'administrative')),
    
    -- Step ordering and requirements
    step_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    is_milestone BOOLEAN DEFAULT FALSE, -- Important checkpoints
    
    -- Timing
    due_days_offset INTEGER DEFAULT 0, -- Days from onboarding start
    estimated_hours DECIMAL(5,2),
    
    -- Assignment defaults
    default_assignee_role TEXT DEFAULT 'csm' CHECK (default_assignee_role IN ('csm', 'technical', 'admin', 'customer', 'auto_assign')),
    default_assignee_id UUID REFERENCES user_profiles(id),
    
    -- Step details
    instructions TEXT,
    success_criteria TEXT,
    external_resources TEXT[], -- URLs, documents, etc.
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active Onboarding Plans (instances of templates for specific accounts)
CREATE TABLE onboarding_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    template_id UUID REFERENCES onboarding_plan_templates(id),
    
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Dates and timeline
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    target_completion_date TIMESTAMPTZ,
    actual_completion_date TIMESTAMPTZ,
    
    -- Ownership and assignment
    csm_id UUID REFERENCES user_profiles(id), -- Customer Success Manager
    created_by UUID REFERENCES user_profiles(id),
    
    -- Progress tracking
    total_steps INTEGER DEFAULT 0,
    completed_steps INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Plan customization
    custom_notes TEXT,
    is_custom_plan BOOLEAN DEFAULT FALSE,
    
    UNIQUE(account_id) -- One active onboarding plan per account
);

-- Active Onboarding Steps (instances of template steps for specific plans)
CREATE TABLE onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES onboarding_plans(id) ON DELETE CASCADE,
    template_step_id UUID REFERENCES onboarding_template_steps(id),
    
    title TEXT NOT NULL,
    description TEXT,
    step_category TEXT NOT NULL,
    
    -- Step details
    step_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    is_milestone BOOLEAN DEFAULT FALSE,
    
    -- Status and progress
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')),
    
    -- Timing
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    
    -- Assignment and completion
    assignee_id UUID REFERENCES user_profiles(id),
    completed_by UUID REFERENCES user_profiles(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Step content
    instructions TEXT,
    success_criteria TEXT,
    completion_notes TEXT,
    external_resources TEXT[],
    
    -- Dependencies
    depends_on_step_id UUID REFERENCES onboarding_steps(id),
    blocks_step_ids UUID[] -- Steps that can't start until this is complete
);

-- Onboarding Activities and Comments
CREATE TABLE onboarding_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES onboarding_plans(id) ON DELETE CASCADE,
    step_id UUID REFERENCES onboarding_steps(id) ON DELETE CASCADE,
    
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'plan_created', 'plan_started', 'plan_completed', 'plan_paused', 'plan_cancelled',
        'step_assigned', 'step_started', 'step_completed', 'step_blocked', 'step_skipped',
        'comment_added', 'due_date_changed', 'assignee_changed', 'milestone_reached',
        'customer_contacted', 'meeting_scheduled', 'document_shared', 'training_completed'
    )),
    
    performed_by UUID REFERENCES user_profiles(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    title TEXT NOT NULL,
    description TEXT,
    comment_text TEXT,
    
    -- Additional metadata
    metadata JSONB,
    is_customer_facing BOOLEAN DEFAULT FALSE, -- Should customer see this activity
    
    -- Attachments
    attachment_urls TEXT[]
);

-- Indexes for performance
CREATE INDEX idx_accounts_onboarding_status ON accounts(onboarding_status) WHERE onboarding_status IS NOT NULL;
CREATE INDEX idx_onboarding_plans_account ON onboarding_plans(account_id);
CREATE INDEX idx_onboarding_plans_status ON onboarding_plans(status);
CREATE INDEX idx_onboarding_plans_csm ON onboarding_plans(csm_id);
CREATE INDEX idx_onboarding_steps_plan ON onboarding_steps(plan_id);
CREATE INDEX idx_onboarding_steps_assignee ON onboarding_steps(assignee_id);
CREATE INDEX idx_onboarding_steps_status ON onboarding_steps(status);
CREATE INDEX idx_onboarding_steps_due_date ON onboarding_steps(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_onboarding_activities_plan ON onboarding_activities(plan_id);
CREATE INDEX idx_onboarding_activities_performed_at ON onboarding_activities(performed_at);
CREATE INDEX idx_template_steps_template ON onboarding_template_steps(template_id, step_order);

-- Functions to automatically update progress
CREATE OR REPLACE FUNCTION update_onboarding_plan_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE onboarding_plans
    SET 
        total_steps = (
            SELECT COUNT(*) FROM onboarding_steps WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id)
        ),
        completed_steps = (
            SELECT COUNT(*) FROM onboarding_steps 
            WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id) AND status = 'completed'
        ),
        completion_percentage = (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100)
            END
            FROM onboarding_steps 
            WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.plan_id, OLD.plan_id);
    
    -- Update account onboarding status
    UPDATE accounts
    SET 
        onboarding_status = (
            SELECT CASE 
                WHEN p.completion_percentage = 100 THEN 'completed'
                WHEN p.completion_percentage > 0 THEN 'in_progress'
                ELSE 'not_started'
            END
            FROM onboarding_plans p 
            WHERE p.account_id = accounts.id
        ),
        onboarding_completed_at = (
            CASE WHEN (
                SELECT completion_percentage FROM onboarding_plans 
                WHERE account_id = accounts.id
            ) = 100 THEN NOW() ELSE NULL END
        )
    WHERE id IN (
        SELECT account_id FROM onboarding_plans 
        WHERE id = COALESCE(NEW.plan_id, OLD.plan_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update progress when steps change
CREATE TRIGGER update_onboarding_plan_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON onboarding_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_plan_progress();

-- Function to log activities automatically
CREATE OR REPLACE FUNCTION log_onboarding_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log step completion
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO onboarding_activities (
            plan_id, step_id, activity_type, performed_by, title, description
        ) VALUES (
            NEW.plan_id, NEW.id, 'step_completed', NEW.completed_by,
            'Step completed: ' || NEW.title,
            'Step "' || NEW.title || '" was marked as completed'
        );
    END IF;
    
    -- Log step start
    IF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
        INSERT INTO onboarding_activities (
            plan_id, step_id, activity_type, performed_by, title, description
        ) VALUES (
            NEW.plan_id, NEW.id, 'step_started', NEW.assignee_id,
            'Step started: ' || NEW.title,
            'Step "' || NEW.title || '" was started'
        );
    END IF;
    
    -- Log milestone reached
    IF NEW.status = 'completed' AND NEW.is_milestone THEN
        INSERT INTO onboarding_activities (
            plan_id, step_id, activity_type, performed_by, title, description, is_customer_facing
        ) VALUES (
            NEW.plan_id, NEW.id, 'milestone_reached', NEW.completed_by,
            'Milestone reached: ' || NEW.title,
            'Important milestone "' || NEW.title || '" has been completed',
            true
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically log activities
CREATE TRIGGER log_onboarding_activity_trigger
    AFTER UPDATE ON onboarding_steps
    FOR EACH ROW
    EXECUTE FUNCTION log_onboarding_activity();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_plan_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_template_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON onboarding_activities TO authenticated;

-- Row Level Security
ALTER TABLE onboarding_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access templates in their organization" ON onboarding_plan_templates
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can access template steps in their organization" ON onboarding_template_steps
    FOR ALL USING (
        template_id IN (
            SELECT id FROM onboarding_plan_templates 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access plans in their organization" ON onboarding_plans
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can access steps in their organization" ON onboarding_steps
    FOR ALL USING (
        plan_id IN (
            SELECT id FROM onboarding_plans 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access activities in their organization" ON onboarding_activities
    FOR ALL USING (
        plan_id IN (
            SELECT id FROM onboarding_plans 
            WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );