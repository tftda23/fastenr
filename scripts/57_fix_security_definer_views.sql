-- Fix SECURITY DEFINER Views
-- This script recreates all views that have SECURITY DEFINER property 
-- to use SECURITY INVOKER (default) instead, which respects RLS policies

BEGIN;

-- =============================================================================
-- Drop and recreate v_billing_kpis view
-- =============================================================================
DROP VIEW IF EXISTS v_billing_kpis CASCADE;

CREATE VIEW v_billing_kpis AS 
SELECT 
    ( SELECT COALESCE(sum(v_org_mrr.mrr_cents), (0)::bigint) AS "coalesce"
      FROM v_org_mrr) AS mrr_cents,
    ( SELECT (COALESCE(sum(v_org_mrr.mrr_cents), (0)::bigint) * 12)
      FROM v_org_mrr) AS arr_cents,
    ( SELECT COALESCE(avg(v_org_mrr.mrr_cents), (0)::numeric) AS "coalesce"
      FROM v_org_mrr) AS arpu_cents;

-- Grant appropriate permissions
GRANT SELECT ON v_billing_kpis TO authenticated;
GRANT SELECT ON v_billing_kpis TO public;

-- =============================================================================
-- Drop and recreate contact_summary view
-- =============================================================================
DROP VIEW IF EXISTS contact_summary CASCADE;

CREATE VIEW contact_summary AS 
SELECT 
    c.id,
    c.organization_id,
    c.account_id,
    a.name AS account_name,
    c.first_name,
    c.last_name,
    (((c.first_name)::text || ' '::text) || (c.last_name)::text) AS full_name,
    c.email,
    c.phone,
    c.title,
    c.department,
    c.seniority_level,
    c.decision_maker_level,
    c.primary_contact,
    c.contact_status,
    c.relationship_strength,
    c.last_engagement_date,
    (((m.first_name)::text || ' '::text) || (m.last_name)::text) AS manager_name,
    c.created_at,
    c.updated_at,
    ( SELECT count(*) AS count
      FROM contact_group_memberships cgm
      WHERE (cgm.contact_id = c.id)) AS group_count,
    ( SELECT count(*) AS count
      FROM contacts reports
      WHERE (reports.manager_id = c.id)) AS direct_reports_count
FROM ((contacts c
    LEFT JOIN accounts a ON ((c.account_id = a.id)))
    LEFT JOIN contacts m ON ((c.manager_id = m.id)));

-- Grant appropriate permissions
GRANT SELECT ON contact_summary TO authenticated;
GRANT SELECT ON contact_summary TO public;

-- =============================================================================
-- Drop and recreate v_active_subscriptions view
-- =============================================================================
DROP VIEW IF EXISTS v_active_subscriptions CASCADE;

CREATE VIEW v_active_subscriptions AS 
SELECT 
    id,
    organization_id,
    plan_code,
    status,
    seats_purchased,
    seats_used,
    period_start,
    period_end,
    provider_subscription_id,
    created_at,
    updated_at
FROM billing_subscriptions s
WHERE ((status = 'active'::text) AND ((now() >= period_start) AND (now() <= period_end)));

-- Grant appropriate permissions
GRANT SELECT ON v_active_subscriptions TO authenticated;
GRANT SELECT ON v_active_subscriptions TO public;

-- =============================================================================
-- Drop and recreate goal_progress view
-- =============================================================================
DROP VIEW IF EXISTS goal_progress CASCADE;

CREATE VIEW goal_progress AS 
SELECT 
    id,
    organization_id,
    account_id,
    title,
    description,
    status,
    target_date,
    completion_date,
    created_at,
    updated_at,
    metric_type,
    current_value,
    target_value,
    unit,
    measurement_period,
    created_by,
    CASE
        WHEN (target_value > (0)::numeric) THEN round(((current_value / target_value) * (100)::numeric), 2)
        ELSE (0)::numeric
    END AS progress_percentage,
    CASE
        WHEN (current_value >= target_value) THEN 'achieved'::text
        WHEN (target_date < CURRENT_DATE) THEN 'missed'::text
        WHEN (target_date <= (CURRENT_DATE + '30 days'::interval)) THEN 'at_risk'::text
        ELSE 'on_track'::text
    END AS calculated_status
FROM customer_goals g;

-- Grant appropriate permissions
GRANT SELECT ON goal_progress TO authenticated;
GRANT SELECT ON goal_progress TO public;

-- =============================================================================
-- Drop and recreate decision_maker_analysis view
-- =============================================================================
DROP VIEW IF EXISTS decision_maker_analysis CASCADE;

CREATE VIEW decision_maker_analysis AS 
SELECT 
    a.id AS account_id,
    a.name AS account_name,
    a.organization_id,
    count(
        CASE
            WHEN ((c.decision_maker_level)::text = 'Primary'::text) THEN 1
            ELSE NULL::integer
        END) AS primary_decision_makers,
    count(
        CASE
            WHEN ((c.decision_maker_level)::text = 'Influencer'::text) THEN 1
            ELSE NULL::integer
        END) AS influencers,
    count(
        CASE
            WHEN ((c.decision_maker_level)::text = 'User'::text) THEN 1
            ELSE NULL::integer
        END) AS users,
    count(
        CASE
            WHEN ((c.decision_maker_level)::text = 'Gatekeeper'::text) THEN 1
            ELSE NULL::integer
        END) AS gatekeepers,
    count(
        CASE
            WHEN ((c.decision_maker_level)::text = 'Unknown'::text) THEN 1
            ELSE NULL::integer
        END) AS unknown_role,
    count(
        CASE
            WHEN ((c.seniority_level)::text = 'C-Level'::text) THEN 1
            ELSE NULL::integer
        END) AS c_level_contacts,
    count(
        CASE
            WHEN ((c.seniority_level)::text = 'VP'::text) THEN 1
            ELSE NULL::integer
        END) AS vp_contacts,
    count(
        CASE
            WHEN ((c.relationship_strength)::text = 'champion'::text) THEN 1
            ELSE NULL::integer
        END) AS champions,
    count(
        CASE
            WHEN ((c.relationship_strength)::text = 'supporter'::text) THEN 1
            ELSE NULL::integer
        END) AS supporters,
    count(
        CASE
            WHEN ((c.relationship_strength)::text = 'detractor'::text) THEN 1
            ELSE NULL::integer
        END) AS detractors,
    count(*) AS total_contacts
FROM (accounts a
    LEFT JOIN contacts c ON (((a.id = c.account_id) AND ((c.contact_status)::text = 'active'::text))))
GROUP BY a.id, a.name, a.organization_id;

-- Grant appropriate permissions
GRANT SELECT ON decision_maker_analysis TO authenticated;
GRANT SELECT ON decision_maker_analysis TO public;

-- =============================================================================
-- Drop and recreate v_org_mrr view (recreate last since others depend on it)
-- =============================================================================
DROP VIEW IF EXISTS v_org_mrr CASCADE;

CREATE VIEW v_org_mrr AS 
SELECT 
    s.organization_id,
    (c.price_cents * s.seats_purchased) AS mrr_cents
FROM (v_active_subscriptions s
    JOIN plan_catalog c ON ((c.plan_code = s.plan_code)));

-- Grant appropriate permissions
GRANT SELECT ON v_org_mrr TO authenticated;
GRANT SELECT ON v_org_mrr TO public;

-- =============================================================================
-- Recreate v_billing_kpis again since it depends on v_org_mrr
-- =============================================================================
DROP VIEW IF EXISTS v_billing_kpis CASCADE;

CREATE VIEW v_billing_kpis AS 
SELECT 
    ( SELECT COALESCE(sum(v_org_mrr.mrr_cents), (0)::bigint) AS "coalesce"
      FROM v_org_mrr) AS mrr_cents,
    ( SELECT (COALESCE(sum(v_org_mrr.mrr_cents), (0)::bigint) * 12)
      FROM v_org_mrr) AS arr_cents,
    ( SELECT COALESCE(avg(v_org_mrr.mrr_cents), (0)::numeric) AS "coalesce"
      FROM v_org_mrr) AS arpu_cents;

-- Grant appropriate permissions
GRANT SELECT ON v_billing_kpis TO authenticated;
GRANT SELECT ON v_billing_kpis TO public;

-- =============================================================================
-- Verify all views are created without SECURITY DEFINER
-- =============================================================================
DO $$
DECLARE 
    view_record RECORD;
    view_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Security Definer Views Fix Summary ===';
    
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN ('v_billing_kpis', 'contact_summary', 'v_active_subscriptions', 'goal_progress', 'decision_maker_analysis', 'v_org_mrr')
        ORDER BY viewname
    LOOP
        view_count := view_count + 1;
        RAISE NOTICE 'View recreated: %', view_record.viewname;
    END LOOP;
    
    RAISE NOTICE 'Total views fixed: %', view_count;
    RAISE NOTICE '=== End Summary ===';
END $$;

COMMIT;