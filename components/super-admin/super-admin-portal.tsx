"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  FileText,
  Shield
} from 'lucide-react'

interface SuperAdminData {
  overview: {
    totalOrganizations: number
    activeTrials: number
    paidOrganizations: number
    totalMRR: number
    unpaidInvoices: number
    totalUnpaidAmount: number
  }
  organizations: Array<{
    id: string
    name: string
    created_at: string
    seat_cap: number
    plan: string
    trial_ends_at: string | null
    premium_addon: boolean
    stripe_customer_id: string | null
    activeUsers: number
    trialActive: boolean
  }>
  recentInvoices: Array<{
    id: string
    invoice_number: string
    status: string
    total_amount: number
    due_date: string
    created_at: string
    organization_name: string
  }>
}

export function SuperAdminPortal() {
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSuperAdminData()
  }, [])

  const loadSuperAdminData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/super-admin/overview')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. Super admin privileges required.')
        } else {
          setError('Failed to load data')
        }
        return
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load super admin data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p>Loading super admin portal...</p>
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
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const { overview, organizations, recentInvoices } = data

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Super Admin Portal</h1>
          <p className="text-muted-foreground">Fastenr Staff Only - Billing & Organization Management</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalOrganizations}</div>
            <p className="text-xs text-muted-foreground">
              {overview.paidOrganizations} paying, {overview.activeTrials} on trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.totalMRR)}</div>
            <p className="text-xs text-muted-foreground">
              From {overview.paidOrganizations} paying customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.unpaidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overview.totalUnpaidAmount)} outstanding
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
          <TabsTrigger value="projections">Revenue Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>
                Complete list of organizations with billing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{org.name}</h4>
                        {org.trialActive ? (
                          <Badge variant="secondary">Trial</Badge>
                        ) : (
                          <Badge variant="default">Paid</Badge>
                        )}
                        {org.premium_addon && (
                          <Badge variant="outline">Premium</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>
                          <Users className="h-3 w-3 inline mr-1" />
                          {org.activeUsers}/{org.seat_cap} seats
                        </div>
                        <div>
                          Plan: {org.plan.replace('_', ' ')}
                        </div>
                        <div>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Created: {formatDate(org.created_at)}
                        </div>
                        {org.trial_ends_at && org.trialActive && (
                          <div className="text-orange-600">
                            Trial ends: {formatDate(org.trial_ends_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Latest invoices across all organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{invoice.invoice_number}</h4>
                        <Badge className={getStatusColor(invoice.status)} variant="secondary">
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>{invoice.organization_name}</div>
                        <div>{formatCurrency(invoice.total_amount)}</div>
                        <div>Due: {formatDate(invoice.due_date)}</div>
                        <div>Created: {formatDate(invoice.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Projections
              </CardTitle>
              <CardDescription>
                Upcoming billing and revenue forecasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Trials Converting This Month</h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {organizations.filter(org => {
                        if (!org.trial_ends_at) return false
                        const trialEnd = new Date(org.trial_ends_at)
                        const now = new Date()
                        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        return trialEnd >= now && trialEnd <= monthEnd
                      }).length}
                    </p>
                    <p className="text-sm text-blue-600">organizations</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Projected Monthly Growth</h4>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(overview.totalMRR * 0.1)}
                    </p>
                    <p className="text-sm text-green-600">estimated (10% growth)</p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>• Current MRR: {formatCurrency(overview.totalMRR)}</p>
                  <p>• Active trials: {overview.activeTrials}</p>
                  <p>• Average revenue per organization: {formatCurrency(overview.totalMRR / Math.max(overview.paidOrganizations, 1))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}