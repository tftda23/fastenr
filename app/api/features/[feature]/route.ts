import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { hasFeatureAccess } from '@/lib/features'

export async function GET(
  request: NextRequest,
  { params }: { params: { feature: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check feature access
    const hasAccess = await hasFeatureAccess(profile.organization_id, params.feature)
    
    console.log(`Feature access check for ${params.feature}:`, {
      organizationId: profile.organization_id,
      hasAccess,
      feature: params.feature
    })
    
    return NextResponse.json({ 
      hasAccess,
      feature: params.feature 
    })
    
  } catch (error) {
    console.error('Feature access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    )
  }
}