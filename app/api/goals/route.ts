import { type NextRequest, NextResponse } from "next/server"
import { getCustomerGoals, createCustomerGoal, checkUserPermission } from "@/lib/supabase/queries"
import { hasFeatureAccess } from '@/lib/features'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const hasAccess = await hasFeatureAccess(profile.organization_id, 'goals_management')
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Goals Management requires a Premium subscription',
          premium_required: true,
          feature: 'goals_management'
        },
        { status: 402 }
      )
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("accountId") || undefined

    const goals = await getCustomerGoals(accountId)

    return NextResponse.json({ data: goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const hasAccess = await hasFeatureAccess(profile.organization_id, 'goals_management')
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Goals Management requires a Premium subscription',
          premium_required: true,
          feature: 'goals_management'
        },
        { status: 402 }
      )
    }

    const hasPermission = await checkUserPermission("read_write")
    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const goal = await createCustomerGoal(body)

    return NextResponse.json({ data: goal }, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
