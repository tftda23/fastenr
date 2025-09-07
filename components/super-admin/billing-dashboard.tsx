"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CreditCard,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  TrendingUp,
  Loader2
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface BillingOrganization {
  organization_id: string
  organization_name: string
  seat_cap: number
  active_users: number
  trial_active: boolean
  trial_ends_at: string | null
  last_billing_date: string | null
  billing_status: string
  payment_method_status: string
  current_period_changes: number
  outstanding_amount: number
  stripe_customer_id: string | null
  needs_billing: boolean
  payment_method: {
    type: string
    brand: string
    last4: string
    exp_month: number
    exp_year: number
    created_at: string
  } | null
  outstanding_invoices: Array<{
    id: string
    invoice_number: string
    status: string
    total_amount: number
    amount_due: number
    due_date: string
    created_at: string
  }>
}

interface BillingSummary {
  totalOrganizations: number
  trialsActive: number
  paidOrganizations: number
  needsBilling: number
  hasPaymentMethod: number
  missingPaymentMethod: number
  totalOutstanding: number
  outstandingInvoices: number
}

interface BillingEvent {
  id: string
  organization_id: string
  organization_name: string
  event_type: string
  seat_count: number
  previous_seat_count: number | null
  is_license_change: boolean
  change_effective_date: string | null
  total_monthly_cost: number
  effective_date: string
  metadata: any
}

interface BillingDashboardData {
  summary: BillingSummary
  organizations: BillingOrganization[]
  recentBillingEvents: BillingEvent[]
}

export function BillingDashboard() {
  const [data, setData] = useState<BillingDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/billing')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Super admin privileges required.')
        } else {
          setError('Failed to load billing data')
        }
        return
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load billing data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedOrgs.size === 0) {
      alert('Please select organizations first')
      return
    }

    const confirmMessage = {
      generate_invoices: `Generate invoices for ${selectedOrgs.size} organizations?`,
      process_payments: `Process payments for ${selectedOrgs.size} organizations?`,
      send_invoices: `Send invoices to ${selectedOrgs.size} organizations?`
    }[action]

    if (!confirm(confirmMessage)) return

    try {
      setActionLoading(action)
      const response = await fetch('/api/super-admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          organizationIds: Array.from(selectedOrgs)
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`${action} completed successfully`)
        setSelectedOrgs(new Set())
        await loadBillingData()
      } else {
        alert(`Failed to ${action}: ${result.error}`)
      }
    } catch (error) {
      alert(`Error during ${action}`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleOrgSelection = (orgId: string) => {
    const newSelected = new Set(selectedOrgs)
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId)
    } else {
      newSelected.add(orgId)
    }
    setSelectedOrgs(newSelected)
  }

  const selectAllNeedsBilling = () => {
    if (!data) return
    const needsBillingOrgs = data.organizations
      .filter(org => org.needs_billing)
      .map(org => org.organization_id)
    setSelectedOrgs(new Set(needsBillingOrgs))
  }

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getBillingStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'none': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-4 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Organizations table skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4 p-4 border rounded-lg">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Loading spinner in center */}
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No billing data available</p>
      </div>
    )
  }

  const { summary, organizations, recentBillingEvents } = data

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              {summary.trialsActive} trials, {summary.paidOrganizations} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Billing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.needsBilling}</div>
            <p className="text-xs text-muted-foreground">
              Organizations requiring billing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.hasPaymentMethod}</div>
            <p className="text-xs text-muted-foreground">
              {summary.missingPaymentMethod} missing payment methods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.outstandingInvoices} unpaid invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Actions</CardTitle>
          <CardDescription>
            Select organizations and perform bulk billing operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              onClick={selectAllNeedsBilling}
              disabled={summary.needsBilling === 0}
            >
              Select All Needing Billing ({summary.needsBilling})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSelectedOrgs(new Set())}
              disabled={selectedOrgs.size === 0}
            >
              Clear Selection
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedOrgs.size} organizations selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleBulkAction('generate_invoices')}
              disabled={selectedOrgs.size === 0 || actionLoading === 'generate_invoices'}
            >
              <FileText className="h-4 w-4 mr-2" />
              {actionLoading === 'generate_invoices' ? 'Generating...' : 'Generate Invoices'}
            </Button>
            <Button 
              onClick={() => handleBulkAction('process_payments')}
              disabled={selectedOrgs.size === 0 || actionLoading === 'process_payments'}
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {actionLoading === 'process_payments' ? 'Processing...' : 'Process Payments'}
            </Button>
            <Button 
              onClick={() => handleBulkAction('send_invoices')}
              disabled={selectedOrgs.size === 0 || actionLoading === 'send_invoices'}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              {actionLoading === 'send_invoices' ? 'Sending...' : 'Send Invoices'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations Billing Status</CardTitle>
          <CardDescription>
            Complete billing overview for all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {organizations.map((org) => (
              <div key={org.organization_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedOrgs.has(org.organization_id)}
                      onCheckedChange={() => toggleOrgSelection(org.organization_id)}
                    />
                    <div>
                      <h4 className="font-medium">{org.organization_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getBillingStatusColor(org.billing_status)} variant="secondary">
                          {org.billing_status}
                        </Badge>
                        <Badge className={getPaymentMethodColor(org.payment_method_status)} variant="secondary">
                          {org.payment_method_status === 'valid' ? 'Payment Method' : 'No Payment Method'}
                        </Badge>
                        {org.needs_billing && (
                          <Badge variant="destructive">Needs Billing</Badge>
                        )}
                        {org.current_period_changes > 0 && (
                          <Badge variant="outline">License Changed</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {org.outstanding_amount > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(org.outstanding_amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Seats
                    </div>
                    <div>{org.active_users}/{org.seat_cap}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Trial Status
                    </div>
                    <div>
                      {org.trial_active ? (
                        <span className="text-blue-600">
                          Ends {formatDate(org.trial_ends_at)}
                        </span>
                      ) : (
                        <span className="text-green-600">Trial Ended</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      Last Billing
                    </div>
                    <div>{formatDate(org.last_billing_date)}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      Payment Method
                    </div>
                    <div>
                      {org.payment_method ? (
                        <span>
                          {org.payment_method.brand} ****{org.payment_method.last4}
                        </span>
                      ) : (
                        <span className="text-red-600">None</span>
                      )}
                    </div>
                  </div>
                </div>

                {org.outstanding_invoices.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Outstanding Invoices:</div>
                    <div className="space-y-1">
                      {org.outstanding_invoices.map(invoice => (
                        <div key={invoice.id} className="flex items-center justify-between text-sm">
                          <span>{invoice.invoice_number}</span>
                          <span className="font-medium">{formatCurrency(invoice.amount_due)}</span>
                          <span className="text-muted-foreground">Due {formatDate(invoice.due_date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Billing Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Events</CardTitle>
          <CardDescription>
            Latest billing and license change activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentBillingEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {event.is_license_change ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <div className="font-medium">{event.organization_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.event_type.replace('_', ' ')} - {event.seat_count} seats
                      {event.is_license_change && event.previous_seat_count && (
                        <span> (was {event.previous_seat_count})</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(event.total_monthly_cost)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(event.effective_date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}