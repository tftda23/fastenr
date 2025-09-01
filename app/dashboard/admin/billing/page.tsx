import { Metadata } from "next"
import { redirect } from "next/navigation"
import { createServerClient } from '@/lib/supabase/server'
import { BillingPortal } from "@/components/billing/billing-portal"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Billing - Fastenr Admin",
  description: "Manage your organization's subscription and billing",
}

export default async function AdminBillingPage() {
  const supabase = createServerClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get user profile and check admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/dashboard')
  }

  // Only allow admin users to access billing
  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Billing</h1>
        <p className="text-muted-foreground">
          Manage your organization's subscription, payment methods, and invoices
        </p>
      </div>
      
      <BillingPortal />
    </div>
  )
}