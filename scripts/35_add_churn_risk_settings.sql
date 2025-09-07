-- Add churn risk configuration fields to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS churn_risk_template TEXT DEFAULT 'balanced' CHECK (churn_risk_template IN ('balanced', 'contract_focused', 'usage_focused', 'custom')),
ADD COLUMN IF NOT EXISTS churn_risk_contract_weight INTEGER DEFAULT 40 CHECK (churn_risk_contract_weight >= 0 AND churn_risk_contract_weight <= 100),
ADD COLUMN IF NOT EXISTS churn_risk_usage_weight INTEGER DEFAULT 25 CHECK (churn_risk_usage_weight >= 0 AND churn_risk_usage_weight <= 100),
ADD COLUMN IF NOT EXISTS churn_risk_relationship_weight INTEGER DEFAULT 20 CHECK (churn_risk_relationship_weight >= 0 AND churn_risk_relationship_weight <= 100),
ADD COLUMN IF NOT EXISTS churn_risk_satisfaction_weight INTEGER DEFAULT 15 CHECK (churn_risk_satisfaction_weight >= 0 AND churn_risk_satisfaction_weight <= 100),
ADD COLUMN IF NOT EXISTS churn_risk_time_horizon INTEGER DEFAULT 90 CHECK (churn_risk_time_horizon IN (30, 60, 90));

-- Add comment to document the new fields
COMMENT ON COLUMN app_settings.churn_risk_template IS 'Template for churn risk calculation: balanced, contract_focused, usage_focused, or custom';
COMMENT ON COLUMN app_settings.churn_risk_contract_weight IS 'Weight percentage for contract-related risk factors (renewal dates, payment issues)';
COMMENT ON COLUMN app_settings.churn_risk_usage_weight IS 'Weight percentage for usage-related risk factors (declining usage, adoption issues)';
COMMENT ON COLUMN app_settings.churn_risk_relationship_weight IS 'Weight percentage for relationship risk factors (engagement decline, stakeholder changes)';
COMMENT ON COLUMN app_settings.churn_risk_satisfaction_weight IS 'Weight percentage for satisfaction risk factors (NPS detractors, support issues)';
COMMENT ON COLUMN app_settings.churn_risk_time_horizon IS 'Time horizon in days for churn risk prediction (30, 60, or 90 days)';

-- Update existing organizations with default churn risk settings
UPDATE app_settings 
SET 
  churn_risk_template = 'balanced',
  churn_risk_contract_weight = 40,
  churn_risk_usage_weight = 25,
  churn_risk_relationship_weight = 20,
  churn_risk_satisfaction_weight = 15,
  churn_risk_time_horizon = 90,
  updated_at = NOW()
WHERE 
  churn_risk_template IS NULL;