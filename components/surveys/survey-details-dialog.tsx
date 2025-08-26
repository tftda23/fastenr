"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Mail, Users, BarChart3, Send, Edit3, Trash2, Eye, Download, Copy } from "lucide-react"
import SendSurveyDialog from "./send-survey-dialog"

interface Survey {
  id: string
  title: string
  subject: string
  content: string
  status: string
  created_at: string
  logo_url?: string
  links?: any[]
}

interface SurveyDetailsDialogProps {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (survey: Survey) => void
  onDelete?: (surveyId: string) => void
  onSend?: (survey: Survey) => void
}

export default function SurveyDetailsDialog({
  survey,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onSend,
}: SurveyDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showSendDialog, setShowSendDialog] = useState(false)

  if (!survey) return null

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

  const handleSendSurvey = () => {
    setShowSendDialog(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{survey.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  Created on {new Date(survey.created_at).toLocaleDateString()}
                </DialogDescription>
              </div>
              <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Survey Content Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Survey Preview</CardTitle>
                  <CardDescription>How your survey will appear to recipients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Subject</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{survey.subject}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Content</Label>
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{survey.content}</p>
                    </div>
                  </div>

                  {survey.links && survey.links.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Additional Links</Label>
                      <div className="space-y-2">
                        {survey.links.map((link: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                            <span className="text-sm font-medium">{link.title}</span>
                            <Badge variant="outline">{link.url}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Sent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Opened</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Responded</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">0%</p>
                        <p className="text-xs text-muted-foreground">Response Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recipient Management</CardTitle>
                  <CardDescription>Manage who receives this survey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recipients added yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add email addresses to send this survey to your customers
                    </p>
                    <Button onClick={handleSendSurvey}>
                      <Users className="h-4 w-4 mr-2" />
                      Add Recipients
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Survey Analytics</CardTitle>
                  <CardDescription>Track performance and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No data available</h3>
                    <p className="text-muted-foreground">Analytics will appear here once the survey is sent</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Survey Settings</CardTitle>
                  <CardDescription>Configure survey behavior and options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Survey Status</p>
                      <p className="text-sm text-muted-foreground">Current survey status</p>
                    </div>
                    <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">Survey creation date</p>
                    </div>
                    <p className="text-sm">{new Date(survey.created_at).toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Survey ID</p>
                      <p className="text-sm text-muted-foreground">Unique identifier</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{survey.id}</code>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete?.(survey.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onEdit?.(survey)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleSendSurvey}>
                <Send className="h-4 w-4 mr-2" />
                Send Survey
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SendSurveyDialog survey={survey} open={showSendDialog} onOpenChange={setShowSendDialog} />
    </>
  )
}
