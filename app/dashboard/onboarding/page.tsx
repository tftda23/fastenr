import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingClient } from '@/components/onboarding/onboarding-client-new'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import FeatureGate from '@/components/feature-gate'
import { redirect } from 'next/navigation'

async function getOnboardingData() {
  const supabase = createClient()
  
  try {
    // Get accounts in onboarding state OR those with onboarding plans
    const { data: accountsWithOnboarding, error: accountsError } = await supabase
      .from('accounts')
      .select(`
        id, name, domain, arr, created_at, status,
        onboarding_status, 
        onboarding_started_at,
        onboarding_completed_at,
        csm_id,
        onboarding_plan_id
      `)
      .or('status.eq.onboarding,onboarding_plan_id.not.is.null')
      .order('onboarding_started_at', { ascending: false })

    if (accountsError) {
      console.error('Error fetching accounts with onboarding:', accountsError)
      return { accounts: [], stats: null, templates: [] }
    }

    // Get CSM details for accounts
    const csmIds = accountsWithOnboarding?.map(a => a.csm_id).filter(Boolean) || []
    const { data: csmUsers } = csmIds.length > 0 ? await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .in('id', csmIds) : { data: [] }

    // Get onboarding plans for these accounts
    const planIds = accountsWithOnboarding?.map(a => a.onboarding_plan_id).filter(Boolean) || []
    const { data: plans } = planIds.length > 0 ? await supabase
      .from('onboarding_plans')
      .select(`
        id, account_id, plan_name, status, priority, created_at, started_at,
        target_completion_date, actual_completion_date, 
        total_steps, completed_steps, completion_percentage, custom_notes,
        template_id, csm_id
      `)
      .in('id', planIds) : { data: [] }

    // Get plan templates
    const templateIds = plans?.map(p => p.template_id).filter(Boolean) || []
    const { data: planTemplates } = templateIds.length > 0 ? await supabase
      .from('onboarding_plan_templates')
      .select('id, name, plan_type')
      .in('id', templateIds) : { data: [] }

    // Get onboarding plan templates for the "new process" dialog
    const { data: templates, error: templatesError } = await supabase
      .from('onboarding_plan_templates')
      .select('id, name, description, plan_type, estimated_duration_days, usage_count')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
    }

    // Combine all the data
    const enrichedAccounts = accountsWithOnboarding?.map(account => {
      const csm = csmUsers?.find(u => u.id === account.csm_id) || null
      const plan = plans?.find(p => p.account_id === account.id) || null
      const template = plan ? planTemplates?.find(t => t.id === plan.template_id) : null

      return {
        ...account,
        csm,
        onboarding_plan: plan ? [{
          ...plan,
          template,
          owner: csmUsers?.find(u => u.id === plan.csm_id) || null,
          steps: [] // We'll add steps later if needed
        }] : null
      }
    }) || []

    // Calculate summary stats
    const totalAccounts = enrichedAccounts.length
    const inProgressCount = enrichedAccounts.filter(a => a.onboarding_status === 'in_progress').length
    const completedCount = enrichedAccounts.filter(a => a.onboarding_status === 'completed').length
    const onHoldCount = enrichedAccounts.filter(a => a.onboarding_status === 'on_hold').length
    const notStartedCount = enrichedAccounts.filter(a => a.onboarding_status === 'not_started').length
    
    // Calculate overdue accounts (those with target dates in the past and not completed)
    const overdueCount = enrichedAccounts.filter(a => {
      if (a.onboarding_status === 'completed') return false
      const plan = a.onboarding_plan?.[0]
      if (!plan?.target_completion_date) return false
      return new Date(plan.target_completion_date) < new Date()
    }).length

    const stats = {
      totalAccounts,
      inProgressCount,
      completedCount,
      onHoldCount,
      notStartedCount,
      overdueCount,
      completionRate: totalAccounts > 0 ? Math.round((completedCount / totalAccounts) * 100) : 0
    }

    // Only log if there are issues
    if (!templates || templates.length === 0) {
      console.warn('No onboarding templates found for organization')
    }

    return {
      accounts: enrichedAccounts,
      stats,
      templates: templates || []
    }

  } catch (error) {
    console.error('Error in getOnboardingData:', error)
    return { accounts: [], stats: null, templates: [] }
  }
}

export default async function OnboardingPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer onboarding processes with detailed checklists and timelines.
        </p>
      </div>

      <FeatureGate organizationId={organization.id} feature="onboarding_management">
        <Suspense 
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Fetching onboarding processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <OnboardingDataWrapper />
        </Suspense>
      </FeatureGate>
    </div>
  )
}

async function OnboardingDataWrapper() {
  const data = await getOnboardingData()
  
  // Get all accounts for the new process dialog (including those without onboarding)
  const supabase = createClient()
  const { data: allAccounts } = await supabase
    .from('accounts')
    .select('id, name')
    .order('name')
    .limit(50)
  
  return (
    <OnboardingClient 
      accounts={data.accounts as any}
      stats={data.stats}
      templates={data.templates}
      availableAccounts={allAccounts || []}
    />
  )
}