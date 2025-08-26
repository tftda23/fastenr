"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Mail, Users, Plus, X, Upload, Send, CheckCircle, AlertCircle } from "lucide-react"
import { sendSurvey } from "@/lib/surveys"
import { useToast } from "@/hooks/use-toast"

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

interface SendSurveyDialogProps {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Recipient {
  id: string
  email: string
  name?: string
}

export default function SendSurveyDialog({ survey, open, onOpenChange }: SendSurveyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [sendComplete, setSendComplete] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ email: "", name: "" })
  const [emailList, setEmailList] = useState("")

  if (!survey) return null

  const addRecipient = () => {
    if (newRecipient.email) {
      const recipient: Recipient = {
        id: Date.now().toString(),
        email: newRecipient.email,
        name: newRecipient.name || undefined,
      }
      setRecipients([...recipients, recipient])
      setNewRecipient({ email: "", name: "" })
    }
  }

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id))
  }

  const parseEmailList = () => {
    if (!emailList.trim()) return

    const emails = emailList
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email && email.includes("@"))

    const newRecipients: Recipient[] = emails.map((email) => ({
      id: Date.now().toString() + Math.random(),
      email,
    }))

    setRecipients([...recipients, ...newRecipients])
    setEmailList("")
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient before sending.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    setSendProgress(0)

    try {
      // Mock sending process with progress updates
      const totalRecipients = recipients.length

      for (let i = 0; i < totalRecipients; i++) {
        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        setSendProgress(((i + 1) / totalRecipients) * 100)
      }

      // Call the send function (will use real email if configured, mock otherwise)
      const result = await sendSurvey(survey.id, recipients, "org-id") // TODO: Get actual org ID

      setSendComplete(true)
      toast({
        title: "Survey sent successfully",
        description: `Survey sent to ${recipients.length} recipients.`,
      })

      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false)
        router.refresh()
        // Reset state
        setSending(false)
        setSendComplete(false)
        setSendProgress(0)
        setRecipients([])
      }, 2000)
    } catch (error) {
      console.error("Error sending survey:", error)
      toast({
        title: "Error",
        description: "Failed to send survey. Please try again.",
        variant: "destructive",
      })
      setSending(false)
    }
  }

  const handleClose = () => {
    if (!sending) {
      onOpenChange(false)
      // Reset state when closing
      setSendComplete(false)
      setSendProgress(0)
      setRecipients([])
      setEmailList("")
      setNewRecipient({ email: "", name: "" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Survey: {survey.title}</DialogTitle>
          <DialogDescription>Add recipients and send your survey via email</DialogDescription>
        </DialogHeader>

        {sending ? (
          // Sending Progress View
          <div className="space-y-6 py-6">
            <div className="text-center">
              {sendComplete ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              )}
              <h3 className="text-lg font-medium mb-2">
                {sendComplete ? "Survey Sent Successfully!" : "Sending Survey..."}
              </h3>
              <p className="text-muted-foreground mb-4">
                {sendComplete
                  ? `Survey sent to ${recipients.length} recipients`
                  : `Sending to ${recipients.length} recipients`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(sendProgress)}%</span>
              </div>
              <Progress value={sendProgress} className="w-full" />
            </div>

            {sendComplete && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Closing automatically...</p>
              </div>
            )}
          </div>
        ) : (
          // Recipient Management View
          <div className="space-y-6">
            {/* Survey Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Survey Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Subject:</span>
                  <span>{survey.subject}</span>
                </div>
                <Separator />
                <div className="text-sm">
                  <span className="font-medium">Content Preview:</span>
                  <p className="mt-1 text-muted-foreground line-clamp-2">{survey.content}</p>
                </div>
              </CardContent>
            </Card>

            {/* Add Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Recipients</CardTitle>
                <CardDescription>Add email addresses to send this survey to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Single Recipient Input */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={newRecipient.email}
                      onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Name (optional)"
                      value={newRecipient.name}
                      onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                    />
                  </div>
                  <Button type="button" onClick={addRecipient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or bulk add</span>
                  </div>
                </div>

                {/* Bulk Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email-list">Paste email list (comma or line separated)</Label>
                  <Textarea
                    id="email-list"
                    placeholder="email1@example.com, email2@example.com&#10;email3@example.com"
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    rows={3}
                  />
                  <Button type="button" variant="outline" onClick={parseEmailList} disabled={!emailList.trim()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Emails
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recipients List */}
            {recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Recipients ({recipients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recipients.map((recipient) => (
                      <div key={recipient.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{recipient.email}</span>
                          {recipient.name && <Badge variant="outline">{recipient.name}</Badge>}
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeRecipient(recipient.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Provider Notice */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Email Delivery Status</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {process.env.NEXT_PUBLIC_RESEND_CONFIGURED === 'true' 
                        ? "Email service is configured. Recipients will receive the survey in their inbox."
                        : "Email service not configured. Surveys will be logged for testing but not actually sent. Contact your administrator to enable email delivery."
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!sending && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={recipients.length === 0}>
              <Send className="h-4 w-4 mr-2" />
              Send to {recipients.length} Recipients
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
