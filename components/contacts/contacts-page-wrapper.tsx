"use client"

import { useState, useEffect } from 'react'
import { ContactsClient } from './contacts-client'
import { CreateContactDialog } from './create-contact-dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { AIInsightsButton } from '@/components/ai/ai-insights-button'
import { ContactsHelp } from '@/components/ui/help-system'
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
  const [isPremium, setIsPremium] = useState(false)

  const handleContactCreated = () => {
    setRefreshKey(prev => prev + 1)
    setShowCreateDialog(false)
  }

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch('/api/debug/org')
        if (response.ok) {
          const data = await response.json()
          
          if (data.organization_id) {
            const premiumResponse = await fetch(`/api/features/premium?org_id=${data.organization_id}`)
            if (premiumResponse.ok) {
              const premiumData = await premiumResponse.json()
              setIsPremium(premiumData.isPremium || false)
            }
          }
        }
      } catch (error) {
        console.error('Failed to check premium status:', error)
        setIsPremium(false)
      }
    }

    checkPremiumStatus()
  }, [])

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
          <ContactsHelp variant="icon" size="md" />
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