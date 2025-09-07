import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Job Opening - Fastenr",
  description: "Job opportunities coming soon.",
}

export default function CareerSlugPage() {
  // Redirect individual job posts to the main careers coming soon page
  redirect('/careers')
}