import { Suspense } from 'react'
import CalendarClient from '@/components/calendar/calendar-client'
import { Skeleton } from '@/components/ui/skeleton'

export default function CalendarPage() {
  return (
    <div className="container mx-auto">

      
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