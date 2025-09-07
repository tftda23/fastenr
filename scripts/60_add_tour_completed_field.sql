-- Add tour_completed field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- Add index for better performance on tour queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_tour_completed 
ON user_profiles(tour_completed);

-- Comment explaining the field
COMMENT ON COLUMN user_profiles.tour_completed IS 'Whether the user has completed or skipped the welcome tour';