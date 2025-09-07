-- Usage metrics daily aggregation script
-- This should be run as a daily cron job to aggregate usage data

CREATE OR REPLACE FUNCTION aggregate_daily_usage_metrics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
DECLARE
    product_record RECORD;
    metrics_data RECORD;
BEGIN
    -- Loop through all active tracking products
    FOR product_record IN 
        SELECT id, organization_id FROM usage_tracking_products WHERE is_active = true
    LOOP
        -- Calculate metrics for this product and date
        SELECT 
            product_record.id as product_id,
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
            
            -- Feature usage (count of different event types)
            jsonb_build_object(
                'page_views', SUM(us.page_views),
                'clicks', SUM(us.click_events),
                'forms', SUM(us.form_interactions),
                'scroll_engagement', COUNT(CASE WHEN us.scroll_depth_max > 0.5 THEN 1 END),
                'long_sessions', COUNT(CASE WHEN us.duration_seconds > 300 THEN 1 END) -- 5+ minutes
            ) as feature_usage,
            
            -- Top pages (limited to top 10)
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'page', ue.page_url,
                        'views', COUNT(*)
                    ) ORDER BY COUNT(*) DESC
                )
                FROM usage_events ue
                JOIN usage_sessions us2 ON us2.session_token = ue.session_id
                WHERE us2.product_id = product_record.id
                AND ue.event_type = 'page_view'
                AND ue.timestamp::date = target_date
                AND ue.page_url IS NOT NULL
                GROUP BY ue.page_url
                LIMIT 10
            ) as top_pages,
            
            -- Top referrers (limited to top 10)
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'referrer', us3.referrer,
                        'visits', COUNT(*)
                    ) ORDER BY COUNT(*) DESC
                )
                FROM usage_sessions us3
                WHERE us3.product_id = product_record.id
                AND us3.started_at::date = target_date
                AND us3.referrer IS NOT NULL
                AND us3.referrer != ''
                GROUP BY us3.referrer
                LIMIT 10
            ) as top_referrers
            
        INTO metrics_data
        FROM usage_sessions us
        JOIN user_fingerprints uf ON uf.id = us.fingerprint_id
        WHERE us.product_id = product_record.id
        AND us.started_at::date = target_date;
        
        -- Upsert the aggregated data
        INSERT INTO usage_metrics (
            product_id, recorded_at, unique_users, returning_users, new_users,
            total_sessions, avg_session_duration, bounce_rate,
            page_views, total_click_events, avg_scroll_depth, form_submissions,
            feature_usage, top_pages, top_referrers
        ) VALUES (
            metrics_data.product_id, metrics_data.recorded_at, 
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
            COALESCE(metrics_data.feature_usage, '{}'),
            COALESCE(metrics_data.top_pages, '[]'),
            COALESCE(metrics_data.top_referrers, '[]')
        )
        ON CONFLICT (product_id, recorded_at) 
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
            feature_usage = EXCLUDED.feature_usage,
            top_pages = EXCLUDED.top_pages,
            top_referrers = EXCLUDED.top_referrers;
            
        -- Update user fingerprint types based on behavior
        UPDATE user_fingerprints 
        SET user_type = CASE 
            WHEN session_count > 1 THEN 'returning'
            WHEN user_type = 'identified' THEN 'identified'
            ELSE 'anonymous'
        END,
        confidence_score = LEAST(
            confidence_score + (session_count * 0.05), -- Increase confidence with more sessions
            1.0
        )
        WHERE product_id = product_record.id
        AND last_seen::date = target_date;
        
        RAISE NOTICE 'Aggregated metrics for product % on %: % users, % sessions', 
            product_record.id, target_date, 
            COALESCE(metrics_data.unique_users, 0), 
            COALESCE(metrics_data.total_sessions, 0);
            
    END LOOP;
    
    -- Clean up old detailed events (keep only last 30 days for free tier)
    DELETE FROM usage_events 
    WHERE timestamp < CURRENT_DATE - INTERVAL '30 days'
    AND session_id IN (
        SELECT us.session_token FROM usage_sessions us
        JOIN usage_tracking_products utp ON utp.id = us.product_id
        JOIN organizations o ON o.id = utp.organization_id
        WHERE NOT (o.subscription LIKE '%premium%')
    );
    
    -- Clean up old sessions for free tier
    DELETE FROM usage_sessions 
    WHERE started_at < CURRENT_DATE - INTERVAL '30 days'
    AND product_id IN (
        SELECT utp.id FROM usage_tracking_products utp
        JOIN organizations o ON o.id = utp.organization_id
        WHERE NOT (o.subscription LIKE '%premium%')
    );
    
    RAISE NOTICE 'Completed daily aggregation for %', target_date;
END;
$$ LANGUAGE plpgsql;

-- Create a sample aggregation for demo purposes
DO $$
BEGIN
    -- Run aggregation for the last 7 days
    FOR i IN 0..6 LOOP
        PERFORM aggregate_daily_usage_metrics(CURRENT_DATE - i);
    END LOOP;
END $$;

COMMENT ON FUNCTION aggregate_daily_usage_metrics IS 'Daily aggregation function for usage metrics. Should be run as a cron job.';

-- Example cron job command (run this on your server):
-- 0 2 * * * psql $DATABASE_URL -c "SELECT aggregate_daily_usage_metrics();"