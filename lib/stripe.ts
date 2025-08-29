import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables - Stripe features will be disabled')
}

// Initialize Stripe with test mode for development
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil' as any,
  typescript: true,
}) : null

// Pricing configuration
export const PRICING_CONFIG = {
  TIER_A_MAX: 10,    // 1–10 seats
  TIER_B_MAX: 100,   // 11–100 seats
  PRICE_A: 3,        // £3 for 1–10
  PRICE_B: 5,        // £5 for 11–100
  PRICE_C: 4,        // £4 for 101+
  PREMIUM_ADDON: 2,  // £2 per seat for premium features
  CURRENCY: 'gbp',
  TRIAL_DAYS: 90,    // 3-month free trial
}

export function calculatePricing(seatCount: number, includePremium: boolean = false) {
  let pricePerSeat: number
  
  if (seatCount <= PRICING_CONFIG.TIER_A_MAX) {
    pricePerSeat = PRICING_CONFIG.PRICE_A
  } else if (seatCount <= PRICING_CONFIG.TIER_B_MAX) {
    pricePerSeat = PRICING_CONFIG.PRICE_B
  } else {
    pricePerSeat = PRICING_CONFIG.PRICE_C
    // Premium addon is included for 100+ seats
    includePremium = true
  }

  const baseAmount = seatCount * pricePerSeat
  const premiumAmount = includePremium && seatCount <= PRICING_CONFIG.TIER_B_MAX 
    ? seatCount * PRICING_CONFIG.PREMIUM_ADDON 
    : 0
  
  return {
    baseAmount,
    premiumAmount,
    totalAmount: baseAmount + premiumAmount,
    pricePerSeat,
    currency: PRICING_CONFIG.CURRENCY,
    includePremium
  }
}

export async function createCustomer(email: string, name: string, organizationId: string) {
  if (!stripe) throw new Error('Stripe not initialized')
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      organization_id: organizationId,
    },
  })
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = PRICING_CONFIG.TRIAL_DAYS
) {
  if (!stripe) throw new Error('Stripe not initialized')
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })
}

export async function createPaymentIntent(amount: number, customerId: string) {
  if (!stripe) throw new Error('Stripe not initialized')
  return await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to pence
    currency: PRICING_CONFIG.CURRENCY,
    customer: customerId,
    automatic_payment_methods: { enabled: true },
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) throw new Error('Stripe not initialized')
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}