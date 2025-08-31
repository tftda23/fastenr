"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import PublicLayout from "@/components/layout/public-layout"
import Footer from "@/components/layout/footer"
import DemoAccessForm from "@/components/demo-access-form"
import DemoVideo from "@/components/demo-video"
import { ArrowLeft } from "lucide-react"

export default function DemoPage() {
  const [hasAccess, setHasAccess] = useState(false)
  const [wantsToSpeak, setWantsToSpeak] = useState(false)
  const [trackingId, setTrackingId] = useState<string | undefined>()

  const handleAccessGranted = (userWantsToSpeak: boolean, userTrackingId?: string) => {
    setWantsToSpeak(userWantsToSpeak)
    setTrackingId(userTrackingId)
    setHasAccess(true)
  }

  return (
    <PublicLayout>
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
          {!hasAccess ? (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  See a Demo
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  See how Fastenr can transform your customer success operations with AI-powered insights and automated workflows.
                </p>
              </div>
              
              <DemoAccessForm onAccessGranted={handleAccessGranted} />
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Fastenr Platform Demo
                </h1>
                <p className="text-lg text-gray-600">
                  Discover the future of customer success management
                </p>
              </div>
              
              <DemoVideo wantsToSpeak={wantsToSpeak} trackingId={trackingId} />
            </>
          )}

          <div className="text-center mt-8">
            <Link href="/home">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </PublicLayout>
  )
}