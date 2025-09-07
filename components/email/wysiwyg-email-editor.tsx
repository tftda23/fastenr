"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Image, 
  Eye, 
  Send, 
  Save,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Type,
  Palette,
  Mail,
  AlertTriangle
} from "lucide-react"

interface EmailTemplate {
  id?: string
  name: string
  subject: string
  content: string
  variables?: string[]
  type: 'survey' | 'engagement' | 'notification' | 'custom'
}

interface EmailRecipient {
  email: string
  name?: string
  variables?: Record<string, string>
}

interface WysiwygEmailEditorProps {
  initialTemplate?: EmailTemplate
  recipients?: EmailRecipient[]
  onSave?: (template: EmailTemplate) => void
  onSend?: (template: EmailTemplate, recipients: EmailRecipient[]) => void
  showSendOptions?: boolean
  organizationName?: string
  logoUrl?: string
  fromEmail?: string
  fromName?: string
}

export default function WysiwygEmailEditor({
  initialTemplate,
  recipients = [],
  onSave,
  onSend,
  showSendOptions = true,
  organizationName = "Customer Success Platform",
  logoUrl,
  fromEmail,
  fromName
}: WysiwygEmailEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>({
    name: initialTemplate?.name || "",
    subject: initialTemplate?.subject || "",
    content: initialTemplate?.content || "<p>Enter your email content here...</p>",
    variables: initialTemplate?.variables || [],
    type: initialTemplate?.type || 'custom'
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState<EmailRecipient | null>(null)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Common email variables that can be used
  const availableVariables = [
    '{{recipient.name}}',
    '{{recipient.email}}', 
    '{{organization.name}}',
    '{{sender.name}}',
    '{{account.name}}',
    '{{current.date}}',
    '{{unsubscribe.url}}'
  ]

  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (contentRef.current) {
      setTemplate(prev => ({ ...prev, content: contentRef.current!.innerHTML }))
    }
  }, [])

  const insertVariable = useCallback((variable: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const span = document.createElement('span')
      span.style.backgroundColor = '#e3f2fd'
      span.style.padding = '2px 4px'
      span.style.borderRadius = '3px'
      span.style.color = '#1976d2'
      span.textContent = variable
      range.deleteContents()
      range.insertNode(span)
      selection.removeAllRanges()
    }
    
    if (contentRef.current) {
      setTemplate(prev => ({ ...prev, content: contentRef.current!.innerHTML }))
    }
  }, [])

  const processTemplate = (content: string, recipient?: EmailRecipient): string => {
    let processed = content
    
    // Replace common variables
    processed = processed.replace(/\{\{recipient\.name\}\}/g, recipient?.name || 'Customer')
    processed = processed.replace(/\{\{recipient\.email\}\}/g, recipient?.email || 'customer@example.com')
    processed = processed.replace(/\{\{organization\.name\}\}/g, organizationName)
    processed = processed.replace(/\{\{current\.date\}\}/g, new Date().toLocaleDateString())
    
    // Replace custom variables if provided
    if (recipient?.variables) {
      Object.entries(recipient.variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
        processed = processed.replace(regex, value)
      })
    }
    
    return processed
  }

  const generateEmailHtml = (content: string, recipient?: EmailRecipient): string => {
    const processedContent = processTemplate(content, recipient)
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.subject}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white; 
              padding: 20px; 
              border-radius: 8px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 1px solid #eee; 
            }
            .logo { 
              max-width: 150px; 
              height: auto; 
              margin-bottom: 20px; 
            }
            .content { 
              margin-bottom: 30px; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo">` : ''}
              <h1>${organizationName}</h1>
            </div>
            
            <div class="content">
              ${processedContent}
            </div>
            
            <div class="footer">
              <p>This email was sent by ${organizationName}</p>
              <p>If you no longer wish to receive these emails, you can <a href="{{unsubscribe.url}}">unsubscribe at any time</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  const handleSave = async () => {
    if (!template.name.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for this email template",
        variant: "destructive"
      })
      return
    }

    if (!template.subject.trim()) {
      toast({
        title: "Subject required", 
        description: "Please enter a subject for this email",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      await onSave?.(template)
      toast({
        title: "Template saved",
        description: "Email template has been saved successfully"
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save email template",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!template.subject.trim() || !template.content.trim()) {
      toast({
        title: "Complete the email",
        description: "Please add both subject and content before sending",
        variant: "destructive"
      })
      return
    }

    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient",
        variant: "destructive"
      })
      return
    }

    setIsSending(true)
    try {
      await onSend?.(template, recipients)
      toast({
        title: "Email sent",
        description: `Email sent to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`
      })
      setShowSendConfirm(false)
    } catch (error) {
      toast({
        title: "Send failed",
        description: "Failed to send email",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Weekly Check-in Email"
              />
            </div>
            <div>
              <Label htmlFor="template-type">Type</Label>
              <select 
                id="template-type"
                value={template.type}
                onChange={(e) => setTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="custom">Custom</option>
                <option value="survey">Survey</option>
                <option value="engagement">Engagement</option>
                <option value="notification">Notification</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={template.subject}
              onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Weekly check-in: How are things going?"
            />
          </div>
        </CardContent>
      </Card>

      {/* Editor Toolbar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Email Content</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={previewMode}
                onCheckedChange={setPreviewMode}
                id="preview-mode"
              />
              <Label htmlFor="preview-mode">Preview</Label>
              
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Email Preview</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email Details</Label>
                      <div className="p-3 bg-muted rounded space-y-2">
                        <div><strong>From:</strong> {fromName || organizationName} &lt;{fromEmail || 'notifications@yourdomain.com'}&gt;</div>
                        <div><strong>Subject:</strong> {template.subject}</div>
                      </div>
                    </div>
                    <div>
                      <Label>Content Preview</Label>
                      <div 
                        className="border rounded p-4 min-h-[300px] bg-white"
                        dangerouslySetInnerHTML={{ 
                          __html: generateEmailHtml(template.content, selectedRecipient || recipients[0]) 
                        }}
                      />
                    </div>
                    {recipients.length > 0 && (
                      <div>
                        <Label>Preview for recipient:</Label>
                        <select 
                          value={selectedRecipient?.email || ''} 
                          onChange={(e) => {
                            const recipient = recipients.find(r => r.email === e.target.value)
                            setSelectedRecipient(recipient || null)
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Select recipient...</option>
                          {recipients.map(recipient => (
                            <option key={recipient.email} value={recipient.email}>
                              {recipient.name || recipient.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!previewMode ? (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border rounded bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('bold')}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('italic')}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('underline')}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('justifyLeft')}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('justifyCenter')}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('justifyRight')}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('insertUnorderedList')}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText('insertOrderedList')}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                
                <div className="w-px h-6 bg-border mx-1" />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = prompt('Enter URL:')
                    if (url) formatText('createLink', url)
                  }}
                  title="Add Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>

              {/* Variable Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Insert Variables:</Label>
                <div className="flex flex-wrap gap-1">
                  {availableVariables.map(variable => (
                    <Button
                      key={variable}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(variable)}
                      className="text-xs"
                    >
                      {variable}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div
                ref={contentRef}
                contentEditable
                className="min-h-[300px] p-4 border rounded-md bg-white focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none"
                dangerouslySetInnerHTML={{ __html: template.content }}
                onBlur={() => {
                  if (contentRef.current) {
                    setTemplate(prev => ({ ...prev, content: contentRef.current!.innerHTML }))
                  }
                }}
                style={{ minHeight: '300px' }}
              />
            </div>
          ) : (
            <div 
              className="border rounded p-4 min-h-[300px] bg-white"
              dangerouslySetInnerHTML={{ 
                __html: generateEmailHtml(template.content, selectedRecipient || recipients[0]) 
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Recipients Info */}
      {recipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recipients ({recipients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recipients.slice(0, 10).map((recipient, index) => (
                <Badge key={index} variant="secondary">
                  {recipient.name || recipient.email}
                </Badge>
              ))}
              {recipients.length > 10 && (
                <Badge variant="outline">+{recipients.length - 10} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
        
        {showSendOptions && recipients.length > 0 && (
          <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirm Email Send
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>You are about to send this email to {recipients.length} recipient{recipients.length > 1 ? 's' : ''}:</p>
                
                <div className="bg-muted p-3 rounded">
                  <strong>Subject:</strong> {template.subject}
                </div>
                
                <div className="max-h-32 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="text-sm">
                      • {recipient.name || recipient.email}
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. Please review your email content carefully before proceeding.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}