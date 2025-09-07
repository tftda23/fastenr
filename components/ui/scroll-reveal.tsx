'use client'

import { useScrollAnimation } from '@/lib/hooks/use-scroll-animation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  threshold?: number
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'fade-in' | 'scale-up'
}

export function ScrollReveal({ 
  children, 
  className, 
  delay = 0, 
  threshold = 0.1,
  animation = 'fade-up'
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation(threshold)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getAnimationClasses = () => {
    const base = 'transition-all duration-700 ease-out'
    
    // Show content immediately on server and when not mounted to avoid flicker
    if (!isMounted) {
      return `${base} opacity-100`
    }
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return `${base} opacity-0 translate-y-8`
        case 'fade-down':
          return `${base} opacity-0 -translate-y-8`
        case 'fade-left':
          return `${base} opacity-0 translate-x-8`
        case 'fade-right':
          return `${base} opacity-0 -translate-x-8`
        case 'fade-in':
          return `${base} opacity-0`
        case 'scale-up':
          return `${base} opacity-0 scale-95`
        default:
          return `${base} opacity-0 translate-y-8`
      }
    } else {
      return `${base} opacity-100 translate-y-0 translate-x-0 scale-100`
    }
  }

  return (
    <div
      ref={ref as any}
      className={cn(getAnimationClasses(), className)}
      style={{ 
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}