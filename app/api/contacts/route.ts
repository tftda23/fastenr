import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getContacts, createContact } from '@/lib/supabase/contacts-queries'
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

    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Parse filters
    const filters = {
      account_id: searchParams.get('account_id') || undefined,
      seniority_level: searchParams.get('seniority_level') || undefined,
      decision_maker_level: searchParams.get('decision_maker_level') || undefined,
      contact_status: searchParams.get('contact_status') || undefined,
      relationship_strength: searchParams.get('relationship_strength') || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined
    }

    // Parse sorting
    const sort = {
      field: (searchParams.get('sort_field') as any) || 'name',
      direction: (searchParams.get('sort_direction') as 'asc' | 'desc') || 'asc'
    }

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await getContacts(profile.organization_id, filters, sort, page, limit)

    return NextResponse.json(result)
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
    if (!body.first_name || !body.last_name) {
      throw createError.validation('First name and last name are required')
    }

    if (!body.email && !body.phone) {
      throw createError.validation('Either email or phone is required')
    }

    const contact = await createContact(body, profile.organization_id, user.id)

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}