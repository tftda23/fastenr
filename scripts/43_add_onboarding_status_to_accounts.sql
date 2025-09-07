-- Add onboarding to account status options and update some accounts to onboarding state

-- Update the status constraint to include onboarding
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_status_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_status_check 
    CHECK (status IN ('active', 'at_risk', 'churned', 'onboarding'));

-- Update 5 accounts to be in onboarding state
DO $$
DECLARE
    account_ids uuid[];
BEGIN
    -- Get the first 5 accounts from a random organization
    SELECT array_agg(id) INTO account_ids
    FROM (
        SELECT id 
        FROM accounts 
        WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
        ORDER BY created_at 
        LIMIT 5
    ) as selected_accounts;

    -- Update these accounts to onboarding state
    UPDATE accounts 
    SET status = 'onboarding',
        onboarding_status = CASE 
            WHEN random() < 0.4 THEN 'not_started'
            WHEN random() < 0.8 THEN 'in_progress' 
            ELSE 'on_hold'
        END,
        onboarding_started_at = CASE 
            WHEN random() < 0.6 THEN NOW() - INTERVAL '1 day' * (random() * 30)
            ELSE NULL
        END,
        updated_at = NOW()
    WHERE id = ANY(account_ids);

    -- Log the update
    RAISE NOTICE 'Updated % accounts to onboarding state', array_length(account_ids, 1);
END $$;