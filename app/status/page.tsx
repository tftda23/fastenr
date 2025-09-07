import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Status - Fastenr",
  description: "System status page coming soon. Monitor Fastenr platform health.",
}

export default function StatusPage() {
  return (
    <ComingSoon 
      title="System Status"
      description="We're building a comprehensive system status page with real-time monitoring, incident reports, and service health dashboards."
      expectedDate="Q1 2025"
      notifySignup={true}
    />
  )
}