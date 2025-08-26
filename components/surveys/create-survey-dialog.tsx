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
import { Upload, Plus, X, Link as LinkIcon } from "lucide-react"
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
    accountId: "",                 // <-- NEW
  })
  const [links, setLinks] = useState<SurveyLink[]>([])
  const [newLink, setNewLink] = useState({ title: "", url: "" })

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
      setFormData({ title: "", subject: "", content: "", logoUrl: "", accountId: "" })
      setLinks([])
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="We'd love your feedback!"
                required
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
