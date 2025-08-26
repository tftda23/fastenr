import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"

export async function GET() {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin" && user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = createClient()
    
    // Get app settings for the organization
    const { data: settings, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("organization_id", organization.id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching app settings:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    // If no settings exist, create default ones using upsert
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from("app_settings")
        .upsert({
          organization_id: organization.id,
          organization_name: organization.name || "My Organization"
        }, {
          onConflict: 'organization_id'
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating default settings:", createError)
        return NextResponse.json({ error: "Failed to create default settings" }, { status: 500 })
      }

      return NextResponse.json(newSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error in app settings GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin" && user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const supabase = createClient()

    // Validate and sanitize the input
    const allowedFields = [
      'organization_name',
      'timezone',
      'description',
      'email_notifications_enabled',
      'slack_integration_enabled',
      'automated_health_scoring_enabled',
      'api_access_enabled',
      'data_retention_period',
      'backup_frequency',
      'gdpr_compliance_enabled',
      'slack_webhook_url',
      'slack_default_channel',
      'slack_notification_types'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Upsert the settings (insert or update)
    const upsertData = {
      organization_id: organization.id,
      ...updateData
    }

    const { data: settings, error } = await supabase
      .from("app_settings")
      .upsert(upsertData, {
        onConflict: 'organization_id'
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating app settings:", error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error in app settings PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}