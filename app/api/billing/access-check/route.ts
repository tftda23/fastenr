import { NextRequest, NextResponse } from 'next/server'
import { checkBillingAccess, createBillingAccessResponse } from '@/lib/billing-access-control'

export async function GET(request: NextRequest) {
  try {
    const check = await checkBillingAccess()
    
    // If access is denied, return 402 Payment Required
    const accessResponse = createBillingAccessResponse(check)
    if (accessResponse) {
      return accessResponse
    }
    
    // Access granted - return status info
    return NextResponse.json({
      access_granted: true,
      needs_billing: check.needsBilling,
      has_payment_method: check.hasPaymentMethod,
      organization_id: check.organizationId
    })
    
  } catch (error) {
    console.error('Billing access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check billing access' },
      { status: 500 }
    )
  }
}