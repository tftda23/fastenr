"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Contact, ContactGroup } from '@/lib/types'

interface AddContactsToGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  group: ContactGroup | null
  allContacts: Contact[]
}

export function AddContactsToGroupDialog({
  open,
  onOpenChange,
  onSuccess,
  group,
  allContacts
}: AddContactsToGroupDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const contactsPerPage = 10

  // Reset selection when dialog opens/closes or group changes
  useEffect(() => {
    if (open && group) {
      // Pre-select contacts that are already in the group
      const existingContactIds = group.contacts?.map(c => c.id) || []
      setSelectedContacts(existingContactIds)
    } else {
      setSelectedContacts([])
      setSearchQuery('')
      setCurrentPage(1)
    }
  }, [open, group])

  // Filter contacts based on search query
  const filteredContacts = allContacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase()
    const email = contact.email?.toLowerCase() || ''
    const title = contact.title?.toLowerCase() || ''
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           title.includes(searchLower)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage)
  const startIndex = (currentPage - 1) * contactsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, startIndex + contactsPerPage)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAll = () => {
    // Select/deselect all contacts on current page
    const currentPageContactIds = paginatedContacts.map(c => c.id)
    const allCurrentPageSelected = currentPageContactIds.every(id => selectedContacts.includes(id))
    
    if (allCurrentPageSelected) {
      // Remove current page contacts from selection
      setSelectedContacts(prev => prev.filter(id => !currentPageContactIds.includes(id)))
    } else {
      // Add current page contacts to selection
      setSelectedContacts(prev => [...new Set([...prev, ...currentPageContactIds])])
    }
  }

  const handleSelectAllFiltered = () => {
    // Select/deselect all filtered contacts (across all pages)
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!group) return

    setLoading(true)
    
    try {
      const response = await fetch(`/api/contact-groups/${group.id}/members`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactIds: selectedContacts }),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.text()
        console.error('Failed to update group members:', error)
      }
    } catch (error) {
      console.error('Error updating group members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Contacts to {group?.name}</DialogTitle>
          <DialogDescription>
            Select contacts to add to this group. You can search and select multiple contacts.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts by name, email, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Select All Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-page"
                  checked={paginatedContacts.length > 0 && paginatedContacts.every(c => selectedContacts.includes(c.id))}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-page" className="text-sm font-medium">
                  Select page ({paginatedContacts.length} contacts)
                </Label>
              </div>
              
              {filteredContacts.length > contactsPerPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllFiltered}
                  className="text-xs"
                >
                  {selectedContacts.length === filteredContacts.length ? 'Deselect' : 'Select'} all {filteredContacts.length} contacts
                </Button>
              )}
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto border rounded-md">
            {paginatedContacts.length > 0 ? (
              <div className="divide-y">
                {paginatedContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50">
                    <Checkbox
                      id={`contact-${contact.id}`}
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactToggle(contact.id)}
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {contact.first_name} {contact.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {contact.email}
                        </div>
                        {contact.title && (
                          <div className="text-xs text-muted-foreground truncate">
                            {contact.title}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No contacts found matching your search' : 'No contacts available'}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + contactsPerPage, filteredContacts.length)} of {filteredContacts.length} contacts
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Selection Summary */}
          <div className="text-sm text-muted-foreground">
            {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Updating...' : `Update Group (${selectedContacts.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}