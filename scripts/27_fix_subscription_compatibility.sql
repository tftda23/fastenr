-- Fix subscription system compatibility
-- This script ensures the subscription system works regardless of current database state

-- First, check if the subscription columns exist and add them if missing
DO $$ 
BEGIN
    -- Add seat_cap column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'seat_cap') THEN
        ALTER TABLE organizations ADD COLUMN seat_cap INTEGER DEFAULT 10;
    END IF;
    
    -- Add plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'plan') THEN
        ALTER TABLE organizations ADD COLUMN plan TEXT DEFAULT 'premium';
    END IF;
    
    -- Add trial_ends_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 months');
    END IF;
    
    -- Add premium_addon column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'premium_addon') THEN
        ALTER TABLE organizations ADD COLUMN premium_addon BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update any existing organizations that have NULL values
UPDATE organizations 
SET 
  seat_cap = COALESCE(seat_cap, 10),
  plan = COALESCE(plan, 'premium'),
  trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '3 months'),
  premium_addon = COALESCE(premium_addon, CASE WHEN COALESCE(seat_cap, 10) > 100 THEN true ELSE false END)
WHERE seat_cap IS NULL OR plan IS NULL OR trial_ends_at IS NULL OR premium_addon IS NULL;

-- Add constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'seat_cap_positive') THEN
        ALTER TABLE organizations ADD CONSTRAINT seat_cap_positive CHECK (seat_cap > 0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'plan_valid') THEN
        ALTER TABLE organizations ADD CONSTRAINT plan_valid CHECK (plan IN ('premium', 'premium_discount'));
    END IF;
END $$;

-- Ensure RLS is disabled (as per script 18)
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Create audit tables if they don't exist (from script 26)
CREATE TABLE IF NOT EXISTS subscription_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  seat_count INTEGER NOT NULL,
  plan TEXT NOT NULL,
  base_cost_per_seat DECIMAL(10,2) NOT NULL,
  premium_addon_cost_per_seat DECIMAL(10,2) DEFAULT 0,
  total_monthly_cost DECIMAL(10,2) NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_active BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscription_audit_org_id ON subscription_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_created_at ON subscription_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_org_id ON billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_effective_date ON billing_events(effective_date);

-- Disable RLS on audit tables for simplicity
ALTER TABLE subscription_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events DISABLE ROW LEVEL SECURITY;