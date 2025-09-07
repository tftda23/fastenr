import { NextRequest, NextResponse } from "next/server"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getCurrentUserOrganization } from "@/lib/supabase/queries"

export const dynamic = 'force-dynamic'

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

    // Get organization currency settings
    const { data: orgSettings, error: orgError } = await supabase
      .from("organizations")
      .select("currency_code, currency_symbol, date_format, number_format")
      .eq("id", organization.id)
      .single()

    if (orgError) {
      console.error("Error fetching organization settings:", orgError)
      return NextResponse.json({ error: "Failed to fetch organization settings" }, { status: 500 })
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

      // Combine with organization settings
      const responseData = {
        ...newSettings,
        ...orgSettings
      }

      return NextResponse.json(responseData)
    }

    // Combine app settings with organization settings
    const responseData = {
      ...settings,
      ...orgSettings
    }

    return NextResponse.json(responseData)
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
      'slack_notification_types',
      'health_score_template',
      'health_score_engagement_weight',
      'health_score_nps_weight',
      'health_score_activity_weight',
      'health_score_growth_weight'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Handle currency fields - these go to organizations table
    const currencyFields = ['currency_code', 'currency_symbol', 'date_format', 'number_format']
    const currencyUpdateData: any = {}
    for (const field of currencyFields) {
      if (field in body) {
        currencyUpdateData[field] = body[field]
      }
    }

    // Update organization currency settings if any currency fields are present
    if (Object.keys(currencyUpdateData).length > 0) {
      const { error: orgError } = await supabase
        .from("organizations")
        .update(currencyUpdateData)
        .eq("id", organization.id)

      if (orgError) {
        console.error("Error updating organization currency settings:", orgError)
        return NextResponse.json({ error: "Failed to update currency settings" }, { status: 500 })
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

    // Include currency settings in response
    const responseData = {
      ...settings,
      ...currencyUpdateData
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error in app settings PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}