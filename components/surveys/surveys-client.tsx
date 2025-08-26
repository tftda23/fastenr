"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Users, BarChart3, MoreHorizontal } from "lucide-react"
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
    console.log("Edit survey:", survey.id)
  }

  const handleDeleteSurvey = (surveyId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete survey:", surveyId)
  }

  const handleSendSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setShowSendDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Button>

          {/* Coming Soon Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-200 dark:border-amber-800">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              Automatic Scheduling - Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* Surveys Grid */}
      {surveys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No surveys yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first survey to start gathering customer feedback
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Survey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    <CardDescription>{survey.subject}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSurvey(survey)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSurvey(survey)}>Edit Survey</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendSurvey(survey)}>Send Survey</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteSurvey(survey.id)} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{survey.content}</p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(survey.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>0 sent</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewSurvey(survey)}
                    >
                      View
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleSendSurvey(survey)}>
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSurveyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        userId={currentUserId}
        organizationId={organizationId}
        accounts={accounts}
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
