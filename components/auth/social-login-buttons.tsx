"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { Github, Chrome, Loader2 } from "lucide-react"

interface SocialLoginButtonsProps {
  redirectTo?: string
}

export default function SocialLoginButtons({ redirectTo = "/dashboard" }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error(`${provider} login error:`, error)
        setLoading(null)
      }
      // Don't set loading to null on success - the page will redirect
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          disabled={loading !== null}
          className="w-full"
        >
          {loading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("github")}
          disabled={loading !== null}
          className="w-full"
        >
          {loading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  )
}