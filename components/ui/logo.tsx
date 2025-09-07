"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface LogoProps {
  variant?: "black" | "white"
  size?: "sm" | "md" | "lg"
  className?: string
  showBeta?: boolean
}

export function Logo({ variant = "black", size = "md", className, showBeta = true }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  
  const sizeClasses = {
    sm: "h-5 w-auto", // Smaller
    md: "h-6 w-auto", // Smaller 
    lg: "h-8 w-auto"  // Smaller
  }

  const logoSrc = variant === "white" ? "/logos/fastenr-white.svg" : "/logos/fastenr-black.svg"

  // If image failed to load, show fallback
  if (imageError) {
    return <LogoWithIcon variant={variant} size={size} className={className} showBeta={showBeta} />
  }

  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoSrc}
        alt="Fastenr"
        width={100}
        height={32}
        className={cn(sizeClasses[size], className)}
        priority
        onError={() => setImageError(true)}
      />
      {showBeta && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          BETA
        </span>
      )}
    </div>
  )
}

// Fallback component with text for when SVG is not available
export function LogoWithIcon({ variant = "black", size = "md", className, showBeta = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl"
  }

  const textColor = variant === "white" ? "text-white" : "text-gray-900"

  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        "font-bold font-inter",
        textColor,
        sizeClasses[size],
        className
      )}>
        fastenr
      </span>
      {showBeta && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          BETA
        </span>
      )}
    </div>
  )
}

// Enhanced fallback with icon (for special cases)
export function LogoWithIconFull({ variant = "black", size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg", 
    lg: "text-xl"
  }

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const textColor = variant === "white" ? "text-white" : "text-gray-900"
  const gradientColor = variant === "white" 
    ? "from-white to-gray-200" 
    : "from-blue-600 to-purple-600"

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "bg-gradient-to-r rounded-lg flex items-center justify-center",
        gradientColor,
        iconSizeClasses[size]
      )}>
        <svg 
          className={cn("text-white", iconSizeClasses[size])} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
      </div>
      <span className={cn(
        "font-bold bg-gradient-to-r bg-clip-text text-transparent",
        variant === "white" ? "text-white" : gradientColor,
        sizeClasses[size]
      )}>
        fastenr
      </span>
    </div>
  )
}