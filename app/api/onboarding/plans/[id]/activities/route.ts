import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { activity_type, title, description, step_id, comment_text } = body

    // Validate required fields
    if (!activity_type || !title) {
      return NextResponse.json(
        { error: 'Activity type and title are required' },
        { status: 400 }
      )
    }

    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Verify the plan belongs to the user's organization
    const { data: plan, error: planError } = await supabase
      .from('onboarding_plans')
      .select('id, organization_id')
      .eq('id', params.id)
      .eq('organization_id', organization.id)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or access denied' },
        { status: 404 }
      )
    }

    // Create activity log entry
    const { data: activity, error: activityError } = await supabase
      .from('onboarding_activities')
      .insert({
        plan_id: params.id,
        step_id: step_id || null,
        activity_type,
        title,
        description: description || null,
        comment_text: comment_text || null,
        performed_by: user.id
      })
      .select()
      .single()

    if (activityError) {
      console.error('Error creating activity:', activityError)
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      activity
    })

  } catch (error) {
    console.error('Error in activity creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}