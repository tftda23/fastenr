import type React from "react"
import DashboardClientLayout from "@/components/dashboard/dashboard-client-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>
}
