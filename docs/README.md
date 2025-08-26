# fastenr Documentation Hub

Welcome to the comprehensive documentation for fastenr - the Customer Success Platform built for customer success teams.

## 📚 Documentation Overview

This documentation covers every aspect of fastenr, from basic setup to advanced integrations and customizations. Whether you're a new user, administrator, or developer, you'll find the information you need here.

---

## 🚀 Getting Started

### Quick Start Guides
| Guide | Description | Time Required |
|-------|-------------|---------------|
| **[Main README](../README.md)** | Project overview and quick setup | 5 minutes |
| **[Email Setup](../EMAIL_SETUP_GUIDE.md)** | Configure email functionality | 10 minutes |
| **[Social Login Setup](../SOCIAL_LOGIN_SETUP.md)** | Add Google/GitHub authentication | 15 minutes |
| **[Production Deployment](#deployment-guides)** | Deploy to production | 30 minutes |

### First Steps Checklist
- [ ] Complete environment setup
- [ ] Configure email delivery
- [ ] Set up social authentication
- [ ] Import customer data
- [ ] Configure integrations
- [ ] Set up automation workflows

---

## 🎯 Feature Documentation

### Core Features
| Feature | Documentation | Key Components |
|---------|---------------|----------------|
| **[Customer Management](./CUSTOMER_MANAGEMENT.md)** | Account tracking, health scoring, engagement management | Accounts, Engagements, Health Metrics |
| **[Analytics & Reporting](./ANALYTICS.md)** | Health analytics, churn prediction, business metrics | Dashboards, Reports, Trends |
| **[Automation System](./AUTOMATION.md)** | Workflow builder, triggers, email automation | Workflows, Triggers, Actions |
| **[Survey System](./SURVEYS.md)** | NPS surveys, custom surveys, feedback collection | Surveys, Responses, Analytics |
| **[Integrations](./INTEGRATIONS.md)** | CRM sync, webhooks, API access | HubSpot, Salesforce, APIs |

### Advanced Features
| Feature | Documentation | Use Cases |
|---------|---------------|-----------|
| **[API Reference](./API.md)** | Complete REST API documentation | Custom integrations, data access |
| **[Database Schema](./DATABASE.md)** | Data models and relationships | Development, reporting |
| **[Component Library](./COMPONENTS.md)** | UI component reference | Frontend development |
| **[Architecture](./ARCHITECTURE.md)** | System design and patterns | Technical understanding |

---

## 🛠️ Technical Documentation

### Development & Architecture
| Document | Purpose | Audience |
|----------|---------|----------|
| **[Architecture Overview](./ARCHITECTURE.md)** | System design, technology stack, patterns | Developers, Architects |
| **[Database Schema](./DATABASE.md)** | Data models, relationships, migrations | Developers, DBAs |
| **[API Documentation](./API.md)** | REST API reference, authentication | Developers, Integrators |
| **[Component Library](./COMPONENTS.md)** | UI components, props, examples | Frontend Developers |
| **[Development Guide](./DEVELOPMENT.md)** | Setup, conventions, contributing | Contributors |

### Operations & Deployment
| Document | Purpose | Audience |
|----------|---------|----------|
| **[Security Guide](./SECURITY.md)** | Security best practices, compliance | DevOps, Security Teams |
| **[Monitoring & Logging](./MONITORING.md)** | Observability, alerting, debugging | DevOps, SRE |
| **[Deployment Guide](./DEPLOYMENT.md)** | Production deployment, scaling | DevOps, Administrators |
| **[Backup & Recovery](./BACKUP.md)** | Data protection, disaster recovery | Administrators, DBAs |

---

## 📋 Project Management

### Planning & Issues
| Document | Purpose | Use Case |
|----------|---------|----------|
| **[Production Readiness Audit](../PRODUCTION_READINESS_AUDIT.md)** | Pre-deployment checklist and issues | Production planning |
| **[Jira Issues Template](../JIRA_ISSUES_TEMPLATE.md)** | Project management templates | Sprint planning |
| **[Roadmap](./ROADMAP.md)** | Feature roadmap and timeline | Product planning |
| **[Contributing Guide](./CONTRIBUTING.md)** | Contribution guidelines | Open source contributors |

---

## 🎯 User Guides by Role

### Customer Success Managers
**Primary Focus**: Customer management, health tracking, engagement

**Essential Reading**:
1. [Customer Management](./CUSTOMER_MANAGEMENT.md) - Core functionality
2. [Analytics & Reporting](./ANALYTICS.md) - Health insights
3. [Survey System](./SURVEYS.md) - Customer feedback
4. [Automation System](./AUTOMATION.md) - Workflow efficiency

**Quick Actions**:
- [Create customer accounts](./CUSTOMER_MANAGEMENT.md#account-creation)
- [Track engagements](./CUSTOMER_MANAGEMENT.md#engagement-tracking)
- [Set up health alerts](./AUTOMATION.md#health-score-changes)
- [Send NPS surveys](./SURVEYS.md#nps-surveys)

### Administrators
**Primary Focus**: System configuration, integrations, user management

**Essential Reading**:
1. [Integrations](./INTEGRATIONS.md) - Connect external tools
2. [Automation System](./AUTOMATION.md) - Configure workflows
3. [Security Guide](./SECURITY.md) - Secure the platform
4. [User Management](./USER_MANAGEMENT.md) - Manage team access

**Quick Actions**:
- [Set up CRM integration](./INTEGRATIONS.md#crm-integrations)
- [Configure email automation](./AUTOMATION.md#email-automation)
- [Manage user permissions](./USER_MANAGEMENT.md#role-management)
- [Monitor system health](./MONITORING.md#health-monitoring)

### Developers
**Primary Focus**: API integration, customization, development

**Essential Reading**:
1. [API Documentation](./API.md) - Complete API reference
2. [Architecture Overview](./ARCHITECTURE.md) - System design
3. [Database Schema](./DATABASE.md) - Data models
4. [Development Guide](./DEVELOPMENT.md) - Setup and conventions

**Quick Actions**:
- [API authentication](./API.md#authentication)
- [Custom integrations](./INTEGRATIONS.md#custom-integrations)
- [Database queries](./DATABASE.md#query-examples)
- [Component development](./COMPONENTS.md#development)

### Business Users
**Primary Focus**: Reports, insights, business metrics

**Essential Reading**:
1. [Analytics & Reporting](./ANALYTICS.md) - Business insights
2. [Customer Management](./CUSTOMER_MANAGEMENT.md) - Customer data
3. [Survey System](./SURVEYS.md) - Customer feedback
4. [Dashboard Guide](./DASHBOARDS.md) - Using dashboards

**Quick Actions**:
- [View health analytics](./ANALYTICS.md#health-score-analytics)
- [Generate reports](./ANALYTICS.md#reporting-features)
- [Track business metrics](./ANALYTICS.md#business-metrics)
- [Analyze survey results](./SURVEYS.md#response-analytics)

---

## 🔍 Quick Reference

### Common Tasks
| Task | Documentation | Time |
|------|---------------|------|
| Add new customer account | [Customer Management](./CUSTOMER_MANAGEMENT.md#account-creation) | 2 min |
| Set up health alert | [Automation](./AUTOMATION.md#health-score-changes) | 5 min |
| Send NPS survey | [Surveys](./SURVEYS.md#nps-management) | 3 min |
| Connect HubSpot | [Integrations](./INTEGRATIONS.md#hubspot-integration) | 10 min |
| Create custom report | [Analytics](./ANALYTICS.md#custom-reports) | 5 min |
| Set up webhook | [Integrations](./INTEGRATIONS.md#webhook-system) | 8 min |

### API Quick Reference
| Endpoint | Purpose | Documentation |
|----------|---------|---------------|
| `GET /api/accounts` | List customer accounts | [API Docs](./API.md#accounts) |
| `POST /api/engagements` | Create engagement | [API Docs](./API.md#engagements) |
| `GET /api/dashboard/stats` | Dashboard metrics | [API Docs](./API.md#analytics) |
| `POST /api/surveys` | Create survey | [API Docs](./API.md#surveys) |
| `GET /api/v1/health` | Health metrics | [API Docs](./API.md#health) |

### Component Quick Reference
| Component | Purpose | Documentation |
|-----------|---------|---------------|
| `AccountDetails` | Customer account view | [Components](./COMPONENTS.md#account-components) |
| `HealthScoreChart` | Health visualization | [Components](./COMPONENTS.md#analytics-components) |
| `EngagementForm` | Create engagements | [Components](./COMPONENTS.md#engagement-components) |
| `SurveyBuilder` | Build surveys | [Components](./COMPONENTS.md#survey-components) |
| `AutomationWorkflow` | Workflow builder | [Components](./COMPONENTS.md#automation-components) |

---

## 🆘 Support & Help

### Getting Help
| Resource | Best For | Response Time |
|----------|----------|---------------|
| **[FAQ](./FAQ.md)** | Common questions | Immediate |
| **[Troubleshooting](./TROUBLESHOOTING.md)** | Technical issues | Self-service |
| **[Community Forum](https://community.fastenr.com)** | Peer support | 1-2 hours |
| **[Support Email](mailto:support@fastenr.com)** | Direct support | 24 hours |
| **[Professional Services](./PROFESSIONAL_SERVICES.md)** | Custom development | Contact sales |

### Emergency Contacts
- **Production Issues**: [Emergency Runbook](./EMERGENCY_RUNBOOK.md)
- **Security Issues**: [Security Response](./SECURITY.md#incident-response)
- **Data Issues**: [Data Recovery](./BACKUP.md#recovery-procedures)

---

## 📈 What's New

### Recent Updates
- **v1.2.0**: Advanced automation workflows
- **v1.1.5**: Enhanced HubSpot integration
- **v1.1.0**: Custom survey builder
- **v1.0.8**: Real-time health alerts
- **v1.0.5**: Salesforce integration

### Coming Soon
- **v1.3.0**: Mobile app (Q2 2024)
- **v1.2.5**: Advanced reporting (Q1 2024)
- **v1.2.3**: Slack integration improvements
- **v1.2.1**: API rate limiting enhancements

See the complete [Changelog](./CHANGELOG.md) and [Roadmap](./ROADMAP.md).

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **[Development Guide](./DEVELOPMENT.md)** - Set up development environment
2. **[Contributing Guidelines](./CONTRIBUTING.md)** - Contribution process
3. **[Code of Conduct](./CODE_OF_CONDUCT.md)** - Community guidelines
4. **[Issue Templates](./ISSUE_TEMPLATES.md)** - Report bugs or request features

### Ways to Contribute
- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new functionality
- 📝 **Documentation**: Improve guides and examples
- 🔧 **Code**: Contribute features and fixes
- 🎨 **Design**: Improve UI/UX
- 🧪 **Testing**: Help test new features

---

## 📊 Documentation Stats

- **Total Documents**: 25+
- **Last Updated**: January 2024
- **Coverage**: 95% of features documented
- **Languages**: English (primary), more coming soon
- **Formats**: Markdown, interactive examples, video guides

---

## 🗺️ Site Map

```
docs/
├── README.md (this file)
├── CUSTOMER_MANAGEMENT.md
├── ANALYTICS.md
├── AUTOMATION.md
├── SURVEYS.md
├── INTEGRATIONS.md
├── API.md
├── DATABASE.md
├── ARCHITECTURE.md
├── COMPONENTS.md
├── DEVELOPMENT.md
├── SECURITY.md
├── MONITORING.md
├── DEPLOYMENT.md
├── USER_MANAGEMENT.md
├── TROUBLESHOOTING.md
├── FAQ.md
├── ROADMAP.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── guides/
    ├── getting-started/
    ├── tutorials/
    ├── examples/
    └── best-practices/
```

---

**Need help finding something?** Use the search function or check our [FAQ](./FAQ.md) for quick answers.

**Found an issue with the documentation?** Please [open an issue](https://github.com/fastenr/fastenr/issues) or submit a pull request.