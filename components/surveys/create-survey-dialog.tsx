// components/surveys/CreateSurveyDialog.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Plus, X, Link as LinkIcon, Sparkles, Star, TrendingUp, Calendar, Clock, Send } from "lucide-react"
import { createSurvey } from "@/lib/surveys"
import { useToast } from "@/hooks/use-toast"
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select"
import type { Account } from "@/lib/types"

interface CreateSurveyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  organizationId: string
  accounts: Pick<Account, "id" | "name">[]
}

interface SurveyLink {
  id: string
  title: string
  url: string
}

export default function CreateSurveyDialog({
  open,
  onOpenChange,
  userId,
  organizationId,
  accounts,
}: CreateSurveyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    logoUrl: "",
    accountId: "",
    template: "custom",
    sendOption: "draft", // draft, schedule, send_now
    scheduledDate: "",
    scheduledTime: ""
  })
  const [links, setLinks] = useState<SurveyLink[]>([])
  const [newLink, setNewLink] = useState({ title: "", url: "" })
  const [selectedTemplate, setSelectedTemplate] = useState<string>("custom")

  const surveyTemplates = [
    {
      id: "custom",
      name: "Custom Survey",
      description: "Create your own survey from scratch",
      icon: Sparkles,
      healthScore: false,
      template: {
        title: "",
        subject: "",
        content: ""
      }
    },
    {
      id: "nps-simple",
      name: "NPS (1-10 Rating)",
      description: "Simple Net Promoter Score survey",
      icon: Star,
      healthScore: true,
      template: {
        title: "We'd Love Your Feedback",
        subject: "How likely are you to recommend us?",
        content: "Hi there!\n\nWe're always working to improve our service and would love to hear from you. Could you take 30 seconds to let us know how we're doing?\n\nYour feedback helps us serve you better."
      }
    },
    {
      id: "nps-detailed",
      name: "NPS (5 Questions)",
      description: "Comprehensive NPS with follow-up questions",
      icon: TrendingUp,
      healthScore: true,
      template: {
        title: "Customer Experience Survey",
        subject: "Help us improve - quick 2-minute survey",
        content: "Hello!\n\nAs a valued customer, your opinion matters to us. We'd appreciate a few minutes of your time to complete our customer experience survey.\n\nThis survey includes 5 quick questions about your recent experience and helps us understand how we can serve you better."
      }
    },
    {
      id: "quarterly",
      name: "Quarterly Review",
      description: "Comprehensive quarterly feedback survey",
      icon: Calendar,
      healthScore: true,
      template: {
        title: "Quarterly Customer Review",
        subject: "Your quarterly feedback is important to us",
        content: "Hi there!\n\nAs we wrap up another quarter, we'd love to get your thoughts on how things have been going with our partnership.\n\nThis quarterly review helps us understand your evolving needs and ensures we're providing the best possible service."
      }
    }
  ]

  const handleTemplateSelect = (templateId: string) => {
    const template = surveyTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setFormData(prev => ({
        ...prev,
        template: templateId,
        title: template.template.title,
        subject: template.template.subject,
        content: template.template.content
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountId) {
      toast({ title: "Select an account", description: "Please choose an account for this survey.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      await createSurvey(
        {
          title: formData.title,
          subject: formData.subject,
          content: formData.content,
          logo_url: formData.logoUrl || null,
          links,
          account_id: formData.accountId,  // <-- NEW
        },
        userId,
        organizationId
      )

      toast({ title: "Survey created", description: "Your survey has been created successfully." })
      onOpenChange(false)
      router.refresh()

      // Reset form
      setFormData({ title: "", subject: "", content: "", logoUrl: "", accountId: "", template: "custom" })
      setLinks([])
      setSelectedTemplate("custom")
    } catch (error) {
      console.error("Error creating survey:", error)
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks((prev) => [...prev, { ...newLink, id: Date.now().toString() }])
      setNewLink({ title: "", url: "" })
    }
  }

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Survey</DialogTitle>
          <DialogDescription>Design a survey to gather feedback from your customers</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Choose Survey Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {surveyTemplates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <div
                      key={template.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{template.name}</h3>
                            {template.healthScore && (
                              <Badge variant="secondary" className="text-xs">
                                Health Score
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                          {!template.healthScore && template.id === "custom" && (
                            <p className="text-xs text-orange-600">
                              Note: Custom surveys don't contribute to health scores
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select
              value={formData.accountId}
              onValueChange={(val) => setFormData((s) => ({ ...s, accountId: val }))}
            >
              <SelectTrigger id="account" className="w-full">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Survey Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Customer Satisfaction Survey"
                required
                disabled={selectedTemplate !== "custom"}
              />
              {selectedTemplate !== "custom" && (
                <p className="text-xs text-muted-foreground">
                  Template fields are pre-filled but can be customized
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="We'd love your feedback!"
                required
                disabled={selectedTemplate !== "custom"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Survey Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Thank you for being a valued customer. We'd appreciate a few minutes of your time..."
                rows={4}
                required
                disabled={selectedTemplate !== "custom"}
              />
            </div>
          </div>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Additional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.length > 0 && (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{link.title}</span>
                        <Badge variant="outline">{link.url}</Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(link.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-2">
                <Input
                  placeholder="Link title"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                />
                <Input
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={addLink}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.accountId}>
              {loading ? "Creating..." : "Create Survey"}
            </Button>
            {selectedTemplate !== "custom" && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                This survey template will contribute to your customer health scores
              </p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
