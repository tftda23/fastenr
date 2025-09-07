/**
 * Support metrics API endpoint
 * Returns aggregated support metrics for an account
 */
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import { createSecureClient } from '@/lib/security/org-isolation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const { organization } = await getCurrentUserOrganization()
    if (!organization?.id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const supabase = createSecureClient(organization.id)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get support metrics for the last 30 days
    const { data: metrics, error } = await supabase
      .from('support_metrics')
      .select(`
        *,
        support_integrations!inner(provider, status)
      `)
      .eq('account_id', accountId)
      .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (error) {
      console.error('Error fetching support metrics:', error)
      return NextResponse.json({ error: 'Failed to fetch support metrics' }, { status: 500 })
    }

    // Get support integrations
    const { data: integrations, error: intError } = await supabase
      .from('support_integrations')
      .select('*')
      .eq('organization_id', organization.id)

    if (intError) {
      console.error('Error fetching support integrations:', intError)
    }

    // Calculate aggregated metrics
    const totalTickets = metrics?.reduce((sum, m) => sum + (m.ticket_count || 0), 0) || 0
    const totalResolved = metrics?.reduce((sum, m) => sum + (m.resolved_tickets || 0), 0) || 0
    const totalEscalated = metrics?.reduce((sum, m) => sum + (m.escalated_tickets || 0), 0) || 0
    
    const avgResolutionTime = metrics?.length > 0 
      ? metrics
          .filter(m => m.avg_resolution_time_hours)
          .reduce((sum, m, _, arr) => sum + (m.avg_resolution_time_hours || 0) / arr.length, 0)
      : 0

    const escalationRate = totalTickets > 0 ? (totalEscalated / totalTickets) * 100 : 0

    // Determine trend
    const recentMetrics = metrics?.slice(0, 7) || []
    const olderMetrics = metrics?.slice(7, 14) || []
    
    const recentAvg = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + (m.ticket_count || 0), 0) / recentMetrics.length
      : 0
    const olderAvg = olderMetrics.length > 0 
      ? olderMetrics.reduce((sum, m) => sum + (m.ticket_count || 0), 0) / olderMetrics.length
      : 0

    let trend = 'stable'
    if (recentAvg > olderAvg * 1.2) trend = 'increasing'
    else if (recentAvg < olderAvg * 0.8) trend = 'decreasing'

    // Group metrics by provider
    const byProvider = metrics?.reduce((acc, metric) => {
      const provider = metric.support_integrations?.provider || 'unknown'
      if (!acc[provider]) {
        acc[provider] = []
      }
      acc[provider].push(metric)
      return acc
    }, {} as Record<string, any[]>) || {}

    return NextResponse.json({
      summary: {
        totalTickets,
        totalResolved,
        totalEscalated,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        escalationRate: Math.round(escalationRate * 10) / 10,
        trend,
        resolutionRate: totalTickets > 0 ? Math.round((totalResolved / totalTickets) * 100) : 0
      },
      metrics: metrics || [],
      byProvider,
      integrations: integrations || [],
      period: {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Support metrics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}