import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Users, 
  MapPin, 
  Clock, 
  Sparkles,
  Code,
  Palette,
  BarChart3,
  Heart,
  Globe
} from "lucide-react"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Careers - Fastenr",
  description: "Join our mission to transform customer success. Explore open positions and grow your career with Fastenr.",
}

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Frontend Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build beautiful, responsive user interfaces for our customer success platform using React, TypeScript, and modern web technologies.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "San Francisco, CA",
      type: "Full-time", 
      description: "Help our customers achieve their goals and drive adoption of our platform. Experience with SaaS and customer success tools required.",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Design intuitive user experiences that help customer success teams work more efficiently. Experience with Figma and design systems preferred.",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Data Scientist",
      department: "AI/ML",
      location: "Remote",
      type: "Full-time",
      description: "Build machine learning models to predict customer churn and identify expansion opportunities. Experience with Python, TensorFlow, and customer data required.",
      color: "from-orange-500 to-red-500"
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
              <Link href="/about">
                <Button variant="ghost">About</Button>
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
              <Users className="h-4 w-4 mr-2" />
              Join Our Team
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Build the Future
              </span>
              <br />
              <span className="text-gray-900">of Customer Success</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a passionate team of innovators who are transforming how companies build 
              and maintain customer relationships. We're looking for talented individuals 
              who share our vision of making customer success accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Fastenr?
              </span>
            </h2>
            <p className="text-xl text-gray-600">The benefits of joining our growing team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Remote-First Culture</h3>
                <p className="text-gray-600">
                  Work from anywhere in the world. We believe great talent shouldn't be limited by geography.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Benefits</h3>
                <p className="text-gray-600">
                  Health, dental, vision insurance, unlimited PTO, and equity in a fast-growing company.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Growth Opportunities</h3>
                <p className="text-gray-600">
                  Learn from industry experts, attend conferences, and grow your career in a supportive environment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Open Positions
              </span>
            </h2>
            <p className="text-xl text-gray-600">Find your next opportunity with us</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {openPositions.map((position, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900 mb-2">{position.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {position.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {position.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${position.color} rounded-lg flex items-center justify-center`}>
                      {position.department === "Engineering" && <Code className="h-6 w-6 text-white" />}
                      {position.department === "Customer Success" && <Users className="h-6 w-6 text-white" />}
                      {position.department === "Design" && <Palette className="h-6 w-6 text-white" />}
                      {position.department === "AI/ML" && <BarChart3 className="h-6 w-6 text-white" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{position.description}</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Don't See the Right Role?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're always looking for exceptional talent. Send us your resume and let's talk!
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}