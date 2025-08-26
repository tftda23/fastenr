-- Add more accounts and engagements for Acme Customer Success organization
-- Organization ID: 550e8400-e29b-41d4-a716-446655440001

-- Insert additional accounts for Acme Customer Success
INSERT INTO accounts (id, organization_id, name, industry, size, arr, status, health_score, churn_risk_score, created_at, updated_at) VALUES
-- Tech Companies
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'TechFlow Solutions', 'Technology', 'enterprise', 250000, 'active', 85, 15, NOW() - INTERVAL '6 months', NOW()),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'DataVault Inc', 'Technology', 'large', 120000, 'active', 78, 22, NOW() - INTERVAL '4 months', NOW()),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'CloudSync Corp', 'Technology', 'enterprise', 180000, 'active', 92, 8, NOW() - INTERVAL '8 months', NOW()),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'DevTools Pro', 'Technology', 'small', 45000, 'active', 65, 35, NOW() - INTERVAL '2 months', NOW()),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'AI Innovations', 'Technology', 'enterprise', 320000, 'active', 88, 12, NOW() - INTERVAL '10 months', NOW()),

-- Healthcare Companies
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440001', 'MedTech Systems', 'Healthcare', 'enterprise', 200000, 'active', 82, 18, NOW() - INTERVAL '7 months', NOW()),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440001', 'HealthFlow Analytics', 'Healthcare', 'medium', 95000, 'active', 75, 25, NOW() - INTERVAL '3 months', NOW()),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440001', 'Patient Care Plus', 'Healthcare', 'small', 38000, 'at_risk', 58, 42, NOW() - INTERVAL '1 month', NOW()),

-- Financial Services
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440001', 'FinSecure Bank', 'Financial Services', 'enterprise', 280000, 'active', 90, 10, NOW() - INTERVAL '12 months', NOW()),
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440001', 'Investment Analytics', 'Financial Services', 'large', 150000, 'active', 80, 20, NOW() - INTERVAL '5 months', NOW()),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440001', 'Credit Solutions', 'Financial Services', 'small', 55000, 'churned', 45, 55, NOW() - INTERVAL '14 months', NOW()),

-- Manufacturing
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440001', 'AutoParts Manufacturing', 'Manufacturing', 'enterprise', 190000, 'active', 77, 23, NOW() - INTERVAL '9 months', NOW()),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440001', 'Steel Works Inc', 'Manufacturing', 'medium', 110000, 'active', 83, 17, NOW() - INTERVAL '6 months', NOW()),

-- Retail & E-commerce
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440001', 'Fashion Forward', 'Retail', 'medium', 85000, 'active', 72, 28, NOW() - INTERVAL '4 months', NOW()),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440001', 'E-Shop Global', 'E-commerce', 'enterprise', 220000, 'active', 86, 14, NOW() - INTERVAL '11 months', NOW());

-- Generate engagements for each account (10-20 per account)
DO $$
DECLARE
    account_record RECORD;
    engagement_count INTEGER;
    i INTEGER;
    -- Updated engagement types to use only valid constraint values
    engagement_types TEXT[] := ARRAY['call', 'email', 'meeting', 'demo', 'training', 'note'];
    engagement_outcomes TEXT[] := ARRAY['positive', 'neutral', 'negative'];
    engagement_titles TEXT[] := ARRAY[
        'Quarterly Business Review',
        'Product Training Session',
        'Technical Support Call',
        'Feature Demo',
        'Onboarding Check-in',
        'Renewal Discussion',
        'Health Score Review',
        'Strategic Planning Meeting',
        'Implementation Support',
        'Best Practices Workshop',
        'Account Planning Session',
        'Success Metrics Review',
        'Escalation Resolution',
        'Executive Briefing',
        'User Adoption Review'
    ];
    attendee_options TEXT[] := ARRAY['Customer Success Manager', 'Account Manager', 'Technical Lead', 'Customer Contact', 'Decision Maker', 'Product Owner'];
BEGIN
    -- Loop through each new account
    FOR account_record IN 
        SELECT id, name FROM accounts 
        WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
        -- Cast UUID to text for LIKE operator
        AND id::text LIKE '550e8400-e29b-41d4-a716-44665544010%'
    LOOP
        -- Generate 10-20 engagements per account
        engagement_count := 10 + floor(random() * 11)::int;
        
        FOR i IN 1..engagement_count LOOP
            INSERT INTO engagements (
                id,
                organization_id,
                account_id,
                title,
                description,
                type,
                outcome,
                scheduled_at,
                completed_at,
                attendees,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                '550e8400-e29b-41d4-a716-446655440001',
                account_record.id,
                engagement_titles[1 + floor(random() * array_length(engagement_titles, 1))::int],
                'Engagement with ' || account_record.name || ' - ' || 
                CASE 
                    WHEN random() < 0.3 THEN 'Discussed implementation challenges and provided solutions'
                    WHEN random() < 0.6 THEN 'Reviewed current usage metrics and identified growth opportunities'
                    ELSE 'Addressed technical questions and planned next steps'
                END,
                engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int],
                engagement_outcomes[1 + floor(random() * array_length(engagement_outcomes, 1))::int],
                NOW() - INTERVAL '1 day' * floor(random() * 180),
                CASE 
                    WHEN random() < 0.8 THEN NOW() - INTERVAL '1 day' * floor(random() * 180)
                    ELSE NULL
                END,
                ARRAY[
                    attendee_options[1 + floor(random() * array_length(attendee_options, 1))::int],
                    attendee_options[1 + floor(random() * array_length(attendee_options, 1))::int]
                ],
                NOW() - INTERVAL '1 day' * floor(random() * 180),
                NOW()
            );
        END LOOP;
        
        RAISE NOTICE 'Created % engagements for account: %', engagement_count, account_record.name;
    END LOOP;
END $$;

-- Add health metrics for the new accounts
INSERT INTO health_metrics (
    id, organization_id, account_id, overall_health_score, feature_adoption_score, 
    training_completion_rate, support_tickets, login_frequency, metric_date, created_at
)
SELECT 
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    id,
    GREATEST(0, LEAST(100, health_score + floor(random() * 10 - 5)::int)),
    GREATEST(0, LEAST(100, 60 + floor(random() * 40)::int)),
    GREATEST(0, LEAST(100, 70 + floor(random() * 30)::int)),
    floor(random() * 10)::int,
    floor(random() * 30)::int,
    NOW() - INTERVAL '1 day' * floor(random() * 30),
    NOW()
FROM accounts 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
-- Cast UUID to text for LIKE operator
AND id::text LIKE '550e8400-e29b-41d4-a716-44665544010%';

-- Add NPS surveys for the new accounts
INSERT INTO nps_surveys (
    id, organization_id, account_id, score, feedback, survey_date, created_at
)
SELECT 
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    id,
    floor(random() * 11)::int,
    CASE 
        WHEN random() < 0.3 THEN 'Great product, excellent support team!'
        WHEN random() < 0.6 THEN 'Good overall experience, some room for improvement'
        ELSE 'Very satisfied with the platform and service'
    END,
    NOW() - INTERVAL '1 day' * floor(random() * 90),
    NOW() - INTERVAL '1 day' * floor(random() * 90)
FROM accounts 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
-- Cast UUID to text for LIKE operator
AND id::text LIKE '550e8400-e29b-41d4-a716-44665544010%';

-- Add customer goals for the new accounts
INSERT INTO customer_goals (
    id, organization_id, account_id, title, description, target_date, status, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    id,
    CASE floor(random() * 4)
        WHEN 0 THEN 'Increase User Adoption'
        WHEN 1 THEN 'Reduce Time to Value'
        WHEN 2 THEN 'Improve Feature Utilization'
        ELSE 'Enhance Team Productivity'
    END,
    'Strategic goal to improve customer success metrics and drive business value',
    NOW() + INTERVAL '1 month' * (3 + floor(random() * 9)::int),
    CASE floor(random() * 4)
        WHEN 0 THEN 'on_track'
        WHEN 1 THEN 'at_risk'
        WHEN 2 THEN 'achieved'
        ELSE 'missed'
    END,
    NOW() - INTERVAL '1 day' * floor(random() * 60),
    NOW()
FROM accounts 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
-- Cast UUID to text for LIKE operator
AND id::text LIKE '550e8400-e29b-41d4-a716-44665544010%';

-- Add adoption metrics for the new accounts
INSERT INTO adoption_metrics (
    id, organization_id, account_id, metric_type, metric_name, metric_value, recorded_at
)
SELECT 
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    accounts.id,
    metric_types.type,
    metric_types.name,
    floor(random() * 100)::int,
    NOW() - INTERVAL '1 day' * floor(random() * 30)
FROM accounts 
CROSS JOIN (
    VALUES 
        ('usage', 'Daily Active Users'),
        ('feature_adoption', 'Advanced Features Used'),
        ('engagement', 'Monthly Logins'),
        ('custom', 'API Calls per Month')
) AS metric_types(type, name)
WHERE accounts.organization_id = '550e8400-e29b-41d4-a716-446655440001'
-- Cast UUID to text for LIKE operator
AND accounts.id::text LIKE '550e8400-e29b-41d4-a716-44665544010%';

-- Summary
SELECT 
    'Acme Customer Success' as organization,
    COUNT(*) as total_accounts
FROM accounts 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001';

SELECT 
    'Total Engagements for Acme' as metric,
    COUNT(*) as count
FROM engagements 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001';
