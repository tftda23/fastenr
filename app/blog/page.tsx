import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Clock, 
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Brain,
  Target,
  Zap,
  Heart
} from "lucide-react"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"
import { getAllBlogPosts, getFeaturedBlogPosts, getAllCategories } from '@/lib/blog'

export const metadata: Metadata = {
  title: "Blog - Fastenr",
  description: "Insights, tips, and best practices for customer success teams. Learn how to reduce churn and drive growth.",
}

export default function BlogPage() {
  const allPosts = getAllBlogPosts()
  const featuredPosts = getFeaturedBlogPosts()
  const allCategories = getAllCategories()
  
  const featuredPost = featuredPosts[0] || allPosts[0]
  const blogPosts = allPosts.slice(0, 6) // Show first 6 posts
  
  // Create categories with counts
  const categories = [
    { name: "All Posts", count: allPosts.length, active: true },
    ...allCategories.map(category => ({
      name: category,
      count: allPosts.filter(post => post.category === category).length,
      active: false
    }))
  ]

  // Helper function to get gradient colors based on category
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'AI & Machine Learning': 'from-green-500 to-emerald-500',
      'Team Building': 'from-blue-500 to-indigo-500',
      'Analytics': 'from-purple-500 to-pink-500',
      'Automation': 'from-orange-500 to-red-500',
      'Customer Success': 'from-teal-500 to-cyan-500',
      'Best Practices': 'from-pink-500 to-rose-500'
    }
    return colorMap[category] || 'from-gray-500 to-slate-500'
  }

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'AI & Machine Learning': Brain,
      'Team Building': Users,
      'Analytics': BarChart3,
      'Automation': Zap,
      'Customer Success': Target,
      'Best Practices': Heart
    }
    const IconComponent = iconMap[category] || Target
    return <IconComponent className="h-12 w-12 text-white" />
  }

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
              <Brain className="h-4 w-4 mr-2" />
              Customer Success Insights
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Learn & Grow
              </span>
              <br />
              <span className="text-gray-900">Your Customer Success</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the latest strategies, best practices, and insights from customer success experts. 
              Stay ahead of the curve with actionable content that drives real results.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Article</h2>
            <p className="text-gray-600">Our most popular content this week</p>
          </div>

          <Card className="border-0 shadow-2xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className={`h-64 md:h-full bg-gradient-to-r ${getCategoryColor(featuredPost.category)} flex items-center justify-center`}>
                  <div className="text-center text-white p-8">
                    {getCategoryIcon(featuredPost.category)}
                    <p className="text-lg font-medium opacity-90 mt-4">Featured Article</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <Badge className="mb-4 bg-blue-100 text-blue-700">{featuredPost.category}</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h3>
                <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {featuredPost.readTime}
                    </span>
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories & Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={category.active ? "default" : "outline"}
                  className={category.active ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`h-32 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-lg flex items-center justify-center mb-4`}>
                    {getCategoryIcon(post.category)}
                  </div>
                  <Badge className="mb-2 w-fit">{post.category}</Badge>
                  <CardTitle className="text-xl text-gray-900 line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Stay Updated with Customer Success Insights
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest articles, case studies, and best practices delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900"
            />
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Subscribe
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            No spam, unsubscribe anytime. Join 5,000+ customer success professionals.
          </p>
        </div>
      </section>

      <Footer />
      </div>
    </PublicLayout>
  )
}