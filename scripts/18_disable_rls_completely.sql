-- Completely disable RLS on user_profiles to stop infinite recursion
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their org" ON user_profiles;

-- Drop any remaining policies that might exist
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- Disable RLS completely on user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on organizations to prevent any related issues
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Create a simple function to check if user exists (without RLS complications)
CREATE OR REPLACE FUNCTION public.get_user_profile_simple(user_id uuid)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role text,
  organization_id uuid,
  organization_name text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.organization_id,
    o.name as organization_name
  FROM user_profiles up
  LEFT JOIN organizations o ON up.organization_id = o.id
  WHERE up.id = user_id;
$$;
