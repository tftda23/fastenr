import { createServerClient } from '@/lib/supabase/server'
import { stripe, calculatePricing } from '@/lib/stripe'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface Invoice {
  id: string
  organization_id: string
  stripe_invoice_id?: string
  invoice_number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  billing_period_start: string
  billing_period_end: string
  due_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  amount_due: number
  line_items: any[]
  customer_details: any
  pdf_url?: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  organization_id: string
  stripe_payment_method_id: string
  stripe_customer_id: string
  type: string
  brand?: string
  last4?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export async function createInvoice(
  organizationId: string,
  seatCount: number,
  includePremium: boolean,
  billingPeriodStart: Date,
  billingPeriodEnd: Date
): Promise<Invoice> {
  const supabase = createServerClient()
  
  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  const pricing = calculatePricing(seatCount, includePremium)
  
  // Generate invoice number
  const { data: invoiceNumberResult } = await supabase
    .rpc('generate_invoice_number')

  const invoiceNumber = invoiceNumberResult || `INV-${Date.now()}`

  // Create line items
  const lineItems = [
    {
      description: `Fastenr Subscription (${seatCount} seats)`,
      quantity: seatCount,
      unit_price: pricing.pricePerSeat * 100, // Convert to pence
      amount: pricing.baseAmount * 100
    }
  ]

  if (pricing.premiumAmount > 0) {
    lineItems.push({
      description: `Premium Add-on (${seatCount} seats)`,
      quantity: seatCount,
      unit_price: 200, // £2 in pence
      amount: pricing.premiumAmount * 100
    })
  }

  const subtotal = pricing.totalAmount * 100 // Convert to pence
  const taxAmount = Math.round(subtotal * 0.2) // 20% VAT
  const totalAmount = subtotal + taxAmount

  const invoiceData = {
    organization_id: organizationId,
    invoice_number: invoiceNumber,
    status: 'open' as const,
    billing_period_start: billingPeriodStart.toISOString().split('T')[0],
    billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    amount_paid: 0,
    amount_due: totalAmount,
    line_items: lineItems,
    customer_details: {
      name: org.name,
      email: org.email || '',
      address: org.address || {}
    }
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`)
  }

  return invoice
}

export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('INVOICE', 20, 30)
  
  // Company details
  doc.setFontSize(12)
  doc.text('Fastenr Ltd', 20, 50)
  doc.text('Customer Success Platform', 20, 60)
  doc.text('support@fastenr.com', 20, 70)
  
  // Invoice details
  doc.text(`Invoice #: ${invoice.invoice_number}`, 120, 50)
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 120, 60)
  doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 120, 70)
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 120, 80)
  
  // Customer details
  doc.text('Bill To:', 20, 100)
  doc.text(invoice.customer_details.name, 20, 110)
  if (invoice.customer_details.email) {
    doc.text(invoice.customer_details.email, 20, 120)
  }
  
  // Billing period
  doc.text(`Billing Period: ${invoice.billing_period_start} to ${invoice.billing_period_end}`, 20, 140)
  
  // Line items table
  const tableData = invoice.line_items.map(item => [
    item.description,
    item.quantity.toString(),
    `£${(item.unit_price / 100).toFixed(2)}`,
    `£${(item.amount / 100).toFixed(2)}`
  ])
  
  ;(doc as any).autoTable({
    startY: 160,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'grid'
  })
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.text(`Subtotal: £${(invoice.subtotal / 100).toFixed(2)}`, 120, finalY)
  doc.text(`VAT (20%): £${(invoice.tax_amount / 100).toFixed(2)}`, 120, finalY + 10)
  doc.setFontSize(14)
  doc.text(`Total: £${(invoice.total_amount / 100).toFixed(2)}`, 120, finalY + 25)
  
  // Payment terms
  doc.setFontSize(10)
  doc.text('Payment Terms: Net 30 days', 20, finalY + 50)
  doc.text('Thank you for your business!', 20, finalY + 60)
  
  return Buffer.from(doc.output('arraybuffer'))
}

export async function getOrganizationInvoices(organizationId: string): Promise<Invoice[]> {
  const supabase = createServerClient()
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`)
  }

  return invoices || []
}

export async function getOrganizationPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
  const supabase = createServerClient()
  
  const { data: paymentMethods, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch payment methods: ${error.message}`)
  }

  return paymentMethods || []
}

export async function logSuperAdminAction(
  adminUserId: string,
  adminEmail: string,
  action: string,
  targetOrganizationId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string
) {
  const supabase = createServerClient()
  
  await supabase.from('super_admin_audit').insert({
    admin_user_id: adminUserId,
    admin_email: adminEmail,
    action,
    target_organization_id: targetOrganizationId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent
  })
}