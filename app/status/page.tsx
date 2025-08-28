import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Globe,
  Database,
  Zap,
  Shield,
  Activity,
  TrendingUp
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Status - Fastenr",
  description: "Real-time status and uptime monitoring for Fastenr services and API.",
}

export default function StatusPage() {
  const services = [
    {
      name: "API Gateway",
      status: "operational",
      uptime: "99.98%",
      responseTime: "145ms",
      description: "Core API endpoints and authentication"
    },
    {
      name: "Dashboard",
      status: "operational", 
      uptime: "99.95%",
      responseTime: "89ms",
      description: "Web application and user interface"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.99%",
      responseTime: "12ms",
      description: "Primary database and data storage"
    },
    {
      name: "Email Service",
      status: "operational",
      uptime: "99.92%",
      responseTime: "234ms",
      description: "Survey delivery and notifications"
    },
    {
      name: "Analytics Engine",
      status: "operational",
      uptime: "99.97%",
      responseTime: "67ms",
      description: "Health scoring and insights processing"
    },
    {
      name: "Webhooks",
      status: "operational",
      uptime: "99.94%",
      responseTime: "156ms",
      description: "Real-time event notifications"
    }
  ]

  const incidents = [
    {
      title: "Scheduled Maintenance - Database Optimization",
      status: "completed",
      date: "March 15, 2024",
      duration: "2 hours",
      impact: "No service interruption",
      description: "Routine database optimization and index rebuilding to improve query performance."
    },
    {
      title: "API Rate Limiting Adjustment",
      status: "completed", 
      date: "March 10, 2024",
      duration: "15 minutes",
      impact: "Minimal impact",
      description: "Temporary rate limit adjustments during peak traffic. All requests processed successfully."
    },
    {
      title: "Email Delivery Delay",
      status: "resolved",
      date: "March 5, 2024", 
      duration: "45 minutes",
      impact: "Email delays",
      description: "Brief delay in survey email delivery due to upstream provider issues. All emails delivered successfully."
    }
  ]

  const metrics = [
    {
      label: "Overall Uptime",
      value: "99.97%",
      period: "Last 30 days",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      label: "Average Response Time",
      value: "118ms",
      period: "Last 24 hours", 
      icon: Zap,
      color: "text-blue-600"
    },
    {
      label: "API Requests",
      value: "2.4M",
      period: "Last 24 hours",
      icon: Activity,
      color: "text-purple-600"
    },
    {
      label: "Incidents Resolved",
      value: "100%",
      period: "Last 90 days",
      icon: Shield,
      color: "text-orange-600"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "down":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-700 border-green-200"
      case "degraded":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "down":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/home">
              <Logo variant="black" size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/home">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost">Support</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              All Systems Operational
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                System Status
              </span>
              <br />
              <span className="text-gray-900">& Uptime</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time monitoring of all Fastenr services. We're committed to providing 
              reliable, high-performance service with 99.9% uptime guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Overall Metrics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-8">
                  <metric.icon className={`h-12 w-12 ${metric.color} mx-auto mb-4`} />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                  <div className="text-lg font-medium text-gray-900 mb-1">{metric.label}</div>
                  <div className="text-sm text-gray-500">{metric.period}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Service Status
              </span>
            </h2>
            <p className="text-xl text-gray-600">Current status of all Fastenr services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                    {getStatusIcon(service.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Uptime</span>
                      <span className="text-sm font-medium text-gray-900">{service.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Response Time</span>
                      <span className="text-sm font-medium text-gray-900">{service.responseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recent Activity
              </span>
            </h2>
            <p className="text-xl text-gray-600">Latest incidents and maintenance updates</p>
          </div>

          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{incident.title}</h3>
                      <p className="text-gray-600">{incident.description}</p>
                    </div>
                    <Badge className={getStatusColor(incident.status === "resolved" ? "operational" : incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date: </span>
                      <span className="font-medium text-gray-900">{incident.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration: </span>
                      <span className="font-medium text-gray-900">{incident.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Impact: </span>
                      <span className="font-medium text-gray-900">{incident.impact}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stay Updated on Service Status
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get notified about planned maintenance, incidents, and service updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900"
            />
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Subscribe
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            You can also follow us on Twitter @fastenr_status for real-time updates
          </p>
        </div>
      </section>
    </div>
  )
}