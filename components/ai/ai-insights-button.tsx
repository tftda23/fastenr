"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { AIInsightsModal } from './ai-insights-modal'

interface AIInsightsButtonProps {
  pageType: 'dashboard' | 'accounts' | 'account-detail' | 'contacts'
  pageContext?: {
    accountId?: string
    ownerId?: string
    activeTab?: string
    filters?: any
  }
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export function AIInsightsButton({ 
  pageType, 
  pageContext, 
  variant = 'outline',
  size = 'default'
}: AIInsightsButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Sparkles className="h-4 w-4" />
        AI Insights
      </Button>

      <AIInsightsModal
        open={showModal}
        onOpenChange={setShowModal}
        pageType={pageType}
        pageContext={pageContext}
      />
    </>
  )
}