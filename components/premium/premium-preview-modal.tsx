"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Crown, 
  Sparkles, 
  BarChart3, 
  MessageSquare, 
  Target, 
  Zap, 
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react"
import Link from "next/link"

interface PremiumPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PREMIUM_FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get intelligent analysis and actionable recommendations",
    features: [
      "Smart customer health predictions",
      "Automated churn risk alerts",
      "Personalized engagement recommendations",
      "Account expansion opportunities"
    ],
    preview: {
      type: "insight",
      content: "Customer 'Acme Corp' shows 85% growth potential based on usage patterns and engagement metrics"
    }
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Custom dashboards and detailed reporting capabilities",
    features: [
      "Interactive health score trends",
      "Custom KPI dashboards", 
      "Advanced segmentation",
      "Export & scheduling"
    ],
    preview: {
      type: "chart",
      content: "Health Score Trends, Revenue Analytics, Customer Segmentation"
    }
  },
  {
    icon: Target,
    title: "Goals Management",
    description: "Track customer goals and success milestones",
    features: [
      "Customer journey mapping",
      "Milestone tracking",
      "Success metrics",
      "Goal completion analytics"
    ],
    preview: {
      type: "goals",
      content: "12 active goals • 8 on track • 3 at risk • 1 achieved this month"
    }
  },
  {
    icon: MessageSquare,
    title: "Customer Surveys",
    description: "Collect feedback and measure satisfaction",
    features: [
      "NPS & CSAT surveys",
      "Custom questionnaires",
      "Automated follow-ups",
      "Sentiment analysis"
    ],
    preview: {
      type: "survey",
      content: "Average NPS: 8.4 • Response rate: 73% • Satisfaction trending up 12%"
    }
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Smart triggers and automated processes",
    features: [
      "Health score triggers",
      "Email automation",
      "Task creation",
      "Escalation workflows"
    ],
    preview: {
      type: "automation",
      content: "3 active workflows • 24 tasks automated this week • 89% success rate"
    }
  }
]

const PreviewCard = ({ feature, index }: { feature: typeof PREMIUM_FEATURES[0], index: number }) => {
  const IconComponent = feature.icon
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* Premium Badge */}
      <div className="absolute top-3 right-3">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Features List */}
        <div className="space-y-2">
          {feature.features.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>
        
        {/* Preview Section */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Preview</span>
          </div>
          <p className="text-sm text-indigo-700 font-medium">{feature.preview.content}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PremiumPreviewModal({ open, onOpenChange }: PremiumPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Unlock Premium Features
          </DialogTitle>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Take your customer success to the next level with AI-powered insights, advanced analytics, and automation tools
          </p>
        </DialogHeader>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {PREMIUM_FEATURES.map((feature, index) => (
            <PreviewCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-center mb-4 text-indigo-900">
            Why Premium?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-semibold text-indigo-900">Increase Revenue</h4>
              <p className="text-sm text-indigo-700">Identify expansion opportunities and reduce churn</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-semibold text-indigo-900">Improve Retention</h4>
              <p className="text-sm text-indigo-700">Proactive customer success management</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-semibold text-indigo-900">Prevent Churn</h4>
              <p className="text-sm text-indigo-700">Early warning systems and automated alerts</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 border-t border-gray-200">
          <Link href="/dashboard/admin/subscription" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-center text-muted-foreground mt-4">
          Start with a free trial • No commitment • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  )
}