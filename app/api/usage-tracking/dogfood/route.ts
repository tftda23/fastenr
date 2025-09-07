import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Check if this is a Fastenr organization (or allow for demo purposes)
    const isDemoOrg = organization.name?.toLowerCase().includes('fastenr') || 
                      organization.id === organization.id // Allow any org for demo

    if (!isDemoOrg) {
      // For non-demo orgs, just return their own data
      const { data: products } = await supabase
        .from('usage_tracking_products')
        .select(`
          id, name, domain, tracking_key, created_at,
          is_active, last_activity_at
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      const productIds = products?.map(p => p.id) || []
      let metrics = null
      
      if (productIds.length > 0) {
        const { data: usageData } = await supabase
          .from('usage_metrics')
          .select(`
            product_id,
            unique_users,
            total_sessions,
            avg_session_duration,
            page_views,
            feature_usage,
            recorded_at
          `)
          .in('product_id', productIds)
          .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('recorded_at', { ascending: false })

        metrics = usageData
      }

      return NextResponse.json({
        products: products || [],
        metrics,
        hasData: (products?.length || 0) > 0 && (metrics?.length || 0) > 0,
        isDogfooding: false
      })
    }

    // For demo/Fastenr orgs, aggregate data from ALL organizations for demo purposes
    console.log('Dogfooding mode: Aggregating usage data from all organizations for demo')

    // Get aggregated metrics from all organizations (for demo purposes)
    const { data: allMetrics, error: metricsError } = await supabase
      .from('usage_metrics')
      .select(`
        unique_users,
        total_sessions,
        avg_session_duration,
        page_views,
        feature_usage,
        recorded_at,
        usage_tracking_products!inner(
          organization_id,
          name,
          domain
        )
      `)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })

    if (metricsError) {
      console.error('Error fetching dogfood metrics:', metricsError)
    }

    // Create synthetic "Fastenr Platform" product for demo
    const syntheticProducts = [
      {
        id: 'fastenr_platform',
        name: 'Fastenr Platform',
        domain: 'fastenr.co',
        tracking_key: 'demo_key_fastenr_platform',
        created_at: new Date().toISOString(),
        is_active: true,
        last_activity_at: new Date().toISOString()
      }
    ]

    // Aggregate the metrics by day for a realistic demo
    const aggregatedMetrics: any[] = []
    const metricsByDate: { [date: string]: any } = {}

    if (allMetrics) {
      allMetrics.forEach((metric: any) => {
        const date = metric.recorded_at.split('T')[0] // Get date part
        
        if (!metricsByDate[date]) {
          metricsByDate[date] = {
            product_id: 'fastenr_platform',
            recorded_at: date,
            unique_users: 0,
            total_sessions: 0,
            avg_session_duration: 0,
            page_views: 0,
            feature_usage: {
              page_views: 0,
              clicks: 0,
              forms: 0,
              scroll_engagement: 0,
              long_sessions: 0
            },
            count: 0
          }
        }

        // Aggregate the data
        metricsByDate[date].unique_users += metric.unique_users || 0
        metricsByDate[date].total_sessions += metric.total_sessions || 0
        metricsByDate[date].page_views += metric.page_views || 0
        metricsByDate[date].avg_session_duration += metric.avg_session_duration || 0
        metricsByDate[date].count++

        // Aggregate feature usage
        const featureUsage = metric.feature_usage || {}
        metricsByDate[date].feature_usage.page_views += featureUsage.page_views || 0
        metricsByDate[date].feature_usage.clicks += featureUsage.clicks || 0
        metricsByDate[date].feature_usage.forms += featureUsage.forms || 0
        metricsByDate[date].feature_usage.scroll_engagement += featureUsage.scroll_engagement || 0
        metricsByDate[date].feature_usage.long_sessions += featureUsage.long_sessions || 0
      })

      // Convert to array and calculate averages
      Object.keys(metricsByDate).forEach(date => {
        const dayData = metricsByDate[date]
        if (dayData.count > 0) {
          dayData.avg_session_duration = Math.round(dayData.avg_session_duration / dayData.count)
        }
        delete dayData.count
        aggregatedMetrics.push(dayData)
      })
    }

    // Sort by date descending
    aggregatedMetrics.sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))

    // Add some synthetic data if no real data exists
    if (aggregatedMetrics.length === 0) {
      // Generate last 7 days of synthetic data
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        aggregatedMetrics.push({
          product_id: 'fastenr_platform',
          recorded_at: dateStr,
          unique_users: Math.floor(50 + Math.random() * 100), // 50-150 users
          total_sessions: Math.floor(80 + Math.random() * 150), // 80-230 sessions
          avg_session_duration: Math.floor(180 + Math.random() * 300), // 3-8 minutes
          page_views: Math.floor(300 + Math.random() * 500), // 300-800 page views
          feature_usage: {
            page_views: Math.floor(300 + Math.random() * 500),
            clicks: Math.floor(500 + Math.random() * 800),
            forms: Math.floor(20 + Math.random() * 50),
            scroll_engagement: Math.floor(150 + Math.random() * 200),
            long_sessions: Math.floor(25 + Math.random() * 75)
          }
        })
      }
    }

    return NextResponse.json({
      products: syntheticProducts,
      metrics: aggregatedMetrics,
      hasData: true,
      isDogfooding: true,
      message: 'Showing aggregated usage data from Fastenr platform for demo purposes'
    })

  } catch (error) {
    console.error('Error in dogfood usage tracking:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}