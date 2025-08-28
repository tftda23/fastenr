import { Suspense } from 'react'
import CalendarClient from '@/components/calendar/calendar-client'
import { Skeleton } from '@/components/ui/skeleton'

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your engagements</p>
      </div>
      
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarClient />
      </Suspense>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}