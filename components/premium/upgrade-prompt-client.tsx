"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles, Zap, BarChart3, MessageSquare, Crown, Target, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { type PremiumFeature } from '@/lib/features'
import PremiumPreviewModal from './premium-preview-modal'

const FEATURE_INFO = {
  ai_insights: {
    name: 'AI Insights',
    description: 'Get AI-powered recommendations and predictions',
    icon: Sparkles
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Custom dashboards and detailed reporting',
    icon: BarChart3
  },
  automation: {
    name: 'Automation',
    description: 'Automated workflows and smart triggers',
    icon: Zap
  },
  surveys: {
    name: 'Customer Surveys',
    description: 'Collect feedback and measure satisfaction',
    icon: MessageSquare
  },
  goals_management: {
    name: 'Goals Management',
    description: 'Track and manage customer goals and milestones',
    icon: Target
  },
  onboarding_management: {
    name: 'Onboarding & Offboarding',
    description: 'Manage customer onboarding and offboarding processes with detailed checklists and timelines',
    icon: CheckCircle
  }
}

interface UpgradePromptClientProps {
  feature: PremiumFeature
}

export default function UpgradePromptClient({ feature }: UpgradePromptClientProps) {
  const [showModal, setShowModal] = useState(false)
  const featureInfo = FEATURE_INFO[feature]
  const IconComponent = featureInfo.icon

  return (
    <>
      <PremiumPreviewModal 
        open={showModal} 
        onOpenChange={setShowModal} 
      />
      <Card className="border-dashed border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <IconComponent className="w-5 h-5" />
            {featureInfo.name}
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600">Premium</Badge>
          </CardTitle>
          <CardDescription className="text-center">
            {featureInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-white/60 rounded-lg border">
            <Lock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-amber-800 font-medium">
              This feature requires a Premium subscription
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/dashboard/admin/subscription">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => setShowModal(true)}
            >
              Learn More
            </Button>
          </div>
          
          <p className="text-xs text-amber-700">
            Premium features include AI insights, advanced analytics, automation, and surveys
          </p>
        </CardContent>
      </Card>
    </>
  )
}