import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation - Fastenr",
  description: "Comprehensive documentation coming soon.",
}

export default function DocumentationPage() {
  return (
    <ComingSoon 
      title="Documentation"
      description="We're creating comprehensive documentation, guides, and tutorials to help you get the most out of Fastenr."
      expectedDate="Q1 2025"
    />
  )
}