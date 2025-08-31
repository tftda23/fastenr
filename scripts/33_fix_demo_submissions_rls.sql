-- Fix Row Level Security policy for demo_submissions table
-- Allow both anonymous and authenticated users to insert, plus service role

-- Drop existing policy
DROP POLICY IF EXISTS "Allow anonymous inserts on demo_submissions" ON demo_submissions;

-- Create new policy that allows service role
CREATE POLICY "Enable insert for demo submissions" 
  ON demo_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Grant permissions to service role
GRANT ALL ON demo_submissions TO service_role;

-- Make sure anon and authenticated can still insert
GRANT INSERT ON demo_submissions TO anon;
GRANT INSERT ON demo_submissions TO authenticated;