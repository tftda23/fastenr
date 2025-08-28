-- Add scheduling columns to surveys table
ALTER TABLE surveys 
ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_scheduled BOOLEAN DEFAULT FALSE,
ADD COLUMN template_type VARCHAR(50) DEFAULT 'custom',
ADD COLUMN contributes_to_health_score BOOLEAN DEFAULT FALSE;

-- Create survey_schedules table for recurring surveys
CREATE TABLE IF NOT EXISTS survey_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('once', 'weekly', 'monthly', 'quarterly')),
  next_run_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_surveys_scheduled_date ON surveys(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_surveys_is_scheduled ON surveys(is_scheduled);
CREATE INDEX IF NOT EXISTS idx_survey_schedules_next_run_date ON survey_schedules(next_run_date);
CREATE INDEX IF NOT EXISTS idx_survey_schedules_is_active ON survey_schedules(is_active);

-- Update template types for existing surveys
UPDATE surveys 
SET template_type = 'custom', 
    contributes_to_health_score = FALSE 
WHERE template_type IS NULL;