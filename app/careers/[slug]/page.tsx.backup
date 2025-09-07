import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import MarkdownRenderer from "@/components/ui/markdown-renderer"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"
import { getAllJobs, getJobBySlug, renderMarkdown } from "@/lib/jobs"
import { ArrowLeft, MapPin, Clock, Building } from "lucide-react"

export async function generateStaticParams() {
  const jobs = getAllJobs()
  return jobs.map((job) => ({
    slug: job.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = getJobBySlug(params.slug)
  
  if (!job) {
    return {
      title: 'Job Not Found - Fastenr Careers'
    }
  }

  return {
    title: `${job.title} - Fastenr Careers`,
    description: job.excerpt,
  }
}

export default function JobPage({ params }: { params: { slug: string } }) {
  const job = getJobBySlug(params.slug)

  if (!job) {
    notFound()
  }

  const htmlContent = renderMarkdown(job.content)

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
                <Link href="/careers">
                  <Button variant="ghost">All Jobs</Button>
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

        {/* Job Header */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/careers" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Careers
            </Link>
            
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
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

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Join Our Team?</h3>
                  <p className="text-blue-100">
                    Send us your application and let's build something amazing together.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <a 
                    href={`mailto:careers@fastenr.com?subject=Application for ${job.title}&body=Hi there! I'm interested in applying for the ${job.title} position.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0AThanks!`}
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Description */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <MarkdownRenderer htmlContent={htmlContent} />
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Apply?</h3>
                  <p className="text-gray-600 mb-6">
                    We're excited to learn more about you and how you can contribute to our mission.
                  </p>
                  <a 
                    href={`mailto:careers@fastenr.com?subject=Application for ${job.title}&body=Hi there! I'm interested in applying for the ${job.title} position.%0D%0A%0D%0APlease find my resume attached.%0D%0A%0D%0AThanks!`}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-lg"
                  >
                    Apply for this Position
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    Or email us directly at <a href="mailto:careers@fastenr.com" className="text-blue-600 hover:text-blue-800">careers@fastenr.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  )
}