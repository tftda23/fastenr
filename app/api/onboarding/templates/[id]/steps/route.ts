import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Verify the template belongs to the user's organization
    const { data: template, error: templateError } = await supabase
      .from('onboarding_plan_templates')
      .select('id, name, organization_id')
      .eq('id', params.id)
      .eq('organization_id', organization.id)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      )
    }

    // Get template steps
    const { data: steps, error: stepsError } = await supabase
      .from('onboarding_template_steps')
      .select(`
        id,
        title,
        description,
        step_category,
        step_order,
        is_required,
        is_milestone,
        due_days_offset,
        estimated_hours,
        default_assignee_role,
        instructions,
        success_criteria,
        external_resources
      `)
      .eq('template_id', params.id)
      .order('step_order')

    if (stepsError) {
      console.error('Error fetching template steps:', stepsError)
      return NextResponse.json(
        { error: 'Failed to fetch template steps' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: steps || [],
      template: {
        id: template.id,
        name: template.name
      }
    })

  } catch (error) {
    console.error('Error in template steps fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}