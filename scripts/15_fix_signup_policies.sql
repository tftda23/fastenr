-- Fix RLS policies to allow proper multi-tenant signup flow

-- Drop existing problematic policies on organizations
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Organization admins can update their organization" ON organizations;

-- Create proper policies for organizations that allow signup
CREATE POLICY "Anyone can create organizations during signup" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure user_profiles allows inserts during signup
-- (RLS is disabled on user_profiles, but let's be explicit)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
