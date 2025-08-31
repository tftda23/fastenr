import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Users, 
  Target, 
  Heart, 
  Sparkles,
  Award,
  Globe,
  TrendingUp
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "About - Fastenr",
  description: "Learn about Fastenr's mission to transform customer success with AI-powered insights and automated workflows.",
}

export default function AboutPage() {
  return (
    <PublicLayout>
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
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <Heart className="h-4 w-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Transforming Customer Success
              </span>
              <br />
              <span className="text-gray-900">One Relationship at a Time</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe every customer relationship has the potential to drive mutual growth. 
              Fastenr empowers customer success teams with AI-powered insights to turn that potential into reality.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-blue-700">
                  <Target className="h-6 w-6 mr-3" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To democratize customer success by making AI-powered insights and automation 
                  accessible to every customer success team, regardless of size or industry. 
                  We're building the future where every customer interaction is optimized for mutual growth.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-purple-700">
                  <Globe className="h-6 w-6 mr-3" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  A world where customer churn is predictable and preventable, where expansion 
                  opportunities are never missed, and where customer success teams can focus on 
                  building meaningful relationships instead of manual data analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer-Centric</h3>
                <p className="text-gray-600">
                  Every feature we build starts with understanding our customers' real challenges 
                  and designing solutions that create genuine value.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Innovation</h3>
                <p className="text-gray-600">
                  We're constantly pushing the boundaries of what's possible in customer success, 
                  leveraging the latest in AI and automation technology.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We're committed to delivering exceptional quality in everything we do, 
                  from our product to our customer support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Help us transform customer success for teams around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                View Careers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </PublicLayout>
  )
}