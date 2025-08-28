"use client"

import { useState } from 'react'
import { ContactsClient } from './contacts-client'
import { CreateContactDialog } from './create-contact-dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { AIInsightsButton } from '@/components/ai/ai-insights-button'
import { 
  Contact, 
  ContactGroup, 
  ContactsResponse, 
  ContactFilters, 
  ContactSortOptions,
  Account
} from '@/lib/types'

interface ContactsPageWrapperProps {
  initialContacts: ContactsResponse
  contactGroups: ContactGroup[]
  accounts: Account[]
  initialFilters: ContactFilters
  initialSort: ContactSortOptions
  initialPage: number
}

export function ContactsPageWrapper(props: ContactsPageWrapperProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleContactCreated = () => {
    setRefreshKey(prev => prev + 1)
    setShowCreateDialog(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage customer contacts, stakeholders, and decision makers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIInsightsButton 
            pageType="contacts" 
            pageContext={{}}
          />
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Main contacts client */}
      <div className="flex-1">
        <ContactsClient 
          key={refreshKey}
          {...props}
        />
      </div>

      {/* Create Contact Dialog */}
      <CreateContactDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        contactGroups={props.contactGroups}
        accounts={props.accounts}
        defaultAccountId={props.initialFilters.account_id}
        onSuccess={handleContactCreated}
      />
    </div>
  )
}