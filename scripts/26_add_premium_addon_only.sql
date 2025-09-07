-- Add just the premium_addon field if it doesn't exist
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS premium_addon BOOLEAN DEFAULT FALSE;

-- Update existing organizations to set premium_addon based on seat_cap
UPDATE organizations 
SET premium_addon = CASE WHEN COALESCE(seat_cap, 10) >= 100 THEN true ELSE false END
WHERE premium_addon IS NULL OR premium_addon = false;

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name = 'premium_addon';