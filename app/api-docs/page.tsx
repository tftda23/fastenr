import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Code, 
  Sparkles,
  Key,
  Globe,
  Shield,
  Zap,
  Book,
  Download,
  ExternalLink,
  Copy,
  CheckCircle
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "API Documentation - Fastenr",
  description: "Complete API reference for Fastenr. REST endpoints, authentication, examples, and SDKs.",
}

export default function ApiDocsPage() {
  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/accounts",
      description: "Retrieve all customer accounts",
      color: "bg-green-100 text-green-700"
    },
    {
      method: "POST",
      path: "/api/v1/accounts",
      description: "Create a new customer account",
      color: "bg-blue-100 text-blue-700"
    },
    {
      method: "GET",
      path: "/api/v1/health-scores",
      description: "Get customer health scores",
      color: "bg-green-100 text-green-700"
    },
    {
      method: "POST",
      path: "/api/v1/surveys",
      description: "Create and send surveys",
      color: "bg-blue-100 text-blue-700"
    },
    {
      method: "GET",
      path: "/api/v1/analytics",
      description: "Retrieve analytics data",
      color: "bg-green-100 text-green-700"
    },
    {
      method: "PUT",
      path: "/api/v1/contacts/{id}",
      description: "Update contact information",
      color: "bg-orange-100 text-orange-700"
    }
  ]

  const sdks = [
    {
      name: "JavaScript/Node.js",
      description: "Official SDK for JavaScript and Node.js applications",
      version: "v2.1.0",
      downloads: "15.2k",
      color: "from-yellow-500 to-orange-500"
    },
    {
      name: "Python",
      description: "Python SDK with async support and type hints",
      version: "v1.8.3",
      downloads: "8.7k",
      color: "from-blue-500 to-indigo-500"
    },
    {
      name: "PHP",
      description: "PHP SDK compatible with Laravel and Symfony",
      version: "v1.5.2",
      downloads: "4.1k",
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Ruby",
      description: "Ruby gem with Rails integration",
      version: "v1.3.1",
      downloads: "2.8k",
      color: "from-red-500 to-pink-500"
    }
  ]

  const codeExample = `// Initialize the Fastenr client
const fastenr = new Fastenr({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.fastenr.com/v1'
});

// Get customer health scores
const healthScores = await fastenr.accounts.getHealthScores({
  limit: 50,
  filter: 'at_risk'
});

// Create a new survey
const survey = await fastenr.surveys.create({
  title: 'Q4 Customer Satisfaction',
  type: 'nps',
  recipients: ['customer@example.com']
});

console.log('Survey created:', survey.id);`

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
              <Link href="/documentation">
                <Button variant="ghost">Docs</Button>
              </Link>
              <Link href="/support">
                <Button variant="ghost">Support</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get API Keys
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
              <Code className="h-4 w-4 mr-2" />
              API Documentation
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build with
              </span>
              <br />
              <span className="text-gray-900">Fastenr API</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Powerful REST API to integrate customer success capabilities into your applications. 
              Complete with authentication, webhooks, and comprehensive SDKs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                <Key className="mr-2 h-5 w-5" />
                Get API Keys
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                <Book className="mr-2 h-5 w-5" />
                Quick Start Guide
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Features */}
            <div>
              <h2 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  API Features
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Authentication</h3>
                    <p className="text-gray-600">API key-based authentication with rate limiting and request signing for enterprise security.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">RESTful Design</h3>
                    <p className="text-gray-600">Clean, predictable REST endpoints with JSON responses and standard HTTP status codes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Webhooks</h3>
                    <p className="text-gray-600">Get instant notifications for customer events, survey responses, and health score changes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">99.9% Uptime</h3>
                    <p className="text-gray-600">Enterprise-grade reliability with global CDN and automatic failover capabilities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Example */}
            <div>
              <h2 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Example
                </span>
              </h2>
              <Card className="border-0 shadow-2xl">
                <CardHeader className="bg-gray-900 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">JavaScript SDK</CardTitle>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 text-sm overflow-x-auto bg-gray-50">
                    <code className="text-gray-800">{codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Popular Endpoints
              </span>
            </h2>
            <p className="text-xl text-gray-600">Most commonly used API endpoints</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={endpoint.color}>{endpoint.method}</Badge>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-mono text-sm text-gray-900 mb-3">{endpoint.path}</h3>
                  <p className="text-gray-600 text-sm">{endpoint.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              View All Endpoints
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Official SDKs
              </span>
            </h2>
            <p className="text-xl text-gray-600">Get started quickly with our official SDKs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sdks.map((sdk, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${sdk.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{sdk.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{sdk.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{sdk.version}</span>
                    <span>{sdk.downloads} downloads</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Install
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get your API keys and start integrating customer success features into your application today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              <Key className="mr-2 h-5 w-5" />
              Get API Keys
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
              <Book className="mr-2 h-5 w-5" />
              Read Quick Start
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Free tier: 1,000 API calls/month • No credit card required • Full feature access
          </p>
        </div>
      </section>
    </div>
  )
}