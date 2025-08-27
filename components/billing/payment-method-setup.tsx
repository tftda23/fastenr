"use client"

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentMethodSetupProps {
  onSuccess: () => void
  onCancel: () => void
}

function PaymentMethodForm({ onSuccess, onCancel }: PaymentMethodSetupProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      // Get setup intent from backend
      const setupResponse = await fetch('/api/billing/setup-payment', {
        method: 'POST',
      })
      
      const { client_secret } = await setupResponse.json()

      if (!client_secret) {
        throw new Error('Failed to create setup intent')
      }

      // Confirm setup intent with payment method
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: confirmError } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Failed to save payment method')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Payment Method
        </Button>
      </div>
    </form>
  )
}

export function PaymentMethodSetup({ onSuccess, onCancel }: PaymentMethodSetupProps) {
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a credit or debit card for automatic billing
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <PaymentMethodForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}