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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const adminCheck = await requireSuperAdmin(supabase)
    if ('error' in adminCheck) return adminCheck.error

    const { user } = adminCheck
    const organizationId = params.id
    const body = await request.json()
    const { action, invoiceId } = body

    // Log the action
    await logSuperAdminAction(
      user.id,
      user.email || '',
      `invoice_action_${action}`,
      organizationId,
      { action, invoiceId },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    )

    switch (action) {
      case 'generate_invoice':
        return await handleGenerateInvoice(supabase, organizationId, user)
      
      case 'send_invoice':
        return await handleSendInvoice(supabase, invoiceId, user)
      
      case 'download_pdf':
        return await handleDownloadPDF(supabase, invoiceId, user)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Invoice action error:', error)
    return NextResponse.json(
      { error: 'Failed to process invoice action' },
      { status: 500 }
    )
  }
}

async function handleGenerateInvoice(
  supabase: ReturnType<typeof createServerClient>,
  organizationId: string,
  user: any
) {
  try {
    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Calculate billing amount
    const billingResult = await calculateBillingAmount(supabase, organizationId)
    
    if (!billingResult.success) {
      return NextResponse.json({ error: billingResult.error }, { status: 400 })
    }

    // Create invoice
    const invoice = await createBillingInvoice(supabase, organizationId, billingResult.billingData)
    
    return NextResponse.json({ 
      success: true, 
      invoiceId: invoice.id,
      amount: billingResult.billingData.totalAmount
    })

  } catch (error) {
    console.error('Generate invoice error:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}

async function handleSendInvoice(
  supabase: ReturnType<typeof createServerClient>,
  invoiceId: string,
  user: any
) {
  // Implementation for sending invoice emails
  // This would integrate with your email service
  return NextResponse.json({ message: 'Invoice sending not yet implemented' })
}

async function handleDownloadPDF(
  supabase: ReturnType<typeof createServerClient>,
  invoiceId: string,
  user: any
) {
  // Implementation for generating and downloading PDF
  // This would integrate with a PDF generation service
  return NextResponse.json({ message: 'PDF download not yet implemented' })
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

  // Calculate billing scenarios
  const now = new Date()
  const trialEndDate = org.trial_ends_at ? new Date(org.trial_ends_at) : null
  const lastBillingDate = org.last_billing_date ? new Date(org.last_billing_date) : null
  
  const billingData = {
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
  
  // Scenario 2: Standard monthly billing
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