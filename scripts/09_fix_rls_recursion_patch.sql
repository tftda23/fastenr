-- Patch to fix infinite recursion in user_profiles RLS policies
-- This script fixes the existing database by dropping problematic policies and creating new ones

-- Drop all existing RLS policies on user_profiles that cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their organization" ON user_profiles;

-- Drop problematic functions that cause recursion
DROP FUNCTION IF EXISTS get_user_organization_id();
DROP FUNCTION IF EXISTS is_user_admin();

-- Create simple, non-recursive RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- For organization-level access, we'll handle this in the application layer
-- to avoid RLS recursion issues during signup

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Also fix organizations table policies to be simpler
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can manage their organization" ON organizations;

CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND organization_id IS NOT NULL
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow inserting organizations (needed for signup)
CREATE POLICY "Anyone can create organizations" ON organizations
    FOR INSERT WITH CHECK (true);
