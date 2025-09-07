-- Simplified Onboarding Dummy Data using existing users
-- Creates realistic onboarding templates and plans

DO $$
DECLARE
    org_id UUID;
    user_id UUID;
    csm_user_id UUID;
    
    -- Template IDs
    starter_template_id UUID;
    standard_template_id UUID;
    enterprise_template_id UUID;
    
    -- Account IDs for different scenarios
    account_1 UUID; -- Just started onboarding
    account_2 UUID; -- Mid-way through onboarding
    account_3 UUID; -- Recently completed
    account_4 UUID; -- Stalled/blocked
    
    -- Plan IDs
    plan_1 UUID;
    plan_2 UUID;
    plan_3 UUID;
    plan_4 UUID;
BEGIN
    -- Get existing organization and users
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT id INTO user_id FROM user_profiles LIMIT 1;
    SELECT id INTO csm_user_id FROM user_profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin user, use the first user for CSM
    IF csm_user_id IS NULL THEN
        csm_user_id := user_id;
    END IF;
    
    -- Create Onboarding Plan Templates
    
    -- 1. Starter Plan Template
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Starter Onboarding Plan',
        'Streamlined onboarding for small businesses and startups',
        'starter', 14, false, user_id
    ) RETURNING id INTO starter_template_id;
    
    -- Starter template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (starter_template_id, 'Welcome Call & Account Setup', 'Initial welcome call to understand business needs and set up account basics', 'kickoff', 1, true, true, 0, 1.0, 'csm', 'Schedule and conduct 30-minute welcome call. Set up basic account settings and permissions.', 'Account is configured and customer has logged in successfully'),
    (starter_template_id, 'Basic Integration Setup', 'Connect primary data sources and configure basic integrations', 'technical', 2, true, false, 2, 2.0, 'technical', 'Help customer connect their CRM or primary data source. Test data flow.', 'At least one integration is working and syncing data'),
    (starter_template_id, 'Platform Training Session', 'Comprehensive training on core platform features', 'training', 3, true, true, 5, 1.5, 'csm', 'Conduct screen-sharing training session covering dashboard, reports, and key features.', 'Customer can navigate platform and generate basic reports independently'),
    (starter_template_id, 'First Report Review', 'Review initial reports and ensure customer understands insights', 'training', 4, true, false, 8, 1.0, 'csm', 'Walk through first reports generated from their data. Explain key metrics and insights.', 'Customer understands their reports and can explain key metrics'),
    (starter_template_id, 'Success Check-in & Go-Live', 'Final check to ensure customer is ready for independent use', 'support', 5, true, true, 12, 0.5, 'csm', 'Confirm customer is comfortable with the platform. Address any remaining questions.', 'Customer confirms they are ready to use platform independently');
    
    -- 2. Standard Plan Template
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Standard Business Onboarding',
        'Comprehensive onboarding for growing businesses with advanced features',
        'standard', 30, true, user_id
    ) RETURNING id INTO standard_template_id;
    
    -- Standard template steps (abbreviated)
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (standard_template_id, 'Discovery Call & Requirements Gathering', 'Deep dive into business processes and requirements', 'kickoff', 1, true, true, 0, 2.0, 'csm', 'Schedule 60-minute discovery call. Document business processes, goals, and technical requirements.', 'Complete requirements document created and approved'),
    (standard_template_id, 'Account Configuration & Team Setup', 'Set up account structure, user roles, and permissions', 'configuration', 2, true, false, 1, 1.5, 'csm', 'Configure account hierarchy, create user accounts, set up roles and permissions based on requirements.', 'All team members have appropriate access levels'),
    (standard_template_id, 'Data Integration Planning', 'Plan and document all required data integrations', 'technical', 3, true, false, 3, 3.0, 'technical', 'Map out all data sources, integration requirements, and data flow. Create integration timeline.', 'Integration plan approved and timeline established'),
    (standard_template_id, 'Primary Integrations Setup', 'Implement core data integrations (CRM, marketing tools)', 'technical', 4, true, true, 7, 4.0, 'technical', 'Set up and test primary integrations. Ensure data is flowing correctly.', 'Primary integrations are live and data is syncing'),
    (standard_template_id, 'Team Training Sessions', 'Conduct role-based training for different user types', 'training', 5, true, true, 14, 4.0, 'csm', 'Deliver training sessions for admins, managers, and end users. Provide training materials.', 'All team members are trained on their respective features'),
    (standard_template_id, 'Go-Live & Success Review', 'Final review and transition to ongoing support', 'support', 6, true, true, 28, 1.0, 'csm', 'Confirm customer is ready for production use. Schedule ongoing check-ins.', 'Customer has successfully gone live and is using platform independently');
    
    -- 3. Enterprise Plan Template
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Enterprise Onboarding Program',
        'Comprehensive enterprise-grade onboarding with dedicated support',
        'enterprise', 60, false, user_id
    ) RETURNING id INTO enterprise_template_id;
    
    -- Enterprise template steps (abbreviated)
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (enterprise_template_id, 'Executive Kickoff & Strategy Session', 'High-level kickoff with executive stakeholders', 'kickoff', 1, true, true, 0, 2.0, 'csm', 'Executive-level kickoff meeting to align on goals, timeline, and success criteria.', 'Executive alignment achieved and project charter signed'),
    (enterprise_template_id, 'Technical Architecture Review', 'Comprehensive review of technical requirements and architecture', 'technical', 2, true, true, 3, 4.0, 'technical', 'Deep technical review with IT team. Design integration architecture.', 'Technical architecture approved and documented'),
    (enterprise_template_id, 'Security & Compliance Assessment', 'Complete security review and compliance requirements', 'administrative', 3, true, true, 7, 3.0, 'technical', 'Security audit, compliance review, and necessary certifications.', 'Security requirements met and compliance verified'),
    (enterprise_template_id, 'Pilot Program Launch', 'Launch pilot with select user group', 'deployment', 4, true, true, 30, 4.0, 'csm', 'Launch pilot program with selected users. Monitor and gather feedback.', 'Pilot is successful and feedback incorporated'),
    (enterprise_template_id, 'Production Deployment', 'Full production rollout to all users', 'deployment', 5, true, true, 50, 6.0, 'technical', 'Deploy to production environment with full monitoring and support.', 'Production deployment successful with all users onboarded');
    
    -- Update template usage counts
    UPDATE onboarding_plan_templates SET usage_count = 15 WHERE id = starter_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 23 WHERE id = standard_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 8 WHERE id = enterprise_template_id;
    
    -- Get some accounts for different scenarios
    SELECT id INTO account_1 FROM accounts LIMIT 1 OFFSET 0;
    SELECT id INTO account_2 FROM accounts LIMIT 1 OFFSET 1;
    SELECT id INTO account_3 FROM accounts LIMIT 1 OFFSET 2;
    SELECT id INTO account_4 FROM accounts LIMIT 1 OFFSET 3;
    
    -- Account 1: Just started onboarding (Standard plan)
    UPDATE accounts 
    SET onboarding_status = 'in_progress', 
        onboarding_started_at = NOW() - INTERVAL '3 days',
        csm_id = csm_user_id
    WHERE id = account_1;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage
    ) VALUES (
        gen_random_uuid(), org_id, account_1, standard_template_id,
        'Standard Business Onboarding', 'in_progress', 'high',
        NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days',
        csm_user_id, user_id, 6, 1, 17
    ) RETURNING id INTO plan_1;
    
    UPDATE accounts SET onboarding_plan_id = plan_1 WHERE id = account_1;
    
    -- Create steps for Plan 1 (first step completed, second in progress)
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_1, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone,
        CASE 
            WHEN ts.step_order = 1 THEN 'completed'
            WHEN ts.step_order = 2 THEN 'in_progress'
            ELSE 'pending'
        END as status,
        csm_user_id,
        (NOW() + ts.due_days_offset * INTERVAL '1 day'),
        ts.estimated_hours,
        CASE WHEN ts.step_order = 1 THEN (NOW() - INTERVAL '2 days') ELSE NULL END,
        CASE WHEN ts.step_order = 1 THEN csm_user_id ELSE NULL END,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = standard_template_id;
    
    -- Account 2: Recently completed onboarding (Starter plan)
    UPDATE accounts 
    SET onboarding_status = 'completed', 
        onboarding_started_at = NOW() - INTERVAL '16 days',
        onboarding_completed_at = NOW() - INTERVAL '2 days',
        csm_id = csm_user_id
    WHERE id = account_2;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, actual_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage
    ) VALUES (
        gen_random_uuid(), org_id, account_2, starter_template_id,
        'Starter Onboarding Plan', 'completed', 'medium',
        NOW() - INTERVAL '16 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
        csm_user_id, user_id, 5, 5, 100
    ) RETURNING id INTO plan_2;
    
    UPDATE accounts SET onboarding_plan_id = plan_2 WHERE id = account_2;
    
    -- Create completed steps for Plan 2
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_2, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone, 'completed',
        csm_user_id, (NOW() - (16 - ts.due_days_offset) * INTERVAL '1 day'),
        ts.estimated_hours,
        (NOW() - (16 - ts.due_days_offset) * INTERVAL '1 day'),
        csm_user_id,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = starter_template_id;
    
    -- Account 3: Enterprise onboarding in progress
    UPDATE accounts 
    SET onboarding_status = 'in_progress', 
        onboarding_started_at = NOW() - INTERVAL '20 days',
        csm_id = csm_user_id
    WHERE id = account_3;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage
    ) VALUES (
        gen_random_uuid(), org_id, account_3, enterprise_template_id,
        'Enterprise Onboarding Program', 'in_progress', 'urgent',
        NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days',
        csm_user_id, user_id, 5, 3, 60
    ) RETURNING id INTO plan_3;
    
    UPDATE accounts SET onboarding_plan_id = plan_3 WHERE id = account_3;
    
    -- Create steps for Plan 3 (first 3 completed, 4th in progress)
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_3, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone,
        CASE 
            WHEN ts.step_order <= 3 THEN 'completed'
            WHEN ts.step_order = 4 THEN 'in_progress'
            ELSE 'pending'
        END as status,
        csm_user_id,
        (NOW() + ts.due_days_offset * INTERVAL '1 day'),
        ts.estimated_hours,
        CASE WHEN ts.step_order <= 3 THEN (NOW() - (20 - ts.due_days_offset) * INTERVAL '1 day') ELSE NULL END,
        CASE WHEN ts.step_order <= 3 THEN csm_user_id ELSE NULL END,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = enterprise_template_id;
    
    -- Account 4: Not started onboarding yet
    UPDATE accounts 
    SET onboarding_status = 'not_started',
        csm_id = csm_user_id
    WHERE id = account_4;
    
    -- Create some activity log entries
    INSERT INTO onboarding_activities (
        plan_id, activity_type, performed_by, title, description, 
        performed_at, is_customer_facing, comment_text
    ) VALUES
    (plan_1, 'plan_started', csm_user_id, 'Onboarding Plan Started', 'Standard onboarding plan initiated', NOW() - INTERVAL '3 days', true, 'Welcome! Excited to get you up and running with FastenR.'),
    (plan_1, 'step_completed', csm_user_id, 'Discovery Call Completed', 'Requirements gathering session completed successfully', NOW() - INTERVAL '2 days', true, 'Great discovery session! Clear requirements documented.'),
    (plan_2, 'plan_completed', csm_user_id, 'Onboarding Successfully Completed', 'Starter onboarding completed ahead of schedule', NOW() - INTERVAL '2 days', true, 'Congratulations! Onboarding completed successfully.'),
    (plan_3, 'milestone_reached', csm_user_id, 'Security Assessment Complete', 'Security and compliance review passed', NOW() - INTERVAL '5 days', true, 'Security assessment completed successfully. All compliance requirements met.');
    
END $$;