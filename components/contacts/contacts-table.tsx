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
  Building2, Crown, Users, Filter, RefreshCw, Briefcase
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
  
  const getVariant = (level: string) => {
    switch (level) {
      case 'C-Level': return 'default'
      case 'VP': return 'secondary'
      case 'Director': return 'outline'
      default: return 'outline'
    }
  }
  
  return <Badge variant={getVariant(level)}>{level}</Badge>
}

const DecisionMakerBadge = ({ level }: { level?: string }) => {
  if (!level) return null
  
  const getVariant = (level: string) => {
    switch (level) {
      case 'Primary': return 'default'
      case 'Influencer': return 'secondary'
      case 'User': return 'outline'
      case 'Gatekeeper': return 'outline'
      default: return 'outline'
    }
  }
  
  const getIcon = (level: string) => {
    if (level === 'Primary') return <Crown className="h-3 w-3 mr-1" />
    return null
  }
  
  return (
    <Badge variant={getVariant(level)} className="flex items-center">
      {getIcon(level)}
      {level}
    </Badge>
  )
}

const RelationshipBadge = ({ strength }: { strength?: string }) => {
  if (!strength) return null
  
  const getVariant = (strength: string) => {
    switch (strength) {
      case 'champion': return 'default'
      case 'supporter': return 'secondary'
      case 'neutral': return 'outline'
      case 'detractor': return 'destructive'
      default: return 'outline'
    }
  }
  
  return <Badge variant={getVariant(strength)}>{strength}</Badge>
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
        id: "name",
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }) => {
          const contact = row.original
          const fullName = contact.full_name || `${contact.first_name} ${contact.last_name}`
          return (
            <div className="space-y-1">
              <div className="font-medium">{fullName}</div>
              <div className="text-sm text-muted-foreground">
                {contact.title && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {contact.title}
                  </div>
                )}
                {contact.department && (
                  <div className="text-xs text-muted-foreground">
                    {contact.department}
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      {
        id: "contact_info",
        header: "Contact Info",
        cell: ({ row }) => {
          const contact = row.original
          return (
            <div className="space-y-1">
              {contact.email && (
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>
          )
        },
      },
      {
        id: "account",
        accessorKey: "account_name",
        header: "Account",
        cell: ({ row }) => {
          const contact = row.original
          return contact.account_name ? (
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {contact.account_name}
            </div>
          ) : (
            <span className="text-muted-foreground">No account</span>
          )
        },
      },
      {
        id: "seniority",
        accessorKey: "seniority_level",
        header: "Seniority",
        cell: ({ row }) => <SeniorityBadge level={row.original.seniority_level} />,
      },
      {
        id: "decision_maker",
        accessorKey: "decision_maker_level",
        header: "Decision Maker",
        cell: ({ row }) => <DecisionMakerBadge level={row.original.decision_maker_level} />,
      },
      {
        id: "relationship",
        accessorKey: "relationship_strength",
        header: "Relationship",
        cell: ({ row }) => <RelationshipBadge strength={row.original.relationship_strength} />,
      },
      {
        id: "status",
        accessorKey: "contact_status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.contact_status} />,
      },
      {
        id: "last_engagement",
        accessorKey: "last_engagement_date",
        header: "Last Engagement",
        cell: ({ row }) => {
          const date = row.original.last_engagement_date
          if (!date) return <span className="text-muted-foreground">Never</span>
          
          const engagementDate = new Date(date)
          const daysSince = Math.floor((Date.now() - engagementDate.getTime()) / (1000 * 60 * 60 * 24))
          
          return (
            <div className="text-sm">
              <div>{format(engagementDate, "MMM dd, yyyy")}</div>
              <div className={`text-xs ${daysSince > 90 ? 'text-red-500' : daysSince > 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                {daysSince === 0 ? 'Today' : `${daysSince} days ago`}
              </div>
            </div>
          )
        },
      },
      {
        id: "manager",
        accessorKey: "manager_name",
        header: "Manager",
        cell: ({ row }) => {
          const manager = row.original.manager_name
          return manager ? (
            <div className="text-sm">{manager}</div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
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
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(contact.email || '')}
                >
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit contact
                </DropdownMenuItem>
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
    <div className="space-y-4">
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
      <DataTable
        data={contacts.data}
        columns={columns}
        title={`Contacts (${contacts.count || contacts.data.length})`}
        description="Manage customer contacts and stakeholders"
        searchPlaceholder="Search contacts..."
        exportFilename="contacts"
      />
    </div>
  )
}