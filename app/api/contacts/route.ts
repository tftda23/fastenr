import { NextRequest, NextResponse } from 'next/server'
import { getContacts, createContact } from '@/lib/supabase/contacts-queries'
import { handleApiError } from '@/lib/error-handling'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Parse filters with type validation
    const seniorityLevel = searchParams.get('seniority_level')
    const validSeniorityLevels = ['C-Level', 'VP', 'Director', 'Manager', 'Individual Contributor', 'Other']
    
    const decisionMakerLevel = searchParams.get('decision_maker_level')
    const validDecisionMakerLevels = ['Unknown', 'Primary', 'Influencer', 'User', 'Gatekeeper']
    
    const contactStatus = searchParams.get('contact_status')
    const validContactStatuses = ['active', 'inactive', 'left_company', 'unresponsive']
    
    const relationshipStrength = searchParams.get('relationship_strength')
    const validRelationshipStrengths = ['strong', 'moderate', 'weak', 'unknown'] // Add valid values based on your enum
    
    const filters = {
      account_id: searchParams.get('account_id') || undefined,
      seniority_level: seniorityLevel && validSeniorityLevels.includes(seniorityLevel) ? seniorityLevel as any : undefined,
      decision_maker_level: decisionMakerLevel && validDecisionMakerLevels.includes(decisionMakerLevel) ? decisionMakerLevel as any : undefined,
      contact_status: contactStatus && validContactStatuses.includes(contactStatus) ? contactStatus as any : undefined,
      relationship_strength: relationshipStrength && validRelationshipStrengths.includes(relationshipStrength) ? relationshipStrength as any : undefined,
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