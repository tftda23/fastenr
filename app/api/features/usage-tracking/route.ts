import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
    }

    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization || organization.id !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if organization has premium features or usage tracking access
    const hasPremium = organization.subscription?.includes('premium') || false
    const hasUsageTracking = organization.subscription?.includes('usage_tracking') || hasPremium

    // Free tier gets basic usage tracking for 1 product
    const isEnabled = hasUsageTracking || true // Always enabled, but with limits

    return NextResponse.json({
      isEnabled,
      hasPremium,
      hasUsageTracking,
      limits: {
        maxProducts: hasPremium ? null : 1, // Unlimited for premium, 1 for free
        maxEvents: hasPremium ? null : 10000, // Unlimited for premium, 10k/month for free
        retentionDays: hasPremium ? 365 : 30, // 1 year for premium, 30 days for free
        realTimeAnalytics: hasPremium,
        customEvents: hasPremium,
        advancedBehavioral: hasPremium,
        apiAccess: hasPremium,
        dataExport: hasPremium
      }
    })

  } catch (error) {
    console.error('Error checking usage tracking features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}