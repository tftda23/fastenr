-- Domain security and ownership schema
-- This ensures domains are locked to organizations and DNS details are secure

-- Create domain ownership tracking table
CREATE TABLE IF NOT EXISTS domain_ownership (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL,
    resend_domain_id TEXT NOT NULL UNIQUE, -- The Resend domain ID
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'stale')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    is_default BOOLEAN DEFAULT FALSE, -- For fastenr.co default domain
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure one domain per organization (except for default)
    UNIQUE(organization_id, domain_name),
    -- Ensure only one default domain per organization
    EXCLUDE (organization_id WITH =) WHERE (is_default = true)
);

-- Enable RLS on domain ownership
ALTER TABLE domain_ownership ENABLE ROW LEVEL SECURITY;

-- RLS Policies for domain ownership
CREATE POLICY "Users can only see their organization's domains"
ON domain_ownership FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_profiles 
        WHERE id = auth.uid()
    )
);

CREATE POLICY "Only admins can insert domains"
ON domain_ownership FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id 
        FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can update domains"
ON domain_ownership FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Only admins can delete domains"
ON domain_ownership FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id 
        FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_domain_ownership_org ON domain_ownership(organization_id);
CREATE INDEX IF NOT EXISTS idx_domain_ownership_domain ON domain_ownership(domain_name);
CREATE INDEX IF NOT EXISTS idx_domain_ownership_resend_id ON domain_ownership(resend_domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_ownership_stale ON domain_ownership(last_checked_at) WHERE status = 'stale';

-- Function to mark stale domains (domains not checked in 30 days)
CREATE OR REPLACE FUNCTION mark_stale_domains()
RETURNS void AS $$
BEGIN
    UPDATE domain_ownership 
    SET status = 'stale'
    WHERE last_checked_at < NOW() - INTERVAL '30 days' 
    AND status != 'stale' 
    AND is_default = false; -- Never mark default domains as stale
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup very old stale domains (90+ days)
CREATE OR REPLACE FUNCTION cleanup_abandoned_domains()
RETURNS void AS $$
BEGIN
    -- Log domains being cleaned up
    INSERT INTO audit_log (table_name, operation, record_id, old_data, created_by)
    SELECT 
        'domain_ownership',
        'cleanup',
        id,
        row_to_json(domain_ownership.*),
        NULL
    FROM domain_ownership
    WHERE status = 'stale' 
    AND last_checked_at < NOW() - INTERVAL '90 days'
    AND is_default = false;
    
    -- Delete the stale domains
    DELETE FROM domain_ownership 
    WHERE status = 'stale' 
    AND last_checked_at < NOW() - INTERVAL '90 days'
    AND is_default = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default fastenr.co domain entry for system use
INSERT INTO domain_ownership (
    organization_id,
    domain_name,
    resend_domain_id,
    status,
    verified_at,
    is_default,
    created_by
) 
SELECT 
    o.id,
    'fastenr.co',
    'system-default-fastenr-co',
    'verified',
    NOW(),
    true,
    NULL
FROM organizations o
ON CONFLICT (organization_id, domain_name) DO NOTHING;

-- Update email_settings to reference domain ownership
ALTER TABLE email_settings 
ADD COLUMN IF NOT EXISTS domain_ownership_id UUID REFERENCES domain_ownership(id);

-- Create function to get allowed email domains for an organization
CREATE OR REPLACE FUNCTION get_org_email_domains(org_id UUID)
RETURNS TABLE (
    domain_name TEXT,
    is_default BOOLEAN,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        do.domain_name,
        do.is_default,
        do.status
    FROM domain_ownership do
    WHERE do.organization_id = org_id
    AND do.status IN ('verified', 'pending')
    ORDER BY do.is_default DESC, do.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON domain_ownership TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_org_email_domains(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_stale_domains() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_abandoned_domains() TO authenticated;