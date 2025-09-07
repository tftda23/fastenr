import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, templateId, priority, targetDate, customNotes } = body

    // Validate required fields
    if (!accountId || !templateId) {
      return NextResponse.json(
        { error: 'Account ID and Template ID are required' },
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

    // Verify the account belongs to the user's organization
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', accountId)
      .eq('organization_id', organization.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      )
    }

    // Verify the template belongs to the user's organization
    const { data: template, error: templateError } = await supabase
      .from('onboarding_plan_templates')
      .select('id, name, plan_type, estimated_duration_days')
      .eq('id', templateId)
      .eq('organization_id', organization.id)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      )
    }

    // Get template steps to copy
    const { data: templateSteps, error: stepsError } = await supabase
      .from('onboarding_template_steps')
      .select('*')
      .eq('template_id', templateId)
      .order('step_order')

    if (stepsError) {
      console.error('Error fetching template steps:', stepsError)
      return NextResponse.json(
        { error: 'Failed to fetch template steps' },
        { status: 500 }
      )
    }

    // Calculate target completion date if not provided
    let finalTargetDate = targetDate
    if (!finalTargetDate && template.estimated_duration_days) {
      const targetDateObj = new Date()
      targetDateObj.setDate(targetDateObj.getDate() + template.estimated_duration_days)
      finalTargetDate = targetDateObj.toISOString().split('T')[0]
    }

    // Start transaction to create plan and steps
    const { data: plan, error: planError } = await supabase
      .from('onboarding_plans')
      .insert({
        organization_id: organization.id,
        account_id: accountId,
        template_id: templateId,
        plan_name: `${account.name} - ${template.name}`,
        status: 'not_started',
        priority: priority || 'medium',
        target_completion_date: finalTargetDate ? new Date(finalTargetDate).toISOString() : null,
        csm_id: user.id,
        created_by: user.id,
        total_steps: templateSteps?.length || 0,
        completed_steps: 0,
        completion_percentage: 0,
        custom_notes: customNotes || null,
        is_custom_plan: false
      })
      .select()
      .single()

    if (planError) {
      console.error('Error creating onboarding plan:', planError)
      return NextResponse.json(
        { error: 'Failed to create onboarding plan' },
        { status: 500 }
      )
    }

    // Create onboarding steps from template steps
    if (templateSteps && templateSteps.length > 0) {
      const planSteps = templateSteps.map(step => ({
        plan_id: plan.id,
        template_step_id: step.id,
        title: step.title,
        description: step.description,
        step_category: step.step_category,
        step_order: step.step_order,
        is_required: step.is_required,
        is_milestone: step.is_milestone,
        status: 'pending',
        due_date: finalTargetDate && step.due_days_offset !== null 
          ? new Date(new Date(finalTargetDate).getTime() - (template.estimated_duration_days! - step.due_days_offset) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        estimated_hours: step.estimated_hours,
        assignee_id: step.default_assignee_role === 'csm' ? user.id : null,
        instructions: step.instructions,
        success_criteria: step.success_criteria,
        external_resources: step.external_resources || []
      }))

      const { error: stepsInsertError } = await supabase
        .from('onboarding_steps')
        .insert(planSteps)

      if (stepsInsertError) {
        console.error('Error creating onboarding steps:', stepsInsertError)
        // Try to clean up the plan if steps creation failed
        await supabase
          .from('onboarding_plans')
          .delete()
          .eq('id', plan.id)
        
        return NextResponse.json(
          { error: 'Failed to create onboarding steps' },
          { status: 500 }
        )
      }
    }

    // Update account onboarding status and plan reference
    const { error: accountUpdateError } = await supabase
      .from('accounts')
      .update({
        onboarding_status: 'not_started',
        onboarding_plan_id: plan.id,
        csm_id: user.id
      })
      .eq('id', accountId)

    if (accountUpdateError) {
      console.error('Error updating account:', accountUpdateError)
      // Continue anyway - the plan was created successfully
    }

    // Create activity log entry
    await supabase
      .from('onboarding_activities')
      .insert({
        plan_id: plan.id,
        activity_type: 'plan_created',
        performed_by: user.id,
        title: 'Onboarding Plan Created',
        description: `${template.name} onboarding plan created for ${account.name}`,
        comment_text: customNotes ? `Custom notes: ${customNotes}` : null
      })

    // Increment template usage count
    await supabase
      .from('onboarding_plan_templates')
      .update({
        usage_count: (template as any).usage_count + 1
      })
      .eq('id', templateId)

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        planName: plan.plan_name,
        status: plan.status,
        stepsCount: templateSteps?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in onboarding plan creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}