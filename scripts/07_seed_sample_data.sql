-- Insert sample organization
INSERT INTO organizations (id, name, slug) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Acme Customer Success', 'acme-cs');

-- Insert sample user profile (you'll need to create this user in Supabase Auth first)
-- This is just for reference - actual user creation happens through auth
INSERT INTO user_profiles (id, organization_id, email, full_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@acme-cs.com', 'Admin User', 'admin');

-- Insert sample accounts
INSERT INTO accounts (organization_id, name, domain, industry, size, arr, contract_start_date, contract_end_date, status, health_score) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'TechCorp Inc', 'techcorp.com', 'Technology', 'medium', 50000.00, '2024-01-01', '2024-12-31', 'active', 75),
('550e8400-e29b-41d4-a716-446655440000', 'StartupXYZ', 'startupxyz.com', 'SaaS', 'startup', 12000.00, '2024-03-01', '2025-02-28', 'active', 60),
('550e8400-e29b-41d4-a716-446655440000', 'Enterprise Solutions', 'enterprise-sol.com', 'Consulting', 'large', 150000.00, '2023-06-01', '2024-05-31', 'at_risk', 35);

-- Insert sample engagements
INSERT INTO engagements (organization_id, account_id, user_id, type, title, description, outcome, completed_at, duration_minutes) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  a.id,
  '550e8400-e29b-41d4-a716-446655440001',
  'meeting',
  'Quarterly Business Review',
  'Discussed goals and progress for Q1',
  'positive',
  NOW() - INTERVAL '7 days',
  60
FROM accounts a WHERE a.name = 'TechCorp Inc';

-- Insert sample NPS surveys
INSERT INTO nps_surveys (organization_id, account_id, score, feedback, respondent_name) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  a.id,
  8,
  'Great product, could use better documentation',
  'John Smith'
FROM accounts a WHERE a.name = 'TechCorp Inc';

-- Insert sample goals
INSERT INTO customer_goals (organization_id, account_id, title, description, target_value, current_value, unit, status, due_date) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  a.id,
  'Increase user adoption',
  'Get 80% of employees actively using the platform',
  80,
  45,
  'percentage',
  'on_track',
  '2024-06-30'
FROM accounts a WHERE a.name = 'TechCorp Inc';

-- Update churn risk scores for all accounts
SELECT update_all_churn_risk_scores();
