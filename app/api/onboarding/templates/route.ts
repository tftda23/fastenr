import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, planType, estimatedDuration, steps } = body

    // Validate required fields
    if (!name || !planType || !steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Name, plan type, and at least one step are required' },
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

    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('onboarding_plan_templates')
      .insert({
        organization_id: organization.id,
        name: name.trim(),
        description: description?.trim() || null,
        plan_type: planType,
        estimated_duration_days: estimatedDuration || null,
        is_active: true,
        is_default: false,
        created_by: user.id,
        usage_count: 0
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating template:', templateError)
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    // Create template steps
    const templateSteps = steps.map((step: any, index: number) => ({
      template_id: template.id,
      title: step.title.trim(),
      description: step.description?.trim() || null,
      step_category: step.category,
      step_order: index + 1,
      is_required: step.isRequired,
      is_milestone: false, // Can be enhanced later
      due_days_offset: step.dueDaysOffset || 0,
      estimated_hours: step.estimatedHours || 1,
      default_assignee_role: 'csm', // Default to CSM
      default_assignee_id: null,
      instructions: step.description?.trim() || null,
      success_criteria: null, // Can be enhanced later
      external_resources: []
    }))

    const { error: stepsError } = await supabase
      .from('onboarding_template_steps')
      .insert(templateSteps)

    if (stepsError) {
      console.error('Error creating template steps:', stepsError)
      
      // Clean up the template if steps creation failed
      await supabase
        .from('onboarding_plan_templates')
        .delete()
        .eq('id', template.id)
      
      return NextResponse.json(
        { error: 'Failed to create template steps' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        planType: template.plan_type,
        stepsCount: steps.length
      }
    })

  } catch (error) {
    console.error('Error in template creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}