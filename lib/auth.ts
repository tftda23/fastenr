import { createClient } from "@/lib/supabase/server"

// Get current user's organization ID
export async function getCurrentUserOrganization() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, organization: null }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("organization_id, role, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !profile) return { user: null, organization: null }

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.organization_id)
    .single()

  if (orgError || !organization) return { user: null, organization: null }

  return {
    user: {
      id: user.id,
      email: user.email,
      role: profile.role,
      full_name: profile.full_name,
    },
    organization,
  }
}

// Check user permissions
export async function checkUserPermission(requiredRole: "read" | "read_write" | "read_write_delete" | "admin") {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) return false

  const roleHierarchy = {
    read: 1,
    read_write: 2,
    read_write_delete: 3,
    admin: 4,
  }

  return (roleHierarchy as any)[(user as any).role] >= (roleHierarchy as any)[requiredRole]
}
