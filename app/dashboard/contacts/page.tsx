import { Suspense } from 'react'
import { ContactsPageWrapper } from '@/components/contacts/contacts-page-wrapper'
import { getContacts, getContactGroups } from '@/lib/supabase/contacts-queries'
import { getAccounts } from '@/lib/supabase/queries'

export default async function ContactsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    // Parse search params for filters with type validation
    const validSeniorityLevels = ['C-Level', 'VP', 'Director', 'Manager', 'Individual Contributor', 'Other']
    const validDecisionMakerLevels = ['Unknown', 'Primary', 'Influencer', 'User', 'Gatekeeper']
    const validContactStatuses = ['active', 'inactive', 'left_company', 'unresponsive']
    const validRelationshipStrengths = ['strong', 'moderate', 'weak', 'unknown']

    const filters = {
      account_id: typeof searchParams.account_id === 'string' ? searchParams.account_id : undefined,
      seniority_level: typeof searchParams.seniority_level === 'string' && validSeniorityLevels.includes(searchParams.seniority_level) ? searchParams.seniority_level as any : undefined,
      decision_maker_level: typeof searchParams.decision_maker_level === 'string' && validDecisionMakerLevels.includes(searchParams.decision_maker_level) ? searchParams.decision_maker_level as any : undefined,
      contact_status: typeof searchParams.contact_status === 'string' && validContactStatuses.includes(searchParams.contact_status) ? searchParams.contact_status as any : undefined,
      relationship_strength: typeof searchParams.relationship_strength === 'string' && validRelationshipStrengths.includes(searchParams.relationship_strength) ? searchParams.relationship_strength as any : undefined,
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
    }

    const sort = {
      field: (typeof searchParams.sort_field === 'string' ? searchParams.sort_field : 'name') as any,
      direction: (typeof searchParams.sort_direction === 'string' ? searchParams.sort_direction : 'asc') as 'asc' | 'desc'
    }

    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1

    // Fetch data using the same pattern as engagements and accounts
    console.log('ContactsPage - About to fetch data with filters:', filters)
    console.log('ContactsPage - Sort:', sort, 'Page:', page)
    
    const [contactsResult, contactGroups, accountsResult] = await Promise.all([
      getContacts(filters, sort, page),
      getContactGroups(),
      getAccounts(1, 100) // Get up to 100 accounts for the filter
    ])
    
    console.log('ContactsPage - Fetched contactsResult:', JSON.stringify(contactsResult, null, 2))
    console.log('ContactsPage - Contacts data length:', contactsResult?.data?.length)
    console.log('ContactsPage - Contacts count:', contactsResult?.count)
    console.log('ContactsPage - Fetched contactGroups:', JSON.stringify(contactGroups, null, 2))
    console.log('ContactsPage - Contact groups length:', contactGroups?.length)

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <Suspense fallback={<div>Loading contacts...</div>}>
            <ContactsPageWrapper 
              initialContacts={contactsResult as any}
              contactGroups={contactGroups}
              accounts={accountsResult.data}
              initialFilters={filters}
              initialSort={sort}
              initialPage={page}
            />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading contacts:", error)
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1">
          <ContactsPageWrapper 
            initialContacts={{ data: [], count: 0, page: 1, limit: 50 }} 
            contactGroups={[]} 
            accounts={[]} 
            initialFilters={{}} 
            initialSort={{ field: 'name', direction: 'asc' }} 
            initialPage={1} 
          />
        </div>
      </div>
    )
  }
}