import type React from "react"
import DashboardClientLayout from "@/components/dashboard/dashboard-client-layout"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardErrorBoundary>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </DashboardErrorBoundary>
  )
}
