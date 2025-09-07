import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPostBySlug, getAllBlogPosts, renderBlogMarkdown } from '@/lib/blog'
import MarkdownRenderer from '@/components/ui/markdown-renderer'
import PublicLayout from '@/components/layout/public-layout'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map(post => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Fastenr',
      description: 'The blog post you are looking for could not be found.'
    }
  }

  return {
    title: `${post.title} | Fastenr Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags
    }
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug)
  
  if (!post) {
    notFound()
  }

  const htmlContent = renderBlogMarkdown(post.content)

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
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
                <Link href="/blog">
                  <Button variant="ghost">Blog</Button>
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
        
        <main className="py-16">
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Article Header */}
            <header className="mb-12">
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {post.category}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg prose-blue max-w-none">
              <MarkdownRenderer htmlContent={htmlContent} />
            </div>

            {/* Article Footer */}
            <footer className="mt-16 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ready to transform your customer success operations?
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover how Fastenr can help you implement the strategies discussed in this post and drive real results for your business.
                </p>
                <div className="flex gap-4">
                  <a 
                    href="/demo" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    See Demo
                  </a>
                  <a 
                    href="/blog" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    More Articles
                  </a>
                </div>
              </div>
            </footer>
          </article>
        </main>
        
        <Footer />
      </div>
    </PublicLayout>
  )
}