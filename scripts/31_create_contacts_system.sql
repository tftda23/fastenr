-- Create comprehensive contacts system for customer success platform
-- This includes contacts, groups, hierarchies, and relationships

-- Contact Groups (for organizing contacts)
CREATE TABLE contact_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(organization_id, name)
);

-- Main contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Basic contact information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  title VARCHAR(255),
  department VARCHAR(255),
  
  -- Hierarchy and relationships
  manager_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  reports_to_external VARCHAR(255), -- For external managers not in system
  seniority_level VARCHAR(50) CHECK (seniority_level IN ('C-Level', 'VP', 'Director', 'Manager', 'Individual Contributor', 'Other')),
  decision_maker_level VARCHAR(50) CHECK (decision_maker_level IN ('Primary', 'Influencer', 'User', 'Gatekeeper', 'Unknown')),
  
  -- Contact preferences and status
  primary_contact BOOLEAN DEFAULT FALSE,
  contact_status VARCHAR(50) DEFAULT 'active' CHECK (contact_status IN ('active', 'inactive', 'left_company', 'unresponsive')),
  preferred_communication VARCHAR(50) DEFAULT 'email' CHECK (preferred_communication IN ('email', 'phone', 'slack', 'teams', 'in_person')),
  timezone VARCHAR(100),
  
  -- Engagement and relationship data
  last_engagement_date TIMESTAMP WITH TIME ZONE,
  engagement_frequency VARCHAR(50) CHECK (engagement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'rarely')),
  relationship_strength VARCHAR(50) DEFAULT 'neutral' CHECK (relationship_strength IN ('champion', 'supporter', 'neutral', 'detractor', 'unknown')),
  
  -- Additional metadata
  linkedin_url VARCHAR(500),
  notes TEXT,
  tags TEXT[], -- Array of tags for flexible categorization
  custom_fields JSONB DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(organization_id, email),
  CHECK (email IS NOT NULL OR phone IS NOT NULL) -- At least one contact method required
);

-- Junction table for contact group memberships
CREATE TABLE contact_group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  
  UNIQUE(contact_id, group_id)
);

-- Contact roles in goals (many-to-many relationship)
CREATE TABLE contact_goal_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES customer_goals(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL, -- e.g., 'owner', 'stakeholder', 'approver', 'user'
  influence_level VARCHAR(50) CHECK (influence_level IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(contact_id, goal_id, role)
);

-- Engagement participants (many-to-many for engagements)
CREATE TABLE engagement_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  participation_type VARCHAR(50) DEFAULT 'attendee' CHECK (participation_type IN ('organizer', 'attendee', 'optional', 'mentioned')),
  response_status VARCHAR(50) CHECK (response_status IN ('accepted', 'declined', 'tentative', 'no_response')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(engagement_id, contact_id)
);

-- Company hierarchy/org chart relationships
CREATE TABLE contact_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  parent_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  hierarchy_level INTEGER DEFAULT 1, -- 1 = top level, higher numbers = deeper
  department_head BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent circular references
  CHECK (contact_id != parent_contact_id),
  UNIQUE(contact_id) -- Each contact can only have one position in hierarchy
);

-- Automation recipients (for targeting contacts in automation)
CREATE TABLE automation_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE,
  recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('individual', 'group')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Either contact_id or group_id must be set, but not both
  CHECK (
    (contact_id IS NOT NULL AND group_id IS NULL AND recipient_type = 'individual') OR
    (contact_id IS NULL AND group_id IS NOT NULL AND recipient_type = 'group')
  )
);

-- Indexes for performance
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_manager_id ON contacts(manager_id);
CREATE INDEX idx_contacts_status ON contacts(contact_status);
CREATE INDEX idx_contacts_decision_maker ON contacts(decision_maker_level);
CREATE INDEX idx_contacts_last_engagement ON contacts(last_engagement_date);

CREATE INDEX idx_contact_groups_organization_id ON contact_groups(organization_id);
CREATE INDEX idx_contact_group_memberships_contact_id ON contact_group_memberships(contact_id);
CREATE INDEX idx_contact_group_memberships_group_id ON contact_group_memberships(group_id);

CREATE INDEX idx_contact_goal_roles_contact_id ON contact_goal_roles(contact_id);
CREATE INDEX idx_contact_goal_roles_goal_id ON contact_goal_roles(goal_id);

CREATE INDEX idx_engagement_participants_engagement_id ON engagement_participants(engagement_id);
CREATE INDEX idx_engagement_participants_contact_id ON engagement_participants(contact_id);

CREATE INDEX idx_contact_hierarchy_organization_id ON contact_hierarchy(organization_id);
CREATE INDEX idx_contact_hierarchy_parent_contact_id ON contact_hierarchy(parent_contact_id);

CREATE INDEX idx_automation_recipients_automation_id ON automation_recipients(automation_id);
CREATE INDEX idx_automation_recipients_contact_id ON automation_recipients(contact_id);
CREATE INDEX idx_automation_recipients_group_id ON automation_recipients(group_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_groups_updated_at BEFORE UPDATE ON contact_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries

-- Contact summary with account and manager info
CREATE VIEW contact_summary AS
SELECT 
  c.id,
  c.organization_id,
  c.account_id,
  a.name as account_name,
  c.first_name,
  c.last_name,
  c.first_name || ' ' || c.last_name as full_name,
  c.email,
  c.phone,
  c.title,
  c.department,
  c.seniority_level,
  c.decision_maker_level,
  c.primary_contact,
  c.contact_status,
  c.relationship_strength,
  c.last_engagement_date,
  m.first_name || ' ' || m.last_name as manager_name,
  c.created_at,
  c.updated_at,
  -- Count of groups this contact belongs to
  (SELECT COUNT(*) FROM contact_group_memberships cgm WHERE cgm.contact_id = c.id) as group_count,
  -- Count of direct reports
  (SELECT COUNT(*) FROM contacts reports WHERE reports.manager_id = c.id) as direct_reports_count
FROM contacts c
LEFT JOIN accounts a ON c.account_id = a.id
LEFT JOIN contacts m ON c.manager_id = m.id;

-- Decision maker analysis view
CREATE VIEW decision_maker_analysis AS
SELECT 
  a.id as account_id,
  a.name as account_name,
  a.organization_id,
  COUNT(CASE WHEN c.decision_maker_level = 'Primary' THEN 1 END) as primary_decision_makers,
  COUNT(CASE WHEN c.decision_maker_level = 'Influencer' THEN 1 END) as influencers,
  COUNT(CASE WHEN c.decision_maker_level = 'User' THEN 1 END) as users,
  COUNT(CASE WHEN c.decision_maker_level = 'Gatekeeper' THEN 1 END) as gatekeepers,
  COUNT(CASE WHEN c.decision_maker_level = 'Unknown' THEN 1 END) as unknown_role,
  COUNT(CASE WHEN c.seniority_level = 'C-Level' THEN 1 END) as c_level_contacts,
  COUNT(CASE WHEN c.seniority_level = 'VP' THEN 1 END) as vp_contacts,
  COUNT(CASE WHEN c.relationship_strength = 'champion' THEN 1 END) as champions,
  COUNT(CASE WHEN c.relationship_strength = 'supporter' THEN 1 END) as supporters,
  COUNT(CASE WHEN c.relationship_strength = 'detractor' THEN 1 END) as detractors,
  COUNT(*) as total_contacts
FROM accounts a
LEFT JOIN contacts c ON a.id = c.account_id AND c.contact_status = 'active'
GROUP BY a.id, a.name, a.organization_id;

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_goal_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_recipients ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Users can view contacts in their organization" ON contacts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create contacts in their organization" ON contacts
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update contacts in their organization" ON contacts
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contacts in their organization" ON contacts
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Contact groups policies (similar pattern)
CREATE POLICY "Users can view contact groups in their organization" ON contact_groups
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage contact groups in their organization" ON contact_groups
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Similar policies for other tables (abbreviated for space)
CREATE POLICY "Users can manage contact group memberships" ON contact_group_memberships
  FOR ALL USING (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage contact goal roles" ON contact_goal_roles
  FOR ALL USING (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage engagement participants" ON engagement_participants
  FOR ALL USING (
    contact_id IN (
      SELECT id FROM contacts WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage contact hierarchy" ON contact_hierarchy
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage automation recipients" ON automation_recipients
  FOR ALL USING (
    automation_id IN (
      SELECT id FROM automations WHERE organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Sample data for testing
INSERT INTO contact_groups (organization_id, name, description, color) VALUES
  ((SELECT id FROM organizations LIMIT 1), 'Executive Team', 'C-level executives and senior leadership', '#DC2626'),
  ((SELECT id FROM organizations LIMIT 1), 'IT Department', 'Information Technology team members', '#2563EB'),
  ((SELECT id FROM organizations LIMIT 1), 'Decision Makers', 'Key decision makers for our solution', '#059669'),
  ((SELECT id FROM organizations LIMIT 1), 'Champions', 'Internal advocates for our solution', '#7C3AED');

-- Sample contacts (will be added after accounts exist)
-- This will be populated by the application or additional scripts