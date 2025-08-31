import { notFound, redirect } from 'next/navigation'

export default function WatchDemoPage() {
  redirect('/demo')
  
  // This will never be reached due to redirect
  return null
}