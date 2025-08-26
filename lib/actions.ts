"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    if (!authData.user) {
      return { error: "Login failed" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, organization_id, role")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Profile lookup error:", profileError)
      return { error: "Database error occurred. Please try again." }
    }

    if (!profile) {
      redirect("/onboarding")
    } else {
      redirect("/dashboard")
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // This is expected behavior for successful redirects, don't log as error
      throw error
    }
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")
  const organizationName = formData.get("organizationName")

  if (!email || !password || !fullName || !organizationName) {
    return { error: "All fields are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // First, check if organization already exists
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("name", organizationName.toString())
      .single()

    if (existingOrg) {
      return {
        error: "Organization already exists. Please contact your company administrator or choose a different name.",
      }
    }

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName.toString(),
      })
      .select()
      .single()

    if (orgError) {
      console.error("Organization creation error:", orgError)
      return { error: "Failed to create organization" }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      email: email.toString(),
      full_name: fullName.toString(),
      role: "admin", // First user becomes admin
      organization_id: orgData.id,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: "Failed to create user profile" }
    }

    return { success: "Account created successfully! Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

// Sign out action
export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function completeOnboarding(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const fullName = formData.get("fullName")
  const organizationName = formData.get("organizationName")

  if (!fullName || !organizationName) {
    return { error: "Full name and organization name are required" }
  }

  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "You must be logged in to complete onboarding" }
    }

    // Check if organization already exists
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("name", organizationName.toString())
      .single()

    if (existingOrg) {
      return {
        error: "Organization already exists. Please contact your company administrator or choose a different name.",
      }
    }

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName.toString(),
      })
      .select()
      .single()

    if (orgError) {
      console.error("Organization creation error:", orgError)
      return { error: "Failed to create organization" }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: user.id,
      email: user.email || "",
      full_name: fullName.toString(),
      role: "admin", // First user becomes admin
      organization_id: orgData.id,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return { error: "Failed to create user profile" }
    }

    redirect("/dashboard")
  } catch (error) {
    console.error("Onboarding error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
