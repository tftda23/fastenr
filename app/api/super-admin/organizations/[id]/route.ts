import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { logSuperAdminAction } from '@/lib/billing'

// Super admin emails - only these users can access super admin features
const SUPER_ADMIN_EMAILS = [
  'adam@fastenr.com',
  'admin@fastenr.com',
  'acwood90@gmail.com',
  // Add more fastenr staff emails here
]

async function requireSuperAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  if (!SUPER_ADMIN_EMAILS.includes(user.email || '')) {
    return { error: NextResponse.json({ error: 'Super admin access required' }, { status: 403 }) }
  }

  return { user }
}

// Create service role client for bypassing RLS
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const adminCheck = await requireSuperAdmin(supabase)
    if ('error' in adminCheck) return adminCheck.error

    const { user } = adminCheck
    const organizationId = params.id

    // Log the access
    await logSuperAdminAction(
      user.id,
      user.email || '',
      'organization_detail_access',
      organizationId,
      { action: 'viewed_organization_details' },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    )

    // Get organization details with user count
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        created_at,
        seat_cap,
        plan,
        trial_ends_at,
        premium_addon,
        stripe_customer_id,
        billing_status,
        payment_method_status,
        last_billing_date,
        user_profiles(count)
      `)
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Organization query error:', orgError)
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get invoices for this organization using service role client to bypass RLS
    const serviceClient = createServiceRoleClient()
    const { data: invoices, error: invoicesError } = await serviceClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        billing_period_start,
        billing_period_end,
        subtotal,
        tax_amount,
        total_amount,
        amount_paid,
        amount_due,
        due_date,
        created_at,
        line_items
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      console.error('Invoices query error:', invoicesError)
    }

    // Get payment methods using service role client
    const { data: paymentMethods, error: pmError } = await serviceClient
      .from('payment_methods')
      .select(`
        id,
        type,
        brand,
        last4,
        exp_month,
        exp_year,
        is_default,
        created_at
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (pmError) {
      console.error('Payment methods query error:', pmError)
    }

    // Get billing events using service role client
    const { data: billingEvents, error: beError } = await serviceClient
      .from('billing_events')
      .select(`
        id,
        event_type,
        seat_count,
        previous_seat_count,
        is_license_change,
        total_monthly_cost,
        effective_date,
        metadata
      `)
      .eq('organization_id', organizationId)
      .order('effective_date', { ascending: false })
      .limit(50)

    if (beError) {
      console.error('Billing events query error:', beError)
    }

    // Transform organization data
    const transformedOrg = {
      ...organization,
      active_users: organization.user_profiles?.[0]?.count || 0,
      trial_active: organization.trial_ends_at ? new Date(organization.trial_ends_at) > new Date() : false,
      billing_status: organization.billing_status || 'trial',
      payment_method_status: organization.payment_method_status || 'none'
    }

    // Transform invoices (convert amounts from pence to display format but keep as pence for calculations)
    const transformedInvoices = (invoices || []).map(invoice => ({
      ...invoice,
      line_items: invoice.line_items || []
    }))

    // Transform billing events
    const transformedBillingEvents = (billingEvents || []).map(event => ({
      ...event,
      total_monthly_cost: event.total_monthly_cost || 0
    }))

    return NextResponse.json({
      organization: transformedOrg,
      invoices: transformedInvoices,
      paymentMethods: paymentMethods || [],
      billingEvents: transformedBillingEvents
    })

  } catch (error) {
    console.error('Organization details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization details' },
      { status: 500 }
    )
  }
}