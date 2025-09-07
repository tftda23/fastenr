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
import { Plus, Trash2, GripVertical } from "lucide-react"

interface TemplateStep {
  id: string
  title: string
  description: string
  category: 'kickoff' | 'technical' | 'training' | 'configuration' | 'testing' | 'deployment' | 'support' | 'administrative'
  isRequired: boolean
  estimatedHours: number
  dueDaysOffset: number
}

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description: string
    planType: 'starter' | 'standard' | 'enterprise' | 'custom'
    estimatedDuration: number
    steps: TemplateStep[]
  }) => void
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit }: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planType: 'standard' as const,
    estimatedDuration: 30
  })

  const [steps, setSteps] = useState<TemplateStep[]>([
    {
      id: '1',
      title: 'Kickoff Call & Requirements',
      description: 'Initial welcome call to understand customer needs and set expectations',
      category: 'kickoff' as const,
      isRequired: true,
      estimatedHours: 1,
      dueDaysOffset: 0
    }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    onSubmit({
      ...formData,
      steps
    })
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      planType: 'standard',
      estimatedDuration: 30
    })
    setSteps([{
      id: '1',
      title: 'Kickoff Call & Requirements',
      description: 'Initial welcome call to understand customer needs and set expectations',
      category: 'kickoff',
      isRequired: true,
      estimatedHours: 1,
      dueDaysOffset: 0
    }])
    
    onOpenChange(false)
  }

  const addStep = () => {
    const newStep: TemplateStep = {
      id: Date.now().toString(),
      title: '',
      description: '',
      category: 'configuration',
      isRequired: true,
      estimatedHours: 1,
      dueDaysOffset: 0
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId))
  }

  const updateStep = (stepId: string, updates: Partial<TemplateStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Onboarding Template</DialogTitle>
            <DialogDescription>
              Design a reusable onboarding workflow template with customizable steps.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Template Basic Info */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Enterprise Customer Onboarding"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this onboarding template..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Plan Type</Label>
                  <Select 
                    value={formData.planType}
                    onValueChange={(value: 'starter' | 'standard' | 'enterprise' | 'custom') => 
                      setFormData(prev => ({ ...prev, planType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="duration">Estimated Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimatedDuration: parseInt(e.target.value) || 30 
                    }))}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            </div>

            {/* Template Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Onboarding Steps</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={step.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Step title"
                            value={step.title}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                          />
                          <div className="flex items-center space-x-2">
                            <Select
                              value={step.category}
                              onValueChange={(value: any) => updateStep(step.id, { category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kickoff">Kickoff</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="training">Training</SelectItem>
                                <SelectItem value="configuration">Configuration</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                                <SelectItem value="deployment">Deployment</SelectItem>
                                <SelectItem value="support">Support</SelectItem>
                                <SelectItem value="administrative">Administrative</SelectItem>
                              </SelectContent>
                            </Select>
                            <Badge className={getCategoryColor(step.category)} variant="outline">
                              {step.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <Textarea
                          placeholder="Step description and instructions"
                          value={step.description}
                          onChange={(e) => updateStep(step.id, { description: e.target.value })}
                          rows={2}
                        />
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={step.isRequired}
                              onChange={(e) => updateStep(step.id, { isRequired: e.target.checked })}
                              className="rounded"
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Hours:</Label>
                            <Input
                              type="number"
                              value={step.estimatedHours}
                              onChange={(e) => updateStep(step.id, { 
                                estimatedHours: parseFloat(e.target.value) || 1 
                              })}
                              min="0.5"
                              step="0.5"
                              className="w-20"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Due in:</Label>
                            <Input
                              type="number"
                              value={step.dueDaysOffset}
                              onChange={(e) => updateStep(step.id, { 
                                dueDaysOffset: parseInt(e.target.value) || 0 
                              })}
                              min="0"
                              className="w-20"
                            />
                            <Label className="text-sm">days</Label>
                          </div>
                        </div>
                      </div>
                      
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}