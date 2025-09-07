"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/lib/hooks/use-toast"
import { Mail, Building, UserCheck, AlertCircle } from "lucide-react"

interface InviteAcceptFormProps {
  token: string
  email: string
  organizationName: string
  role: string
  isLoggedIn: boolean
  currentUserEmail?: string
}

export default function InviteAcceptForm({
  token,
  email,
  organizationName,
  role,
  isLoggedIn,
  currentUserEmail
}: InviteAcceptFormProps) {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleAcceptInvite = async () => {
    setLoading(true)
    
    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: isLoggedIn ? undefined : password,
          fullName: isLoggedIn ? undefined : fullName
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome!",
          description: `You've successfully joined ${organizationName}`,
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept invitation",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error accepting invite:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const emailMismatch = isLoggedIn && currentUserEmail !== email

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Accept Invitation</CardTitle>
        <CardDescription className="text-center">
          Complete your account setup to join the team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invitation Details */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Organization:</span>
            <span className="text-sm">{organizationName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Role:</span>
            <span className="text-sm capitalize">{role}</span>
          </div>
        </div>

        {/* Email Mismatch Warning */}
        {emailMismatch && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're logged in as {currentUserEmail}, but this invitation is for {email}. 
              Please log out and sign in with the correct email address.
            </AlertDescription>
          </Alert>
        )}

        {/* Account Creation Form (for new users) */}
        {!isLoggedIn && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
          </div>
        )}

        {/* Already Logged In Message */}
        {isLoggedIn && !emailMismatch && (
          <Alert>
            <UserCheck className="h-4 w-4" />
            <AlertDescription>
              You're already logged in as {currentUserEmail}. Click "Accept Invitation" to join {organizationName}.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleAcceptInvite}
            disabled={loading || emailMismatch || (!isLoggedIn && (!password || !fullName))}
            className="w-full"
          >
            {loading ? "Processing..." : "Accept Invitation"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            {isLoggedIn ? "Switch Account" : "Sign In Instead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}