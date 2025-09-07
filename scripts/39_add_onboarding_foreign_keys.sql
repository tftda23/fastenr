-- Add foreign key constraints for onboarding tables
-- This will enable Supabase to understand the relationships for joins

-- Add foreign key constraints to onboarding_processes
ALTER TABLE onboarding_processes 
ADD CONSTRAINT fk_onboarding_processes_organization 
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE onboarding_processes 
ADD CONSTRAINT fk_onboarding_processes_account 
FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE onboarding_processes 
ADD CONSTRAINT fk_onboarding_processes_owner 
FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE onboarding_processes 
ADD CONSTRAINT fk_onboarding_processes_created_by 
FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add foreign key constraints to onboarding_checklist_items
ALTER TABLE onboarding_checklist_items 
ADD CONSTRAINT fk_onboarding_checklist_items_assignee 
FOREIGN KEY (assignee_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

ALTER TABLE onboarding_checklist_items 
ADD CONSTRAINT fk_onboarding_checklist_items_completed_by 
FOREIGN KEY (completed_by) REFERENCES user_profiles(id) ON DELETE SET NULL;