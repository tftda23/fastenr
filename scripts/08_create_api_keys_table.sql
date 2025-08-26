-- API Keys table for external integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  permissions TEXT[] DEFAULT ARRAY['read'],
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view API keys in their organization" ON api_keys
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage API keys in their organization" ON api_keys
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Insert sample API key for testing (you'll need to replace with actual hash)
INSERT INTO api_keys (organization_id, name, key_hash, permissions) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Integration API Key', 'sample_hash_replace_with_real', ARRAY['read', 'write']);
