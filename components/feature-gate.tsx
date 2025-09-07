import { type PremiumFeature, getFeatureAccess, isPremiumFeature } from '@/lib/features'
import UpgradePromptClient from '@/components/premium/upgrade-prompt-client'

interface FeatureGateProps {
  organizationId: string
  feature: PremiumFeature
  children: React.ReactNode
  fallback?: React.ReactNode
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

  return <>{fallback || <UpgradePromptClient feature={feature} />}</>
}

export default FeatureGate