import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('tour_completed')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching tour status:', error)
      return NextResponse.json({ error: 'Failed to fetch tour status' }, { status: 500 })
    }

    return NextResponse.json({ tour_completed: profile?.tour_completed || false })
  } catch (error) {
    console.error('Tour status GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completed } = await request.json()

    const { error } = await supabase
      .from('user_profiles')
      .update({ tour_completed: completed })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating tour status:', error)
      return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, tour_completed: completed })
  } catch (error) {
    console.error('Tour status POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}