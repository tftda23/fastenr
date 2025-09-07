-- Create usage tracking schema for innovative per-user metrics

-- Usage tracking products (each product/app being tracked)
CREATE TABLE IF NOT EXISTS usage_tracking_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    tracking_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ,
    
    -- Configuration
    track_page_views BOOLEAN DEFAULT true,
    track_click_events BOOLEAN DEFAULT true,
    track_form_interactions BOOLEAN DEFAULT true,
    track_scroll_depth BOOLEAN DEFAULT true,
    
    -- Domain whitelist for security
    allowed_domains TEXT[],
    
    UNIQUE(organization_id, name)
);

-- User fingerprints (innovative user identification)
CREATE TABLE IF NOT EXISTS user_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES usage_tracking_products(id) ON DELETE CASCADE,
    
    -- Primary identifier (hash of multiple factors)
    fingerprint_hash TEXT NOT NULL,
    
    -- Fingerprinting components
    browser_fingerprint JSONB, -- screen, timezone, language, plugins, etc.
    behavioral_signature JSONB, -- scroll patterns, click patterns, typing rhythm
    session_persistence JSONB, -- localStorage tokens, session data
    
    -- User classification
    user_type TEXT DEFAULT 'anonymous' CHECK (user_type IN ('anonymous', 'identified', 'returning')),
    confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    -- Tracking
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    session_count INTEGER DEFAULT 1,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    
    -- Optional user info (if they identify themselves later)
    user_email TEXT,
    user_name TEXT,
    custom_user_id TEXT,
    
    UNIQUE(product_id, fingerprint_hash)
);

-- Usage sessions (each visit/session)
CREATE TABLE IF NOT EXISTS usage_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES usage_tracking_products(id) ON DELETE CASCADE,
    fingerprint_id UUID NOT NULL REFERENCES user_fingerprints(id) ON DELETE CASCADE,
    
    -- Session info
    session_token TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Technical details
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    
    -- Engagement metrics
    page_views INTEGER DEFAULT 0,
    click_events INTEGER DEFAULT 0,
    scroll_depth_max FLOAT DEFAULT 0.0,
    form_interactions INTEGER DEFAULT 0,
    
    UNIQUE(product_id, session_token)
);

-- Usage events (individual interactions)
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL, -- References session_token
    
    -- Event details
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'scroll', 'form', 'custom'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Context
    page_url TEXT,
    element_selector TEXT,
    event_name TEXT,
    event_data JSONB
);

-- Aggregated usage metrics (daily rollups)
CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES usage_tracking_products(id) ON DELETE CASCADE,
    recorded_at DATE NOT NULL,
    
    -- User metrics
    unique_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Session metrics
    total_sessions INTEGER DEFAULT 0,
    avg_session_duration FLOAT DEFAULT 0.0,
    bounce_rate FLOAT DEFAULT 0.0, -- Sessions with <= 1 page view
    
    -- Engagement metrics
    page_views INTEGER DEFAULT 0,
    total_click_events INTEGER DEFAULT 0,
    avg_scroll_depth FLOAT DEFAULT 0.0,
    form_submissions INTEGER DEFAULT 0,
    
    -- Feature usage (JSONB for flexibility)
    feature_usage JSONB DEFAULT '{}',
    
    UNIQUE(product_id, recorded_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fingerprints_product_hash ON user_fingerprints(product_id, fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_fingerprints_last_seen ON user_fingerprints(last_seen);
CREATE INDEX IF NOT EXISTS idx_sessions_product_started ON usage_sessions(product_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON usage_sessions(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_events_session_timestamp ON usage_events(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_product_date ON usage_metrics(product_id, recorded_at);

-- Enable RLS on all tables
ALTER TABLE usage_tracking_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their organization's tracking products" ON usage_tracking_products
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can access fingerprints for their products" ON user_fingerprints
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usage_tracking_products p 
            WHERE p.id = user_fingerprints.product_id 
            AND p.organization_id = (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access sessions for their products" ON usage_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usage_tracking_products p 
            WHERE p.id = usage_sessions.product_id 
            AND p.organization_id = (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access events for their products" ON usage_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usage_sessions s
            JOIN usage_tracking_products p ON p.id = s.product_id
            WHERE s.session_token = usage_events.session_id
            AND p.organization_id = (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can access metrics for their products" ON usage_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usage_tracking_products p 
            WHERE p.id = usage_metrics.product_id 
            AND p.organization_id = (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            )
        )
    );

COMMENT ON TABLE usage_tracking_products IS 'Products/applications being tracked for usage analytics';
COMMENT ON TABLE user_fingerprints IS 'Innovative user identification through digital fingerprinting';
COMMENT ON TABLE usage_sessions IS 'Individual user sessions and engagement data';
COMMENT ON TABLE usage_events IS 'Granular user interaction events';
COMMENT ON TABLE usage_metrics IS 'Daily aggregated usage statistics';