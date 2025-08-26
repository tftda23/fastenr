"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, User } from "lucide-react"
import { completeOnboarding } from "@/lib/actions"

export function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError("")

    const result = await completeOnboarding(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Organization</CardTitle>
        <CardDescription>Set up your organization and profile to start using the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="pl-10"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="pl-10"
                placeholder="Enter your organization name"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
