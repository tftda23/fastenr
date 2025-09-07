-- Fix Function Search Path Security Issues
-- This script adds SET search_path = '' to all functions to prevent 
-- search path injection attacks and satisfy security linter requirements

BEGIN;

-- Note: Since recreating all these functions would be very complex and error-prone,
-- we'll use ALTER FUNCTION to set the search_path parameter for existing functions.
-- This is safer than trying to reconstruct complex function definitions.

-- =============================================================================
-- Fix search_path for all problematic functions
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

-- Utility functions
ALTER FUNCTION public._slug_to_domain_base(text) SET search_path = '';
ALTER FUNCTION public.user_in_org(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_profile_simple() SET search_path = '';
ALTER FUNCTION public.get_org_email_domains(uuid) SET search_path = '';
ALTER FUNCTION public.get_org_currency_config() SET search_path = '';

-- Business logic functions
ALTER FUNCTION public.update_process_completion_percentage() SET search_path = '';
ALTER FUNCTION public.generate_invoice_number() SET search_path = '';
ALTER FUNCTION public.log_onboarding_activity(uuid, uuid, text, jsonb) SET search_path = '';
ALTER FUNCTION public.log_security_violation(text, jsonb) SET search_path = '';
ALTER FUNCTION public.update_onboarding_plan_progress() SET search_path = '';

-- Analytics/metrics functions  
ALTER FUNCTION public.aggregate_daily_usage_metrics(date) SET search_path = '';
ALTER FUNCTION public.aggregate_daily_usage_metrics_by_account(uuid, date) SET search_path = '';
ALTER FUNCTION public.calculate_support_health_score(uuid) SET search_path = '';

-- Domain management functions
ALTER FUNCTION public.mark_stale_domains() SET search_path = '';
ALTER FUNCTION public.cleanup_abandoned_domains() SET search_path = '';

-- Integration functions
ALTER FUNCTION public.upsert_raw_salesforce_account(uuid, text, jsonb) SET search_path = '';
ALTER FUNCTION public.upsert_raw_salesforce_contact(uuid, text, jsonb) SET search_path = '';
ALTER FUNCTION public.upsert_raw_salesforce_opportunity(uuid, text, jsonb) SET search_path = '';

-- Churn risk functions
ALTER FUNCTION public.calculate_churn_risk_score(uuid) SET search_path = '';
ALTER FUNCTION public.update_all_churn_risk_scores() SET search_path = '';
ALTER FUNCTION public.trigger_update_churn_risk() SET search_path = '';
ALTER FUNCTION public.calculate_churn_risk(uuid) SET search_path = '';

-- Account tracking functions
ALTER FUNCTION public.track_account_growth_changes() SET search_path = '';

-- =============================================================================
-- Verify the changes
-- =============================================================================

DO $$
DECLARE 
    func_record RECORD;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== Function Search Path Fix Summary ===';
    
    -- Count total functions we're checking
    SELECT COUNT(*) INTO total_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
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
    );
    
    -- Check which functions now have search_path set
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            CASE 
                WHEN pg_proc_get_function_result(p.oid) LIKE '%search_path%' THEN 'FIXED'
                ELSE 'NEEDS_CHECK'
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
        IF func_record.status = 'FIXED' THEN
            fixed_count := fixed_count + 1;
        END IF;
        RAISE NOTICE 'Function %: %', func_record.function_name, func_record.status;
    END LOOP;
    
    RAISE NOTICE 'Total functions processed: %', total_count;
    RAISE NOTICE 'Functions with search_path set: %', fixed_count;
    RAISE NOTICE '=== End Summary ===';
END $$;

COMMIT;