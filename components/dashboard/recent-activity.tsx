import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, Users, Target } from "lucide-react"

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
}

export default function RecentActivity({ activities }: RecentActivityProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
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
      </CardContent>
    </Card>
  )
}
