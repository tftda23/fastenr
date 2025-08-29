import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, AlertTriangle, DollarSign, Star, Loader2 } from "lucide-react"
interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  totalRevenue: number
  averageHealthScore: number
  criticalAccounts: number
  atRiskAccounts: number
  totalARR: number
  npsScore: number
}

interface StatsCardsProps {
  stats: DashboardStats
  loading?: boolean
}

export default function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts.toLocaleString(),
      icon: Users,
      description: `${stats.activeAccounts} active`,
      trend: "+12% from last month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Health Score",
      value: `${stats.averageHealthScore}%`,
      icon: TrendingUp,
      description: "Across all accounts",
      trend: "+5% from last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "At Risk Accounts",
      value: stats.atRiskAccounts.toLocaleString(),
      icon: AlertTriangle,
      description: `${Math.round((stats.atRiskAccounts / stats.totalAccounts) * 100)}% of total`,
      trend: "-3% from last month",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total ARR",
      value: `$${(stats.totalARR / 1000).toFixed(0)}K`,
      icon: DollarSign,
      description: "Annual recurring revenue",
      trend: "+18% from last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "NPS Score",
      value: stats.npsScore.toFixed(1),
      icon: Star,
      description: "Last 90 days",
      trend: "+0.5 from last month",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`p-2 rounded-md ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                <p className="text-xs text-green-600 mt-1">{card.trend}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
