"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CreditCard, CheckCircle2, Clock, LogOut } from 'lucide-react'
import { PaymentMethodSetup } from './payment-method-setup'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [showPaymentSetup, setShowPaymentSetup] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    setHasMounted(true)
    
    // Clear any cached billing status during this temporary disable period
    try {
      sessionStorage.removeItem(CACHE_KEY)
    } catch (e) {
      // Ignore cache errors
    }
    
    // Skip billing check during temporary disable
    // checkBillingAccess()
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
        // Other error - fail open for authenticated users
        newStatus = {
          hasAccess: true,
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
      // Fail open for errors
      setBillingStatus({
        hasAccess: true,
        needsBilling: false,
        hasPaymentMethod: false
      })
    }
  }

  const handlePaymentMethodAdded = () => {
    setShowPaymentSetup(false)
    checkBillingAccess() // Recheck access
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Don't render anything until component has mounted (prevents hydration mismatch)
  if (!hasMounted) {
    return null
  }

  // TEMPORARY: Disable billing gate entirely until payment system is ready
  // This prevents users from getting stuck and allows full app access
  return <>{children}</>

  // If still loading billing status, show children (fail open approach)
  if (!billingStatus) {
    return <>{children}</>
  }

  // If access is granted, show the protected content
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

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center">
                Need help? Contact support at support@fastenr.com
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-3 w-3 mr-2" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
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