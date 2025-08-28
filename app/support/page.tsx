import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowRight, 
  Search, 
  MessageSquare, 
  Book, 
  Video, 
  Sparkles,
  HelpCircle,
  FileText,
  Users,
  Zap,
  Shield,
  Clock,
  CheckCircle
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Support - Fastenr",
  description: "Get help with Fastenr. Find answers, tutorials, and contact our support team.",
}

export default function SupportPage() {
  const quickHelp = [
    {
      title: "Getting Started Guide",
      description: "Complete setup guide for new users",
      icon: Book,
      color: "from-blue-500 to-indigo-500",
      link: "/support/getting-started"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      icon: Video,
      color: "from-green-500 to-emerald-500",
      link: "/support/tutorials"
    },
    {
      title: "API Documentation",
      description: "Complete API reference and examples",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      link: "/api-docs"
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageSquare,
      color: "from-orange-500 to-red-500",
      link: "/contact"
    }
  ]

  const popularArticles = [
    {
      title: "How to Set Up Your First Dashboard",
      category: "Getting Started",
      readTime: "5 min",
      helpful: 124
    },
    {
      title: "Understanding Customer Health Scores",
      category: "Analytics",
      readTime: "8 min",
      helpful: 98
    },
    {
      title: "Creating and Sending NPS Surveys",
      category: "Surveys",
      readTime: "6 min",
      helpful: 87
    },
    {
      title: "Managing Contact Groups and Segments",
      category: "Contacts",
      readTime: "4 min",
      helpful: 76
    },
    {
      title: "Setting Up Automated Workflows",
      category: "Automation",
      readTime: "10 min",
      helpful: 65
    },
    {
      title: "Integrating with Your CRM",
      category: "Integrations",
      readTime: "12 min",
      helpful: 54
    }
  ]

  const supportStats = [
    {
      label: "Average Response Time",
      value: "< 2 hours",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      label: "Customer Satisfaction",
      value: "98%",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      label: "Articles in Knowledge Base",
      value: "200+",
      icon: Book,
      color: "text-purple-600"
    },
    {
      label: "Video Tutorials",
      value: "50+",
      icon: Video,
      color: "text-orange-600"
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
              <Link href="/documentation">
                <Button variant="ghost">Docs</Button>
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
              <HelpCircle className="h-4 w-4 mr-2" />
              Support Center
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                How Can We
              </span>
              <br />
              <span className="text-gray-900">Help You Today?</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Find answers, get help, and learn how to make the most of Fastenr. 
              Our comprehensive support center has everything you need to succeed.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles, tutorials, or guides..."
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

      {/* Quick Help */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quick Help
              </span>
            </h2>
            <p className="text-xl text-gray-600">Get started with these popular resources</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickHelp.map((item, index) => (
              <Link key={index} href={item.link}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Support by the Numbers
              </span>
            </h2>
            <p className="text-xl text-gray-600">We're here to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {supportStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-8">
                  <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Popular Articles
              </span>
            </h2>
            <p className="text-xl text-gray-600">Most helpful content from our knowledge base</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <Badge className="mb-3">{article.category}</Badge>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {article.helpful} found helpful
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/documentation">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Browse All Documentation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is standing by to help you succeed. Get personalized assistance from our experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Contact Support
                <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
              Schedule a Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Average response time: Under 2 hours • Available 24/7
          </p>
        </div>
      </section>
    </div>
  )
}