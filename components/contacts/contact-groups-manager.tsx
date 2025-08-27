"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Contact, ContactGroup } from '@/lib/types'

interface ContactGroupsManagerProps {
  contactGroups: ContactGroup[]
  contacts: Contact[]
  onRefresh: () => void
}

export function ContactGroupsManager({
  contactGroups,
  contacts,
  onRefresh
}: ContactGroupsManagerProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const selectedGroupData = contactGroups.find(g => g.id === selectedGroup)
  const groupContacts = selectedGroupData?.contacts || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Groups List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Contact Groups</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Group
          </Button>
        </div>

        <div className="space-y-2">
          {contactGroups.map((group) => (
            <Card 
              key={group.id} 
              className={`cursor-pointer transition-colors ${
                selectedGroup === group.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedGroup(group.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: group.color || '#3B82F6' }}
                    />
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.member_count || 0} members
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit group
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {group.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {contactGroups.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No contact groups yet</p>
                <Button size="sm" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Group
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Group Details */}
      <div className="lg:col-span-2">
        {selectedGroupData ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: selectedGroupData.color || '#3B82F6' }}
                  />
                  <div>
                    <CardTitle>{selectedGroupData.name}</CardTitle>
                    <CardDescription>
                      {selectedGroupData.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {groupContacts.length} members
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {groupContacts.length > 0 ? (
                <div className="space-y-3">
                  {groupContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {contact.title} {contact.account_name && `• ${contact.account_name}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {contact.decision_maker_level === 'Primary' && (
                          <Badge variant="default">Primary DM</Badge>
                        )}
                        {contact.relationship_strength === 'champion' && (
                          <Badge variant="secondary">Champion</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No contacts in this group</p>
                  <Button size="sm" className="mt-2">
                    Add Contacts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Select a Contact Group</h3>
              <p className="text-muted-foreground">
                Choose a group from the left to view its members and details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}