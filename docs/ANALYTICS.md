# Analytics & Reporting

> **Navigation**: [← Customer Management](./CUSTOMER_MANAGEMENT.md) | [Back to README](../README.md) | [Next: Automation →](./AUTOMATION.md)

The Analytics system provides comprehensive insights into customer health, engagement patterns, and business metrics to drive data-driven customer success decisions.

## 📋 Table of Contents

- [Overview](#overview)
- [Dashboard Analytics](#dashboard-analytics)
- [Health Score Analytics](#health-score-analytics)
- [Engagement Analytics](#engagement-analytics)
- [Churn Risk Analysis](#churn-risk-analysis)
- [Business Metrics](#business-metrics)
- [Reporting Features](#reporting-features)
- [API Reference](#api-reference)

---

## Overview

The Analytics module transforms raw customer data into actionable insights, helping customer success teams:

- **Monitor Health Trends**: Track customer health patterns over time
- **Predict Churn Risk**: Identify at-risk customers before they churn
- **Measure Engagement**: Analyze interaction patterns and effectiveness
- **Track Business Impact**: Connect customer success activities to revenue outcomes
- **Benchmark Performance**: Compare metrics across customer segments

### Key Features
- Real-time dashboard with key metrics
- Health score trend analysis
- Churn risk prediction and alerts
- Engagement pattern recognition
- Revenue impact tracking
- Custom reporting and exports

---

## Dashboard Analytics

### Main Dashboard
- **Location**: `/dashboard`
- **Component**: `components/dashboard/stats-cards.tsx`
- **API**: `GET /api/dashboard/stats`

#### Key Metrics Overview

```typescript
interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  atRiskAccounts: number
  churnedAccounts: number
  averageHealthScore: number
  averageChurnRisk: number
  totalARR: number
  npsScore: number
}
```

#### Dashboard Components

1. **Stats Cards**
   - Total customer count
   - Active vs. at-risk breakdown
   - Average health score
   - Total ARR and growth

2. **Health Score Distribution**
   - **Component**: `components/dashboard/health-score-distribution.tsx`
   - Visual distribution of customer health scores
   - Trend indicators and comparisons
   - Risk level categorization

3. **Churn Risk Chart**
   - **Component**: `components/dashboard/churn-risk-chart.tsx`
   - At-risk customer identification
   - Risk score distributions
   - Predictive trend analysis

4. **Recent Activity Feed**
   - **Component**: `components/dashboard/recent-activity.tsx`
   - Latest customer engagements
   - Health score changes
   - Goal completions and milestones

### Analytics Dashboard
- **Location**: `/dashboard/analytics`
- **Component**: `components/analytics/analytics-client.tsx`
- **API**: `GET /api/v1/dashboard/stats`

Advanced analytics with:
- Time-series health score trends
- Engagement frequency analysis
- Churn prediction modeling
- Revenue correlation analysis
- Customer segmentation insights

---

## Health Score Analytics

### Health Score Calculation

Health scores are computed using weighted factors:

```typescript
interface HealthScoreFactors {
  productUsage: {
    weight: 0.4,
    metrics: {
      loginFrequency: number,
      featureAdoption: number,
      sessionDuration: number,
      userActivity: number
    }
  },
  supportMetrics: {
    weight: 0.25,
    metrics: {
      ticketVolume: number,
      ticketSeverity: number,
      resolutionTime: number,
      satisfaction: number
    }
  },
  engagementQuality: {
    weight: 0.2,
    metrics: {
      meetingFrequency: number,
      responseRates: number,
      outcomeQuality: number,
      stakeholderParticipation: number
    }
  },
  businessMetrics: {
    weight: 0.15,
    metrics: {
      contractValue: number,
      paymentHistory: number,
      expansionOpportunities: number,
      renewalLikelihood: number
    }
  }
}
```

### Health Trend Analysis

#### 1. Historical Health Tracking
- **API**: `GET /api/v1/health?period=30d`
- Track health score changes over time
- Identify improvement or decline patterns
- Correlate with engagement activities
- Predict future health trajectories

#### 2. Health Score Segmentation
```typescript
interface HealthSegments {
  healthy: { range: [80, 100], count: number, percentage: number },
  moderate: { range: [60, 79], count: number, percentage: number },
  atRisk: { range: [40, 59], count: number, percentage: number },
  critical: { range: [0, 39], count: number, percentage: number }
}
```

#### 3. Health Impact Analysis
- Measure impact of engagements on health scores
- Identify most effective intervention strategies
- Track health recovery patterns
- Benchmark against industry standards

---

## Engagement Analytics

### Engagement Metrics

```typescript
interface EngagementAnalytics {
  totalEngagements: number,
  engagementsByType: {
    meeting: number,
    call: number,
    email: number,
    demo: number,
    training: number
  },
  outcomeDistribution: {
    positive: number,
    neutral: number,
    negative: number,
    actionRequired: number
  },
  averageResponseTime: number,
  engagementFrequency: number,
  stakeholderParticipation: number
}
```

### Engagement Pattern Analysis

#### 1. Frequency Analysis
- Track engagement cadence per account
- Identify optimal engagement frequencies
- Detect communication gaps
- Monitor response time patterns

#### 2. Outcome Correlation
- Correlate engagement outcomes with health scores
- Identify most effective engagement types
- Track improvement after interventions
- Measure engagement ROI

#### 3. Stakeholder Engagement
- Track key stakeholder participation
- Monitor decision-maker involvement
- Identify champion advocates
- Measure relationship depth

---

## Churn Risk Analysis

### Churn Risk Scoring

```typescript
interface ChurnRiskFactors {
  healthDecline: {
    weight: 0.3,
    indicators: [
      'declining_login_frequency',
      'reduced_feature_usage',
      'support_escalations'
    ]
  },
  engagementReduction: {
    weight: 0.25,
    indicators: [
      'missed_meetings',
      'delayed_responses',
      'negative_outcomes'
    ]
  },
  businessRisk: {
    weight: 0.25,
    indicators: [
      'contract_approaching_renewal',
      'payment_delays',
      'budget_constraints'
    ]
  },
  competitiveThreats: {
    weight: 0.2,
    indicators: [
      'competitor_mentions',
      'feature_requests',
      'pricing_discussions'
    ]
  }
}
```

### Predictive Analytics

#### 1. Early Warning System
- **API**: `GET /api/v1/health?at_risk=true`
- Identify customers showing early churn signals
- Automated alert generation
- Risk score trending
- Intervention recommendations

#### 2. Churn Prediction Models
- Machine learning-based churn prediction
- Risk score calibration
- Time-to-churn estimation
- Confidence intervals

#### 3. Intervention Tracking
- Track effectiveness of churn prevention activities
- Measure risk score improvements
- Monitor intervention success rates
- Optimize prevention strategies

---

## Business Metrics

### Revenue Analytics

```typescript
interface RevenueMetrics {
  totalARR: number,
  arrGrowth: number,
  expansionRevenue: number,
  contractionRevenue: number,
  churnedRevenue: number,
  netRevenueRetention: number,
  grossRevenueRetention: number,
  averageContractValue: number,
  revenuePerCustomer: number
}
```

#### 1. ARR Tracking
- Annual Recurring Revenue monitoring
- Growth rate calculations
- Expansion vs. contraction analysis
- Cohort-based revenue analysis

#### 2. Retention Metrics
- Net Revenue Retention (NRR)
- Gross Revenue Retention (GRR)
- Customer lifetime value
- Churn impact on revenue

#### 3. Expansion Analytics
- Upsell and cross-sell opportunities
- Expansion revenue tracking
- Account growth patterns
- Success-driven expansion

### Customer Success KPIs

```typescript
interface CSKPIs {
  customerHealthScore: number,
  npsScore: number,
  churnRate: number,
  timeToValue: number,
  adoptionRate: number,
  engagementScore: number,
  goalCompletionRate: number,
  renewalRate: number
}
```

---

## Reporting Features

### Standard Reports

#### 1. Executive Dashboard
- High-level KPI summary
- Trend analysis
- Risk alerts
- Revenue impact

#### 2. Account Health Report
- Individual account health scores
- Risk assessments
- Engagement summaries
- Goal progress

#### 3. Engagement Summary
- Activity by team member
- Engagement effectiveness
- Response time metrics
- Outcome analysis

#### 4. Churn Risk Report
- At-risk customer identification
- Risk factor analysis
- Intervention recommendations
- Success tracking

### Custom Reports

#### 1. Report Builder
- **Location**: `/dashboard/analytics/reports`
- Drag-and-drop report creation
- Custom metric selection
- Flexible filtering options
- Scheduled report delivery

#### 2. Data Export
- CSV/Excel export capabilities
- API data access
- Automated report generation
- Integration with BI tools

### Visualization Components

#### 1. Charts and Graphs
```typescript
// components/analytics/health-trend-chart.tsx
- Line charts for health score trends
- Bar charts for engagement distribution
- Pie charts for status breakdowns
- Heatmaps for activity patterns
```

#### 2. Interactive Dashboards
```typescript
// components/analytics/interactive-dashboard.tsx
- Filterable date ranges
- Drill-down capabilities
- Real-time data updates
- Comparative analysis tools
```

---

## API Reference

### Analytics Endpoints

#### GET /api/dashboard/stats
Get main dashboard statistics.

**Response:**
```json
{
  "totalAccounts": 150,
  "activeAccounts": 120,
  "atRiskAccounts": 25,
  "churnedAccounts": 5,
  "averageHealthScore": 75.5,
  "averageChurnRisk": 18.2,
  "totalARR": 2500000,
  "npsScore": 42
}
```

#### GET /api/v1/dashboard/stats
Advanced analytics data.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)
- `segment`: Customer segment filter
- `compare`: Comparison period

#### GET /api/v1/health
Health metrics and trends.

**Query Parameters:**
- `account_id`: Specific account
- `period`: Time range
- `at_risk`: Filter at-risk accounts only

#### GET /api/analytics/engagement
Engagement analytics data.

**Query Parameters:**
- `type`: Engagement type filter
- `outcome`: Outcome filter
- `period`: Time range
- `team_member`: Filter by team member

#### GET /api/analytics/churn-risk
Churn risk analysis.

**Query Parameters:**
- `risk_threshold`: Minimum risk score
- `period`: Analysis period
- `factors`: Risk factor breakdown

### Real-time Analytics

#### WebSocket Endpoints
```typescript
// Real-time dashboard updates
ws://localhost:3000/api/ws/dashboard

// Health score changes
ws://localhost:3000/api/ws/health-updates

// Engagement notifications
ws://localhost:3000/api/ws/engagement-updates
```

---

## Performance Optimization

### Data Aggregation

#### 1. Pre-computed Metrics
```sql
-- Materialized views for performance
CREATE MATERIALIZED VIEW account_health_summary AS
SELECT 
  account_id,
  AVG(overall_health_score) as avg_health_score,
  MAX(metric_date) as last_updated,
  COUNT(*) as metric_count
FROM health_metrics 
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY account_id;
```

#### 2. Caching Strategy
- Redis caching for frequently accessed metrics
- Background job processing for complex calculations
- Incremental data updates
- Cache invalidation strategies

#### 3. Query Optimization
- Indexed queries for fast data retrieval
- Pagination for large datasets
- Efficient aggregation queries
- Database query optimization

---

## Integration Points

### External Analytics Tools

#### 1. Business Intelligence
- Tableau integration
- Power BI connectors
- Looker dashboards
- Custom BI tool APIs

#### 2. Data Warehousing
- Snowflake integration
- BigQuery exports
- Redshift connections
- ETL pipeline support

#### 3. Monitoring Tools
- Datadog metrics
- New Relic APM
- Custom monitoring dashboards
- Alert integrations

---

## Related Documentation

- **[Customer Management](./CUSTOMER_MANAGEMENT.md)** - Core customer data and health scoring
- **[Automation System](./AUTOMATION.md)** - Automated analytics and alerts
- **[API Documentation](./API.md)** - Complete API reference for analytics
- **[Database Schema](./DATABASE.md)** - Analytics data models

---

> **Navigation**: [← Customer Management](./CUSTOMER_MANAGEMENT.md) | [Back to README](../README.md) | [Next: Automation →](./AUTOMATION.md)