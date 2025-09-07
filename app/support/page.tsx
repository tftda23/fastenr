import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - Fastenr",
  description: "Support center coming soon. Get help with Fastenr.",
}

export default function SupportPage() {
  return (
    <ComingSoon 
      title="Support Center"
      description="We're building a comprehensive support center with guides, tutorials, and help articles to help you succeed with Fastenr."
      expectedDate="Q1 2025"
    />
  )
}