import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { OnboardingPlanClient } from '@/components/onboarding/onboarding-plan-client'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

async function getOnboardingPlanData(planId: string) {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    redirect("/auth/login")
  }

  const supabase = createClient()
  
  try {
    // Get the onboarding plan with all related data
    const { data: plan, error: planError } = await supabase
      .from('onboarding_plans')
      .select(`
        *,
        account:accounts(id, name, domain, arr, created_at),
        template:onboarding_plan_templates(id, name, plan_type, description),
        csm:user_profiles!onboarding_plans_csm_id_fkey(id, full_name, email)
      `)
      .eq('id', planId)
      .eq('organization_id', organization.id)
      .single()

    if (planError || !plan) {
      console.error('Plan not found:', planError)
      return null
    }

    // Get all steps for this plan
    const { data: steps, error: stepsError } = await supabase
      .from('onboarding_steps')
      .select(`
        *,
        assignee:user_profiles!onboarding_steps_assignee_id_fkey(id, full_name, email),
        completed_by_user:user_profiles!onboarding_steps_completed_by_fkey(id, full_name, email)
      `)
      .eq('plan_id', planId)
      .order('step_order')

    if (stepsError) {
      console.error('Error fetching steps:', stepsError)
    }

    // Get recent activities for this plan
    const { data: activities, error: activitiesError } = await supabase
      .from('onboarding_activities')
      .select(`
        *,
        performer:user_profiles!onboarding_activities_performed_by_fkey(id, full_name, email),
        step:onboarding_steps(id, title)
      `)
      .eq('plan_id', planId)
      .order('performed_at', { ascending: false })
      .limit(20)

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
    }

    // Get all users in the organization for assignment purposes
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role')
      .eq('organization_id', organization.id)
      .order('full_name')

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    return {
      plan,
      steps: steps || [],
      activities: activities || [],
      users: users || [],
      currentUser: user
    }

  } catch (error) {
    console.error('Error in getOnboardingPlanData:', error)
    return null
  }
}

export default async function OnboardingPlanDetailPage({ params }: PageProps) {
  const data = await getOnboardingPlanData(params.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/onboarding">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Onboarding
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{data.plan.plan_name}</h1>
            <p className="text-muted-foreground">
              {data.plan.account?.name} • {data.plan.template?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Management */}
      <Suspense 
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading onboarding plan...</span>
              </div>
            </CardContent>
          </Card>
        }
      >
        <OnboardingPlanClient 
          plan={data.plan}
          steps={data.steps}
          activities={data.activities}
          users={data.users}
          currentUser={{
            ...data.currentUser,
            email: data.currentUser.email || ''
          }}
        />
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const data = await getOnboardingPlanData(params.id)
  
  if (!data) {
    return {
      title: 'Plan Not Found'
    }
  }

  return {
    title: `${data.plan.plan_name} - Onboarding Plan`,
    description: `Onboarding plan for ${data.plan.account?.name}`
  }
}