"use client"

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth, parseISO, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIInsightsButton } from '@/components/ai/ai-insights-button'
import { devLog } from '@/lib/logger'
import { CreateEngagementDialog } from './create-engagement-dialog'
import { EngagementDetailsModal } from './engagement-details-modal'

type ViewMode = 'month' | 'week' | 'day'

interface Engagement {
  id: string
  title: string
  description?: string
  type: 'meeting' | 'call' | 'email' | 'note' | 'demo' | 'training'
  scheduled_at: string
  duration_minutes?: number
  is_all_day?: boolean
  outcome?: 'positive' | 'neutral' | 'negative' | 'action_required'
  account?: {
    name: string
    id: string
  }
  user?: {
    full_name: string
  }
}

export default function CalendarClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [createEngagementDate, setCreateEngagementDate] = useState<Date | null>(null)
  const [createEngagementTime, setCreateEngagementTime] = useState<string | null>(null)
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null)

  useEffect(() => {
    fetchEngagements()
  }, [currentDate, viewMode])

  const fetchEngagements = async () => {
    setLoading(true)
    try {
      // Get date range based on current view
      let startDate: Date
      let endDate: Date

      if (viewMode === 'month') {
        startDate = startOfWeek(startOfMonth(currentDate))
        endDate = endOfWeek(endOfMonth(currentDate))
      } else if (viewMode === 'week') {
        startDate = startOfWeek(currentDate)
        endDate = endOfWeek(currentDate)
      } else {
        startDate = currentDate
        endDate = currentDate
      }

      const response = await fetch(`/api/engagements?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
      if (response.ok) {
        const result = await response.json()
        // Handle both direct array and paginated response formats
        const engagementsData = Array.isArray(result) ? result : (result.data || [])
        setEngagements(engagementsData)
      }
    } catch (error) {
      devLog.error('Error fetching engagements:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1))
    }
  }

  const getDateTitle = () => {
    if (viewMode === 'month') {
      return format(currentDate, 'MMMM yyyy')
    } else if (viewMode === 'week') {
      const start = startOfWeek(currentDate)
      const end = endOfWeek(currentDate)
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy')
    }
  }

  const getEngagementsForDate = (date: Date) => {
    if (!Array.isArray(engagements)) {
      // Engagements data is not in expected format
      return []
    }
    return engagements.filter(engagement => {
      if (!engagement.scheduled_at) return false
      const engagementDate = parseISO(engagement.scheduled_at)
      return isSameDay(engagementDate, date)
    })
  }

  const handleCreateEngagement = (date?: Date, time?: string) => {
    setCreateEngagementDate(date || currentDate)
    setCreateEngagementTime(time || null)
  }

  const handleEngagementCreated = () => {
    fetchEngagements() // Refresh the calendar
    setCreateEngagementDate(null)
    setCreateEngagementTime(null)
  }

  const handleEngagementClick = (engagement: Engagement, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent date selection
    setSelectedEngagement(engagement)
  }

  const handleEngagementUpdated = () => {
    fetchEngagements() // Refresh the calendar
    setSelectedEngagement(null)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      call: 'bg-green-100 text-green-800 border-green-200',
      email: 'bg-purple-100 text-purple-800 border-purple-200',
      note: 'bg-gray-100 text-gray-800 border-gray-200',
      demo: 'bg-orange-100 text-orange-800 border-orange-200',
      training: 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colors[type as keyof typeof colors] || colors.note
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate

    // Create header with days of the week
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const headerRow = (
      <div key="header" className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {daysOfWeek.map(dayName => (
          <div key={dayName} className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
            {dayName}
          </div>
        ))}
      </div>
    )

    // Create calendar grid
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day
        const dayEngagements = getEngagementsForDate(cloneDay)
        
        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-24 bg-white dark:bg-gray-900 p-1 border-b border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
              !isSameMonth(day, monthStart) ? "bg-gray-50 dark:bg-gray-800 text-gray-400" : "",
              isSameDay(day, new Date()) ? "bg-blue-50 dark:bg-blue-900" : ""
            )}
            onClick={() => setSelectedDate(cloneDay)}
            onDoubleClick={() => handleCreateEngagement(cloneDay)}
          >
            <span className={cn(
              "text-sm",
              !isSameMonth(day, monthStart) ? "text-gray-400" : "text-gray-900 dark:text-gray-100",
              isSameDay(day, new Date()) ? "font-bold text-blue-600 dark:text-blue-400" : ""
            )}>
              {format(day, dateFormat)}
            </span>
            <div className="space-y-1 mt-1">
              {dayEngagements.slice(0, 2).map(engagement => (
                <div
                  key={engagement.id}
                  className={cn(
                    "text-xs p-1 rounded border truncate cursor-pointer hover:opacity-80",
                    getTypeColor(engagement.type)
                  )}
                  title={engagement.title}
                  onClick={(e) => handleEngagementClick(engagement, e)}
                >
                  {engagement.is_all_day ? (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-2 w-2" />
                      {engagement.title}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      {format(parseISO(engagement.scheduled_at), 'HH:mm')} {engagement.title}
                    </div>
                  )}
                </div>
              ))}
              {dayEngagements.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{dayEngagements.length - 2} more
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      
      if (days.length === 7) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {days}
          </div>
        )
        days = []
      }
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {headerRow}
        {rows}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate)
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700">
          <div className="bg-gray-50 dark:bg-gray-800 p-2"></div>
          {weekDays.map(day => (
            <div key={day.toString()} className="bg-gray-50 dark:bg-gray-800 p-2 text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-sm",
                isSameDay(day, new Date()) ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-700 min-h-96">
          {/* Time column */}
          <div className="bg-gray-50 dark:bg-gray-800">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-12 border-b border-gray-200 dark:border-gray-600 p-1 text-xs text-gray-500 dark:text-gray-400">
                {format(new Date().setHours(i, 0, 0, 0), 'HH:mm')}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map(day => {
            const dayEngagements = getEngagementsForDate(day)
            return (
              <div key={day.toString()} className="bg-white dark:bg-gray-900 relative">
                {Array.from({ length: 24 }, (_, i) => (
                  <div 
                    key={i} 
                    className="h-12 border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onDoubleClick={() => handleCreateEngagement(day, format(new Date().setHours(i, 0, 0, 0), 'HH:mm'))}
                  ></div>
                ))}
                {dayEngagements.map(engagement => {
                  const engagementDate = parseISO(engagement.scheduled_at)
                  const hour = engagementDate.getHours()
                  const minute = engagementDate.getMinutes()
                  const topPosition = (hour * 48) + (minute * 0.8)
                  const height = engagement.is_all_day ? 48 : Math.max(24, (engagement.duration_minutes || 60) * 0.8)
                  
                  return (
                    <div
                      key={engagement.id}
                      className={cn(
                        "absolute left-1 right-1 rounded p-1 text-xs border cursor-pointer hover:opacity-80",
                        getTypeColor(engagement.type)
                      )}
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        zIndex: 10
                      }}
                      title={`${engagement.title} - ${engagement.account?.name || 'No account'}`}
                      onClick={(e) => handleEngagementClick(engagement, e)}
                    >
                      <div className="font-medium truncate">{engagement.title}</div>
                      {engagement.account && (
                        <div className="text-xs opacity-75 truncate">{engagement.account.name}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const dayEngagements = getEngagementsForDate(currentDate)
    
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h3>
          </div>
          
          <div className="relative">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex">
                <div className="w-16 bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                  {format(new Date().setHours(i, 0, 0, 0), 'HH:mm')}
                </div>
                <div 
                  className="flex-1 h-12 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onDoubleClick={() => handleCreateEngagement(currentDate, format(new Date().setHours(i, 0, 0, 0), 'HH:mm'))}
                >
                  {dayEngagements
                    .filter(engagement => {
                      const engagementDate = parseISO(engagement.scheduled_at)
                      return engagementDate.getHours() === i
                    })
                    .map(engagement => {
                      const engagementDate = parseISO(engagement.scheduled_at)
                      const minute = engagementDate.getMinutes()
                      const topPosition = (minute * 0.8)
                      const height = engagement.is_all_day ? 48 : Math.max(24, (engagement.duration_minutes || 60) * 0.8)
                      
                      return (
                        <div
                          key={engagement.id}
                          className={cn(
                            "absolute left-2 right-2 rounded p-1 text-xs border cursor-pointer hover:opacity-80",
                            getTypeColor(engagement.type)
                          )}
                          style={{
                            top: `${topPosition}px`,
                            height: `${height}px`,
                            zIndex: 10
                          }}
                          onClick={(e) => handleEngagementClick(engagement, e)}
                        >
                          <div className="font-medium">{engagement.title}</div>
                          {engagement.account && (
                            <div className="text-xs opacity-75">{engagement.account.name}</div>
                          )}
                          <div className="text-xs opacity-75">
                            {engagement.duration_minutes ? `${engagement.duration_minutes}min` : 'No duration'}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-64 text-center">
              {getDateTitle()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
          </div>
          
          <CreateEngagementDialog
            selectedDate={createEngagementDate}
            selectedTime={createEngagementTime}
            onEngagementCreated={handleEngagementCreated}
          />

          <AIInsightsButton 
            pageType="calendar" 
            pageContext={{ 
              viewMode,
              currentDate: currentDate.toISOString(),
              selectedDate: selectedDate?.toISOString()
            }}
          />
        </div>
      </div>

      {/* Calendar Content */}
      {loading ? (
        <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading engagements...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </>
      )}

      {/* Engagement Details Modal */}
      <EngagementDetailsModal
        engagement={selectedEngagement}
        open={!!selectedEngagement}
        onOpenChange={(open) => !open && setSelectedEngagement(null)}
        onEngagementUpdated={handleEngagementUpdated}
      />
    </div>
  )
}