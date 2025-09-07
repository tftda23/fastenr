"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { isSocialLoginEnabled, isProviderEnabled, type AuthProvider } from "@/lib/auth-config"

interface SocialLoginButtonsProps {
  redirectTo?: string
}

export default function SocialLoginButtons({ redirectTo = "/dashboard" }: SocialLoginButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: AuthProvider) => {
    // Check if provider is enabled in config
    if (!isProviderEnabled(provider)) {
      alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured yet. Please use email login.`)
      return
    }

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
        // Check for provider not enabled error
        if (error.message?.includes('provider is not enabled') || error.message?.includes('Unsupported provider')) {
          alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured yet. Please contact support or use email login.`)
        }
        setLoading(null)
      }
      // Don't set loading to null on success - the page will redirect
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setLoading(null)
    }
  }

  // Don't render social login section if disabled
  if (!isSocialLoginEnabled()) {
    return null
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

      <div className="space-y-3">
        {isProviderEnabled('google') && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image src="/images/logos/google.svg" alt="Google" width={16} height={16} className="mr-2" />
            )}
            Continue with Google
          </Button>
        )}

        {isProviderEnabled('azure') && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("azure")}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === "azure" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image src="/images/logos/microsoft.svg" alt="Microsoft" width={16} height={16} className="mr-2" />
            )}
            Continue with Microsoft
          </Button>
        )}

        {isProviderEnabled('apple') && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("apple")}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === "apple" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image src="/images/logos/apple.svg" alt="Apple" width={16} height={16} className="mr-2" />
            )}
            Continue with Apple
          </Button>
        )}
      </div>

      {/* Show message if no providers are enabled */}
      {!isProviderEnabled('google') && !isProviderEnabled('azure') && !isProviderEnabled('apple') && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Social login coming soon
        </div>
      )}
    </div>
  )
}