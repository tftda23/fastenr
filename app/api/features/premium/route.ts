import { NextRequest, NextResponse } from 'next/server'
import { getFeatureAccess } from '@/lib/features'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }
    
    // Use the existing feature access system
    const access = await getFeatureAccess(orgId)
    
    return NextResponse.json({ 
      isPremium: access.hasPremium,
      seatCap: access.seatCap,
      trialActive: access.trialActive,
      trialEndsAt: access.trialEndsAt
    })
    
  } catch (error) {
    console.error('Premium access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check premium access' },
      { status: 500 }
    )
  }
}