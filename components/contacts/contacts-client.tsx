"use client"

import { useState, useCallback } from 'react'
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
import { CreateContactDialog } from './create-contact-dialog'
import { OrgChartView } from './org-chart-view'
import { ContactAnalytics } from './contact-analytics'
import { 
  Contact, 
  ContactGroup, 
  ContactsResponse, 
  ContactFilters, 
  ContactSortOptions 
} from '@/lib/types'

interface ContactsClientProps {
  initialContacts: ContactsResponse
  contactGroups: ContactGroup[]
  initialFilters: ContactFilters
  initialSort: ContactSortOptions
  initialPage: number
}

export function ContactsClient({
  initialContacts,
  contactGroups,
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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState('list')

  // Refresh contacts data
  const refreshContacts = useCallback(async () => {
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
      
      const response = await fetch(`/api/contacts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Failed to refresh contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, sort, currentPage])

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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contact List
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="orgchart" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Org Chart
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Contact List Tab */}
        <TabsContent value="list" className="space-y-4">
          <ContactsTable
            contacts={contacts}
            contactGroups={groups}
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
        <TabsContent value="groups" className="space-y-4">
          <ContactGroupsManager
            contactGroups={groups}
            contacts={contacts.data}
            onRefresh={refreshGroups}
          />
        </TabsContent>

        {/* Org Chart Tab */}
        <TabsContent value="orgchart" className="space-y-4">
          <OrgChartView
            contacts={contacts.data}
            onRefresh={refreshContacts}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <ContactAnalytics
            contacts={contacts.data}
            contactGroups={groups}
          />
        </TabsContent>
      </Tabs>

      {/* Create Contact Dialog */}
      <CreateContactDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        contactGroups={groups}
        onSuccess={() => {
          refreshContacts()
          setShowCreateDialog(false)
        }}
      />
    </div>
  )
}