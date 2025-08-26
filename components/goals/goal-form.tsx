"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, TrendingUp, Target, Calendar, Trash2, Users } from "lucide-react"
import type { CustomerGoal, Account, MetricSuggestions } from "@/lib/types"

type GoalType = "customer" | "organization"

interface GoalFormProps {
  accounts: Account[]
  onGoalCreated: (goal: CustomerGoal & { accounts: { name: string } }) => void
  onCancel: () => void

  /** Optional: edit mode */
  goalToEdit?: (CustomerGoal & { accounts?: { name: string } | null }) | null
  onGoalUpdated?: (goal: CustomerGoal & { accounts: { name: string } | null }) => void
  onGoalDeleted?: (goalId: string) => void

  /** From the tab: "organization" when Team tab is open, else "customer" */
  defaultGoalType?: GoalType
}

export function GoalForm({
  accounts,
  onGoalCreated,
  onCancel,
  goalToEdit,
  onGoalUpdated,
  onGoalDeleted,
  defaultGoalType = "customer",
}: GoalFormProps) {
  const isEditing = !!goalToEdit

  const [loading, setLoading] = useState(false)
  const [metricSuggestions, setMetricSuggestions] = useState<MetricSuggestions | null>(null)
  const [goalType, setGoalType] = useState<GoalType>(goalToEdit?.goal_type ?? defaultGoalType)

  const [formData, setFormData] = useState({
    title: goalToEdit?.title ?? "",
    description: goalToEdit?.description ?? "",
    account_id: goalToEdit?.account_id ?? "",
    metric_type: (goalToEdit?.metric_type ??
      "") as
      | "accounts"
      | "arr"
      | "nps"
      | "health_score"
      | "adoption"
      | "renewals"
      | "seat_count"
      | "custom"
      | "",
    current_value: goalToEdit?.current_value?.toString?.() ?? "",
    target_value: goalToEdit?.target_value?.toString?.() ?? "",
    unit: goalToEdit?.unit ?? "",
    measurement_period: (goalToEdit?.measurement_period ?? "") as
      | "daily"
      | "weekly"
      | "monthly"
      | "quarterly"
      | "yearly"
      | "",
    target_date: goalToEdit?.target_date
      ? new Date(goalToEdit.target_date).toISOString().slice(0, 10)
      : "",
    status: (goalToEdit?.status ?? "on_track") as "on_track" | "at_risk" | "achieved" | "missed",
  })

  // Keep goal type in sync if the edit target changes or default changes
  useEffect(() => {
    setGoalType(goalToEdit?.goal_type ?? defaultGoalType)
  }, [goalToEdit?.goal_type, defaultGoalType])

  // If switching to organization goals, clear account_id
  useEffect(() => {
    if (goalType === "organization" && formData.account_id) {
      setFormData((p) => ({ ...p, account_id: "" }))
    }
  }, [goalType]) // eslint-disable-line react-hooks/exhaustive-deps

  // Pull metric suggestions once an account is selected
  useEffect(() => {
    if (formData.account_id) {
      fetchMetricSuggestions(formData.account_id)
    } else {
      setMetricSuggestions(null)
    }
  }, [formData.account_id])

  // Auto-fill current value/unit for known metric types
  useEffect(() => {
    if (metricSuggestions && formData.metric_type) {
      let currentValue = ""
      let unit = formData.unit

      switch (formData.metric_type) {
        case "arr":
          currentValue = metricSuggestions.currentARR.toString()
          unit = unit || "dollars"
          break
        case "health_score":
          currentValue = metricSuggestions.currentHealthScore.toString()
          unit = unit || "score"
          break
        case "nps":
          currentValue = metricSuggestions.currentNPS.toString()
          unit = unit || "score"
          break
        case "adoption":
          currentValue = metricSuggestions.currentAdoption.toString()
          unit = unit || "percentage"
          break
      }

      setFormData((prev) => ({ ...prev, current_value: currentValue, unit }))
    }
  }, [formData.metric_type, metricSuggestions]) // eslint-disable-line react-hooks/exhaustive-deps

  const metricTypeOptions = useMemo(
    () => [
      { value: "arr", label: "Annual Recurring Revenue", icon: TrendingUp, unit: "dollars" },
      { value: "health_score", label: "Health Score", icon: Target, unit: "score" },
      { value: "nps", label: "Net Promoter Score", icon: Target, unit: "score" },
      { value: "adoption", label: "Feature Adoption", icon: TrendingUp, unit: "percentage" },
      { value: "renewals", label: "Renewal Rate", icon: Calendar, unit: "percentage" },
      { value: "seat_count", label: "Seat Count", icon: TrendingUp, unit: "count" },
      { value: "custom", label: "Custom Metric", icon: Target, unit: "custom" },
    ],
    [],
  )

  const fetchMetricSuggestions = async (accountId: string) => {
    try {
      const response = await fetch(`/api/goals/metrics?accountId=${accountId}`)
      if (response.ok) {
        const suggestions = await response.json()
        setMetricSuggestions(suggestions)
      }
    } catch (error) {
      console.error("Error fetching metric suggestions:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build payload respecting team vs customer rules
      const payload: any = {
        ...formData,
        goal_type: goalType,
        target_value: formData.target_value ? Number.parseFloat(formData.target_value) : null,
        current_value: formData.current_value ? Number.parseFloat(formData.current_value) : 0,
        metric_type: formData.metric_type || null,
        unit: formData.unit || null,
        measurement_period: formData.measurement_period || null,
      }

      if (goalType === "organization") {
        payload.account_id = null
      } else if (!payload.account_id) {
        alert("Please select an account for a customer goal.")
        setLoading(false)
        return
      }

      let result: any
      if (isEditing && goalToEdit?.id) {
        // UPDATE
        const res = await fetch(`/api/goals/${goalToEdit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to update goal")
        result = await res.json()

        const selectedAccount =
          accounts.find((a) => a.id === (result.data?.account_id ?? "")) ?? null

        const updatedGoal = {
          ...result.data,
          accounts: selectedAccount ? { name: selectedAccount.name } : null,
        }

        if (onGoalUpdated) onGoalUpdated(updatedGoal)
      } else {
        // CREATE
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error("Failed to create goal")
        result = await res.json()

        const selectedAccount =
          accounts.find((a) => a.id === (result.data?.account_id ?? "")) ?? null

        onGoalCreated({
          ...result.data,
          accounts: { name: selectedAccount?.name || "—" },
        })
      }

      onCancel()
    } catch (error) {
      console.error(isEditing ? "Error updating goal:" : "Error creating goal:", error)
      alert(isEditing ? "Failed to update goal. Please try again." : "Failed to create goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing || !goalToEdit?.id) return
    if (!confirm("Delete this goal? This cannot be undone.")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/goals/${goalToEdit.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete goal")
      onGoalDeleted?.(goalToEdit.id)
      onCancel()
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Failed to delete goal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEditing ? "Edit Goal" : "Create Metric-Based Goal"}</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update your goal details and targets"
                  : "Set a data-driven goal with measurable targets using fastenr"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type (Customer / Team) */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={goalType === "customer" ? "default" : "outline"}
                onClick={() => setGoalType("customer")}
                className="w-full"
              >
                Customer goal
              </Button>
              <Button
                type="button"
                variant={goalType === "organization" ? "default" : "outline"}
                onClick={() => setGoalType("organization")}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Team goal
              </Button>
            </div>

            {/* Account (only when Customer goal) */}
            {goalType === "customer" && (
              <div>
                <Label htmlFor="account">Account</Label>
                <Select
                  value={formData.account_id}
                  onValueChange={(value) => setFormData({ ...formData, account_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
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
            )}

            <div>
              <Label htmlFor="metric_type">Metric Type</Label>
              <Select
                value={formData.metric_type}
                onValueChange={(value: any) => setFormData({ ...formData, metric_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a metric to track" />
                </SelectTrigger>
                <SelectContent>
                  {metricTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Increase ARR to $50K by Q4"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the goal, success criteria, and action plan"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_value">Current Value</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  type="number"
                  step="0.01"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., dollars, %"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measurement_period">Measurement Period</Label>
                <Select
                  value={formData.measurement_period}
                  onValueChange={(value: any) => setFormData({ ...formData, measurement_period: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save changes" : "Create Goal"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
