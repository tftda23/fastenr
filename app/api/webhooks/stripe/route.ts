import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerClient()

    switch (event.type) {
      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as Stripe.SetupIntent
        await handleSetupIntentSucceeded(supabase, setupIntent)
        break
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod
        await handlePaymentMethodAttached(supabase, paymentMethod)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(supabase, invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(supabase, invoice)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription)
        break
      }

      default:
        // Unhandled event type
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSetupIntentSucceeded(
  supabase: ReturnType<typeof createServerClient>,
  setupIntent: Stripe.SetupIntent
) {
  if (!setupIntent.payment_method || !setupIntent.customer) return

  const paymentMethod = await stripe.paymentMethods.retrieve(
    setupIntent.payment_method as string
  )

  // Get organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', setupIntent.customer)
    .single()

  if (!org) return

  // Save payment method to database
  await supabase.from('payment_methods').insert({
    organization_id: org.id,
    stripe_payment_method_id: paymentMethod.id,
    stripe_customer_id: setupIntent.customer as string,
    type: paymentMethod.type,
    brand: paymentMethod.card?.brand,
    last4: paymentMethod.card?.last4,
    exp_month: paymentMethod.card?.exp_month,
    exp_year: paymentMethod.card?.exp_year,
    is_default: true // First payment method is default
  })
}

async function handlePaymentMethodAttached(
  supabase: ReturnType<typeof createServerClient>,
  paymentMethod: Stripe.PaymentMethod
) {
  if (!paymentMethod.customer) return

  // Get organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', paymentMethod.customer)
    .single()

  if (!org) return

  // Update existing payment methods to not be default
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('organization_id', org.id)

  // Insert or update payment method
  await supabase.from('payment_methods').upsert({
    organization_id: org.id,
    stripe_payment_method_id: paymentMethod.id,
    stripe_customer_id: paymentMethod.customer as string,
    type: paymentMethod.type,
    brand: paymentMethod.card?.brand,
    last4: paymentMethod.card?.last4,
    exp_month: paymentMethod.card?.exp_month,
    exp_year: paymentMethod.card?.exp_year,
    is_default: true
  })
}

async function handleInvoicePaymentSucceeded(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  if (!invoice.customer) return

  // Get organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (!org) return

  // Update invoice status
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due
    })
    .eq('stripe_invoice_id', invoice.id)

  // Record payment
  const { data: dbInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (dbInvoice) {
    await supabase.from('invoice_payments').insert({
      invoice_id: dbInvoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: invoice.amount_paid,
      status: 'succeeded',
      processed_at: new Date().toISOString()
    })
  }
}

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof createServerClient>,
  invoice: Stripe.Invoice
) {
  if (!invoice.customer) return

  // Get organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (!org) return

  // Update invoice status
  await supabase
    .from('invoices')
    .update({
      status: 'open',
      amount_due: invoice.amount_due
    })
    .eq('stripe_invoice_id', invoice.id)

  // Record failed payment
  const { data: dbInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (dbInvoice) {
    await supabase.from('invoice_payments').insert({
      invoice_id: dbInvoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: 0,
      status: 'failed',
      failure_reason: 'Payment failed',
      processed_at: new Date().toISOString()
    })
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createServerClient>,
  subscription: Stripe.Subscription
) {
  // Handle subscription changes if needed
  // Subscription updated successfully
}