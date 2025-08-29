import { Metadata } from "next"
import { BillingPortal } from "@/components/billing/billing-portal"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Billing - Fastenr",
  description: "Manage your subscription and billing",
}

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and invoices
        </p>
      </div>
      
      <BillingPortal />
    </div>
  )
}