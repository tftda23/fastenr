-- Simple migration script for Supabase SQL Editor
-- Add subscription columns to organizations table

-- Add seat_cap column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS seat_cap INTEGER DEFAULT 10;

-- Add plan column  
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'premium';

-- Add trial_ends_at column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 months');

-- Add premium_addon column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS premium_addon BOOLEAN DEFAULT FALSE;

-- Update existing organizations with default values
UPDATE organizations 
SET 
  seat_cap = 10,
  plan = 'premium', 
  trial_ends_at = (NOW() + INTERVAL '3 months'),
  premium_addon = FALSE
WHERE seat_cap IS NULL OR plan IS NULL OR trial_ends_at IS NULL OR premium_addon IS NULL;