"use client"

import { useState } from "react"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { NewOnboardingDialog } from "./new-onboarding-dialog"
import { CreateTemplateDialog } from "./create-template-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Plus,
  Building,
  Target,
  Pause,
  PlayCircle,
  XCircle,
  TrendingUp,
  Users,
  Eye,
  Settings
} from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"
import Link from "next/link"

interface OnboardingAccount {
  id: string
  name: string
  domain: string | null
  arr: number | null
  created_at: string
  onboarding_status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  onboarding_started_at: string | null
  onboarding_completed_at: string | null
  csm: {
    id: string
    full_name: string | null
    email: string
  } | null
  onboarding_plan: {
    id: string
    plan_name: string
    status: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    created_at: string
    started_at: string | null
    target_completion_date: string | null
    actual_completion_date: string | null
    total_steps: number
    completed_steps: number
    completion_percentage: number
    custom_notes: string | null
    template: {
      id: string
      name: string
      plan_type: 'starter' | 'standard' | 'enterprise' | 'custom'
    } | null
    owner: {
      id: string
      full_name: string | null
      email: string
    } | null
    steps: OnboardingStep[]
  }[] | null
}

interface OnboardingStep {
  id: string
  title: string
  description: string | null
  step_category: string
  step_order: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked'
  is_required: boolean
  is_milestone: boolean
  due_date: string | null
  estimated_hours: number | null
  completed_at: string | null
  started_at: string | null
  assignee: {
    id: string
    full_name: string | null
  } | null
}

interface OnboardingTemplate {
  id: string
  name: string
  description: string | null
  plan_type: 'starter' | 'standard' | 'enterprise' | 'custom'
  estimated_duration_days: number | null
  usage_count: number
}

interface OnboardingStats {
  totalAccounts: number
  inProgressCount: number
  completedCount: number
  onHoldCount: number
  notStartedCount: number
  overdueCount: number
  completionRate: number
}

interface OnboardingClientProps {
  accounts: OnboardingAccount[]
  stats: OnboardingStats | null
  templates: OnboardingTemplate[]
  availableAccounts?: Array<{ id: string; name: string }>
}

export function OnboardingClient({ accounts, stats, templates, availableAccounts = [] }: OnboardingClientProps) {
  const { formatCurrency, CurrencyIcon } = useCurrencyConfig()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showNewOnboardingDialog, setShowNewOnboardingDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [preselectedAccountId, setPreselectedAccountId] = useState<string | undefined>()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />
      case 'not_started':
        return <Clock className="h-4 w-4" />
      case 'on_hold':
        return <Pause className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (account: OnboardingAccount) => {
    if (account.onboarding_status === 'completed') return false
    const plan = account.onboarding_plan?.[0]
    if (!plan?.target_completion_date) return false
    return new Date(plan.target_completion_date) < new Date()
  }

  const getDaysUntilDue = (targetDate: string | null) => {
    if (!targetDate) return null
    return differenceInDays(new Date(targetDate), new Date())
  }

  const getOnTrackStatus = (account: OnboardingAccount) => {
    const plan = account.onboarding_plan?.[0]
    if (!plan) return { status: 'unknown', color: 'text-gray-600', label: 'No Plan' }
    
    if (account.onboarding_status === 'completed') {
      return { status: 'completed', color: 'text-green-600', label: 'Completed' }
    }
    
    if (isOverdue(account)) {
      return { status: 'overdue', color: 'text-red-600', label: 'Overdue' }
    }
    
    if (account.onboarding_status === 'on_hold') {
      return { status: 'on_hold', color: 'text-yellow-600', label: 'On Hold' }
    }
    
    const daysUntilDue = getDaysUntilDue(plan.target_completion_date)
    const completionPercentage = plan.completion_percentage || 0
    
    if (daysUntilDue !== null && daysUntilDue <= 7 && completionPercentage < 80) {
      return { status: 'at_risk', color: 'text-orange-600', label: 'At Risk' }
    }
    
    return { status: 'on_track', color: 'text-green-600', label: 'On Track' }
  }

  const handleCreateOnboardingPlan = async (data: {
    accountId: string
    templateId: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    targetDate: string
    customNotes: string
  }) => {
    try {
      const response = await fetch('/api/onboarding/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create onboarding plan')
      }

      // Success! Show confirmation and refresh page
      alert(`✅ Onboarding plan "${result.plan.planName}" created successfully with ${result.plan.stepsCount} steps!`)
      
      // Refresh the page to show the new plan
      window.location.reload()

    } catch (error) {
      console.error('Error creating onboarding plan:', error)
      alert(`❌ Failed to create onboarding plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCreateTemplate = async (data: {
    name: string
    description: string
    planType: 'starter' | 'standard' | 'enterprise' | 'custom'
    estimatedDuration: number
    steps: any[]
  }) => {
    try {
      const response = await fetch('/api/onboarding/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create template')
      }

      // Success! Show confirmation and refresh page
      alert(`✅ Template "${result.template.name}" created successfully with ${result.template.stepsCount} steps!`)
      
      // Refresh the page to show the new template
      window.location.reload()

    } catch (error) {
      console.error('Error creating template:', error)
      alert(`❌ Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleViewTemplateSteps = async (templateId: string) => {
    try {
      // TODO: Open a dialog or navigate to a page showing template steps
      console.log('View steps for template:', templateId)
      
      // For now, let's create a simple dialog showing template steps
      const response = await fetch(`/api/onboarding/templates/${templateId}/steps`)
      if (!response.ok) {
        throw new Error('Failed to fetch template steps')
      }
      
      const steps = await response.json()
      
      // Create a simple alert for now - can be replaced with proper dialog later
      const stepsList = steps.data?.map((step: any, index: number) => 
        `${index + 1}. ${step.title}${step.description ? ` - ${step.description}` : ''}`
      ).join('\n') || 'No steps found'
      
      alert(`Template Steps:\n\n${stepsList}`)
      
    } catch (error) {
      console.error('Error fetching template steps:', error)
      alert('Failed to load template steps')
    }
  }

  const handleEditTemplate = (templateId: string) => {
    try {
      // TODO: Navigate to template edit page or open edit dialog
      console.log('Edit template:', templateId)
      alert('Template editing functionality coming soon!')
      
    } catch (error) {
      console.error('Error editing template:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && stats.totalAccounts > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalAccounts}</p>
                  <p className="text-xs text-muted-foreground">Total Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgressCount}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No accounts in onboarding yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start tracking customer onboarding by creating an onboarding plan for your accounts.
              </p>
              <Button 
                onClick={() => setShowNewOnboardingDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start First Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Account Overview</TabsTrigger>
            <TabsTrigger value="templates">Plan Templates</TabsTrigger>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          </TabsList>
          <Button onClick={() => {
            setPreselectedAccountId(undefined)
            setShowNewOnboardingDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Start Onboarding
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Onboarding</h3>
                <p className="text-muted-foreground mb-4">
                  No accounts are currently in the onboarding process
                </p>
                <Button onClick={() => {
                  setPreselectedAccountId(undefined)
                  setShowNewOnboardingDialog(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start First Onboarding
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const plan = account.onboarding_plan?.[0]
                const onTrackStatus = getOnTrackStatus(account)
                const daysUntilDue = plan ? getDaysUntilDue(plan.target_completion_date) : null
                
                return (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">{account.name}</CardTitle>
                          </div>
                          <Badge className={getStatusColor(account.onboarding_status)} variant="outline">
                            {getStatusIcon(account.onboarding_status)}
                            <span className="ml-1 capitalize">{account.onboarding_status.replace('_', ' ')}</span>
                          </Badge>
                          {plan && (
                            <Badge className={getPriorityColor(plan.priority)} variant="outline">
                              {plan.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${onTrackStatus.color}`}>
                              {onTrackStatus.label}
                            </p>
                            {plan?.target_completion_date && (
                              <p className="text-xs text-muted-foreground">
                                {daysUntilDue !== null && daysUntilDue >= 0 
                                  ? `${daysUntilDue} days left`
                                  : `${Math.abs(daysUntilDue || 0)} days overdue`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {account.csm?.full_name || 'Unassigned'}
                            </p>
                            <p className="text-muted-foreground">Customer Success Manager</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CurrencyIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {formatCurrency(account.arr || 0)}
                            </p>
                            <p className="text-muted-foreground">Annual Recurring Revenue</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {plan?.target_completion_date 
                                ? format(parseISO(plan.target_completion_date), 'MMM dd, yyyy')
                                : 'No target date'
                              }
                            </p>
                            <p className="text-muted-foreground">Target Completion</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {plan ? `${plan.completed_steps} / ${plan.total_steps}` : '0 / 0'}
                            </p>
                            <p className="text-muted-foreground">Steps Complete</p>
                          </div>
                        </div>
                      </div>
                      
                      {plan && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Progress: {plan.plan_name}</span>
                              <span className="text-muted-foreground">{plan.completion_percentage}%</span>
                            </div>
                            <Progress value={plan.completion_percentage} className="h-2" />
                          </div>
                          
                          {plan.template && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Target className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Using {plan.template.name} ({plan.template.plan_type})
                              </span>
                            </div>
                          )}
                          
                          {plan.custom_notes && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> {plan.custom_notes}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {plan && (
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/dashboard/onboarding/${plan.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Plan Details
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // TODO: Implement plan management actions
                              console.log('Manage plan:', plan.id)
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Plan
                          </Button>
                        </div>
                      )}
                      
                      {!plan && account.onboarding_status === 'not_started' && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            Onboarding not yet started for this account
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setPreselectedAccountId(account.id)
                              setShowNewOnboardingDialog(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Start Onboarding Plan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Onboarding Plan Templates</h3>
              <p className="text-sm text-muted-foreground">
                Reusable onboarding workflows for different customer types
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowCreateTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first onboarding template to standardize customer success workflows
                </p>
                <Button onClick={() => setShowCreateTemplateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className={
                        template.plan_type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        template.plan_type === 'standard' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {template.plan_type}
                      </Badge>
                    </div>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {template.estimated_duration_days || 'Custom'} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Usage:</span>
                        <span className="font-medium">{template.usage_count} times</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewTemplateSteps(template.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Steps
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Template Management Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Target className="h-4 w-4 mr-2 text-blue-600" />
                Template Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Templates</strong> define reusable onboarding workflows with predefined steps.</p>
                <p><strong>Usage:</strong> When you start onboarding for an account, select a template to copy its steps to a new onboarding plan.</p>
                <p><strong>Customization:</strong> Each onboarding plan can be customized after creation without affecting the template.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest onboarding activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // Generate timeline activities from real data
                const activities: Array<{
                  id: string
                  type: 'plan_created' | 'plan_started' | 'plan_completed' | 'step_completed' | 'onboarding_started' | 'onboarding_completed'
                  title: string
                  description: string
                  timestamp: string
                  accountName: string
                  icon: React.ComponentType<any>
                  color: string
                }> = []

                accounts.forEach(account => {
                  // Add onboarding start activity
                  if (account.onboarding_started_at) {
                    activities.push({
                      id: `${account.id}_started`,
                      type: 'onboarding_started',
                      title: 'Onboarding Started',
                      description: `${account.name} began onboarding process`,
                      timestamp: account.onboarding_started_at,
                      accountName: account.name,
                      icon: PlayCircle,
                      color: 'text-blue-600'
                    })
                  }

                  // Add onboarding completion activity
                  if (account.onboarding_completed_at) {
                    activities.push({
                      id: `${account.id}_completed`,
                      type: 'onboarding_completed',
                      title: 'Onboarding Completed',
                      description: `${account.name} successfully completed onboarding`,
                      timestamp: account.onboarding_completed_at,
                      accountName: account.name,
                      icon: CheckCircle2,
                      color: 'text-green-600'
                    })
                  }

                  // Add onboarding plan activities
                  account.onboarding_plan?.forEach(plan => {
                    // Plan created
                    activities.push({
                      id: `${plan.id}_created`,
                      type: 'plan_created',
                      title: 'Plan Created',
                      description: `"${plan.plan_name}" plan created for ${account.name}`,
                      timestamp: plan.created_at,
                      accountName: account.name,
                      icon: Calendar,
                      color: 'text-purple-600'
                    })

                    // Plan started
                    if (plan.started_at) {
                      activities.push({
                        id: `${plan.id}_started`,
                        type: 'plan_started',
                        title: 'Plan Started',
                        description: `"${plan.plan_name}" execution began`,
                        timestamp: plan.started_at,
                        accountName: account.name,
                        icon: PlayCircle,
                        color: 'text-blue-600'
                      })
                    }

                    // Plan completed
                    if (plan.actual_completion_date) {
                      activities.push({
                        id: `${plan.id}_plan_completed`,
                        type: 'plan_completed',
                        title: 'Plan Completed',
                        description: `"${plan.plan_name}" completed successfully`,
                        timestamp: plan.actual_completion_date,
                        accountName: account.name,
                        icon: CheckCircle2,
                        color: 'text-green-600'
                      })
                    }

                    // Add recent completed steps
                    plan.steps?.filter(step => step.completed_at).slice(0, 5).forEach(step => {
                      activities.push({
                        id: `${step.id}_step_completed`,
                        type: 'step_completed',
                        title: 'Step Completed',
                        description: `"${step.title}" completed for ${account.name}`,
                        timestamp: step.completed_at!,
                        accountName: account.name,
                        icon: CheckCircle2,
                        color: 'text-green-600'
                      })
                    })
                  })
                })

                // Sort activities by timestamp (most recent first) and limit to 10
                const sortedActivities = activities
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 10)

                if (sortedActivities.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activities yet</p>
                      <p className="text-sm">Activities will appear here as onboarding progresses</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {sortedActivities.map((activity) => {
                      const Icon = activity.icon
                      return (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                          <Icon className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Building className="h-3 w-3 inline mr-1" />
                              {activity.accountName}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {sortedActivities.length === 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        Showing 10 most recent activities
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <NewOnboardingDialog
        open={showNewOnboardingDialog}
        onOpenChange={setShowNewOnboardingDialog}
        accounts={availableAccounts}
        templates={templates}
        preselectedAccountId={preselectedAccountId}
        onSubmit={handleCreateOnboardingPlan}
      />
      
      <CreateTemplateDialog
        open={showCreateTemplateDialog}
        onOpenChange={setShowCreateTemplateDialog}
        onSubmit={handleCreateTemplate}
      />
    </div>
  )
}