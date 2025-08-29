import type { Metadata } from "next"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"
import { redirect } from "next/navigation"
import UsersClient from "@/components/admin/users-client"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Users - Admin | fastenr",
  description: "Manage organization users and permissions",
}

export default async function AdminUsersPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage organization users, roles, and permissions</p>
      </div>
      <UsersClient organizationId={organization.id} />
    </div>
  )
}
