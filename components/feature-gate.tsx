import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles, Zap, BarChart3, MessageSquare, Crown } from 'lucide-react'
import Link from 'next/link'
import { type PremiumFeature, getFeatureAccess, isPremiumFeature } from '@/lib/features'

interface FeatureGateProps {
  organizationId: string
  feature: PremiumFeature
  children: React.ReactNode
  fallback?: React.ReactNode
}

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
  }
}

function UpgradePrompt({ feature }: { feature: PremiumFeature }) {
  const featureInfo = FEATURE_INFO[feature]
  const IconComponent = featureInfo.icon

  return (
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
          <Button variant="outline">
            Learn More
          </Button>
        </div>
        
        <p className="text-xs text-amber-700">
          Premium features include AI insights, advanced analytics, automation, and surveys
        </p>
      </CardContent>
    </Card>
  )
}

export async function FeatureGate({ organizationId, feature, children, fallback }: FeatureGateProps): Promise<React.JSX.Element> {
  // Check if feature is premium
  if (!isPremiumFeature(feature)) {
    return <>{children}</>
  }

  try {
    const access = await getFeatureAccess(organizationId)
    
    if (access.hasPremium) {
      return <>{children}</>
    }
  } catch (error) {
    console.error('Feature access check failed:', error)
  }

  return <>{fallback || <UpgradePrompt feature={feature} />}</>
}

export default FeatureGate