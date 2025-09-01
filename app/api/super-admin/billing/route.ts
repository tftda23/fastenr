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

// Generate fallback invoice number when database function fails
async function generateFallbackInvoiceNumber(serviceClient: any): Promise<string> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`
  
  try {
    // Try to find the highest existing invoice number for this month
    const { data: existingInvoices } = await serviceClient
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `INV-${yearMonth}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
    
    let sequenceNum = 1
    if (existingInvoices && existingInvoices.length > 0) {
      const lastInvoice = existingInvoices[0].invoice_number
      const match = lastInvoice.match(/INV-\d{6}-(\d+)$/)
      if (match) {
        sequenceNum = parseInt(match[1]) + 1
      }
    }
    
    return `INV-${yearMonth}-${sequenceNum.toString().padStart(4, '0')}`
  } catch (error) {
    // If all else fails, use timestamp-based unique number
    const timestamp = Date.now().toString().slice(-6)
    return `INV-${yearMonth}-T${timestamp}`
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const adminCheck = await requireSuperAdmin(supabase)
    if ('error' in adminCheck) return adminCheck.error

    const { user } = adminCheck

    // Log the access
    await logSuperAdminAction(
      user.id,
      user.email || '',
      'billing_dashboard_access',
      undefined,
      { action: 'viewed_billing_dashboard' },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    )

    // Get comprehensive billing summary - fallback to direct queries if function doesn't exist
    let billingSummary
    try {
      const { data, error } = await supabase.rpc('get_billing_summary')
      if (error) throw error
      billingSummary = data
    } catch (functionError) {
      console.log('Using fallback billing summary query:', functionError.message)
      
      // Fallback to direct query with basic columns first
      let organizations
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select(`
            id,
            name,
            seat_cap,
            trial_ends_at,
            last_billing_date,
            billing_status,
            payment_method_status,
            stripe_customer_id,
            user_profiles(count)
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        organizations = data
      } catch (columnError) {
        console.log('Using basic organization query (missing columns):', columnError.message)
        
        // Even more basic fallback if new columns don't exist
        const { data, error: basicError } = await supabase
          .from('organizations')
          .select(`
            id,
            name,
            seat_cap,
            trial_ends_at,
            stripe_customer_id,
            user_profiles(count)
          `)
          .order('created_at', { ascending: false })
        
        if (basicError) {
          console.error('Basic organizations query error:', basicError)
          return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
        }
        organizations = data
      }

      // Transform to expected format
      billingSummary = organizations?.map(org => ({
        organization_id: org.id,
        organization_name: org.name,
        seat_cap: org.seat_cap || 5,
        active_users: org.user_profiles?.[0]?.count || 0,
        trial_active: org.trial_ends_at ? new Date(org.trial_ends_at) > new Date() : false,
        trial_ends_at: org.trial_ends_at,
        last_billing_date: org.last_billing_date,
        billing_status: org.billing_status || 'trial',
        payment_method_status: org.payment_method_status || 'none',
        current_period_changes: 0, // Will be populated later
        outstanding_amount: 0, // Will be populated later
        stripe_customer_id: org.stripe_customer_id,
        needs_billing: (() => {
          const now = new Date()
          const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const lastBilling = org.last_billing_date ? new Date(org.last_billing_date) : null
          const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null
          
          // Needs billing if:
          // 1. Trial has ended AND never been billed, OR
          // 2. Last billing was before current month (monthly billing cycle)
          return (trialEnd && trialEnd < now && !lastBilling) || 
                 (lastBilling && lastBilling < currentMonth)
        })()
      })) || []
    }

    // Get payment methods for organizations with Stripe customers
    let paymentMethods = []
    try {
      const { data } = await supabase
        .from('payment_methods')
        .select(`
          organization_id,
          stripe_customer_id,
          type,
          brand,
          last4,
          exp_month,
          exp_year,
          is_default,
          created_at
        `)
        .eq('is_default', true)
      paymentMethods = data || []
    } catch (pmError) {
      console.log('Payment methods table not available:', pmError.message)
      paymentMethods = []
    }

    // Get recent billing events for context
    let recentBillingEvents = []
    try {
      const { data } = await supabase
        .from('billing_events')
        .select(`
          id,
          organization_id,
          event_type,
          seat_count,
          previous_seat_count,
          is_license_change,
          change_effective_date,
          total_monthly_cost,
          effective_date,
          metadata,
          organizations(name)
        `)
        .order('effective_date', { ascending: false })
        .limit(100)
      recentBillingEvents = data || []
    } catch (beError) {
      console.log('Billing events table not available:', beError.message)
      recentBillingEvents = []
    }

    // Get outstanding invoices
    let outstandingInvoices = []
    try {
      const { data } = await supabase
        .from('invoices')
        .select(`
          id,
          organization_id,
          invoice_number,
          status,
          total_amount,
          amount_due,
          due_date,
          created_at,
          organizations(name)
        `)
        .in('status', ['open', 'overdue'])
        .order('due_date', { ascending: true })
      outstandingInvoices = data || []
    } catch (invError) {
      console.log('Invoices table not available:', invError.message)
      outstandingInvoices = []
    }

    // Combine data with payment method info
    const enrichedSummary = billingSummary?.map(org => {
      const paymentMethod = paymentMethods?.find(pm => pm.organization_id === org.organization_id)
      const orgInvoices = outstandingInvoices?.filter(inv => inv.organization_id === org.organization_id) || []
      
      return {
        ...org,
        payment_method: paymentMethod ? {
          type: paymentMethod.type,
          brand: paymentMethod.brand,
          last4: paymentMethod.last4,
          exp_month: paymentMethod.exp_month,
          exp_year: paymentMethod.exp_year,
          created_at: paymentMethod.created_at
        } : null,
        outstanding_invoices: orgInvoices.map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          status: inv.status,
          total_amount: inv.total_amount / 100, // Convert from pence
          amount_due: inv.amount_due / 100,
          due_date: inv.due_date,
          created_at: inv.created_at
        }))
      }
    })

    // Calculate summary statistics
    const totalOrganizations = billingSummary?.length || 0
    const trialsActive = billingSummary?.filter(org => org.trial_active).length || 0
    const needsBilling = billingSummary?.filter(org => org.needs_billing).length || 0
    const hasPaymentMethod = billingSummary?.filter(org => org.payment_method_status === 'valid').length || 0
    const totalOutstanding = outstandingInvoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

    return NextResponse.json({
      summary: {
        totalOrganizations,
        trialsActive,
        paidOrganizations: totalOrganizations - trialsActive,
        needsBilling,
        hasPaymentMethod,
        missingPaymentMethod: totalOrganizations - hasPaymentMethod,
        totalOutstanding: totalOutstanding / 100,
        outstandingInvoices: outstandingInvoices?.length || 0
      },
      organizations: enrichedSummary,
      recentBillingEvents: recentBillingEvents?.map(event => ({
        ...event,
        total_monthly_cost: event.total_monthly_cost / 100,
        organization_name: (event.organizations as any)?.name
      }))
    })

  } catch (error) {
    console.error('Super admin billing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const adminCheck = await requireSuperAdmin(supabase)
    if ('error' in adminCheck) return adminCheck.error

    const { user } = adminCheck
    const body = await request.json()
    const { action, organizationIds, ...params } = body

    // Log the action
    await logSuperAdminAction(
      user.id,
      user.email || '',
      `billing_action_${action}`,
      undefined,
      { action, organizationIds, params },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    )

    switch (action) {
      case 'generate_invoices':
        return await handleGenerateInvoices(supabase, organizationIds, user)
      
      case 'process_payments':
        return await handleProcessPayments(supabase, organizationIds, user)
      
      case 'send_invoices':
        return await handleSendInvoices(supabase, organizationIds, user)
      
      case 'update_billing_status':
        return await handleUpdateBillingStatus(supabase, params.organizationId, params.status, user)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Super admin billing action error:', error)
    return NextResponse.json(
      { error: 'Failed to process billing action' },
      { status: 500 }
    )
  }
}

async function handleGenerateInvoices(
  supabase: ReturnType<typeof createServerClient>,
  organizationIds: string[],
  user: any
) {
  const results = []
  
  for (const orgId of organizationIds) {
    try {
      // Get organization billing details
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()

      if (!org) {
        results.push({ organizationId: orgId, success: false, error: 'Organization not found' })
        continue
      }

      // Calculate billing amount based on scenarios
      const billingResult = await calculateBillingAmount(supabase, orgId)
      
      if (!billingResult.success) {
        results.push({ organizationId: orgId, success: false, error: billingResult.error })
        continue
      }

      // Create invoice
      const invoice = await createBillingInvoice(supabase, orgId, billingResult.billingData)
      
      results.push({ 
        organizationId: orgId, 
        success: true, 
        invoiceId: invoice.id,
        amount: billingResult.billingData.totalAmount
      })

    } catch (error) {
      results.push({ 
        organizationId: orgId, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return NextResponse.json({ results })
}

async function handleProcessPayments(
  supabase: ReturnType<typeof createServerClient>,
  organizationIds: string[],
  user: any
) {
  // Implementation for processing payments via Stripe
  return NextResponse.json({ message: 'Payment processing not yet implemented' })
}

async function handleSendInvoices(
  supabase: ReturnType<typeof createServerClient>,
  organizationIds: string[],
  user: any
) {
  // Implementation for sending invoice emails
  return NextResponse.json({ message: 'Invoice sending not yet implemented' })
}

async function handleUpdateBillingStatus(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  status: string,
  user: any
) {
  const { error } = await supabase
    .from('organizations')
    .update({ billing_status: status })
    .eq('id', organizationId)

  if (error) {
    return NextResponse.json({ error: 'Failed to update billing status' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

async function calculateBillingAmount(supabase: ReturnType<typeof createServerClient>, organizationId: string) {
  // Get organization details
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (orgError || !org) {
    console.error('Organization query error:', orgError)
    return { success: false, error: 'Organization not found' }
  }

  // Validate required fields
  if (!org.seat_cap || org.seat_cap < 1) {
    return { success: false, error: 'Invalid seat capacity' }
  }

  // Get current billing period
  const { data: currentPeriod } = await supabase
    .rpc('get_current_billing_period', { org_id: organizationId })

  // Get billing events for this period
  const { data: billingEvents } = await supabase
    .from('billing_events')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('billing_period_id', currentPeriod?.id)
    .order('effective_date', { ascending: true })

  // Calculate billing scenarios
  const now = new Date()
  const trialEndDate = org.trial_ends_at ? new Date(org.trial_ends_at) : null
  const lastBillingDate = org.last_billing_date ? new Date(org.last_billing_date) : null
  
  let billingData = {
    organizationId,
    organizationName: org.name,
    billingPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1),
    billingPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    lineItems: [],
    totalAmount: 0,
    scenario: ''
  }

  // Scenario 1: Never been billed (trial to paid conversion)
  if (!lastBillingDate && trialEndDate && trialEndDate < now) {
    billingData.scenario = 'trial_to_paid'
    billingData.billingPeriodStart = trialEndDate
    
    const daysInPeriod = Math.ceil((billingData.billingPeriodEnd.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const prorationFactor = daysInPeriod / daysInMonth
    
    const monthlyAmount = org.seat_cap * (org.seat_cap <= 99 ? 25 : 35)
    billingData.totalAmount = Math.round(monthlyAmount * prorationFactor)
    
    billingData.lineItems.push({
      description: `Fastenr Subscription (${org.seat_cap} seats) - ${daysInPeriod} days`,
      quantity: org.seat_cap,
      unit_price: org.seat_cap <= 99 ? 25 : 35,
      amount: billingData.totalAmount
    })
  }
  
  // Scenario 2: License changes during billing period
  else if (billingEvents && billingEvents.some(e => e.is_license_change)) {
    billingData.scenario = 'license_change_billing'
    // Complex pro-rated billing logic here
    // This would calculate billing for different seat counts across the period
  }
  
  // Scenario 3: Standard monthly billing
  else {
    billingData.scenario = 'standard_monthly'
    const monthlyAmount = org.seat_cap * (org.seat_cap <= 99 ? 25 : 35)
    billingData.totalAmount = monthlyAmount
    
    billingData.lineItems.push({
      description: `Fastenr Subscription (${org.seat_cap} seats)`,
      quantity: org.seat_cap,
      unit_price: org.seat_cap <= 99 ? 25 : 35,
      amount: monthlyAmount
    })
  }

  return { success: true, billingData }
}

async function createBillingInvoice(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  billingData: any
) {
  // Use service role client to bypass RLS for invoice creation
  const serviceClient = createServiceRoleClient()
  
  // Generate invoice number - handle both function return and fallback
  let invoiceNumber
  try {
    const { data, error } = await serviceClient.rpc('generate_invoice_number')
    if (error) {
      console.warn('Invoice number function failed, using fallback:', error.message)
      invoiceNumber = await generateFallbackInvoiceNumber(serviceClient)
    } else {
      invoiceNumber = data
    }
  } catch (funcError) {
    console.warn('Invoice number function not available, using fallback:', funcError.message)
    invoiceNumber = await generateFallbackInvoiceNumber(serviceClient)
  }

  // Ensure we have a valid invoice number
  if (!invoiceNumber || typeof invoiceNumber !== 'string') {
    invoiceNumber = await generateFallbackInvoiceNumber(serviceClient)
  }
  
  const invoiceData = {
    organization_id: organizationId,
    invoice_number: invoiceNumber,
    status: 'open',
    billing_period_start: billingData.billingPeriodStart.toISOString().split('T')[0],
    billing_period_end: billingData.billingPeriodEnd.toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: billingData.totalAmount * 100, // Convert to pence
    tax_amount: Math.round(billingData.totalAmount * 100 * 0.2), // 20% VAT
    total_amount: Math.round(billingData.totalAmount * 100 * 1.2),
    amount_paid: 0,
    amount_due: Math.round(billingData.totalAmount * 100 * 1.2),
    line_items: billingData.lineItems,
    customer_details: {
      scenario: billingData.scenario,
      organization_name: billingData.organizationName || 'Unknown'
    }
  }

  // Use service role client to insert invoice (bypasses RLS)
  const { data: invoice, error } = await serviceClient
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    console.error('Invoice creation error:', error)
    throw new Error(`Failed to create invoice: ${error.message}`)
  }

  // Update organization last billing date using service role client
  const { error: updateError } = await serviceClient
    .from('organizations')
    .update({ 
      last_billing_date: billingData.billingPeriodEnd.toISOString().split('T')[0],
      billing_status: 'active'
    })
    .eq('id', organizationId)

  if (updateError) {
    console.warn('Failed to update organization billing status:', updateError.message)
    // Don't throw here as the invoice was created successfully
  }

  return invoice
}