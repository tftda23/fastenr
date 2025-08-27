import { Suspense } from 'react'
import { ContactsClient } from '@/components/contacts/contacts-client'
import { getContacts, getContactGroups } from '@/lib/supabase/contacts-queries'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ContactsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    redirect('/onboarding')
  }

  try {
    // Parse search params for filters
    const filters = {
      account_id: typeof searchParams.account_id === 'string' ? searchParams.account_id : undefined,
      seniority_level: typeof searchParams.seniority_level === 'string' ? searchParams.seniority_level : undefined,
      decision_maker_level: typeof searchParams.decision_maker_level === 'string' ? searchParams.decision_maker_level : undefined,
      contact_status: typeof searchParams.contact_status === 'string' ? searchParams.contact_status : undefined,
      relationship_strength: typeof searchParams.relationship_strength === 'string' ? searchParams.relationship_strength : undefined,
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    }

    const sort = {
      field: (typeof searchParams.sort_field === 'string' ? searchParams.sort_field : 'name') as any,
      direction: (typeof searchParams.sort_direction === 'string' ? searchParams.sort_direction : 'asc') as 'asc' | 'desc'
    }

    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

    // Fetch data
    const [contactsResult, contactGroups] = await Promise.all([
      getContacts(profile.organization_id, filters, sort, page),
      getContactGroups(profile.organization_id)
    ])

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage customer contacts, stakeholders, and decision makers
          </p>
        </div>

        <Suspense fallback={<div>Loading contacts...</div>}>
          <ContactsClient 
            initialContacts={contactsResult}
            contactGroups={contactGroups}
            initialFilters={filters}
            initialSort={sort}
            initialPage={page}
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error loading contacts:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage customer contacts, stakeholders, and decision makers
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load contacts. Please try again.</p>
        </div>
      </div>
    )
  }
}