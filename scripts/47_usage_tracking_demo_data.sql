-- Demo data for usage tracking system
-- Creates sample tracking products and simulated usage data

DO $$
DECLARE
    org_id uuid;
    product_1 uuid;
    product_2 uuid;
    fingerprint_1 uuid;
    fingerprint_2 uuid;
    fingerprint_3 uuid;
    session_1 uuid;
    session_2 uuid;
    session_3 uuid;
    i integer;
    demo_date date;
BEGIN
    -- Get the first organization for demo
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Skipping demo data creation.';
        RETURN;
    END IF;

    -- Create demo tracking products
    INSERT INTO usage_tracking_products (
        organization_id, name, domain, is_active,
        track_page_views, track_click_events, track_form_interactions, track_scroll_depth
    ) VALUES 
    (org_id, 'Main Web App', 'myapp.com', true, true, true, true, true),
    (org_id, 'Marketing Site', 'myapp.com/marketing', true, true, true, false, true)
    RETURNING id INTO product_1;
    
    -- Get the second product ID
    SELECT id INTO product_2 FROM usage_tracking_products 
    WHERE organization_id = org_id AND name = 'Marketing Site';

    -- Create sample user fingerprints
    INSERT INTO user_fingerprints (
        product_id, fingerprint_hash, browser_fingerprint, behavioral_signature,
        user_type, confidence_score, first_seen, last_seen, session_count, total_time_spent
    ) VALUES
    (product_1, 'fp_user_001', 
     '{"screen":{"width":1920,"height":1080},"timezone":"America/New_York","language":"en-US"}',
     '{"avgClickInterval":1500,"avgScrollSpeed":0.1}',
     'returning', 0.9, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 hour', 12, 3600),
    (product_1, 'fp_user_002',
     '{"screen":{"width":1366,"height":768},"timezone":"Europe/London","language":"en-GB"}',
     '{"avgClickInterval":2000,"avgScrollSpeed":0.05}',
     'anonymous', 0.7, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', 5, 1800),
    (product_1, 'fp_user_003',
     '{"screen":{"width":390,"height":844},"timezone":"America/Los_Angeles","language":"en-US"}',
     '{"avgClickInterval":1200,"avgScrollSpeed":0.15}',
     'identified', 1.0, NOW() - INTERVAL '5 days', NOW() - INTERVAL '30 minutes', 8, 2400)
    RETURNING id INTO fingerprint_1;
    
    -- Get other fingerprint IDs
    SELECT id INTO fingerprint_2 FROM user_fingerprints WHERE fingerprint_hash = 'fp_user_002';
    SELECT id INTO fingerprint_3 FROM user_fingerprints WHERE fingerprint_hash = 'fp_user_003';
    
    -- Update the identified user with some details
    UPDATE user_fingerprints 
    SET user_email = 'demo.user@example.com', user_name = 'Demo User'
    WHERE id = fingerprint_3;

    -- Create sample sessions for the last 7 days
    FOR i IN 0..6 LOOP
        demo_date := CURRENT_DATE - i;
        
        -- Session 1: Power user
        session_1 := gen_random_uuid();
        INSERT INTO usage_sessions (
            id, product_id, fingerprint_id, session_token, started_at, ended_at,
            duration_seconds, user_agent, referrer, landing_page, exit_page,
            page_views, click_events, scroll_depth_max, form_interactions,
            country_code, region, city
        ) VALUES (
            session_1, product_1, fingerprint_1, session_1::text,
            demo_date + INTERVAL '9 hours' + (random() * INTERVAL '2 hours'),
            demo_date + INTERVAL '9 hours' + (random() * INTERVAL '2 hours') + INTERVAL '20 minutes',
            1200 + (random() * 600)::integer, -- 20-30 minutes
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            CASE WHEN random() > 0.5 THEN 'https://google.com' ELSE '' END,
            '/dashboard',
            '/settings',
            15 + (random() * 10)::integer, -- 15-25 page views
            30 + (random() * 20)::integer, -- 30-50 clicks
            0.8 + (random() * 0.2), -- 80-100% scroll depth
            2 + (random() * 3)::integer, -- 2-5 form interactions
            'US', 'NY', 'New York'
        );
        
        -- Session 2: Casual user
        session_2 := gen_random_uuid();
        INSERT INTO usage_sessions (
            id, product_id, fingerprint_id, session_token, started_at, ended_at,
            duration_seconds, user_agent, referrer, landing_page, exit_page,
            page_views, click_events, scroll_depth_max, form_interactions,
            country_code, region, city
        ) VALUES (
            session_2, product_1, fingerprint_2, session_2::text,
            demo_date + INTERVAL '14 hours' + (random() * INTERVAL '3 hours'),
            demo_date + INTERVAL '14 hours' + (random() * INTERVAL '3 hours') + INTERVAL '5 minutes',
            300 + (random() * 300)::integer, -- 5-10 minutes
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
            'https://twitter.com',
            '/',
            '/pricing',
            3 + (random() * 5)::integer, -- 3-8 page views
            5 + (random() * 10)::integer, -- 5-15 clicks
            0.3 + (random() * 0.4), -- 30-70% scroll depth
            (random() * 2)::integer, -- 0-2 form interactions
            'GB', 'England', 'London'
        );
        
        -- Session 3: Mobile user (every other day)
        IF i % 2 = 0 THEN
            session_3 := gen_random_uuid();
            INSERT INTO usage_sessions (
                id, product_id, fingerprint_id, session_token, started_at, ended_at,
                duration_seconds, user_agent, referrer, landing_page, exit_page,
                page_views, click_events, scroll_depth_max, form_interactions,
                country_code, region, city
            ) VALUES (
                session_3, product_1, fingerprint_3, session_3::text,
                demo_date + INTERVAL '19 hours' + (random() * INTERVAL '2 hours'),
                demo_date + INTERVAL '19 hours' + (random() * INTERVAL '2 hours') + INTERVAL '8 minutes',
                480 + (random() * 240)::integer, -- 8-12 minutes
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
                'https://linkedin.com',
                '/mobile-app',
                '/contact',
                8 + (random() * 6)::integer, -- 8-14 page views
                12 + (random() * 15)::integer, -- 12-27 clicks
                0.5 + (random() * 0.3), -- 50-80% scroll depth
                1 + (random() * 2)::integer, -- 1-3 form interactions
                'US', 'CA', 'Los Angeles'
            );
        END IF;
        
        -- Create some sample events for each session
        -- Page view events
        FOR j IN 1..(3 + (random() * 5)::integer) LOOP
            INSERT INTO usage_events (
                session_id, event_type, event_name, page_url, event_data, timestamp
            ) VALUES (
                session_1::text, 'page_view', NULL,
                CASE 
                    WHEN j = 1 THEN '/dashboard'
                    WHEN j = 2 THEN '/accounts'
                    WHEN j = 3 THEN '/contacts'
                    WHEN j = 4 THEN '/engagements'
                    ELSE '/settings'
                END,
                '{"title":"Page Title"}',
                demo_date + INTERVAL '9 hours' + (j * INTERVAL '2 minutes')
            );
        END LOOP;
        
        -- Click events
        FOR j IN 1..(5 + (random() * 10)::integer) LOOP
            INSERT INTO usage_events (
                session_id, event_type, element_selector, event_data, timestamp
            ) VALUES (
                session_1::text, 'click', 
                CASE 
                    WHEN random() > 0.5 THEN '.btn-primary'
                    WHEN random() > 0.7 THEN '#nav-menu'
                    ELSE '.card-link'
                END,
                jsonb_build_object('x', (random() * 1920)::integer, 'y', (random() * 1080)::integer),
                demo_date + INTERVAL '9 hours' + (j * INTERVAL '90 seconds')
            );
        END LOOP;
    END LOOP;
    
    -- Run the aggregation function to create metrics
    PERFORM aggregate_daily_usage_metrics(CURRENT_DATE - 1);
    PERFORM aggregate_daily_usage_metrics(CURRENT_DATE - 2);
    PERFORM aggregate_daily_usage_metrics(CURRENT_DATE - 3);
    
    RAISE NOTICE 'Created demo usage tracking data with % products, % fingerprints, and sample sessions/events', 
        (SELECT COUNT(*) FROM usage_tracking_products WHERE organization_id = org_id),
        (SELECT COUNT(*) FROM user_fingerprints WHERE product_id IN (product_1, product_2));
        
END $$;