"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Building,
  Tag,
  Users,
  Phone,
  Mail,
  FileText,
  Monitor,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import type { Engagement } from "@/lib/types"

interface EngagementWithDetails extends Engagement {
  // Joins may be missing/null if RLS blocks them — mark as optional
  accounts?: { name?: string; churn_risk_score?: number; arr?: number } | null
  users?: { full_name?: string } | null
}

interface EngagementDetailsProps {
  engagement: EngagementWithDetails
  canEdit: boolean
  canDelete: boolean
}

export default function EngagementDetails({ engagement, canEdit, canDelete }: EngagementDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this engagement? This action cannot be undone.")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/engagements/${engagement.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete engagement")
      router.push("/dashboard/engagements")
      router.refresh()
    } catch (err) {
      console.error("Error deleting engagement:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const getEngagementIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return Calendar
      case "call":
        return Phone
      case "email":
        return Mail
      case "note":
        return FileText
      case "demo":
        return Monitor
      case "training":
        return GraduationCap
      default:
        return MessageSquare
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800"
      case "call":
        return "bg-green-100 text-green-800"
      case "email":
        return "bg-purple-100 text-purple-800"
      case "note":
        return "bg-gray-100 text-gray-800"
      case "demo":
        return "bg-orange-100 text-orange-800"
      case "training":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
        return "bg-red-100 text-red-800"
      case "neutral":
        return "bg-yellow-100 text-yellow-800"
      case "action_required":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A"
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minutes`
      : `${hours} hour${hours > 1 ? "s" : ""}`
  }

  const Icon = getEngagementIcon(engagement.type)
  const accountName = engagement.accounts?.name ?? "Unknown"
  const createdBy = engagement.users?.full_name ?? "Unknown"
  const churnRisk = engagement.accounts?.churn_risk_score ?? null
  const arr = engagement.accounts?.arr ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{engagement.title}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <Badge className={getTypeColor(engagement.type)}>{engagement.type}</Badge>
              {engagement.outcome && <Badge className={getOutcomeColor(engagement.outcome)}>{engagement.outcome}</Badge>}
              {typeof churnRisk === "number" && churnRisk > 70 && (
                <Badge variant="destructive">High Risk</Badge>
              )}
              {typeof arr === "number" && arr > 50_000 && <Badge variant="secondary">Top Account</Badge>}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <Button asChild>
              <Link href={`/dashboard/engagements/${engagement.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {engagement.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{engagement.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Attendees */}
          {Array.isArray(engagement.attendees) && engagement.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagement.attendees.map((attendee: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{attendee?.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">
                          {attendee?.email && attendee?.role
                            ? `${attendee.email} • ${attendee.role}`
                            : attendee?.email || attendee?.role || "No details"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {Array.isArray(engagement.tags) && engagement.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {engagement.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account</p>
                  <p className="text-foreground">{accountName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logged by</p>
                  <p className="text-foreground">{createdBy}</p>
                </div>
              </div>
              {engagement.duration_minutes && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-foreground">{formatDuration(engagement.duration_minutes)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timing */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {engagement.scheduled_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Scheduled</p>
                  <p className="text-sm text-foreground">{formatDate(engagement.scheduled_at)}</p>
                </div>
              )}
              {engagement.completed_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                  <p className="text-sm text-foreground">{formatDate(engagement.completed_at)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                <p className="text-sm text-foreground">{formatDate(engagement.created_at)}</p>
              </div>
              {engagement.updated_at !== engagement.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm text-foreground">{formatDate(engagement.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
