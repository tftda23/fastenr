-- Add dummy payment methods to all organizations for testing
-- This allows testing of premium features without actual Stripe integration

-- First, ensure all organizations have a Stripe customer ID
UPDATE organizations 
SET stripe_customer_id = 'cus_dummy_' || LOWER(REPLACE(id::text, '-', ''))
WHERE stripe_customer_id IS NULL;

-- Add dummy payment method for each organization
INSERT INTO payment_methods (
  organization_id,
  stripe_payment_method_id,
  stripe_customer_id,
  type,
  brand,
  last4,
  exp_month,
  exp_year,
  is_default
)
SELECT 
  o.id as organization_id,
  'pm_dummy_' || LOWER(REPLACE(o.id::text, '-', '')) as stripe_payment_method_id,
  'cus_dummy_' || LOWER(REPLACE(o.id::text, '-', '')) as stripe_customer_id,
  'card' as type,
  'visa' as brand,
  '4242' as last4,
  12 as exp_month,
  2030 as exp_year,
  true as is_default
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM payment_methods pm 
  WHERE pm.organization_id = o.id
)
ON CONFLICT (stripe_payment_method_id) DO NOTHING;

-- Update trial dates to be far in the future to avoid trial expiration
UPDATE organizations 
SET trial_ends_at = NOW() + INTERVAL '1 year'
WHERE trial_ends_at < NOW() OR trial_ends_at IS NULL;

-- Ensure all organizations have premium plan
UPDATE organizations 
SET plan = 'premium'
WHERE plan IS NULL OR plan != 'premium';

-- Log what we did
DO $$
DECLARE
  org_count INTEGER;
  payment_method_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO payment_method_count FROM payment_methods;
  
  RAISE NOTICE 'Updated % organizations with dummy payment data', org_count;
  RAISE NOTICE 'Total payment methods in database: %', payment_method_count;
END $$;