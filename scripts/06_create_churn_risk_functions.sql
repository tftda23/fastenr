-- Function to calculate churn risk score
CREATE OR REPLACE FUNCTION calculate_churn_risk_score(account_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  risk_score INTEGER := 0;
  latest_nps INTEGER;
  health_score INTEGER;
  at_risk_goals INTEGER;
  days_since_last_engagement INTEGER;
  contract_days_remaining INTEGER;
BEGIN
  -- Get account health score
  SELECT a.health_score INTO health_score
  FROM accounts a WHERE a.id = account_uuid;
  
  -- Get latest NPS score (last 90 days)
  SELECT n.score INTO latest_nps
  FROM nps_surveys n
  WHERE n.account_id = account_uuid
    AND n.survey_date >= CURRENT_DATE - INTERVAL '90 days'
  ORDER BY n.survey_date DESC
  LIMIT 1;
  
  -- Count at-risk goals
  SELECT COUNT(*) INTO at_risk_goals
  FROM customer_goals g
  WHERE g.account_id = account_uuid
    AND g.status = 'at_risk';
  
  -- Days since last engagement
  SELECT COALESCE(CURRENT_DATE - MAX(DATE(e.completed_at)), 999) INTO days_since_last_engagement
  FROM engagements e
  WHERE e.account_id = account_uuid
    AND e.completed_at IS NOT NULL;
  
  -- Days until contract end
  SELECT COALESCE(a.contract_end_date - CURRENT_DATE, 999) INTO contract_days_remaining
  FROM accounts a WHERE a.id = account_uuid;
  
  -- Calculate risk score (0-100)
  risk_score := 0;
  
  -- Health score factor (inverse relationship)
  IF health_score IS NOT NULL THEN
    risk_score := risk_score + (100 - health_score) * 0.3;
  END IF;
  
  -- NPS factor (detractors = high risk)
  IF latest_nps IS NOT NULL THEN
    IF latest_nps <= 6 THEN
      risk_score := risk_score + 25;
    ELSIF latest_nps <= 8 THEN
      risk_score := risk_score + 10;
    END IF;
  END IF;
  
  -- At-risk goals factor
  risk_score := risk_score + (at_risk_goals * 15);
  
  -- Engagement recency factor
  IF days_since_last_engagement > 30 THEN
    risk_score := risk_score + 20;
  ELSIF days_since_last_engagement > 14 THEN
    risk_score := risk_score + 10;
  END IF;
  
  -- Contract expiration factor
  IF contract_days_remaining < 30 THEN
    risk_score := risk_score + 25;
  ELSIF contract_days_remaining < 90 THEN
    risk_score := risk_score + 15;
  END IF;
  
  -- Cap at 100
  IF risk_score > 100 THEN
    risk_score := 100;
  END IF;
  
  RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update all churn risk scores
CREATE OR REPLACE FUNCTION update_all_churn_risk_scores()
RETURNS VOID AS $$
BEGIN
  UPDATE accounts 
  SET churn_risk_score = calculate_churn_risk_score(id),
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update churn risk when related data changes
CREATE OR REPLACE FUNCTION trigger_update_churn_risk()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the account's churn risk score
  UPDATE accounts 
  SET churn_risk_score = calculate_churn_risk_score(
    CASE 
      WHEN TG_TABLE_NAME = 'accounts' THEN NEW.id
      ELSE NEW.account_id
    END
  ),
  updated_at = NOW()
  WHERE id = CASE 
    WHEN TG_TABLE_NAME = 'accounts' THEN NEW.id
    ELSE NEW.account_id
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_churn_risk_on_nps_change
  AFTER INSERT OR UPDATE ON nps_surveys
  FOR EACH ROW EXECUTE FUNCTION trigger_update_churn_risk();

CREATE TRIGGER update_churn_risk_on_goal_change
  AFTER INSERT OR UPDATE ON customer_goals
  FOR EACH ROW EXECUTE FUNCTION trigger_update_churn_risk();

CREATE TRIGGER update_churn_risk_on_engagement_change
  AFTER INSERT OR UPDATE ON engagements
  FOR EACH ROW EXECUTE FUNCTION trigger_update_churn_risk();

CREATE TRIGGER update_churn_risk_on_health_change
  AFTER UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION trigger_update_churn_risk();
