"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, Search, Filter, Users, Building2, 
  Phone, Mail, MapPin, Calendar, MoreHorizontal,
  UserPlus, UsersIcon, Briefcase, Crown
} from 'lucide-react'
import { ContactsTable } from './contacts-table'
import { ContactGroupsManager } from './contact-groups-manager'
import { 
  Contact, 
  ContactGroup, 
  ContactsResponse, 
  ContactFilters, 
  ContactSortOptions,
  Account
} from '@/lib/types'

interface ContactsClientProps {
  initialContacts: ContactsResponse
  contactGroups: ContactGroup[]
  accounts: Account[]
  initialFilters: ContactFilters
  initialSort: ContactSortOptions
  initialPage: number
}

export function ContactsClient({
  initialContacts,
  contactGroups,
  accounts,
  initialFilters,
  initialSort,
  initialPage
}: ContactsClientProps) {
  const [contacts, setContacts] = useState(initialContacts)
  const [groups, setGroups] = useState(contactGroups)
  const [filters, setFilters] = useState(initialFilters)
  const [sort, setSort] = useState(initialSort)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState('list')

  // Debug logging
  console.log('ContactsClient - RENDER - initialContacts:', JSON.stringify(initialContacts, null, 2))
  console.log('ContactsClient - RENDER - initialContacts data length:', initialContacts?.data?.length)
  console.log('ContactsClient - RENDER - initialContacts count:', initialContacts?.count)
  console.log('ContactsClient - RENDER - current contacts state:', JSON.stringify(contacts, null, 2))
  console.log('ContactsClient - RENDER - current contacts data length:', contacts?.data?.length)
  console.log('ContactsClient - RENDER - contactGroups:', contactGroups?.length)

  // Refresh contacts data
  const refreshContacts = useCallback(async () => {
    console.log('ContactsClient - refreshContacts called')
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, value)
          }
        }
      })
      
      // Add sorting and pagination
      params.set('sort_field', sort.field)
      params.set('sort_direction', sort.direction)
      params.set('page', currentPage.toString())
      
      console.log('ContactsClient - About to fetch from API with params:', params.toString())
      const response = await fetch(`/api/contacts?${params}`)
      console.log('ContactsClient - API response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('ContactsClient - API response data:', JSON.stringify(data, null, 2))
        console.log('ContactsClient - API response data length:', data?.data?.length)
        setContacts(data)
      } else {
        console.error('ContactsClient - Failed to fetch contacts:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('ContactsClient - Error response:', errorText)
      }
    } catch (error) {
      console.error('Failed to refresh contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, sort, currentPage])

  // Refresh contacts on mount to ensure we have fresh data
  useEffect(() => {
    refreshContacts()
  }, [refreshContacts])

  // Refresh contact groups
  const refreshGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/contact-groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.data)
      }
    } catch (error) {
      console.error('Failed to refresh groups:', error)
    }
  }, [])

  const handleFilterChange = (newFilters: Partial<ContactFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSortChange = (newSort: ContactSortOptions) => {
    setSort(newSort)
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Calculate summary stats
  const totalContacts = contacts.count || contacts.data.length
  const activeContacts = contacts.data.filter(c => c.contact_status === 'active').length
  const decisionMakers = contacts.data.filter(c => 
    ['Primary', 'Influencer'].includes(c.decision_maker_level || '')
  ).length
  const champions = contacts.data.filter(c => c.relationship_strength === 'champion').length

  return (
    <div className="h-full flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {activeContacts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionMakers}</div>
            <p className="text-xs text-muted-foreground">
              Primary & influencers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Champions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{champions}</div>
            <p className="text-xs text-muted-foreground">
              Strong advocates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Groups</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Organized groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="list" className="flex-1 flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            Contact List
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1 flex items-center justify-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        {/* Contact List Tab */}
        <TabsContent value="list" className="flex-1 flex flex-col">
          <ContactsTable
            contacts={contacts}
            contactGroups={groups}
            accounts={accounts}
            filters={filters}
            sort={sort}
            currentPage={currentPage}
            loading={loading}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onRefresh={refreshContacts}
          />
        </TabsContent>

        {/* Contact Groups Tab */}
        <TabsContent value="groups" className="flex-1 flex flex-col">
          <ContactGroupsManager
            contactGroups={groups}
            contacts={contacts.data}
            onRefresh={refreshGroups}
          />
        </TabsContent>
      </Tabs>

    </div>
  )
}