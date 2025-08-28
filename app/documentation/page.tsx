import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowRight, 
  Search, 
  Book, 
  Code, 
  Sparkles,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Calendar,
  Settings,
  Zap,
  Shield,
  Globe,
  Download,
  ExternalLink
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Documentation - Fastenr",
  description: "Complete documentation for Fastenr. API references, guides, and tutorials for developers and users.",
}

export default function DocumentationPage() {
  const docSections = [
    {
      title: "Getting Started",
      description: "Quick start guides and basic setup",
      icon: Book,
      color: "from-blue-500 to-indigo-500",
      articles: [
        "Installation & Setup",
        "Your First Dashboard",
        "User Management",
        "Basic Configuration"
      ]
    },
    {
      title: "API Reference",
      description: "Complete API documentation and examples",
      icon: Code,
      color: "from-green-500 to-emerald-500",
      articles: [
        "Authentication",
        "REST API Endpoints",
        "Webhooks",
        "Rate Limiting"
      ]
    },
    {
      title: "Features",
      description: "Detailed guides for all platform features",
      icon: Settings,
      color: "from-purple-500 to-pink-500",
      articles: [
        "Customer Health Scoring",
        "Analytics & Reporting",
        "Survey Management",
        "Contact Organization"
      ]
    },
    {
      title: "Integrations",
      description: "Connect with your existing tools",
      icon: Globe,
      color: "from-orange-500 to-red-500",
      articles: [
        "CRM Integrations",
        "Email Platforms",
        "Slack Integration",
        "Custom Webhooks"
      ]
    },
    {
      title: "Automation",
      description: "Workflow automation and triggers",
      icon: Zap,
      color: "from-teal-500 to-cyan-500",
      articles: [
        "Workflow Builder",
        "Trigger Conditions",
        "Email Automation",
        "Custom Actions"
      ]
    },
    {
      title: "Security",
      description: "Security features and best practices",
      icon: Shield,
      color: "from-pink-500 to-rose-500",
      articles: [
        "Data Security",
        "Access Controls",
        "Compliance",
        "Audit Logs"
      ]
    }
  ]

  const quickLinks = [
    {
      title: "API Quick Start",
      description: "Get up and running with our API in 5 minutes",
      link: "/api-docs/quickstart",
      badge: "Popular"
    },
    {
      title: "SDK Downloads",
      description: "Official SDKs for popular programming languages",
      link: "/api-docs/sdks",
      badge: "New"
    },
    {
      title: "Postman Collection",
      description: "Import our complete API collection",
      link: "/api-docs/postman",
      badge: "Updated"
    },
    {
      title: "Changelog",
      description: "Latest updates and feature releases",
      link: "/changelog",
      badge: "Latest"
    }
  ]

  const popularGuides = [
    {
      title: "Setting Up Customer Health Scoring",
      category: "Analytics",
      difficulty: "Intermediate",
      time: "15 min"
    },
    {
      title: "Creating Your First Automation Workflow",
      category: "Automation",
      difficulty: "Beginner",
      time: "10 min"
    },
    {
      title: "Integrating with Salesforce",
      category: "Integrations",
      difficulty: "Advanced",
      time: "20 min"
    },
    {
      title: "Building Custom Dashboards",
      category: "Analytics",
      difficulty: "Intermediate",
      time: "12 min"
    },
    {
      title: "API Authentication Guide",
      category: "API",
      difficulty: "Beginner",
      time: "8 min"
    },
    {
      title: "Advanced Survey Targeting",
      category: "Surveys",
      difficulty: "Advanced",
      time: "18 min"
    }
  ]

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
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <FileText className="h-4 w-4 mr-2" />
              Documentation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-900">to Build & Integrate</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Comprehensive guides, API references, and tutorials to help you get the most out of Fastenr. 
              From basic setup to advanced integrations, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500"
                />
                <Button 
                  size="lg" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quick Links
              </span>
            </h2>
            <p className="text-xl text-gray-600">Jump to the most popular resources</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{link.title}</h3>
                    <Badge variant="secondary" className="text-xs">{link.badge}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{link.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Browse by Category
              </span>
            </h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {docSections.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                    <section.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
                  <p className="text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {section.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="h-3 w-3 mr-2 text-gray-400" />
                        {article}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    Explore Section
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Popular Guides
              </span>
            </h2>
            <p className="text-xl text-gray-600">Most viewed tutorials and guides</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGuides.map((guide, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{guide.category}</Badge>
                    <span className="text-sm text-gray-500">{guide.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{guide.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {guide.difficulty}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Resources CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get your API keys and start integrating Fastenr into your applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              <Code className="mr-2 h-5 w-5" />
              Get API Keys
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
              <Download className="mr-2 h-5 w-5" />
              Download SDKs
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Free tier available • No credit card required • Full API access
          </p>
        </div>
      </section>
    </div>
  )
}