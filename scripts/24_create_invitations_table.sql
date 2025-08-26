-- Create org_invitations table for user invitations
CREATE TABLE IF NOT EXISTS org_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('read', 'read_write', 'read_write_delete', 'admin')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON org_invitations(token);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON org_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_org_id ON org_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_status ON org_invitations(status);

-- Enable RLS
ALTER TABLE org_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow organization admins to create and view invitations for their org
CREATE POLICY "org_invitations_admin_access" ON org_invitations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'read_write_delete')
    )
  );

-- Allow anyone to read invitations by token (for accepting invites)
CREATE POLICY "org_invitations_token_access" ON org_invitations
  FOR SELECT USING (true);

-- Allow updating invitation status when accepting
CREATE POLICY "org_invitations_accept" ON org_invitations
  FOR UPDATE USING (status = 'pending');

-- Add comment
COMMENT ON TABLE org_invitations IS 'Stores organization invitations for new users';