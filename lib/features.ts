import { createServerClient } from '@/lib/supabase/server'

export enum FeatureTier {
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

// Simple feature definitions - premium features
export const PREMIUM_FEATURES = [
  'ai_insights',
  'advanced_analytics', 
  'automation',
  'surveys',
  'goals_management',
  'onboarding_management'
] as const

export type PremiumFeature = typeof PREMIUM_FEATURES[number]

export interface FeatureAccess {
  hasPremium: boolean
  seatCap: number
  trialActive: boolean
  trialEndsAt: string | null
}

/**
 * Check if a feature is premium
 */
export function isPremiumFeature(feature: string): feature is PremiumFeature {
  return PREMIUM_FEATURES.includes(feature as PremiumFeature)
}

/**
 * Get organization's feature access from database
 */
export async function getFeatureAccess(organizationId: string): Promise<FeatureAccess> {
  const supabase = createServerClient()
  
  const { data: org, error } = await supabase
    .from('organizations')
    .select('seat_cap, premium_addon, trial_ends_at')
    .eq('id', organizationId)
    .single()

  if (error || !org) {
    console.warn('Unable to fetch organization data for premium check:', error?.message || 'Organization not found')
    // Fallback to standard access if can't fetch
    return {
      hasPremium: false,
      seatCap: 10,
      trialActive: false,
      trialEndsAt: null
    }
  }

  const now = new Date()
  const trialEndsAt = org.trial_ends_at
  const trialActive = trialEndsAt ? new Date(trialEndsAt) > now : false

  // Premium access if:
  // 1. premium_addon is true, OR
  // 2. seat_cap >= 100 (premium included for enterprise), OR
  // 3. trial is currently active (trial includes premium features)
  const hasPremium = org.premium_addon || (org.seat_cap && org.seat_cap >= 100) || trialActive

  // Only log if there are access issues or debugging needed
  if (process.env.NODE_ENV === 'development' && !hasPremium) {
    console.info('Premium access denied for organization:', organizationId)
  }

  return {
    hasPremium: Boolean(hasPremium),
    seatCap: org.seat_cap || 10,
    trialActive,
    trialEndsAt
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  organizationId: string, 
  feature: string
): Promise<boolean> {
  // All non-premium features are always accessible
  if (!isPremiumFeature(feature)) {
    return true
  }

  const access = await getFeatureAccess(organizationId)
  return access.hasPremium
}