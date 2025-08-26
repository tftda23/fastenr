# Automation System

> **Navigation**: [← Analytics](./ANALYTICS.md) | [Back to README](../README.md) | [Next: Surveys →](./SURVEYS.md)

The Automation System enables customer success teams to create intelligent workflows that automatically respond to customer behavior, health changes, and business events.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflow Builder](#workflow-builder)
- [Triggers](#triggers)
- [Conditions](#conditions)
- [Actions](#actions)
- [Email Automation](#email-automation)
- [Workflow Management](#workflow-management)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

The Automation System provides a powerful workflow engine that helps customer success teams:

- **Automate Routine Tasks**: Reduce manual work with intelligent automation
- **Proactive Interventions**: Automatically respond to customer health changes
- **Consistent Communication**: Ensure timely and relevant customer outreach
- **Scale Operations**: Handle more customers without increasing team size
- **Data-Driven Actions**: Trigger actions based on real customer data

### Key Features
- Visual workflow builder
- Flexible trigger and condition system
- Multi-channel action support
- Email template management
- Workflow analytics and optimization
- Team collaboration tools

---

## Workflow Builder

### Workflow Structure

```typescript
interface AutomationWorkflow {
  id: string
  organization_id: string
  name: string
  description: string | null
  status: 'draft' | 'active' | 'paused'
  enabled: boolean
  scope_all_accounts: boolean
  
  trigger_type: string
  trigger_config: Record<string, any>
  condition_config: Record<string, any>
  action_type: string
  action_config: Record<string, any>
  
  last_run_at: string | null
  created_at: string
  updated_at: string
}
```

### Workflow Components

1. **Trigger**: What starts the workflow
2. **Conditions**: When the workflow should run
3. **Actions**: What the workflow does
4. **Scope**: Which customers are affected

### Workflow Builder Interface

#### 1. Visual Editor
- **Location**: `/dashboard/admin/automation`
- **Component**: `components/admin/automation-client.tsx`
- **API**: `GET /api/admin/automation`

Features:
- Drag-and-drop workflow creation
- Real-time validation
- Template library
- Workflow testing tools

#### 2. Workflow Templates
Pre-built workflows for common scenarios:
- Onboarding sequences
- Health score alerts
- Renewal reminders
- Churn prevention campaigns
- Expansion opportunities

---

## Triggers

### Trigger Types

#### 1. Health Score Changes
```typescript
interface HealthScoreTrigger {
  type: 'health_score_change'
  config: {
    threshold: number
    direction: 'increase' | 'decrease' | 'both'
    minimum_change: number
    time_window: string // '1h', '1d', '1w'
  }
}
```

**Use Cases:**
- Alert when health score drops below 60
- Celebrate when health score improves significantly
- Monitor rapid health changes

#### 2. Engagement Events
```typescript
interface EngagementTrigger {
  type: 'engagement_event'
  config: {
    event_type: 'meeting_missed' | 'negative_outcome' | 'no_response'
    time_threshold: string
    engagement_types: string[]
  }
}
```

**Use Cases:**
- Follow up on missed meetings
- Escalate negative engagement outcomes
- Re-engage inactive customers

#### 3. Time-Based Triggers
```typescript
interface TimeTrigger {
  type: 'scheduled'
  config: {
    schedule: 'daily' | 'weekly' | 'monthly'
    time: string // '09:00'
    timezone: string
    days_of_week?: number[]
  }
}
```

**Use Cases:**
- Weekly health score reports
- Monthly business reviews
- Quarterly renewal preparations

#### 4. Account Status Changes
```typescript
interface StatusTrigger {
  type: 'status_change'
  config: {
    from_status?: string
    to_status: string
    include_new_accounts: boolean
  }
}
```

**Use Cases:**
- Welcome new customers
- Intervene when accounts become at-risk
- Process churned accounts

#### 5. Goal Events
```typescript
interface GoalTrigger {
  type: 'goal_event'
  config: {
    event: 'created' | 'achieved' | 'missed' | 'at_risk'
    goal_types?: string[]
  }
}
```

**Use Cases:**
- Celebrate goal achievements
- Intervene on missed goals
- Adjust strategies for at-risk goals

---

## Conditions

### Condition Types

#### 1. Account Filters
```typescript
interface AccountCondition {
  type: 'account_filter'
  config: {
    industry?: string[]
    size?: string[]
    arr_min?: number
    arr_max?: number
    health_score_min?: number
    health_score_max?: number
    churn_risk_min?: number
    churn_risk_max?: number
  }
}
```

#### 2. Time Conditions
```typescript
interface TimeCondition {
  type: 'time_condition'
  config: {
    business_hours_only: boolean
    timezone: string
    excluded_dates?: string[]
    days_of_week?: number[]
  }
}
```

#### 3. Engagement History
```typescript
interface EngagementCondition {
  type: 'engagement_history'
  config: {
    last_engagement_days?: number
    engagement_count_min?: number
    engagement_types?: string[]
    outcomes?: string[]
  }
}
```

#### 4. Custom Conditions
```typescript
interface CustomCondition {
  type: 'custom'
  config: {
    field: string
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
    value: any
  }
}
```

---

## Actions

### Action Types

#### 1. Email Actions
```typescript
interface EmailAction {
  type: 'send_email'
  config: {
    template_id: string
    recipients: {
      customer_contacts: boolean
      internal_team: boolean
      specific_emails?: string[]
    }
    personalization: Record<string, string>
    delay?: string // '1h', '1d'
  }
}
```

#### 2. Task Creation
```typescript
interface TaskAction {
  type: 'create_task'
  config: {
    title: string
    description: string
    assignee: string
    due_date_offset: string // '+3d', '+1w'
    priority: 'low' | 'medium' | 'high'
  }
}
```

#### 3. Health Score Updates
```typescript
interface HealthScoreAction {
  type: 'update_health_score'
  config: {
    adjustment: number
    reason: string
    temporary: boolean
    duration?: string
  }
}
```

#### 4. Status Changes
```typescript
interface StatusAction {
  type: 'change_status'
  config: {
    new_status: string
    reason: string
    notify_team: boolean
  }
}
```

#### 5. Integration Actions
```typescript
interface IntegrationAction {
  type: 'integration_action'
  config: {
    integration: 'hubspot' | 'salesforce' | 'slack'
    action: string
    parameters: Record<string, any>
  }
}
```

#### 6. Webhook Actions
```typescript
interface WebhookAction {
  type: 'webhook'
  config: {
    url: string
    method: 'POST' | 'PUT'
    headers: Record<string, string>
    payload: Record<string, any>
    retry_count: number
  }
}
```

---

## Email Automation

### Email Templates

#### 1. Template Management
- **Location**: `/dashboard/admin/automation/templates`
- **Component**: `components/admin/email-template-editor.tsx`

Features:
- Rich text editor
- Variable interpolation
- Preview functionality
- A/B testing support

#### 2. Template Variables
```typescript
interface TemplateVariables {
  account: {
    name: string
    health_score: number
    status: string
    arr: number
    industry: string
  }
  contact: {
    name: string
    email: string
    role: string
  }
  engagement: {
    last_meeting_date: string
    last_engagement_type: string
    next_meeting_date: string
  }
  goals: {
    active_goals: number
    completed_goals: number
    at_risk_goals: number
  }
  custom: Record<string, any>
}
```

#### 3. Email Types

##### Onboarding Emails
```typescript
const onboardingSequence = [
  {
    trigger: 'account_created',
    delay: '0h',
    template: 'welcome_email',
    subject: 'Welcome to {{account.name}}!'
  },
  {
    trigger: 'previous_email_sent',
    delay: '3d',
    template: 'getting_started',
    subject: 'Getting started with {{product_name}}'
  },
  {
    trigger: 'previous_email_sent',
    delay: '1w',
    template: 'first_week_checkin',
    subject: 'How are things going?'
  }
]
```

##### Health Alert Emails
```typescript
const healthAlerts = [
  {
    trigger: 'health_score_drop',
    condition: 'health_score < 60',
    template: 'health_concern',
    recipients: ['account_owner', 'customer_contact']
  },
  {
    trigger: 'churn_risk_increase',
    condition: 'churn_risk > 70',
    template: 'urgent_intervention',
    recipients: ['cs_manager', 'account_owner']
  }
]
```

##### Renewal Campaigns
```typescript
const renewalCampaign = [
  {
    trigger: 'contract_expiry',
    delay: '-90d',
    template: 'renewal_planning',
    subject: 'Let\'s plan your renewal'
  },
  {
    trigger: 'contract_expiry',
    delay: '-30d',
    template: 'renewal_reminder',
    subject: 'Your contract expires soon'
  },
  {
    trigger: 'contract_expiry',
    delay: '-7d',
    template: 'urgent_renewal',
    subject: 'Action required: Contract renewal'
  }
]
```

### Email Delivery

#### 1. Delivery Engine
- **File**: `lib/automation-email.ts`
- Queue-based email processing
- Retry logic for failed deliveries
- Delivery status tracking
- Bounce and complaint handling

#### 2. Personalization
- Dynamic content insertion
- Conditional content blocks
- Localization support
- Custom field mapping

#### 3. Analytics
- Open rate tracking
- Click-through rates
- Response monitoring
- A/B test results

---

## Workflow Management

### Workflow Administration

#### 1. Workflow Dashboard
- **Location**: `/dashboard/admin/automation`
- **Component**: `components/admin/automation-client.tsx`

Features:
- Active workflow monitoring
- Performance metrics
- Error tracking
- Workflow analytics

#### 2. Workflow Creation
- **Component**: `components/admin/create-automation-dialog.tsx`
- **API**: `POST /api/admin/automation`

Workflow creation process:
1. Choose trigger type
2. Configure conditions
3. Define actions
4. Set scope and schedule
5. Test and activate

#### 3. Workflow Editing
- **Component**: `components/admin/edit-automation-dialog.tsx`
- **API**: `PUT /api/admin/automation/[id]`

Edit capabilities:
- Modify trigger conditions
- Update action parameters
- Change workflow scope
- Adjust timing and schedules

### Workflow Execution

#### 1. Execution Engine
```typescript
interface WorkflowExecution {
  workflow_id: string
  trigger_data: any
  execution_context: {
    account_id: string
    user_id?: string
    timestamp: string
  }
  steps: ExecutionStep[]
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  error?: string
}
```

#### 2. Execution Monitoring
- Real-time execution tracking
- Error logging and alerting
- Performance metrics
- Retry mechanisms

#### 3. Execution History
```typescript
interface AutomationRun {
  id: string
  workflow_id: string
  status: 'queued' | 'running' | 'success' | 'failed' | 'skipped'
  started_at: string | null
  finished_at: string | null
  result?: Record<string, any> | null
  error?: string | null
}
```

---

## API Reference

### Automation Endpoints

#### GET /api/admin/automation
List all automation workflows.

**Query Parameters:**
- `status`: Filter by workflow status
- `type`: Filter by trigger type
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "Health Score Alert",
      "status": "active",
      "trigger_type": "health_score_change",
      "last_run_at": "2024-01-15T10:00:00Z",
      "run_count": 45,
      "success_rate": 0.95
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 25
}
```

#### POST /api/admin/automation
Create a new automation workflow.

**Request Body:**
```json
{
  "name": "Onboarding Sequence",
  "description": "Welcome new customers",
  "trigger_type": "account_created",
  "trigger_config": {
    "status": "onboarding"
  },
  "condition_config": {
    "account_filter": {
      "size": ["small", "medium"]
    }
  },
  "action_type": "send_email",
  "action_config": {
    "template_id": "welcome_template",
    "delay": "1h"
  }
}
```

#### PUT /api/admin/automation/[id]
Update an existing workflow.

#### DELETE /api/admin/automation/[id]
Delete a workflow.

#### POST /api/admin/automation/[id]/test
Test a workflow with sample data.

#### GET /api/admin/automation/[id]/runs
Get execution history for a workflow.

### Execution Endpoints

#### POST /api/admin/automation/execute
Manually trigger workflow execution.

#### GET /api/admin/automation/runs
Get all workflow execution history.

#### GET /api/admin/automation/stats
Get automation system statistics.

---

## Database Schema

### Core Tables

#### automation_workflows
```sql
CREATE TABLE automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  enabled BOOLEAN DEFAULT true,
  scope_all_accounts BOOLEAN DEFAULT true,
  
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  condition_config JSONB DEFAULT '{}',
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB DEFAULT '{}',
  
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### automation_runs
```sql
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES automation_workflows(id),
  account_id UUID REFERENCES accounts(id),
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'failed', 'skipped')),
  trigger_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### email_templates
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- Workflow indexes
CREATE INDEX idx_automation_workflows_org_id ON automation_workflows(organization_id);
CREATE INDEX idx_automation_workflows_status ON automation_workflows(status);
CREATE INDEX idx_automation_workflows_trigger_type ON automation_workflows(trigger_type);

-- Run indexes
CREATE INDEX idx_automation_runs_workflow_id ON automation_runs(workflow_id);
CREATE INDEX idx_automation_runs_account_id ON automation_runs(account_id);
CREATE INDEX idx_automation_runs_status ON automation_runs(status);
CREATE INDEX idx_automation_runs_created_at ON automation_runs(created_at);
```

---

## Best Practices

### Workflow Design

#### 1. Start Simple
- Begin with basic trigger-action workflows
- Add complexity gradually
- Test thoroughly before activation
- Monitor performance and adjust

#### 2. Use Conditions Wisely
- Filter to relevant customers only
- Avoid over-automation
- Respect customer preferences
- Include time-based conditions

#### 3. Email Best Practices
- Personalize content
- Use clear subject lines
- Include unsubscribe options
- Monitor deliverability

### Performance Optimization

#### 1. Efficient Triggers
- Use specific trigger conditions
- Avoid overly broad triggers
- Implement rate limiting
- Monitor resource usage

#### 2. Batch Processing
- Group similar actions
- Process in batches
- Use background jobs
- Implement retry logic

#### 3. Monitoring and Alerting
- Track workflow performance
- Monitor error rates
- Set up failure alerts
- Regular performance reviews

---

## Related Documentation

- **[Customer Management](./CUSTOMER_MANAGEMENT.md)** - Customer data for automation triggers
- **[Analytics](./ANALYTICS.md)** - Automation performance analytics
- **[Email Setup Guide](../EMAIL_SETUP_GUIDE.md)** - Email configuration for automation
- **[API Documentation](./API.md)** - Complete automation API reference

---

> **Navigation**: [← Analytics](./ANALYTICS.md) | [Back to README](../README.md) | [Next: Surveys →](./SURVEYS.md)