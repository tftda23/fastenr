-- Add missing foreign key constraint for CSM relationship
ALTER TABLE accounts 
ADD CONSTRAINT accounts_csm_id_fkey 
FOREIGN KEY (csm_id) REFERENCES user_profiles(id) ON DELETE SET NULL;