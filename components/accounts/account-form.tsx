"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X } from "lucide-react"
import Link from "next/link"
import type { Account } from "@/lib/types"

interface AccountFormProps {
  account?: Account
  isEditing?: boolean
}

export default function AccountForm({ account, isEditing = false }: AccountFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: account?.name || "",
    industry: account?.industry || "",
    size: account?.size || "",
    arr: account?.arr?.toString() || "",
    status: account?.status || "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        industry: formData.industry || null,
        size: formData.size || null,
        arr: formData.arr ? Number.parseFloat(formData.arr) : null,
        status: formData.status,
      }

      const url = isEditing ? `/api/accounts/${account?.id}` : "/api/accounts"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save account")
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
                <Label htmlFor="arr">Annual Recurring Revenue</Label>
                <Input
                  id="arr"
                  type="number"
                  value={formData.arr}
                  onChange={(e) => handleChange("arr", e.target.value)}
                  placeholder="50000"
                />
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
