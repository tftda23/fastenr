import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  Star,
  TrendingUp,
  Target,
  Mail,
  Calendar,
  MessageSquare,
  Building2,
  Sparkles,
  Clock,
  Award,
  Rocket,
  Heart,
  Brain,
  Eye,
  Settings,
  PieChart,
  LineChart,
  Activity,
  UserCheck,
  Bell,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  MapPin
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Fastenr - Customer Success Platform",
  description: "Transform your customer relationships with AI-powered insights, automated workflows, and comprehensive analytics. Reduce churn, increase expansion, and drive sustainable growth.",
  openGraph: {
    title: "Fastenr - Transform Your Customer Success",
    description: "The all-in-one platform for customer success teams to reduce churn and drive growth with AI-powered insights.",
    url: "/home",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo variant="black" size="md" />
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
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
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Customer Success Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Customer Success</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Reduce churn by 40%, increase expansion revenue by 60%, and delight customers with 
              AI-powered insights, automated workflows, and comprehensive analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                <Eye className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-900">To Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered insights to automated workflows, fastenr provides all the tools 
              your customer success team needs to drive growth and reduce churn.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 mb-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                Smart Dashboard
              </Badge>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Customer Health</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get instant visibility into customer health scores, churn risk, and expansion opportunities 
                with our AI-powered dashboard.
              </p>
            </div>
            
            <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">Customer Success Dashboard</h4>
                    <p className="text-gray-600">Real-time insights and analytics</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-700">Live</Badge>
                    <Button size="sm" className="bg-blue-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Widget
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Healthy Accounts</p>
                          <p className="text-2xl font-bold text-green-700">847</p>
                          <p className="text-xs text-green-600">↗ +12% this month</p>
                        </div>
                        <Heart className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">At Risk</p>
                          <p className="text-2xl font-bold text-yellow-700">23</p>
                          <p className="text-xs text-yellow-600">↘ -8% this month</p>
                        </div>
                        <Bell className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Expansion Ready</p>
                          <p className="text-2xl font-bold text-blue-700">156</p>
                          <p className="text-xs text-blue-600">↗ +24% this month</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">NPS Score</p>
                          <p className="text-2xl font-bold text-purple-700">72</p>
                          <p className="text-xs text-purple-600">↗ +5 points</p>
                        </div>
                        <Star className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Success?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of customer success teams who trust fastenr to reduce churn, 
            increase expansion revenue, and delight their customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
              <Calendar className="mr-2 h-5 w-5" />
              Book Demo
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 14-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo variant="white" size="md" />
              </div>
              <p className="text-gray-400">
                The AI-powered customer success platform that helps you reduce churn and drive growth.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/dashboard/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/dashboard/contacts" className="hover:text-white">Contacts</Link></li>
                <li><Link href="/dashboard/surveys" className="hover:text-white">Surveys</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/documentation" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api-docs" className="hover:text-white">API</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 fastenr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}