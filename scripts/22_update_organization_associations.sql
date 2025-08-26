-- Update all accounts and engagements to be associated with Acme Customer Success organization
-- Organization ID: 550e8400-e29b-41d4-a716-446655440001

-- First, ensure the organization exists
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Acme Customer Success',
  '2025-02-18 23:03:15.544871+00',
  '2025-08-18 23:03:15.544871+00'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = EXCLUDED.updated_at;

-- Update all accounts to use the Acme Customer Success organization
UPDATE accounts 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

-- Update all engagements to use the Acme Customer Success organization
UPDATE engagements 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

-- Update all related data to maintain consistency
UPDATE adoption_metrics 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE customer_goals 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE goal_progress 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE health_metrics 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE health_scores 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE nps_surveys 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE surveys 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE user_preferences 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

UPDATE user_profiles 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

-- Update API keys if any exist
UPDATE api_keys 
SET organization_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE organization_id IS NULL OR organization_id != '550e8400-e29b-41d4-a716-446655440001';

-- Display summary of updates
SELECT 
  'accounts' as table_name,
  COUNT(*) as records_updated
FROM accounts 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'

UNION ALL

SELECT 
  'engagements' as table_name,
  COUNT(*) as records_updated
FROM engagements 
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001'

UNION ALL

SELECT 
  'total_related_records' as table_name,
  (
    (SELECT COUNT(*) FROM adoption_metrics WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM customer_goals WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM goal_progress WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM health_metrics WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM health_scores WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM nps_surveys WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM surveys WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM user_preferences WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001') +
    (SELECT COUNT(*) FROM api_keys WHERE organization_id = '550e8400-e29b-41d4-a716-446655440001')
  ) as records_updated;
