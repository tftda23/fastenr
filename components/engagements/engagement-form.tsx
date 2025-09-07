"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, X, Users, User, Search, Plus, UserPlus, Mail, Send } from "lucide-react"
import Link from "next/link"
import type { Engagement, Account, Contact } from "@/lib/types"

interface EngagementFormProps {
  engagement?: Engagement
  isEditing?: boolean
}

export default function EngagementForm({ engagement, isEditing = false }: EngagementFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedAccountId = searchParams.get("account_id")

  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [contactSearch, setContactSearch] = useState("")
  const [showCreateContact, setShowCreateContact] = useState(false)
  const [isCreatingContact, setIsCreatingContact] = useState(false)
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    title: '',
    phone: ''
  })
  const [formData, setFormData] = useState({
    account_id: engagement?.account_id || preselectedAccountId || "",
    type: engagement?.type || "meeting",
    title: engagement?.title || "",
    description: engagement?.description || "",
    outcome: engagement?.outcome || "",
    scheduled_at: engagement?.scheduled_at ? engagement.scheduled_at.slice(0, 16) : "",
    completed_at: engagement?.completed_at ? engagement.completed_at.slice(0, 16) : "",
  })
  
  // Email functionality state
  const [sendEmail, setSendEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [emailTemplate, setEmailTemplate] = useState("")
  const [emailTemplates, setEmailTemplates] = useState([])
  const [showEmailEditor, setShowEmailEditor] = useState(false)

  useEffect(() => {
    loadAccounts()
    loadContacts()
    loadEmailTemplates()
    if (engagement && isEditing) {
      loadEngagementParticipants()
    }
  }, [])

  // Load contacts when account changes
  useEffect(() => {
    if (formData.account_id) {
      loadContacts(formData.account_id)
    }
  }, [formData.account_id])

  const loadAccounts = async () => {
    try {
      const response = await fetch("/api/accounts")
      const result = await response.json()
      if (response.ok) {
        setAccounts(result.data || [])
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
    }
  }

  const loadContacts = async (accountId?: string) => {
    try {
      const params = new URLSearchParams()
      if (accountId) {
        params.set('account_id', accountId)
      }
      const response = await fetch(`/api/contacts?${params.toString()}`)
      const result = await response.json()
      if (response.ok) {
        setContacts(result.data || [])
      }
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates")
      const result = await response.json()
      if (response.ok) {
        setEmailTemplates(result.data || [])
      }
    } catch (error) {
      console.error("Error loading email templates:", error)
    }
  }

  const loadEngagementParticipants = async () => {
    if (!engagement?.id) return
    try {
      const response = await fetch(`/api/engagements/${engagement.id}/participants`)
      const result = await response.json()
      if (response.ok) {
        setSelectedContacts(result.map((p: any) => p.contact_id))
      }
    } catch (error) {
      console.error("Failed to load engagement participants:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        scheduled_at: formData.scheduled_at || null,
        completed_at: formData.completed_at || null,
        outcome: formData.outcome && formData.outcome.trim() ? formData.outcome : null,
        description: formData.description || null,
        participants: selectedContacts, // Send selected contact IDs
      }

      const url = isEditing ? `/api/engagements/${engagement?.id}` : "/api/engagements"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save engagement")
      }

      const result = await response.json()

      // If creating a new engagement, also save participants
      if (!isEditing && result.id && selectedContacts.length > 0) {
        await fetch(`/api/engagements/${result.id}/participants`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactIds: selectedContacts }),
        })
      }

      // Send email if requested
      if (sendEmail && emailSubject && emailContent && selectedContacts.length > 0) {
        try {
          const recipients = contacts
            .filter(contact => selectedContacts.includes(contact.id))
            .map(contact => ({
              email: contact.email,
              name: `${contact.first_name} ${contact.last_name}`
            }))

          await fetch("/api/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recipients,
              subject: emailSubject,
              content: emailContent,
              type: "engagement",
              engagement_id: result.id,
              account_id: formData.account_id
            })
          })
        } catch (emailError) {
          console.error("Error sending email:", emailError)
          // Don't fail the engagement creation if email fails
        }
      }

      router.push("/dashboard/engagements")
      router.refresh()
    } catch (error) {
      console.error("Error saving engagement:", error)
      // In a real app, you'd show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateContact = async () => {
    if (!formData.account_id || !newContact.first_name || !newContact.last_name || !newContact.email) {
      return
    }

    setIsCreatingContact(true)
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newContact,
          account_id: formData.account_id
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Add new contact to the list and select it
        setContacts(prev => [...prev, result.data])
        setSelectedContacts(prev => [...prev, result.data.id])
        
        // Reset form and hide create dialog
        setNewContact({
          first_name: '',
          last_name: '',
          email: '',
          title: '',
          phone: ''
        })
        setShowCreateContact(false)
      }
    } catch (error) {
      console.error('Failed to create contact:', error)
    } finally {
      setIsCreatingContact(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{isEditing ? "Edit Engagement" : "Log New Engagement"}</h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update engagement details" : "Record a customer interaction"}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/engagements">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Link>
          </Button>
        </div>

        {/* Form */}
        <div className="bg-card border rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Engagement Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_id">Account *</Label>
                <Select value={formData.account_id} onValueChange={(value) => handleChange("account_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
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
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Quarterly Business Review"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Detailed notes about the engagement..."
                rows={4}
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Scheduled Date/Time</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => handleChange("scheduled_at", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completed_at">Completed Date/Time</Label>
                <Input
                  id="completed_at"
                  type="datetime-local"
                  value={formData.completed_at}
                  onChange={(e) => handleChange("completed_at", e.target.value)}
                />
              </div>
            </div>

            {/* Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={formData.outcome} onValueChange={(value) => handleChange("outcome", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="action_required">Action Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Sending Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                />
                <Label htmlFor="send-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send follow-up email to participants
                </Label>
              </div>

              {sendEmail && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  {/* Email Template Selection */}
                  {emailTemplates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Use Email Template (Optional)</Label>
                      <Select 
                        value={emailTemplate} 
                        onValueChange={(value) => {
                          setEmailTemplate(value)
                          const template = emailTemplates.find((t: any) => t.id === value)
                          if (template) {
                            setEmailSubject(template.subject)
                            setEmailContent(template.content)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email Subject *</Label>
                    <Input
                      id="email-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Follow-up from our meeting"
                      required={sendEmail}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-content">Email Content *</Label>
                    <Textarea
                      id="email-content"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Hi {{recipient.name}},\n\nThank you for taking the time to meet with us today...\n\nBest regards,\nYour Customer Success Team"
                      rows={6}
                      required={sendEmail}
                    />
                    <div className="text-xs text-muted-foreground">
                      Available variables: {"{"}{"{"} recipient.name {"}"} {"}"}, {"{"}{"{"} account.name {"}"} {"}"}, {"{"}{"{"} engagement.title {"}"} {"}"}
                    </div>
                  </div>

                  {selectedContacts.length > 0 && (
                    <div className="bg-muted/20 p-3 rounded">
                      <div className="text-sm font-medium mb-1">Email will be sent to:</div>
                      <div className="text-sm text-muted-foreground">
                        {contacts
                          .filter(contact => selectedContacts.includes(contact.id))
                          .map(contact => `${contact.first_name} ${contact.last_name} (${contact.email})`)
                          .join(", ")}
                      </div>
                    </div>
                  )}

                  {sendEmail && selectedContacts.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Please select participants to send the email to
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Participants */}
            <div className="space-y-2">
              <Label>Participants</Label>
              {formData.account_id ? (
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Add Contact Button */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Select Participants</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateContact(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {/* Create Contact Form */}
                  {showCreateContact && (
                    <div className="border rounded-md p-4 mb-4 bg-muted/20">
                      <h4 className="font-medium mb-3">Create New Contact</h4>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Input
                          placeholder="First Name *"
                          value={newContact.first_name}
                          onChange={(e) => setNewContact(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                        <Input
                          placeholder="Last Name *"
                          value={newContact.last_name}
                          onChange={(e) => setNewContact(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Input
                          placeholder="Email *"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <Input
                          placeholder="Phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="mb-3">
                        <Input
                          placeholder="Job Title"
                          value={newContact.title}
                          onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateContact}
                          disabled={!newContact.first_name || !newContact.last_name || !newContact.email || isCreatingContact}
                        >
                          {isCreatingContact ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Contact
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateContact(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Contact Selection */}
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {contacts
                      .filter(contact => {
                        const searchLower = contactSearch.toLowerCase()
                        const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase()
                        const email = contact.email?.toLowerCase() || ''
                        return fullName.includes(searchLower) || email.includes(searchLower)
                      })
                      .map((contact) => (
                        <div key={contact.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50">
                          <Checkbox
                            id={`contact-${contact.id}`}
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContacts([...selectedContacts, contact.id])
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                              }
                            }}
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {contact.first_name} {contact.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {contact.email}
                              </div>
                              {contact.title && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {contact.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {contacts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No contacts available for this account</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected count */}
                  <div className="text-sm text-muted-foreground">
                    {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an account first to choose participants</p>
                </div>
              )}
            </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/engagements">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {sendEmail ? "Saving & Sending..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {sendEmail ? <Send className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      {isEditing 
                        ? "Update Engagement" 
                        : sendEmail 
                          ? "Log Engagement & Send Email" 
                          : "Log Engagement"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
