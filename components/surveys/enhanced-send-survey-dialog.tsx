"use client"

import { useState, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  Users, 
  Plus, 
  X, 
  Upload, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  AlertTriangle,
  FileText,
  Edit
} from "lucide-react"
import { sendSurvey } from "@/lib/surveys"
import { useToast } from "@/lib/hooks/use-toast"
import WysiwygEmailEditor from "@/components/email/wysiwyg-email-editor"

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

export default function EnhancedSendSurveyDialog({ survey, open, onOpenChange }: SendSurveyDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState("simple")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipientEmail, setNewRecipientEmail] = useState("")
  const [newRecipientName, setNewRecipientName] = useState("")
  const [emailList, setEmailList] = useState("")
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null)
  const [emailTemplate, setEmailTemplate] = useState<{
    name: string;
    subject: string;
    content: string;
    type: 'survey' | 'engagement' | 'notification' | 'custom';
  }>({
    name: `Survey Email - ${survey?.title || 'Untitled'}`,
    subject: survey?.subject || "We'd love your feedback",
    content: survey?.content || "Hi {{recipient.name}},\n\nWe'd love to get your feedback. Please take a moment to complete our survey.\n\nThank you!",
    type: 'survey'
  })
  const [emailSettings, setEmailSettings] = useState<any>(null)
  const [organizationId, setOrganizationId] = useState<string>('')

  // Load organization ID
  useEffect(() => {
    const loadOrganizationId = async () => {
      try {
        const response = await fetch('/api/debug/org')
        if (response.ok) {
          const data = await response.json()
          setOrganizationId(data.organization_id || '')
        }
      } catch (error) {
        console.error('Failed to load organization ID:', error)
      }
    }
    loadOrganizationId()
  }, [])

  // Load email settings
  useEffect(() => {
    const loadEmailSettings = async () => {
      try {
        const response = await fetch("/api/email/settings")
        if (response.ok) {
          const result = await response.json()
          setEmailSettings(result.data)
        }
      } catch (error) {
        console.error("Error loading email settings:", error)
      }
    }
    loadEmailSettings()
  }, [])

  if (!survey) return null

  const addRecipient = () => {
    if (newRecipientEmail) {
      const recipient: Recipient = {
        id: Date.now().toString(),
        email: newRecipientEmail,
        name: newRecipientName || undefined,
      }
      setRecipients([...recipients, recipient])
      setNewRecipientEmail("")
      setNewRecipientName("")
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

  const handleSendSurvey = async (template?: any, recipientList?: any[]) => {
    if (!survey) return
    
    const finalRecipients = recipientList || recipients
    if (finalRecipients.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please add at least one recipient",
        variant: "destructive"
      })
      return
    }

    setSending(true)
    setProgress(0)
    setResults(null)

    try {
      const emailData = template || emailTemplate
      
      const result = await sendSurvey(
        survey.id,
        finalRecipients.map(r => ({ id: r.id, email: r.email, name: r.name })),
        organizationId
      )

      // Map the result to match the expected state type
      setResults({
        sent: result.sent_count,
        failed: result.failed_count
      })
      setProgress(100)

      if (result.sent_count > 0) {
        toast({
          title: "Survey Sent Successfully",
          description: `Survey sent to ${result.sent_count} recipients${result.failed_count > 0 ? ` (${result.failed_count} failed)` : ''}`,
          variant: result.failed_count > 0 ? "destructive" : "default",
        })
      }

      // Reset form after successful send
      if (result.failed_count === 0) {
        setTimeout(() => {
          onOpenChange(false)
          setRecipients([])
          setSending(false)
          setProgress(0)
          setResults(null)
          setActiveTab("simple")
        }, 2000)
      }
    } catch (error) {
      console.error('Error sending survey:', error)
      toast({
        title: "Send Failed",
        description: "Failed to send survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addRecipient()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Survey: {survey?.title}
          </DialogTitle>
          <DialogDescription>
            Send your survey to customers and collect valuable feedback
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Simple Mode
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Advanced Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-6">
            {/* Recipients Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recipients ({recipients.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Individual Recipient */}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Email address"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    type="email"
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={addRecipient} disabled={!newRecipientEmail}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Bulk Add */}
                <div className="space-y-2">
                  <Label>Or paste multiple emails (comma or newline separated):</Label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="email1@example.com, email2@example.com"
                      value={emailList}
                      onChange={(e) => setEmailList(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button onClick={parseEmailList} disabled={!emailList.trim()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>

                {/* Recipients List */}
                {recipients.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recipients:</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {recipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{recipient.name || "No Name"}</Badge>
                            <span className="text-sm">{recipient.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipient(recipient.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Simple Email Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Content
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("advanced")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Advanced Editor
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailTemplate.subject}
                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="We'd love your feedback!"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-content">Email Content</Label>
                  <Textarea
                    id="email-content"
                    value={emailTemplate.content}
                    onChange={(e) => setEmailTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Hi {{recipient.name}}, we'd love to get your feedback..."
                    rows={8}
                    className="min-h-[200px]"
                  />
                  <div className="text-xs text-muted-foreground">
                    Available variables: {"{"}{"{"} recipient.name {"}"} {"}"}, {"{"}{"{"} recipient.email {"}"} {"}"}, {"{"}{"{"} organization.name {"}"} {"}"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simple Mode Footer */}
            <div className="flex flex-col space-y-4">
              {results && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {results.sent > 0 && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {results.failed > 0 && <AlertCircle className="h-5 w-5 text-red-600" />}
                    <span className="font-medium">
                      Sent: {results.sent} | Failed: {results.failed}
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              
              {recipients.length === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Please add at least one recipient before sending
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={sending}
                  className="flex-1"
                >
                  {results?.failed === 0 && results?.sent > 0 ? "Close" : "Cancel"}
                </Button>
                <Button 
                  onClick={() => handleSendSurvey()}
                  disabled={sending || recipients.length === 0 || !emailTemplate.subject || !emailTemplate.content}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Survey ({recipients.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-4">
              {/* Recipients summary for advanced mode */}
              {recipients.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Recipients: {recipients.length}</span>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setActiveTab("simple")}
                        className="h-auto p-0"
                      >
                        (edit recipients)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <WysiwygEmailEditor
                initialTemplate={emailTemplate}
                recipients={recipients.map(r => ({ email: r.email, name: r.name }))}
                onSave={(template) => {
                  setEmailTemplate(template)
                  toast({
                    title: "Email Updated",
                    description: "Survey email has been customized"
                  })
                }}
                onSend={(template, recipientList) => handleSendSurvey(template, recipientList)}
                showSendOptions={recipients.length > 0}
                organizationName={emailSettings?.organization_name || "Fastenr"}
                logoUrl={emailSettings?.logo_url}
                fromEmail={emailSettings?.from_email}
                fromName={emailSettings?.from_name}
              />

              {recipients.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    No recipients added yet. 
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setActiveTab("simple")}
                      className="h-auto p-0 ml-1"
                    >
                      Switch to simple mode to add recipients
                    </Button>
                  </span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}