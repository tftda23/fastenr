-- Add subscription-related fields to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS seat_cap INTEGER DEFAULT 10;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'premium';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 months');
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS premium_addon BOOLEAN DEFAULT FALSE;

-- Update existing organizations to have default values
UPDATE organizations 
SET 
  seat_cap = COALESCE(seat_cap, 10),
  plan = COALESCE(plan, 'premium'),
  trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '3 months'),
  premium_addon = COALESCE(premium_addon, CASE WHEN COALESCE(seat_cap, 10) > 100 THEN true ELSE false END)
WHERE seat_cap IS NULL OR plan IS NULL OR trial_ends_at IS NULL OR premium_addon IS NULL;

-- Add constraints
ALTER TABLE organizations ADD CONSTRAINT seat_cap_positive CHECK (seat_cap > 0);
ALTER TABLE organizations ADD CONSTRAINT plan_valid CHECK (plan IN ('premium', 'premium_discount'));