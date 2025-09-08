/**
 * CRITICAL SECURITY: Organization Guard Component
 * 
 * This component provides frontend-level organization isolation.
 * While not a primary security control (server-side is critical), 
 * this prevents UI confusion and provides defense-in-depth.
 */

'use client'

import React from 'react'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrganizationContextType {
  organizationId: string | null
  isLoading: boolean
  isAuthorized: boolean
}

export const OrganizationContext = React.createContext<OrganizationContextType>({
  organizationId: null,
  isLoading: true,
  isAuthorized: false
})

/**
 * CRITICAL SECURITY: Organization Guard Provider
 * Wraps the entire application to enforce organization context
 */
export function OrganizationGuardProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function verifyOrganizationAccess() {
      try {
        const response = await fetch('/api/auth/verify-organization')
        
        if (!response.ok) {
          console.error('🚨 SECURITY: Organization verification failed')
          router.push('/auth/login')
          return
        }

        const data = await response.json()
        
        if (!data.organizationId) {
          console.error('🚨 SECURITY: No organization context found')
          router.push('/auth/setup')
          return
        }

        setOrganizationId(data.organizationId)
        setIsAuthorized(true)
        
      } catch (error) {
        console.error('🚨 SECURITY: Organization verification error:', error)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    verifyOrganizationAccess()
  }, [router])

  // Show loading state while verifying
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Block rendering if not authorized
  if (!isAuthorized || !organizationId) {
    return null
  }

  return (
    <OrganizationContext.Provider value={{ organizationId, isLoading, isAuthorized }}>
      {children}
    </OrganizationContext.Provider>
  )
}

/**
 * CRITICAL SECURITY: Data Sanitizer Hook
 * Validates that data belongs to current organization
 */
export function useOrganizationSanitizer() {
  const { organizationId } = React.useContext(OrganizationContext)

  const sanitizeData = <T extends { organization_id?: string }>(data: T | T[]): T | T[] | null => {
    if (!organizationId) {
      console.error('🚨 SECURITY: No organization context for data sanitization')
      return null
    }

    if (Array.isArray(data)) {
      // Filter array to only include items from current organization
      const sanitized = data.filter(item => {
        if (item.organization_id && item.organization_id !== organizationId) {
          console.error('🚨 SECURITY: Cross-organization data detected in array:', {
            expected: organizationId,
            found: item.organization_id,
            item: item
          })
          return false
        }
        return true
      })
      
      if (sanitized.length !== data.length) {
        console.warn(`🚨 SECURITY: Filtered out ${data.length - sanitized.length} cross-organization items`)
      }
      
      return sanitized
    } else {
      // Single item validation
      if (data.organization_id && data.organization_id !== organizationId) {
        console.error('🚨 SECURITY: Cross-organization data detected:', {
          expected: organizationId,
          found: data.organization_id,
          item: data
        })
        return null
      }
      
      return data
    }
  }

  return { sanitizeData, organizationId }
}

/**
 * CRITICAL SECURITY: Organization Data Wrapper
 * Automatically sanitizes props passed to child components
 */
export function OrganizationDataWrapper<T extends Record<string, any>>({ 
  data, 
  children 
}: { 
  data: T
  children: (sanitizedData: T | null) => React.ReactNode 
}) {
  const { sanitizeData } = useOrganizationSanitizer()
  
  const sanitizedData = React.useMemo(() => {
    if (!data) return null
    
    // Recursively sanitize nested data
    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj
      
      if (Array.isArray(obj)) {
        return sanitizeData(obj)
      }
      
      // For objects, check organization_id if present
      if (obj.organization_id) {
        return sanitizeData(obj)
      }
      
      // Recursively sanitize nested objects
      const sanitized = { ...obj }
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
          sanitized[key] = sanitizeObject(sanitized[key])
        }
      })
      
      return sanitized
    }
    
    return sanitizeObject(data)
  }, [data, sanitizeData])

  return <>{children(sanitizedData)}</>
}

/**
 * CRITICAL SECURITY: Component Guard
 * Prevents rendering if organization context is invalid
 */
export function withOrganizationGuard<P extends object>(
  Component: React.ComponentType<P>
) {
  return function GuardedComponent(props: P) {
    const { isAuthorized, organizationId } = React.useContext(OrganizationContext)
    
    if (!isAuthorized || !organizationId) {
      console.warn('🚨 SECURITY: Component blocked due to invalid organization context')
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Security Error</p>
          <p className="text-red-600 text-sm">Invalid organization context</p>
        </div>
      )
    }
    
    return <Component {...props} />
  }
}