import { NextRequest, NextResponse } from "next/server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    const body = await request.json()
    const { token, password, fullName } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("org_invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 400 })
    }

    // Check if user is already logged in
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    let userId: string

    if (currentUser) {
      // User is already logged in
      if (currentUser.email !== invitation.email) {
        return NextResponse.json({ 
          error: "You must be logged in with the invited email address" 
        }, { status: 400 })
      }
      userId = currentUser.id
    } else {
      // Create new user account
      if (!password || !fullName) {
        return NextResponse.json({ 
          error: "Password and full name are required for new accounts" 
        }, { status: 400 })
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        }
      })

      if (authError) {
        return NextResponse.json({ 
          error: authError.message || "Failed to create account" 
        }, { status: 400 })
      }

      if (!authData.user) {
        return NextResponse.json({ 
          error: "Failed to create user account" 
        }, { status: 500 })
      }

      userId = authData.user.id
    }

    // Check if user already has a profile in this organization
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .eq("organization_id", invitation.organization_id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ 
        error: "You are already a member of this organization" 
      }, { status: 400 })
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        organization_id: invitation.organization_id,
        email: invitation.email,
        full_name: fullName || currentUser?.user_metadata?.full_name || null,
        role: invitation.role
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ 
        error: "Failed to create user profile" 
      }, { status: 500 })
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from("org_invitations")
      .update({ 
        status: "accepted",
        accepted_at: new Date().toISOString()
      })
      .eq("token", token)

    if (updateError) {
      console.error("Failed to update invitation status:", updateError)
      // Don't fail the request for this, just log it
    }

    return NextResponse.json({ 
      success: true,
      message: "Invitation accepted successfully" 
    })

  } catch (error) {
    console.error("Invite acceptance error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}