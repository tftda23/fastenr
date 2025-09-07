"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X } from "lucide-react"
import Link from "next/link"
import type { Account, User } from "@/lib/types"

interface AccountFormProps {
  account?: Account
  isEditing?: boolean
}

export default function AccountForm({ account, isEditing = false }: AccountFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    name: account?.name || "",
    industry: account?.industry || "",
    size: account?.size || "",
    arr: account?.arr?.toString() || "",
    mrr: account?.mrr?.toString() || "",
    seat_count: account?.seat_count?.toString() || "",
    growth_tracking_method: account?.growth_tracking_method || "arr",
    status: account?.status || "active",
    owner_id: account?.owner_id || "unassigned",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate that at least one growth metric is provided
      const hasGrowthMetric = formData.arr || formData.mrr || formData.seat_count;
      if (!hasGrowthMetric) {
        alert('Please provide at least one growth metric (ARR, MRR, or Seat Count)');
        setIsLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        industry: formData.industry || null,
        size: formData.size || null,
        arr: formData.arr ? Number.parseFloat(formData.arr) : null,
        mrr: formData.mrr ? Number.parseFloat(formData.mrr) : null,
        seat_count: formData.seat_count ? Number.parseInt(formData.seat_count) : null,
        growth_tracking_method: formData.growth_tracking_method,
        status: formData.status,
        owner_id: formData.owner_id === "unassigned" ? null : formData.owner_id,
      }

      console.log('Account form payload:', payload)

      const url = isEditing ? `/api/accounts/${account?.id}` : "/api/accounts"
      const method = isEditing ? "PUT" : "POST"

      console.log('Making request to:', method, url)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Error response body:', errorBody)
        throw new Error(`Failed to save account: ${response.status} ${errorBody}`)
      }

      router.push("/dashboard/accounts")
      router.refresh()
    } catch (error) {
      console.error("Error saving account:", error)
      // In a real app, you'd show a toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      console.log('Loading users from /api/users')
      const response = await fetch('/api/users')
      console.log('Users API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Users data received, count:', data?.length || 0)
        setUsers(data)
      } else {
        const errorText = await response.text()
        console.error('Users API error:', response.status, errorText)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
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
          <h1 className="text-3xl font-bold text-foreground">{isEditing ? "Edit Account" : "New Account"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update account information" : "Add a new customer account"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/accounts">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Link>
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_id">Account Owner</Label>
                <Select value={formData.owner_id} onValueChange={(value) => handleChange("owner_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => {
                      console.log('Rendering user option:', user)
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="Technology"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Select value={formData.size} onValueChange={(value) => handleChange("size", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10)</SelectItem>
                    <SelectItem value="small">Small (11-50)</SelectItem>
                    <SelectItem value="medium">Medium (51-200)</SelectItem>
                    <SelectItem value="large">Large (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth_tracking_method">Growth Tracking Method *</Label>
                <Select value={formData.growth_tracking_method} onValueChange={(value) => handleChange("growth_tracking_method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tracking method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arr">ARR - Annual Recurring Revenue</SelectItem>
                    <SelectItem value="mrr">MRR - Monthly Recurring Revenue</SelectItem>
                    <SelectItem value="seat_count">Seat Count - User Licenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Growth Metrics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  At least one metric is required. The selected tracking method above will be used for health score calculations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arr">
                    Annual Recurring Revenue
                    {formData.growth_tracking_method === 'arr' && <span className="text-blue-600 ml-1">(Primary)</span>}
                  </Label>
                  <Input
                    id="arr"
                    type="number"
                    step="0.01"
                    value={formData.arr}
                    onChange={(e) => handleChange("arr", e.target.value)}
                    placeholder="50000"
                    className={formData.growth_tracking_method === 'arr' ? 'border-blue-300' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mrr">
                    Monthly Recurring Revenue
                    {formData.growth_tracking_method === 'mrr' && <span className="text-blue-600 ml-1">(Primary)</span>}
                  </Label>
                  <Input
                    id="mrr"
                    type="number"
                    step="0.01"
                    value={formData.mrr}
                    onChange={(e) => handleChange("mrr", e.target.value)}
                    placeholder="4200"
                    className={formData.growth_tracking_method === 'mrr' ? 'border-blue-300' : ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seat_count">
                    Seat Count
                    {formData.growth_tracking_method === 'seat_count' && <span className="text-blue-600 ml-1">(Primary)</span>}
                  </Label>
                  <Input
                    id="seat_count"
                    type="number"
                    min="0"
                    value={formData.seat_count}
                    onChange={(e) => handleChange("seat_count", e.target.value)}
                    placeholder="25"
                    className={formData.growth_tracking_method === 'seat_count' ? 'border-blue-300' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/accounts">Cancel</Link>
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
                    {isEditing ? "Update Account" : "Create Account"}
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
