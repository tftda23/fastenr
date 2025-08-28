"use client"

import { useState } from 'react'
import { format, addHours } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CreateEngagementDialogProps {
  children?: React.ReactNode
  selectedDate?: Date
  selectedTime?: string
  onEngagementCreated?: () => void
}

export function CreateEngagementDialog({ 
  children, 
  selectedDate, 
  selectedTime,
  onEngagementCreated 
}: CreateEngagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meeting' as 'meeting' | 'call' | 'email' | 'note' | 'demo' | 'training',
    account_id: '',
    scheduled_at: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    scheduled_time: selectedTime || '09:00',
    duration_minutes: 60,
    is_all_day: false,
    attendees: [] as string[],
    tags: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const scheduledAt = formData.is_all_day 
        ? new Date(formData.scheduled_at).toISOString()
        : new Date(`${formData.scheduled_at}T${formData.scheduled_time}`).toISOString()

      const engagementData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        account_id: formData.account_id || null,
        scheduled_at: scheduledAt,
        duration_minutes: formData.is_all_day ? null : formData.duration_minutes,
        is_all_day: formData.is_all_day,
        attendees: formData.attendees.filter(a => a.trim()),
        tags: formData.tags.filter(t => t.trim())
      }

      const response = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engagementData)
      })

      if (!response.ok) {
        throw new Error('Failed to create engagement')
      }

      toast({
        title: "Success",
        description: "Engagement created successfully",
      })

      setOpen(false)
      setFormData({
        title: '',
        description: '',
        type: 'meeting',
        account_id: '',
        scheduled_at: format(new Date(), "yyyy-MM-dd"),
        scheduled_time: '09:00',
        duration_minutes: 60,
        is_all_day: false,
        attendees: [],
        tags: []
      })

      onEngagementCreated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create engagement. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // When dialog opens, update the date/time if provided
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && selectedDate) {
      setFormData(prev => ({
        ...prev,
        scheduled_at: format(selectedDate, "yyyy-MM-dd"),
        scheduled_time: selectedTime || prev.scheduled_time
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Engagement
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Create New Engagement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter engagement title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe the engagement..."
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date *</Label>
              <Input
                id="scheduled_at"
                type="date"
                value={formData.scheduled_at}
                onChange={(e) => updateFormData('scheduled_at', e.target.value)}
                required
              />
            </div>
            
            {!formData.is_all_day && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Time</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => updateFormData('scheduled_time', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_all_day"
              checked={formData.is_all_day}
              onCheckedChange={(checked) => updateFormData('is_all_day', checked)}
            />
            <Label htmlFor="is_all_day">All day event</Label>
          </div>

          {/* Duration (only for timed events) */}
          {!formData.is_all_day && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => updateFormData('duration_minutes', parseInt(e.target.value) || 60)}
                placeholder="60"
              />
            </div>
          )}

          {/* Account Selection - this could be enhanced with an autocomplete */}
          <div className="space-y-2">
            <Label htmlFor="account_id">Associated Account</Label>
            <Input
              id="account_id"
              value={formData.account_id}
              onChange={(e) => updateFormData('account_id', e.target.value)}
              placeholder="Account ID (optional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Engagement
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}