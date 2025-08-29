import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/signup-form"
import { Logo } from "@/components/ui/logo"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
          <p className="text-muted-foreground">Please configure your Supabase integration in project settings.</p>
        </div>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="relative flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800">
        <div className="flex items-center justify-center w-full">
          <div className="text-center text-white px-8">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Join today</h2>
            <p className="text-lg text-indigo-100 max-w-md">
              Start building stronger customer relationships and prevent churn
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo variant="black" size="lg" className="mx-auto mb-4" />
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
