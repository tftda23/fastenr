"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ContactGroup, ContactFormData, Account } from '@/lib/types'

interface CreateContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactGroups: ContactGroup[]
  onSuccess: () => void
  accounts?: Account[]
  defaultAccountId?: string
}

export function CreateContactDialog({
  open,
  onOpenChange,
  contactGroups,
  onSuccess,
  accounts = [],
  defaultAccountId
}: CreateContactDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    account_id: defaultAccountId || '',
    seniority_level: undefined,
    decision_maker_level: undefined,
    relationship_strength: 'neutral',
    preferred_communication: 'email',
    primary_contact: false,
    linkedin_url: '',
    notes: '',
    group_ids: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Contact created successfully",
        })
        onSuccess()
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          title: '',
          department: '',
          account_id: defaultAccountId || '',
          seniority_level: undefined,
          decision_maker_level: undefined,
          relationship_strength: 'neutral',
          preferred_communication: 'email',
          primary_contact: false,
          linkedin_url: '',
          notes: '',
          group_ids: []
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contact')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contact",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGroupToggle = (groupId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      group_ids: checked 
        ? [...(prev.group_ids || []), groupId]
        : (prev.group_ids || []).filter(id => id !== groupId)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a new contact and assign them to groups
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            {/* Account Selection - Required */}
            <div className="space-y-2">
              <Label htmlFor="account_id">Account *</Label>
              <Select 
                value={formData.account_id || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Role & Influence */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role & Influence</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seniority_level">Seniority Level</Label>
                <Select 
                  value={formData.seniority_level || ''} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    seniority_level: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C-Level">C-Level</SelectItem>
                    <SelectItem value="VP">VP</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Individual Contributor">Individual Contributor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision_maker_level">Decision Maker Level</Label>
                <Select 
                  value={formData.decision_maker_level || ''} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    decision_maker_level: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary">Primary Decision Maker</SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="User">End User</SelectItem>
                    <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_strength">Relationship Strength</Label>
                <Select 
                  value={formData.relationship_strength || 'neutral'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    relationship_strength: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="champion">Champion</SelectItem>
                    <SelectItem value="supporter">Supporter</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="detractor">Detractor</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_communication">Preferred Communication</Label>
                <Select 
                  value={formData.preferred_communication || 'email'} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    preferred_communication: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="teams">Teams</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="primary_contact"
                checked={formData.primary_contact}
                onCheckedChange={(checked) => setFormData(prev => ({ 
                  ...prev, 
                  primary_contact: checked as boolean 
                }))}
              />
              <Label htmlFor="primary_contact">Primary contact for this account</Label>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this contact..."
                rows={3}
              />
            </div>
          </div>

          {/* Contact Groups */}
          {contactGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Groups</h3>
              <div className="grid grid-cols-2 gap-2">
                {contactGroups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={(formData.group_ids || []).includes(group.id)}
                      onCheckedChange={(checked) => handleGroupToggle(group.id, checked as boolean)}
                    />
                    <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: group.color || '#3B82F6' }}
                      />
                      {group.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}