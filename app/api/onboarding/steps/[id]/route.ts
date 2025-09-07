import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, title, description, completed_at, assignee_id, due_date, notes } = body

    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Verify the step belongs to a plan in the user's organization
    const { data: step, error: stepError } = await supabase
      .from('onboarding_steps')
      .select(`
        id,
        plan_id,
        onboarding_plans!inner(organization_id)
      `)
      .eq('id', params.id)
      .single()

    if (stepError || !step) {
      return NextResponse.json(
        { error: 'Step not found or access denied' },
        { status: 404 }
      )
    }

    if (step.onboarding_plans.organization_id !== organization.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description
    if (completed_at !== undefined) updateData.completed_at = completed_at
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id
    if (due_date !== undefined) updateData.due_date = due_date
    if (notes !== undefined) updateData.notes = notes

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Update the step
    const { data: updatedStep, error: updateError } = await supabase
      .from('onboarding_steps')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating step:', updateError)
      return NextResponse.json(
        { error: 'Failed to update step' },
        { status: 500 }
      )
    }

    // If status changed to completed, update plan progress
    if (status === 'completed') {
      // Get plan stats
      const { data: planStats, error: statsError } = await supabase
        .from('onboarding_steps')
        .select('id, status')
        .eq('plan_id', step.plan_id)

      if (!statsError && planStats) {
        const totalSteps = planStats.length
        const completedSteps = planStats.filter(s => s.status === 'completed').length
        const completionPercentage = Math.round((completedSteps / totalSteps) * 100)

        // Update plan progress
        await supabase
          .from('onboarding_plans')
          .update({
            completed_steps: completedSteps,
            completion_percentage: completionPercentage,
            status: completionPercentage === 100 ? 'completed' : 'in_progress',
            actual_completion_date: completionPercentage === 100 ? new Date().toISOString() : null
          })
          .eq('id', step.plan_id)
      }
    }

    return NextResponse.json({
      success: true,
      step: updatedStep
    })

  } catch (error) {
    console.error('Error in step update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}