# API Documentation

> **Navigation**: [← Integrations](./INTEGRATIONS.md) | [Back to README](../README.md) | [Documentation Hub](./README.md)

Complete REST API reference for fastenr Customer Success Platform. Build custom integrations, automate workflows, and access your customer data programmatically.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Accounts API](#accounts-api)
- [Engagements API](#engagements-api)
- [Health Metrics API](#health-metrics-api)
- [Goals API](#goals-api)
- [Surveys API](#surveys-api)
- [Analytics API](#analytics-api)
- [Automation API](#automation-api)
- [Webhooks](#webhooks)
- [SDKs & Libraries](#sdks--libraries)

---

## Overview

The fastenr API is a RESTful API that allows you to:

- **Manage Customer Data**: Create, read, update, and delete customer accounts
- **Track Engagements**: Log and retrieve customer interactions
- **Monitor Health**: Access health scores and metrics
- **Automate Workflows**: Trigger automations and manage workflows
- **Collect Feedback**: Send surveys and retrieve responses
- **Access Analytics**: Get insights and reporting data

### Base URL
```
Production: https://api.fastenr.com/v1
Staging: https://staging-api.fastenr.com/v1
```

### API Versions
- **v1** (Current): Stable API with full feature support
- **v2** (Beta): Next generation API with enhanced capabilities

---

## Authentication

### API Key Authentication

The primary authentication method uses API keys in the request header.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.fastenr.com/v1/accounts
```

#### Getting Your API Key
1. Navigate to `/dashboard/admin/settings`
2. Go to "API Keys" section
3. Click "Generate New Key"
4. Copy and securely store your key

#### API Key Scopes
```typescript
interface APIKeyScopes {
  'accounts:read': 'Read customer account data'
  'accounts:write': 'Create and update accounts'
  'engagements:read': 'Read engagement data'
  'engagements:write': 'Create and update engagements'
  'health:read': 'Read health metrics'
  'health:write': 'Update health scores'
  'surveys:read': 'Read survey data'
  'surveys:write': 'Create and send surveys'
  'analytics:read': 'Access analytics data'
  'automation:read': 'Read automation workflows'
  'automation:write': 'Create and manage automations'
  'admin:read': 'Read admin data'
  'admin:write': 'Admin operations'
}
```

### OAuth 2.0 (Coming Soon)

OAuth 2.0 flow for third-party applications.

```typescript
interface OAuthFlow {
  authorization_url: 'https://api.fastenr.com/oauth/authorize'
  token_url: 'https://api.fastenr.com/oauth/token'
  scopes: string[]
  redirect_uri: string
}
```

---

## Rate Limiting

### Default Limits
- **Standard Plan**: 1,000 requests per hour
- **Professional Plan**: 5,000 requests per hour
- **Enterprise Plan**: 25,000 requests per hour
- **Burst Limit**: 100 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 3600
```

### Rate Limit Response
```json
{
  "error": "rate_limit_exceeded",
  "message": "API rate limit exceeded",
  "retry_after": 3600,
  "limit": 1000,
  "remaining": 0,
  "reset": 1640995200
}
```

---

## Response Format

### Success Response
```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "status": "active"
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z",
    "request_id": "req_123456"
  }
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6,
    "has_more": true,
    "next_page": 2,
    "prev_page": null
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z",
    "request_id": "req_123456"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:00:00Z",
    "request_id": "req_123456"
  }
}
```

---

## Error Handling

### HTTP Status Codes
| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes
```typescript
interface ErrorCodes {
  'validation_error': 'Input validation failed'
  'authentication_error': 'Authentication failed'
  'authorization_error': 'Insufficient permissions'
  'not_found': 'Resource not found'
  'rate_limit_exceeded': 'API rate limit exceeded'
  'server_error': 'Internal server error'
  'service_unavailable': 'Service temporarily unavailable'
}
```

---

## Accounts API

### List Accounts
```http
GET /v1/accounts
```

**Query Parameters:**
```typescript
interface AccountsQuery {
  page?: number          // Page number (default: 1)
  limit?: number         // Items per page (default: 25, max: 100)
  status?: string        // Filter by status
  health_min?: number    // Minimum health score
  health_max?: number    // Maximum health score
  search?: string        // Search by name
  industry?: string      // Filter by industry
  size?: string          // Filter by company size
  sort?: string          // Sort field (name, health_score, created_at)
  order?: 'asc' | 'desc' // Sort order
}
```

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.fastenr.com/v1/accounts?status=active&health_min=70&limit=50"
```

**Response:**
```json
{
  "data": [
    {
      "id": "acc_123456",
      "name": "Acme Corporation",
      "industry": "Technology",
      "size": "medium",
      "arr": 50000,
      "status": "active",
      "health_score": 85,
      "churn_risk_score": 15,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "has_more": true
  }
}
```

### Get Account
```http
GET /v1/accounts/{id}
```

**Path Parameters:**
- `id` (string): Account ID

**Query Parameters:**
```typescript
interface AccountDetailQuery {
  include?: string[]  // Additional data to include
  // Options: 'engagements', 'health_metrics', 'goals', 'surveys'
}
```

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.fastenr.com/v1/accounts/acc_123456?include=engagements,health_metrics"
```

### Create Account
```http
POST /v1/accounts
```

**Request Body:**
```json
{
  "name": "New Customer Corp",
  "industry": "Healthcare",
  "size": "large",
  "arr": 100000,
  "status": "onboarding",
  "contacts": [
    {
      "name": "John Doe",
      "email": "john@newcustomer.com",
      "role": "CEO"
    }
  ],
  "custom_fields": {
    "contract_start": "2024-01-01",
    "implementation_manager": "Jane Smith"
  }
}
```

### Update Account
```http
PUT /v1/accounts/{id}
```

**Request Body:** Same as create, but all fields optional

### Delete Account
```http
DELETE /v1/accounts/{id}
```

---

## Engagements API

### List Engagements
```http
GET /v1/engagements
```

**Query Parameters:**
```typescript
interface EngagementsQuery {
  account_id?: string    // Filter by account
  type?: string          // Filter by engagement type
  outcome?: string       // Filter by outcome
  created_by?: string    // Filter by creator
  date_from?: string     // Start date (ISO 8601)
  date_to?: string       // End date (ISO 8601)
  page?: number
  limit?: number
}
```

### Create Engagement
```http
POST /v1/engagements
```

**Request Body:**
```json
{
  "account_id": "acc_123456",
  "type": "meeting",
  "title": "Quarterly Business Review",
  "description": "Discussed Q4 goals and expansion opportunities",
  "outcome": "positive",
  "scheduled_at": "2024-01-15T14:00:00Z",
  "completed_at": "2024-01-15T15:00:00Z",
  "attendees": [
    {
      "name": "John Doe",
      "email": "john@customer.com",
      "role": "CEO"
    },
    {
      "name": "Jane Smith",
      "email": "jane@fastenr.com",
      "role": "Customer Success Manager"
    }
  ],
  "tags": ["qbr", "expansion"],
  "follow_up_required": true,
  "follow_up_date": "2024-01-22T10:00:00Z"
}
```

---

## Health Metrics API

### Get Health Metrics
```http
GET /v1/health
```

**Query Parameters:**
```typescript
interface HealthQuery {
  account_id?: string    // Specific account
  date_from?: string     // Start date
  date_to?: string       // End date
  metrics?: string[]     // Specific metrics to include
  aggregation?: 'daily' | 'weekly' | 'monthly'
}
```

**Response:**
```json
{
  "data": [
    {
      "account_id": "acc_123456",
      "metric_date": "2024-01-15",
      "overall_health_score": 85,
      "login_frequency": 25,
      "feature_adoption_score": 78,
      "support_tickets": 2,
      "training_completion_rate": 90.5,
      "engagement_score": 88
    }
  ]
}
```

### Update Health Score
```http
POST /v1/health
```

**Request Body:**
```json
{
  "account_id": "acc_123456",
  "health_score": 90,
  "reason": "Completed onboarding successfully",
  "metrics": {
    "login_frequency": 30,
    "feature_adoption_score": 85,
    "support_tickets": 1
  }
}
```

---

## Goals API

### List Goals
```http
GET /v1/goals
```

### Create Goal
```http
POST /v1/goals
```

**Request Body:**
```json
{
  "account_id": "acc_123456",
  "title": "Increase Daily Active Users",
  "description": "Grow DAU by 50% over next quarter",
  "metric_type": "adoption",
  "current_value": 100,
  "target_value": 150,
  "unit": "users",
  "measurement_period": "daily",
  "target_date": "2024-04-01",
  "milestones": [
    {
      "title": "25% increase",
      "target_value": 125,
      "target_date": "2024-02-15"
    }
  ]
}
```

---

## Surveys API

### List Surveys
```http
GET /v1/surveys
```

### Create Survey
```http
POST /v1/surveys
```

**Request Body:**
```json
{
  "title": "Q1 Customer Satisfaction Survey",
  "type": "csat",
  "questions": [
    {
      "type": "rating",
      "question": "How satisfied are you with our service?",
      "scale": {
        "min": 1,
        "max": 5,
        "labels": ["Very Unsatisfied", "Very Satisfied"]
      },
      "required": true
    },
    {
      "type": "text",
      "question": "What could we improve?",
      "required": false
    }
  ],
  "settings": {
    "allow_anonymous": false,
    "send_confirmation": true,
    "expiry_date": "2024-03-31"
  }
}
```

### Send Survey
```http
POST /v1/surveys/{id}/send
```

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "customer@example.com",
      "name": "John Doe",
      "account_id": "acc_123456"
    }
  ],
  "send_immediately": true,
  "reminder_schedule": ["3d", "1w"]
}
```

---

## Analytics API

### Dashboard Stats
```http
GET /v1/analytics/dashboard
```

**Response:**
```json
{
  "data": {
    "total_accounts": 150,
    "active_accounts": 120,
    "at_risk_accounts": 25,
    "churned_accounts": 5,
    "average_health_score": 75.5,
    "average_churn_risk": 18.2,
    "total_arr": 2500000,
    "nps_score": 42,
    "trends": {
      "health_score_change": 2.3,
      "churn_risk_change": -1.5,
      "arr_growth": 15.2
    }
  }
}
```

### Health Analytics
```http
GET /v1/analytics/health
```

### Engagement Analytics
```http
GET /v1/analytics/engagements
```

### Churn Risk Analysis
```http
GET /v1/analytics/churn-risk
```

---

## Automation API

### List Workflows
```http
GET /v1/automation/workflows
```

### Create Workflow
```http
POST /v1/automation/workflows
```

**Request Body:**
```json
{
  "name": "Health Score Alert",
  "description": "Alert when health score drops below 60",
  "trigger": {
    "type": "health_score_change",
    "config": {
      "threshold": 60,
      "direction": "decrease"
    }
  },
  "conditions": [
    {
      "type": "account_filter",
      "config": {
        "status": ["active"],
        "arr_min": 10000
      }
    }
  ],
  "actions": [
    {
      "type": "send_email",
      "config": {
        "template_id": "health_alert_template",
        "recipients": ["account_owner", "cs_manager"]
      }
    }
  ]
}
```

### Execute Workflow
```http
POST /v1/automation/workflows/{id}/execute
```

---

## Webhooks

### Webhook Events
```typescript
interface WebhookEvents {
  'account.created': 'New account created'
  'account.updated': 'Account information updated'
  'account.health_changed': 'Health score changed significantly'
  'engagement.created': 'New engagement logged'
  'goal.achieved': 'Customer goal achieved'
  'goal.missed': 'Customer goal missed'
  'survey.completed': 'Survey response received'
  'automation.triggered': 'Automation workflow triggered'
  'churn.risk_increased': 'Churn risk score increased'
}
```

### Webhook Payload
```json
{
  "event": "account.health_changed",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "account_id": "acc_123456",
    "account_name": "Acme Corp",
    "old_health_score": 75,
    "new_health_score": 65,
    "change_percentage": -13.3,
    "change_reason": "decreased_engagement"
  },
  "organization_id": "org_789",
  "webhook_id": "wh_456"
}
```

### Webhook Security
```typescript
// Verify webhook signature
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## SDKs & Libraries

### JavaScript/Node.js
```bash
npm install @fastenr/sdk
```

```javascript
import { FastenrClient } from '@fastenr/sdk';

const client = new FastenrClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.fastenr.com/v1'
});

// List accounts
const accounts = await client.accounts.list({
  status: 'active',
  limit: 50
});

// Create engagement
const engagement = await client.engagements.create({
  account_id: 'acc_123456',
  type: 'meeting',
  title: 'Quarterly Review',
  outcome: 'positive'
});
```

### Python
```bash
pip install fastenr-python
```

```python
from fastenr import FastenrClient

client = FastenrClient(api_key='your_api_key')

# List accounts
accounts = client.accounts.list(status='active', limit=50)

# Create engagement
engagement = client.engagements.create(
    account_id='acc_123456',
    type='meeting',
    title='Quarterly Review',
    outcome='positive'
)
```

### PHP
```bash
composer require fastenr/php-sdk
```

```php
use Fastenr\Client;

$client = new Client(['api_key' => 'your_api_key']);

// List accounts
$accounts = $client->accounts()->list([
    'status' => 'active',
    'limit' => 50
]);

// Create engagement
$engagement = $client->engagements()->create([
    'account_id' => 'acc_123456',
    'type' => 'meeting',
    'title' => 'Quarterly Review',
    'outcome' => 'positive'
]);
```

### cURL Examples
```bash
# List accounts
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.fastenr.com/v1/accounts"

# Create account
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"New Customer","status":"onboarding"}' \
     "https://api.fastenr.com/v1/accounts"

# Get health metrics
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.fastenr.com/v1/health?account_id=acc_123456"
```

---

## API Testing

### Postman Collection
Import our Postman collection for easy API testing:
```
https://api.fastenr.com/postman/collection.json
```

### Interactive API Explorer
Test API endpoints directly in your browser:
```
https://api.fastenr.com/docs
```

### Sandbox Environment
Test your integrations safely:
```
Base URL: https://sandbox-api.fastenr.com/v1
```

---

## Best Practices

### Performance
- Use pagination for large datasets
- Implement proper caching strategies
- Use webhooks instead of polling
- Batch operations when possible

### Security
- Store API keys securely
- Use HTTPS for all requests
- Implement proper error handling
- Validate webhook signatures

### Rate Limiting
- Implement exponential backoff
- Monitor rate limit headers
- Cache responses when appropriate
- Use webhooks for real-time updates

---

## Related Documentation

- **[Integrations](./INTEGRATIONS.md)** - Integration guides and examples
- **[Automation System](./AUTOMATION.md)** - Automation API usage
- **[Database Schema](./DATABASE.md)** - Data models and relationships
- **[Security Guide](./SECURITY.md)** - API security best practices

---

> **Navigation**: [← Integrations](./INTEGRATIONS.md) | [Back to README](../README.md) | [Documentation Hub](./README.md)