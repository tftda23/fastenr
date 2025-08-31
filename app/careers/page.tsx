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
  Globe,
  Building,
  Mail,
  DollarSign,
  Zap,
  Shield,
  Rocket,
  Coffee,
  BookOpen
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"
import { getAllJobs } from "@/lib/jobs"

export const metadata: Metadata = {
  title: "Careers - Fastenr",
  description: "Join our mission to transform customer success. Explore open positions and grow your career with Fastenr.",
}

export default function CareersPage() {
  const jobs = getAllJobs()

  const benefits = [
    {
      title: "Equity & Ownership",
      description: "Meaningful equity stake in a high-growth startup with significant upside potential",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Remote-First Culture",
      description: "Work from anywhere in the world. We believe great talent shouldn't be limited by geography",
      icon: Globe,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Learning & Growth",
      description: "Generous learning budget, conference attendance, and mentorship from industry experts",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Health & Wellness",
      description: "Comprehensive health, dental, vision insurance plus mental health and wellness support",
      icon: Heart,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Flexible Time Off",
      description: "Unlimited PTO policy with encouraged time off for rest, recharge, and personal growth",
      icon: Coffee,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Cutting-Edge Tech",
      description: "Work with the latest tools, frameworks, and technologies to build world-class products",
      icon: Zap,
      color: "from-teal-500 to-cyan-500"
    }
  ]

  const values = [
    {
      title: "Customer Obsession",
      description: "Everything we do starts with understanding and solving real customer problems",
      icon: Heart
    },
    {
      title: "Move Fast & Build",
      description: "We ship quickly, learn from feedback, and iterate to create exceptional products",
      icon: Rocket
    },
    {
      title: "Transparency First",
      description: "Open communication, honest feedback, and transparent decision-making at all levels",
      icon: Shield
    },
    {
      title: "Continuous Learning",
      description: "We're always growing, learning, and pushing the boundaries of what's possible",
      icon: Sparkles
    }
  ]

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
                <Users className="h-4 w-4 mr-2" />
                We're Hiring!
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Build the Future
                </span>
                <br />
                <span className="text-gray-900">of Customer Success</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Join Fastenr and help transform how businesses build lasting customer relationships. 
                We're a passionate team of innovators building AI-powered tools that make customer success accessible to everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6" asChild>
                  <a href="#open-positions">
                    View Open Positions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2" asChild>
                  <a href="mailto:careers@fastenr.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Values
                </span>
              </h2>
              <p className="text-xl text-gray-600">The principles that guide everything we do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits & Perks */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Why Join Fastenr?
                </span>
              </h2>
              <p className="text-xl text-gray-600">Competitive benefits and an amazing culture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="open-positions" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Open Positions
                </span>
              </h2>
              <p className="text-xl text-gray-600">Find your next opportunity with us</p>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {jobs.map((job) => (
                  <Card key={job.slug} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <CardTitle className="text-2xl text-gray-900 mb-2">{job.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-2" />
                              {job.department}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {job.type}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          Hiring
                        </Badge>
                      </div>
                      <p className="text-gray-600 line-clamp-3">{job.excerpt}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Link href={`/careers/${job.slug}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <a 
                          href={`mailto:careers@fastenr.com?subject=Quick Question about ${job.title}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Quick Question?
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Open Positions Right Now</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    We're not actively hiring at the moment, but we're always interested in hearing from talented people who are passionate about customer success.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="mailto:careers@fastenr.com?subject=Future Opportunities at Fastenr">
                      <Mail className="mr-2 h-4 w-4" />
                      Get in Touch
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Don't see a perfect fit? We're always looking for exceptional people to join our team. 
              Let's start a conversation about how you can contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6" asChild>
                <a href="mailto:careers@fastenr.com?subject=I'm interested in joining Fastenr">
                  <Mail className="mr-2 h-5 w-5" />
                  Send Us Your Resume
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6" asChild>
                <Link href="/contact">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              We're an equal opportunity employer committed to diversity and inclusion
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  )
}