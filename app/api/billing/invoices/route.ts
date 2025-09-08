import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getOrganizationInvoices, createInvoice } from '@/lib/billing'

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

    // Get invoices directly from database with fallback
    let invoices = []
    try {
      const invoicesResult = await getOrganizationInvoices(profile.organization_id)
      invoices = invoicesResult
    } catch (libError) {
      console.log('Using fallback invoice query:', libError instanceof Error ? libError.message : String(libError))
      
      // Fallback to direct database query
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Invoice query error:', error)
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
      }
      
      invoices = data || []
    }
    
    return NextResponse.json({ invoices })

  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
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

    const body = await request.json()
    const { seatCount, includePremium, billingPeriodStart, billingPeriodEnd } = body

    if (!seatCount || !billingPeriodStart || !billingPeriodEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const invoice = await createInvoice(
      profile.organization_id,
      seatCount,
      includePremium || false,
      new Date(billingPeriodStart),
      new Date(billingPeriodEnd)
    )

    return NextResponse.json({ invoice })

  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}