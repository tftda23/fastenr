import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization, checkUserPermission } from '@/lib/supabase/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('engagements')
      .select(`
        *,
        accounts (
          id,
          name,
          churn_risk_score,
          arr
        ),
        users (
          full_name
        )
      `)
      .eq('id', params.id)
      .eq('organization_id', organization.id)
      .single()
    
    if (error) {
      console.error('Error fetching engagement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/engagements/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hasPermission = await checkUserPermission('read_write')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { participants, ...engagementData } = body
    
    const supabase = createServerClient()
    
    // Update engagement
    const { data, error } = await supabase
      .from('engagements')
      .update({
        ...engagementData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('organization_id', organization.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating engagement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 })
    }
    
    // Handle participants if provided
    if (participants && Array.isArray(participants)) {
      // Remove existing participants
      await supabase
        .from('engagement_participants')
        .delete()
        .eq('engagement_id', params.id)
      
      // Add new participants if any
      if (participants.length > 0) {
        const participantsToInsert = participants.map(contactId => ({
          engagement_id: params.id,
          contact_id: contactId,
          participation_type: 'attendee',
          added_at: new Date().toISOString()
        }))
        
        await supabase
          .from('engagement_participants')
          .insert(participantsToInsert)
      }
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in PUT /api/engagements/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to update engagement' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hasPermission = await checkUserPermission('read_write')
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const supabase = createServerClient()
    
    // Delete participants first (foreign key constraint)
    await supabase
      .from('engagement_participants')
      .delete()
      .eq('engagement_id', params.id)
    
    // Delete engagement
    const { error } = await supabase
      .from('engagements')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', organization.id)
    
    if (error) {
      console.error('Error deleting engagement:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/engagements/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to delete engagement' },
      { status: 500 }
    )
  }
}