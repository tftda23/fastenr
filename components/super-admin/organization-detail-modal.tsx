"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileText,
  CreditCard,
  Calendar,
  Download,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'

interface OrganizationDetailModalProps {
  organizationId: string | null
  organizationName: string
  isOpen: boolean
  onClose: () => void
}

interface OrganizationDetails {
  organization: {
    id: string
    name: string
    created_at: string
    seat_cap: number
    plan: string
    trial_ends_at: string | null
    premium_addon: boolean
    stripe_customer_id: string | null
    billing_status: string
    payment_method_status: string
    last_billing_date: string | null
    active_users: number
    trial_active: boolean
  }
  invoices: Array<{
    id: string
    invoice_number: string
    status: string
    billing_period_start: string
    billing_period_end: string
    subtotal: number
    tax_amount: number
    total_amount: number
    amount_paid: number
    amount_due: number
    due_date: string
    created_at: string
    line_items: Array<{
      description: string
      quantity: number
      unit_price: number
      amount: number
    }>
  }>
  paymentMethods: Array<{
    id: string
    type: string
    brand: string
    last4: string
    exp_month: number
    exp_year: number
    is_default: boolean
    created_at: string
  }>
  billingEvents: Array<{
    id: string
    event_type: string
    seat_count: number
    previous_seat_count: number | null
    is_license_change: boolean
    total_monthly_cost: number
    effective_date: string
    metadata: any
  }>
}

export function OrganizationDetailModal({ 
  organizationId, 
  organizationName, 
  isOpen, 
  onClose 
}: OrganizationDetailModalProps) {
  const [data, setData] = useState<OrganizationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && organizationId) {
      loadOrganizationDetails()
    }
  }, [isOpen, organizationId])

  const loadOrganizationDetails = async () => {
    if (!organizationId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/super-admin/organizations/${organizationId}`)
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Super admin privileges required.')
        } else {
          setError('Failed to load organization details')
        }
        return
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load organization details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvoiceAction = async (action: string, invoiceId?: string) => {
    if (!organizationId) return

    try {
      setActionLoading(action)
      
      const response = await fetch(`/api/super-admin/organizations/${organizationId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          invoiceId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`${action} completed successfully`)
        await loadOrganizationDetails() // Refresh data
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

  const formatCurrency = (amount: number) => `£${(amount / 100).toFixed(2)}`
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'void':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'void':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organizationName}
          </DialogTitle>
          <DialogDescription>
            Complete billing and invoice details for this organization
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p>Loading organization details...</p>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {data && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="invoices">Invoices ({data.invoices.length})</TabsTrigger>
              <TabsTrigger value="payments">Payment Methods</TabsTrigger>
              <TabsTrigger value="billing-history">Billing History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Billing Status</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.organization.billing_status}</div>
                    <p className="text-xs text-muted-foreground">
                      Last billed: {formatDate(data.organization.last_billing_date)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Seats</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.organization.active_users}/{data.organization.seat_cap}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Plan: {data.organization.plan.replace('_', ' ')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(data.invoices.filter(inv => inv.status === 'open').reduce((sum, inv) => sum + inv.amount_due, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {data.invoices.filter(inv => inv.status === 'open').length} unpaid invoices
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>Created: {formatDate(data.organization.created_at)}</div>
                        <div>Stripe Customer: {data.organization.stripe_customer_id || 'Not set'}</div>
                        <div>Payment Method: {data.organization.payment_method_status}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Trial Status</h4>
                      <div className="space-y-2 text-sm">
                        {data.organization.trial_active ? (
                          <Badge variant="secondary">Trial Active</Badge>
                        ) : (
                          <Badge variant="default">Trial Ended</Badge>
                        )}
                        {data.organization.trial_ends_at && (
                          <div>Trial ends: {formatDate(data.organization.trial_ends_at)}</div>
                        )}
                        {data.organization.premium_addon && (
                          <Badge variant="outline">Premium Add-on</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">All Invoices</h3>
                <Button 
                  onClick={() => handleInvoiceAction('generate_invoice')}
                  disabled={actionLoading === 'generate_invoice'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {actionLoading === 'generate_invoice' ? 'Generating...' : 'Generate Invoice'}
                </Button>
              </div>

              <div className="space-y-3">
                {data.invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(invoice.status)}
                          <div>
                            <h4 className="font-medium">{invoice.invoice_number}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(invoice.status)} variant="secondary">
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(invoice.billing_period_start)} - {formatDate(invoice.billing_period_end)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {formatCurrency(invoice.total_amount)}
                          </div>
                          {invoice.amount_due > 0 && (
                            <div className="text-sm text-red-600">
                              {formatCurrency(invoice.amount_due)} due
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Subtotal:</span> {formatCurrency(invoice.subtotal)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tax:</span> {formatCurrency(invoice.tax_amount)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span> {formatDate(invoice.due_date)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span> {formatDate(invoice.created_at)}
                        </div>
                      </div>

                      {invoice.line_items.length > 0 && (
                        <div className="border-t pt-3">
                          <h5 className="font-medium text-sm mb-2">Line Items:</h5>
                          <div className="space-y-1">
                            {invoice.line_items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.description}</span>
                                <span>{formatCurrency(item.amount * 100)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleInvoiceAction('download_pdf', invoice.id)}
                          disabled={actionLoading === 'download_pdf'}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        {invoice.status === 'open' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleInvoiceAction('send_invoice', invoice.id)}
                            disabled={actionLoading === 'send_invoice'}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {data.invoices.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No invoices found for this organization</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Configured payment methods for this organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-4 w-4" />
                          <div>
                            <div className="font-medium">
                              {method.brand.toUpperCase()} ****{method.last4}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Expires {method.exp_month}/{method.exp_year}
                            </div>
                          </div>
                        </div>
                        {method.is_default && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                    ))}

                    {data.paymentMethods.length === 0 && (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No payment methods configured</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Events</CardTitle>
                  <CardDescription>
                    History of billing events and license changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.billingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <div className="font-medium">
                              {event.event_type.replace('_', ' ')} - {event.seat_count} seats
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(event.effective_date)}
                              {event.is_license_change && event.previous_seat_count && (
                                <span> (changed from {event.previous_seat_count} seats)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(event.total_monthly_cost)}</div>
                          {event.is_license_change && (
                            <Badge variant="outline" className="text-xs">License Change</Badge>
                          )}
                        </div>
                      </div>
                    ))}

                    {data.billingEvents.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No billing events found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}