-- Add missing RLS policy for organizations table
-- This allows authenticated users to create organizations during signup

CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT 
  USING (
    id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization" ON organizations
  FOR UPDATE 
  USING (
    id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'read_write_delete')
    )
  );
