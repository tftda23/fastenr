import { NextRequest, NextResponse } from 'next/server'
import { updateContactGroup, deleteContactGroup } from '@/lib/supabase/contacts-queries'
import { handleApiError } from '@/lib/error-handling'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id } = params

    // Validate required fields
    if (!body.name) {
      throw new Error('Group name is required')
    }

    const group = await updateContactGroup(id, body)

    return NextResponse.json(group)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await deleteContactGroup(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}