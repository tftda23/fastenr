-- Add sample contacts for the Acme organization
-- This will help test the contacts loading functionality

-- First, let's check if the organization exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM organizations WHERE id = '550e8400-e29b-41d4-a716-446655440001') THEN
        -- Insert sample contacts for existing accounts
        INSERT INTO contacts (id, organization_id, account_id, first_name, last_name, email, title, department, seniority_level, decision_maker_level, contact_status, relationship_strength, created_at, updated_at) VALUES
        -- TechCorp Solutions contacts
        ('c1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Sarah', 'Johnson', 'sarah.johnson@techcorp.com', 'CTO', 'Engineering', 'C-Level', 'Primary', 'active', 'champion', NOW() - INTERVAL '6 months', NOW()),
        ('c1111111-1111-1111-1111-111111111112', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Mike', 'Chen', 'mike.chen@techcorp.com', 'VP Engineering', 'Engineering', 'VP', 'Influencer', 'active', 'supporter', NOW() - INTERVAL '6 months', NOW()),
        ('c1111111-1111-1111-1111-111111111113', '550e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 'Lisa', 'Rodriguez', 'lisa.rodriguez@techcorp.com', 'Product Manager', 'Product', 'Manager', 'User', 'active', 'neutral', NOW() - INTERVAL '5 months', NOW()),
        
        -- Global Manufacturing Inc contacts
        ('c2222222-2222-2222-2222-222222222221', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Robert', 'Williams', 'robert.williams@globalmanuf.com', 'CEO', 'Executive', 'C-Level', 'Primary', 'active', 'champion', NOW() - INTERVAL '8 months', NOW()),
        ('c2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', 'Jennifer', 'Davis', 'jennifer.davis@globalmanuf.com', 'Operations Director', 'Operations', 'Director', 'Influencer', 'active', 'supporter', NOW() - INTERVAL '7 months', NOW()),
        
        -- StartupX contacts
        ('c3333333-3333-3333-3333-333333333331', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'Alex', 'Thompson', 'alex@startupx.com', 'Founder & CEO', 'Executive', 'C-Level', 'Primary', 'active', 'champion', NOW() - INTERVAL '3 months', NOW()),
        ('c3333333-3333-3333-3333-333333333332', '550e8400-e29b-41d4-a716-446655440001', '33333333-3333-3333-3333-333333333333', 'Emma', 'Wilson', 'emma@startupx.com', 'Head of Growth', 'Marketing', 'Director', 'Influencer', 'active', 'supporter', NOW() - INTERVAL '3 months', NOW()),
        
        -- HealthTech Partners contacts
        ('c4444444-4444-4444-4444-444444444441', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 'Dr. James', 'Miller', 'james.miller@healthtech.com', 'Chief Medical Officer', 'Medical', 'C-Level', 'Primary', 'active', 'supporter', NOW() - INTERVAL '5 months', NOW()),
        ('c4444444-4444-4444-4444-444444444442', '550e8400-e29b-41d4-a716-446655440001', '44444444-4444-4444-4444-444444444444', 'Rachel', 'Brown', 'rachel.brown@healthtech.com', 'IT Director', 'Technology', 'Director', 'User', 'active', 'neutral', NOW() - INTERVAL '4 months', NOW()),
        
        -- EduLearn Platform contacts
        ('c5555555-5555-5555-5555-555555555551', '550e8400-e29b-41d4-a716-446655440001', '55555555-5555-5555-5555-555555555555', 'David', 'Garcia', 'david.garcia@edulearn.com', 'VP of Education', 'Education', 'VP', 'Primary', 'active', 'supporter', NOW() - INTERVAL '4 months', NOW()),
        ('c5555555-5555-5555-5555-555555555552', '550e8400-e29b-41d4-a716-446655440001', '55555555-5555-5555-5555-555555555555', 'Maria', 'Lopez', 'maria.lopez@edulearn.com', 'Learning Designer', 'Education', 'Individual Contributor', 'User', 'active', 'supporter', NOW() - INTERVAL '4 months', NOW()),
        
        -- RetailMax Chain contacts (at risk account)
        ('c6666666-6666-6666-6666-666666666661', '550e8400-e29b-41d4-a716-446655440001', '66666666-6666-6666-6666-666666666666', 'Kevin', 'Anderson', 'kevin.anderson@retailmax.com', 'COO', 'Operations', 'C-Level', 'Primary', 'active', 'detractor', NOW() - INTERVAL '10 months', NOW()),
        ('c6666666-6666-6666-6666-666666666662', '550e8400-e29b-41d4-a716-446655440001', '66666666-6666-6666-6666-666666666666', 'Susan', 'Taylor', 'susan.taylor@retailmax.com', 'IT Manager', 'Technology', 'Manager', 'Gatekeeper', 'active', 'neutral', NOW() - INTERVAL '9 months', NOW()),
        
        -- FinanceFlow Corp contacts
        ('c7777777-7777-7777-7777-777777777771', '550e8400-e29b-41d4-a716-446655440001', '77777777-7777-7777-7777-777777777777', 'Patricia', 'White', 'patricia.white@financeflow.com', 'CFO', 'Finance', 'C-Level', 'Primary', 'active', 'champion', NOW() - INTERVAL '12 months', NOW()),
        ('c7777777-7777-7777-7777-777777777772', '550e8400-e29b-41d4-a716-446655440001', '77777777-7777-7777-7777-777777777777', 'Thomas', 'Martin', 'thomas.martin@financeflow.com', 'Finance Director', 'Finance', 'Director', 'Influencer', 'active', 'supporter', NOW() - INTERVAL '11 months', NOW());

        -- Create some contact groups
        INSERT INTO contact_groups (id, organization_id, name, description, color, created_at, updated_at) VALUES
        ('g1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440001', 'C-Level Executives', 'Senior leadership contacts across all accounts', '#FF6B6B', NOW(), NOW()),
        ('g2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440001', 'Technical Decision Makers', 'CTOs, VPs of Engineering, IT Directors', '#4ECDC4', NOW(), NOW()),
        ('g3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440001', 'Champions', 'Contacts with strong positive relationships', '#45B7D1', NOW(), NOW()),
        ('g4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440001', 'At Risk Contacts', 'Contacts from accounts with relationship concerns', '#FFA07A', NOW(), NOW());

        -- Add some group memberships
        INSERT INTO contact_group_memberships (contact_id, group_id, added_at) VALUES
        -- C-Level Executives
        ('c1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', NOW()),
        ('c2222222-2222-2222-2222-222222222221', 'g1111111-1111-1111-1111-111111111111', NOW()),
        ('c3333333-3333-3333-3333-333333333331', 'g1111111-1111-1111-1111-111111111111', NOW()),
        ('c4444444-4444-4444-4444-444444444441', 'g1111111-1111-1111-1111-111111111111', NOW()),
        ('c6666666-6666-6666-6666-666666666661', 'g1111111-1111-1111-1111-111111111111', NOW()),
        ('c7777777-7777-7777-7777-777777777771', 'g1111111-1111-1111-1111-111111111111', NOW()),
        
        -- Technical Decision Makers
        ('c1111111-1111-1111-1111-111111111111', 'g2222222-2222-2222-2222-222222222222', NOW()),
        ('c1111111-1111-1111-1111-111111111112', 'g2222222-2222-2222-2222-222222222222', NOW()),
        ('c4444444-4444-4444-4444-444444444442', 'g2222222-2222-2222-2222-222222222222', NOW()),
        ('c6666666-6666-6666-6666-666666666662', 'g2222222-2222-2222-2222-222222222222', NOW()),
        
        -- Champions
        ('c1111111-1111-1111-1111-111111111111', 'g3333333-3333-3333-3333-333333333333', NOW()),
        ('c2222222-2222-2222-2222-222222222221', 'g3333333-3333-3333-3333-333333333333', NOW()),
        ('c3333333-3333-3333-3333-333333333331', 'g3333333-3333-3333-3333-333333333333', NOW()),
        ('c7777777-7777-7777-7777-777777777771', 'g3333333-3333-3333-3333-333333333333', NOW()),
        
        -- At Risk Contacts
        ('c6666666-6666-6666-6666-666666666661', 'g4444444-4444-4444-4444-444444444444', NOW()),
        ('c6666666-6666-6666-6666-666666666662', 'g4444444-4444-4444-4444-444444444444', NOW());

        RAISE NOTICE 'Sample contacts and groups created successfully for organization 550e8400-e29b-41d4-a716-446655440001';
    ELSE
        RAISE NOTICE 'Organization 550e8400-e29b-41d4-a716-446655440001 not found. Please run the organization setup scripts first.';
    END IF;
END $$;

-- Show summary of what was created
SELECT 
    'Contacts' as table_name, COUNT(*) as records_added 
FROM contacts WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Contact Groups' as table_name, COUNT(*) as records_added 
FROM contact_groups WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'
UNION ALL
SELECT 
    'Group Memberships' as table_name, COUNT(*) as records_added 
FROM contact_group_memberships 
WHERE contact_id IN (SELECT id FROM contacts WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001');