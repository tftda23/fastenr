import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Fastenr",
  description: "Customer success insights and best practices coming soon.",
}

export default function BlogPage() {
  return (
    <ComingSoon 
      title="Customer Success Blog"
      description="We're preparing insightful articles, best practices, and industry insights to help you excel at customer success."
      expectedDate="Q1 2025"
    />
  )
}