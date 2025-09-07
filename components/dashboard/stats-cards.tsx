import { useCurrencyConfig } from '@/lib/hooks/use-currency'
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
  const { formatCurrency, CurrencyIcon } = useCurrencyConfig()
  
  // Provide default values to prevent undefined errors
  const safeStats = {
    totalAccounts: stats?.totalAccounts ?? 0,
    activeAccounts: stats?.activeAccounts ?? 0,
    totalRevenue: stats?.totalRevenue ?? 0,
    averageHealthScore: stats?.averageHealthScore ?? 0,
    criticalAccounts: stats?.criticalAccounts ?? 0,
    atRiskAccounts: stats?.atRiskAccounts ?? 0,
    totalARR: stats?.totalARR ?? 0,
    npsScore: stats?.npsScore ?? 0,
  }

  const cards = [
    {
      title: "Total Accounts",
      value: safeStats.totalAccounts.toLocaleString(),
      icon: Users,
      description: `${safeStats.activeAccounts} active`,
      trend: "+12% from last month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Health Score",
      value: `${safeStats.averageHealthScore}%`,
      icon: TrendingUp,
      description: "Across all accounts",
      trend: "+5% from last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "At Risk Accounts",
      value: safeStats.atRiskAccounts.toLocaleString(),
      icon: AlertTriangle,
      description: `${safeStats.totalAccounts > 0 ? Math.round((safeStats.atRiskAccounts / safeStats.totalAccounts) * 100) : 0}% of total`,
      trend: "-3% from last month",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total ARR",
      value: `${formatCurrency(safeStats.totalARR / 1000)}K`,
      icon: CurrencyIcon,
      description: "Annual recurring revenue",
      trend: "+18% from last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "NPS Score",
      value: safeStats.npsScore.toFixed(1),
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
              <div className="animate-pulse space-y-2">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-3 w-28 bg-gray-100 rounded"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
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
