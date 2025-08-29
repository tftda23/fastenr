import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user already has a profile
  const profile = await getCurrentUserOrganization()
  if (profile) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Complete Your Setup</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your organization to get started</p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
