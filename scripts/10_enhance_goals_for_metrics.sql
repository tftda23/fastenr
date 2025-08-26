-- Enhance customer_goals table to support metric-based goals
ALTER TABLE customer_goals 
ADD COLUMN IF NOT EXISTS metric_type TEXT CHECK (metric_type IN ('accounts', 'arr', 'nps', 'health_score', 'adoption', 'renewals', 'seat_count', 'custom')),
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT, -- e.g., 'dollars', 'percentage', 'count'
ADD COLUMN IF NOT EXISTS measurement_period TEXT CHECK (measurement_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES user_profiles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customer_goals_metric_type ON customer_goals(metric_type);
CREATE INDEX IF NOT EXISTS idx_customer_goals_account_metric ON customer_goals(account_id, metric_type);

-- Create a view for goal progress calculation
CREATE OR REPLACE VIEW goal_progress AS
SELECT 
  g.*,
  CASE 
    WHEN g.target_value > 0 THEN ROUND((g.current_value / g.target_value * 100)::numeric, 2)
    ELSE 0
  END as progress_percentage,
  CASE 
    WHEN g.current_value >= g.target_value THEN 'achieved'
    WHEN g.target_date < CURRENT_DATE THEN 'missed'
    WHEN g.target_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'at_risk'
    ELSE 'on_track'
  END as calculated_status
FROM customer_goals g;
