-- Support Ticket Integration Schema
-- Stores aggregated support metrics from Intercom, Zendesk, Jira Service Management, Freshdesk

-- Support ticket metrics table
CREATE TABLE IF NOT EXISTS support_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('intercom', 'zendesk', 'jira', 'freshdesk')),
  metric_date date NOT NULL,
  
  -- Core metrics
  ticket_count integer DEFAULT 0,
  new_tickets integer DEFAULT 0,
  resolved_tickets integer DEFAULT 0,
  open_tickets integer DEFAULT 0,
  
  -- Quality metrics
  avg_resolution_time_hours numeric(10,2), -- Average time to resolve in hours
  avg_first_response_time_hours numeric(10,2), -- Average first response time
  escalated_tickets integer DEFAULT 0,
  
  -- Sentiment indicators
  satisfaction_score numeric(3,2), -- 1-5 scale if available
  negative_feedback_count integer DEFAULT 0,
  
  -- Calculated fields
  volume_trend text, -- 'increasing', 'decreasing', 'stable'
  severity_score integer DEFAULT 50 CHECK (severity_score >= 0 AND severity_score <= 100),
  
  -- Metadata
  last_sync_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(organization_id, account_id, provider, metric_date)
);

-- Enable RLS
ALTER TABLE support_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "support_metrics_org_isolation" ON support_metrics
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

-- Support integration configurations
CREATE TABLE IF NOT EXISTS support_integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('intercom', 'zendesk', 'jira', 'freshdesk')),
  
  -- Connection details
  status text DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  api_endpoint text,
  workspace_id text, -- For Intercom
  subdomain text, -- For Zendesk/Freshdesk
  project_key text, -- For Jira
  
  -- Authentication (encrypted)
  encrypted_token text,
  token_expires_at timestamp with time zone,
  
  -- Sync configuration
  account_mapping_field text DEFAULT 'domain', -- How to match tickets to accounts
  sync_enabled boolean DEFAULT true,
  sync_frequency_hours integer DEFAULT 24,
  last_sync_at timestamp with time zone,
  last_sync_status text,
  last_error text,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(organization_id, provider)
);

-- Enable RLS
ALTER TABLE support_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "support_integrations_org_isolation" ON support_integrations
  FOR ALL USING (
    organization_id = (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
    AND (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    ) IS NOT NULL
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_metrics_org_account_date ON support_metrics(organization_id, account_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_support_metrics_provider ON support_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_support_integrations_org_provider ON support_integrations(organization_id, provider);

-- Function to calculate support health score for an account
CREATE OR REPLACE FUNCTION calculate_support_health_score(
  p_account_id uuid,
  p_organization_id uuid,
  p_days_lookback integer DEFAULT 30
) RETURNS TABLE (
  support_score integer,
  ticket_volume_trend text,
  avg_resolution_time numeric,
  escalation_rate numeric,
  details jsonb
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_ticket_count integer := 0;
  v_avg_resolution numeric := 0;
  v_escalation_rate numeric := 0;
  v_trend text := 'stable';
  v_score integer := 50;
  v_current_period_tickets integer := 0;
  v_previous_period_tickets integer := 0;
BEGIN
  -- Get current period metrics (last p_days_lookback days)
  SELECT 
    COALESCE(SUM(ticket_count), 0),
    COALESCE(AVG(avg_resolution_time_hours), 0),
    COALESCE(AVG(CASE 
      WHEN ticket_count > 0 THEN (escalated_tickets::numeric / ticket_count::numeric) * 100 
      ELSE 0 
    END), 0)
  INTO v_current_period_tickets, v_avg_resolution, v_escalation_rate
  FROM support_metrics 
  WHERE account_id = p_account_id 
    AND organization_id = p_organization_id
    AND metric_date >= CURRENT_DATE - INTERVAL '%s days' % p_days_lookback;

  -- Get previous period for trend calculation
  SELECT COALESCE(SUM(ticket_count), 0)
  INTO v_previous_period_tickets
  FROM support_metrics 
  WHERE account_id = p_account_id 
    AND organization_id = p_organization_id
    AND metric_date >= CURRENT_DATE - INTERVAL '%s days' % (p_days_lookback * 2)
    AND metric_date < CURRENT_DATE - INTERVAL '%s days' % p_days_lookback;

  -- Calculate trend
  IF v_previous_period_tickets > 0 THEN
    IF v_current_period_tickets > v_previous_period_tickets * 1.2 THEN
      v_trend := 'increasing';
    ELSIF v_current_period_tickets < v_previous_period_tickets * 0.8 THEN
      v_trend := 'decreasing';
    ELSE
      v_trend := 'stable';
    END IF;
  END IF;

  -- Calculate support health score (0-100)
  v_score := 50; -- Base score

  -- Volume impact (fewer tickets = better, but too few might mean issues aren't being reported)
  IF v_current_period_tickets = 0 THEN
    v_score := v_score + 20; -- No support tickets is good
  ELSIF v_current_period_tickets <= 5 THEN
    v_score := v_score + 15; -- Low volume is good
  ELSIF v_current_period_tickets <= 15 THEN
    v_score := v_score + 5; -- Moderate volume
  ELSIF v_current_period_tickets <= 30 THEN
    v_score := v_score - 10; -- Higher volume concerning
  ELSE
    v_score := v_score - 25; -- Very high volume is bad
  END IF;

  -- Resolution time impact (faster = better)
  IF v_avg_resolution <= 4 THEN
    v_score := v_score + 15; -- Very fast resolution
  ELSIF v_avg_resolution <= 24 THEN
    v_score := v_score + 10; -- Good resolution time
  ELSIF v_avg_resolution <= 72 THEN
    v_score := v_score; -- Average resolution time
  ELSIF v_avg_resolution <= 168 THEN
    v_score := v_score - 15; -- Slow resolution
  ELSE
    v_score := v_score - 25; -- Very slow resolution
  END IF;

  -- Escalation rate impact (fewer escalations = better)
  IF v_escalation_rate <= 5 THEN
    v_score := v_score + 10; -- Low escalation rate
  ELSIF v_escalation_rate <= 15 THEN
    v_score := v_score + 5; -- Acceptable escalation rate
  ELSIF v_escalation_rate <= 30 THEN
    v_score := v_score - 10; -- High escalation rate
  ELSE
    v_score := v_score - 20; -- Very high escalation rate
  END IF;

  -- Trend impact
  IF v_trend = 'decreasing' THEN
    v_score := v_score + 10; -- Improving trend
  ELSIF v_trend = 'increasing' THEN
    v_score := v_score - 15; -- Worsening trend
  END IF;

  -- Ensure score is within bounds
  v_score := GREATEST(0, LEAST(100, v_score));

  RETURN QUERY SELECT
    v_score,
    v_trend,
    v_avg_resolution,
    v_escalation_rate,
    jsonb_build_object(
      'current_period_tickets', v_current_period_tickets,
      'previous_period_tickets', v_previous_period_tickets,
      'avg_resolution_hours', v_avg_resolution,
      'escalation_rate_percent', v_escalation_rate,
      'days_analyzed', p_days_lookback
    );
END;
$$;

-- Create sample data for testing (remove in production)
-- INSERT INTO support_metrics (organization_id, account_id, provider, metric_date, ticket_count, new_tickets, resolved_tickets, open_tickets, avg_resolution_time_hours)
-- VALUES 
--   ((SELECT id FROM organizations LIMIT 1), (SELECT id FROM accounts LIMIT 1), 'zendesk', CURRENT_DATE, 5, 5, 4, 1, 24.5),
--   ((SELECT id FROM organizations LIMIT 1), (SELECT id FROM accounts LIMIT 1), 'zendesk', CURRENT_DATE - 1, 3, 3, 3, 0, 18.0);

-- Verify the schema was created successfully
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'support_metrics') THEN
    RAISE EXCEPTION 'Failed to create support_metrics table';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'support_integrations') THEN
    RAISE EXCEPTION 'Failed to create support_integrations table';
  END IF;
  
  RAISE NOTICE 'Support integration schema created successfully';
END;
$$;