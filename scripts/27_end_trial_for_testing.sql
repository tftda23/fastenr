-- End the trial period for testing premium toggle
-- This sets trial_ends_at to yesterday so trial becomes inactive
UPDATE organizations 
SET trial_ends_at = NOW() - INTERVAL '1 day'
WHERE trial_ends_at > NOW();

-- Verify the trial is now ended
SELECT id, trial_ends_at, 
       CASE WHEN trial_ends_at > NOW() THEN 'Active' ELSE 'Ended' END as trial_status,
       premium_addon
FROM organizations;