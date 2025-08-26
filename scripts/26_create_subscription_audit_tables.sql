-- Create subscription audit and billing tracking tables

-- Subscription changes audit log
CREATE TABLE IF NOT EXISTS subscription_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'seat_cap_change', 'plan_change', 'trial_extended', etc.
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Additional context like IP, user agent, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Billing events for proper cost calculation
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'seat_change', 'trial_start', 'trial_end', 'plan_change'
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_audit_org_id ON subscription_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_created_at ON subscription_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_org_id ON billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_effective_date ON billing_events(effective_date);

-- Enable RLS
ALTER TABLE subscription_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- RLS policies (users can only see their organization's data)
CREATE POLICY "Users can view their organization's subscription audit log" ON subscription_audit_log
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's billing events" ON billing_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Only admins can insert audit logs (handled by application)
CREATE POLICY "System can insert subscription audit logs" ON subscription_audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert billing events" ON billing_events
  FOR INSERT WITH CHECK (true);