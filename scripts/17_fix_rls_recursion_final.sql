-- Fix infinite recursion in user_profiles RLS policies
-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their organization" ON user_profiles;

-- Disable RLS temporarily to avoid recursion during policy creation
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simple policies that don't cause recursion
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can only access their own profile (no organization lookup)
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to create their initial profile
CREATE POLICY "Users can create their initial profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Simple policy for organizations: authenticated users can create and manage organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;

CREATE POLICY "Authenticated users can manage organizations" ON organizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
