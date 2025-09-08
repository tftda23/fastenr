'use client'

import { useEffect, useState } from 'react'
import { useTour } from '@/lib/hooks/use-tour'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ArrowLeft, ArrowRight, Play, SkipForward } from 'lucide-react'

export function TourOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, endTour, skipTour } = useTour()
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  const currentTourStep = steps[currentStep]

  useEffect(() => {
    if (isActive && currentTourStep?.target) {
      const element = document.querySelector(currentTourStep.target) as HTMLElement
      if (element) {
        // Clear target first to hide highlight during scroll
        setTargetElement(null)
        
        // Scroll element into view more gently
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        
        // Set target element AFTER scroll completes
        setTimeout(() => {
          if (currentTourStep.target) {
            const updatedElement = document.querySelector(currentTourStep.target) as HTMLElement
            if (updatedElement) {
              setTargetElement(updatedElement)
            }
          }
        }, 1000) // Wait for scroll animation to complete
        
        // Also listen for scroll events to update position
        const handleScroll = () => {
          if (currentTourStep.target) {
            const scrolledElement = document.querySelector(currentTourStep.target) as HTMLElement
            if (scrolledElement) {
              setTargetElement(scrolledElement)
            }
          }
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        return () => {
          window.removeEventListener('scroll', handleScroll)
        }
      }
    } else {
      setTargetElement(null)
    }
  }, [isActive, currentStep, currentTourStep])

  if (!isActive || !currentTourStep) return null

  const getTooltipPosition = () => {
    // For steps without target element, center on screen with bounds checking
    if (!targetElement) {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const modalWidth = 480  // Increased from 384 to 480 for better content fit
      const modalHeight = 480  // Increased from 400 to 480 for better content fit
      const padding = 20
      
      // Calculate safe positioning
      const maxWidth = Math.min(modalWidth, viewportWidth - padding * 2)
      const maxHeight = Math.min(modalHeight, viewportHeight - padding * 2)
      
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        width: `${maxWidth}px`
      }
    }

    const rect = targetElement.getBoundingClientRect()
    const placement = currentTourStep.placement || 'bottom'
    const modalWidth = 384 // w-96 = 384px
    const modalHeight = 400 // increased estimate for larger content
    const padding = 20
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let position = { top: 0, left: 0, transform: 'translate(0, 0)', maxWidth: '90vw', maxHeight: '90vh' }

    switch (placement) {
      case 'top':
        position = {
          top: Math.max(padding, rect.top - modalHeight - padding),
          left: Math.min(Math.max(padding, rect.left + rect.width / 2 - modalWidth / 2), viewportWidth - modalWidth - padding),
          transform: 'translate(0, 0)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
        break
      case 'bottom':
        position = {
          top: Math.min(rect.bottom + padding, viewportHeight - modalHeight - padding),
          left: Math.min(Math.max(padding, rect.left + rect.width / 2 - modalWidth / 2), viewportWidth - modalWidth - padding),
          transform: 'translate(0, 0)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
        break
      case 'left':
        position = {
          top: Math.min(Math.max(padding, rect.top + rect.height / 2 - modalHeight / 2), viewportHeight - modalHeight - padding),
          left: Math.max(padding, rect.left - modalWidth - padding),
          transform: 'translate(0, 0)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
        break
      case 'right':
        position = {
          top: Math.min(Math.max(padding, rect.top + rect.height / 2 - modalHeight / 2), viewportHeight - modalHeight - padding),
          left: Math.min(rect.right + padding, viewportWidth - modalWidth - padding),
          transform: 'translate(0, 0)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
        break
      default:
        // Default to bottom with fallback positioning
        position = {
          top: Math.min(rect.bottom + padding, viewportHeight - modalHeight - padding),
          left: Math.min(Math.max(padding, rect.left + rect.width / 2 - modalWidth / 2), viewportWidth - modalWidth - padding),
          transform: 'translate(0, 0)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
    }

    return position
  }

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      {/* Backdrop with fully clear rounded cutout */}
      {targetElement ? (
        <div
          className="fixed pointer-events-none z-[9990] rounded-lg"
          style={{
            top: targetElement.getBoundingClientRect().top - 12,
            left: targetElement.getBoundingClientRect().left - 12,
            width: targetElement.getBoundingClientRect().width + 24,
            height: targetElement.getBoundingClientRect().height + 24,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6)`,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/60 z-[9990]" />
      )}
      
      {/* Highlight border for target element */}
      {targetElement && (
        <div
          className="fixed border-2 border-blue-400 rounded-lg bg-transparent pointer-events-none z-[9995]"
          style={{
            top: targetElement.getBoundingClientRect().top - 12,
            left: targetElement.getBoundingClientRect().left - 12,
            width: targetElement.getBoundingClientRect().width + 24,
            height: targetElement.getBoundingClientRect().height + 24,
          }}
        />
      )}

      {/* Tour tooltip */}
      <Card 
        className={`fixed z-[9999] shadow-2xl border-2 bg-white ${targetElement ? (currentTourStep.id === 'final-scatter' ? 'w-[520px]' : 'w-96') : 'w-[480px]'}`}
        style={targetElement ? getTooltipPosition() : { 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {currentStep + 1}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={endTour}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-xl font-bold">{currentTourStep.title}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed text-gray-700">
            {currentTourStep.description}
          </CardDescription>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip Tour
            </Button>

            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="px-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isLastStep ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export function TourStartButton() {
  const { startTour } = useTour()

  return (
    <Button
      variant="outline"
      onClick={startTour}
      className="text-sm"
    >
      <Play className="h-4 w-4 mr-2" />
      Take Tour
    </Button>
  )
}