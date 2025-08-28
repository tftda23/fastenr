"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SurveyPreviewProps {
  survey: {
    id: string
    title: string
    subject: string
    content: string
    logo_url?: string
    links?: Array<{
      id: string
      title: string
      url: string
    }>
    organizations?: {
      name: string
      logo_url?: string
    }
  }
}

export default function SurveyPreview({ survey }: SurveyPreviewProps) {
  const logoUrl = survey.logo_url || survey.organizations?.logo_url
  const organizationName = survey.organizations?.name || "Your Organization"

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Preview Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Preview Mode</Badge>
          <span className="text-sm text-muted-foreground">
            This is how your survey will appear to recipients
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.close()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Close Preview
        </Button>
      </div>

      {/* Survey Email Preview */}
      <Card className="mb-8 border-2 border-dashed border-gray-300">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Email Preview</h3>
            <Badge variant="outline">Email Subject</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{survey.subject}</p>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-6">
            {/* Email Header */}
            {logoUrl && (
              <div className="flex justify-center mb-6">
                <Image
                  src={logoUrl}
                  alt={`${organizationName} logo`}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              </div>
            )}

            {/* Email Content */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {survey.content}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Take Survey
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Additional Links */}
              {survey.links && survey.links.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">Additional Resources</p>
                  <div className="space-y-2">
                    {survey.links.map((link) => (
                      <div key={link.id}>
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm underline"
                        >
                          {link.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
                <p>Powered by Fastenr • Survey feedback platform</p>
                <p className="mt-1">This survey typically takes 2-3 minutes to complete</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Survey Form Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Survey Form Preview</h3>
            <Badge variant="outline">Interactive Form</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This is a sample of what the survey form would look like
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-6">
            {/* Header */}
            {logoUrl && (
              <div className="flex justify-center mb-6">
                <Image
                  src={logoUrl}
                  alt={`${organizationName} logo`}
                  width={100}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
              <p className="text-gray-600">We value your feedback and appreciate your time</p>
            </div>

            {/* Sample Questions - These would be dynamic based on survey type */}
            <div className="space-y-6">
              {/* NPS Style Question */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  How likely are you to recommend our service to a friend or colleague?
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Not likely</span>
                  <div className="flex space-x-2">
                    {[...Array(11)].map((_, i) => (
                      <button
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium disabled:opacity-50"
                        disabled
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">Very likely</span>
                </div>
              </div>

              {/* Rating Question */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  How would you rate your overall experience?
                </label>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-8 h-8 text-gray-300 hover:text-yellow-400 cursor-pointer"
                      fill="none"
                    />
                  ))}
                </div>
              </div>

              {/* Text Question */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  What could we improve? (Optional)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none disabled:bg-gray-50"
                  rows={4}
                  placeholder="Please share any suggestions or feedback..."
                  disabled
                />
              </div>
            </div>

            {/* Form Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Your responses are anonymous and secure
                </p>
                <Button disabled>
                  Submit Survey
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}