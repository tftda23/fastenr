import type { Metadata } from 'next'
import Link from 'next/link'
import { getDocBySlug, getAllDocs, renderDocMarkdown } from '@/lib/docs'
import MarkdownRenderer from '@/components/ui/markdown-renderer'
import PublicLayout from '@/components/layout/public-layout'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/ui/logo'
import { Calendar, Clock, User, Tag, ArrowLeft, BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'

interface DocPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const docs = getAllDocs()
  return docs.map(doc => ({
    slug: doc.slug
  }))
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const doc = getDocBySlug(params.slug)
  
  if (!doc) {
    return {
      title: 'Documentation Not Found | Fastenr',
      description: 'The documentation page you are looking for could not be found.'
    }
  }

  return {
    title: `${doc.title} | Fastenr Documentation`,
    description: doc.description || doc.excerpt,
    openGraph: {
      title: doc.title,
      description: doc.description || doc.excerpt,
      type: 'article',
      tags: doc.tags
    }
  }
}

export default function DocPage({ params }: DocPageProps) {
  const doc = getDocBySlug(params.slug)
  
  if (!doc) {
    notFound()
  }

  const htmlContent = renderDocMarkdown(doc.content)

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
                <Link href="/documentation">
                  <Button variant="ghost">Documentation</Button>
                </Link>
                <Link href="/support">
                  <Button variant="ghost">Support</Button>
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
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link href="/documentation" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documentation
              </Link>
            </div>

            {/* Article Header */}
            <header className="mb-12">
              <div className="mb-6">
                <Badge className="mb-4 bg-blue-100 text-blue-700">{doc.category}</Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {doc.title}
              </h1>
              
              {doc.description && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {doc.description}
                </p>
              )}
              
              {/* Doc Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-8 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="capitalize">{doc.difficulty}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{doc.readTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(doc.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                {doc.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex flex-wrap gap-2">
                      {doc.tags.map(tag => (
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
                  Need More Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help you get the most out of Fastenr.
                </p>
                <div className="flex gap-4">
                  <Link href="/support">
                    <Button variant="outline">
                      Visit Help Center
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                      Contact Support
                    </Button>
                  </Link>
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