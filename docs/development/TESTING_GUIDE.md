# 🧪 Production Testing Guide

## Overview

This testing suite validates production readiness by testing all critical aspects of the application before deployment.

## Quick Start

```bash
# Test only (no build)
npm run test:production

# Test + Build
npm run test:build

# Test + Build + Deploy (when configured)
npm run test:deploy
```

## Test Categories

### 🔧 **Environment Variables**
- Validates all required environment variables are set
- Checks for localhost URLs in production environment
- Warns about missing optional configurations

### 📁 **File System**
- Verifies critical files are present and accessible
- Checks directory structure integrity
- Validates build artifacts

### 🗄️ **Database Connectivity**
- Tests Supabase connection
- Validates database table access
- Checks authentication configuration

### 🌐 **API Routes**
- Tests all major API endpoints
- Validates response codes and formats
- Checks authentication requirements

### 🔒 **Security**
- Validates security headers
- Checks for sensitive data exposure
- Tests authentication flows

### 🏗️ **Build Process**
- Runs Next.js build process
- Validates build output
- Measures build performance

## Test Results

### Log Files
All test results are stored in `.test-logs/` directory:
- `test-report-{runId}.json` - Detailed JSON report
- `test-summary-{runId}.txt` - Human-readable summary

### Security
- Log files are excluded from git (`.gitignore`)
- No sensitive data is logged in production mode
- Logs are only accessible via CLI/server access

## Environment Setup

### Required Environment Variables
```bash
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URLs (Required for production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
APP_BASE_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secure_secret
```

### Optional Environment Variables
```bash
# Email Service
RESEND_API_KEY=your_resend_key
EMAIL_FROM_SURVEYS=surveys@yourdomain.com
EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Integrations
HUBSPOT_CLIENT_ID=your_hubspot_id
HUBSPOT_CLIENT_SECRET=your_hubspot_secret
SALESFORCE_CLIENT_ID=your_salesforce_id
SALESFORCE_CLIENT_SECRET=your_salesforce_secret
```

## Vercel Deployment

### Automatic Testing
The test suite can be integrated with Vercel deployment:

1. **Pre-deployment Testing**: Run tests before build
2. **Build Validation**: Ensure build succeeds
3. **Post-deployment Health Check**: Validate deployed application

### Vercel Configuration
Create `vercel.json` for deployment settings:

```json
{
  "buildCommand": "npm run test:build",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Production Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:production
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          # Add other required environment variables
```

## Troubleshooting

### Common Issues

**Build Failures**
- Check all environment variables are set
- Verify no TypeScript errors
- Ensure all dependencies are installed

**API Test Failures**
- Verify server is running (for local tests)
- Check database connectivity
- Validate authentication configuration

**Security Warnings**
- Review security headers configuration
- Check for exposed sensitive data
- Validate HTTPS configuration

### Debug Mode
Add `DEBUG=true` environment variable for verbose logging:

```bash
DEBUG=true npm run test:production
```

## Test Customization

### Adding New Tests
Edit `scripts/production-test.js` to add new test categories:

```javascript
async function testCustomFeature() {
  log('INFO', 'Custom', 'Testing custom feature...');
  // Your test logic here
}

// Add to main test runner
await testCustomFeature();
```

### Modifying Test Criteria
Adjust test expectations in the configuration:

```javascript
const CONFIG = {
  // Modify timeout, retries, etc.
  timeout: 30000,
  maxRetries: 3
};
```

## Production Checklist

Before deploying to production:

- [ ] All tests pass (`npm run test:production`)
- [ ] Build succeeds (`npm run test:build`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] External services configured (Stripe, email, etc.)
- [ ] Domain and SSL configured
- [ ] Monitoring and logging set up

## Support

For issues with the testing suite:
1. Check test logs in `.test-logs/`
2. Review environment variable configuration
3. Verify all dependencies are installed
4. Check network connectivity for external services