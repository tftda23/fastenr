-- NPS Surveys table
CREATE TABLE nps_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  respondent_name VARCHAR(255),
  respondent_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Metrics table
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_frequency INTEGER DEFAULT 0, -- logins per week
  feature_adoption_score INTEGER DEFAULT 0 CHECK (feature_adoption_score >= 0 AND feature_adoption_score <= 100),
  support_tickets INTEGER DEFAULT 0,
  training_completion_rate INTEGER DEFAULT 0 CHECK (training_completion_rate >= 0 AND training_completion_rate <= 100),
  overall_health_score INTEGER DEFAULT 50 CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nps_surveys
CREATE POLICY "Users can view NPS surveys in their organization" ON nps_surveys
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can insert NPS surveys" ON nps_surveys
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

-- RLS Policies for health_metrics
CREATE POLICY "Users can view health metrics in their organization" ON health_metrics
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can insert health metrics" ON health_metrics
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

CREATE POLICY "Read-write users can update health metrics" ON health_metrics
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

-- Indexes
CREATE INDEX idx_nps_surveys_organization_id ON nps_surveys(organization_id);
CREATE INDEX idx_nps_surveys_account_id ON nps_surveys(account_id);
CREATE INDEX idx_nps_surveys_survey_date ON nps_surveys(survey_date);
CREATE INDEX idx_health_metrics_organization_id ON health_metrics(organization_id);
CREATE INDEX idx_health_metrics_account_id ON health_metrics(account_id);
CREATE INDEX idx_health_metrics_metric_date ON health_metrics(metric_date);
