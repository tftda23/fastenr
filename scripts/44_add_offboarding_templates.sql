-- Add offboarding templates to the onboarding plan templates system

DO $$
DECLARE
    org_id uuid;
    template_1 uuid;
    template_2 uuid;
    template_3 uuid;
BEGIN
    -- Get the first organization for demo purposes
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE EXCEPTION 'No organizations found. Please create an organization first.';
    END IF;
    
    -- Insert Standard Offboarding Template
    INSERT INTO onboarding_plan_templates (
        organization_id, 
        name, 
        description, 
        plan_type, 
        estimated_duration_days,
        is_active,
        is_default,
        usage_count
    ) VALUES (
        org_id,
        'Standard Customer Offboarding',
        'Standard offboarding process for departing customers including data export, knowledge transfer, and feedback collection.',
        'standard',
        14,
        true,
        false,
        0
    ) RETURNING id INTO template_1;
    
    -- Add steps for Standard Offboarding
    INSERT INTO onboarding_template_steps (
        template_id,
        title,
        description,
        step_category,
        step_order,
        is_required,
        is_milestone,
        due_days_offset,
        estimated_hours,
        default_assignee_role,
        instructions
    ) VALUES
    (template_1, 'Schedule Exit Interview', 'Schedule and conduct exit interview to gather feedback', 'communication', 1, true, true, 1, 2, 'csm', 'Reach out to key stakeholders to schedule exit interview'),
    (template_1, 'Data Export Preparation', 'Prepare customer data for export and handover', 'technical', 2, true, false, 2, 4, 'csm', 'Coordinate with technical team to prepare data exports'),
    (template_1, 'Knowledge Transfer Session', 'Conduct knowledge transfer with customer team', 'training', 3, true, true, 5, 3, 'csm', 'Schedule session to transfer institutional knowledge'),
    (template_1, 'Account Cleanup', 'Clean up account settings and disable access', 'technical', 4, true, false, 7, 2, 'csm', 'Work with IT to disable accounts and clean up permissions'),
    (template_1, 'Final Documentation', 'Complete final documentation and handover notes', 'documentation', 5, true, false, 10, 2, 'csm', 'Document all processes and create handover notes'),
    (template_1, 'Relationship Maintenance', 'Maintain positive relationship for potential future engagement', 'communication', 6, false, true, 14, 1, 'csm', 'Send final thank you and keep door open for future');
    
    -- Insert Enterprise Offboarding Template  
    INSERT INTO onboarding_plan_templates (
        organization_id, 
        name, 
        description, 
        plan_type, 
        estimated_duration_days,
        is_active,
        is_default,
        usage_count
    ) VALUES (
        org_id,
        'Enterprise Customer Offboarding',
        'Comprehensive offboarding process for large enterprise customers including detailed data migration, extensive knowledge transfer, and contract resolution.',
        'enterprise',
        30,
        true,
        false,
        0
    ) RETURNING id INTO template_2;
    
    -- Add steps for Enterprise Offboarding
    INSERT INTO onboarding_template_steps (
        template_id,
        title,
        description,
        step_category,
        step_order,
        is_required,
        is_milestone,
        due_days_offset,
        estimated_hours,
        default_assignee_role,
        instructions
    ) VALUES
    (template_2, 'Executive Exit Meeting', 'High-level exit meeting with executive stakeholders', 'communication', 1, true, true, 2, 3, 'csm', 'Schedule with C-level executives to discuss transition'),
    (template_2, 'Contract Review & Resolution', 'Review contracts and resolve any outstanding obligations', 'legal', 2, true, true, 3, 6, 'csm', 'Work with legal team to review contract terms and obligations'),
    (template_2, 'Data Migration Planning', 'Create comprehensive plan for data migration and export', 'technical', 3, true, true, 5, 8, 'csm', 'Coordinate with engineering team for large-scale data export'),
    (template_2, 'Security Audit & Cleanup', 'Comprehensive security review and cleanup', 'security', 4, true, false, 7, 4, 'csm', 'Work with security team to audit and cleanup access'),
    (template_2, 'Integration Disconnection', 'Plan and execute disconnection of integrations', 'technical', 5, true, false, 10, 6, 'csm', 'Coordinate disconnection of all API integrations'),
    (template_2, 'Knowledge Transfer Workshop', 'Multi-session knowledge transfer workshop', 'training', 6, true, true, 15, 8, 'csm', 'Plan comprehensive knowledge transfer sessions'),
    (template_2, 'Transition Support', 'Provide ongoing support during transition period', 'support', 7, true, false, 20, 10, 'csm', 'Provide extended support during customer transition'),
    (template_2, 'Final Audit & Sign-off', 'Complete final audit and get customer sign-off', 'documentation', 8, true, true, 28, 4, 'csm', 'Complete comprehensive audit and obtain final approval'),
    (template_2, 'Relationship Archive', 'Archive relationship with detailed notes for future reference', 'documentation', 9, false, false, 30, 2, 'csm', 'Create detailed archive of relationship and lessons learned');
    
    -- Insert Quick Offboarding Template
    INSERT INTO onboarding_plan_templates (
        organization_id, 
        name, 
        description, 
        plan_type, 
        estimated_duration_days,
        is_active,
        is_default,
        usage_count
    ) VALUES (
        org_id,
        'Quick Customer Offboarding',
        'Streamlined offboarding process for smaller customers or urgent departures.',
        'starter',
        7,
        true,
        false,
        0
    ) RETURNING id INTO template_3;
    
    -- Add steps for Quick Offboarding
    INSERT INTO onboarding_template_steps (
        template_id,
        title,
        description,
        step_category,
        step_order,
        is_required,
        is_milestone,
        due_days_offset,
        estimated_hours,
        default_assignee_role,
        instructions
    ) VALUES
    (template_3, 'Quick Exit Call', 'Brief exit call to understand departure reasons', 'communication', 1, true, true, 1, 1, 'csm', 'Schedule quick call to gather feedback'),
    (template_3, 'Data Package Preparation', 'Prepare basic data package for customer', 'technical', 2, true, false, 2, 2, 'csm', 'Prepare standard data export package'),
    (template_3, 'Account Deactivation', 'Deactivate customer accounts and access', 'technical', 3, true, false, 3, 1, 'csm', 'Disable accounts and revoke access permissions'),
    (template_3, 'Quick Documentation', 'Complete basic documentation', 'documentation', 4, true, false, 5, 1, 'csm', 'Document key details and reasons for departure'),
    (template_3, 'Final Follow-up', 'Send final follow-up message', 'communication', 5, false, true, 7, 0.5, 'csm', 'Send thank you message and leave door open');
    
    RAISE NOTICE 'Successfully created 3 offboarding templates with % total steps', 
        (SELECT COUNT(*) FROM onboarding_template_steps WHERE template_id IN (template_1, template_2, template_3));
    
END $$;