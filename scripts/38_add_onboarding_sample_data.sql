-- Add sample onboarding data for testing
DO $$
DECLARE
    sample_org_id UUID;
    sample_account_id UUID;
    sample_user_id UUID;
    sample_process_id UUID;
BEGIN
    -- Get sample data from existing records
    SELECT id INTO sample_org_id FROM organizations LIMIT 1;
    SELECT id INTO sample_account_id FROM accounts LIMIT 1;
    SELECT id INTO sample_user_id FROM user_profiles LIMIT 1;
    
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
        
        -- Insert a second process for variety
        INSERT INTO onboarding_processes (
            organization_id, account_id, name, status, priority,
            target_completion_date, owner_id, created_by,
            description
        ) VALUES (
            sample_org_id, sample_account_id, 
            'Standard Account Setup',
            'completed', 'medium',
            NOW() - INTERVAL '5 days',
            sample_user_id, sample_user_id,
            'Basic onboarding for standard tier customer'
        );
    END IF;
END $$;