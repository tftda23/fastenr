import { NextRequest, NextResponse } from 'next/server'
import { getContactGroups, createContactGroup } from '@/lib/supabase/contacts-queries'
import { handleApiError } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
    const groups = await getContactGroups()
    return NextResponse.json({ data: groups })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      throw new Error('Group name is required')
    }

    const group = await createContactGroup(body)

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}