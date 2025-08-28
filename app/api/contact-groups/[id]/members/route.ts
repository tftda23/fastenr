import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/error-handling'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { id: groupId } = params
    const { contactIds } = body

    if (!Array.isArray(contactIds)) {
      throw new Error('contactIds must be an array')
    }

    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) throw new Error("User not authenticated")

    const supabase = createClient()

    // First, remove all existing memberships for this group
    await supabase
      .from('contact_group_memberships')
      .delete()
      .eq('group_id', groupId)

    // Then add the new memberships
    if (contactIds.length > 0) {
      const memberships = contactIds.map(contactId => ({
        group_id: groupId,
        contact_id: contactId,
        added_by: user.id,
        added_at: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('contact_group_memberships')
        .insert(memberships)

      if (insertError) {
        throw new Error(`Failed to update group members: ${insertError.message}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}