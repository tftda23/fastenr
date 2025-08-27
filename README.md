# fastenr - Customer Success Platform

A comprehensive Next.js-based Customer Success Platform designed specifically for customer success teams to manage, track, and optimize customer relationships.

## 🚀 Overview

fastenr is a modern customer success platform that moves beyond traditional CRM and support tools to provide purpose-built functionality for customer success teams. Track health scores, automate workflows, send surveys, and gain insights that drive customer retention and growth.

## ✨ Core Features

### 🎯 **Customer Management**
- **Account Health Tracking**: Real-time health scores and churn risk assessment
- **Engagement Management**: Track meetings, calls, emails, and touchpoints
- **Goal Setting & Tracking**: Set and monitor customer success goals and milestones
- **360° Customer View**: Complete customer lifecycle visibility

### 📊 **Analytics & Insights**
- **Health Score Analytics**: Track customer health trends over time
- **Churn Risk Prediction**: AI-powered churn risk scoring and alerts
- **NPS & Survey Analytics**: Customer satisfaction tracking and analysis
- **Adoption Metrics**: Feature usage and product adoption insights

### 🤖 **Automation & Workflows**
- **Smart Automations**: Trigger actions based on customer behavior
- **Email Campaigns**: Automated onboarding, renewal, and at-risk notifications
- **Alert System**: Proactive notifications for account changes
- **Workflow Builder**: Visual automation designer

### 📧 **Communication & Surveys**
- **Branded Email Templates**: Professional customer communications
- **NPS Surveys**: Automated Net Promoter Score collection
- **Custom Surveys**: Build and send targeted customer surveys
- **Email Analytics**: Track open rates, responses, and engagement

### 🔗 **Integrations**
- **CRM Integration**: HubSpot and Salesforce sync
- **Data Import/Export**: Bulk account and engagement management
- **API Access**: RESTful API for custom integrations
- **Webhook Support**: Real-time data synchronization

### 👥 **Team Collaboration**
- **Multi-user Support**: Role-based access control
- **Team Dashboards**: Shared visibility across customer success teams
- **Activity Feeds**: Real-time updates on customer activities
- **Collaboration Tools**: Shared notes and customer insights

## 📚 Documentation

> **📖 [Complete Documentation Hub](./docs/README.md)** - Comprehensive guides for all users and roles

### 🚀 Quick Start Guides
| Guide | Description | Time | Audience |
|-------|-------------|------|----------|
| **[Getting Started](#-quick-start)** | Set up development environment | 15 min | Developers |
| **[Email Setup](./EMAIL_SETUP_GUIDE.md)** | Configure email functionality | 10 min | Administrators |
| **[Social Login Setup](./SOCIAL_LOGIN_SETUP.md)** | Add Google/GitHub authentication | 15 min | Administrators |
| **[Production Deployment](#-deployment)** | Deploy to production | 30 min | DevOps |

### 🎯 Core Features
| Feature | Documentation | Key Capabilities |
|---------|---------------|------------------|
| **[Customer Management](./docs/CUSTOMER_MANAGEMENT.md)** | Account tracking, health scoring, engagement management | 360° customer view, health monitoring |
| **[Analytics & Reporting](./docs/ANALYTICS.md)** | Health analytics, churn prediction, business metrics | Real-time insights, predictive analytics |
| **[Automation System](./docs/AUTOMATION.md)** | Workflow builder, triggers, email automation | Smart workflows, proactive interventions |
| **[Survey System](./docs/SURVEYS.md)** | NPS surveys, custom surveys, feedback collection | Customer feedback, satisfaction tracking |
| **[Integrations](./docs/INTEGRATIONS.md)** | CRM sync, webhooks, API access | HubSpot, Salesforce, custom integrations |

### 🛠️ Technical Resources
| Resource | Purpose | Audience |
|----------|---------|----------|
| **[API Documentation](./docs/API.md)** | Complete REST API reference | Developers, Integrators |
| **[Database Schema](./docs/DATABASE.md)** | Data models and relationships | Developers, DBAs |
| **[Architecture Overview](./docs/ARCHITECTURE.md)** | System design and patterns | Architects, Senior Developers |
| **[Component Library](./docs/COMPONENTS.md)** | UI component reference | Frontend Developers |
| **[Development Guide](./docs/DEVELOPMENT.md)** | Setup, conventions, contributing | Contributors |

### 🔧 Operations & Deployment
| Resource | Purpose | Audience |
|----------|---------|----------|
| **[Production Readiness Audit](./PRODUCTION_READINESS_AUDIT.md)** | Pre-deployment checklist | DevOps, Project Managers |
| **[Testing Quick Start](./TESTING_QUICK_START.md)** | Fast testing guide | Developers, DevOps |
| **[Complete Testing Guide](./TESTING_GUIDE.md)** | Comprehensive testing docs | QA, DevOps, Developers |
| **[Phase 1 Verification](./PHASE_1_VERIFICATION_REPORT.md)** | Critical fixes verification | Project Managers, DevOps |
| **[Jira Issues Template](./JIRA_ISSUES_TEMPLATE.md)** | Project management templates | Product Managers |
| **[Security Guide](./docs/SECURITY.md)** | Security best practices | Security Teams, DevOps |
| **[Monitoring & Logging](./docs/MONITORING.md)** | Observability setup | SRE, DevOps |

### 📋 By User Role
- **👥 Customer Success Managers**: [Customer Management](./docs/CUSTOMER_MANAGEMENT.md) → [Analytics](./docs/ANALYTICS.md) → [Surveys](./docs/SURVEYS.md)
- **⚙️ Administrators**: [Integrations](./docs/INTEGRATIONS.md) → [Automation](./docs/AUTOMATION.md) → [Security](./docs/SECURITY.md)
- **💻 Developers**: [API Docs](./docs/API.md) → [Architecture](./docs/ARCHITECTURE.md) → [Testing Guide](./TESTING_GUIDE.md)
- **🧪 QA/DevOps**: [Testing Quick Start](./TESTING_QUICK_START.md) → [Production Audit](./PRODUCTION_READINESS_AUDIT.md) → [Phase 1 Verification](./PHASE_1_VERIFICATION_REPORT.md)
- **📊 Business Users**: [Analytics](./docs/ANALYTICS.md) → [Customer Management](./docs/CUSTOMER_MANAGEMENT.md) → [Surveys](./docs/SURVEYS.md)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Email service account (Resend recommended)

### 1. Clone and Install
```bash
git clone <repository-url>
cd fastenr
npm install
```

### 2. Environment Setup
Copy `.env.local` and configure your environment variables:

```bash
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM_SURVEYS=surveys@yourdomain.com
EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com
EMAIL_FROM_NAME=Your Company Name

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
Run the database migration scripts in order:
```bash
# Execute scripts in /scripts/ directory in numerical order
# 01_create_organizations_and_users.sql through 29_create_app_settings_table.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

### 5. Production Testing & Validation

Before deploying, validate your application with our comprehensive testing suite:

```bash
# Quick test (no server needed) - Recommended for most cases
npm run test:production:no-server

# Full test (auto-starts server) - Complete validation
npm run test:with-server

# Build validation - Perfect for deployment
npm run test:build
```

**📋 Testing Documentation:**
- **[Quick Start Guide](./TESTING_QUICK_START.md)** - Get testing in 2 minutes
- **[Complete Testing Guide](./TESTING_GUIDE.md)** - Comprehensive documentation
- **[Production Readiness Audit](./PRODUCTION_READINESS_AUDIT.md)** - Current status and requirements
- **[Phase 1 Verification Report](./PHASE_1_VERIFICATION_REPORT.md)** - Detailed verification of critical fixes

### 6. Initial Setup
1. Create your first organization account
2. Configure email settings in `/dashboard/admin/email`
3. Set up integrations in `/dashboard/admin/integrations`
4. Import or create your first customer accounts

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth + Social Login
- **Email**: Resend API
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context

### Project Structure
```
fastenr/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application
│   └── home/              # Landing page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Database client and queries
│   ├── integrations/     # Third-party integrations
│   └── types.ts          # TypeScript definitions
├── scripts/              # Database migration scripts
└── docs/                 # Documentation
```

---

## 🚀 Deployment

### Production Checklist
Before deploying to production, review the [Production Readiness Audit](./PRODUCTION_READINESS_AUDIT.md):

- [ ] Update metadata and branding
- [ ] Configure production environment variables
- [ ] Replace placeholder email domains
- [ ] Set up monitoring and error tracking
- [ ] Configure security headers
- [ ] Test all integrations

### Deployment Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

#### Docker
```bash
# Build production image
docker build -t fastenr .

# Run container
docker run -p 3000:3000 --env-file .env.production fastenr
```

#### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](./docs/DEVELOPMENT.md) for details on:
- Setting up the development environment
- Code style and conventions
- Testing requirements
- Pull request process

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: Browse the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our discussions for help and best practices

---

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Core customer management
- ✅ Health scoring and analytics
- ✅ Email automation
- ✅ Basic integrations

### Upcoming Features (v1.1)
- 🔄 Advanced workflow builder
- 🔄 Mobile app
- 🔄 Advanced reporting
- 🔄 AI-powered insights

### Future Releases
- 📋 Video calling integration
- 📋 Advanced AI features
- 📋 Enterprise SSO
- 📋 White-label options
