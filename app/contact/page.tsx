import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles,
  MessageSquare,
  Clock,
  Users,
  Send
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Contact - Fastenr",
  description: "Get in touch with our team. We're here to help with questions, support, or partnership opportunities.",
}

export default function ContactPage() {
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
              <MessageSquare className="h-4 w-4 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                We'd Love to
              </span>
              <br />
              <span className="text-gray-900">Hear From You</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about Fastenr? Want to schedule a demo? Looking for partnership opportunities? 
              Our team is here to help and we typically respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Email Us</h3>
                <p className="text-gray-600 mb-4">
                  Send us an email and we'll get back to you within 24 hours.
                </p>
                <p className="text-blue-600 font-medium">hello@fastenr.com</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Call Us</h3>
                <p className="text-gray-600 mb-4">
                  Speak with our team directly during business hours.
                </p>
                <p className="text-green-600 font-medium">+1 (555) 123-4567</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Business Hours</h3>
                <p className="text-gray-600 mb-4">
                  Monday - Friday, 9 AM - 6 PM PST
                </p>
                <p className="text-purple-600 font-medium">Pacific Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</CardTitle>
                <p className="text-gray-600">Fill out the form below and we'll get back to you soon</p>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Acme Corp"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="How can we help you?"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us more about your needs..."
                      className="w-full"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  >
                    Send Message
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Looking for Something Specific?
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Sales Inquiry</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Interested in learning more about our platform?
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardContent className="p-6">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Customer Support</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Need help with your existing account?
                </p>
                <Link href="/support">
                  <Button variant="outline" size="sm" className="w-full">
                    Get Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Partnerships</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Explore partnership opportunities with us.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Partner With Us
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Press & Media</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Media inquiries and press resources.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Media Kit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </PublicLayout>
  )
}