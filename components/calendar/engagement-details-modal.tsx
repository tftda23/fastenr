"use client"

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  Building, 
  MessageSquare, 
  Target, 
  Edit, 
  Trash2, 
  ExternalLink 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Engagement {
  id: string
  title: string
  description?: string
  type: 'meeting' | 'call' | 'email' | 'note' | 'demo' | 'training'
  scheduled_at: string
  duration_minutes?: number
  is_all_day?: boolean
  outcome?: 'positive' | 'neutral' | 'negative' | 'action_required'
  attendees?: string[]
  tags?: string[]
  account?: {
    name: string
    id: string
  }
  user?: {
    full_name: string
  }
  created_at: string
  updated_at: string
}

interface EngagementDetailsModalProps {
  engagement: Engagement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEngagementUpdated?: () => void
}

export function EngagementDetailsModal({ 
  engagement, 
  open, 
  onOpenChange,
  onEngagementUpdated 
}: EngagementDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  if (!engagement) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <User className="h-4 w-4" />
      case 'call':
        return <MessageSquare className="h-4 w-4" />
      case 'email':
        return <MessageSquare className="h-4 w-4" />
      case 'note':
        return <MessageSquare className="h-4 w-4" />
      case 'demo':
        return <Target className="h-4 w-4" />
      case 'training':
        return <Target className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800',
      call: 'bg-green-100 text-green-800',
      email: 'bg-purple-100 text-purple-800',
      note: 'bg-gray-100 text-gray-800',
      demo: 'bg-orange-100 text-orange-800',
      training: 'bg-pink-100 text-pink-800',
    }
    return colors[type as keyof typeof colors] || colors.note
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'neutral':
        return 'bg-gray-100 text-gray-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      case 'action_required':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = () => {
    const date = parseISO(engagement.scheduled_at)
    
    if (engagement.is_all_day) {
      return format(date, 'EEEE, MMMM d, yyyy') + ' (All day)'
    }
    
    const endTime = engagement.duration_minutes 
      ? new Date(date.getTime() + engagement.duration_minutes * 60000)
      : null
    
    return `${format(date, 'EEEE, MMMM d, yyyy')} at ${format(date, 'h:mm a')}${
      endTime ? ` - ${format(endTime, 'h:mm a')}` : ''
    }`
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this engagement?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/engagements/${engagement.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        onEngagementUpdated?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error deleting engagement:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(engagement.type)}
            {engagement.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Type and Outcome */}
                <div className="flex gap-2">
                  <Badge className={getTypeColor(engagement.type)}>
                    {engagement.type}
                  </Badge>
                  {engagement.outcome && (
                    <Badge className={getOutcomeColor(engagement.outcome)}>
                      {engagement.outcome.replace('_', ' ')}
                    </Badge>
                  )}
                </div>

                {/* Date and Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {engagement.is_all_day ? (
                    <Calendar className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {formatDateTime()}
                </div>

                {/* Duration */}
                {!engagement.is_all_day && engagement.duration_minutes && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    Duration: {engagement.duration_minutes} minutes
                  </div>
                )}

                {/* Account */}
                {engagement.account && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account:</span>
                    <Link 
                      href={`/dashboard/accounts/${engagement.account.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    >
                      {engagement.account.name}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}

                {/* User */}
                {engagement.user && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>Created by: {engagement.user.full_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {engagement.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {engagement.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Attendees */}
          {engagement.attendees && engagement.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {engagement.attendees.map((attendee, index) => (
                    <Badge key={index} variant="outline">
                      {attendee}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {engagement.tags && engagement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {engagement.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Created:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(parseISO(engagement.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(parseISO(engagement.updated_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Link href={`/dashboard/engagements/${engagement.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}