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
import { Loader2, Save, X } from "lucide-react"
import Link from "next/link"
import type { Engagement, Account } from "@/lib/types"

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
  const [formData, setFormData] = useState({
    account_id: engagement?.account_id || preselectedAccountId || "",
    type: engagement?.type || "meeting",
    title: engagement?.title || "",
    description: engagement?.description || "",
    outcome: engagement?.outcome || "no_outcome_set",
    scheduled_at: engagement?.scheduled_at ? engagement.scheduled_at.slice(0, 16) : "",
    completed_at: engagement?.completed_at ? engagement.completed_at.slice(0, 16) : "",
    attendees: engagement?.attendees ? JSON.stringify(engagement.attendees) : "[]",
  })

  useEffect(() => {
    loadAccounts()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        scheduled_at: formData.scheduled_at || null,
        completed_at: formData.completed_at || null,
        outcome: formData.outcome || null,
        description: formData.description || null,
        attendees: formData.attendees ? JSON.parse(formData.attendees) : [],
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <SelectItem value="no_outcome_set">No outcome set</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="action_required">Action Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attendees */}
            <div className="space-y-2">
              <Label htmlFor="attendees">Attendees (JSON)</Label>
              <Textarea
                id="attendees"
                value={formData.attendees}
                onChange={(e) => handleChange("attendees", e.target.value)}
                placeholder='[{"name": "John Smith", "email": "john@example.com", "role": "CEO"}]'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">JSON array of attendee objects</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/engagements">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Engagement" : "Log Engagement"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
