import type React from "react"
import DashboardClientLayout from "@/components/dashboard/dashboard-client-layout"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { BillingAccessGate } from "@/components/billing/billing-access-gate"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardErrorBoundary>
      <BillingAccessGate>
        <DashboardClientLayout>{children}</DashboardClientLayout>
      </BillingAccessGate>
    </DashboardErrorBoundary>
  )
}
