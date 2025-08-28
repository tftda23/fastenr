"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CreateContactGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const colorOptions = [
  { value: '#FF6B6B', label: 'Red' },
  { value: '#4ECDC4', label: 'Teal' },
  { value: '#45B7D1', label: 'Blue' },
  { value: '#FFA07A', label: 'Orange' },
  { value: '#98D8C8', label: 'Green' },
  { value: '#F7DC6F', label: 'Yellow' },
  { value: '#BB8FCE', label: 'Purple' },
  { value: '#85929E', label: 'Gray' }
]

export function CreateContactGroupDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateContactGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0].value
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/contact-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          color: colorOptions[0].value
        })
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.text()
        console.error('Failed to create group:', error)
      }
    } catch (error) {
      console.error('Error creating group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        color: colorOptions[0].value
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Contact Group</DialogTitle>
          <DialogDescription>
            Create a new group to organize your contacts by team, role, or any criteria.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Decision Makers, Technical Team"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description for this group"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-foreground ring-2 ring-offset-2 ring-foreground' 
                      : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}