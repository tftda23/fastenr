"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Clock, Users, BarChart3, MoreHorizontal, Eye, TrendingUp, Target, Zap } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CreateSurveyDialog from "./create-survey-dialog"
import SurveyDetailsDialog from "./survey-details-dialog"
import SendSurveyDialog from "./send-survey-dialog"
import type { Account } from "@/lib/types"

interface Survey {
  id: string
  title: string
  subject: string
  content: string
  status: string
  created_at: string
  logo_url?: string
  links?: any[]
  account_id?: string
  created_by?: string
  response_count?: number
  sent_count?: number
}

interface SurveysClientProps {
  surveys: Survey[]
  accounts: Pick<Account, "id" | "name">[]
  currentUserId: string
  organizationId: string
}

export default function SurveysClient({
  surveys,
  accounts,
  currentUserId,
  organizationId,
}: SurveysClientProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showPreview, setShowPreview] = useState(false)

  // Filter surveys based on active tab
  const filteredSurveys = surveys.filter(survey => {
    if (activeTab === "mine") {
      return survey.created_by === currentUserId
    }
    return true
  })

  // Calculate insights
  const totalSurveys = surveys.length
  const activeSurveys = surveys.filter(s => s.status === "active").length
  const totalResponses = surveys.reduce((acc, s) => acc + (s.response_count || 0), 0)
  const avgResponseRate = surveys.length > 0 
    ? ((totalResponses / surveys.reduce((acc, s) => acc + (s.sent_count || 1), 0)) * 100).toFixed(1)
    : "0"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleViewSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setShowDetailsDialog(true)
  }

  const handleEditSurvey = (survey: Survey) => {
    // TODO: Implement edit functionality
    // Edit survey functionality
  }

  const handleDeleteSurvey = (surveyId: string) => {
    // TODO: Implement delete functionality
    // Delete survey functionality
  }

  const handleSendSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setShowSendDialog(true)
  }

  const handlePreviewSurvey = (survey: Survey) => {
    // Open preview in new tab
    window.open(`/survey/${survey.id}/preview`, '_blank')
  }

  const getSurveyInsights = () => {
    const insights = []
    
    // Most responded survey
    if (surveys.length > 0) {
      const mostResponded = surveys.reduce((prev, current) => 
        (current.response_count || 0) > (prev.response_count || 0) ? current : prev
      )
      if (mostResponded.response_count && mostResponded.response_count > 0) {
        insights.push({
          title: "Top Performer",
          description: `"${mostResponded.title}" has the highest response rate`,
          value: `${mostResponded.response_count} responses`,
          type: "success"
        })
      }
    }
    
    // Response rate analysis
    if (parseFloat(avgResponseRate) < 30 && surveys.length > 0) {
      insights.push({
        title: "Low Response Rate",
        description: "Consider improving survey timing or incentives",
        value: `${avgResponseRate}% avg response`,
        type: "warning"
      })
    }
    
    // Active surveys count
    if (activeSurveys === 0 && surveys.length > 0) {
      insights.push({
        title: "No Active Surveys",
        description: "Consider launching surveys to gather fresh feedback",
        value: "Action needed",
        type: "info"
      })
    }
    
    return insights
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Stats Overview */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-4 w-4" />
              <span>{totalSurveys} Surveys</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>{activeSurveys} Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>{avgResponseRate}% Response Rate</span>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* AI Insights */}
      {getSurveyInsights().length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getSurveyInsights().map((insight, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <p className="text-sm font-medium mt-2">{insight.value}</p>
                  </div>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Surveys Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Surveys</TabsTrigger>
          <TabsTrigger value="mine">My Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredSurveys.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No surveys found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === "mine" 
                    ? "You haven't created any surveys yet." 
                    : "No surveys have been created yet."
                  }
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Survey
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurveys.map((survey) => (
                <Card key={survey.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{survey.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {survey.subject}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSurvey(survey)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePreviewSurvey(survey)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendSurvey(survey)}>
                            <Users className="h-4 w-4 mr-2" />
                            Send Survey
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(survey.status)}>
                          {survey.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(survey.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{survey.sent_count || 0} sent</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span>{survey.response_count || 0} responses</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSurvey(survey)}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSendSurvey(survey)}
                          className="flex-1"
                        >
                          Send Survey
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateSurveyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        accounts={accounts}
        organizationId={organizationId}
        userId={currentUserId}
      />

      <SurveyDetailsDialog
        survey={selectedSurvey}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onEdit={handleEditSurvey}
        onDelete={handleDeleteSurvey}
        onSend={handleSendSurvey}
      />

      <SendSurveyDialog survey={selectedSurvey} open={showSendDialog} onOpenChange={setShowSendDialog} />
    </div>
  )
}