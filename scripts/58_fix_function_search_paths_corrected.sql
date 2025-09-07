-- Fix Function Search Path Security Issues (Corrected)
-- This script adds SET search_path = '' to all functions to prevent 
-- search path injection attacks and satisfy security linter requirements

BEGIN;

-- =============================================================================
-- Fix search_path for all problematic functions (with correct signatures)
-- =============================================================================

-- Trigger functions (typically simple)
ALTER FUNCTION public.update_onboarding_updated_at() SET search_path = '';
ALTER FUNCTION public.update_app_settings_updated_at() SET search_path = '';
ALTER FUNCTION public.update_email_templates_updated_at() SET search_path = '';
ALTER FUNCTION public.update_email_settings_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.update_user_preferences_updated_at() SET search_path = '';
ALTER FUNCTION public.update_surveys_updated_at() SET search_path = '';

-- Utility functions (with correct signatures)
ALTER FUNCTION public._slug_to_domain_base(src text) SET search_path = '';
ALTER FUNCTION public.user_in_org(org_id uuid) SET search_path = '';
ALTER FUNCTION public.get_user_profile_simple(user_id uuid) SET search_path = '';
ALTER FUNCTION public.get_org_email_domains(org_id uuid) SET search_path = '';
ALTER FUNCTION public.get_org_currency_config(org_id uuid) SET search_path = '';

-- Business logic functions
ALTER FUNCTION public.update_process_completion_percentage() SET search_path = '';
ALTER FUNCTION public.generate_invoice_number() SET search_path = '';
ALTER FUNCTION public.log_onboarding_activity() SET search_path = '';
ALTER FUNCTION public.log_security_violation(p_action text, p_table_name text, p_record_id uuid, p_attempted_access_org_id uuid) SET search_path = '';
ALTER FUNCTION public.update_onboarding_plan_progress() SET search_path = '';

-- Analytics/metrics functions  
ALTER FUNCTION public.aggregate_daily_usage_metrics(target_date date) SET search_path = '';
ALTER FUNCTION public.aggregate_daily_usage_metrics_by_account(target_date date) SET search_path = '';
ALTER FUNCTION public.calculate_support_health_score(p_account_id uuid, p_organization_id uuid, p_days_lookback integer) SET search_path = '';

-- Domain management functions
ALTER FUNCTION public.mark_stale_domains() SET search_path = '';
ALTER FUNCTION public.cleanup_abandoned_domains() SET search_path = '';

-- Integration functions (with correct signatures including timestamp)
ALTER FUNCTION public.upsert_raw_salesforce_account(p_org uuid, p_id text, p_data jsonb, p_mod timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.upsert_raw_salesforce_contact(p_org uuid, p_id text, p_data jsonb, p_mod timestamp with time zone) SET search_path = '';
ALTER FUNCTION public.upsert_raw_salesforce_opportunity(p_org uuid, p_id text, p_data jsonb, p_mod timestamp with time zone) SET search_path = '';

-- Churn risk functions
ALTER FUNCTION public.calculate_churn_risk_score(account_uuid uuid) SET search_path = '';
ALTER FUNCTION public.update_all_churn_risk_scores() SET search_path = '';
ALTER FUNCTION public.trigger_update_churn_risk() SET search_path = '';
ALTER FUNCTION public.calculate_churn_risk(account_uuid uuid) SET search_path = '';

-- Account tracking functions
ALTER FUNCTION public.track_account_growth_changes() SET search_path = '';

-- =============================================================================
-- Verify the changes by checking function configurations
-- =============================================================================

DO $$
DECLARE 
    func_record RECORD;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Function Search Path Fix Summary ===';
    
    -- Count and check all functions
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments,
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM pg_proc_config 
                    WHERE oid = p.oid 
                    AND setting[1] = 'search_path'
                ) THEN 'FIXED'
                ELSE 'NOT_FIXED'
            END as status
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'update_onboarding_updated_at',
            'update_app_settings_updated_at', 
            'aggregate_daily_usage_metrics_by_account',
            'update_email_templates_updated_at',
            'update_email_settings_updated_at',
            'update_process_completion_percentage',
            'aggregate_daily_usage_metrics',
            'track_account_growth_changes',
            'update_onboarding_plan_progress',
            'generate_invoice_number',
            'log_onboarding_activity',
            'log_security_violation',
            'mark_stale_domains',
            'update_updated_at_column',
            'calculate_support_health_score',
            'cleanup_abandoned_domains',
            'get_org_email_domains',
            'get_org_currency_config',
            'set_updated_at',
            '_slug_to_domain_base',
            'user_in_org',
            'upsert_raw_salesforce_account',
            'upsert_raw_salesforce_contact',
            'upsert_raw_salesforce_opportunity',
            'calculate_churn_risk_score',
            'update_all_churn_risk_scores',
            'trigger_update_churn_risk',
            'calculate_churn_risk',
            'get_user_profile_simple',
            'update_user_preferences_updated_at',
            'update_surveys_updated_at'
        )
        ORDER BY p.proname
    LOOP
        total_count := total_count + 1;
        IF func_record.status = 'FIXED' THEN
            fixed_count := fixed_count + 1;
        END IF;
        RAISE NOTICE 'Function %(%): %', func_record.function_name, func_record.arguments, func_record.status;
    END LOOP;
    
    RAISE NOTICE 'Total functions processed: %', total_count;
    RAISE NOTICE 'Functions with search_path fixed: %', fixed_count;
    RAISE NOTICE 'Functions still needing fixes: %', (total_count - fixed_count);
    RAISE NOTICE '=== End Summary ===';
END $$;

COMMIT;