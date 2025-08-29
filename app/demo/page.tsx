import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { Calendar, ArrowLeft, Mail, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Book a Demo - Fastenr",
  description: "Schedule a personalized demo of Fastenr's customer success platform",
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo variant="black" size="md" />
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book a Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Fastenr can transform your customer success operations with AI-powered insights and automated workflows.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Schedule Your Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                Our demo scheduling system is coming soon. In the meantime, reach out to us directly:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>demo@fastenr.com</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-4">
                  Or start your free trial today:
                </p>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/home">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}