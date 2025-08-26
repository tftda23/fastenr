-- Create app settings table for organization-wide configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Organization settings
  organization_name VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  description TEXT,
  
  -- Feature toggles
  email_notifications_enabled BOOLEAN DEFAULT true,
  slack_integration_enabled BOOLEAN DEFAULT false,
  automated_health_scoring_enabled BOOLEAN DEFAULT true,
  api_access_enabled BOOLEAN DEFAULT true,
  
  -- Data & Privacy settings
  data_retention_period VARCHAR(20) DEFAULT '2years', -- '1year', '2years', '5years', 'forever'
  backup_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  gdpr_compliance_enabled BOOLEAN DEFAULT true,
  
  -- Slack integration settings
  slack_webhook_url TEXT,
  slack_bot_token TEXT, -- Encrypted
  slack_default_channel VARCHAR(100),
  slack_notification_types JSONB DEFAULT '[]', -- Array of notification types to send to Slack
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_org_id ON app_settings(organization_id);

-- Add RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their organization's settings
CREATE POLICY "Users can manage organization app settings" ON app_settings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- Insert default settings for existing organizations
INSERT INTO app_settings (organization_id, organization_name)
SELECT id, name FROM organizations
WHERE id NOT IN (SELECT organization_id FROM app_settings);