-- Engagements table (meetings, calls, notes)
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'note', 'demo', 'training')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  outcome VARCHAR(100) CHECK (outcome IN ('positive', 'neutral', 'negative', 'action_required')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  attendees JSONB DEFAULT '[]',
  tags VARCHAR(255)[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on engagements
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engagements
CREATE POLICY "Users can view engagements in their organization" ON engagements
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Read-write users can insert engagements" ON engagements
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

CREATE POLICY "Read-write users can update engagements" ON engagements
  FOR UPDATE USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write', 'read_write_delete', 'admin')
    )
  );

CREATE POLICY "Delete users can delete engagements" ON engagements
  FOR DELETE USING (
    organization_id = get_user_organization_id() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('read_write_delete', 'admin')
    )
  );

-- Indexes for performance
CREATE INDEX idx_engagements_organization_id ON engagements(organization_id);
CREATE INDEX idx_engagements_account_id ON engagements(account_id);
CREATE INDEX idx_engagements_user_id ON engagements(user_id);
CREATE INDEX idx_engagements_type ON engagements(type);
CREATE INDEX idx_engagements_scheduled_at ON engagements(scheduled_at);
