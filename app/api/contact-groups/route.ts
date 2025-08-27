import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getContactGroups, createContactGroup } from '@/lib/supabase/contacts-queries'
import { handleApiError, createError } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError.authentication()
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw createError.authorization('No organization found')
    }

    const groups = await getContactGroups(profile.organization_id)

    return NextResponse.json({ data: groups })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError.authentication()
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      throw createError.authorization('No organization found')
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      throw createError.validation('Group name is required')
    }

    const group = await createContactGroup(body, profile.organization_id, user.id)

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}