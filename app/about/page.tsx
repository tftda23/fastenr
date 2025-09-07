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
  TrendingUp,
  AlertTriangle,
  BarChart3
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import PublicHeader from "@/components/layout/public-header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "About - Fastenr",
  description: "Learn about Fastenr's mission to transform customer success with AI-powered insights and automated workflows.",
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
              <Heart className="h-4 w-4 mr-2" />
              Born from Real Experience
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                We've Been There
              </span>
              <br />
              <span className="text-gray-900">Managing Customer Success at Scale</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Fastenr was built by customer success professionals who lived through the pain of managing 200+ accounts with spreadsheets, 
              missed renewals, and that sinking feeling when a "healthy" customer churns without warning.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              <strong>The problem wasn't lack of process or people</strong> — it was the lack of technology that could actually handle the complexity and scale of modern customer success.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem We Lived */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              The Customer Success Technology Gap
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why traditional sales tools fail customer success teams — and what we built instead
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-red-700">
                  <AlertTriangle className="h-6 w-6 mr-3" />
                  What We Used to Deal With
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-700">
                  <p className="mb-3"><strong>"Healthy" customers churning:</strong> 85 health score one week, gone the next</p>
                  <p className="mb-3"><strong>Manual health scoring:</strong> Spreadsheets that were out of date before you finished them</p>
                  <p className="mb-3"><strong>No early warning system:</strong> Finding out about churn risk in exit interviews</p>
                  <p className="mb-3"><strong>Context switching hell:</strong> 15 different tools to understand one customer</p>
                  <p className="mb-3"><strong>Scale breaking point:</strong> Process that worked for 50 accounts failed at 200+</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-green-700">
                  <Sparkles className="h-6 w-6 mr-3" />
                  What We Built Instead
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-700">
                  <p className="mb-3"><strong>Strategic health scoring:</strong> Proven weighting algorithms tailored to your business model</p>
                  <p className="mb-3"><strong>Predictive churn risk:</strong> Multi-factor risk modeling with custom priority weighting</p>
                  <p className="mb-3"><strong>Visual risk prioritization:</strong> Health vs. Churn scatter plots with ARR bubble sizing</p>
                  <p className="mb-3"><strong>Automated intelligence:</strong> AI analyzes patterns humans miss</p>
                  <p className="mb-3"><strong>Built for scale:</strong> Handles 10,000 accounts as easily as 10</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Deep Dive */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              The Science Behind Our Health & Risk Engine
            </h2>
            <p className="text-xl text-gray-600">
              Real technical innovation, not just another dashboard
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white mb-8">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200 mb-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Health vs Churn Risk Matrix
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategic Customer Positioning</h3>
                <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                  Our signature scatter plot visualization maps every customer across two critical dimensions, with bubble size representing ARR. 
                  This gives you instant strategic prioritization for your entire portfolio.
                </p>
              </div>

              {/* Scatter Plot Representation */}
              <div className="relative bg-gray-50 rounded-lg p-8 mb-8">
                <div className="w-full h-64 bg-white rounded-lg border relative overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gray-400"></div>
                    <div className="absolute top-[50%] left-0 right-0 h-px bg-gray-400"></div>
                  </div>

                  {/* Quadrant Labels */}
                  <div className="absolute top-2 right-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    Expand
                  </div>
                  <div className="absolute top-2 left-2 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Retain
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Improve
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                    Emergency
                  </div>

                  {/* Sample Data Points */}
                  <div className="absolute w-4 h-4 bg-green-500/60 rounded-full" style={{left: '75%', top: '25%'}} title="High Health, Low Risk"></div>
                  <div className="absolute w-6 h-6 bg-green-500/60 rounded-full" style={{left: '80%', top: '30%'}} title="High Health, Low Risk - Large ARR"></div>
                  <div className="absolute w-3 h-3 bg-yellow-500/60 rounded-full" style={{left: '25%', top: '20%'}} title="Low Health, Low Risk"></div>
                  <div className="absolute w-5 h-5 bg-blue-500/60 rounded-full" style={{left: '65%', top: '75%'}} title="High Health, High Risk"></div>
                  <div className="absolute w-4 h-4 bg-red-500/60 rounded-full" style={{left: '20%', top: '80%'}} title="Low Health, High Risk"></div>
                  <div className="absolute w-3 h-3 bg-red-500/60 rounded-full" style={{left: '15%', top: '85%'}} title="Emergency Zone"></div>

                  {/* Axis Labels */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 text-xs text-gray-600 font-medium">
                    Health Score →
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 -rotate-90 text-xs text-gray-600 font-medium">
                    Churn Risk →
                  </div>
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  Bubble size = ARR • Quadrants = Strategic Action Required
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-blue-600" />
                    Health Score Components
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Engagement:</strong> Interaction frequency, meeting completion, response patterns</li>
                    <li>• <strong>Satisfaction:</strong> Recent NPS trends, detractor analysis, feedback sentiment</li>
                    <li>• <strong>Growth:</strong> Revenue expansion, seat growth, usage scaling</li>
                    <li>• <strong>Activity:</strong> Product adoption depth, feature utilization</li>
                    <li>• <strong>Support:</strong> Ticket patterns, resolution efficiency, escalation trends</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">Weighted by proven templates or custom strategy</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-red-600" />
                    Churn Risk Analysis
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Contract Risk:</strong> Renewal proximity, payment health, commitment signals</li>
                    <li>• <strong>Usage Risk:</strong> Adoption decline, feature abandonment, login patterns</li>
                    <li>• <strong>Relationship Risk:</strong> Engagement gaps, stakeholder turnover</li>
                    <li>• <strong>Satisfaction Risk:</strong> NPS detractors, support escalations, feedback tone</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">Balanced, contract-focused, or usage-focused templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Deep Insights for All Teams */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Beyond Customer Success: Intelligence for Everyone
              </span>
            </h2>
            <p className="text-xl text-gray-600">Fixing the "sticky leaky hole" problem across your entire organization</p>
          </div>

          <div className="mb-12">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">The "Sticky Leaky Hole" Problem</h3>
                <p className="text-lg text-gray-200 mb-6 max-w-4xl mx-auto">
                  Customer success isn't just a customer success team problem. When customers churn, it affects sales (missed expansion), 
                  marketing (wasted acquisition spend), product (feature adoption), and support (escalating issues). 
                  <strong>Everyone needs enablement, not just technical teams or sales.</strong>
                </p>
                <div className="flex justify-center items-center space-x-8 text-sm">
                  <div className="text-red-400">Sales loses expansion →</div>
                  <div className="text-yellow-400">Marketing wastes CAC →</div>
                  <div className="text-blue-400">Product loses adoption data →</div>
                  <div className="text-green-400">← Support gets blamed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Sales Enablement</h3>
                <p className="text-gray-600 text-sm">
                  Expansion opportunity intelligence, account health visibility for renewals, churn risk alerts for sales teams
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Marketing Intelligence</h3>
                <p className="text-gray-600 text-sm">
                  Customer journey insights, retention cohort analysis, account-based marketing prioritization, CAC payback optimization
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Product Insights</h3>
                <p className="text-gray-600 text-sm">
                  Feature adoption patterns, usage analytics, product-led growth signals, customer feedback aggregation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Leadership Visibility</h3>
                <p className="text-gray-600 text-sm">
                  Executive dashboards, revenue risk assessment, operational health metrics, strategic account prioritization
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              <strong>Customer success is everyone's job.</strong> Fastenr gives every team the customer intelligence they need to succeed, 
              from the front lines to the C-suite. No more information silos, no more missed signals, no more surprises.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Fix Customer Success at Scale?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join customer success teams who are finally getting the technology that matches the complexity of their job. 
            Built by customer success professionals, for customer success professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                Try Fastenr Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="bg-white text-blue-600 border-white hover:bg-blue-600 hover:text-white px-6 py-3 hover:border-blue-600 font-semibold">
                Talk to Us
              </Button>
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No more spreadsheet health scores • No more surprise churn • No more scale breaking points
          </p>
        </div>
      </section>

      <Footer />
      </div>
    </PublicLayout>
  )
}