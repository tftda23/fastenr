-- Enhance engagements table for calendar functionality
ALTER TABLE engagements 
ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Update existing records to set end_time based on scheduled_at + duration
UPDATE engagements 
SET end_time = scheduled_at + INTERVAL '1 minute' * COALESCE(duration_minutes, 60)
WHERE scheduled_at IS NOT NULL AND end_time IS NULL;

-- Create index for calendar queries
CREATE INDEX IF NOT EXISTS idx_engagements_scheduled_at_range ON engagements(scheduled_at, end_time);
CREATE INDEX IF NOT EXISTS idx_engagements_is_all_day ON engagements(is_all_day);

-- Add comment for clarity
COMMENT ON COLUMN engagements.is_all_day IS 'True for all-day events, false for timed events';
COMMENT ON COLUMN engagements.end_time IS 'End time calculated from scheduled_at + duration or explicitly set';