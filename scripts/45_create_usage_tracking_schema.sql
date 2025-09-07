-- Create usage tracking schema for innovative per-user metrics

-- Usage tracking products (each product/app being tracked)
CREATE TABLE usage_tracking_products (
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
CREATE TABLE user_fingerprints (
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
    
    UNIQUE(product_id, fingerprint_hash),
    INDEX idx_fingerprints_product_hash (product_id, fingerprint_hash),
    INDEX idx_fingerprints_last_seen (last_seen)
);

-- Usage sessions (each visit/session)
CREATE TABLE usage_sessions (
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
    
    -- Derived location (from IP, privacy-conscious)
    country_code TEXT,
    region TEXT,
    city TEXT,
    
    INDEX idx_sessions_product_started (product_id, started_at),
    INDEX idx_sessions_fingerprint (fingerprint_id),
    INDEX idx_sessions_started (started_at)
);

-- Usage events (individual interactions)
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES usage_sessions(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'scroll', 'form_submit', 'custom'
    event_name TEXT,
    page_url TEXT,
    element_selector TEXT,
    
    -- Event data
    event_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance data
    load_time_ms INTEGER,
    interaction_time_ms INTEGER,
    
    INDEX idx_events_session_timestamp (session_id, timestamp),
    INDEX idx_events_type_timestamp (event_type, timestamp)
);

-- Aggregated usage metrics (daily rollups for performance)
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES usage_tracking_products(id) ON DELETE CASCADE,
    
    -- Time period
    recorded_at DATE NOT NULL,
    
    -- User metrics
    unique_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Session metrics
    total_sessions INTEGER DEFAULT 0,
    avg_session_duration FLOAT DEFAULT 0.0,
    bounce_rate FLOAT DEFAULT 0.0,
    
    -- Engagement metrics
    page_views INTEGER DEFAULT 0,
    total_click_events INTEGER DEFAULT 0,
    avg_scroll_depth FLOAT DEFAULT 0.0,
    form_submissions INTEGER DEFAULT 0,
    
    -- Feature usage (JSONB for flexibility)
    feature_usage JSONB DEFAULT '{}',
    
    -- Top pages/referrers
    top_pages JSONB DEFAULT '[]',
    top_referrers JSONB DEFAULT '[]',
    
    UNIQUE(product_id, recorded_at),
    INDEX idx_metrics_product_date (product_id, recorded_at)
);

-- Enable RLS
ALTER TABLE usage_tracking_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access tracking products in their organization" ON usage_tracking_products
    FOR ALL USING (
        organization_id = (
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
            WHERE s.id = usage_events.session_id 
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

-- Create indexes for performance
CREATE INDEX idx_tracking_products_org ON usage_tracking_products(organization_id);
CREATE INDEX idx_usage_metrics_product_date ON usage_metrics(product_id, recorded_at DESC);
CREATE INDEX idx_sessions_product_date ON usage_sessions(product_id, started_at DESC);

COMMENT ON TABLE usage_tracking_products IS 'Products/applications being tracked for usage metrics';
COMMENT ON TABLE user_fingerprints IS 'Innovative user identification using digital fingerprinting';
COMMENT ON TABLE usage_sessions IS 'Individual user sessions with engagement metrics';
COMMENT ON TABLE usage_events IS 'Detailed interaction events within sessions';
COMMENT ON TABLE usage_metrics IS 'Daily aggregated metrics for dashboard display';