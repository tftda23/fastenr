import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  Shield,
  BarChart3,
  CheckCircle,
  Star,
  Zap,
  Heart,
  Globe,
  Award,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Home - Customer Success Platform",
  description: "Welcome to Fastenr - the comprehensive customer success platform that helps you track health scores, manage engagements, reduce churn, and drive sustainable growth.",
  openGraph: {
    title: "Fastenr - Transform Your Customer Success",
    description: "The all-in-one platform for customer success teams to reduce churn and drive growth.",
    url: "/home",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-foreground">
                <span className="font-bold">fastenr</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Built for Customer Success Teams
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Transform Your <span className="text-primary">Customer Success</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
              Reduce churn by up to 40% and increase customer lifetime value. Track health scores, automate engagements, 
              and turn customer insights into revenue growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                  Start Free 90-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              ✓ No credit card required • ✓ Full access • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Problem with Current Tools</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Customer success teams are forced to use sales CRMs or support ticketing systems that weren't designed for
              their unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Sales Tools Miss the Mark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sales CRMs focus on closing deals, not nurturing existing relationships. They lack the engagement
                  tracking and health scoring that CS teams need.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Support Tools Are Reactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Support platforms wait for problems to occur. Customer success is about being proactive and preventing
                  issues before they happen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  No Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generic tools don't track what matters: customer health, adoption rates, expansion opportunities, and
                  success milestones.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-secondary/10 text-secondary border-secondary/20">Our Philosophy</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Customer Success Needs Its Own Platform
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At <span className="font-bold text-foreground">fastenr</span>, we believe customer success is
                fundamentally different from sales and support. It requires specialized tools, metrics, and workflows
                designed around retention, expansion, and customer health.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We're opinionated about what works because we've seen what doesn't. Our platform provides actionable
                insights and proven methodologies to help you prevent churn and drive growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/signup">
                  <Button size="lg">
                    Try It Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Purpose-Built</h3>
                    <p className="text-muted-foreground">Designed specifically for CS workflows</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Data-Driven</h3>
                    <p className="text-muted-foreground">Actionable insights, not just reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Proactive</h3>
                    <p className="text-muted-foreground">Prevent churn before it happens</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Everything You Need for Customer Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed to help you understand, engage, and grow your customer relationships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle>Customer Health Scoring</CardTitle>
                <CardDescription>
                  Real-time health scores based on engagement, usage, and satisfaction metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Automated health calculations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Risk alerts and notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Trend analysis and predictions
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg w-fit">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Engagement Tracking</CardTitle>
                <CardDescription>
                  Monitor all customer touchpoints and interactions across your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Multi-channel engagement logs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Interaction frequency analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Communication preferences
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>Goal Management</CardTitle>
                <CardDescription>
                  Track both your team's success metrics and your customers' business objectives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Team performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Customer success milestones
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ROI measurement
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg w-fit">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>Adoption Analytics</CardTitle>
                <CardDescription>
                  Understand how customers use your product and identify expansion opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Feature usage tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Onboarding progress
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Expansion readiness scores
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle>Churn Prevention</CardTitle>
                <CardDescription>Proactive alerts and automated workflows to prevent customer churn</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Early warning systems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Automated intervention workflows
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Retention playbooks
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg w-fit">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle>Account Intelligence</CardTitle>
                <CardDescription>
                  Comprehensive account views with relationship mapping and stakeholder tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Stakeholder relationship maps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Account hierarchy visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-secondary" />
                    Decision maker identification
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Customer Success Is Different</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding the unique challenges and requirements of customer success teams.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Sales vs. Customer Success</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Sales: Acquisition Focus</h4>
                    <p className="text-muted-foreground">
                      Sales teams focus on closing new deals, with metrics like pipeline value and conversion rates.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">CS: Retention & Growth</h4>
                    <p className="text-muted-foreground">
                      Customer success focuses on retention, expansion, and long-term customer health and satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Support vs. Customer Success</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-destructive/10 text-destructive p-2 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Support: Reactive Problem Solving</h4>
                    <p className="text-muted-foreground">
                      Support teams wait for issues to arise and focus on resolution time and ticket volume.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">CS: Proactive Success Management</h4>
                    <p className="text-muted-foreground">
                      Customer success proactively ensures customers achieve their goals and maximize value from your
                      product.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Trusted by Customer Success Teams</h2>
            <p className="text-xl text-muted-foreground">
              See how teams are transforming their customer relationships with fastenr.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Finally, a platform that understands customer success. We've reduced churn by 40% since switching
                  from our old CRM."
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">VP Customer Success, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The health scoring and engagement tracking have completely changed how we manage our accounts. We're
                  now proactive instead of reactive."
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 text-secondary p-2 rounded-full">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Marcus Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Director of CS, GrowthCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Our expansion revenue has grown 60% since we started using fastenr's adoption analytics to identify
                  upsell opportunities."
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-full">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Emily Watson</p>
                    <p className="text-sm text-muted-foreground">CS Manager, ScaleUp Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Customer Success?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of customer success teams who have made the switch to a platform built for their needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-white/80 mt-6">No credit card required • 14-day free trial • Setup in minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="text-2xl font-bold text-foreground mb-4 inline-block">
              <span className="font-bold">fastenr</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              The customer success platform built for customer success teams.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
