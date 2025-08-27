"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Download, Calendar, AlertCircle } from 'lucide-react'
import { PaymentMethodSetup } from './payment-method-setup'
import { InvoiceList } from './invoice-list'

interface BillingData {
  subscription: {
    plan: string
    seatCap: number
    activeUsers: number
    trialActive: boolean
    trialEndsAt: string | null
    monthlyAfterTrial: number
    currency: string
  }
  paymentMethods: Array<{
    id: string
    type: string
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
    is_default: boolean
  }>
  invoices: Array<{
    id: string
    invoice_number: string
    status: string
    total_amount: number
    due_date: string
    created_at: string
  }>
}

export function BillingPortal() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentSetup, setShowPaymentSetup] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      
      // Load subscription data
      const subRes = await fetch('/api/admin/subscription')
      const subData = await subRes.json()
      
      // Load payment methods
      const pmRes = await fetch('/api/billing/payment-methods')
      const pmData = await pmRes.json()
      
      // Load invoices
      const invRes = await fetch('/api/billing/invoices')
      const invData = await invRes.json()

      setBillingData({
        subscription: {
          plan: subData.plan,
          seatCap: subData.seatCap,
          activeUsers: subData.activeUsers,
          trialActive: subData.trialActive,
          trialEndsAt: subData.trialEndsAt,
          monthlyAfterTrial: subData.pricing.monthlyAfterTrial,
          currency: subData.pricing.currency
        },
        paymentMethods: pmData.payment_methods || [],
        invoices: invData.invoices || []
      })
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodAdded = () => {
    setShowPaymentSetup(false)
    loadBillingData()
  }

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading billing information...</div>
  }

  if (!billingData) {
    return <div className="py-8 text-center text-red-600">Failed to load billing data</div>
  }

  const { subscription, paymentMethods, invoices } = billingData

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your Fastenr subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="font-medium capitalize">{subscription.plan.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seats</p>
              <p className="font-medium">{subscription.activeUsers} / {subscription.seatCap}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="font-medium">
                {subscription.currency}{subscription.monthlyAfterTrial}
                {subscription.trialActive && (
                  <Badge variant="secondary" className="ml-2">Trial Active</Badge>
                )}
              </p>
            </div>
          </div>

          {subscription.trialActive && subscription.trialEndsAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Your trial ends on {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="payment-methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for automatic billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No payment methods added yet</p>
                  <Button onClick={() => setShowPaymentSetup(true)}>
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">
                            {pm.brand?.toUpperCase()} •••• {pm.last4}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires {pm.exp_month}/{pm.exp_year}
                          </p>
                        </div>
                        {pm.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPaymentSetup(true)}
                    className="w-full"
                  >
                    Add Another Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceList 
            invoices={invoices} 
            onDownload={downloadInvoice}
          />
        </TabsContent>
      </Tabs>

      {showPaymentSetup && (
        <PaymentMethodSetup
          onSuccess={handlePaymentMethodAdded}
          onCancel={() => setShowPaymentSetup(false)}
        />
      )}
    </div>
  )
}