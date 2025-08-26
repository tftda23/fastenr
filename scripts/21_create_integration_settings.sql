-- Create integration settings table for secure token storage
CREATE TABLE IF NOT EXISTS integration_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_name VARCHAR(50) NOT NULL,
  integration_type VARCHAR(50) NOT NULL,
  encrypted_token TEXT, -- Encrypted token storage
  token_hash TEXT, -- Hash to verify token presence without exposing it
  is_active BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}', -- Additional integration-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, integration_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_settings_org_name ON integration_settings(organization_id, integration_name);

-- Add RLS policies
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their organization's integrations
CREATE POLICY "Users can manage organization integrations" ON integration_settings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );
