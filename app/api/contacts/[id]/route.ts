import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getContactById, updateContact, deleteContact } from '@/lib/supabase/contacts-queries'
import { handleApiError, createError } from '@/lib/error-handling'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError.authentication()
    }

    const contact = await getContactById(params.id)

    // Verify user has access to this contact's organization
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (contact.organization_id !== profile?.organization_id) {
      throw createError.authorization('Access denied')
    }

    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError.authentication()
    }

    // Verify user has access to this contact
    const existingContact = await getContactById(params.id)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (existingContact.organization_id !== profile?.organization_id) {
      throw createError.authorization('Access denied')
    }

    const body = await request.json()
    const contact = await updateContact(params.id, body, user.id)

    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw createError.authentication()
    }

    // Verify user has access to this contact
    const existingContact = await getContactById(params.id)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (existingContact.organization_id !== profile?.organization_id) {
      throw createError.authorization('Access denied')
    }

    await deleteContact(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}