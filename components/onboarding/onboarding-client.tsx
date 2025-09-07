"use client"

import { useState } from "react"
import { NewProcessDialog } from "./new-process-dialog"
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
  Target
} from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"

interface OnboardingProcess {
  id: string
  account_id: string
  status: 'planning' | 'active' | 'completed' | 'on_hold'
  created_at: string
  target_completion_date: string | null
  actual_completion_date: string | null
  account: {
    id: string
    name: string
    domain: string
  } | null
  owner: {
    id: string
    full_name: string | null
    email: string
  } | null
  checklist_items: ChecklistItem[]
}

interface ChecklistItem {
  id: string
  title: string
  description: string | null
  due_date: string | null
  completed_at: string | null
  assignee: {
    id: string
    full_name: string | null
  } | null
  order_index: number
  is_required: boolean
  category: string | null
}

interface OnboardingStats {
  totalProcesses: number
  activeProcesses: number
  completedProcesses: number
  overdueProcesses: number
  completionRate: number
}

interface OnboardingClientProps {
  processes: OnboardingProcess[]
  stats: OnboardingStats | null
  availableAccounts?: Array<{ id: string; name: string }>
}

export function OnboardingClient({ processes, stats, availableAccounts = [] }: OnboardingClientProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showNewProcessDialog, setShowNewProcessDialog] = useState(false)
  
  // Extract unique accounts from processes, fallback to availableAccounts
  const processAccounts = processes.reduce((acc, process) => {
    if (process.account && !acc.find(a => a.id === process.account!.id)) {
      acc.push({
        id: process.account.id,
        name: process.account.name
      })
    }
    return acc
  }, [] as Array<{ id: string; name: string }>)
  
  const accounts = processAccounts.length > 0 ? processAccounts : availableAccounts

  const handleCreateProcess = async (data: {
    name: string
    description: string
    accountId: string
    processType: 'onboarding' | 'offboarding'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    targetDate: string
  }) => {
    try {
      console.log('Creating new process:', data)
      // TODO: Implement API call to create process
      // For now, just log the data
    } catch (error) {
      console.error('Error creating process:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'planning':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'active':
        return <Clock className="h-4 w-4" />
      case 'planning':
        return <Target className="h-4 w-4" />
      case 'on_hold':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (process: OnboardingProcess) => {
    if (process.status === 'completed' || !process.target_completion_date) return false
    return new Date(process.target_completion_date) < new Date()
  }

  const getDaysUntilDue = (targetDate: string | null) => {
    if (!targetDate) return null
    return differenceInDays(new Date(targetDate), new Date())
  }

  const calculateProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0
    const completedItems = items.filter(item => item.completed_at).length
    return Math.round((completedItems / items.length) * 100)
  }

  const getOnTrackStatus = (process: OnboardingProcess) => {
    const progress = calculateProgress(process.checklist_items)
    const daysUntilDue = getDaysUntilDue(process.target_completion_date)
    
    if (process.status === 'completed') {
      return { status: 'completed', color: 'text-green-600', label: 'Completed' }
    }
    
    if (isOverdue(process)) {
      return { status: 'overdue', color: 'text-red-600', label: 'Overdue' }
    }
    
    if (daysUntilDue !== null && daysUntilDue <= 3 && progress < 80) {
      return { status: 'at_risk', color: 'text-orange-600', label: 'At Risk' }
    }
    
    return { status: 'on_track', color: 'text-green-600', label: 'On Track' }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProcesses}</p>
                  <p className="text-xs text-muted-foreground">Total Processes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeProcesses}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.completedProcesses}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueProcesses}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
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
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>
          <Button onClick={() => setShowNewProcessDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Process
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {processes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Onboarding Processes</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first onboarding process
                </p>
                <Button onClick={() => setShowNewProcessDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Process
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {processes.map((process) => {
                const progress = calculateProgress(process.checklist_items)
                const onTrackStatus = getOnTrackStatus(process)
                const daysUntilDue = getDaysUntilDue(process.target_completion_date)
                
                return (
                  <Card key={process.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {process.account?.name || 'Unknown Account'}
                            </CardTitle>
                          </div>
                          <Badge className={getStatusColor(process.status)} variant="outline">
                            {getStatusIcon(process.status)}
                            <span className="ml-1 capitalize">{process.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${onTrackStatus.color}`}>
                              {onTrackStatus.label}
                            </p>
                            {process.target_completion_date && (
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {process.owner?.full_name || 'Unassigned'}
                            </p>
                            <p className="text-muted-foreground">Process Owner</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {process.target_completion_date 
                                ? format(parseISO(process.target_completion_date), 'MMM dd, yyyy')
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
                              {process.checklist_items.filter(i => i.completed_at).length} / {process.checklist_items.length}
                            </p>
                            <p className="text-muted-foreground">Tasks Complete</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {process.checklist_items.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Tasks</p>
                          <div className="space-y-1">
                            {process.checklist_items
                              .slice(0, 3)
                              .map((item) => (
                                <div key={item.id} className="flex items-center space-x-2 text-sm">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    item.completed_at 
                                      ? 'bg-green-100 text-green-600' 
                                      : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {item.completed_at && <CheckCircle2 className="h-3 w-3" />}
                                  </div>
                                  <span className={item.completed_at ? 'line-through text-muted-foreground' : ''}>
                                    {item.title}
                                  </span>
                                  {item.due_date && !item.completed_at && (
                                    <Badge variant="outline" className="text-xs">
                                      Due {format(parseISO(item.due_date), 'MMM dd')}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            {process.checklist_items.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{process.checklist_items.length - 3} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
              <CardDescription>
                Visual timeline of all onboarding processes and their milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Timeline view coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <NewProcessDialog
        open={showNewProcessDialog}
        onOpenChange={setShowNewProcessDialog}
        accounts={accounts}
        onSubmit={handleCreateProcess}
      />
    </div>
  )
}