import { ComingSoon } from '@/components/coming-soon'
import { Metadata } from "next"
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: "Documentation - Fastenr", 
  description: "Documentation coming soon.",
}

export default function DocumentationSlugPage() {
  // Redirect individual docs to the main documentation coming soon page
  redirect('/documentation')
}