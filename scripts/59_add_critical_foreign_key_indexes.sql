-- Add Critical Foreign Key Indexes for Performance
-- Focus on frequently accessed foreign keys that impact performance

BEGIN;

-- =============================================================================
-- ORGANIZATION_ID indexes (most critical - used in nearly every query)
-- =============================================================================

-- These are the most important as organization_id is used for RLS policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adoption_metrics_org_id ON adoption_metrics(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_invoices_org_id ON billing_invoices(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_subscriptions_org_id ON billing_subscriptions(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_goals_org_id ON customer_goals(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_org_id ON engagements(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_scores_org_id ON health_scores(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nps_surveys_org_id ON nps_surveys(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_plan_templates_org_id ON onboarding_plan_templates(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_plans_org_id ON onboarding_plans(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_audit_log_org_id ON security_audit_log(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_org_id ON user_preferences(organization_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_org_id ON user_profiles(organization_id);

-- =============================================================================
-- ACCOUNT_ID indexes (second most critical - used for account-related queries)
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_adoption_metrics_account_id ON adoption_metrics(account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_automation_jobs_account_id ON automation_jobs(account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_engagements_account_id ON engagements(account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_health_scores_account_id ON health_scores(account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nps_surveys_account_id ON nps_surveys(account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_support_metrics_account_id ON support_metrics(account_id);

-- =============================================================================
-- CSM and user-related foreign keys (for team management queries)
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_csm_id ON accounts(csm_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_updated_by ON contacts(updated_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_goals_created_by ON customer_goals(created_by);

-- =============================================================================
-- Template and plan relationship indexes (for onboarding workflows)
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_plans_template_id ON onboarding_plans(template_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_steps_template_step_id ON onboarding_steps(template_step_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_onboarding_activities_step_id ON onboarding_activities(step_id);

-- =============================================================================
-- Email and communication indexes
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_settings_domain_ownership_id ON email_settings(domain_ownership_id);

-- =============================================================================
-- Survey and response relationship indexes
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_survey_responses_recipient_id ON survey_responses(recipient_id);

-- =============================================================================
-- Payment and billing indexes
-- =============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_payments_payment_method_id ON invoice_payments(payment_method_id);

COMMIT;

-- =============================================================================
-- Summary of added indexes
-- =============================================================================

DO $$
DECLARE 
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%_org_id'
    OR indexname LIKE 'idx_%_account_id'
    OR indexname IN (
        'idx_accounts_csm_id', 
        'idx_contacts_updated_by',
        'idx_customer_goals_created_by',
        'idx_onboarding_plans_template_id',
        'idx_onboarding_steps_template_step_id',
        'idx_onboarding_activities_step_id',
        'idx_email_logs_template_id',
        'idx_email_settings_domain_ownership_id',
        'idx_survey_responses_recipient_id',
        'idx_invoice_payments_payment_method_id'
    );
    
    RAISE NOTICE 'Added % critical foreign key indexes for improved query performance', index_count;
END $$;