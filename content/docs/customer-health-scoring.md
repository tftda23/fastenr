---
title: "Customer Health Scoring Guide"
description: "Learn how to set up and optimize customer health scoring to predict churn and identify expansion opportunities"
category: "Analytics"
difficulty: "Intermediate"
readTime: "12 min read"
lastUpdated: "2024-03-20"
tags: ["health scoring", "analytics", "churn prediction", "customer success"]
excerpt: "Master customer health scoring with this comprehensive guide. Learn how to configure scoring factors, interpret results, and take action based on health score insights."
---

# Customer Health Scoring Guide

Customer health scoring is one of the most powerful features in Fastenr, helping you predict customer behavior and take proactive action to reduce churn and drive expansion.

## What is Customer Health Scoring?

Customer health scoring assigns a numerical value (0-100) to each customer based on multiple factors that indicate their likelihood to:
- **Renew** their contract
- **Expand** their usage
- **Churn** or cancel their subscription

## How Health Scores Work

### Scoring Factors

Fastenr analyzes multiple data points to calculate health scores:

**Product Usage (40% weight)**
- Login frequency
- Feature adoption
- Time spent in product
- User growth within account

**Engagement Level (30% weight)**
- Email responsiveness
- Meeting attendance
- Support interaction quality
- Survey participation

**Business Outcomes (20% weight)**
- Goal achievement
- ROI realization
- Success milestones
- Value delivery metrics

**Contract Health (10% weight)**
- Payment history
- Contract utilization
- Renewal timeline
- Pricing satisfaction

### Score Ranges

**Healthy (80-100)**
- Strong product adoption
- High engagement
- Clear value realization
- Expansion opportunity

**At Risk (40-79)**
- Declining usage
- Reduced engagement
- Missing success milestones
- Needs attention

**Critical (0-39)**
- Minimal product usage
- Poor engagement
- No clear value delivery
- High churn risk

## Setting Up Health Scoring

### Configuration Steps

1. **Navigate to Settings > Health Scoring**
2. **Choose scoring factors** that matter to your business
3. **Set weights** for each factor
4. **Define thresholds** for score ranges
5. **Test with historical data**

### Customizing Factors

**Product Usage Metrics**
```
- Weekly active users
- Feature utilization rate
- Session duration
- API calls (if applicable)
```

**Engagement Metrics**
```
- Email open/click rates
- Meeting participation
- Response time to outreach
- NPS survey scores
```

**Business Metrics**
```
- Time-to-value achievement
- Goal completion rate
- ROI metrics
- Success milestone progress
```

## Interpreting Health Scores

### Score Analysis

**Green Customers (80-100)**
- Focus on expansion opportunities
- Gather case studies and testimonials
- Invite to advisory programs
- Reduce check-in frequency

**Yellow Customers (40-79)**
- Increase touchpoint frequency
- Provide additional training
- Address specific pain points
- Monitor closely for improvement

**Red Customers (0-39)**
- Immediate intervention required
- Executive escalation
- Recovery plan development
- Increased support resources

### Trend Analysis

Look for patterns in score changes:

**Improving Trends**
- Recent product updates
- Training completion
- New team member adoption
- Successful implementation

**Declining Trends**
- Reduced usage patterns
- Team turnover
- Competitive evaluation
- Budget constraints

## Taking Action on Health Scores

### Automated Actions

Set up workflows to automatically:

**For Healthy Customers**
- Send expansion conversation prompts
- Request testimonials or reviews
- Invite to user community events
- Schedule quarterly business reviews

**For At-Risk Customers**
- Alert customer success managers
- Schedule immediate check-ins
- Provide additional resources
- Escalate to management

**For Critical Customers**
- Create urgent support tickets
- Notify senior leadership
- Initiate recovery workflows
- Schedule executive meetings

### Manual Interventions

**Proactive Outreach**
- Personalized email campaigns
- Phone calls to check in
- Customized training sessions
- Success planning meetings

**Resource Provision**
- Best practice documentation
- Video tutorials
- Template libraries
- Expert consultation

## Advanced Health Scoring

### Segmented Scoring

Create different scoring models for:

**Customer Segments**
- Enterprise vs SMB customers
- Different product tiers
- Industry verticals
- Geographic regions

**Lifecycle Stages**
- Onboarding (0-90 days)
- Growth (90-365 days)
- Maturity (1+ years)
- Renewal periods

### Predictive Modeling

Enhance basic scoring with:

**Machine Learning**
- Pattern recognition
- Behavioral predictions
- Churn probability modeling
- Expansion likelihood scoring

**External Data**
- Company growth metrics
- Industry trends
- Economic indicators
- Competitive landscape

## Best Practices

### Implementation

1. **Start Simple**
   - Begin with 3-4 key factors
   - Use standard weights initially
   - Test with a small customer segment

2. **Iterate Regularly**
   - Review scoring accuracy monthly
   - Adjust weights based on outcomes
   - Add new factors as needed

3. **Validate with Outcomes**
   - Track prediction accuracy
   - Measure intervention success
   - Compare with actual churn/expansion

### Team Adoption

**Training Requirements**
- Score interpretation workshops
- Action playbook development
- Regular calibration sessions
- Success story sharing

**Dashboard Integration**
- Prominent score visibility
- Trend tracking widgets
- Alert notifications
- Action tracking

## Common Challenges

### Data Quality Issues

**Incomplete Data**
- Missing usage information
- Inconsistent engagement tracking
- Delayed data updates

**Solutions**
- Implement data validation
- Set up automated data collection
- Regular data audits

### False Positives/Negatives

**Over-alerting**
- Too many yellow/red customers
- Alert fatigue in teams
- Wasted intervention resources

**Under-alerting**
- Missing at-risk customers
- Surprise churn events
- Missed expansion opportunities

**Calibration Tips**
- Review historical accuracy
- Adjust thresholds quarterly
- Validate with customer feedback

## Measuring Success

### Key Metrics

**Predictive Accuracy**
- Churn prediction rate
- Expansion identification rate
- False positive/negative rates
- Lead time for predictions

**Business Impact**
- Churn reduction percentage
- Expansion revenue increase
- Customer satisfaction improvement
- Team efficiency gains

### Reporting

Create regular reports on:
- Health score distribution
- Trend analysis
- Intervention success rates
- ROI of health scoring program

## Integration with Other Features

### Workflow Automation
Connect health scores to automated workflows for:
- Email campaigns
- Task creation
- Alert notifications
- Report generation

### Analytics & Reporting
Use health scores in:
- Executive dashboards
- Team performance reports
- Customer success metrics
- Forecasting models

## Next Steps

Once you've mastered basic health scoring:

1. **Explore Advanced Analytics** - Predictive modeling and AI insights
2. **Set Up Automation** - Workflow creation and management
3. **Team Training** - Best practices and playbook development
4. **Integration** - Connect with your existing tech stack

Need help with implementation? Contact our Customer Success team for personalized guidance and best practice recommendations.

## Resources

- [Health Scoring Templates](/docs/templates)
- [Automation Workflows](/docs/automation)
- [Analytics Guide](/docs/analytics)
- [Integration Setup](/docs/integrations)