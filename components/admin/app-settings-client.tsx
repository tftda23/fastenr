"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cog, Save, RefreshCw, Slack, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import IntegrationsClient from "./integrations-client"

interface AppSettingsClientProps {
  organizationId: string
}

interface AppSettings {
  id?: string
  organization_id: string
  organization_name?: string
  timezone?: string
  description?: string
  email_notifications_enabled?: boolean
  slack_integration_enabled?: boolean
  automated_health_scoring_enabled?: boolean
  api_access_enabled?: boolean
  data_retention_period?: string
  backup_frequency?: string
  gdpr_compliance_enabled?: boolean
  slack_webhook_url?: string
  slack_default_channel?: string
  slack_notification_types?: string[]
}

export default function AppSettingsClient({ organizationId }: AppSettingsClientProps) {
  const [settings, setSettings] = useState<AppSettings>({
    organization_id: organizationId,
    organization_name: "",
    timezone: "UTC",
    description: "",
    email_notifications_enabled: true,
    slack_integration_enabled: false,
    automated_health_scoring_enabled: true,
    api_access_enabled: true,
    data_retention_period: "2years",
    backup_frequency: "daily",
    gdpr_compliance_enabled: true,
    slack_webhook_url: "",
    slack_default_channel: "",
    slack_notification_types: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/app-settings")
      if (!response.ok) {
        throw new Error("Failed to load settings")
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/app-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      
      toast({
        title: "Success",
        description: "Settings saved successfully"
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setSettings({
      ...settings,
      organization_name: "",
      timezone: "UTC",
      description: "",
      email_notifications_enabled: true,
      slack_integration_enabled: false,
      automated_health_scoring_enabled: true,
      api_access_enabled: true,
      data_retention_period: "2years",
      backup_frequency: "daily",
      gdpr_compliance_enabled: true,
      slack_webhook_url: "",
      slack_default_channel: "",
      slack_notification_types: []
    })
  }

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General Settings</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="slack">Slack Setup</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cog className="h-5 w-5 mr-2" />
              Organization Settings
            </CardTitle>
            <CardDescription>Configure your organization preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input 
                  id="org-name" 
                  value={settings.organization_name || ""} 
                  onChange={(e) => updateSetting("organization_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.timezone || "UTC"} 
                  onValueChange={(value) => updateSetting("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/Berlin">Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your organization..."
                value={settings.description || ""}
                onChange={(e) => updateSetting("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Settings</CardTitle>
            <CardDescription>Enable or disable application features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Send email alerts for important events</p>
              </div>
              <Switch 
                checked={settings.email_notifications_enabled || false}
                onCheckedChange={(checked) => updateSetting("email_notifications_enabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium flex items-center">
                  Slack Integration
                  {!settings.slack_integration_enabled && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Setup Required
                    </span>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Post updates to Slack channels
                  {!settings.slack_integration_enabled && (
                    <span className="block text-xs text-blue-600 mt-1">
                      Configure in Slack Setup tab to enable
                    </span>
                  )}
                </p>
              </div>
              <Switch 
                checked={settings.slack_integration_enabled || false}
                onCheckedChange={(checked) => updateSetting("slack_integration_enabled", checked)}
                disabled={!settings.slack_webhook_url && !settings.slack_default_channel}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automated Health Scoring</h4>
                <p className="text-sm text-muted-foreground">Calculate health scores automatically</p>
              </div>
              <Switch 
                checked={settings.automated_health_scoring_enabled || false}
                onCheckedChange={(checked) => updateSetting("automated_health_scoring_enabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">API Access</h4>
                <p className="text-sm text-muted-foreground">Allow external API connections</p>
              </div>
              <Switch 
                checked={settings.api_access_enabled || false}
                onCheckedChange={(checked) => updateSetting("api_access_enabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage data retention and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention Period</Label>
                <Select 
                  value={settings.data_retention_period || "2years"}
                  onValueChange={(value) => updateSetting("data_retention_period", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup">Backup Frequency</Label>
                <Select 
                  value={settings.backup_frequency || "daily"}
                  onValueChange={(value) => updateSetting("backup_frequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">GDPR Compliance</h4>
                <p className="text-sm text-muted-foreground">Enable GDPR data protection features</p>
              </div>
              <Switch 
                checked={settings.gdpr_compliance_enabled || false}
                onCheckedChange={(checked) => updateSetting("gdpr_compliance_enabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="slack" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Slack className="h-5 w-5 mr-2" />
              Slack Integration Setup
            </CardTitle>
            <CardDescription>
              Configure Slack integration for automated notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!settings.slack_integration_enabled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Slack Integration Disabled</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Complete the setup below and enable the integration in General Settings to start receiving Slack notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slack_webhook_url || ""}
                onChange={(e) => updateSetting("slack_webhook_url", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Create a webhook URL in your Slack workspace settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack-channel">Default Channel</Label>
              <Input
                id="slack-channel"
                placeholder="#customer-success"
                value={settings.slack_default_channel || ""}
                onChange={(e) => updateSetting("slack_default_channel", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Default channel for notifications (include the # symbol)
              </p>
            </div>

            <div className="space-y-3">
              <Label>Notification Types</Label>
              <div className="space-y-2">
                {[
                  { id: "health_score_changes", label: "Health Score Changes", description: "When account health scores change significantly" },
                  { id: "churn_risk_alerts", label: "Churn Risk Alerts", description: "When accounts are flagged as high churn risk" },
                  { id: "engagement_updates", label: "Engagement Updates", description: "New customer engagements and interactions" },
                  { id: "goal_achievements", label: "Goal Achievements", description: "When customers reach important milestones" },
                  { id: "survey_responses", label: "Survey Responses", description: "New NPS and satisfaction survey responses" }
                ].map((notificationType) => (
                  <div key={notificationType.id} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={notificationType.id}
                      checked={(settings.slack_notification_types || []).includes(notificationType.id)}
                      onChange={(e) => {
                        const currentTypes = settings.slack_notification_types || []
                        if (e.target.checked) {
                          updateSetting("slack_notification_types", [...currentTypes, notificationType.id])
                        } else {
                          updateSetting("slack_notification_types", currentTypes.filter(t => t !== notificationType.id))
                        }
                      }}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor={notificationType.id} className="text-sm font-medium cursor-pointer">
                        {notificationType.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{notificationType.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Setup Instructions</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to your Slack workspace settings</li>
                <li>Navigate to "Apps" → "Incoming Webhooks"</li>
                <li>Create a new webhook for your desired channel</li>
                <li>Copy the webhook URL and paste it above</li>
                <li>Select which notifications you want to receive</li>
                <li>Save settings and enable the integration</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Slack Settings"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="integrations">
        <IntegrationsClient organizationId={organizationId} />
      </TabsContent>
    </Tabs>
  )
}
