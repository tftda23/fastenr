import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageMetricsClient } from '@/components/usage-metrics/usage-metrics-client'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import { getFeatureAccess } from '@/lib/features'
import FeatureGate from '@/components/feature-gate'
import { redirect } from 'next/navigation'

async function getUsageMetricsData() {
  const { user, organization } = await getCurrentUserOrganization()
  if (!user || !organization) {
    redirect("/auth/login")
  }

  try {
    // For now, skip the dogfood endpoint and use regular data fetching
    // TODO: Re-enable dogfood endpoint with proper internal API call handling
    const supabase = createClient()
    
    const { data: trackingProducts, error: productsError } = await supabase
      .from('usage_tracking_products')
      .select(`
        id, name, domain, tracking_key, created_at,
        is_active, last_activity_at, track_by_account
      `)
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Error fetching tracking products:', productsError)
      return { products: [], metrics: null, hasData: false, organization }
    }

    const productIds = trackingProducts?.map(p => p.id) || []
    let metrics = null
    let trackedAccounts = []
    
    if (productIds.length > 0) {
      // Fetch tracked accounts for products that use account-based tracking
      const accountTrackingProducts = trackingProducts?.filter(p => p.track_by_account) || []
      if (accountTrackingProducts.length > 0) {
        const { data: accountsData } = await supabase
          .from('usage_tracked_accounts')
          .select(`
            id, account_id, account_name, account_domain,
            product_id, last_activity_at,
            usage_tracking_products!inner(name)
          `)
          .in('product_id', accountTrackingProducts.map(p => p.id))
          .eq('is_active', true)
          .order('last_activity_at', { ascending: false })
        
        trackedAccounts = accountsData || []
      }

      // Fetch usage metrics with account context
      const { data: usageData, error: metricsError } = await supabase
        .from('usage_metrics')
        .select(`
          product_id,
          tracked_account_id,
          unique_users,
          total_sessions,
          avg_session_duration,
          page_views,
          feature_usage,
          recorded_at,
          usage_tracking_products!inner(name, track_by_account),
          usage_tracked_accounts(account_id, account_name, account_domain)
        `)
        .in('product_id', productIds)
        .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false })

      if (!metricsError && usageData) {
        metrics = usageData
      }
    }

    // Get proper premium access
    const premiumAccess = await getFeatureAccess(organization.id)

    return {
      products: trackingProducts || [],
      metrics,
      trackedAccounts,
      hasData: (trackingProducts?.length || 0) > 0 || (metrics?.length || 0) > 0,
      organization: {
        ...organization,
        premiumAccess
      }
    }

  } catch (error) {
    console.error('Error in getUsageMetricsData:', error)
    return { products: [], metrics: null, hasData: false, organization }
  }
}

export default async function UsageMetricsPage() {
  const { user, organization } = await getCurrentUserOrganization()

  if (!user || !organization) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage & Adoption Metrics</h1>
        <p className="text-muted-foreground mt-2">
          Track user adoption and engagement across your products with innovative user identification.
        </p>
      </div>

      <FeatureGate organizationId={organization.id} feature="usage_tracking">
        <Suspense 
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>Fetching usage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <UsageMetricsDataWrapper />
        </Suspense>
      </FeatureGate>
    </div>
  )
}

async function UsageMetricsDataWrapper() {
  const data = await getUsageMetricsData()
  
  return (
    <UsageMetricsClient 
      products={data.products}
      metrics={data.metrics}
      trackedAccounts={data.trackedAccounts}
      hasData={data.hasData}
      organization={data.organization}
    />
  )
}