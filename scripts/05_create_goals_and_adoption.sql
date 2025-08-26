-- Customer Goals table
CREATE TABLE customer_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(50), -- e.g., 'users', 'revenue', 'percentage'
  status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'achieved', 'missed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date DATE,
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adoption Metrics table (extensible for integrations)
CREATE TABLE adoption_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'count', 'percentage', 'duration', 'frequency'
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'api', 'integration'
  metadata JSONB DEFAULT '{}', -- flexible storage for integration data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_goals
CREATE POLICY "Users can view goals in their organization" ON customer_goals
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can manage goals" ON customer_goals
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

-- RLS Policies for adoption_metrics
CREATE POLICY "Users can view adoption metrics in their organization" ON adoption_metrics
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can manage adoption metrics" ON adoption_metrics
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

-- Indexes
CREATE INDEX idx_customer_goals_organization_id ON customer_goals(organization_id);
CREATE INDEX idx_customer_goals_account_id ON customer_goals(account_id);
CREATE INDEX idx_customer_goals_status ON customer_goals(status);
CREATE INDEX idx_customer_goals_due_date ON customer_goals(due_date);
CREATE INDEX idx_adoption_metrics_organization_id ON adoption_metrics(organization_id);
CREATE INDEX idx_adoption_metrics_account_id ON adoption_metrics(account_id);
CREATE INDEX idx_adoption_metrics_metric_name ON adoption_metrics(metric_name);
CREATE INDEX idx_adoption_metrics_measurement_date ON adoption_metrics(measurement_date);
