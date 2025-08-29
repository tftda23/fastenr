"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Save, Moon, Sun, Monitor, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserPreferences {
  theme: string
  timezone: string
  display_name: string
  email_notifications: boolean
}

interface UserSettingsClientProps {
  userId: string
  organizationId: string
}

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
]

export default function UserSettingsClient({ userId, organizationId }: UserSettingsClientProps) {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    timezone: "UTC",
    display_name: "",
    email_notifications: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [userId, organizationId])

  // Sync the current theme from next-themes with local state
  useEffect(() => {
    if (theme && theme !== preferences.theme) {
      setPreferences(prev => ({ ...prev, theme }))
    }
  }, [theme])

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading preferences:", error)
        return
      }

      if (data) {
        setPreferences({
          theme: (data as any).theme || "system",
          timezone: (data as any).timezone || "UTC",
          display_name: (data as any).display_name || "",
          email_notifications: (data as any).email_notifications ?? true,
        })
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const { error } = await (supabase as any).from("user_preferences").upsert(
        {
          user_id: userId,
          organization_id: organizationId,
          theme: preferences.theme,
          timezone: preferences.timezone,
          display_name: preferences.display_name,
          email_notifications: preferences.email_notifications,
        },
        {
          onConflict: "user_id,organization_id",
        },
      )

      if (error) {
        console.error("Error saving preferences:", error)
        toast.error("Failed to save preferences")
        return
      }

      // Apply theme change immediately
      setTheme(preferences.theme)
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setPreferences((prev) => ({ ...prev, theme: newTheme }))
  }

  if (loading) {
    return <div className="space-y-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and display preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={preferences.display_name}
              onChange={(e) => setPreferences((prev) => ({ ...prev, display_name: e.target.value }))}
              placeholder="Enter your display name"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Monitor className="h-5 w-5 mr-2" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the application looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-3">
              <Button
                variant={preferences.theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={preferences.theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={preferences.theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => handleThemeChange("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Regional Settings
          </CardTitle>
          <CardDescription>Configure timezone and regional preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive email updates about your accounts and activities</p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, email_notifications: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
