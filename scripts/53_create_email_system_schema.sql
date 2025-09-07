-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'custom' CHECK (type IN ('survey', 'engagement', 'notification', 'custom')),
  variables JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Logs Table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'custom' CHECK (type IN ('survey', 'engagement', 'notification', 'custom')),
  
  -- Related entities
  engagement_id UUID REFERENCES engagements(id) ON DELETE SET NULL,
  survey_id UUID REFERENCES surveys(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  
  -- Tracking
  sent_by UUID REFERENCES user_profiles(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'mock_sent')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  
  -- Email provider response
  provider_message_id VARCHAR(255),
  provider_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Settings Table for organization-level configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Sender settings
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  reply_to_email VARCHAR(255),
  
  -- Branding
  logo_url VARCHAR(500),
  organization_name VARCHAR(255),
  
  -- Configuration
  provider VARCHAR(50) DEFAULT 'resend',
  provider_config JSONB DEFAULT '{}'::jsonb,
  
  -- Tracking
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_org_id ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_created_at ON email_templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_logs_org_id ON email_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_engagement_id ON email_logs(engagement_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_survey_id ON email_logs(survey_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_account_id ON email_logs(account_id);

CREATE INDEX IF NOT EXISTS idx_email_settings_org_id ON email_settings(organization_id);

-- Row Level Security Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Policies for email_templates
CREATE POLICY "Users can view email templates from their organization"
  ON email_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create email templates"
  ON email_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update email templates"
  ON email_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can delete email templates"
  ON email_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'manager')
    )
  );

-- Policies for email_logs
CREATE POLICY "Users can view email logs from their organization"
  ON email_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create email logs for their organization"
  ON email_logs FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Policies for email_settings
CREATE POLICY "Users can view email settings from their organization"
  ON email_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage email settings"
  ON email_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_email_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_email_templates_updated_at ON email_templates;
CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_email_templates_updated_at();

DROP TRIGGER IF EXISTS trigger_email_settings_updated_at ON email_settings;
CREATE TRIGGER trigger_email_settings_updated_at
  BEFORE UPDATE ON email_settings
  FOR EACH ROW EXECUTE FUNCTION update_email_settings_updated_at();

-- Insert some default email templates for each organization
DO $$
DECLARE
  org_record RECORD;
  admin_user_id UUID;
BEGIN
  -- Loop through all organizations
  FOR org_record IN SELECT id, name FROM organizations LOOP
    -- Get an admin user for this organization
    SELECT id INTO admin_user_id 
    FROM user_profiles 
    WHERE organization_id = org_record.id 
    AND role = 'admin' 
    LIMIT 1;
    
    -- Skip if no admin user found
    CONTINUE WHEN admin_user_id IS NULL;
    
    -- Insert default engagement follow-up template
    INSERT INTO email_templates (
      organization_id,
      name,
      subject,
      content,
      type,
      variables,
      created_by,
      updated_by
    ) VALUES (
      org_record.id,
      'Engagement Follow-up',
      'Thank you for meeting with us',
      E'Hi {{recipient.name}},\n\nThank you for taking the time to meet with us today. It was great discussing your goals and how we can support your success.\n\nKey points from our conversation:\n- [Add key discussion points here]\n- [Add any action items]\n- [Add next steps]\n\nPlease don''t hesitate to reach out if you have any questions or need assistance.\n\nBest regards,\n{{sender.name}}\nCustomer Success Team',
      'engagement',
      '["{{recipient.name}}", "{{sender.name}}", "{{account.name}}"]',
      admin_user_id,
      admin_user_id
    ),
    -- Insert default survey invitation template
    (
      org_record.id,
      'Customer Survey Invitation',
      'We''d love your feedback - Quick 2-minute survey',
      E'Hi {{recipient.name}},\n\nWe hope you''re doing well! As part of our commitment to providing excellent service, we''d love to hear about your experience with {{organization.name}}.\n\nWould you mind taking a quick 2-minute survey? Your feedback helps us improve and serve you better.\n\n[Survey Link]\n\nThank you for your time and continued partnership!\n\nBest regards,\nThe {{organization.name}} Team',
      'survey',
      '["{{recipient.name}}", "{{organization.name}}"]',
      admin_user_id,
      admin_user_id
    ),
    -- Insert default notification template
    (
      org_record.id,
      'Account Health Alert',
      'Important update about {{account.name}}',
      E'Hi {{recipient.name}},\n\nWe wanted to reach out regarding {{account.name}}. Our system has flagged some important metrics that may need attention:\n\n{{alert.details}}\n\nWe''re here to help and would love to schedule a quick call to discuss how we can support your success.\n\nPlease let us know a good time to connect.\n\nBest regards,\n{{sender.name}}\nCustomer Success Team',
      'notification',
      '["{{recipient.name}}", "{{account.name}}", "{{alert.details}}", "{{sender.name}}"]',
      admin_user_id,
      admin_user_id
    );
    
    -- Insert default email settings
    INSERT INTO email_settings (
      organization_id,
      from_name,
      organization_name,
      created_by,
      updated_by
    ) VALUES (
      org_record.id,
      org_record.name || ' Customer Success',
      org_record.name,
      admin_user_id,
      admin_user_id
    )
    ON CONFLICT (organization_id) DO NOTHING;
    
  END LOOP;
END $$;