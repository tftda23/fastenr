import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers - Fastenr",
  description: "Career opportunities coming soon.",
}

export default function CareersPage() {
  return (
    <ComingSoon 
      title="Join Our Team"
      description="We're building an amazing team! Career opportunities and job openings will be posted here soon as we continue to grow."
      expectedDate="Q1 2025"
      notifySignup={true}
    />
  )
}