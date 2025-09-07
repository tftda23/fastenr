-- Add growth tracking fields to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS mrr numeric(12,2),
ADD COLUMN IF NOT EXISTS seat_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS growth_tracking_method text DEFAULT 'arr' CHECK (growth_tracking_method IN ('arr', 'mrr', 'seat_count')),
ADD COLUMN IF NOT EXISTS previous_arr numeric(12,2),
ADD COLUMN IF NOT EXISTS previous_mrr numeric(12,2),
ADD COLUMN IF NOT EXISTS previous_seat_count integer,
ADD COLUMN IF NOT EXISTS last_growth_update timestamp with time zone;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_growth_tracking_method ON accounts(growth_tracking_method);
CREATE INDEX IF NOT EXISTS idx_accounts_last_growth_update ON accounts(last_growth_update);

-- Create a table to track historical growth metrics
CREATE TABLE IF NOT EXISTS account_growth_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  recorded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  arr numeric(12,2),
  mrr numeric(12,2),
  seat_count integer,
  growth_tracking_method text NOT NULL,
  arr_growth_percentage numeric(5,2),
  mrr_growth_percentage numeric(5,2),
  seat_count_growth_percentage numeric(5,2),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on account_growth_history
ALTER TABLE account_growth_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for account_growth_history
CREATE POLICY "Users can access growth history in their organization" ON account_growth_history
  FOR ALL USING (
    organization_id = (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_account_growth_history_account_id ON account_growth_history(account_id);
CREATE INDEX IF NOT EXISTS idx_account_growth_history_recorded_at ON account_growth_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_account_growth_history_org_id ON account_growth_history(organization_id);

-- Create a function to automatically track growth when metrics are updated
CREATE OR REPLACE FUNCTION track_account_growth_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if growth-related fields have changed
  IF (OLD.arr IS DISTINCT FROM NEW.arr OR 
      OLD.mrr IS DISTINCT FROM NEW.mrr OR 
      OLD.seat_count IS DISTINCT FROM NEW.seat_count) THEN
    
    -- Calculate growth percentages
    DECLARE
      arr_growth numeric(5,2) := NULL;
      mrr_growth numeric(5,2) := NULL;
      seat_growth numeric(5,2) := NULL;
    BEGIN
      -- Calculate ARR growth percentage
      IF OLD.arr IS NOT NULL AND OLD.arr > 0 AND NEW.arr IS NOT NULL THEN
        arr_growth := ROUND(((NEW.arr - OLD.arr) / OLD.arr * 100)::numeric, 2);
      END IF;
      
      -- Calculate MRR growth percentage
      IF OLD.mrr IS NOT NULL AND OLD.mrr > 0 AND NEW.mrr IS NOT NULL THEN
        mrr_growth := ROUND(((NEW.mrr - OLD.mrr) / OLD.mrr * 100)::numeric, 2);
      END IF;
      
      -- Calculate seat count growth percentage
      IF OLD.seat_count IS NOT NULL AND OLD.seat_count > 0 AND NEW.seat_count IS NOT NULL THEN
        seat_growth := ROUND(((NEW.seat_count - OLD.seat_count)::numeric / OLD.seat_count::numeric * 100)::numeric, 2);
      END IF;
      
      -- Insert growth history record
      INSERT INTO account_growth_history (
        account_id,
        organization_id,
        arr,
        mrr,
        seat_count,
        growth_tracking_method,
        arr_growth_percentage,
        mrr_growth_percentage,
        seat_count_growth_percentage,
        notes
      ) VALUES (
        NEW.id,
        NEW.organization_id,
        NEW.arr,
        NEW.mrr,
        NEW.seat_count,
        NEW.growth_tracking_method,
        arr_growth,
        mrr_growth,
        seat_growth,
        'Automated growth tracking update'
      );
      
      -- Update previous values for next calculation
      NEW.previous_arr := OLD.arr;
      NEW.previous_mrr := OLD.mrr;
      NEW.previous_seat_count := OLD.seat_count;
      NEW.last_growth_update := timezone('utc'::text, now());
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically track growth changes
DROP TRIGGER IF EXISTS trigger_track_account_growth_changes ON accounts;
CREATE TRIGGER trigger_track_account_growth_changes
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION track_account_growth_changes();