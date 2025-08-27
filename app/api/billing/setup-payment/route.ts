import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe, createCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get organization details
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let stripeCustomerId = org.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await createCustomer(
        user.email || '',
        org.name,
        org.id
      )
      stripeCustomerId = customer.id

      // Update organization with Stripe customer ID
      await supabase
        .from('organizations')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', org.id)
    }

    // Create setup intent for saving payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    })

    return NextResponse.json({
      client_secret: setupIntent.client_secret,
      customer_id: stripeCustomerId,
    })

  } catch (error) {
    console.error('Setup payment error:', error)
    return NextResponse.json(
      { error: 'Failed to setup payment method' },
      { status: 500 }
    )
  }
}