import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated", authError }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ 
        error: "Profile lookup failed", 
        details: profileError,
        user_id: user.id 
      }, { status: 500 })
    }

    // Check if organization exists
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single()

    if (orgError) {
      return NextResponse.json({ 
        error: "Organization lookup failed", 
        details: orgError,
        organization_id: profile.organization_id,
        profile 
      }, { status: 500 })
    }

    // Check what columns exist in organizations table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'organizations' })
      .catch(() => ({ data: null, error: { message: "RPC not available" } }))

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      profile,
      organization: org,
      columns_check: columns || "Unable to check columns",
      columns_error: columnsError?.message || null
    })

  } catch (e) {
    console.error("Debug error:", e)
    return NextResponse.json({ error: "Internal server error", details: e.message }, { status: 500 })
  }
}