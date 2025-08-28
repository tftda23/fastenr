import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { data: participants, error } = await supabase
      .from('engagement_participants')
      .select(`
        id,
        contact_id,
        participation_type,
        response_status,
        contacts (
          id,
          first_name,
          last_name,
          email,
          title,
          phone,
          account_name:accounts(name)
        )
      `)
      .eq('engagement_id', params.id)
    
    if (error) {
      console.error('Error fetching engagement participants:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(participants || [])
  } catch (error) {
    console.error('Error in GET /api/engagements/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { contactIds } = await request.json()
    
    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json(
        { error: 'contactIds is required and must be an array' },
        { status: 400 }
      )
    }
    
    // First, remove existing participants for this engagement
    await supabase
      .from('engagement_participants')
      .delete()
      .eq('engagement_id', params.id)
    
    // Insert new participants
    const participantsToInsert = contactIds.map(contactId => ({
      engagement_id: params.id,
      contact_id: contactId,
      participation_type: 'attendee',
      added_at: new Date().toISOString()
    }))
    
    const { data, error } = await supabase
      .from('engagement_participants')
      .insert(participantsToInsert)
      .select()
    
    if (error) {
      console.error('Error adding engagement participants:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/engagements/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Failed to add participants' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { contactIds } = await request.json()
    
    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json(
        { error: 'contactIds is required and must be an array' },
        { status: 400 }
      )
    }
    
    // Remove existing participants
    await supabase
      .from('engagement_participants')
      .delete()
      .eq('engagement_id', params.id)
    
    // Add new participants if any
    if (contactIds.length > 0) {
      const participantsToInsert = contactIds.map(contactId => ({
        engagement_id: params.id,
        contact_id: contactId,
        participation_type: 'attendee',
        added_at: new Date().toISOString()
      }))
      
      const { data, error } = await supabase
        .from('engagement_participants')
        .insert(participantsToInsert)
        .select()
      
      if (error) {
        console.error('Error updating engagement participants:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json(data)
    }
    
    return NextResponse.json([])
  } catch (error) {
    console.error('Error in PUT /api/engagements/[id]/participants:', error)
    return NextResponse.json(
      { error: 'Failed to update participants' },
      { status: 500 }
    )
  }
}