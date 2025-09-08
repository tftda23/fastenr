"use client"

import { useState } from "react"
import { useCurrencyConfig } from '@/lib/hooks/use-currency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  PlayCircle,
  Pause,
  RotateCcw,
  MessageSquare,
  Mail,
  Phone,
  Video,
  FileText,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { format, parseISO, differenceInDays } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OnboardingPlan {
  id: string
  plan_name: string
  status: string
  priority: string
  created_at: string
  started_at: string | null
  target_completion_date: string | null
  actual_completion_date: string | null
  total_steps: number
  completed_steps: number
  completion_percentage: number
  custom_notes: string | null
  account: {
    id: string
    name: string
    domain: string | null
    arr: number | null
    created_at: string
  } | null
  template: {
    id: string
    name: string
    plan_type: string
    description: string | null
  } | null
  csm: {
    id: string
    full_name: string | null
    email: string
  } | null
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
  actual_hours: number | null
  completed_at: string | null
  started_at: string | null
  instructions: string | null
  success_criteria: string | null
  completion_notes: string | null
  external_resources: string[] | null
  assignee: {
    id: string
    full_name: string | null
    email: string
  } | null
  completed_by_user: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface OnboardingActivity {
  id: string
  activity_type: string
  title: string
  description: string | null
  comment_text: string | null
  performed_at: string
  is_customer_facing: boolean
  performer: {
    id: string
    full_name: string | null
    email: string
  } | null
  step: {
    id: string
    title: string
  } | null
}

interface User {
  id: string
  full_name: string | null
  email: string
  role: string
}

interface OnboardingPlanClientProps {
  plan: OnboardingPlan
  steps: OnboardingStep[]
  activities: OnboardingActivity[]
  users: User[]
  currentUser: { id: string; email: string }
}

export function OnboardingPlanClient({ 
  plan, 
  steps, 
  activities, 
  users, 
  currentUser 
}: OnboardingPlanClientProps) {
  const { formatCurrency } = useCurrencyConfig()
  const [selectedTab, setSelectedTab] = useState('steps')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'blocked':
        return <AlertTriangle className="h-4 w-4" />
      case 'skipped':
        return <RotateCcw className="h-4 w-4" />
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'kickoff': return 'bg-purple-100 text-purple-800'
      case 'technical': return 'bg-blue-100 text-blue-800'
      case 'training': return 'bg-green-100 text-green-800'
      case 'configuration': return 'bg-yellow-100 text-yellow-800'
      case 'testing': return 'bg-orange-100 text-orange-800'
      case 'deployment': return 'bg-red-100 text-red-800'
      case 'support': return 'bg-teal-100 text-teal-800'
      case 'administrative': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null
    return differenceInDays(new Date(dueDate), new Date())
  }

  const handleStepAction = async (stepId: string, action: string) => {
    try {
      const step = steps.find(s => s.id === stepId)
      if (!step) {
        console.error('Step not found:', stepId)
        return
      }

      console.log(`${action} step:`, stepId)

      switch (action) {
        case 'start':
          await updateStepStatus(stepId, 'in_progress')
          break
        case 'complete':
          await updateStepStatus(stepId, 'completed')
          break
        case 'block':
          await updateStepStatus(stepId, 'blocked')
          break
        case 'edit':
          await editStep(step)
          break
        case 'resources':
          showResourcesDialog(step)
          break
        default:
          alert(`${action} step functionality not yet implemented`)
      }
    } catch (error) {
      console.error(`Error ${action} step:`, error)
    }
  }

  const updateStepStatus = async (stepId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/onboarding/steps/${stepId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update step status`)
      }

      // Log activity
      const step = steps.find(s => s.id === stepId)
      if (step) {
        await fetch(`/api/onboarding/plans/${plan.id}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activity_type: 'step_status_changed',
            title: `Step ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            description: `Step "${step.title}" marked as ${newStatus}`,
            step_id: stepId
          }),
        })
      }

      alert(`Step marked as ${newStatus}`)
      window.location.reload()
    } catch (error) {
      console.error('Error updating step status:', error)
      alert('Failed to update step status')
    }
  }

  const editStep = async (step: any) => {
    try {
      const newTitle = prompt('Edit step title:', step.title)
      if (newTitle === null) return // User cancelled
      
      const newDescription = prompt('Edit step description:', step.description || '')
      if (newDescription === null) return // User cancelled

      const response = await fetch(`/api/onboarding/steps/${step.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription?.trim() || null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update step')
      }

      // Log activity
      await fetch(`/api/onboarding/plans/${plan.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: 'step_updated',
          title: 'Step Updated',
          description: `Step "${step.title}" has been updated`,
          step_id: step.id
        }),
      })

      alert('Step updated successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error updating step:', error)
      alert('Failed to update step')
    }
  }

  const showResourcesDialog = (step: any) => {
    const resources = step.external_resources || []
    const resourcesList = resources.length > 0 
      ? resources.map((resource: any, index: number) => 
          `${index + 1}. ${resource.title || resource.url || resource}`
        ).join('\n')
      : 'No resources available'
    
    alert(`External Resources for "${step.title}":\n\n${resourcesList}`)
  }

  const handleCreateEngagement = async (stepId: string, type: string) => {
    try {
      const step = steps.find(s => s.id === stepId)
      if (!step) {
        console.error('Step not found:', stepId)
        return
      }

      // Find account contacts for this engagement
      const accountId = plan.account

      // Create engagement data based on type
      const engagementData = {
        account_id: accountId,
        type: type as 'email' | 'call' | 'meeting' | 'note',
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${step.title}`,
        description: `Onboarding step: ${step.description || step.title}\n\nPlan: ${plan.plan_name}\nStep ID: ${stepId}`,
        outcome: null,
        scheduled_at: type !== 'note' ? new Date().toISOString() : null,
        completed_at: type === 'note' ? new Date().toISOString() : null
      }

      console.log(`Creating ${type} engagement for step:`, stepId, engagementData)

      const response = await fetch('/api/engagements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(engagementData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create ${type} engagement`)
      }

      const result = await response.json()
      console.log('Engagement created:', result)

      // Create activity log entry
      await fetch(`/api/onboarding/plans/${plan.id}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: 'engagement_created',
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Engagement Created`,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} engagement created for step: ${step.title}`,
          step_id: stepId,
          comment_text: `Engagement ID: ${result.data?.id}`
        }),
      })

      // Show success message
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} engagement created successfully!`)
      
      // Refresh the page to show the new activity
      window.location.reload()

    } catch (error) {
      console.error(`Error creating ${type} engagement:`, error)
      alert(`Failed to create ${type} engagement. Please try again.`)
    }
  }

  // Group steps by category for better organization
  const stepsByCategory = steps.reduce((acc, step) => {
    const category = step.step_category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(step)
    return acc
  }, {} as Record<string, OnboardingStep[]>)

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
              <Badge className={getStatusColor(plan.status)} variant="outline">
                {getStatusIcon(plan.status)}
                <span className="ml-1 capitalize">{plan.status.replace('_', ' ')}</span>
              </Badge>
              <Badge className={getPriorityColor(plan.priority)} variant="outline">
                {plan.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
          {plan.custom_notes && (
            <CardDescription className="mt-2">
              <strong>Notes:</strong> {plan.custom_notes}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{plan.completion_percentage}%</span>
            </div>
            <Progress value={plan.completion_percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{plan.completed_steps} of {plan.total_steps} steps completed</span>
              <span>{plan.total_steps - plan.completed_steps} remaining</span>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Customer Success Manager</p>
              <p className="font-medium">{plan.csm?.full_name || 'Unassigned'}</p>
              <p className="text-muted-foreground">{plan.csm?.email}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Account Value</p>
              <p className="font-medium">{formatCurrency(plan.account?.arr || 0)}</p>
              <p className="text-muted-foreground">Annual Recurring Revenue</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Target Completion</p>
              <p className="font-medium">
                {plan.target_completion_date 
                  ? format(parseISO(plan.target_completion_date), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </p>
              {plan.target_completion_date && (
                <p className="text-muted-foreground">
                  {getDaysUntilDue(plan.target_completion_date)} days remaining
                </p>
              )}
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Template Used</p>
              <p className="font-medium">{plan.template?.name || 'Custom'}</p>
              <p className="text-muted-foreground capitalize">{plan.template?.plan_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="steps">Steps & Timeline</TabsTrigger>
          <TabsTrigger value="activities">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Plan Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-6">
          {/* Steps by Category */}
          {Object.entries(stepsByCategory).map(([category, categorySteps]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Badge className={`${getCategoryColor(category)} mr-2`} variant="outline">
                    {category}
                  </Badge>
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({categorySteps.length} steps)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySteps.map((step) => {
                  const daysUntilDue = getDaysUntilDue(step.due_date)
                  
                  return (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                              {step.step_order}
                            </span>
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge className={getStatusColor(step.status)} variant="outline">
                              {getStatusIcon(step.status)}
                              <span className="ml-1 capitalize">{step.status.replace('_', ' ')}</span>
                            </Badge>
                            {step.is_milestone && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                Milestone
                              </Badge>
                            )}
                            {step.due_date && isOverdue(step.due_date) && step.status !== 'completed' && (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          
                          {step.description && (
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="font-medium">Assigned to:</span>
                              <p>{step.assignee?.full_name || 'Unassigned'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Due date:</span>
                              <p>{step.due_date ? format(parseISO(step.due_date), 'MMM dd, yyyy') : 'Not set'}</p>
                              {daysUntilDue !== null && (
                                <p className="text-muted-foreground">
                                  {daysUntilDue >= 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Estimated:</span>
                              <p>{step.estimated_hours || 0}h</p>
                              {step.actual_hours && (
                                <p className="text-muted-foreground">Actual: {step.actual_hours}h</p>
                              )}
                            </div>
                          </div>

                          {step.instructions && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Instructions:</strong> {step.instructions}
                              </p>
                            </div>
                          )}
                          
                          {step.completion_notes && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">
                                <strong>Completion Notes:</strong> {step.completion_notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Engagement Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Engage
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Create Engagement</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleCreateEngagement(step.id, 'email')}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateEngagement(step.id, 'call')}>
                                <Phone className="h-4 w-4 mr-2" />
                                Schedule Call
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateEngagement(step.id, 'meeting')}>
                                <Video className="h-4 w-4 mr-2" />
                                Book Meeting
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCreateEngagement(step.id, 'note')}>
                                <FileText className="h-4 w-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Step Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Step Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {step.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleStepAction(step.id, 'start')}>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Start Step
                                </DropdownMenuItem>
                              )}
                              {step.status === 'in_progress' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStepAction(step.id, 'complete')}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStepAction(step.id, 'block')}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Mark Blocked
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleStepAction(step.id, 'edit')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Step
                              </DropdownMenuItem>
                              {step.external_resources && step.external_resources.length > 0 && (
                                <DropdownMenuItem onClick={() => handleStepAction(step.id, 'resources')}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Resources
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Complete history of actions and updates for this onboarding plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>No activities recorded yet</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(activity.performed_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      )}
                      {activity.comment_text && (
                        <p className="text-sm italic">"{activity.comment_text}"</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>By: {activity.performer?.full_name || 'System'}</span>
                        {activity.step && (
                          <span>Step: {activity.step.title}</span>
                        )}
                        {activity.is_customer_facing && (
                          <Badge variant="outline">Customer Facing</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Settings</CardTitle>
              <CardDescription>
                Configure plan details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Plan settings configuration coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}