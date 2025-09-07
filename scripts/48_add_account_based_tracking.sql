-- Update usage tracking schema to support account-based tracking for multi-tenant applications

-- Add account tracking to tracking products
ALTER TABLE usage_tracking_products ADD COLUMN IF NOT EXISTS 
    track_by_account BOOLEAN DEFAULT false;

-- Create account tracking relationships
CREATE TABLE IF NOT EXISTS usage_tracked_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES usage_tracking_products(id) ON DELETE CASCADE,
    
    -- Account identification (multiple methods supported)
    account_id TEXT, -- Customer's internal account ID
    account_domain TEXT, -- Account domain/subdomain
    account_name TEXT, -- Human readable account name
    custom_identifier TEXT, -- Any custom identifier
    
    -- Fastenr account relationship (if tracking Fastenr accounts)
    fastenr_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Ensure one tracking setup per account per product
    UNIQUE(product_id, account_id),
    UNIQUE(product_id, account_domain),
    UNIQUE(product_id, fastenr_account_id),
    
    -- At least one identifier must be provided
    CONSTRAINT account_identifier_required CHECK (
        account_id IS NOT NULL OR 
        account_domain IS NOT NULL OR 
        custom_identifier IS NOT NULL OR 
        fastenr_account_id IS NOT NULL
    )
);

-- Add account context to user fingerprints
ALTER TABLE user_fingerprints ADD COLUMN IF NOT EXISTS 
    tracked_account_id UUID REFERENCES usage_tracked_accounts(id) ON DELETE CASCADE;

-- Add account context to usage sessions
ALTER TABLE usage_sessions ADD COLUMN IF NOT EXISTS 
    tracked_account_id UUID REFERENCES usage_tracked_accounts(id) ON DELETE CASCADE;

-- Update usage metrics to support account-level aggregation
ALTER TABLE usage_metrics ADD COLUMN IF NOT EXISTS 
    tracked_account_id UUID REFERENCES usage_tracked_accounts(id) ON DELETE CASCADE;

-- Update the unique constraint on usage_metrics to include account
ALTER TABLE usage_metrics DROP CONSTRAINT IF EXISTS usage_metrics_product_id_recorded_at_key;
CREATE UNIQUE INDEX IF NOT EXISTS usage_metrics_unique_idx 
    ON usage_metrics(product_id, recorded_at, tracked_account_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_accounts_product ON usage_tracked_accounts(product_id);
CREATE INDEX IF NOT EXISTS idx_tracked_accounts_fastenr_account ON usage_tracked_accounts(fastenr_account_id);
CREATE INDEX IF NOT EXISTS idx_fingerprints_tracked_account ON user_fingerprints(tracked_account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tracked_account ON usage_sessions(tracked_account_id);
CREATE INDEX IF NOT EXISTS idx_metrics_tracked_account ON usage_metrics(tracked_account_id);

-- Enable RLS
ALTER TABLE usage_tracked_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tracked accounts
CREATE POLICY "Users can access tracked accounts for their products" ON usage_tracked_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usage_tracking_products p 
            WHERE p.id = usage_tracked_accounts.product_id 
            AND p.organization_id = (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

-- Update aggregation function to support account-level metrics
CREATE OR REPLACE FUNCTION aggregate_daily_usage_metrics_by_account(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
DECLARE
    product_record RECORD;
    account_record RECORD;
    metrics_data RECORD;
BEGIN
    -- Loop through all active tracking products
    FOR product_record IN 
        SELECT id, organization_id, track_by_account FROM usage_tracking_products WHERE is_active = true
    LOOP
        IF product_record.track_by_account THEN
            -- Account-based tracking
            FOR account_record IN 
                SELECT id FROM usage_tracked_accounts 
                WHERE product_id = product_record.id AND is_active = true
            LOOP
                -- Calculate metrics for this account and date
                SELECT 
                    product_record.id as product_id,
                    account_record.id as tracked_account_id,
                    target_date as recorded_at,
                    
                    -- User metrics
                    COUNT(DISTINCT uf.id) as unique_users,
                    COUNT(DISTINCT CASE WHEN uf.user_type = 'returning' OR uf.session_count > 1 THEN uf.id END) as returning_users,
                    COUNT(DISTINCT CASE WHEN uf.first_seen::date = target_date THEN uf.id END) as new_users,
                    
                    -- Session metrics
                    COUNT(us.id) as total_sessions,
                    COALESCE(AVG(us.duration_seconds), 0) as avg_session_duration,
                    COALESCE(AVG(CASE WHEN us.page_views <= 1 THEN 1.0 ELSE 0.0 END), 0) as bounce_rate,
                    
                    -- Engagement metrics
                    SUM(us.page_views) as page_views,
                    SUM(us.click_events) as total_click_events,
                    COALESCE(AVG(us.scroll_depth_max), 0) as avg_scroll_depth,
                    SUM(us.form_interactions) as form_submissions,
                    
                    -- Feature usage
                    jsonb_build_object(
                        'page_views', SUM(us.page_views),
                        'clicks', SUM(us.click_events),
                        'forms', SUM(us.form_interactions),
                        'scroll_engagement', COUNT(CASE WHEN us.scroll_depth_max > 0.5 THEN 1 END),
                        'long_sessions', COUNT(CASE WHEN us.duration_seconds > 300 THEN 1 END)
                    ) as feature_usage
                    
                INTO metrics_data
                FROM usage_sessions us
                JOIN user_fingerprints uf ON uf.id = us.fingerprint_id
                WHERE us.product_id = product_record.id
                AND us.tracked_account_id = account_record.id
                AND us.started_at::date = target_date;
                
                -- Upsert the aggregated data
                INSERT INTO usage_metrics (
                    product_id, tracked_account_id, recorded_at, unique_users, returning_users, new_users,
                    total_sessions, avg_session_duration, bounce_rate,
                    page_views, total_click_events, avg_scroll_depth, form_submissions,
                    feature_usage
                ) VALUES (
                    metrics_data.product_id, metrics_data.tracked_account_id, metrics_data.recorded_at,
                    COALESCE(metrics_data.unique_users, 0),
                    COALESCE(metrics_data.returning_users, 0),
                    COALESCE(metrics_data.new_users, 0),
                    COALESCE(metrics_data.total_sessions, 0),
                    COALESCE(metrics_data.avg_session_duration, 0),
                    COALESCE(metrics_data.bounce_rate, 0),
                    COALESCE(metrics_data.page_views, 0),
                    COALESCE(metrics_data.total_click_events, 0),
                    COALESCE(metrics_data.avg_scroll_depth, 0),
                    COALESCE(metrics_data.form_submissions, 0),
                    COALESCE(metrics_data.feature_usage, '{}')
                )
                ON CONFLICT (product_id, recorded_at, tracked_account_id) 
                DO UPDATE SET
                    unique_users = EXCLUDED.unique_users,
                    returning_users = EXCLUDED.returning_users,
                    new_users = EXCLUDED.new_users,
                    total_sessions = EXCLUDED.total_sessions,
                    avg_session_duration = EXCLUDED.avg_session_duration,
                    bounce_rate = EXCLUDED.bounce_rate,
                    page_views = EXCLUDED.page_views,
                    total_click_events = EXCLUDED.total_click_events,
                    avg_scroll_depth = EXCLUDED.avg_scroll_depth,
                    form_submissions = EXCLUDED.form_submissions,
                    feature_usage = EXCLUDED.feature_usage;
                    
            END LOOP;
        ELSE
            -- Product-level tracking (existing functionality)
            PERFORM aggregate_daily_usage_metrics(target_date);
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Completed account-based daily aggregation for %', target_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE usage_tracked_accounts IS 'Account relationships for multi-tenant usage tracking';
COMMENT ON FUNCTION aggregate_daily_usage_metrics_by_account IS 'Daily aggregation function for account-based usage metrics';

-- Create some demo tracked accounts for testing
DO $$
DECLARE
    product_id uuid;
    demo_account_1 uuid;
    demo_account_2 uuid;
    fastenr_account_1 uuid;
    fastenr_account_2 uuid;
BEGIN
    -- Get a demo product
    SELECT id INTO product_id FROM usage_tracking_products LIMIT 1;
    
    -- Get some Fastenr accounts for demo
    SELECT id INTO fastenr_account_1 FROM accounts LIMIT 1 OFFSET 0;
    SELECT id INTO fastenr_account_2 FROM accounts LIMIT 1 OFFSET 1;
    
    IF product_id IS NOT NULL AND fastenr_account_1 IS NOT NULL THEN
        -- Update the product to use account-based tracking
        UPDATE usage_tracking_products 
        SET track_by_account = true 
        WHERE id = product_id;
        
        -- Create demo tracked accounts
        INSERT INTO usage_tracked_accounts (
            product_id, account_id, account_name, fastenr_account_id
        ) VALUES 
        (product_id, 'demo_account_001', 'Demo Company A', fastenr_account_1),
        (product_id, 'demo_account_002', 'Demo Company B', fastenr_account_2)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created demo tracked accounts for product %', product_id;
    END IF;
END $$;