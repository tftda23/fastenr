-- Add health score configuration columns to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS health_score_template VARCHAR(50) DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS health_score_engagement_weight INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS health_score_nps_weight INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS health_score_activity_weight INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS health_score_growth_weight INTEGER DEFAULT 20;

-- Add check constraint to ensure template values are valid
ALTER TABLE app_settings 
ADD CONSTRAINT check_health_score_template 
CHECK (health_score_template IN ('balanced', 'engagement_focused', 'satisfaction_focused', 'custom'));

-- Add check constraints to ensure weights are between 0 and 100
ALTER TABLE app_settings 
ADD CONSTRAINT check_engagement_weight CHECK (health_score_engagement_weight >= 0 AND health_score_engagement_weight <= 100),
ADD CONSTRAINT check_nps_weight CHECK (health_score_nps_weight >= 0 AND health_score_nps_weight <= 100),
ADD CONSTRAINT check_activity_weight CHECK (health_score_activity_weight >= 0 AND health_score_activity_weight <= 100),
ADD CONSTRAINT check_growth_weight CHECK (health_score_growth_weight >= 0 AND health_score_growth_weight <= 100);

-- Update existing records to have default health score settings
UPDATE app_settings 
SET 
  health_score_template = 'balanced',
  health_score_engagement_weight = 30,
  health_score_nps_weight = 25,
  health_score_activity_weight = 25,
  health_score_growth_weight = 20
WHERE health_score_template IS NULL;