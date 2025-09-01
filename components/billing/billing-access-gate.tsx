"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CreditCard, CheckCircle2 } from 'lucide-react'
import { PaymentMethodSetup } from './payment-method-setup'

interface BillingAccessGateProps {
  children: React.ReactNode
}

interface BillingStatus {
  hasAccess: boolean
  needsBilling: boolean
  hasPaymentMethod: boolean
  organizationName?: string
  trialEndsAt?: string
  lastBillingDate?: string
}

const CACHE_KEY = 'billing_status'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function BillingAccessGate({ children }: BillingAccessGateProps) {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(() => {
    // Try to load cached status immediately for better UX
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
    }
    // Default to optimistic access - fail open
    return {
      hasAccess: true,
      needsBilling: false,
      hasPaymentMethod: false
    }
  })
  const [showPaymentSetup, setShowPaymentSetup] = useState(false)

  useEffect(() => {
    // Always check in background, never show loading
    checkBillingAccess()
  }, [])

  const checkBillingAccess = async () => {
    try {
      
      // Check billing access via API
      const response = await fetch('/api/billing/access-check')
      const data = await response.json()
      
      let newStatus: BillingStatus

      if (response.status === 402) {
        // Payment required
        newStatus = {
          hasAccess: false,
          needsBilling: data.billing_required || false,
          hasPaymentMethod: !data.payment_method_required,
          organizationName: data.organization_name,
          trialEndsAt: data.trial_ends_at,
          lastBillingDate: data.last_billing_date
        }
      } else if (response.ok) {
        // Access granted
        newStatus = {
          hasAccess: true,
          needsBilling: data.needs_billing || false,
          hasPaymentMethod: data.has_payment_method || false
        }
      } else {
        // Other error
        newStatus = {
          hasAccess: true, // Fail open for now
          needsBilling: false,
          hasPaymentMethod: false
        }
      }

      setBillingStatus(newStatus)

      // Cache the result for better UX
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: newStatus,
            timestamp: Date.now()
          }))
        } catch (e) {
          // Ignore cache storage errors
        }
      }
    } catch (error) {
      console.error('Billing access check failed:', error)
      const errorStatus = {
        hasAccess: true, // Fail open for now
        needsBilling: false,
        hasPaymentMethod: false
      }
      setBillingStatus(errorStatus)
    } finally {
      // No loading state to manage
    }
  }

  const handlePaymentMethodAdded = () => {
    setShowPaymentSetup(false)
    checkBillingAccess() // Recheck access
  }

  // If access is granted (default), show the protected content
  if (billingStatus?.hasAccess) {
    return <>{children}</>
  }

  // If access is denied, show billing gate
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-orange-900">Billing Required</CardTitle>
            <CardDescription className="text-orange-700">
              Your trial has ended and billing is required to continue using Fastenr
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Trial Status</span>
                </div>
                <Badge variant="destructive">Expired</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Payment Method</span>
                </div>
                {billingStatus?.hasPaymentMethod ? (
                  <Badge variant="secondary">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Added
                  </Badge>
                ) : (
                  <Badge variant="outline">Required</Badge>
                )}
              </div>
            </div>

            {!billingStatus?.hasPaymentMethod && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground text-center">
                  Add a payment method to continue using Fastenr
                </div>
                <Button 
                  onClick={() => setShowPaymentSetup(true)}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            )}

            {billingStatus?.hasPaymentMethod && billingStatus?.needsBilling && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground text-center">
                  Your payment method is ready. Billing will be processed automatically.
                </div>
                <Button 
                  onClick={checkBillingAccess}
                  variant="outline"
                  className="w-full"
                >
                  Check Status
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
              Need help? Contact support at support@fastenr.com
            </div>
          </CardContent>
        </Card>

        {showPaymentSetup && (
          <PaymentMethodSetup
            onSuccess={handlePaymentMethodAdded}
            onCancel={() => setShowPaymentSetup(false)}
          />
        )}
      </div>
    </div>
  )
}