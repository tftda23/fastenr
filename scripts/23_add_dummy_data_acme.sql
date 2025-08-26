-- Add comprehensive dummy data for Acme Customer Success organization
-- Organization ID: 550e8400-e29b-41d4-a716-446655440001

-- Insert sample accounts
INSERT INTO accounts (id, organization_id, name, industry, size, status, health_score, mrr, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'TechCorp Solutions', 'Technology', 'Enterprise', 'active', 85, 15000, NOW() - INTERVAL '6 months', NOW()),
('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 'Global Manufacturing Inc', 'Manufacturing', 'Enterprise', 'active', 92, 25000, NOW() - INTERVAL '8 months', NOW()),
('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', 'StartupX', 'SaaS', 'Small', 'active', 78, 2500, NOW() - INTERVAL '3 months', NOW()),
('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', 'HealthTech Partners', 'Healthcare', 'Medium', 'active', 88, 8500, NOW() - INTERVAL '5 months', NOW()),
('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440001', 'EduLearn Platform', 'Education', 'Medium', 'active', 82, 6200, NOW() - INTERVAL '4 months', NOW()),
('66666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440001', 'RetailMax Chain', 'Retail', 'Enterprise', 'at_risk', 65, 18000, NOW() - INTERVAL '10 months', NOW()),
('77777777-7777-7777-7777-777777777777', '550e8400-e29b-41d4-a716-446655440001', 'FinanceFlow Corp', 'Finance', 'Enterprise', 'active', 90, 22000, NOW() - INTERVAL '12 months', NOW()),
('88888888-8888-8888-8888-888888888888', '550e8400-e29b-41d4-a716-446655440001', 'GreenEnergy Solutions', 'Energy', 'Medium', 'active', 86, 7800, NOW() - INTERVAL '7 months', NOW()),
('99999999-9999-9999-9999-999999999999', '550e8400-e29b-41d4-a716-446655440001', 'LogiTrans Systems', 'Logistics', 'Medium', 'active', 79, 5400, NOW() - INTERVAL '2 months', NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440001', 'MediaStream Co', 'Media', 'Small', 'churned', 45, 0, NOW() - INTERVAL '9 months', NOW() - INTERVAL '1 month');

-- Insert sample engagements
INSERT INTO engagements (id, organization_id, account_id, type, subject, description, status, priority, created_at, updated_at) VALUES
('e1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'call', 'Quarterly Business Review', 'Discussed Q4 goals and platform adoption metrics', 'completed', 'high', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'),
('e2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'email', 'Feature Training Session', 'Scheduled training for new workflow automation features', 'scheduled', 'medium', NOW() - INTERVAL '3 days', NOW()),
('e3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'meeting', 'Onboarding Check-in', 'Follow-up on initial setup and user adoption', 'completed', 'high', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),
('e4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 'call', 'Support Escalation', 'Resolved integration issues with their EHR system', 'completed', 'high', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('e5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440001', '55555555-5555-5555-5555-555555555555', 'email', 'Product Update Notification', 'Informed about new analytics dashboard features', 'completed', 'low', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('e6666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440001', '66666666-6666-6666-6666-666666666666', 'meeting', 'Renewal Discussion', 'Addressing concerns about contract renewal', 'in_progress', 'high', NOW() - INTERVAL '2 days', NOW()),
('e7777777-7777-7777-7777-777777777777', '550e8400-e29b-41d4-a716-446655440001', '77777777-7777-7777-7777-777777777777', 'call', 'Success Milestone Celebration', 'Celebrated achieving 95% user adoption rate', 'completed', 'medium', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('e8888888-8888-8888-8888-888888888888', '550e8400-e29b-41d4-a716-446655440001', '88888888-8888-8888-8888-888888888888', 'email', 'Best Practices Guide', 'Shared industry best practices for sustainability reporting', 'completed', 'medium', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- Insert health scores
INSERT INTO health_scores (id, organization_id, account_id, score, factors, calculated_at) VALUES
('h1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 85, '{"usage": 90, "support_tickets": 85, "payment_history": 95, "engagement": 80}', NOW()),
('h2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 92, '{"usage": 95, "support_tickets": 90, "payment_history": 100, "engagement": 85}', NOW()),
('h3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 78, '{"usage": 75, "support_tickets": 80, "payment_history": 85, "engagement": 72}', NOW()),
('h4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 88, '{"usage": 85, "support_tickets": 92, "payment_history": 90, "engagement": 85}', NOW()),
('h5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440001', '55555555-5555-5555-5555-555555555555', 82, '{"usage": 80, "support_tickets": 85, "payment_history": 88, "engagement": 75}', NOW());

-- Insert NPS surveys
INSERT INTO nps_surveys (id, organization_id, account_id, score, feedback, created_at) VALUES
('n1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 9, 'Excellent platform, great support team. The new features have significantly improved our workflow.', NOW() - INTERVAL '1 month'),
('n2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 10, 'Outstanding service and product. Would definitely recommend to other companies in our industry.', NOW() - INTERVAL '2 weeks'),
('n3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 8, 'Very satisfied with the platform. Some minor UI improvements would be nice.', NOW() - INTERVAL '3 weeks'),
('n4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 9, 'Great integration capabilities and responsive customer success team.', NOW() - INTERVAL '1 week'),
('n5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440001', '66666666-6666-6666-6666-666666666666', 6, 'Platform is good but we have had some performance issues lately. Support has been helpful though.', NOW() - INTERVAL '5 days');

-- Insert customer goals
INSERT INTO customer_goals (id, organization_id, account_id, title, description, target_value, current_value, unit, status, due_date, created_at) VALUES
('g1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Increase User Adoption', 'Achieve 90% user adoption across all departments', 90, 85, 'percentage', 'in_progress', NOW() + INTERVAL '2 months', NOW() - INTERVAL '1 month'),
('g2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Reduce Processing Time', 'Decrease order processing time by 30%', 30, 25, 'percentage', 'in_progress', NOW() + INTERVAL '3 months', NOW() - INTERVAL '2 months'),
('g3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'Scale Team Usage', 'Onboard 50 new team members to the platform', 50, 35, 'users', 'in_progress', NOW() + INTERVAL '6 weeks', NOW() - INTERVAL '3 weeks'),
('g4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 'Improve Data Quality', 'Achieve 95% data accuracy in patient records', 95, 88, 'percentage', 'in_progress', NOW() + INTERVAL '4 months', NOW() - INTERVAL '6 weeks'),
('g5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440001', '55555555-5555-5555-5555-555555555555', 'Increase Course Completion', 'Achieve 80% course completion rate', 80, 72, 'percentage', 'completed', NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 months');

-- Insert goal progress tracking
INSERT INTO goal_progress (id, goal_id, value, notes, recorded_at) VALUES
('p1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 75, 'Good progress in engineering and marketing departments', NOW() - INTERVAL '2 weeks'),
('p1111111-1111-1111-1111-111111111112', 'g1111111-1111-1111-1111-111111111111', 82, 'Sales team fully onboarded, working on support team', NOW() - INTERVAL '1 week'),
('p1111111-1111-1111-1111-111111111113', 'g1111111-1111-1111-1111-111111111111', 85, 'Current progress, on track for 90% target', NOW()),
('p2222222-2222-2222-2222-222222222221', 'g2222222-2222-2222-2222-222222222222', 15, 'Initial workflow optimizations implemented', NOW() - INTERVAL '3 weeks'),
('p2222222-2222-2222-2222-222222222222', 'g2222222-2222-2222-2222-222222222222', 25, 'Automation features reducing processing time significantly', NOW()),
('p3333333-3333-3333-3333-333333333331', 'g3333333-3333-3333-3333-333333333333', 20, 'First batch of new hires completed training', NOW() - INTERVAL '2 weeks'),
('p3333333-3333-3333-3333-333333333332', 'g3333333-3333-3333-3333-333333333333', 35, 'Second batch onboarded successfully', NOW());

-- Insert adoption metrics
INSERT INTO adoption_metrics (id, organization_id, account_id, feature_name, usage_count, last_used, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Dashboard', 245, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 month'),
('a1111111-1111-1111-1111-111111111112', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Reports', 89, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 month'),
('a1111111-1111-1111-1111-111111111113', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Integrations', 34, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 month'),
('a2222222-2222-2222-2222-222222222221', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Dashboard', 312, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '2 months'),
('a2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Automation', 156, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 months'),
('a3333333-3333-3333-3333-333333333331', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'Dashboard', 178, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '3 months'),
('a3333333-3333-3333-3333-333333333332', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'Team Management', 67, NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 months');

-- Insert sample surveys
INSERT INTO surveys (id, organization_id, title, subject, content, logo_url, custom_links, status, created_at, updated_at) VALUES
('s1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'Q4 Customer Satisfaction Survey', 'Help us improve your experience', 'We value your feedback and would love to hear about your experience with our platform this quarter. Your responses will help us continue to improve our service.', '/images/survey-logo.png', '{"support": "https://support.acme.com", "resources": "https://resources.acme.com"}', 'active', NOW() - INTERVAL '1 week', NOW()),
('s2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 'Feature Feedback Survey', 'Share your thoughts on our new features', 'We recently launched several new features and would love to get your feedback on how they are working for your team.', '/images/survey-logo.png', '{"changelog": "https://changelog.acme.com", "training": "https://training.acme.com"}', 'draft', NOW() - INTERVAL '3 days', NOW()),
('s3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', 'Annual Platform Review', 'Your annual platform review', 'As we approach the end of the year, we would like to understand how our platform has supported your business goals and what improvements you would like to see.', '/images/survey-logo.png', '{"roadmap": "https://roadmap.acme.com", "contact": "https://contact.acme.com"}', 'completed', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month');

-- Insert health metrics for trending data
INSERT INTO health_metrics (id, organization_id, account_id, metric_name, value, recorded_at) VALUES
-- TechCorp Solutions trending data
('m1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'login_frequency', 8.5, NOW() - INTERVAL '30 days'),
('m1111111-1111-1111-1111-111111111112', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'login_frequency', 9.2, NOW() - INTERVAL '15 days'),
('m1111111-1111-1111-1111-111111111113', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'login_frequency', 9.8, NOW()),
('m1111111-1111-1111-1111-111111111114', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'feature_adoption', 75, NOW() - INTERVAL '30 days'),
('m1111111-1111-1111-1111-111111111115', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'feature_adoption', 82, NOW() - INTERVAL '15 days'),
('m1111111-1111-1111-1111-111111111116', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'feature_adoption', 85, NOW()),
-- Global Manufacturing trending data
('m2222222-2222-2222-2222-222222222221', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'login_frequency', 9.1, NOW() - INTERVAL '30 days'),
('m2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'login_frequency', 9.5, NOW() - INTERVAL '15 days'),
('m2222222-2222-2222-2222-222222222223', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'login_frequency', 9.8, NOW()),
('m2222222-2222-2222-2222-222222222224', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'support_tickets', 2, NOW() - INTERVAL '30 days'),
('m2222222-2222-2222-2222-222222222225', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'support_tickets', 1, NOW() - INTERVAL '15 days'),
('m2222222-2222-2222-2222-222222222226', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'support_tickets', 0, NOW());

-- Summary
SELECT 
    'Accounts' as table_name, COUNT(*) as records_added 
FROM accounts WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Engagements' as table_name, COUNT(*) as records_added 
FROM engagements WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Health Scores' as table_name, COUNT(*) as records_added 
FROM health_scores WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'NPS Surveys' as table_name, COUNT(*) as records_added 
FROM nps_surveys WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Customer Goals' as table_name, COUNT(*) as records_added 
FROM customer_goals WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Surveys' as table_name, COUNT(*) as records_added 
FROM surveys WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001';
