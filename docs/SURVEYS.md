# Survey System

> **Navigation**: [← Automation](./AUTOMATION.md) | [Back to README](../README.md) | [Next: Integrations →](./INTEGRATIONS.md)

The Survey System enables customer success teams to collect feedback, measure satisfaction, and gain insights through branded customer surveys and NPS campaigns.

## 📋 Table of Contents

- [Overview](#overview)
- [NPS Surveys](#nps-surveys)
- [Custom Surveys](#custom-surveys)
- [Survey Builder](#survey-builder)
- [Distribution & Delivery](#distribution--delivery)
- [Response Analytics](#response-analytics)
- [Survey Management](#survey-management)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)

---

## Overview

The Survey System provides comprehensive feedback collection capabilities:

- **NPS Tracking**: Automated Net Promoter Score collection and analysis
- **Custom Surveys**: Build tailored surveys for specific use cases
- **Branded Templates**: Professional, customizable survey designs
- **Multi-channel Distribution**: Email, web, and API-based survey delivery
- **Real-time Analytics**: Track responses, trends, and insights
- **Automated Follow-up**: Trigger actions based on survey responses

### Key Features
- Visual survey builder
- NPS automation and tracking
- Response analytics and reporting
- Integration with customer data
- Automated follow-up workflows
- Multi-language support

---

## NPS Surveys

### NPS Overview

Net Promoter Score (NPS) measures customer loyalty and satisfaction using a simple 0-10 rating scale.

```typescript
interface NPSSurvey {
  id: string
  organization_id: string
  account_id: string
  score: number  // 0-10
  feedback: string | null
  survey_date: string
  respondent_name: string | null
  respondent_email: string | null
  created_at: string
}
```

### NPS Categories

- **Promoters (9-10)**: Loyal customers who will recommend your product
- **Passives (7-8)**: Satisfied but unenthusiastic customers
- **Detractors (0-6)**: Unhappy customers who may damage your brand

### NPS Calculation

```typescript
function calculateNPS(responses: NPSSurvey[]): number {
  const total = responses.length
  const promoters = responses.filter(r => r.score >= 9).length
  const detractors = responses.filter(r => r.score <= 6).length
  
  const promoterPercentage = (promoters / total) * 100
  const detractorPercentage = (detractors / total) * 100
  
  return promoterPercentage - detractorPercentage
}
```

### NPS Management

#### 1. NPS Dashboard
- **Location**: `/dashboard/surveys`
- **Component**: `components/surveys/surveys-client.tsx`
- **API**: `GET /api/nps`

Features:
- Current NPS score display
- Trend analysis over time
- Response distribution
- Feedback highlights

#### 2. Automated NPS Collection
- Scheduled NPS campaigns
- Trigger-based surveys
- Follow-up sequences
- Response tracking

#### 3. NPS Analytics
- Score trends over time
- Segmentation by customer attributes
- Response rate analysis
- Feedback sentiment analysis

---

## Custom Surveys

### Survey Structure

```typescript
interface Survey {
  id: string
  organization_id: string
  title: string
  description: string | null
  type: 'nps' | 'csat' | 'custom'
  status: 'draft' | 'active' | 'paused' | 'completed'
  questions: SurveyQuestion[]
  settings: SurveySettings
  branding: SurveyBranding
  created_at: string
  updated_at: string
}

interface SurveyQuestion {
  id: string
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no' | 'nps'
  question: string
  required: boolean
  options?: string[]
  scale?: {
    min: number
    max: number
    labels?: string[]
  }
}

interface SurveySettings {
  allow_anonymous: boolean
  require_email: boolean
  send_confirmation: boolean
  redirect_url?: string
  response_limit?: number
  expiry_date?: string
}

interface SurveyBranding {
  logo_url?: string
  primary_color: string
  background_color: string
  font_family: string
  custom_css?: string
}
```

### Survey Types

#### 1. Customer Satisfaction (CSAT)
```typescript
const csatSurvey = {
  type: 'csat',
  questions: [
    {
      type: 'rating',
      question: 'How satisfied are you with our service?',
      scale: { min: 1, max: 5, labels: ['Very Unsatisfied', 'Very Satisfied'] }
    },
    {
      type: 'text',
      question: 'What could we improve?',
      required: false
    }
  ]
}
```

#### 2. Product Feedback
```typescript
const productFeedback = {
  type: 'custom',
  questions: [
    {
      type: 'multiple_choice',
      question: 'Which features do you use most?',
      options: ['Dashboard', 'Reports', 'Integrations', 'Automation']
    },
    {
      type: 'rating',
      question: 'How easy is our product to use?',
      scale: { min: 1, max: 10 }
    }
  ]
}
```

#### 3. Onboarding Feedback
```typescript
const onboardingFeedback = {
  type: 'custom',
  questions: [
    {
      type: 'yes_no',
      question: 'Did you complete the onboarding process?'
    },
    {
      type: 'rating',
      question: 'How would you rate the onboarding experience?',
      scale: { min: 1, max: 5 }
    },
    {
      type: 'text',
      question: 'What was the most challenging part?'
    }
  ]
}
```

---

## Survey Builder

### Visual Survey Builder

#### 1. Survey Creation
- **Location**: `/dashboard/surveys/new`
- **Component**: `components/surveys/create-survey-dialog.tsx`
- **API**: `POST /api/surveys`

Features:
- Drag-and-drop question builder
- Question type selection
- Logic and branching
- Preview functionality

#### 2. Question Types

##### Rating Questions
```typescript
interface RatingQuestion {
  type: 'rating'
  question: string
  scale: {
    min: number
    max: number
    step?: number
    labels?: string[]
  }
  display: 'stars' | 'numbers' | 'slider'
}
```

##### Multiple Choice
```typescript
interface MultipleChoiceQuestion {
  type: 'multiple_choice'
  question: string
  options: string[]
  allow_multiple: boolean
  allow_other: boolean
}
```

##### Text Questions
```typescript
interface TextQuestion {
  type: 'text'
  question: string
  placeholder?: string
  max_length?: number
  validation?: 'email' | 'url' | 'phone'
}
```

#### 3. Survey Logic
- Conditional questions
- Skip logic
- Question branching
- Dynamic content

#### 4. Branding Customization
- Logo upload
- Color scheme
- Font selection
- Custom CSS
- White-label options

---

## Distribution & Delivery

### Distribution Channels

#### 1. Email Distribution
- **Component**: `components/surveys/send-survey-dialog.tsx`
- **API**: `POST /api/surveys/[id]/send`

Features:
- Bulk email sending
- Personalized invitations
- Reminder sequences
- Delivery tracking

#### 2. Web Links
- Shareable survey URLs
- Embedded surveys
- QR code generation
- Social media sharing

#### 3. API Integration
- Programmatic survey distribution
- In-app survey triggers
- Custom integration points
- Webhook notifications

### Email Templates

#### 1. Survey Invitation
```html
<!DOCTYPE html>
<html>
<head>
  <title>We'd love your feedback</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Hi {{contact.name}},</h1>
    
    <p>We hope you're enjoying {{product.name}}! We'd love to hear about your experience.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{survey.url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
        Take Survey (2 minutes)
      </a>
    </div>
    
    <p>Your feedback helps us improve and serve you better.</p>
    
    <p>Thanks,<br>The {{company.name}} Team</p>
  </div>
</body>
</html>
```

#### 2. Survey Reminder
```html
<div style="max-width: 600px; margin: 0 auto;">
  <h1>Quick reminder: Your feedback matters</h1>
  
  <p>Hi {{contact.name}},</p>
  
  <p>We sent you a survey a few days ago and wanted to follow up. Your input is valuable to us!</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{survey.url}}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">
      Complete Survey Now
    </a>
  </div>
  
  <p><small>This survey takes less than 2 minutes to complete.</small></p>
</div>
```

### Delivery Management

#### 1. Send Scheduling
- Immediate delivery
- Scheduled campaigns
- Time zone optimization
- Delivery windows

#### 2. Response Tracking
- Email open rates
- Click-through rates
- Response rates
- Completion rates

#### 3. Follow-up Automation
- Reminder sequences
- Thank you messages
- Non-response follow-ups
- Response-based actions

---

## Response Analytics

### Response Data Structure

```typescript
interface SurveyResponse {
  id: string
  survey_id: string
  account_id?: string
  respondent_email?: string
  respondent_name?: string
  responses: QuestionResponse[]
  completed: boolean
  submitted_at: string
  ip_address?: string
  user_agent?: string
}

interface QuestionResponse {
  question_id: string
  question_type: string
  value: any
  text_value?: string
}
```

### Analytics Dashboard

#### 1. Response Overview
- **Component**: `components/surveys/survey-analytics.tsx`

Metrics:
- Total responses
- Response rate
- Completion rate
- Average completion time

#### 2. Question Analysis
- Response distribution
- Average ratings
- Text response themes
- Sentiment analysis

#### 3. Trend Analysis
- Response trends over time
- Segmentation analysis
- Comparative studies
- Benchmark comparisons

### NPS Analytics

#### 1. NPS Score Tracking
```typescript
interface NPSAnalytics {
  current_score: number
  previous_score: number
  trend: 'improving' | 'declining' | 'stable'
  promoters: number
  passives: number
  detractors: number
  total_responses: number
  response_rate: number
}
```

#### 2. Segmentation
- NPS by customer segment
- Industry benchmarks
- Account size analysis
- Geographic distribution

#### 3. Feedback Analysis
- Sentiment scoring
- Theme extraction
- Action item identification
- Priority recommendations

---

## Survey Management

### Survey Administration

#### 1. Survey Dashboard
- **Location**: `/dashboard/surveys`
- **Component**: `components/surveys/surveys-client.tsx`

Features:
- Active survey monitoring
- Response tracking
- Performance metrics
- Quick actions

#### 2. Survey Lifecycle
```typescript
interface SurveyLifecycle {
  draft: 'Survey being created and configured'
  active: 'Survey is live and collecting responses'
  paused: 'Survey temporarily stopped'
  completed: 'Survey finished and archived'
}
```

#### 3. Survey Settings
- Response limits
- Expiry dates
- Access controls
- Data retention

### Response Management

#### 1. Response Viewing
- **Component**: `components/surveys/survey-responses.tsx`
- Individual response details
- Bulk response export
- Response filtering
- Data visualization

#### 2. Response Actions
- Flag important responses
- Assign follow-up tasks
- Export to CRM
- Trigger automations

#### 3. Data Export
- CSV/Excel export
- API data access
- Integration exports
- Custom reporting

---

## API Reference

### Survey Endpoints

#### GET /api/surveys
List all surveys.

**Query Parameters:**
- `status`: Filter by survey status
- `type`: Filter by survey type
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "surveys": [
    {
      "id": "uuid",
      "title": "Q1 Customer Satisfaction",
      "type": "csat",
      "status": "active",
      "response_count": 45,
      "response_rate": 0.68,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 25
}
```

#### POST /api/surveys
Create a new survey.

#### GET /api/surveys/[id]
Get survey details.

#### PUT /api/surveys/[id]
Update survey.

#### DELETE /api/surveys/[id]
Delete survey.

#### POST /api/surveys/[id]/send
Send survey to recipients.

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "customer@example.com",
      "name": "John Doe",
      "account_id": "uuid"
    }
  ],
  "send_immediately": true,
  "reminder_schedule": ["3d", "1w"]
}
```

### Response Endpoints

#### GET /api/surveys/[id]/responses
Get survey responses.

#### POST /api/surveys/[id]/responses
Submit survey response.

#### GET /api/surveys/[id]/analytics
Get survey analytics.

### NPS Endpoints

#### GET /api/nps
Get NPS data and analytics.

#### POST /api/nps
Submit NPS response.

#### GET /api/nps/trends
Get NPS trends over time.

---

## Database Schema

### Core Tables

#### surveys
```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'custom' CHECK (type IN ('nps', 'csat', 'custom')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  questions JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### survey_responses
```sql
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id),
  account_id UUID REFERENCES accounts(id),
  respondent_email VARCHAR(255),
  respondent_name VARCHAR(255),
  responses JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

#### nps_surveys
```sql
CREATE TABLE nps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  survey_date DATE DEFAULT CURRENT_DATE,
  respondent_name VARCHAR(255),
  respondent_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- Survey indexes
CREATE INDEX idx_surveys_organization_id ON surveys(organization_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_type ON surveys(type);

-- Response indexes
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_account_id ON survey_responses(account_id);
CREATE INDEX idx_survey_responses_submitted_at ON survey_responses(submitted_at);

-- NPS indexes
CREATE INDEX idx_nps_surveys_organization_id ON nps_surveys(organization_id);
CREATE INDEX idx_nps_surveys_account_id ON nps_surveys(account_id);
CREATE INDEX idx_nps_surveys_survey_date ON nps_surveys(survey_date);
CREATE INDEX idx_nps_surveys_score ON nps_surveys(score);
```

---

## Integration Points

### CRM Integration

#### 1. Response Sync
- Sync survey responses to CRM
- Update customer records
- Trigger CRM workflows
- Create follow-up tasks

#### 2. Customer Data
- Import customer contacts
- Sync account information
- Update customer segments
- Track engagement history

### Automation Integration

#### 1. Survey Triggers
- Trigger surveys based on customer events
- Automated follow-up sequences
- Response-based actions
- Escalation workflows

#### 2. Response Actions
- Create tasks for negative feedback
- Update health scores
- Trigger intervention workflows
- Send thank you messages

---

## Best Practices

### Survey Design

#### 1. Keep It Short
- Limit to 5-7 questions
- Use clear, simple language
- Avoid leading questions
- Test with real users

#### 2. Timing Matters
- Send at optimal times
- Consider customer journey stage
- Avoid survey fatigue
- Respect time zones

#### 3. Follow Up
- Thank respondents
- Share results when appropriate
- Act on feedback
- Close the feedback loop

### Response Management

#### 1. Quick Response
- Respond to negative feedback quickly
- Acknowledge all responses
- Take action on suggestions
- Communicate improvements

#### 2. Data Quality
- Validate email addresses
- Remove duplicates
- Clean response data
- Maintain data integrity

---

## Related Documentation

- **[Customer Management](./CUSTOMER_MANAGEMENT.md)** - Customer data for survey targeting
- **[Automation System](./AUTOMATION.md)** - Automated survey workflows
- **[Email Setup Guide](../EMAIL_SETUP_GUIDE.md)** - Email configuration for surveys
- **[Analytics](./ANALYTICS.md)** - Survey response analytics

---

> **Navigation**: [← Automation](./AUTOMATION.md) | [Back to README](../README.md) | [Next: Integrations →](./INTEGRATIONS.md)