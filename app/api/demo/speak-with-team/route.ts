import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingId } = body
    
    // Try to get tracking ID from multiple sources
    let finalTrackingId = trackingId
    
    if (!finalTrackingId) {
      const cookieStore = cookies()
      finalTrackingId = cookieStore.get('demo_tracking_id')?.value
    }
    
    if (!finalTrackingId) {
      // If no tracking ID available, this is optional - don't block
      return NextResponse.json(
        { success: true, message: 'Request noted' },
        { status: 200 }
      )
    }

    const supabase = createClient()

    // Update the wants_to_speak flag for this tracking ID
    const { error } = await supabase
      .from('demo_submissions')
      .update({ wants_to_speak: true })
      .eq('tracking_id', finalTrackingId)

    if (error) {
      console.error('Speak with team update error:', error)
      // Don't return error - this is optional functionality
      return NextResponse.json(
        { success: true, message: 'Request noted' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Team contact request updated' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Speak with team error:', error)
    // Don't return error - this is optional functionality
    return NextResponse.json(
      { success: true, message: 'Request noted' },
      { status: 200 }
    )
  }
}