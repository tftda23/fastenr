import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact } from '@/lib/supabase/contacts-queries'
import { handleApiError } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
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

    const result = await getContacts(filters, sort, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.first_name || !body.last_name) {
      throw new Error('First name and last name are required')
    }

    if (!body.email && !body.phone) {
      throw new Error('Either email or phone is required')
    }

    const contact = await createContact(body)

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}