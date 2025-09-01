"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, MessageCircle, ArrowRight } from "lucide-react"

interface DemoVideoProps {
  wantsToSpeak: boolean
  trackingId?: string
}

export default function DemoVideo({ wantsToSpeak, trackingId }: DemoVideoProps) {
  const [isUpdatingTeamRequest, setIsUpdatingTeamRequest] = useState(false)
  const router = useRouter()

  const handleSpeakWithTeam = async () => {
    if (wantsToSpeak) {
      // Already marked - just redirect to contact
      router.push('/contact')
      return
    }

    setIsUpdatingTeamRequest(true)
    try {
      await fetch('/api/demo/speak-with-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingId }),
      })
      
      // Redirect to contact page regardless of API response
      router.push('/contact')
    } catch (error) {
      // Still redirect - this is optional functionality
      router.push('/contact')
    } finally {
      setIsUpdatingTeamRequest(false)
    }
  }

  const handleSignUp = () => {
    // Add tracking parameter to signup URL
    const signupUrl = trackingId 
      ? `/auth/signup?demo_tracking_id=${trackingId}` 
      : '/auth/signup'
    router.push(signupUrl)
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Video Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video bg-gray-900 overflow-hidden rounded-lg">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${process.env.NEXT_PUBLIC_DEMO_VIDEO_ID || 'dQw4w9WgXcQ'}`}
              title="Fastenr Product Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={handleSignUp}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Start Free Trial
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        
        <Button 
          size="lg" 
          variant="outline" 
          className={`w-full sm:w-auto ${
            wantsToSpeak ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : ''
          }`}
          onClick={handleSpeakWithTeam}
          disabled={isUpdatingTeamRequest}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {wantsToSpeak ? 'Speak with Our Team' : 'Speak with Team'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {wantsToSpeak && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-900 mb-2">
                Thanks for your interest in speaking with our team!
              </h4>
              <p className="text-sm text-blue-700">
                We've flagged your request and someone from our team will reach out to you within 24 hours 
                to schedule a personalized demo and discuss your customer success needs.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}