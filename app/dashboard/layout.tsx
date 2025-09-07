import type React from "react"
import DashboardClientLayout from "@/components/dashboard/dashboard-client-layout"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"
import { BillingAccessGate } from "@/components/billing/billing-access-gate"
import { TourProvider } from "@/lib/hooks/use-tour"
import { TourOverlay } from "@/components/ui/tour-overlay"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TourProvider>
      <DashboardErrorBoundary>
        <BillingAccessGate>
          <DashboardClientLayout>{children}</DashboardClientLayout>
        </BillingAccessGate>
      </DashboardErrorBoundary>
      <TourOverlay />
    </TourProvider>
  )
}
