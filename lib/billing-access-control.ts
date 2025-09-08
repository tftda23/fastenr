import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export interface BillingAccessCheck {
  hasAccess: boolean
  reason?: string
  organizationId?: string
  needsBilling?: boolean
  hasPaymentMethod?: boolean
}

export async function checkBillingAccess(): Promise<BillingAccessCheck> {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { hasAccess: false, reason: 'Not authenticated' }
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { hasAccess: false, reason: 'Profile not found' }
    }

    // Get organization billing status
    const { data: org } = await supabase
      .from('organizations')
      .select(`
        id,
        trial_ends_at,
        last_billing_date,
        billing_status,
        payment_method_status,
        stripe_customer_id
      `)
      .eq('id', profile.organization_id)
      .single()

    if (!org) {
      return { hasAccess: false, reason: 'Organization not found' }
    }

    // Check if organization needs billing
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastBilling = org.last_billing_date ? new Date(org.last_billing_date) : null
    const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null
    
    const needsBilling: boolean = Boolean((trialEnd && trialEnd < now && !lastBilling) || 
                                         (lastBilling && lastBilling < currentMonth))

    // Check if has payment method
    const hasPaymentMethod = org.stripe_customer_id && org.payment_method_status === 'valid'

    // Block access if needs billing but no payment method
    if (needsBilling && !hasPaymentMethod) {
      return {
        hasAccess: false,
        reason: 'Billing required - please add a payment method',
        organizationId: org.id,
        needsBilling: true,
        hasPaymentMethod: false
      }
    }

    // Allow access
    return {
      hasAccess: true,
      organizationId: org.id,
      needsBilling,
      hasPaymentMethod
    }

  } catch (error) {
    console.error('Billing access check error:', error)
    return { hasAccess: false, reason: 'Access check failed' }
  }
}

export function createBillingAccessResponse(check: BillingAccessCheck) {
  if (!check.hasAccess) {
    return NextResponse.json({
      error: check.reason,
      billing_required: check.needsBilling,
      payment_method_required: check.needsBilling && !check.hasPaymentMethod,
      organization_id: check.organizationId
    }, { status: 402 }) // 402 Payment Required
  }
  return null
}

// Middleware function to add to protected routes
export async function requireBillingAccess() {
  const check = await checkBillingAccess()
  const response = createBillingAccessResponse(check)
  
  if (response) {
    throw new Error(`Billing access denied: ${check.reason}`)
  }
  
  return check
}