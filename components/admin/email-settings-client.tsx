"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/lib/hooks/use-toast"
import { Mail, Send, Plus, Edit, Trash2, Eye, FileText, Settings, Users, AlertTriangle, Globe, Loader2 } from "lucide-react"
import WysiwygEmailEditor from "@/components/email/wysiwyg-email-editor"
import DomainManagementClient from "@/components/admin/domain-management-client"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'survey' | 'engagement' | 'notification' | 'custom'
  created_at: string
  updated_at: string
}

export default function EmailSettingsClient() {
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [emailSettings, setEmailSettings] = useState({
    from_email: '',
    from_name: '',
    reply_to_email: '',
    logo_url: '',
    organization_name: ''
  })
  const [domainInfo, setDomainInfo] = useState({
    activeDomain: 'fastenr.co',
    isUsingCustomDomain: false,
    availablePrefix: 'noreply'
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTemplates()
    loadEmailSettings()
  }, [])

  const loadEmailSettings = async () => {
    try {
      const response = await fetch("/api/email/settings")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setEmailSettings({
            from_email: result.data.from_email || '',
            from_name: result.data.from_name || '',
            reply_to_email: result.data.reply_to_email || '',
            logo_url: result.data.logo_url || '',
            organization_name: result.data.organization_name || ''
          })
        }
        if (result.meta) {
          setDomainInfo({
            activeDomain: result.meta.activeDomain,
            isUsingCustomDomain: result.meta.isUsingCustomDomain,
            availablePrefix: result.meta.availablePrefix
          })
        }
      }
    } catch (error) {
      console.error("Error loading email settings:", error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const saveEmailSettings = async () => {
    setSettingsSaving(true)
    try {
      const response = await fetch("/api/email/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailSettings)
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Email settings have been saved successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save email settings",
        variant: "destructive"
      })
    } finally {
      setSettingsSaving(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch("/api/email/templates")
      if (response.ok) {
        const result = await response.json()
        setTemplates(result.data || [])
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (template: any) => {
    try {
      const url = editingTemplate ? `/api/email/templates/${editingTemplate.id}` : "/api/email/templates"
      const method = editingTemplate ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        await loadTemplates()
        setShowCreateTemplate(false)
        setEditingTemplate(null)
        toast({
          title: "Template saved",
          description: "Email template has been saved successfully"
        })
      } else {
        throw new Error("Failed to save template")
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save email template",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/email/templates/${templateId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await loadTemplates()
        toast({
          title: "Template deleted",
          description: "Email template has been deleted successfully"
        })
      } else {
        throw new Error("Failed to delete template")
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete email template",
        variant: "destructive"
      })
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the test email to",
        variant: "destructive"
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          testType: "send", 
          testEmail: testEmail 
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        toast({
          title: result.mock ? "Test Email Logged" : "Test Email Sent",
          description: result.message,
          variant: result.sent || result.mock ? "default" : "destructive"
        })
      } else {
        throw new Error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast({
        title: "Test Failed",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-muted-foreground">Manage email templates, test delivery, and configure settings</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="test">Test Email</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Templates Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Email Templates</h2>
              <p className="text-muted-foreground">Create and manage reusable email templates</p>
            </div>
            <Button onClick={() => setShowCreateTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Templates List */}
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No templates yet</h3>
                    <p className="text-muted-foreground">Create your first email template to get started</p>
                    <Button onClick={() => setShowCreateTemplate(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {template.name}
                          <Badge variant="secondary">{template.type}</Badge>
                        </CardTitle>
                        <CardDescription>{template.subject}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTemplate(template)
                            setShowCreateTemplate(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Create/Edit Template Dialog */}
          <Dialog open={showCreateTemplate} onOpenChange={(open) => {
            if (!open) {
              setShowCreateTemplate(false)
              setEditingTemplate(null)
            }
          }}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Email Template" : "Create Email Template"}
                </DialogTitle>
              </DialogHeader>
              <WysiwygEmailEditor
                initialTemplate={editingTemplate || undefined}
                onSave={handleSaveTemplate}
                showSendOptions={false}
                organizationName="Fastenr"
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure your email delivery settings and sender information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from_email">From Email</Label>
                      <div className="flex">
                        <Input 
                          id="from_email"
                          placeholder="noreply" 
                          value={emailSettings.from_email.split('@')[0] || ''}
                          onChange={(e) => {
                            const prefix = e.target.value.replace(/[^a-zA-Z0-9._-]/g, '')
                            setEmailSettings(prev => ({ 
                              ...prev, 
                              from_email: `${prefix}@${domainInfo.activeDomain}` 
                            }))
                          }}
                          className="rounded-r-none"
                        />
                        <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r text-sm text-gray-600 flex items-center">
                          @{domainInfo.activeDomain}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {domainInfo.isUsingCustomDomain 
                          ? `Using your custom domain: ${domainInfo.activeDomain}` 
                          : 'Using default Fastenr domain (add custom domain to change)'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from_name">From Name</Label>
                      <Input 
                        id="from_name"
                        placeholder="Your Company Name" 
                        value={emailSettings.from_name}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, from_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reply_to_email">Reply-To Email</Label>
                    <div className="flex">
                      <Input 
                        id="reply_to_email"
                        placeholder="support" 
                        value={emailSettings.reply_to_email.split('@')[0] || ''}
                        onChange={(e) => {
                          const prefix = e.target.value.replace(/[^a-zA-Z0-9._-]/g, '')
                          setEmailSettings(prev => ({ 
                            ...prev, 
                            reply_to_email: `${prefix}@${domainInfo.activeDomain}` 
                          }))
                        }}
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r text-sm text-gray-600 flex items-center">
                        @{domainInfo.activeDomain}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Domain is locked to your organization's email domain
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization_name">Organization Name</Label>
                    <Input 
                      id="organization_name"
                      placeholder="Your Company Name" 
                      value={emailSettings.organization_name}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, organization_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Organization Logo URL</Label>
                    <Input 
                      id="logo_url"
                      type="url"
                      placeholder="https://yourcompany.com/logo.png" 
                      value={emailSettings.logo_url}
                      onChange={(e) => setEmailSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                    />
                    {emailSettings.logo_url && (
                      <div className="mt-2">
                        <img 
                          src={emailSettings.logo_url} 
                          alt="Logo preview" 
                          className="h-12 w-auto border rounded" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Only administrators can modify email settings
                      </div>
                      <Button 
                        onClick={saveEmailSettings} 
                        disabled={settingsSaving}
                        className="w-full md:w-auto"
                      >
                        {settingsSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Domain Management
              </CardTitle>
              <CardDescription>
                Manage your Resend domains for sending emails from your custom domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DomainManagementClient />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          {/* Configuration Debug */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Email Configuration Status
              </CardTitle>
              <CardDescription>
                Check your email configuration and troubleshoot issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/email/debug')
                    const debug = await response.json()
                    console.log('Email Debug Info:', debug)
                    
                    let message = 'Debug info logged to console. Check:\n'
                    if (debug.recommendations) {
                      debug.recommendations.forEach((rec: any) => {
                        message += `• ${rec.title}: ${rec.message}\n`
                      })
                    }
                    
                    toast({
                      title: "Debug Info",
                      description: message,
                      variant: debug.recommendations?.some((r: any) => r.level === 'error') ? 'destructive' : 'default'
                    })
                  } catch (error) {
                    toast({
                      title: "Debug Failed", 
                      description: "Could not fetch debug information",
                      variant: "destructive"
                    })
                  }
                }}
                className="w-full mb-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                Check Email Configuration
              </Button>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Common Issues:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Missing RESEND_API_KEY in environment variables</li>
                  <li>FROM email address not verified in Resend</li>
                  <li>No verified domains in your Resend account</li>
                  <li>Invalid or expired API key</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test Email Sending */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Test Email
              </CardTitle>
              <CardDescription>
                Send a test email to verify your email delivery is working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={sendTestEmail} 
                disabled={testing || !testEmail}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {testing ? "Sending..." : "Send Test Email"}
              </Button>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>💡 <strong>Tip:</strong> If test emails fail, use "Check Email Configuration" above to diagnose issues.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}