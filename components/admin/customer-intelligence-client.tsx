"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Star,
  Calendar,
  CreditCard,
  Users,
  MessageSquare,
  Settings,
  Save,
  RotateCcw
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/lib/hooks/use-toast"

interface CustomerIntelligenceClientProps {
  organizationId: string
}

interface HealthScoreSettings {
  health_score_template: 'balanced' | 'engagement_focused' | 'satisfaction_focused' | 'custom'
  health_score_engagement_weight: number
  health_score_nps_weight: number
  health_score_activity_weight: number
  health_score_growth_weight: number
}

interface ChurnRiskSettings {
  churn_risk_template: 'balanced' | 'contract_focused' | 'usage_focused' | 'custom'
  churn_risk_contract_weight: number
  churn_risk_usage_weight: number
  churn_risk_relationship_weight: number
  churn_risk_satisfaction_weight: number
  churn_risk_time_horizon: 30 | 60 | 90
}

const HEALTH_TEMPLATES = {
  balanced: { engagement: 30, nps: 25, activity: 25, growth: 20 },
  engagement_focused: { engagement: 50, nps: 20, activity: 20, growth: 10 },
  satisfaction_focused: { engagement: 20, nps: 50, activity: 15, growth: 15 },
  custom: { engagement: 0, nps: 0, activity: 0, growth: 0 }
}

const CHURN_TEMPLATES = {
  balanced: { contract: 40, usage: 25, relationship: 20, satisfaction: 15 },
  contract_focused: { contract: 60, usage: 15, relationship: 15, satisfaction: 10 },
  usage_focused: { contract: 25, usage: 50, relationship: 15, satisfaction: 10 },
  custom: { contract: 0, usage: 0, relationship: 0, satisfaction: 0 }
}

export function CustomerIntelligenceClient({ organizationId }: CustomerIntelligenceClientProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Health Score Settings
  const [healthSettings, setHealthSettings] = useState<HealthScoreSettings>({
    health_score_template: 'balanced',
    health_score_engagement_weight: 30,
    health_score_nps_weight: 25,
    health_score_activity_weight: 25,
    health_score_growth_weight: 20,
  })

  // Churn Risk Settings
  const [churnSettings, setChurnSettings] = useState<ChurnRiskSettings>({
    churn_risk_template: 'balanced',
    churn_risk_contract_weight: 40,
    churn_risk_usage_weight: 25,
    churn_risk_relationship_weight: 20,
    churn_risk_satisfaction_weight: 15,
    churn_risk_time_horizon: 90,
  })

  // Load current settings
  useEffect(() => {
    loadSettings()
  }, [organizationId])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/customer-intelligence')
      if (response.ok) {
        const data = await response.json()
        if (data.health_settings) {
          setHealthSettings(data.health_settings)
        }
        if (data.churn_settings) {
          setChurnSettings(data.churn_settings)
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast({
        title: "Error",
        description: "Failed to load customer intelligence settings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/customer-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          health_settings: healthSettings,
          churn_settings: churnSettings,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer intelligence settings saved successfully.",
        })
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const applyHealthTemplate = (template: string) => {
    const weights = HEALTH_TEMPLATES[template as keyof typeof HEALTH_TEMPLATES]
    setHealthSettings(prev => ({
      ...prev,
      health_score_template: template as any,
      health_score_engagement_weight: weights.engagement,
      health_score_nps_weight: weights.nps,
      health_score_activity_weight: weights.activity,
      health_score_growth_weight: weights.growth,
    }))
  }

  const applyChurnTemplate = (template: string) => {
    const weights = CHURN_TEMPLATES[template as keyof typeof CHURN_TEMPLATES]
    setChurnSettings(prev => ({
      ...prev,
      churn_risk_template: template as any,
      churn_risk_contract_weight: weights.contract,
      churn_risk_usage_weight: weights.usage,
      churn_risk_relationship_weight: weights.relationship,
      churn_risk_satisfaction_weight: weights.satisfaction,
    }))
  }

  const healthTotal = healthSettings.health_score_engagement_weight + 
                    healthSettings.health_score_nps_weight + 
                    healthSettings.health_score_activity_weight + 
                    healthSettings.health_score_growth_weight

  const churnTotal = churnSettings.churn_risk_contract_weight + 
                    churnSettings.churn_risk_usage_weight + 
                    churnSettings.churn_risk_relationship_weight + 
                    churnSettings.churn_risk_satisfaction_weight

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Health Score Settings skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-64" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        
        {/* Churn Risk Settings skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-36" />
            </div>
            <Skeleton className="h-4 w-88" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-3 w-72" />
              </div>
            ))}
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">Configure scoring algorithms</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="health-scoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="health-scoring">Health Scoring</TabsTrigger>
          <TabsTrigger value="churn-risk">Churn Risk</TabsTrigger>
        </TabsList>

        {/* Health Scoring Tab */}
        <TabsContent value="health-scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                Health Score Configuration
              </CardTitle>
              <CardDescription>
                Configure how customer health scores are calculated. Health scores measure current relationship quality and value realization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Scoring Template</Label>
                <Select value={healthSettings.health_score_template} onValueChange={applyHealthTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="engagement_focused">Engagement Focused</SelectItem>
                    <SelectItem value="satisfaction_focused">Satisfaction Focused</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Weight Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Component Weights</Label>
                  <Badge variant={healthTotal === 100 ? "default" : "destructive"}>
                    Total: {healthTotal}%
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Engagement */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Engagement ({healthSettings.health_score_engagement_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={healthSettings.health_score_engagement_weight}
                      onChange={(e) => setHealthSettings(prev => ({
                        ...prev,
                        health_score_engagement_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">Meetings, calls, email interactions</p>
                  </div>

                  {/* NPS/Satisfaction */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Satisfaction ({healthSettings.health_score_nps_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={healthSettings.health_score_nps_weight}
                      onChange={(e) => setHealthSettings(prev => ({
                        ...prev,
                        health_score_nps_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">NPS scores, survey responses</p>
                  </div>

                  {/* Activity */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Activity ({healthSettings.health_score_activity_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={healthSettings.health_score_activity_weight}
                      onChange={(e) => setHealthSettings(prev => ({
                        ...prev,
                        health_score_activity_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">Product usage, feature adoption</p>
                  </div>

                  {/* Growth */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Growth ({healthSettings.health_score_growth_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={healthSettings.health_score_growth_weight}
                      onChange={(e) => setHealthSettings(prev => ({
                        ...prev,
                        health_score_growth_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">ARR growth, expansion potential</p>
                  </div>
                </div>

                {healthTotal !== 100 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Weights should total 100% for accurate scoring
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Risk Tab */}
        <TabsContent value="churn-risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Churn Risk Configuration
              </CardTitle>
              <CardDescription>
                Configure how churn risk is calculated. Churn risk predicts the likelihood of customer cancellation or non-renewal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Risk Model Template</Label>
                <Select value={churnSettings.churn_risk_template} onValueChange={applyChurnTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="contract_focused">Contract Focused</SelectItem>
                    <SelectItem value="usage_focused">Usage Focused</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Horizon */}
              <div className="space-y-3">
                <Label>Prediction Time Horizon</Label>
                <Select 
                  value={churnSettings.churn_risk_time_horizon.toString()} 
                  onValueChange={(value) => setChurnSettings(prev => ({
                    ...prev,
                    churn_risk_time_horizon: parseInt(value) as 30 | 60 | 90
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days (Immediate Risk)</SelectItem>
                    <SelectItem value="60">60 Days (Short-term Risk)</SelectItem>
                    <SelectItem value="90">90 Days (Medium-term Risk)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Risk Factor Weights */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Risk Factor Weights</Label>
                  <Badge variant={churnTotal === 100 ? "default" : "destructive"}>
                    Total: {churnTotal}%
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contract Risk */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Contract Risk ({churnSettings.churn_risk_contract_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={churnSettings.churn_risk_contract_weight}
                      onChange={(e) => setChurnSettings(prev => ({
                        ...prev,
                        churn_risk_contract_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">Renewal dates, payment issues</p>
                  </div>

                  {/* Usage Risk */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Usage Risk ({churnSettings.churn_risk_usage_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={churnSettings.churn_risk_usage_weight}
                      onChange={(e) => setChurnSettings(prev => ({
                        ...prev,
                        churn_risk_usage_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">Declining usage, adoption issues</p>
                  </div>

                  {/* Relationship Risk */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Relationship Risk ({churnSettings.churn_risk_relationship_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={churnSettings.churn_risk_relationship_weight}
                      onChange={(e) => setChurnSettings(prev => ({
                        ...prev,
                        churn_risk_relationship_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">Engagement decline, stakeholder changes</p>
                  </div>

                  {/* Satisfaction Risk */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Satisfaction Risk ({churnSettings.churn_risk_satisfaction_weight}%)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={churnSettings.churn_risk_satisfaction_weight}
                      onChange={(e) => setChurnSettings(prev => ({
                        ...prev,
                        churn_risk_satisfaction_weight: parseInt(e.target.value) || 0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">NPS detractors, support issues</p>
                  </div>
                </div>

                {churnTotal !== 100 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Weights should total 100% for accurate risk assessment
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}