/**
 * CRITICAL SECURITY: Organization Verification Endpoint
 * Verifies user's organization context for frontend security
 */

import { NextResponse } from 'next/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function GET() {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      organizationId: organization.id,
      organizationName: organization.name,
      userId: user.id,
      userRole: user.role
    })
    
  } catch (error) {
    console.error('🚨 SECURITY: Organization verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}