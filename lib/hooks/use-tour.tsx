'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TourStep {
  id: string
  title: string
  description: string
  target?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  page?: string
  action?: () => void
}

interface TourContextType {
  isActive: boolean
  currentStep: number
  steps: TourStep[]
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  skipTour: () => void
  shouldShowDummyData: boolean
  isLoading: boolean
}

const TourContext = createContext<TourContextType | null>(null)

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Fastenr!',
    description: 'Fastenr helps customer success teams reduce churn and drive growth. Let\'s take a quick tour to show you around.',
    page: 'dashboard'
  },
  {
    id: 'overview',
    title: 'How Fastenr Works',
    description: 'Think of us as your customer success command center. We track customer health, predict churn risk, and help you take action before customers leave.',
    page: 'dashboard'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard Overview',
    description: 'This is your command center. See customer health scores, at-risk accounts, and recent activities at a glance.',
    target: '[data-tour="dashboard-stats"]',
    page: 'dashboard'
  },
  {
    id: 'accounts',
    title: 'Customer Accounts',
    description: 'Here you manage all your customer accounts. Track health scores, engagement history, and growth opportunities.',
    target: '[data-tour="accounts-nav"]',
    page: 'accounts',
    action: () => window.location.href = '/dashboard/accounts'
  },
  {
    id: 'accounts-list',
    title: 'Account Management',
    description: 'View detailed account information, health scores, and engagement history. Click any account to dive deeper.',
    target: '[data-tour="accounts-table"]',
    page: 'accounts'
  },
  {
    id: 'contacts',
    title: 'Contact Management',
    description: 'Manage all your customer contacts, track communications, and build stronger relationships.',
    target: '[data-tour="contacts-nav"]',
    page: 'contacts',
    action: () => window.location.href = '/dashboard/contacts'
  },
  {
    id: 'contacts-list',
    title: 'Your Customer Network',
    description: 'See all contacts across accounts, track interactions, and never miss an important conversation.',
    target: '[data-tour="contacts-table"]',
    page: 'contacts'
  },
  {
    id: 'engagement-tracking',
    title: 'How Health & Churn Scoring Works',
    description: 'Your health scores are calculated from: engagement frequency, support ticket trends, product usage, contract value, and manual interactions you log. The more you engage and log activities, the more accurate the predictions become.',
    page: 'contacts'
  },
  {
    id: 'back-to-dashboard',
    title: 'Back to Your Dashboard',
    description: 'Let\'s head back to see how all this data comes together in your analytics.',
    page: 'dashboard',
    action: () => window.location.href = '/dashboard'
  },
  {
    id: 'final-scatter',
    title: 'Your Customer Success Command Center',
    description: 'Here\'s where everything comes together! This scatter plot shows all 47 of your accounts positioned by health score vs. churn risk. The accounts and contacts you just explored are now visualized as strategic dots - healthy accounts (top right) for expansion, at-risk accounts (bottom left) needing immediate attention. This is your bird\'s-eye view for prioritizing customer success efforts.',
    target: '[data-tour="health-scatter"]',
    page: 'dashboard'
  },
  {
    id: 'premium-trial',
    title: '🚀 Premium Features Unlocked!',
    description: 'Great news! You have access to all premium features for the next 30 days, including AI insights, advanced analytics, automated workflows, and priority support.',
    page: 'dashboard'
  },
  {
    id: 'complete',
    title: 'Welcome to Your Customer Success Journey!',
    description: 'You\'re all set! Start adding your real accounts and contacts to begin tracking their health and reducing churn.',
    page: 'dashboard'
  }
]

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPremiumTrial, setIsPremiumTrial] = useState(false)

  // Create dynamic tour steps based on premium status
  const dynamicTourSteps = isPremiumTrial 
    ? TOUR_STEPS 
    : TOUR_STEPS.filter(step => step.id !== 'premium-trial')

  useEffect(() => {
    const fetchTourStatus = async () => {
      try {
        const response = await fetch('/api/user/tour-status')
        if (response.ok) {
          const data = await response.json()
          setHasSeenTour(data.tour_completed)
        }
        
        // Also fetch premium trial status
        try {
          const orgResponse = await fetch('/api/debug/org')
          if (orgResponse.ok) {
            const orgData = await orgResponse.json()
            if (orgData.organization_id) {
              const premiumResponse = await fetch(`/api/features/premium?org_id=${orgData.organization_id}`)
              if (premiumResponse.ok) {
                const premiumData = await premiumResponse.json()
                // Set isPremiumTrial to true if user has trial active (includes premium features during trial)
                setIsPremiumTrial(premiumData.trialActive === true)
              }
            }
          }
        } catch (premiumError) {
          console.error('Failed to fetch premium trial status:', premiumError)
        }
      } catch (error) {
        console.error('Failed to fetch tour status:', error)
        // Fallback to localStorage for offline scenarios
        const localTourSeen = localStorage.getItem('fastenr-tour-completed')
        setHasSeenTour(!!localTourSeen)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTourStatus()
    
    // Check if there's an active tour state to restore (still use localStorage for temporary state)
    const tourState = localStorage.getItem('fastenr-tour-state')
    if (tourState) {
      try {
        const state = JSON.parse(tourState)
        // Only restore if timestamp is recent (within 30 seconds)
        if (state.timestamp && Date.now() - state.timestamp < 30000) {
          setIsActive(state.isActive)
          setCurrentStep(state.currentStep)
          // Clear the saved state after restoration
          localStorage.removeItem('fastenr-tour-state')
        } else {
          // Clean up old state
          localStorage.removeItem('fastenr-tour-state')
        }
      } catch (e) {
        // Clean up invalid state
        localStorage.removeItem('fastenr-tour-state')
      }
    }
  }, [])

  const startTour = () => {
    setIsActive(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < dynamicTourSteps.length - 1) {
      const nextStepIndex = currentStep + 1
      const nextStep = dynamicTourSteps[nextStepIndex]
      
      if (nextStep.action) {
        // Save tour state before navigation
        localStorage.setItem('fastenr-tour-state', JSON.stringify({
          isActive: true,
          currentStep: nextStepIndex,
          timestamp: Date.now()
        }))
        nextStep.action()
      } else {
        setCurrentStep(nextStepIndex)
      }
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const endTour = async () => {
    setIsActive(false)
    setCurrentStep(0)
    localStorage.removeItem('fastenr-tour-state') // Clear any saved tour state
    setHasSeenTour(true)
    
    // Save completion status to database
    try {
      await fetch('/api/user/tour-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: true }),
      })
      // Remove localStorage fallback once successfully saved to DB
      localStorage.removeItem('fastenr-tour-completed')
    } catch (error) {
      console.error('Failed to save tour completion to database:', error)
      // Fallback to localStorage if database save fails
      localStorage.setItem('fastenr-tour-completed', 'true')
    }
  }

  const skipTour = () => {
    endTour()
  }

  const shouldShowDummyData = isActive

  return (
    <TourContext.Provider value={{
      isActive,
      currentStep,
      steps: dynamicTourSteps,
      startTour,
      nextStep,
      prevStep,
      endTour,
      skipTour,
      shouldShowDummyData,
      isLoading
    }}>
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return context
}

export function useShouldAutoStartTour() {
  const { isLoading } = useTour()
  const [shouldStart, setShouldStart] = useState(false)

  useEffect(() => {
    const checkShouldAutoStart = async () => {
      if (isLoading) return
      
      try {
        const response = await fetch('/api/user/tour-status')
        if (response.ok) {
          const data = await response.json()
          setShouldStart(!data.tour_completed)
        }
      } catch (error) {
        console.error('Failed to check tour status for auto-start:', error)
        // Fallback to localStorage
        const tourSeen = localStorage.getItem('fastenr-tour-completed')
        setShouldStart(!tourSeen)
      }
    }

    checkShouldAutoStart()
  }, [isLoading])

  return shouldStart
}