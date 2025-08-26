-- Accounts table (customer companies)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  arr DECIMAL(12,2), -- Annual Recurring Revenue
  contract_start_date DATE,
  contract_end_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'churned', 'at_risk', 'onboarding')),
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk_score INTEGER DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  salesforce_id VARCHAR(255),
  hubspot_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view accounts in their organization" ON accounts
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can insert accounts" ON accounts
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

CREATE POLICY "Read-write users can update accounts" ON accounts
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

CREATE POLICY "Delete users can delete accounts" ON accounts
  FOR DELETE USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write_delete', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX idx_accounts_organization_id ON accounts(organization_id);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_health_score ON accounts(health_score);
CREATE INDEX idx_accounts_churn_risk_score ON accounts(churn_risk_score);
