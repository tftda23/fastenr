# Billing System Setup Guide

This guide will help you set up the comprehensive billing system for Fastenr, including Stripe integration for payments, invoice generation, and the super admin portal.

## 🚀 Features Included

### Customer Billing Portal
- ✅ Add/manage credit/debit cards
- ✅ View subscription details and usage
- ✅ Download invoices as PDF
- ✅ View payment history
- ✅ Trial status tracking

### Super Admin Portal (Fastenr Staff Only)
- ✅ View all organizations and billing status
- ✅ Revenue projections and MRR tracking
- ✅ Invoice management across all customers
- ✅ Audit logging for all admin actions
- ✅ Trial conversion tracking

### Payment Processing
- ✅ Stripe integration (test mode safe)
- ✅ Automatic invoice generation
- ✅ Webhook handling for payment events
- ✅ Failed payment retry logic

## 📋 Prerequisites

1. **Stripe Account**: Create a free Stripe account at https://stripe.com
2. **Database**: Run the billing system database migrations
3. **Environment Variables**: Configure Stripe keys

## 🛠️ Setup Instructions

### Step 1: Database Setup

Run the billing system database migration:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f scripts/30_create_billing_system.sql
```

### Step 2: Stripe Configuration

1. **Create Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Complete account setup (you can use test mode without providing bank details)

2. **Get API Keys**
   - In Stripe Dashboard, go to Developers > API keys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

3. **Set Up Webhooks**
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select these events:
     - `setup_intent.succeeded`
     - `payment_method.attached`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
   - Copy the webhook signing secret (starts with `whsec_`)

### Step 3: Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration (Test Mode - Safe for Development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
```

### Step 4: Install Dependencies

The required packages are already installed:
- `stripe` - Server-side Stripe integration
- `@stripe/stripe-js` - Client-side Stripe integration
- `jspdf` & `jspdf-autotable` - PDF invoice generation

### Step 5: Super Admin Access

Update the super admin emails in `app/api/super-admin/overview/route.ts`:

```typescript
const SUPER_ADMIN_EMAILS = [
  'adam@fastenr.com',
  'your-email@fastenr.com',
  // Add more fastenr staff emails here
]
```

## 🧪 Testing Without Real Charges

### Test Mode Benefits
- ✅ **No real money**: All transactions are simulated
- ✅ **No bank account needed**: Test with Stripe's test cards
- ✅ **Full functionality**: All features work exactly like production

### Test Credit Cards
Use these test card numbers in development:

```
Successful payments:
- 4242424242424242 (Visa)
- 5555555555554444 (Mastercard)

Failed payments:
- 4000000000000002 (Card declined)
- 4000000000009995 (Insufficient funds)

Any future expiry date and any 3-digit CVC work with test cards.
```

### Testing Workflow

1. **Add Payment Method**
   - Go to `/dashboard/admin/billing`
   - Click "Add Payment Method"
   - Use test card: `4242424242424242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)

2. **Generate Test Invoice**
   - Invoices are created automatically based on subscription changes
   - Or create manually via the API for testing

3. **Download PDF Invoice**
   - Click the PDF download button on any invoice
   - PDF includes all billing details and branding

## 🔐 Security Features

### Row Level Security (RLS)
- Users can only see their organization's data
- Super admin access is restricted by email whitelist
- All database operations are logged

### Audit Logging
- All super admin actions are logged
- Payment method changes are tracked
- Subscription modifications are recorded

### Data Protection
- Payment card data is stored securely by Stripe
- Only last 4 digits and metadata stored locally
- PCI compliance handled by Stripe

## 📊 Available Endpoints

### Customer Billing APIs
- `GET /api/billing/payment-methods` - List payment methods
- `POST /api/billing/setup-payment` - Setup new payment method
- `GET /api/billing/invoices` - List invoices
- `GET /api/billing/invoices/[id]/pdf` - Download invoice PDF

### Super Admin APIs
- `GET /api/super-admin/overview` - Complete billing overview
- Restricted to whitelisted fastenr staff emails

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe events

## 🚀 Going Live

When ready for production:

1. **Switch to Live Mode**
   - Get live API keys from Stripe Dashboard
   - Update environment variables with live keys
   - Update webhook endpoint to production URL

2. **Bank Account Setup**
   - Complete Stripe account verification
   - Add bank account for payouts
   - Set up tax settings

3. **Domain Verification**
   - Ensure webhook URL is accessible
   - Test with Stripe's webhook testing tool

## 📈 Revenue Tracking

The system automatically tracks:
- Monthly Recurring Revenue (MRR)
- Trial conversion rates
- Payment success/failure rates
- Customer lifetime value
- Churn predictions

## 🆘 Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is publicly accessible
   - Verify webhook secret matches environment variable
   - Check Stripe Dashboard > Webhooks for delivery attempts

2. **Payment setup fails**
   - Ensure Stripe publishable key is correct
   - Check browser console for JavaScript errors
   - Verify test card numbers are used correctly

3. **Super admin access denied**
   - Check email is in SUPER_ADMIN_EMAILS array
   - Ensure user is logged in with correct email
   - Check server logs for authentication errors

### Support

For issues with this billing system:
1. Check the browser console for errors
2. Review server logs for API errors
3. Test with Stripe's test cards
4. Verify environment variables are set correctly

## 🎯 Next Steps

After setup, you can:
1. Customize invoice branding and layout
2. Add more payment methods (bank transfers, etc.)
3. Implement usage-based billing
4. Add automated dunning management
5. Integrate with accounting systems

The system is designed to scale with your business needs while maintaining security and compliance standards.