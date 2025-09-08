"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2, Clock, Target } from "lucide-react"

interface OnboardingTemplate {
  id: string
  name: string
  description: string | null
  plan_type: 'starter' | 'standard' | 'enterprise' | 'custom'
  estimated_duration_days: number | null
  usage_count: number
}

interface NewOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Array<{ id: string; name: string }>
  templates: OnboardingTemplate[]
  preselectedAccountId?: string // New prop for locking account selection
  onSubmit: (data: {
    accountId: string
    templateId: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    targetDate: string
    customNotes: string
  }) => void
}

export function NewOnboardingDialog({ 
  open, 
  onOpenChange, 
  accounts, 
  templates,
  preselectedAccountId,
  onSubmit 
}: NewOnboardingDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState({
    accountId: preselectedAccountId || '',
    templateId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    targetDate: '',
    customNotes: ''
  })

  // Update accountId when preselectedAccountId changes
  React.useEffect(() => {
    if (preselectedAccountId) {
      setFormData(prev => ({ ...prev, accountId: preselectedAccountId }))
    }
  }, [preselectedAccountId])

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.accountId || !formData.templateId) return
    
    onSubmit({
      ...formData,
      templateId: selectedTemplate
    })
    
    // Reset form
    setFormData({
      accountId: '',
      templateId: '',
      priority: 'medium',
      targetDate: '',
      customNotes: ''
    })
    setSelectedTemplate('')
    onOpenChange(false)
  }

  const getTemplateColor = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'standard':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'starter':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Calculate suggested target date based on template duration
  const suggestedTargetDate = selectedTemplateData?.estimated_duration_days 
    ? new Date(Date.now() + (selectedTemplateData.estimated_duration_days * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0]
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Start Customer Onboarding</DialogTitle>
            <DialogDescription>
              Select an account and onboarding plan template to begin the customer success journey.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Account Selection */}
            <div className="grid gap-2">
              <Label htmlFor="account">Customer Account *</Label>
              {preselectedAccountId ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                  <span className="font-medium">
                    {accounts.find(a => a.id === preselectedAccountId)?.name || 'Selected Account'}
                  </span>
                  <Badge variant="secondary">Pre-selected</Badge>
                </div>
              ) : (
                <Select 
                  value={formData.accountId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Template Selection */}
            <div className="grid gap-3">
              <Label>Onboarding Plan Template *</Label>
              <div className="grid gap-3">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id 
                        ? 'ring-2 ring-blue-500 border-blue-200' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id)
                      setFormData(prev => ({ 
                        ...prev, 
                        templateId: template.id,
                        targetDate: suggestedTargetDate
                      }))
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTemplateColor(template.plan_type)} variant="outline">
                            {template.plan_type}
                          </Badge>
                          {selectedTemplate === template.id && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                      {template.description && (
                        <CardDescription className="text-sm">{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{template.estimated_duration_days || 'Custom'} days</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>Used {template.usage_count} times</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {templates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No onboarding templates available.</p>
                  <p className="text-sm">Contact your administrator to create templates.</p>
                </div>
              )}
            </div>

            {/* Additional Settings - only show when template is selected */}
            {selectedTemplate && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="targetDate">Target Completion Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate || suggestedTargetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {suggestedTargetDate && (
                      <p className="text-xs text-muted-foreground">
                        Suggested: {new Date(suggestedTargetDate).toLocaleDateString()} 
                        ({selectedTemplateData?.estimated_duration_days} days from now)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="customNotes">Custom Notes (Optional)</Label>
                  <Textarea
                    id="customNotes"
                    value={formData.customNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, customNotes: e.target.value }))}
                    placeholder="Any specific requirements, special instructions, or notes for this onboarding process..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.accountId || !selectedTemplate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Onboarding Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}