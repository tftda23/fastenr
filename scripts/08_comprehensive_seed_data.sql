-- Comprehensive seed data for Customer Success SaaS
-- This script creates realistic dummy data for all tables

-- First, let's create some organizations
INSERT INTO organizations (id, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Acme Customer Success', NOW() - INTERVAL '6 months', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'TechFlow Solutions', NOW() - INTERVAL '4 months', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'DataDriven Corp', NOW() - INTERVAL '8 months', NOW());

-- Removed user_profiles inserts since they must reference actual auth.users records

-- Create 20 customer accounts across organizations
INSERT INTO accounts (id, organization_id, name, industry, size, status, arr, health_score, churn_risk_score, created_at, updated_at) VALUES
-- Acme Customer Success accounts
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TechStart Inc', 'Technology', 'small', 'active', 50000, 85, 15, NOW() - INTERVAL '5 months', NOW()),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Global Manufacturing Co', 'Manufacturing', 'enterprise', 'active', 500000, 92, 8, NOW() - INTERVAL '4 months', NOW()),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'HealthCare Solutions', 'Healthcare', 'medium', 'active', 150000, 78, 22, NOW() - INTERVAL '6 months', NOW()),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'EduTech Platform', 'Education', 'medium', 'active', 120000, 88, 12, NOW() - INTERVAL '3 months', NOW()),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'RetailMax Systems', 'Retail', 'large', 'active', 300000, 75, 25, NOW() - INTERVAL '7 months', NOW()),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'FinanceFirst Bank', 'Financial Services', 'enterprise', 'active', 750000, 95, 5, NOW() - INTERVAL '8 months', NOW()),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'LogiFlow Transport', 'Logistics', 'medium', 'at_risk', 80000, 65, 35, NOW() - INTERVAL '5 months', NOW()),
-- TechFlow Solutions accounts
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'CloudNine Services', 'Technology', 'large', 'active', 400000, 90, 10, NOW() - INTERVAL '3 months', NOW()),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'MediaStream Corp', 'Media', 'medium', 'active', 180000, 82, 18, NOW() - INTERVAL '4 months', NOW()),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'AgriTech Solutions', 'Agriculture', 'small', 'active', 60000, 87, 13, NOW() - INTERVAL '2 months', NOW()),
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'EnergyFlow Systems', 'Energy', 'large', 'active', 350000, 79, 21, NOW() - INTERVAL '6 months', NOW()),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'PropTech Innovations', 'Real Estate', 'medium', 'active', 200000, 91, 9, NOW() - INTERVAL '5 months', NOW()),
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'AutoDrive Technologies', 'Automotive', 'large', 'at_risk', 280000, 68, 32, NOW() - INTERVAL '7 months', NOW()),
-- DataDriven Corp accounts
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'InsureTech Plus', 'Insurance', 'medium', 'active', 160000, 84, 16, NOW() - INTERVAL '4 months', NOW()),
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'SportsTech Arena', 'Sports', 'small', 'active', 45000, 89, 11, NOW() - INTERVAL '3 months', NOW()),
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 'TravelSmart Booking', 'Travel', 'medium', 'active', 220000, 86, 14, NOW() - INTERVAL '6 months', NOW()),
('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', 'FoodTech Delivery', 'Food & Beverage', 'large', 'active', 380000, 77, 23, NOW() - INTERVAL '5 months', NOW()),
('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', 'LegalTech Partners', 'Legal', 'medium', 'active', 140000, 93, 7, NOW() - INTERVAL '7 months', NOW()),
('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440003', 'GovTech Solutions', 'Government', 'enterprise', 'active', 600000, 81, 19, NOW() - INTERVAL '8 months', NOW()),
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', 'NonProfit Connect', 'Non-Profit', 'small', 'at_risk', 35000, 62, 38, NOW() - INTERVAL '4 months', NOW());

-- Modified engagement creation to use existing user profiles instead of hardcoded ones
-- Create comprehensive engagements data (10-20 per account)
DO $$
DECLARE
    account_record RECORD;
    user_id UUID;
    engagement_count INTEGER;
    i INTEGER;
    engagement_types TEXT[] := ARRAY['meeting', 'call', 'email', 'note', 'demo', 'training'];
    outcomes TEXT[] := ARRAY['positive', 'neutral', 'negative'];
    attendee_names TEXT[] := ARRAY['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Davis'];
BEGIN
    -- Loop through each account
    FOR account_record IN SELECT id, organization_id, name FROM accounts LOOP
        -- Get any existing user from user_profiles table, or use a default UUID if none exist
        SELECT id INTO user_id FROM user_profiles WHERE organization_id = account_record.organization_id LIMIT 1;
        
        -- If no user profiles exist, skip engagement creation for this account
        IF user_id IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Generate 10-20 engagements per account
        engagement_count := 10 + floor(random() * 11)::int; -- Random between 10-20
        
        FOR i IN 1..engagement_count LOOP
            INSERT INTO engagements (
                id,
                organization_id,
                account_id,
                created_by,
                title,
                description,
                type,
                outcome,
                attendees,
                scheduled_at,
                completed_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                account_record.organization_id,
                account_record.id,
                user_id,
                CASE 
                    WHEN engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int] = 'call' THEN 'Weekly Check-in Call with ' || account_record.name
                    WHEN engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int] = 'meeting' THEN 'Strategy Meeting - ' || account_record.name
                    WHEN engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int] = 'demo' THEN 'Product Demo for ' || account_record.name
                    WHEN engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int] = 'training' THEN 'Training Session - ' || account_record.name
                    ELSE 'Customer Engagement - ' || account_record.name
                END,
                CASE 
                    WHEN random() < 0.3 THEN 'Discussed upcoming renewal and expansion opportunities. Customer is very satisfied with current service levels.'
                    WHEN random() < 0.6 THEN 'Reviewed quarterly business review metrics. Identified areas for improvement in user adoption.'
                    ELSE 'Regular check-in to ensure customer success. Addressed any concerns and gathered feedback for product improvements.'
                END,
                engagement_types[1 + floor(random() * array_length(engagement_types, 1))::int],
                outcomes[1 + floor(random() * array_length(outcomes, 1))::int],
                ARRAY[attendee_names[1 + floor(random() * array_length(attendee_names, 1))::int], attendee_names[1 + floor(random() * array_length(attendee_names, 1))::int]],
                NOW() - INTERVAL '1 day' * floor(random() * 90)::int - INTERVAL '1 hour' * floor(random() * 24)::int,
                CASE WHEN random() < 0.8 THEN NOW() - INTERVAL '1 day' * floor(random() * 90)::int ELSE NULL END,
                NOW() - INTERVAL '1 day' * floor(random() * 90)::int,
                NOW() - INTERVAL '1 day' * floor(random() * 30)::int
            );
        END LOOP;
    END LOOP;
END $$;

-- Create health metrics for all accounts
INSERT INTO health_metrics (id, organization_id, account_id, metric_date, login_frequency, feature_adoption_score, support_tickets, training_completion_rate, overall_health_score, created_at)
SELECT 
    gen_random_uuid(),
    organization_id,
    id,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 30),
    floor(random() * 50)::int, -- 0-49 logins per week
    (60 + floor(random() * 40))::int, -- 60-99 feature adoption score
    floor(random() * 10)::int, -- 0-9 support tickets
    (70 + floor(random() * 30))::int, -- 70-99 training completion rate
    GREATEST(0, LEAST(100, (health_score + floor(random() * 20 - 10))::int)), -- Clamp between 0-100
    NOW()
FROM accounts
CROSS JOIN generate_series(0, 30);

-- Create health scores
INSERT INTO health_scores (id, organization_id, account_id, score, factors, recorded_at)
SELECT 
    gen_random_uuid(),
    organization_id,
    id,
    health_score,
    jsonb_build_object(
        'login_frequency', 70 + floor(random() * 30)::int,
        'feature_adoption', 60 + floor(random() * 40)::int,
        'support_satisfaction', 80 + floor(random() * 20)::int,
        'training_completion', 75 + floor(random() * 25)::int
    ),
    NOW() - INTERVAL '1 day' * floor(random() * 30)::int
FROM accounts;

-- Create NPS surveys
INSERT INTO nps_surveys (id, organization_id, account_id, score, feedback, survey_date, created_at)
SELECT 
    gen_random_uuid(),
    organization_id,
    id,
    6 + floor(random() * 5)::int, -- NPS scores 6-10
    CASE 
        WHEN random() < 0.3 THEN 'Great product and excellent customer service. Would definitely recommend!'
        WHEN random() < 0.6 THEN 'Good overall experience. Some areas for improvement in the user interface.'
        ELSE 'Satisfied with the service. Looking forward to new features and improvements.'
    END,
    CURRENT_DATE - INTERVAL '1 day' * floor(random() * 60)::int,
    NOW()
FROM accounts
WHERE random() < 0.7; -- 70% of accounts have NPS surveys

-- Create customer goals
INSERT INTO customer_goals (id, organization_id, account_id, title, description, target_date, status, completion_date, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    organization_id,
    id,
    CASE 
        WHEN random() < 0.25 THEN 'Increase User Adoption by 50%'
        WHEN random() < 0.5 THEN 'Reduce Time to Value'
        WHEN random() < 0.75 THEN 'Expand to Additional Departments'
        ELSE 'Achieve ROI Targets'
    END,
    CASE 
        WHEN random() < 0.25 THEN 'Focus on training and onboarding to increase active user count across all departments.'
        WHEN random() < 0.5 THEN 'Streamline onboarding process to help new users see value within first 30 days.'
        WHEN random() < 0.75 THEN 'Roll out platform to marketing and sales teams after successful implementation in operations.'
        ELSE 'Achieve 300% ROI within 12 months through improved efficiency and cost savings.'
    END,
    CURRENT_DATE + INTERVAL '1 month' * (3 + floor(random() * 9)::int),
    -- Fixed status values to match constraint: on_track, at_risk, achieved, missed
    CASE 
        WHEN random() < 0.3 THEN 'achieved'
        WHEN random() < 0.6 THEN 'on_track'
        WHEN random() < 0.8 THEN 'at_risk'
        ELSE 'missed'
    END,
    CASE WHEN random() < 0.3 THEN CURRENT_DATE - INTERVAL '1 day' * floor(random() * 30)::int ELSE NULL END,
    NOW() - INTERVAL '1 day' * floor(random() * 60)::int,
    NOW()
FROM accounts;

-- Create adoption metrics
INSERT INTO adoption_metrics (id, organization_id, account_id, metric_name, metric_type, metric_value, recorded_at)
SELECT 
    gen_random_uuid(),
    organization_id,
    id,
    metric_name,
    metric_type,
    50 + random() * 50, -- Values between 50-100
    NOW() - INTERVAL '1 day' * floor(random() * 30)::int
FROM accounts
CROSS JOIN (
    VALUES 
        ('Daily Active Users', 'usage'),
        ('Feature Adoption Rate', 'feature_adoption'),
        ('Session Duration', 'engagement'),
        ('API Calls per Day', 'custom'),
        ('Training Completion', 'custom')
) AS metrics(metric_name, metric_type);

-- Modified API keys creation to only create for organizations without requiring specific user profiles
-- Create API keys for organizations (only if user profiles exist)
INSERT INTO api_keys (id, organization_id, name, key_hash, permissions, created_by, expires_at, last_used_at, created_at)
SELECT 
    gen_random_uuid(),
    org.id,
    'Production API Key',
    encode(sha256(random()::text::bytea), 'hex'),
    ARRAY['read', 'write'],
    up.id,
    NOW() + INTERVAL '1 year',
    NOW() - INTERVAL '1 day' * floor(random() * 7)::int,
    NOW() - INTERVAL '1 month' * floor(random() * 3)::int
FROM organizations org
LEFT JOIN user_profiles up ON up.organization_id = org.id AND up.role = 'admin'
WHERE up.id IS NOT NULL;
