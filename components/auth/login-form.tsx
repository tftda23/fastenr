"use client"

import { useState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { signIn } from "@/lib/actions"
import SocialLoginButtons from "./social-login-buttons"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null)
  const router = useRouter()

  // Check for OAuth errors in URL params and clean up any sensitive data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    // SECURITY: Check for any sensitive data in URL and clear it immediately
    const hasPassword = urlParams.has('password')
    const hasEmail = urlParams.has('email')
    
    if (hasPassword) {
      console.error('SECURITY VIOLATION: Password found in URL! This should never happen.')
      // Clear the URL immediately for security
      window.history.replaceState({}, '', window.location.pathname)
      setState({ error: 'Security error detected. Please try logging in again.' })
      return
    }
    
    const error = urlParams.get('error')
    if (error) {
      const errorMessages: Record<string, string> = {
        oauth_error: 'Social login failed. Please try again.',
        profile_error: 'Unable to load your profile. Please contact support.',
        callback_error: 'Authentication callback failed. Please try again.'
      }
      setState({ error: errorMessages[error] || 'An error occurred during login.' })
    }
    
    // Clean up URL if there are any params (including email for privacy)
    if (hasEmail || error || hasPassword) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state?.success, router])

  const handleSubmit = async (formData: FormData) => {
    const result = await signIn(null, formData)
    setState(result)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">Sign in to your fastenr account</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(new FormData(e.target as HTMLFormElement))
          }}
          className="space-y-4"
        >
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Login successful! Redirecting...
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@company.com" required className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" required className="pl-10" />
            </div>
          </div>

          <SubmitButton />

          <SocialLoginButtons redirectTo="/dashboard" />

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
