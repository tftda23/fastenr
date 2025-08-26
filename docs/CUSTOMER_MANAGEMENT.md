# Customer Management

> **Navigation**: [← Back to README](../README.md) | [Next: Analytics →](./ANALYTICS.md)

The Customer Management system is the core of fastenr, providing comprehensive tools to track, manage, and optimize customer relationships throughout their lifecycle.

## 📋 Table of Contents

- [Overview](#overview)
- [Account Management](#account-management)
- [Engagement Tracking](#engagement-tracking)
- [Health Scoring](#health-scoring)
- [Goal Setting](#goal-setting)
- [User Interface](#user-interface)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

The Customer Management module provides a 360-degree view of your customers, combining account data, engagement history, health metrics, and goal tracking in a unified interface.

### Key Features
- **Account Profiles**: Comprehensive customer information and status tracking
- **Engagement History**: Complete timeline of customer interactions
- **Health Monitoring**: Real-time health scores and churn risk assessment
- **Goal Management**: Customer success goals and milestone tracking
- **Activity Feeds**: Real-time updates and notifications

---

## Account Management

### Account Structure

Each customer account contains:

```typescript
interface Account {
  id: string
  organization_id: string
  name: string
  industry: string | null
  size: "startup" | "small" | "medium" | "large" | "enterprise" | null
  arr: number | null  // Annual Recurring Revenue
  status: "active" | "churned" | "at_risk" | "onboarding"
  health_score: number  // 0-100
  churn_risk_score: number  // 0-100
  created_at: string
  updated_at: string
}
```

### Account Statuses

| Status | Description | Typical Actions |
|--------|-------------|-----------------|
| `onboarding` | New customer in implementation phase | Setup calls, training sessions |
| `active` | Healthy, engaged customer | Regular check-ins, expansion opportunities |
| `at_risk` | Showing signs of potential churn | Intervention campaigns, success planning |
| `churned` | Customer has cancelled or left | Win-back campaigns, exit interviews |

### Account Management Features

#### 1. Account Creation
- **Location**: `/dashboard/accounts/new`
- **Component**: `components/accounts/account-form.tsx`
- **API**: `POST /api/accounts`

Create new customer accounts with:
- Basic information (name, industry, size)
- Initial ARR and contract details
- Account owner assignment
- Custom fields and tags

#### 2. Account Profiles
- **Location**: `/dashboard/accounts/[id]`
- **Component**: `components/accounts/account-details.tsx`
- **API**: `GET /api/accounts/[id]`

Comprehensive account view including:
- Account overview and key metrics
- Health score trends and history
- Recent engagement timeline
- Active goals and milestones
- Team members and contacts

#### 3. Account Editing
- **Location**: `/dashboard/accounts/[id]/edit`
- **Component**: `components/accounts/account-form.tsx`
- **API**: `PUT /api/accounts/[id]`

Update account information:
- Contact details and account data
- ARR and contract information
- Status and health score adjustments
- Custom field updates

#### 4. Account Listing
- **Location**: `/dashboard/accounts`
- **Component**: `components/accounts/accounts-client.tsx`
- **API**: `GET /api/accounts`

Features:
- Sortable and filterable account list
- Health score and status indicators
- Quick actions (edit, view, engage)
- Bulk operations
- Export functionality

---

## Engagement Tracking

### Engagement Types

Track all customer touchpoints:

```typescript
interface Engagement {
  id: string
  organization_id: string
  account_id: string
  created_by: string
  type: "meeting" | "call" | "email" | "note" | "demo" | "training"
  title: string
  description: string | null
  outcome: "positive" | "neutral" | "negative" | "action_required" | null
  scheduled_at: string | null
  completed_at: string | null
  attendees: Array<{
    name: string
    email: string
    role: string
  }>
  created_at: string
  updated_at: string
}
```

### Engagement Management

#### 1. Creating Engagements
- **Location**: `/dashboard/engagements/new`
- **Component**: `components/engagements/engagement-form.tsx`
- **API**: `POST /api/engagements`

Log customer interactions:
- Meeting notes and outcomes
- Call summaries and next steps
- Email communications
- Training sessions and demos
- General notes and observations

#### 2. Engagement Timeline
- **Component**: `components/engagements/engagement-list.tsx`
- **API**: `GET /api/engagements`

Features:
- Chronological engagement history
- Filterable by type, outcome, date
- Quick edit and update capabilities
- Attachment support
- Integration with calendar systems

#### 3. Engagement Analytics
- Track engagement frequency and patterns
- Identify communication gaps
- Monitor response times and outcomes
- Measure engagement impact on health scores

---

## Health Scoring

### Health Score Calculation

Health scores are calculated using multiple factors:

```typescript
interface HealthMetric {
  id: string
  organization_id: string
  account_id: string
  metric_date: string
  login_frequency: number
  feature_adoption_score: number
  support_tickets: number
  training_completion_rate: number
  overall_health_score: number
  created_at: string
}
```

### Health Score Components

1. **Product Usage** (40% weight)
   - Login frequency
   - Feature adoption
   - Session duration
   - User activity levels

2. **Support Metrics** (25% weight)
   - Support ticket volume
   - Ticket severity
   - Resolution time
   - Customer satisfaction

3. **Engagement Quality** (20% weight)
   - Meeting frequency
   - Response rates
   - Engagement outcomes
   - Stakeholder participation

4. **Business Metrics** (15% weight)
   - Contract value
   - Payment history
   - Expansion opportunities
   - Renewal likelihood

### Churn Risk Assessment

Churn risk scores (0-100) are calculated using:
- Declining health trends
- Reduced engagement
- Support escalations
- Contract and payment issues
- Competitive intelligence

### Health Monitoring Features

#### 1. Health Dashboards
- **Location**: `/dashboard/health`
- **Component**: `components/health/health-client.tsx`

Real-time health monitoring:
- Health score distributions
- At-risk account identification
- Trend analysis and alerts
- Comparative benchmarking

#### 2. Automated Alerts
- Health score drops below thresholds
- Churn risk increases significantly
- Engagement gaps detected
- Support escalations occur

---

## Goal Setting

### Goal Structure

```typescript
interface CustomerGoal {
  id: string
  organization_id: string
  account_id: string
  title: string
  description: string | null
  metric_type: "accounts" | "arr" | "nps" | "health_score" | "adoption" | "renewals" | "seat_count" | "custom"
  current_value: number
  target_value: number
  unit: string | null
  measurement_period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  status: "on_track" | "at_risk" | "achieved" | "missed"
  target_date: string | null
  completion_date: string | null
  created_at: string
  updated_at: string
}
```

### Goal Management Features

#### 1. Goal Creation
- **Location**: `/dashboard/goals`
- **Component**: `components/goals/goal-form.tsx`
- **API**: `POST /api/goals`

Set customer success goals:
- Adoption milestones
- Usage targets
- Business outcomes
- Training completions
- Custom objectives

#### 2. Goal Tracking
- Progress monitoring and updates
- Automated metric collection
- Status updates and alerts
- Timeline adjustments
- Success celebrations

#### 3. Goal Analytics
- Goal completion rates
- Time-to-achievement analysis
- Goal impact on health scores
- Predictive goal modeling

---

## User Interface

### Dashboard Components

#### 1. Account Overview Cards
```typescript
// components/accounts/account-list.tsx
- Account name and status
- Health score indicator
- Last engagement date
- Quick action buttons
```

#### 2. Health Score Widgets
```typescript
// components/dashboard/health-score-distribution.tsx
- Visual health score representation
- Trend indicators
- Risk level classification
- Comparative metrics
```

#### 3. Engagement Timeline
```typescript
// components/engagements/engagement-list.tsx
- Chronological interaction history
- Engagement type icons
- Outcome indicators
- Quick edit capabilities
```

### Navigation Structure

```
/dashboard/accounts
├── /                    # Account listing
├── /new                 # Create new account
├── /[id]               # Account details
└── /[id]/edit          # Edit account

/dashboard/engagements
├── /                    # Engagement listing
├── /new                 # Create engagement
├── /[id]               # Engagement details
└── /[id]/edit          # Edit engagement

/dashboard/goals
└── /                    # Goal management

/dashboard/health
└── /                    # Health monitoring
```

---

## API Reference

### Account Endpoints

#### GET /api/accounts
List all accounts with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 25)
- `status`: Filter by account status
- `health_min`: Minimum health score
- `health_max`: Maximum health score
- `search`: Search by account name

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "status": "active",
      "health_score": 85,
      "churn_risk_score": 15,
      "arr": 50000,
      "last_engagement": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 25,
  "hasMore": true
}
```

#### POST /api/accounts
Create a new account.

**Request Body:**
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "size": "medium",
  "arr": 50000,
  "status": "onboarding"
}
```

#### GET /api/accounts/[id]
Get detailed account information.

#### PUT /api/accounts/[id]
Update account information.

#### DELETE /api/accounts/[id]
Archive an account.

### Engagement Endpoints

#### GET /api/engagements
List engagements with filtering.

#### POST /api/engagements
Create a new engagement.

#### GET /api/engagements/[id]
Get engagement details.

#### PUT /api/engagements/[id]
Update engagement.

### Health Endpoints

#### GET /api/v1/health
Get health metrics and scores.

#### POST /api/v1/health
Update health metrics.

### Goal Endpoints

#### GET /api/goals
List customer goals.

#### POST /api/goals
Create a new goal.

#### PUT /api/goals/[id]
Update goal progress.

---

## Database Schema

### Core Tables

#### accounts
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  size VARCHAR(20) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  arr DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'churned', 'at_risk', 'onboarding')),
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  churn_risk_score INTEGER DEFAULT 0 CHECK (churn_risk_score >= 0 AND churn_risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### engagements
```sql
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('meeting', 'call', 'email', 'note', 'demo', 'training')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  outcome VARCHAR(20) CHECK (outcome IN ('positive', 'neutral', 'negative', 'action_required')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  attendees JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### health_metrics
```sql
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  metric_date DATE NOT NULL,
  login_frequency INTEGER DEFAULT 0,
  feature_adoption_score INTEGER DEFAULT 0,
  support_tickets INTEGER DEFAULT 0,
  training_completion_rate DECIMAL(5,2) DEFAULT 0,
  overall_health_score INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, metric_date)
);
```

#### customer_goals
```sql
CREATE TABLE customer_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metric_type VARCHAR(50),
  current_value DECIMAL(12,2) DEFAULT 0,
  target_value DECIMAL(12,2),
  unit VARCHAR(50),
  measurement_period VARCHAR(20),
  status VARCHAR(20) DEFAULT 'on_track',
  target_date DATE,
  completion_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- Account indexes
CREATE INDEX idx_accounts_organization_id ON accounts(organization_id);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_health_score ON accounts(health_score);
CREATE INDEX idx_accounts_churn_risk ON accounts(churn_risk_score);

-- Engagement indexes
CREATE INDEX idx_engagements_account_id ON engagements(account_id);
CREATE INDEX idx_engagements_created_at ON engagements(created_at);
CREATE INDEX idx_engagements_type ON engagements(type);

-- Health metrics indexes
CREATE INDEX idx_health_metrics_account_id ON health_metrics(account_id);
CREATE INDEX idx_health_metrics_date ON health_metrics(metric_date);
```

---

## Related Documentation

- **[Analytics & Reporting](./ANALYTICS.md)** - Health score analytics and reporting
- **[Automation System](./AUTOMATION.md)** - Automated workflows for customer management
- **[API Documentation](./API.md)** - Complete API reference
- **[Database Schema](./DATABASE.md)** - Full database documentation

---

> **Navigation**: [← Back to README](../README.md) | [Next: Analytics →](./ANALYTICS.md)