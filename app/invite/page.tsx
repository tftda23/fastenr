import { redirect } from "next/navigation"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import InviteAcceptForm from "@/components/auth/invite-accept-form"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface InvitePageProps {
  searchParams: {
    token?: string
  }
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = searchParams

  if (!token) {
    redirect("/auth/login?error=Invalid invite link")
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Check if token is valid and get invitation details
  const { data: invitation, error } = await supabase
    .from("org_invitations")
    .select(`
      *,
      organizations (name)
    `)
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (error || !invitation) {
    redirect("/auth/login?error=Invalid or expired invite link")
  }

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join {invitation.organizations?.name}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've been invited to join as a <span className="font-medium">{invitation.role}</span>
          </p>
        </div>

        <InviteAcceptForm 
          token={token}
          email={invitation.email}
          organizationName={invitation.organizations?.name}
          role={invitation.role}
          isLoggedIn={!!user}
          currentUserEmail={user?.email}
        />
      </div>
    </div>
  )
}