-- Comprehensive Onboarding Dummy Data
-- Creates realistic onboarding templates, plans, and activities

DO $$
DECLARE
    org_id UUID;
    user_id UUID;
    csm_user_id UUID;
    tech_user_id UUID;
    
    -- Template IDs
    starter_template_id UUID;
    standard_template_id UUID;
    enterprise_template_id UUID;
    
    -- Account IDs for different scenarios
    account_1 UUID; -- Just started onboarding
    account_2 UUID; -- Mid-way through onboarding
    account_3 UUID; -- Recently completed
    account_4 UUID; -- Stalled/blocked
    account_5 UUID; -- Not started yet
    
    -- Plan IDs
    plan_1 UUID;
    plan_2 UUID;
    plan_3 UUID;
    plan_4 UUID;
BEGIN
    -- Get existing organization and users
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT id INTO user_id FROM user_profiles LIMIT 1;
    
    -- Create additional users for realistic assignments
    INSERT INTO user_profiles (id, organization_id, full_name, email, role) 
    VALUES 
        (gen_random_uuid(), org_id, 'Sarah Johnson', 'sarah.johnson@company.com', 'admin'),
        (gen_random_uuid(), org_id, 'Mike Chen', 'mike.chen@company.com', 'read_write')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO csm_user_id FROM user_profiles WHERE full_name = 'Sarah Johnson';
    SELECT id INTO tech_user_id FROM user_profiles WHERE full_name = 'Mike Chen';
    
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
    
    -- Standard template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (standard_template_id, 'Discovery Call & Requirements Gathering', 'Deep dive into business processes and requirements', 'kickoff', 1, true, true, 0, 2.0, 'csm', 'Schedule 60-minute discovery call. Document business processes, goals, and technical requirements.', 'Complete requirements document created and approved'),
    (standard_template_id, 'Account Configuration & Team Setup', 'Set up account structure, user roles, and permissions', 'configuration', 2, true, false, 1, 1.5, 'csm', 'Configure account hierarchy, create user accounts, set up roles and permissions based on requirements.', 'All team members have appropriate access levels'),
    (standard_template_id, 'Data Integration Planning', 'Plan and document all required data integrations', 'technical', 3, true, false, 3, 3.0, 'technical', 'Map out all data sources, integration requirements, and data flow. Create integration timeline.', 'Integration plan approved and timeline established'),
    (standard_template_id, 'Primary Integrations Setup', 'Implement core data integrations (CRM, marketing tools)', 'technical', 4, true, true, 7, 4.0, 'technical', 'Set up and test primary integrations. Ensure data is flowing correctly.', 'Primary integrations are live and data is syncing'),
    (standard_template_id, 'Custom Dashboard Configuration', 'Build custom dashboards based on business requirements', 'configuration', 5, true, false, 10, 2.0, 'csm', 'Create custom dashboards and reports tailored to customer requirements.', 'Custom dashboards are configured and displaying relevant data'),
    (standard_template_id, 'Team Training Sessions', 'Conduct role-based training for different user types', 'training', 6, true, true, 14, 4.0, 'csm', 'Deliver training sessions for admins, managers, and end users. Provide training materials.', 'All team members are trained on their respective features'),
    (standard_template_id, 'Advanced Features Setup', 'Configure automation, alerts, and advanced features', 'configuration', 7, true, false, 18, 2.5, 'technical', 'Set up automated workflows, custom alerts, and advanced platform features.', 'Advanced features are configured according to requirements'),
    (standard_template_id, 'User Acceptance Testing', 'Customer tests all functionality with their real data', 'testing', 8, true, false, 21, 3.0, 'customer', 'Customer team performs comprehensive testing of all features with their data.', 'Customer confirms all features work as expected'),
    (standard_template_id, 'Performance Optimization', 'Optimize settings and performance based on usage patterns', 'technical', 9, false, false, 24, 1.5, 'technical', 'Review performance metrics and optimize settings for better performance.', 'Platform performance is optimized for customer workload'),
    (standard_template_id, 'Go-Live & Success Review', 'Final review and transition to ongoing support', 'support', 10, true, true, 28, 1.0, 'csm', 'Confirm customer is ready for production use. Schedule ongoing check-ins.', 'Customer has successfully gone live and is using platform independently');
    
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
    
    -- Enterprise template steps (abbreviated for space)
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (enterprise_template_id, 'Executive Kickoff & Strategy Session', 'High-level kickoff with executive stakeholders', 'kickoff', 1, true, true, 0, 2.0, 'csm', 'Executive-level kickoff meeting to align on goals, timeline, and success criteria.', 'Executive alignment achieved and project charter signed'),
    (enterprise_template_id, 'Technical Architecture Review', 'Comprehensive review of technical requirements and architecture', 'technical', 2, true, true, 3, 4.0, 'technical', 'Deep technical review with IT team. Design integration architecture.', 'Technical architecture approved and documented'),
    (enterprise_template_id, 'Security & Compliance Assessment', 'Complete security review and compliance requirements', 'administrative', 3, true, true, 7, 3.0, 'technical', 'Security audit, compliance review, and necessary certifications.', 'Security requirements met and compliance verified'),
    (enterprise_template_id, 'Multi-System Integration Phase 1', 'Implement critical system integrations', 'technical', 4, true, false, 14, 8.0, 'technical', 'Implement integrations with core business systems (ERP, CRM, etc.).', 'Phase 1 integrations are live and tested'),
    (enterprise_template_id, 'Custom Development & API Setup', 'Develop custom features and API integrations', 'technical', 5, false, false, 21, 12.0, 'technical', 'Build custom features and API endpoints as per requirements.', 'Custom development completed and tested'),
    (enterprise_template_id, 'Pilot Program Launch', 'Launch pilot with select user group', 'deployment', 6, true, true, 30, 4.0, 'csm', 'Launch pilot program with selected users. Monitor and gather feedback.', 'Pilot is successful and feedback incorporated'),
    (enterprise_template_id, 'Enterprise Training Program', 'Comprehensive training for all user types', 'training', 7, true, true, 40, 8.0, 'csm', 'Deliver enterprise training program including train-the-trainer sessions.', 'All users trained and internal training capability established'),
    (enterprise_template_id, 'Production Deployment', 'Full production rollout to all users', 'deployment', 8, true, true, 50, 6.0, 'technical', 'Deploy to production environment with full monitoring and support.', 'Production deployment successful with all users onboarded'),
    (enterprise_template_id, 'Success Metrics Review', 'Review success metrics and optimize', 'support', 9, true, true, 55, 2.0, 'csm', 'Review success metrics, gather feedback, and plan ongoing optimization.', 'Success metrics achieved and optimization plan in place');
    
    -- Update template usage counts
    UPDATE onboarding_plan_templates SET usage_count = 15 WHERE id = starter_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 23 WHERE id = standard_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 8 WHERE id = enterprise_template_id;
    
    -- Create test accounts with different onboarding scenarios
    
    -- Account 1: Just started onboarding (Standard plan)
    SELECT id INTO account_1 FROM accounts LIMIT 1 OFFSET 0;
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
        'Acme Corp Standard Onboarding', 'in_progress', 'high',
        NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days',
        csm_user_id, user_id, 10, 2, 20
    ) RETURNING id INTO plan_1;
    
    UPDATE accounts SET onboarding_plan_id = plan_1 WHERE id = account_1;
    
    -- Create steps for Plan 1 (first 3 completed, 4th in progress)
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_1, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone,
        CASE 
            WHEN ts.step_order <= 2 THEN 'completed'
            WHEN ts.step_order = 3 THEN 'in_progress'
            ELSE 'pending'
        END as status,
        CASE ts.default_assignee_role 
            WHEN 'csm' THEN csm_user_id 
            WHEN 'technical' THEN tech_user_id 
            ELSE user_id 
        END as assignee_id,
        (NOW() + ts.due_days_offset * INTERVAL '1 day'),
        ts.estimated_hours,
        CASE WHEN ts.step_order <= 2 THEN (NOW() - (3 - ts.step_order) * INTERVAL '1 day') ELSE NULL END,
        CASE WHEN ts.step_order <= 2 THEN csm_user_id ELSE NULL END,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = standard_template_id;
    
    -- Account 2: Mid-way through onboarding (Enterprise plan)
    SELECT id INTO account_2 FROM accounts LIMIT 1 OFFSET 1;
    UPDATE accounts 
    SET onboarding_status = 'in_progress', 
        onboarding_started_at = NOW() - INTERVAL '25 days',
        csm_id = csm_user_id
    WHERE id = account_2;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage
    ) VALUES (
        gen_random_uuid(), org_id, account_2, enterprise_template_id,
        'TechCorp Enterprise Onboarding', 'in_progress', 'urgent',
        NOW() - INTERVAL '25 days', NOW() + INTERVAL '35 days',
        csm_user_id, user_id, 9, 5, 56
    ) RETURNING id INTO plan_2;
    
    UPDATE accounts SET onboarding_plan_id = plan_2 WHERE id = account_2;
    
    -- Create steps for Plan 2 (first 5 completed, 6th in progress)
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_2, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone,
        CASE 
            WHEN ts.step_order <= 5 THEN 'completed'
            WHEN ts.step_order = 6 THEN 'in_progress'
            ELSE 'pending'
        END as status,
        CASE ts.default_assignee_role 
            WHEN 'csm' THEN csm_user_id 
            WHEN 'technical' THEN tech_user_id 
            ELSE user_id 
        END as assignee_id,
        (NOW() + ts.due_days_offset * INTERVAL '1 day'),
        ts.estimated_hours,
        CASE WHEN ts.step_order <= 5 THEN (NOW() - (30 - ts.due_days_offset) * INTERVAL '1 day') ELSE NULL END,
        CASE WHEN ts.step_order <= 5 THEN 
            CASE ts.default_assignee_role 
                WHEN 'csm' THEN csm_user_id 
                WHEN 'technical' THEN tech_user_id 
                ELSE user_id 
            END
        ELSE NULL END,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = enterprise_template_id;
    
    -- Account 3: Recently completed onboarding (Starter plan)
    SELECT id INTO account_3 FROM accounts LIMIT 1 OFFSET 2;
    UPDATE accounts 
    SET onboarding_status = 'completed', 
        onboarding_started_at = NOW() - INTERVAL '16 days',
        onboarding_completed_at = NOW() - INTERVAL '2 days',
        csm_id = csm_user_id
    WHERE id = account_3;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, actual_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage
    ) VALUES (
        gen_random_uuid(), org_id, account_3, starter_template_id,
        'StartupXYZ Starter Onboarding', 'completed', 'medium',
        NOW() - INTERVAL '16 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
        csm_user_id, user_id, 5, 5, 100
    ) RETURNING id INTO plan_3;
    
    UPDATE accounts SET onboarding_plan_id = plan_3 WHERE id = account_3;
    
    -- Create completed steps for Plan 3
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_3, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone, 'completed',
        csm_user_id, (NOW() - (16 - ts.due_days_offset) * INTERVAL '1 day'),
        ts.estimated_hours,
        (NOW() - (16 - ts.due_days_offset) * INTERVAL '1 day'),
        csm_user_id,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = starter_template_id;
    
    -- Account 4: Stalled onboarding (Standard plan)
    SELECT id INTO account_4 FROM accounts LIMIT 1 OFFSET 3;
    UPDATE accounts 
    SET onboarding_status = 'on_hold', 
        onboarding_started_at = NOW() - INTERVAL '45 days',
        csm_id = csm_user_id
    WHERE id = account_4;
    
    INSERT INTO onboarding_plans (
        id, organization_id, account_id, template_id, plan_name, status, priority,
        started_at, target_completion_date, csm_id, created_by,
        total_steps, completed_steps, completion_percentage, custom_notes
    ) VALUES (
        gen_random_uuid(), org_id, account_4, standard_template_id,
        'BigClient Standard Onboarding', 'on_hold', 'high',
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days',
        csm_user_id, user_id, 10, 4, 40,
        'On hold due to customer IT security review. Waiting for approval to proceed with integrations.'
    ) RETURNING id INTO plan_4;
    
    UPDATE accounts SET onboarding_plan_id = plan_4 WHERE id = account_4;
    
    -- Create steps for Plan 4 (first 4 completed, rest blocked)
    INSERT INTO onboarding_steps (
        plan_id, template_step_id, title, description, step_category, step_order,
        is_required, is_milestone, status, assignee_id, due_date, estimated_hours,
        completed_at, completed_by, instructions, success_criteria
    )
    SELECT 
        plan_4, ts.id, ts.title, ts.description, ts.step_category, ts.step_order,
        ts.is_required, ts.is_milestone,
        CASE 
            WHEN ts.step_order <= 4 THEN 'completed'
            WHEN ts.step_order = 5 THEN 'blocked'
            ELSE 'pending'
        END as status,
        CASE ts.default_assignee_role 
            WHEN 'csm' THEN csm_user_id 
            WHEN 'technical' THEN tech_user_id 
            ELSE user_id 
        END as assignee_id,
        (NOW() - (45 - ts.due_days_offset) * INTERVAL '1 day'),
        ts.estimated_hours,
        CASE WHEN ts.step_order <= 4 THEN (NOW() - (45 - ts.due_days_offset) * INTERVAL '1 day') ELSE NULL END,
        CASE WHEN ts.step_order <= 4 THEN tech_user_id ELSE NULL END,
        ts.instructions,
        ts.success_criteria
    FROM onboarding_template_steps ts 
    WHERE ts.template_id = standard_template_id;
    
    -- Account 5: Not started onboarding yet
    SELECT id INTO account_5 FROM accounts LIMIT 1 OFFSET 4;
    UPDATE accounts 
    SET onboarding_status = 'not_started',
        csm_id = csm_user_id
    WHERE id = account_5;
    
    -- Create realistic activity log entries
    
    -- Activities for Plan 1 (recent activities)
    INSERT INTO onboarding_activities (
        plan_id, step_id, activity_type, performed_by, title, description, 
        performed_at, is_customer_facing, comment_text
    ) VALUES
    (plan_1, NULL, 'plan_started', csm_user_id, 'Onboarding Plan Started', 'Standard onboarding plan initiated for Acme Corp', NOW() - INTERVAL '3 days', true, 'Welcome to FastenR! Excited to get you up and running.'),
    (plan_1, (SELECT id FROM onboarding_steps WHERE plan_id = plan_1 AND step_order = 1), 'step_completed', csm_user_id, 'Discovery Call Completed', 'Requirements gathering session completed successfully', NOW() - INTERVAL '2 days', true, 'Great discovery session! Clear requirements documented.'),
    (plan_1, (SELECT id FROM onboarding_steps WHERE plan_id = plan_1 AND step_order = 2), 'step_completed', csm_user_id, 'Account Setup Complete', 'Account configuration and team setup completed', NOW() - INTERVAL '1 day', false, 'All user accounts created and permissions configured.'),
    (plan_1, (SELECT id FROM onboarding_steps WHERE plan_id = plan_1 AND step_order = 3), 'step_started', tech_user_id, 'Integration Planning Started', 'Beginning data integration planning phase', NOW() - INTERVAL '4 hours', false, 'Starting integration analysis for CRM and marketing tools.');
    
    -- Activities for Plan 2 (enterprise activities)
    INSERT INTO onboarding_activities (
        plan_id, step_id, activity_type, performed_by, title, description, 
        performed_at, is_customer_facing, comment_text
    ) VALUES
    (plan_2, NULL, 'plan_started', csm_user_id, 'Enterprise Onboarding Initiated', 'Enterprise onboarding program launched for TechCorp', NOW() - INTERVAL '25 days', true, 'Enterprise onboarding program officially launched with executive alignment.'),
    (plan_2, (SELECT id FROM onboarding_steps WHERE plan_id = plan_2 AND step_order = 1), 'milestone_reached', csm_user_id, 'Executive Kickoff Milestone', 'Executive alignment achieved', NOW() - INTERVAL '22 days', true, 'Successful executive kickoff with C-suite alignment on goals and timeline.'),
    (plan_2, (SELECT id FROM onboarding_steps WHERE plan_id = plan_2 AND step_order = 3), 'milestone_reached', tech_user_id, 'Security Assessment Complete', 'Security and compliance review passed', NOW() - INTERVAL '15 days', true, 'Security assessment completed successfully. All compliance requirements met.'),
    (plan_2, (SELECT id FROM onboarding_steps WHERE plan_id = plan_2 AND step_order = 6), 'step_started', csm_user_id, 'Pilot Program Launch', 'Pilot program initiated with select user group', NOW() - INTERVAL '1 day', true, 'Pilot program launched with 25 selected users. Initial feedback very positive.');
    
    -- Activities for Plan 3 (completed)
    INSERT INTO onboarding_activities (
        plan_id, step_id, activity_type, performed_by, title, description, 
        performed_at, is_customer_facing, comment_text
    ) VALUES
    (plan_3, NULL, 'plan_completed', csm_user_id, 'Onboarding Successfully Completed', 'StartupXYZ onboarding completed ahead of schedule', NOW() - INTERVAL '2 days', true, 'Congratulations! Onboarding completed successfully and ahead of schedule.'),
    (plan_3, (SELECT id FROM onboarding_steps WHERE plan_id = plan_3 AND step_order = 5), 'milestone_reached', csm_user_id, 'Go-Live Milestone Achieved', 'Customer successfully went live', NOW() - INTERVAL '2 days', true, 'Go-live successful! Customer is now independently using the platform.');
    
    -- Activities for Plan 4 (stalled)
    INSERT INTO onboarding_activities (
        plan_id, step_id, activity_type, performed_by, title, description, 
        performed_at, is_customer_facing, comment_text
    ) VALUES
    (plan_4, (SELECT id FROM onboarding_steps WHERE plan_id = plan_4 AND step_order = 5), 'step_blocked', csm_user_id, 'Integration Phase Blocked', 'Integration phase on hold pending security review', NOW() - INTERVAL '10 days', false, 'Customer IT security team requires additional documentation before proceeding with integrations.'),
    (plan_4, NULL, 'customer_contacted', csm_user_id, 'Follow-up with Customer IT', 'Reached out to customer IT team for status update', NOW() - INTERVAL '3 days', false, 'Left voicemail for IT director. Sent follow-up email with requested security documentation.');
    
END $$;