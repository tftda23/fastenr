import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, Users, Target, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useState } from "react"

interface Activity {
  id: string
  type: "engagement" | "goal" | "nps"
  title: string
  description: string
  timestamp: string
  account: string
  user: string
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

export default function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 2
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "engagement":
        return MessageSquare
      case "goal":
        return Target
      case "nps":
        return Users
      default:
        return Calendar
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "engagement":
        return "bg-blue-100 text-blue-800"
      case "goal":
        return "bg-green-100 text-green-800"
      case "nps":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return time.toLocaleDateString()
  }

  // Pagination calculations
  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentActivities = activities.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your accounts</CardDescription>
          </div>
          {activities.length > itemsPerPage && (
            <div className="text-xs text-muted-foreground">
              {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : currentActivities.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-muted rounded-md">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground truncate">{activity.title}</h4>
                        <Badge className={getActivityColor(activity.type)} variant="secondary">
                          {activity.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {activity.account} • by {activity.user}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {totalPages <= 5 ? (
                      // Show all pages if 5 or fewer
                      [...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(i + 1)}
                          className="w-8 h-8 p-0"
                        >
                          {i + 1}
                        </Button>
                      ))
                    ) : (
                      // Show condensed pagination for more than 5 pages
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </Button>
                        
                        {currentPage > 3 && (
                          <Button variant="ghost" size="sm" disabled className="w-8 h-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {currentPage > 2 && currentPage < totalPages - 1 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => goToPage(currentPage)}
                            className="w-8 h-8 p-0"
                          >
                            {currentPage}
                          </Button>
                        )}
                        
                        {currentPage < totalPages - 2 && (
                          <Button variant="ghost" size="sm" disabled className="w-8 h-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as you engage with accounts</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
