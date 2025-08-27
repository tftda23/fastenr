import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logSuperAdminAction } from '@/lib/billing'

// Super admin emails - only these users can access super admin features
const SUPER_ADMIN_EMAILS = [
  'adam@fastenr.com',
  'admin@fastenr.com',
  'acwood90@gmail.com', // Add your email here
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
      'super_admin_overview_access',
      undefined,
      { action: 'viewed_overview' },
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      request.headers.get('user-agent')
    )

    // Get all organizations with billing data
    const { data: organizations, error: orgError } = await supabase
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
        user_profiles(count)
      `)
      .order('created_at', { ascending: false })

    if (orgError) {
      console.error('Organizations query error:', orgError)
      return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
    }

    // Get billing statistics
    const { data: billingStats } = await supabase
      .from('billing_events')
      .select('total_monthly_cost, trial_active, created_at')
      .order('created_at', { ascending: false })

    // Get recent invoices
    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total_amount,
        due_date,
        created_at,
        organizations(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    // Calculate metrics
    const totalOrganizations = organizations?.length || 0
    const activeTrials = organizations?.filter(org => {
      const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null
      return trialEnd && trialEnd > new Date()
    }).length || 0

    const totalMRR = billingStats?.reduce((sum, event) => {
      return event.trial_active ? sum : sum + (event.total_monthly_cost / 100)
    }, 0) || 0

    const unpaidInvoices = recentInvoices?.filter(inv => inv.status === 'open').length || 0
    const totalUnpaidAmount = recentInvoices
      ?.filter(inv => inv.status === 'open')
      .reduce((sum, inv) => sum + inv.total_amount, 0) || 0

    return NextResponse.json({
      overview: {
        totalOrganizations,
        activeTrials,
        paidOrganizations: totalOrganizations - activeTrials,
        totalMRR: totalMRR / 100, // Convert from pence to pounds
        unpaidInvoices,
        totalUnpaidAmount: totalUnpaidAmount / 100
      },
      organizations: organizations?.map(org => ({
        ...org,
        activeUsers: org.user_profiles?.[0]?.count || 0,
        trialActive: org.trial_ends_at ? new Date(org.trial_ends_at) > new Date() : false
      })),
      recentInvoices: recentInvoices?.map(inv => ({
        ...inv,
        total_amount: inv.total_amount / 100,
        organization_name: inv.organizations?.name
      }))
    })

  } catch (error) {
    console.error('Super admin overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    )
  }
}