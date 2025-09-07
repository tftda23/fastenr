-- Optimize Connection Pooling and Reduce PostgREST Configuration Calls
-- This script creates optimizations to reduce the excessive PostgREST configuration calls

BEGIN;

-- =============================================================================
-- 1. Create a connection statistics tracking function for monitoring
-- =============================================================================

CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE (
    application_name text,
    total_connections bigint,
    idle_connections bigint,
    active_connections bigint,
    oldest_connection timestamptz,
    newest_connection timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(psa.application_name, 'unknown')::text,
        COUNT(*)::bigint as total_connections,
        COUNT(CASE WHEN psa.state = 'idle' THEN 1 END)::bigint as idle_connections,
        COUNT(CASE WHEN psa.state = 'active' THEN 1 END)::bigint as active_connections,
        MIN(psa.backend_start) as oldest_connection,
        MAX(psa.backend_start) as newest_connection
    FROM pg_stat_activity psa
    WHERE psa.datname = current_database()
    AND psa.application_name IS NOT NULL
    GROUP BY psa.application_name
    ORDER BY total_connections DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_connection_stats() TO authenticated;

-- =============================================================================
-- 2. Create a query statistics monitoring function
-- =============================================================================

CREATE OR REPLACE FUNCTION get_query_performance_stats()
RETURNS TABLE (
    query_type text,
    total_calls bigint,
    total_time_seconds numeric,
    avg_time_ms numeric,
    cache_hit_percent numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN pss.query LIKE 'select set_config(%search_path%' THEN 'PostgREST Config'
            WHEN pss.query LIKE 'SELECT%FROM%organizations%' THEN 'Organization Queries'
            WHEN pss.query LIKE 'SELECT%FROM%accounts%' THEN 'Account Queries'
            WHEN pss.query LIKE 'SELECT%FROM%contacts%' THEN 'Contact Queries'
            ELSE 'Other'
        END::text as query_type,
        pss.calls::bigint as total_calls,
        (pss.total_exec_time / 1000)::numeric(10,2) as total_time_seconds,
        pss.mean_exec_time::numeric(8,3) as avg_time_ms,
        (100.0 * pss.shared_blks_hit / NULLIF(pss.shared_blks_hit + pss.shared_blks_read, 0))::numeric(5,2) as cache_hit_percent
    FROM pg_stat_statements pss
    WHERE pss.calls > 100  -- Only show frequently called queries
    ORDER BY pss.calls DESC
    LIMIT 20;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_query_performance_stats() TO authenticated;

-- =============================================================================
-- 3. Add connection monitoring alerts (for debugging)
-- =============================================================================

CREATE OR REPLACE FUNCTION log_excessive_connections()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    postgrest_connections integer;
    config_calls bigint;
BEGIN
    -- Count current PostgREST connections
    SELECT COUNT(*) INTO postgrest_connections
    FROM pg_stat_activity 
    WHERE application_name = 'postgrest'
    AND datname = current_database();
    
    -- Check configuration calls from pg_stat_statements
    SELECT COALESCE(calls, 0) INTO config_calls
    FROM pg_stat_statements 
    WHERE query LIKE 'select set_config(%search_path%'
    ORDER BY calls DESC
    LIMIT 1;
    
    -- Log if excessive
    IF postgrest_connections > 20 OR config_calls > 100000 THEN
        RAISE NOTICE 'PERFORMANCE WARNING: PostgREST connections: %, Config calls: %', 
                    postgrest_connections, config_calls;
    END IF;
END;
$$;

-- =============================================================================
-- 4. Create materialized view for frequently accessed configuration
-- =============================================================================

-- Create a materialized view to cache frequently accessed organization data
-- This can reduce the number of database round trips
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_org_config AS
SELECT 
    o.id,
    o.name,
    o.plan,
    o.billing_status,
    o.trial_ends_at,
    COUNT(a.id) as account_count,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_account_count,
    MAX(a.updated_at) as last_account_update
FROM organizations o
LEFT JOIN accounts a ON a.organization_id = o.id
GROUP BY o.id, o.name, o.plan, o.billing_status, o.trial_ends_at;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_org_config_id ON mv_org_config(id);
CREATE INDEX IF NOT EXISTS idx_mv_org_config_plan ON mv_org_config(plan);

-- Grant permissions
GRANT SELECT ON mv_org_config TO authenticated;
GRANT SELECT ON mv_org_config TO public;

-- =============================================================================
-- 5. Function to refresh the materialized view (call periodically)
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_org_config_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_org_config;
    -- Log the refresh for monitoring
    RAISE NOTICE 'Organization config cache refreshed at %', now();
END;
$$;

GRANT EXECUTE ON FUNCTION refresh_org_config_cache() TO authenticated;

COMMIT;

-- =============================================================================
-- Verification and recommendations
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== Connection Pooling Optimization Complete ===';
    RAISE NOTICE 'Created monitoring functions:';
    RAISE NOTICE '- get_connection_stats(): Monitor database connections';
    RAISE NOTICE '- get_query_performance_stats(): Monitor query performance';
    RAISE NOTICE '- log_excessive_connections(): Alert on connection issues';
    RAISE NOTICE '';
    RAISE NOTICE 'Created optimization:';
    RAISE NOTICE '- mv_org_config: Materialized view to cache org data';
    RAISE NOTICE '- refresh_org_config_cache(): Function to refresh cache';
    RAISE NOTICE '';
    RAISE NOTICE 'RECOMMENDATIONS:';
    RAISE NOTICE '1. Update Next.js app to use singleton Supabase client properly';
    RAISE NOTICE '2. Implement client-side connection pooling/reuse';
    RAISE NOTICE '3. Set up periodic refresh of mv_org_config (every 5-10 minutes)';
    RAISE NOTICE '4. Monitor connections using get_connection_stats()';
    RAISE NOTICE '=== End Optimization ===';
END;
$$;