# Environment Variables Guide

This guide explains all environment variables used in Fastenr and how to configure them for different environments.

## 🔧 **Core App Configuration**

### **URL Configuration**
```bash
# Base URL for the application (used for redirects and callbacks)
APP_BASE_URL=http://localhost:3000

# Public URL for client-side usage
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Domain name (used for SEO and metadata)
NEXT_PUBLIC_DOMAIN=fastenr.com

# Full site URL for production (used in sitemap, robots.txt, etc.)
NEXT_PUBLIC_SITE_URL=https://fastenr.com
```

### **Environment-Specific Examples**

#### **Development (.env.local)**
```bash
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=fastenr.com
NEXT_PUBLIC_SITE_URL=https://fastenr.com
```

#### **Staging (.env.staging)**
```bash
APP_BASE_URL=https://staging.fastenr.com
NEXT_PUBLIC_APP_URL=https://staging.fastenr.com
NEXT_PUBLIC_DOMAIN=staging.fastenr.com
NEXT_PUBLIC_SITE_URL=https://staging.fastenr.com
```

#### **Production (.env.production)**
```bash
APP_BASE_URL=https://fastenr.com
NEXT_PUBLIC_APP_URL=https://fastenr.com
NEXT_PUBLIC_DOMAIN=fastenr.com
NEXT_PUBLIC_SITE_URL=https://fastenr.com
```

## 📊 **Database Configuration**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostgreSQL Direct Connection (if needed)
POSTGRES_URL=your_postgres_connection_string
POSTGRES_URL_NON_POOLING=your_postgres_direct_connection
```

## 💳 **Payment Processing (Stripe)**

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key  # Use sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key  # Use pk_live_ for production
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 📧 **Email Configuration**

```bash
# Resend API
RESEND_API_KEY=your_resend_api_key

# Email Settings
EMAIL_FROM_SURVEYS=surveys@yourdomain.com
EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com
EMAIL_FROM_NAME=Customer Success Team
```

## 🔗 **Integrations**

### **HubSpot**
```bash
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_SCOPES=crm.objects.companies.read crm.objects.contacts.read crm.objects.deals.read oauth
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/integrations/hubspot/callback  # Update for production
```

### **Salesforce**
```bash
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/integrations/salesforce/callback  # Update for production
SALESFORCE_LOGIN_BASE=https://login.salesforce.com
```

## 🔐 **Authentication**

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000  # Update for production
```

## 🚀 **Deployment Checklist**

### **Before Deploying to Production:**

1. **Update URLs**
   ```bash
   APP_BASE_URL=https://yourdomain.com
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Update Integration Callbacks**
   ```bash
   HUBSPOT_REDIRECT_URI=https://yourdomain.com/api/integrations/hubspot/callback
   SALESFORCE_REDIRECT_URI=https://yourdomain.com/api/integrations/salesforce/callback
   ```

3. **Switch to Live Stripe Keys**
   ```bash
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```

4. **Update Email Domains**
   ```bash
   EMAIL_FROM_SURVEYS=surveys@yourdomain.com
   EMAIL_FROM_NOTIFICATIONS=notifications@yourdomain.com
   ```

## 🔍 **Environment Variable Validation**

The app includes automatic validation for critical environment variables:

### **Required Variables**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### **Optional but Recommended**
- `NEXT_PUBLIC_APP_URL` (falls back to localhost)
- `STRIPE_SECRET_KEY` (Stripe features disabled if missing)
- `RESEND_API_KEY` (email features disabled if missing)

## 🛠️ **Development vs Production**

### **Key Differences**

| Variable | Development | Production |
|----------|-------------|------------|
| `APP_BASE_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| Integration callbacks | `localhost:3000` | `yourdomain.com` |

### **Environment Detection**

The app automatically detects the environment using `NODE_ENV`:
- `development`: Uses localhost fallbacks
- `production`: Uses production URLs
- `test`: Uses test configuration

## 📝 **Common Issues**

### **1. Localhost URLs in Production**
**Problem**: Links and redirects point to localhost
**Solution**: Set `NEXT_PUBLIC_APP_URL` and `APP_BASE_URL` to your production domain

### **2. Integration Callbacks Fail**
**Problem**: OAuth redirects fail in production
**Solution**: Update `HUBSPOT_REDIRECT_URI` and `SALESFORCE_REDIRECT_URI` to production URLs

### **3. Stripe Webhooks Not Working**
**Problem**: Stripe webhooks fail to reach your app
**Solution**: Update webhook endpoint URL in Stripe dashboard to production domain

### **4. Email Links Broken**
**Problem**: Email links point to localhost
**Solution**: Set `NEXT_PUBLIC_APP_URL` to your production domain

## 🔧 **Configuration Helper**

Use the centralized config in `lib/config.ts`:

```typescript
import { config, getBaseUrl, getApiUrl } from '@/lib/config'

// Get the current base URL (handles environment automatically)
const baseUrl = getBaseUrl()

// Get API URL with path
const apiUrl = getApiUrl('/api/some-endpoint')

// Access environment-specific config
const appName = config.app.name
const isDev = config.env.isDevelopment
```

This ensures consistent URL handling across your entire application! 🎯