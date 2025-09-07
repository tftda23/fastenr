"use client"

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/analytics/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, 
  Building2, Crown, Users, Filter, RefreshCw, Briefcase, Copy
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Contact, 
  ContactGroup, 
  ContactsResponse, 
  ContactFilters, 
  ContactSortOptions,
  Account
} from '@/lib/types'
import { format } from 'date-fns'

interface ContactsTableProps {
  contacts: ContactsResponse
  contactGroups: ContactGroup[]
  accounts: Account[]
  filters: ContactFilters
  sort: ContactSortOptions
  currentPage: number
  loading: boolean
  onFilterChange: (filters: Partial<ContactFilters>) => void
  onSortChange: (sort: ContactSortOptions) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
}

// Helper components for badges
const SeniorityBadge = ({ level }: { level?: string }) => {
  if (!level) return null
  
  const getStyles = (level: string) => {
    switch (level) {
      case 'C-Level': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'VP': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Director': return 'bg-gray-50 text-gray-600 border-gray-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }
  
  return (
    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getStyles(level)}`}>
      {level}
    </Badge>
  )
}

const DecisionMakerBadge = ({ level }: { level?: string }) => {
  if (!level) return null
  
  const getStyles = (level: string) => {
    switch (level) {
      case 'Primary': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Influencer': return 'bg-green-50 text-green-700 border-green-200'
      case 'User': return 'bg-gray-50 text-gray-600 border-gray-200'
      case 'Gatekeeper': return 'bg-orange-50 text-orange-600 border-orange-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }
  
  const getIcon = (level: string) => {
    if (level === 'Primary') return <Crown className="h-2.5 w-2.5 mr-1" />
    return null
  }
  
  return (
    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 flex items-center ${getStyles(level)}`}>
      {getIcon(level)}
      {level}
    </Badge>
  )
}

const RelationshipBadge = ({ strength }: { strength?: string }) => {
  if (!strength) return null
  
  const getStyles = (strength: string) => {
    switch (strength) {
      case 'champion': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'supporter': return 'bg-lime-50 text-lime-700 border-lime-200'
      case 'neutral': return 'bg-gray-50 text-gray-600 border-gray-200'
      case 'detractor': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }
  
  return (
    <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getStyles(strength)}`}>
      {strength}
    </Badge>
  )
}

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) return null
  
  const getVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'left_company': return 'destructive'
      case 'unresponsive': return 'outline'
      default: return 'outline'
    }
  }
  
  return <Badge variant={getVariant(status)}>{status}</Badge>
}

export function ContactsTable({
  contacts,
  contactGroups,
  accounts,
  filters,
  sort,
  currentPage,
  loading,
  onFilterChange,
  onSortChange,
  onPageChange,
  onRefresh
}: ContactsTableProps) {
  
  const columns: ColumnDef<Contact>[] = useMemo(
    () => [
      {
        id: "contact",
        accessorKey: "last_name",
        header: "Contact",
        size: 350,
        minSize: 280,
        sortingFn: (rowA, rowB) => {
          const lastNameA = rowA.original.last_name || ''
          const lastNameB = rowB.original.last_name || ''
          return lastNameA.localeCompare(lastNameB)
        },
        cell: ({ row }) => {
          const contact = row.original
          const fullName = contact.full_name || `${contact.first_name} ${contact.last_name}`
          return (
            <div className="space-y-2">
              {/* Name and Title */}
              <div>
                <div className="font-medium">{fullName}</div>
                {contact.title && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    {contact.title}
                    {contact.department && (
                      <span className="text-xs">• {contact.department}</span>
                    )}
                  </div>
                )}
              </div>
              

              {/* Account */}
              {contact.account_name && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{contact.account_name}</span>
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: "role",
        header: "Role",
        size: 140,
        minSize: 120,
        cell: ({ row }) => {
          const contact = row.original
          return (
            <div className="flex flex-wrap gap-1">
              {/* Only show most important badges */}
              {contact.decision_maker_level && ['Primary', 'Influencer'].includes(contact.decision_maker_level) && (
                <DecisionMakerBadge level={contact.decision_maker_level} />
              )}
              {contact.seniority_level && ['C-Level', 'VP'].includes(contact.seniority_level) && (
                <SeniorityBadge level={contact.seniority_level} />
              )}
              {/* Show relationship if it's strong/weak */}
              {contact.relationship_strength && ['champion', 'detractor'].includes(contact.relationship_strength) && (
                <RelationshipBadge strength={contact.relationship_strength} />
              )}
            </div>
          )
        },
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        size: 200,
        minSize: 160,
        cell: ({ row }) => {
          const email = row.original.email
          if (!email) return <span className="text-muted-foreground text-sm">-</span>
          
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <a href={`mailto:${email}`} className="hover:underline truncate">
                  {email}
                </a>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(email)}
                title="Copy email"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )
        },
      },
      {
        id: "phone",
        accessorKey: "phone", 
        header: "Phone",
        size: 160,
        minSize: 140,
        cell: ({ row }) => {
          const phone = row.original.phone
          if (!phone) return <span className="text-muted-foreground text-sm">-</span>
          
          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <a href={`tel:${phone}`} className="hover:underline whitespace-nowrap">
                  {phone}
                </a>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => navigator.clipboard.writeText(phone)}
                title="Copy phone"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )
        },
      },
      {
        id: "status",
        accessorKey: "contact_status",
        header: "Status",
        size: 100,
        minSize: 80,
        cell: ({ row }) => {
          const status = row.original.contact_status
          if (!status) return <span className="text-muted-foreground text-sm">-</span>
          
          const getStatusDisplay = (status: string) => {
            switch (status) {
              case 'active': return { text: 'Active', color: 'text-green-600' }
              case 'inactive': return { text: 'Inactive', color: 'text-gray-500' }
              case 'left_company': return { text: 'Left', color: 'text-red-500' }
              case 'unresponsive': return { text: 'Unresponsive', color: 'text-yellow-600' }
              default: return { text: status, color: 'text-gray-500' }
            }
          }
          
          const statusDisplay = getStatusDisplay(status)
          return (
            <span className={`text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.text}
            </span>
          )
        },
      },
      {
        id: "engagement",
        accessorKey: "last_engagement_date",
        header: "Last Contact",
        size: 120,
        minSize: 100,
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.last_engagement_date
          const dateB = rowB.original.last_engagement_date
          
          // Handle null dates - put them at the end
          if (!dateA && !dateB) return 0
          if (!dateA) return 1
          if (!dateB) return -1
          
          // Compare actual dates
          return new Date(dateA).getTime() - new Date(dateB).getTime()
        },
        cell: ({ row }) => {
          const date = row.original.last_engagement_date
          if (!date) return <span className="text-muted-foreground text-sm">Never</span>
          
          const engagementDate = new Date(date)
          const daysSince = Math.floor((Date.now() - engagementDate.getTime()) / (1000 * 60 * 60 * 24))
          
          // Better date formatting
          const formatDate = (date: Date) => {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const diffInDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffInDays === 0) return 'Today'
            if (diffInDays === 1) return 'Yesterday'
            if (diffInDays < 7) return `${diffInDays} days ago`
            if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
            if (diffInDays < 365) return format(date, 'MMM d, yyyy')
            return format(date, 'MMM d, yyyy')
          }
          
          const getColor = (daysSince: number) => {
            if (daysSince <= 7) return 'text-green-600'
            if (daysSince <= 30) return 'text-yellow-600' 
            if (daysSince <= 90) return 'text-orange-500'
            return 'text-red-500'
          }
          
          return (
            <span className={`text-sm ${getColor(daysSince)}`}>
              {formatDate(engagementDate)}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "",
        size: 60,
        minSize: 50,
        cell: ({ row }) => {
          const contact = row.original
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit contact
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="space-y-4" data-tour="contacts-table">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search contacts..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ search: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <Select 
                value={filters.account_id || 'all'} 
                onValueChange={(value) => onFilterChange({ 
                  account_id: value === 'all' ? undefined : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Seniority Level</label>
              <Select 
                value={filters.seniority_level || 'all'} 
                onValueChange={(value) => onFilterChange({ 
                  seniority_level: value === 'all' ? undefined : value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="C-Level">C-Level</SelectItem>
                  <SelectItem value="VP">VP</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Individual Contributor">Individual Contributor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Decision Maker</label>
              <Select 
                value={filters.decision_maker_level || 'all'} 
                onValueChange={(value) => onFilterChange({ 
                  decision_maker_level: value === 'all' ? undefined : value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.contact_status || 'all'} 
                onValueChange={(value) => onFilterChange({ 
                  contact_status: value === 'all' ? undefined : value as any
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="left_company">Left Company</SelectItem>
                  <SelectItem value="unresponsive">Unresponsive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onFilterChange({
                search: undefined,
                account_id: undefined,
                seniority_level: undefined,
                decision_maker_level: undefined,
                contact_status: undefined,
                relationship_strength: undefined
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="w-full overflow-hidden">
        <DataTable
          data={contacts.data}
          columns={columns}
          title={`Contacts (${contacts.count || contacts.data.length})`}
          description="Manage customer contacts and stakeholders"
          searchPlaceholder="Search contacts..."
          exportFilename="contacts"
        />
      </div>
    </div>
  )
}