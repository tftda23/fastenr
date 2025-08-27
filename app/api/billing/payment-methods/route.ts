import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
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
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get payment methods from database
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
    }

    return NextResponse.json({ payment_methods: paymentMethods || [] })

  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('id')

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID required' }, { status: 400 })
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get payment method to verify ownership
    const { data: paymentMethod } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('organization_id', profile.organization_id)
      .single()

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripe_payment_method_id)

    // Delete from database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}