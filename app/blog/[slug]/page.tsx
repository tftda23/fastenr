import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Blog Post - Fastenr",
  description: "Blog posts coming soon.",
}

export default function BlogPostPage() {
  // Redirect individual blog posts to the main blog coming soon page
  redirect('/blog')
}