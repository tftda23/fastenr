import { redirect } from 'next/navigation'

export default function BookDemoPage() {
  redirect('/demo')
  
  // This will never be reached due to redirect
  return null
}