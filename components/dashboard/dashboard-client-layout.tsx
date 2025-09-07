"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase/client"
import Sidebar from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"

interface UserProfile {
  full_name: string
  email: string
  role: string
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const { setTheme } = useTheme()
  const authCheckRef = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setContentLoading(true)

    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setContentLoading(false)
        })
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    if (authCheckRef.current) return
    authCheckRef.current = true

    async function checkAuth() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          if (userError.message.includes("fetch")) {
            setLoading(false)
            return
          }
        }

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name, email, role, organization_id")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          setLoading(false)
          return
        }

        if (!userProfile) {
          router.push("/onboarding")
          return
        }

        setProfile(userProfile)
        setOrganizationId((userProfile as any).organization_id)

        if ((userProfile as any).organization_id) {
          const { data: preferences } = await supabase
            .from("user_preferences")
            .select("theme")
            .eq("user_id", user.id)
            .eq("organization_id", (userProfile as any).organization_id)
            .maybeSingle()

          if ((preferences as any)?.theme) {
            // Apply the saved theme preference immediately
            setTheme((preferences as any).theme)
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("fetch")) {
        } else {
          router.push("/auth/login")
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Unable to load dashboard</p>
        </div>
      </div>
    )
  }

  return (
      <div className="flex h-screen bg-background">
        <Sidebar userProfile={profile} organizationId={organizationId || undefined} />
        <main className="flex-1 overflow-auto ml-64">
          {contentLoading && (
            <div className="absolute inset-0 ml-64 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <div className="p-6">{children}</div>
        </main>
      </div>
  )
}
