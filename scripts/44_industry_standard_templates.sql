-- Add Industry Standard SaaS Onboarding Templates
-- Based on best practices from leading SaaS companies

DO $$
DECLARE
    org_id UUID;
    user_id UUID;
    
    -- Template IDs
    freemium_template_id UUID;
    smb_template_id UUID;
    midmarket_template_id UUID;
    enterprise_template_id UUID;
    hightouch_template_id UUID;
BEGIN
    -- Get existing organization and user
    SELECT id INTO org_id FROM organizations LIMIT 1;
    SELECT id INTO user_id FROM user_profiles LIMIT 1;
    
    -- 1. Freemium to Paid Conversion Template (inspired by Slack, Notion)
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, is_active, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Freemium to Paid Conversion',
        'Self-serve onboarding focused on quick value delivery and conversion to paid plans',
        'starter', 7, false, true, user_id
    ) RETURNING id INTO freemium_template_id;
    
    -- Freemium template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (freemium_template_id, 'Automated Welcome & Product Tour', 'User completes in-app onboarding tour and creates first workspace/project', 'kickoff', 1, true, true, 0, 0.5, 'auto_assign', 'Automated in-app guided tour with key feature highlights. User creates first project.', 'User has created first workspace and completed product tour'),
    (freemium_template_id, 'First Value Achievement', 'User achieves their first meaningful outcome with the product', 'configuration', 2, true, true, 1, 1.0, 'auto_assign', 'Track user engagement to ensure they complete a core workflow (create document, send message, etc.)', 'User has completed at least one core action that delivers value'),
    (freemium_template_id, 'Usage Pattern Analysis', 'Monitor user engagement and identify expansion opportunities', 'administrative', 3, false, false, 3, 0.5, 'csm', 'Review user activity dashboard and identify power users vs. at-risk users.', 'Usage patterns categorized and engagement score calculated'),
    (freemium_template_id, 'Proactive Success Outreach', 'Reach out to active users with tips and upgrade prompts', 'support', 4, false, false, 5, 1.0, 'csm', 'Send personalized success tips and highlight premium features that match usage patterns.', 'Personalized outreach sent to active users'),
    (freemium_template_id, 'Conversion Campaign Trigger', 'Trigger upgrade campaigns for qualified users showing intent signals', 'administrative', 5, false, true, 7, 0.5, 'auto_assign', 'Automated campaign triggered when user hits usage limits or engagement thresholds.', 'Conversion campaign activated for qualified users');
    
    -- 2. SMB Quick-Start Template (inspired by HubSpot, Mailchimp)
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, is_active, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'SMB Quick-Start Program',
        'Rapid onboarding for small to medium businesses with guided setup and training',
        'standard', 21, true, true, user_id
    ) RETURNING id INTO smb_template_id;
    
    -- SMB template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (smb_template_id, 'Kickoff Call & Goal Setting', 'Welcome call to understand business goals and set success metrics', 'kickoff', 1, true, true, 0, 1.0, 'csm', 'Schedule 30-45 minute call to understand customer goals, pain points, and define success metrics.', 'Success metrics defined and documented in CRM'),
    (smb_template_id, 'Account Setup & Configuration', 'Set up account structure, users, and basic configuration', 'configuration', 2, true, false, 1, 2.0, 'csm', 'Configure account settings, add team members, set up basic workflows and permissions.', 'Account fully configured with all team members added'),
    (smb_template_id, 'Data Import & Integration', 'Import existing data and connect key integrations', 'technical', 3, true, false, 3, 3.0, 'technical', 'Guide customer through data import process and set up 1-2 key integrations.', 'Core data imported and primary integrations connected'),
    (smb_template_id, 'Customization Workshop', 'Customize platform to match customer workflows and branding', 'configuration', 4, true, false, 7, 2.0, 'csm', 'Work with customer to customize dashboards, reports, and workflows to match their processes.', 'Platform customized to customer workflows'),
    (smb_template_id, 'Team Training Session', 'Conduct live training for all users on core features', 'training', 5, true, true, 10, 2.0, 'csm', 'Deliver comprehensive training session covering daily workflows and best practices.', 'All team members trained and comfortable with core features'),
    (smb_template_id, 'Go-Live Support', 'Monitor initial usage and provide hands-on support', 'support', 6, true, false, 14, 1.0, 'csm', 'Monitor customer usage during first week of active use. Provide proactive support.', 'Customer actively using platform without issues'),
    (smb_template_id, '30-Day Success Review', 'Review progress against success metrics and plan next steps', 'support', 7, true, true, 21, 1.0, 'csm', 'Schedule review call to assess progress, gather feedback, and identify expansion opportunities.', 'Success metrics reviewed and future roadmap established');
    
    -- 3. Mid-Market Enterprise Template (inspired by Salesforce, Zendesk)
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, is_active, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Mid-Market Enterprise Onboarding',
        'Comprehensive onboarding for mid-market companies with complex requirements',
        'enterprise', 45, false, true, user_id
    ) RETURNING id INTO midmarket_template_id;
    
    -- Mid-market template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (midmarket_template_id, 'Executive Alignment Session', 'High-level kickoff with executive sponsors', 'kickoff', 1, true, true, 0, 1.5, 'csm', 'Executive-level meeting to align on business objectives, timeline, and success criteria.', 'Executive alignment achieved and project charter signed'),
    (midmarket_template_id, 'Technical Discovery & Architecture', 'Deep technical assessment and integration planning', 'technical', 2, true, true, 3, 4.0, 'technical', 'Technical deep-dive with IT team. Document integration requirements and technical architecture.', 'Technical requirements documented and approved'),
    (midmarket_template_id, 'Security & Compliance Review', 'Complete security assessment and compliance validation', 'administrative', 3, true, false, 7, 3.0, 'technical', 'Security questionnaire, compliance review, and necessary certifications/audits.', 'Security and compliance requirements satisfied'),
    (midmarket_template_id, 'Data Migration Strategy', 'Plan and execute complex data migration from legacy systems', 'technical', 4, true, false, 10, 8.0, 'technical', 'Develop data migration plan, execute migration, and validate data integrity.', 'Data successfully migrated and validated'),
    (midmarket_template_id, 'Custom Configuration & Workflows', 'Build custom configurations for complex business processes', 'configuration', 5, true, false, 14, 6.0, 'technical', 'Configure custom workflows, business processes, and automation rules.', 'Custom configurations implemented and tested'),
    (midmarket_template_id, 'Integration Development', 'Develop and test custom integrations with enterprise systems', 'technical', 6, true, false, 21, 12.0, 'technical', 'Develop custom integrations with ERP, CRM, and other enterprise systems.', 'All integrations developed, tested, and deployed'),
    (midmarket_template_id, 'User Acceptance Testing', 'Comprehensive UAT with business stakeholders', 'testing', 7, true, true, 28, 4.0, 'customer', 'Business users test all configured workflows and integrations in staging environment.', 'UAT completed successfully with all issues resolved'),
    (midmarket_template_id, 'Phased Rollout Planning', 'Plan phased rollout to minimize business disruption', 'deployment', 8, true, false, 35, 2.0, 'csm', 'Develop detailed rollout plan with pilot groups and production deployment phases.', 'Rollout plan approved by all stakeholders'),
    (midmarket_template_id, 'Go-Live & Production Support', 'Execute production deployment with dedicated support', 'deployment', 9, true, true, 42, 8.0, 'technical', 'Deploy to production with dedicated support team monitoring for issues.', 'Production deployment successful with minimal disruption'),
    (midmarket_template_id, 'Success Metrics Review', 'Measure success against original business objectives', 'support', 10, true, true, 45, 2.0, 'csm', 'Review business metrics, user adoption, and ROI against original objectives.', 'Success metrics achieved and documented');
    
    -- 4. High-Touch Enterprise Template (inspired by Snowflake, Databricks)
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, is_active, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'High-Touch Enterprise Program',
        'Premium white-glove onboarding for strategic enterprise customers',
        'enterprise', 90, false, true, user_id
    ) RETURNING id INTO enterprise_template_id;
    
    -- High-touch enterprise steps (abbreviated)
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (enterprise_template_id, 'Executive Sponsor Alignment', 'C-level executive alignment and strategic planning session', 'kickoff', 1, true, true, 0, 2.0, 'csm', 'Executive alignment meeting with C-suite sponsors. Define strategic objectives and success criteria.', 'Strategic alignment documented and C-level buy-in secured'),
    (enterprise_template_id, 'Dedicated Success Team Assignment', 'Assign dedicated customer success team and technical architects', 'administrative', 2, true, false, 1, 1.0, 'admin', 'Assign dedicated CSM, technical architect, and support resources to the account.', 'Dedicated team assigned and introduced to customer'),
    (enterprise_template_id, 'Enterprise Architecture Review', 'Comprehensive review of customer technical architecture', 'technical', 3, true, true, 7, 8.0, 'technical', 'Deep technical architecture review with customer architects and IT leadership.', 'Technical architecture documented and integration strategy approved'),
    (enterprise_template_id, 'Proof of Concept Development', 'Build proof of concept to validate technical approach', 'technical', 4, true, true, 21, 20.0, 'technical', 'Develop working proof of concept demonstrating key use cases and integrations.', 'POC successfully demonstrates value and technical feasibility'),
    (enterprise_template_id, 'Security & Compliance Certification', 'Complete enterprise security and compliance requirements', 'administrative', 5, true, false, 30, 6.0, 'technical', 'Complete SOC2, penetration testing, and enterprise security reviews.', 'All security and compliance requirements certified'),
    (enterprise_template_id, 'Custom Development Phase', 'Develop custom features and enterprise-specific functionality', 'technical', 6, false, false, 45, 40.0, 'technical', 'Develop custom features, APIs, and enterprise-specific functionality as contracted.', 'Custom development completed and tested'),
    (enterprise_template_id, 'Pilot Program Execution', 'Execute controlled pilot with select business units', 'deployment', 7, true, true, 60, 10.0, 'csm', 'Launch pilot program with 1-2 business units. Monitor closely and gather feedback.', 'Pilot program successful with positive feedback'),
    (enterprise_template_id, 'Enterprise Deployment', 'Full enterprise rollout with change management support', 'deployment', 8, true, true, 75, 15.0, 'csm', 'Execute full enterprise deployment with change management and training programs.', 'Enterprise deployment completed with high user adoption'),
    (enterprise_template_id, 'Quarterly Business Review Setup', 'Establish ongoing QBR process and success metrics tracking', 'support', 9, true, true, 90, 2.0, 'csm', 'Set up quarterly business review process and ongoing success metrics dashboard.', 'QBR process established and first review completed');
    
    -- 5. High-Touch PLG Template (inspired by Figma, Miro)
    INSERT INTO onboarding_plan_templates (
        id, organization_id, name, description, plan_type, 
        estimated_duration_days, is_default, is_active, created_by
    ) VALUES (
        gen_random_uuid(), org_id,
        'Product-Led Growth Enterprise',
        'High-touch support for product-led growth companies expanding enterprise adoption',
        'standard', 30, false, true, user_id
    ) RETURNING id INTO hightouch_template_id;
    
    -- PLG template steps
    INSERT INTO onboarding_template_steps (
        template_id, title, description, step_category, step_order, 
        is_required, is_milestone, due_days_offset, estimated_hours,
        default_assignee_role, instructions, success_criteria
    ) VALUES
    (hightouch_template_id, 'Usage Pattern Analysis', 'Analyze existing freemium/trial usage to identify expansion opportunities', 'administrative', 1, true, false, 0, 2.0, 'csm', 'Review usage analytics to understand current adoption patterns and identify growth opportunities.', 'Usage analysis completed and expansion opportunities identified'),
    (hightouch_template_id, 'Stakeholder Mapping', 'Identify and engage key stakeholders beyond initial users', 'kickoff', 2, true, true, 3, 1.5, 'csm', 'Map organizational stakeholders and decision makers. Plan engagement strategy.', 'Stakeholder map created and key contacts identified'),
    (hightouch_template_id, 'Team Collaboration Setup', 'Configure advanced collaboration features and team workspaces', 'configuration', 3, true, false, 7, 2.0, 'csm', 'Set up team workspaces, permissions, and collaboration workflows for enterprise use.', 'Team collaboration features configured and adopted'),
    (hightouch_template_id, 'Admin & Governance Training', 'Train administrators on governance, security, and management features', 'training', 4, true, false, 10, 2.0, 'csm', 'Train team administrators on user management, security settings, and governance features.', 'Administrators trained and governance policies implemented'),
    (hightouch_template_id, 'Integration & Workflow Optimization', 'Optimize integrations and workflows for enterprise productivity', 'technical', 5, true, false, 14, 3.0, 'technical', 'Set up enterprise integrations and optimize workflows for maximum productivity.', 'Enterprise integrations configured and workflows optimized'),
    (hightouch_template_id, 'Adoption Campaign Launch', 'Launch internal adoption campaign to drive broader usage', 'support', 6, true, true, 21, 1.0, 'csm', 'Support customer in launching internal adoption campaign with training materials and incentives.', 'Adoption campaign launched with measurable increase in usage'),
    (hightouch_template_id, 'Success Metrics & Expansion Planning', 'Review success metrics and plan additional feature adoption', 'support', 7, true, true, 30, 1.5, 'csm', 'Review adoption metrics, user feedback, and plan expansion to additional features or teams.', 'Success metrics reviewed and expansion plan created');
    
    -- Update usage counts for new templates
    UPDATE onboarding_plan_templates SET usage_count = 8 WHERE id = freemium_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 12 WHERE id = smb_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 5 WHERE id = midmarket_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 3 WHERE id = enterprise_template_id;
    UPDATE onboarding_plan_templates SET usage_count = 7 WHERE id = hightouch_template_id;
    
END $$;