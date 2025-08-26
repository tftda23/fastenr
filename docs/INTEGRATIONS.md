# Integrations

> **Navigation**: [← Surveys](./SURVEYS.md) | [Back to README](../README.md) | [Next: API →](./API.md)

The Integrations system connects fastenr with your existing tools and platforms, enabling seamless data flow and unified customer success operations.

## 📋 Table of Contents

- [Overview](#overview)
- [CRM Integrations](#crm-integrations)
- [Communication Tools](#communication-tools)
- [Data Import/Export](#data-importexport)
- [Webhook System](#webhook-system)
- [API Integrations](#api-integrations)
- [Integration Management](#integration-management)
- [Custom Integrations](#custom-integrations)
- [Troubleshooting](#troubleshooting)

---

## Overview

fastenr integrates with popular business tools to create a unified customer success ecosystem:

- **CRM Systems**: HubSpot, Salesforce, Pipedrive
- **Communication**: Slack, Microsoft Teams, Email
- **Analytics**: Google Analytics, Mixpanel, Amplitude
- **Support**: Zendesk, Intercom, Freshdesk
- **Data Platforms**: Zapier, Make, Custom APIs

### Integration Benefits
- **Unified Data**: Single source of truth for customer information
- **Automated Workflows**: Trigger actions across platforms
- **Real-time Sync**: Keep data consistent across tools
- **Enhanced Insights**: Combine data for better analytics
- **Reduced Manual Work**: Automate routine data tasks

---

## CRM Integrations

### HubSpot Integration

#### Setup and Configuration
- **Location**: `/dashboard/admin/integrations`
- **Component**: `components/admin/integrations-client.tsx`
- **API**: `GET /api/integrations/hubspot/start`

#### Features
- **Account Sync**: Bidirectional company data synchronization
- **Contact Management**: Sync contact information and roles
- **Deal Tracking**: Import opportunity and revenue data
- **Activity Sync**: Share engagement history
- **Custom Properties**: Map custom fields between systems

#### Configuration Steps
1. **OAuth Setup**: Connect HubSpot account via OAuth
2. **Scope Selection**: Choose data access permissions
3. **Field Mapping**: Map HubSpot properties to fastenr fields
4. **Sync Settings**: Configure sync frequency and direction
5. **Testing**: Validate data flow and accuracy

#### Data Mapping

```typescript
interface HubSpotMapping {
  companies: {
    hubspot_field: string
    fastenr_field: string
    sync_direction: 'import' | 'export' | 'bidirectional'
  }[]
  contacts: {
    hubspot_field: string
    fastenr_field: string
    sync_direction: 'import' | 'export' | 'bidirectional'
  }[]
  deals: {
    hubspot_field: string
    fastenr_field: string
    sync_direction: 'import' | 'export' | 'bidirectional'
  }[]
}
```

#### Sync Process
- **File**: `app/api/integrations/hubspot/sync/route.ts`
- **Frequency**: Configurable (hourly, daily, real-time)
- **Error Handling**: Retry logic and error notifications
- **Conflict Resolution**: Last-modified-wins or manual review

### Salesforce Integration

#### Setup and Configuration
- **API**: `GET /api/integrations/salesforce/start`
- **Authentication**: OAuth 2.0 with refresh tokens
- **Sandbox Support**: Test with Salesforce sandbox environments

#### Features
- **Account Synchronization**: Sync account records and hierarchies
- **Opportunity Management**: Import sales pipeline data
- **Contact Sync**: Maintain contact relationships
- **Activity Tracking**: Share meeting and call logs
- **Custom Objects**: Support for custom Salesforce objects

#### Configuration
```typescript
interface SalesforceConfig {
  instance_url: string
  client_id: string
  client_secret: string
  refresh_token: string
  sandbox: boolean
  field_mappings: {
    accounts: FieldMapping[]
    contacts: FieldMapping[]
    opportunities: FieldMapping[]
  }
  sync_settings: {
    frequency: 'hourly' | 'daily' | 'weekly'
    direction: 'import' | 'export' | 'bidirectional'
    conflict_resolution: 'last_modified' | 'manual'
  }
}
```

#### API Endpoints
- **Start OAuth**: `GET /api/integrations/salesforce/start`
- **Handle Callback**: `GET /api/integrations/salesforce/callback`
- **Sync Data**: `POST /api/integrations/salesforce/sync`
- **Webhook Handler**: `POST /api/v1/webhooks/salesforce`

---

## Communication Tools

### Slack Integration

#### Features
- **Health Alerts**: Send notifications for health score changes
- **Churn Warnings**: Alert teams about at-risk customers
- **Goal Updates**: Celebrate goal achievements
- **Daily Summaries**: Automated daily/weekly reports
- **Interactive Commands**: Query customer data from Slack

#### Setup Process
1. **Slack App Creation**: Create app in Slack workspace
2. **Bot Token**: Generate bot user OAuth token
3. **Channel Configuration**: Select notification channels
4. **Alert Rules**: Configure when to send notifications
5. **Testing**: Verify notifications work correctly

#### Notification Types

```typescript
interface SlackNotification {
  type: 'health_alert' | 'churn_warning' | 'goal_achieved' | 'daily_summary'
  channel: string
  message: {
    text: string
    blocks?: SlackBlock[]
    attachments?: SlackAttachment[]
  }
  account_id?: string
  urgency: 'low' | 'medium' | 'high'
}
```

#### Slack Commands
- `/fastenr account [name]`: Get account summary
- `/fastenr health [account]`: Check health score
- `/fastenr goals [account]`: View active goals
- `/fastenr alerts`: List recent alerts

### Microsoft Teams Integration

#### Features
- **Team Notifications**: Send alerts to Teams channels
- **Adaptive Cards**: Rich, interactive notifications
- **Bot Integration**: Query customer data via Teams bot
- **Meeting Integration**: Link Teams meetings to engagements

#### Configuration
```typescript
interface TeamsConfig {
  tenant_id: string
  client_id: string
  client_secret: string
  webhook_url: string
  channels: {
    alerts: string
    reports: string
    celebrations: string
  }
}
```

---

## Data Import/Export

### Bulk Data Operations

#### Account Import
- **Location**: `/dashboard/admin/data/import`
- **API**: `POST /api/v1/bulk/accounts`
- **Formats**: CSV, Excel, JSON
- **Validation**: Data validation and error reporting

#### Data Export
- **API**: `GET /api/v1/bulk/export`
- **Formats**: CSV, Excel, JSON, PDF reports
- **Scheduling**: Automated export schedules
- **Filtering**: Export specific data segments

#### Import Process
```typescript
interface ImportProcess {
  file_upload: 'Upload CSV/Excel file'
  field_mapping: 'Map columns to fastenr fields'
  validation: 'Validate data and check for errors'
  preview: 'Review import preview'
  execution: 'Execute import with progress tracking'
  results: 'View import results and errors'
}
```

### ETL Operations

#### Data Transformation
- **File**: `app/api/etl/accounts/from-crm/route.ts`
- **Features**: Data cleaning, transformation, and enrichment
- **Scheduling**: Automated ETL jobs
- **Monitoring**: Job status and error tracking

#### Supported Sources
- CRM systems (HubSpot, Salesforce)
- CSV/Excel files
- Database connections
- API endpoints
- Third-party platforms

---

## Webhook System

### Webhook Configuration

#### Outbound Webhooks
Send data to external systems when events occur in fastenr.

```typescript
interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  headers: Record<string, string>
  secret: string
  active: boolean
  retry_config: {
    max_retries: number
    retry_delay: number
    backoff_strategy: 'linear' | 'exponential'
  }
}
```

#### Supported Events
- `account.created`
- `account.updated`
- `account.health_changed`
- `engagement.created`
- `goal.achieved`
- `survey.completed`
- `automation.triggered`

#### Webhook Payload
```json
{
  "event": "account.health_changed",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "account_id": "uuid",
    "account_name": "Acme Corp",
    "old_health_score": 75,
    "new_health_score": 65,
    "change_reason": "decreased_engagement"
  },
  "organization_id": "uuid"
}
```

#### Inbound Webhooks
Receive data from external systems.

- **HubSpot**: `POST /api/v1/webhooks/hubspot`
- **Salesforce**: `POST /api/v1/webhooks/salesforce`
- **Custom**: `POST /api/v1/webhooks/custom`

### Webhook Management

#### Webhook Dashboard
- **Location**: `/dashboard/admin/integrations/webhooks`
- Monitor webhook delivery status
- View delivery logs and errors
- Test webhook endpoints
- Manage retry attempts

#### Security
- **Signature Verification**: Validate webhook signatures
- **IP Whitelisting**: Restrict webhook sources
- **Rate Limiting**: Prevent webhook abuse
- **Encryption**: Secure webhook payloads

---

## API Integrations

### REST API Access

#### Authentication
```typescript
interface APIAuth {
  method: 'api_key' | 'oauth' | 'jwt'
  credentials: {
    api_key?: string
    client_id?: string
    client_secret?: string
    access_token?: string
  }
  scopes: string[]
}
```

#### Rate Limiting
- **Default Limits**: 1000 requests per hour
- **Burst Limits**: 100 requests per minute
- **Enterprise Limits**: Custom rate limits available
- **Headers**: Rate limit information in response headers

#### API Endpoints
- **Base URL**: `https://api.fastenr.com/v1`
- **Documentation**: Interactive API docs at `/api/v1/docs`
- **SDKs**: JavaScript, Python, PHP, Ruby libraries
- **Postman Collection**: Pre-configured API collection

### GraphQL API

#### Features
- **Flexible Queries**: Request exactly the data you need
- **Real-time Subscriptions**: Live data updates
- **Type Safety**: Strongly typed schema
- **Introspection**: Self-documenting API

#### Example Query
```graphql
query GetAccountHealth($accountId: ID!) {
  account(id: $accountId) {
    id
    name
    healthScore
    churnRisk
    engagements(limit: 10) {
      id
      type
      outcome
      createdAt
    }
    goals {
      id
      title
      status
      progress
    }
  }
}
```

---

## Integration Management

### Integration Dashboard

#### Overview
- **Location**: `/dashboard/admin/integrations`
- **Component**: `components/admin/integrations-client.tsx`

Features:
- Connected integrations status
- Sync health monitoring
- Error tracking and resolution
- Performance metrics

#### Integration Status
```typescript
interface IntegrationStatus {
  id: string
  name: string
  type: 'crm' | 'communication' | 'analytics' | 'support'
  status: 'connected' | 'error' | 'disconnected' | 'syncing'
  last_sync: string
  sync_frequency: string
  error_count: number
  data_synced: {
    accounts: number
    contacts: number
    engagements: number
  }
}
```

### Sync Monitoring

#### Sync Logs
- **API**: `GET /api/integrations/sync-logs`
- Track all sync operations
- Monitor data transfer volumes
- Identify sync errors and conflicts
- Performance analytics

#### Error Handling
- **Automatic Retries**: Configurable retry logic
- **Error Notifications**: Alert on sync failures
- **Manual Resolution**: Tools for resolving conflicts
- **Rollback Options**: Undo problematic syncs

### Data Quality

#### Validation Rules
- **Required Fields**: Ensure critical data is present
- **Format Validation**: Validate email, phone, URL formats
- **Duplicate Detection**: Identify and merge duplicates
- **Data Enrichment**: Enhance data with external sources

#### Conflict Resolution
```typescript
interface ConflictResolution {
  strategy: 'last_modified' | 'source_priority' | 'manual_review'
  rules: {
    field: string
    priority_source: string
    merge_strategy: 'overwrite' | 'append' | 'merge'
  }[]
}
```

---

## Custom Integrations

### Building Custom Integrations

#### Integration Framework
```typescript
interface CustomIntegration {
  name: string
  description: string
  auth_config: AuthConfig
  endpoints: IntegrationEndpoint[]
  field_mappings: FieldMapping[]
  sync_settings: SyncSettings
  webhooks?: WebhookConfig[]
}

interface IntegrationEndpoint {
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers: Record<string, string>
  params: Record<string, any>
  response_mapping: ResponseMapping
}
```

#### Development Tools
- **Integration Builder**: Visual integration designer
- **Testing Environment**: Sandbox for testing integrations
- **Documentation Generator**: Auto-generate integration docs
- **Monitoring Tools**: Track custom integration performance

#### Deployment
- **Staging Environment**: Test integrations before production
- **Version Control**: Manage integration versions
- **Rollback Capability**: Revert to previous versions
- **Performance Monitoring**: Track integration health

### Integration Marketplace

#### Available Integrations
- **Verified Integrations**: Tested and supported by fastenr
- **Community Integrations**: Built by the community
- **Custom Integrations**: Organization-specific integrations
- **Integration Requests**: Request new integrations

#### Installation Process
1. **Browse Marketplace**: Find required integration
2. **Review Requirements**: Check compatibility and requirements
3. **Install Integration**: One-click installation process
4. **Configure Settings**: Set up authentication and mappings
5. **Test Integration**: Validate functionality
6. **Go Live**: Activate integration for production use

---

## Troubleshooting

### Common Issues

#### Authentication Problems
- **Expired Tokens**: Refresh OAuth tokens automatically
- **Invalid Credentials**: Validate API keys and secrets
- **Permission Issues**: Check required scopes and permissions
- **Rate Limiting**: Handle rate limit errors gracefully

#### Sync Issues
- **Data Conflicts**: Resolve field mapping conflicts
- **Missing Fields**: Handle missing required fields
- **Format Errors**: Validate data formats before sync
- **Network Timeouts**: Implement retry logic for timeouts

#### Performance Issues
- **Slow Syncs**: Optimize sync batch sizes
- **Memory Usage**: Monitor memory consumption
- **API Limits**: Respect third-party API limits
- **Database Performance**: Optimize database queries

### Debugging Tools

#### Integration Logs
- **Detailed Logging**: Comprehensive sync operation logs
- **Error Tracking**: Detailed error messages and stack traces
- **Performance Metrics**: Sync duration and throughput
- **Data Validation**: Field-level validation results

#### Testing Tools
- **Connection Tester**: Validate integration connectivity
- **Data Preview**: Preview sync data before execution
- **Mapping Validator**: Validate field mappings
- **Webhook Tester**: Test webhook endpoints

### Support Resources

#### Documentation
- **Integration Guides**: Step-by-step setup instructions
- **API Reference**: Complete API documentation
- **Troubleshooting Guides**: Common issues and solutions
- **Best Practices**: Integration optimization tips

#### Support Channels
- **Help Center**: Self-service support articles
- **Community Forum**: Peer-to-peer support
- **Email Support**: Direct support for integration issues
- **Professional Services**: Custom integration development

---

## Related Documentation

- **[API Documentation](./API.md)** - Complete API reference
- **[Automation System](./AUTOMATION.md)** - Integration-triggered automations
- **[Customer Management](./CUSTOMER_MANAGEMENT.md)** - Customer data integration
- **[Database Schema](./DATABASE.md)** - Integration data models

---

> **Navigation**: [← Surveys](./SURVEYS.md) | [Back to README](../README.md) | [Next: API →](./API.md)