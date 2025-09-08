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
  Play,
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
  MapPin,
  AlertTriangle
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import PublicHeader from "@/components/layout/public-header"
import Footer from "@/components/layout/footer"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

export const metadata: Metadata = {
  title: "Fastenr - AI-Powered Customer Success Platform | Reduce Churn & Drive Growth",
  description: "Transform customer success with Fastenr's AI-powered platform. Reduce churn, automate workflows, track metrics, and drive growth with tools built specifically for customer success teams. Start your free trial today.",
  keywords: "customer success platform, churn reduction, AI customer insights, customer success software, customer retention, customer onboarding, QBR automation, customer health score, customer analytics, SaaS customer success",
  authors: [{ name: "Fastenr" }],
  creator: "Fastenr",
  publisher: "Fastenr",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Fastenr - AI-Powered Customer Success Platform | Reduce Churn & Drive Growth",
    description: "Transform customer success with AI-powered insights, automated workflows, and comprehensive analytics. Reduce churn and drive growth with tools built for customer success teams.",
    url: "https://fastenr.com/home",
    siteName: "Fastenr",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fastenr Customer Success Platform Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastenr - AI-Powered Customer Success Platform",
    description: "Reduce churn and drive growth with AI-powered customer success tools. Start your free trial today.",
    images: ["/twitter-image.jpg"],
    creator: "@fastenr",
  },
  alternates: {
    canonical: "https://fastenr.com/home",
  },
  other: {
    "google-site-verification": "your-google-verification-code",
  },
}

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Fastenr",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "AI-powered customer success platform that helps teams reduce churn, automate workflows, and drive growth with comprehensive analytics and insights.",
    "url": "https://fastenr.com",
    "author": {
      "@type": "Organization",
      "name": "Fastenr"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "30-day free trial",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "AI-powered customer insights",
      "Customer health scoring",
      "Advanced contact management",
      "Engagement tracking and calendar",
      "Customer goals management",
      "Usage metrics tracking",
      "Onboarding plan management",
      "Survey and NPS management",
      "Customer intelligence analytics",
      "Email automation system"
    ],
    "screenshot": "https://fastenr.com/dashboard-screenshot.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  };

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PublicHeader />

      {/* Hero Section */}
      <header className="relative overflow-hidden group" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          {/* Floating Feature Icons */}
          <div className="flex justify-center isolate mb-12" aria-hidden="true">
            <div className="size-16 bg-white grid place-items-center ring-1 ring-black/[0.08] rounded-xl relative left-6 top-3 -rotate-6 shadow-lg group-hover:-translate-x-8 group-hover:-rotate-12 group-hover:-translate-y-2 transition duration-500 group-hover:duration-200">
              <Sparkles className="h-6 w-6 text-purple-600" aria-label="AI Insights" />
            </div>
            <div className="size-16 bg-white grid place-items-center ring-1 ring-black/[0.08] rounded-xl z-10 shadow-lg group-hover:-translate-y-2 transition duration-500 group-hover:duration-200">
              <BarChart3 className="h-6 w-6 text-blue-600" aria-label="Analytics" />
            </div>
            <div className="size-16 bg-white grid place-items-center ring-1 ring-black/[0.08] rounded-xl relative right-6 top-3 rotate-6 shadow-lg group-hover:translate-x-8 group-hover:rotate-12 group-hover:-translate-y-2 transition duration-500 group-hover:duration-200">
              <Users className="h-6 w-6 text-green-600" aria-label="Customer Success" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Customer Success</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered customer success platform with health scoring, engagement tracking, and automated workflows. Track customer metrics, manage relationships, and drive growth with tools built specifically for customer success teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Call to action buttons">
              <Link href="/auth/signup" aria-label="Start your free 14-day trial">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/watch-demo" aria-label="Watch product demo video">
                <Button variant="outline" className="px-6 py-3 border-2">
                  <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
      </header>

      {/* Feature Showcase */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Dashboard Mockup */}
          <ScrollReveal className="mb-20" animation="fade-up">
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 mb-4">
                <Eye className="h-4 w-4 mr-2" />
                Sneak Peek
              </Badge>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Here's what you get when you login to Fastenr</h3>
              <p className="text-gray-600 max-w-xl mx-auto text-sm">
                Full visibility into your customer success operations
              </p>
            </div>

            <Card className="max-w-6xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">Customer Success Dashboard</h4>
                    <p className="text-gray-600">Real-time insights and analytics</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">Live</div>
                    <div className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md flex items-center pointer-events-none">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Widget
                    </div>
                  </div>
                </div>

                {/* Dashboard-Style Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
                      <div className="p-2 rounded-md bg-blue-50">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">847</div>
                      <p className="text-xs text-muted-foreground mt-1">623 active</p>
                      <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Average Health Score</CardTitle>
                      <div className="p-2 rounded-md bg-green-50">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">78%</div>
                      <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
                      <p className="text-xs text-green-600 mt-1">+5% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">At Risk Accounts</CardTitle>
                      <div className="p-2 rounded-md bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">23</div>
                      <p className="text-xs text-muted-foreground mt-1">3% of total</p>
                      <p className="text-xs text-green-600 mt-1">-8% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
                      <div className="p-2 rounded-md bg-yellow-50">
                        <Star className="h-4 w-4 text-yellow-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">72.5</div>
                      <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
                      <p className="text-xs text-green-600 mt-1">+0.5 from last month</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Dashboard-Style Recent Activity */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates across your accounts</CardDescription>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1-3 of 47
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="p-2 bg-muted rounded-md">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground truncate">QBR completed with TechCorp Inc</h4>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800" variant="secondary">
                              engagement
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Quarterly business review meeting concluded successfully</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              TechCorp Inc • by John Smith
                            </span>
                            <span className="text-xs text-muted-foreground">2h ago</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="p-2 bg-muted rounded-md">
                          <Target className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground truncate">Health score improved for StartupXYZ</h4>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800" variant="secondary">
                              goal
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Account health score increased from 65% to 78%</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              StartupXYZ • by AI Analysis
                            </span>
                            <span className="text-xs text-muted-foreground">4h ago</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="p-2 bg-muted rounded-md">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground truncate">NPS survey completed</h4>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800" variant="secondary">
                              nps
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Enterprise Solutions provided feedback score of 8/10</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              Enterprise Solutions • by Survey System
                            </span>
                            <span className="text-xs text-muted-foreground">6h ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="border-t pt-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-gray-600" />
                    Quick Actions
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
                      <Plus className="h-4 w-4" />
                      New Engagement
                    </div>
                    <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
                      <MessageSquare className="h-4 w-4" />
                      Send Survey
                    </div>
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
                      <BarChart3 className="h-4 w-4" />
                      View Analytics
                    </div>
                    <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium flex items-center gap-2 pointer-events-none">
                      <Sparkles className="h-4 w-4" />
                      AI Insights
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center mt-12">
              <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 mb-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                Smart Dashboard
              </Badge>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Customer Health</h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Get instant visibility into customer health scores, churn risk, and expansion opportunities 
                with our AI-powered dashboard. Track every customer interaction, monitor engagement trends, 
                and receive intelligent recommendations to improve customer outcomes.
              </p>
              
              {/* Scroll Indicator */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-3">Scroll down to see all the other great features we have</p>
                <div className="animate-bounce">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
          
          {/* Separator */}
          <hr className="border-gray-200 mb-12" />

          {/* AI Insights Preview - Left Aligned */}
          <ScrollReveal className="mb-32" animation="fade-up" delay={100}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="lg:order-1">
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Insights
                </Badge>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Intelligent Analysis & Recommendations</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Get actionable insights powered by AI that help you identify risks, opportunities, and next best actions for your accounts.
                </p>
                
                {/* Key Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Risk Detection</h4>
                      <p className="text-gray-600">Automatically identify at-risk accounts before churn happens</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Growth Opportunities</h4>
                      <p className="text-gray-600">Spot expansion opportunities with AI-powered analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Actionable Recommendations</h4>
                      <p className="text-gray-600">Get specific next steps to improve customer outcomes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual */}
              <div className="lg:order-2 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl opacity-20 blur-xl"></div>
                <Card className="relative shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold">AI Analysis Results</h4>
                    </div>
                    
                    {/* Sample Insights */}
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-l-red-500">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-red-900">High Risk Alert</span>
                          <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md font-medium ml-auto">Urgent</div>
                        </div>
                        <p className="text-sm text-red-800 mb-2">
                          TechCorp Inc: 40% usage decline, 18 days since last engagement
                        </p>
                        <div className="text-xs text-red-700 bg-white p-2 rounded">
                          💡 Suggested: Schedule immediate check-in call
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-900">Expansion Ready</span>
                          <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium ml-auto">Opportunity</div>
                        </div>
                        <p className="text-sm text-green-800 mb-2">
                          StartupXYZ: 85% usage increase, +12 new users
                        </p>
                        <div className="text-xs text-green-700 bg-white p-2 rounded">
                          💡 Suggested: Prepare expansion proposal
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollReveal>

          {/* Calendar & Engagements Preview - Right Aligned */}
          <ScrollReveal className="mb-16" animation="fade-left" delay={200}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Visual */}
              <div className="lg:order-1 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-2xl opacity-20 blur-xl"></div>
                <Card className="relative shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold">This Week</h4>
                      </div>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">3 Engagements</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-900 text-sm">QBR - TechCorp Inc</p>
                          <p className="text-xs text-blue-700">Tomorrow, 2:00 PM</p>
                        </div>
                        <div className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-md font-medium">QBR</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-green-900 text-sm">Check-in - StartupXYZ</p>
                          <p className="text-xs text-green-700">Friday, 10:00 AM</p>
                        </div>
                        <div className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-md font-medium">Check-in</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-purple-900 text-sm">Feedback Session</p>
                          <p className="text-xs text-purple-700">Monday, 3:00 PM</p>
                        </div>
                        <div className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-md font-medium">Feedback</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Content */}
              <div className="lg:order-2">
                <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 mb-6">
                  <Calendar className="h-4 w-4 mr-2" />
                  Engagement Management
                </Badge>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Never Miss a Customer Touchpoint</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Track all customer interactions, schedule QBRs, and manage your engagement pipeline in one unified calendar view.
                </p>
                
                {/* Key Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Unified Calendar</h4>
                      <p className="text-gray-600">All customer touchpoints in one organized view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Reminders</h4>
                      <p className="text-gray-600">Never miss important QBRs or check-ins</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Team Coordination</h4>
                      <p className="text-gray-600">Coordinate across your entire success team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Analytics Preview - Left Aligned */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-16" animation="fade-up" delay={100}>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div className="lg:order-1">
                <Badge className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-indigo-200 mb-6">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Advanced Analytics
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Data-Driven Customer Success</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Comprehensive analytics and reporting built specifically for customer success teams to track what matters most.
                </p>
                
                {/* Key Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Health Score Tracking</h4>
                      <p className="text-gray-600">Monitor customer health trends and identify patterns</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                      <p className="text-gray-600">Track retention, expansion, and time-to-value metrics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <PieChart className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Custom Reports</h4>
                      <p className="text-gray-600">Build reports that matter to your success team</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Visual */}
              <div className="lg:order-2 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl opacity-20 blur-xl"></div>
                <Card className="relative shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold">Analytics Dashboard</h4>
                    </div>
                    
                    {/* Chart Preview */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <LineChart className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Health Score Trends</span>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg">
                        <div className="flex items-end justify-between h-20 mb-3">
                          <div className="w-6 bg-indigo-400 rounded-t" style={{height: '60%'}}></div>
                          <div className="w-6 bg-indigo-500 rounded-t" style={{height: '75%'}}></div>
                          <div className="w-6 bg-indigo-600 rounded-t" style={{height: '85%'}}></div>
                          <div className="w-6 bg-green-500 rounded-t" style={{height: '90%'}}></div>
                          <div className="w-6 bg-green-600 rounded-t" style={{height: '95%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-green-900 text-sm">Retention Rate</p>
                          <p className="text-xs text-green-700">↗ +2.3% this month</p>
                        </div>
                        <div className="text-xl font-bold text-green-600">94.2%</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Avg Health Score</p>
                          <p className="text-xs text-blue-700">↗ +5.1 points</p>
                        </div>
                        <div className="text-xl font-bold text-blue-600">78.4</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16" animation="fade-up">
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 mb-4">
              <Globe className="h-4 w-4 mr-2" />
              Seamless Integrations
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Existing Tools</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fastenr integrates with your favorite tools to create a unified customer success workflow.
            </p>
          </ScrollReveal>

          <ScrollReveal className="grid lg:grid-cols-2 gap-12 items-center" animation="fade-up" delay={200}>
            {/* Left side - Integration value description */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Sync Data Seamlessly</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Connect your existing tools to create a unified customer success workflow. 
                  Get automated alerts and notifications to keep your team aligned.
                </p>
              </div>
              
              <div className="space-y-4">
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    Customer profiles and account data from your CRM
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    Support tickets and conversation history
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    Usage analytics and product engagement metrics
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    Automated Slack and Teams alerts for churn risk
                  </li>
                  <li className="flex items-start">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                    Email notifications for health score changes
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Integration logos in cloud */}
            <div className="relative animate-fade-in-up animation-delay-200">
              <div className="absolute -inset-12 bg-gradient-to-br from-blue-100 via-purple-50 to-green-100 rounded-3xl opacity-60 blur-2xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 min-h-[400px] flex items-center">
                <div className="grid grid-cols-3 gap-8 w-full">
                  {/* HubSpot Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/hubspot.svg" alt="HubSpot" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">HubSpot</h3>
                  </div>

                  {/* Salesforce Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/salesforce.svg" alt="Salesforce" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">Salesforce</h3>
                  </div>

                  {/* Jira Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/jira.svg" alt="Jira" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">Jira</h3>
                  </div>

                  {/* Intercom Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/intercom.svg" alt="Intercom" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">Intercom</h3>
                  </div>

                  {/* Zendesk Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/zendesk.svg" alt="Zendesk" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">Zendesk</h3>
                  </div>

                  {/* Slack Integration */}
                  <div className="text-center p-6 bg-white/60 rounded-2xl shadow-lg backdrop-blur-sm border border-white/40 hover:shadow-xl transition-all duration-300 hover:scale-105 h-28 flex flex-col justify-center">
                    <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <img src="/images/logos/slack.svg" alt="Slack" className="max-w-8 max-h-8 object-contain" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs">Slack</h3>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50" aria-labelledby="problem-statement">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16" animation="fade-up">
            <h2 id="problem-statement" className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Teams Choose Fastenr Over Sales Tools
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Sales tools weren't built for customer success. Teams need better data, automation, and predictive insights. Fastenr is the first platform built specifically for customer success teams with AI-powered insights and automated workflows.
            </p>
          </ScrollReveal>
          
          <ScrollReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8" animation="fade-up" delay={300}>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Brain className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">AI Insights</h3>
              <p className="text-xs text-gray-500">Smart predictions</p>
            </div>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Health Scores</h3>
              <p className="text-xs text-gray-500">Risk monitoring</p>
            </div>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Users className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact Management</h3>
              <p className="text-xs text-gray-500">Unified profiles</p>
            </div>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Target className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Customer Goals</h3>
              <p className="text-xs text-gray-500">Success tracking</p>
            </div>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BarChart3 className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Usage Analytics</h3>
              <p className="text-xs text-gray-500">Product insights</p>
            </div>
            <div className="text-center group" role="listitem">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Calendar className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Engagement Calendar</h3>
              <p className="text-xs text-gray-500">Scheduled touchpoints</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" aria-labelledby="cta-heading">
        <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" animation="fade-up">
          <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Reducing Churn Today with AI-Powered Customer Success
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Transform your customer success operations with AI-powered insights, 
            automated workflows, comprehensive analytics, and advanced customer intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" role="group" aria-label="Get started actions">
            <Link href="/auth/signup" aria-label="Start your free 14-day trial - no credit card required">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/demo" aria-label="See our product demo">
              <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-blue-600 hover:text-white px-6 py-3 hover:border-blue-600 group font-semibold">
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                <span>See Demo</span>
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 30-day free trial • Setup in minutes
          </p>
        </ScrollReveal>
      </section>

      <Footer />
      </div>
    </PublicLayout>
  )
}