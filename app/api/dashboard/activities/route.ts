import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    
    console.log('Activities API called with ownerId:', ownerId)
    
    // Pass ownerId to filter activities if provided
    const activities = await getRecentActivities(10, ownerId || undefined)
    
    console.log('Activities fetched:', activities.length, 'activities')
    console.log('Sample activities:', activities.slice(0, 3))
    
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching dashboard activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}