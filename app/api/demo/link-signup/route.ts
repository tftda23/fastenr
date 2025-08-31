import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingId, organizationId, userId } = body
    
    // Try to get tracking ID from multiple sources
    let finalTrackingId = trackingId
    
    if (!finalTrackingId) {
      const cookieStore = cookies()
      finalTrackingId = cookieStore.get('demo_tracking_id')?.value
    }
    
    if (!finalTrackingId || !organizationId) {
      // If no tracking ID or org ID available, this is optional - don't block
      return NextResponse.json(
        { success: true, message: 'Signup completed' },
        { status: 200 }
      )
    }

    const supabase = createClient()

    // Update the demo submission with signup info
    const { error } = await supabase
      .from('demo_submissions')
      .update({ 
        signed_up: true, 
        organization_id: organizationId,
        metadata: {
          signup_timestamp: new Date().toISOString(),
          user_id: userId
        }
      })
      .eq('tracking_id', finalTrackingId)

    if (error) {
      console.error('Demo signup link error:', error)
      // Don't return error - this is optional functionality
    }

    return NextResponse.json(
      { success: true, message: 'Demo tracking updated' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Demo signup link error:', error)
    // Don't return error - this is optional functionality
    return NextResponse.json(
      { success: true, message: 'Signup completed' },
      { status: 200 }
    )
  }
}