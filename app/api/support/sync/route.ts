/**
 * Support ticket sync endpoint
 * Syncs support data from various providers (Intercom, Zendesk, Jira, Freshdesk)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import { createSecureClient } from '@/lib/security/org-isolation'

// Placeholder sync implementations - would be replaced with actual API integrations
const supportProviderSyncs = {
  async syncIntercom(config: any, organizationId: string) {
    // Simulate Intercom API call
    console.log('Syncing from Intercom:', config.workspace_id)
    
    // Mock data for demonstration
    const mockMetrics = {
      ticket_count: Math.floor(Math.random() * 20) + 5,
      new_tickets: Math.floor(Math.random() * 10) + 2,
      resolved_tickets: Math.floor(Math.random() * 15) + 3,
      open_tickets: Math.floor(Math.random() * 8) + 1,
      avg_resolution_time_hours: Math.random() * 48 + 12,
      avg_first_response_time_hours: Math.random() * 12 + 2,
      escalated_tickets: Math.floor(Math.random() * 3),
      satisfaction_score: Math.random() * 2 + 3, // 3-5 range
      negative_feedback_count: Math.floor(Math.random() * 2)
    }
    
    return { success: true, metrics: mockMetrics }
  },

  async syncZendesk(config: any, organizationId: string) {
    // Simulate Zendesk API call  
    console.log('Syncing from Zendesk:', config.subdomain)
    
    const mockMetrics = {
      ticket_count: Math.floor(Math.random() * 30) + 10,
      new_tickets: Math.floor(Math.random() * 12) + 3,
      resolved_tickets: Math.floor(Math.random() * 20) + 5,
      open_tickets: Math.floor(Math.random() * 10) + 2,
      avg_resolution_time_hours: Math.random() * 72 + 24,
      avg_first_response_time_hours: Math.random() * 24 + 4,
      escalated_tickets: Math.floor(Math.random() * 5),
      satisfaction_score: Math.random() * 2 + 3,
      negative_feedback_count: Math.floor(Math.random() * 3)
    }
    
    return { success: true, metrics: mockMetrics }
  },

  async syncJira(config: any, organizationId: string) {
    // Simulate Jira Service Management API call
    console.log('Syncing from Jira:', config.project_key)
    
    const mockMetrics = {
      ticket_count: Math.floor(Math.random() * 25) + 8,
      new_tickets: Math.floor(Math.random() * 8) + 2,
      resolved_tickets: Math.floor(Math.random() * 18) + 4,
      open_tickets: Math.floor(Math.random() * 12) + 3,
      avg_resolution_time_hours: Math.random() * 96 + 36,
      avg_first_response_time_hours: Math.random() * 48 + 8,
      escalated_tickets: Math.floor(Math.random() * 4) + 1,
      satisfaction_score: null, // Jira might not have satisfaction scores
      negative_feedback_count: Math.floor(Math.random() * 2)
    }
    
    return { success: true, metrics: mockMetrics }
  },

  async syncFreshdesk(config: any, organizationId: string) {
    // Simulate Freshdesk API call
    console.log('Syncing from Freshdesk:', config.subdomain)
    
    const mockMetrics = {
      ticket_count: Math.floor(Math.random() * 35) + 12,
      new_tickets: Math.floor(Math.random() * 14) + 4,
      resolved_tickets: Math.floor(Math.random() * 25) + 7,
      open_tickets: Math.floor(Math.random() * 15) + 3,
      avg_resolution_time_hours: Math.random() * 60 + 20,
      avg_first_response_time_hours: Math.random() * 18 + 3,
      escalated_tickets: Math.floor(Math.random() * 6) + 1,
      satisfaction_score: Math.random() * 2 + 3,
      negative_feedback_count: Math.floor(Math.random() * 4)
    }
    
    return { success: true, metrics: mockMetrics }
  }
}

function calculateVolumeProcess(currentTickets: number, previousTickets: number): string {
  if (previousTickets === 0) return 'stable'
  const change = (currentTickets - previousTickets) / previousTickets
  if (change > 0.2) return 'increasing'
  if (change < -0.2) return 'decreasing'
  return 'stable'
}

function calculateSeverityScore(metrics: any): number {
  let score = 50 // Base score
  
  // Higher ticket volume = higher severity
  if (metrics.ticket_count > 30) score += 20
  else if (metrics.ticket_count > 15) score += 10
  else if (metrics.ticket_count < 5) score -= 10
  
  // Longer resolution times = higher severity
  if (metrics.avg_resolution_time_hours > 72) score += 25
  else if (metrics.avg_resolution_time_hours > 24) score += 10
  else if (metrics.avg_resolution_time_hours < 8) score -= 15
  
  // More escalations = higher severity
  const escalationRate = metrics.escalated_tickets / Math.max(metrics.ticket_count, 1)
  if (escalationRate > 0.3) score += 20
  else if (escalationRate > 0.1) score += 10
  
  // Poor satisfaction = higher severity
  if (metrics.satisfaction_score && metrics.satisfaction_score < 3.5) score += 15
  if (metrics.negative_feedback_count > 3) score += 10
  
  return Math.max(0, Math.min(100, score))
}

export async function POST(request: NextRequest) {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { provider } = await request.json()
    
    if (!provider || !['intercom', 'zendesk', 'jira', 'freshdesk'].includes(provider)) {
      return NextResponse.json(
        { error: 'Valid provider required' },
        { status: 400 }
      )
    }

    const supabase = await createSecureClient()
    
    // Get integration configuration
    const { data: integrations, error: configError } = await supabase
      .from('support_integrations')
      .select('*')
      .eq('provider', provider)
      .eq('sync_enabled', true)
      .single()

    if (configError || !integrations) {
      return NextResponse.json(
        { error: 'Integration not found or not enabled' },
        { status: 404 }
      )
    }

    // Sync data from provider
    let syncResult
    switch (provider) {
      case 'intercom':
        syncResult = await supportProviderSyncs.syncIntercom(integrations, organization.id)
        break
      case 'zendesk':
        syncResult = await supportProviderSyncs.syncZendesk(integrations, organization.id)
        break
      case 'jira':
        syncResult = await supportProviderSyncs.syncJira(integrations, organization.id)
        break
      case 'freshdesk':
        syncResult = await supportProviderSyncs.syncFreshdesk(integrations, organization.id)
        break
      default:
        throw new Error('Unsupported provider')
    }

    if (!syncResult.success) {
      throw new Error('Provider sync failed')
    }

    // Get all accounts for this organization to create metrics for each
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id')

    if (accountsError) {
      console.error('Failed to get accounts:', accountsError)
      throw new Error('Failed to get accounts')
    }

    const today = new Date().toISOString().split('T')[0]
    let metricsCreated = 0

    // Create support metrics for each account
    // In a real implementation, you'd map tickets to accounts based on domain, email, or other identifiers
    for (const account of accounts || []) {
      // Get previous day metrics for trend calculation
      const { data: previousMetrics } = await supabase
        .from('support_metrics')
        .select('ticket_count')
        .eq('account_id', account.id)
        .eq('provider', provider)
        .gte('metric_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: false })
        .limit(7)

      const avgPreviousTickets = previousMetrics?.length 
        ? previousMetrics.reduce((sum, m) => sum + (m.ticket_count || 0), 0) / previousMetrics.length
        : 0

      const volumeTrend = calculateVolumeProcess(syncResult.metrics.ticket_count, avgPreviousTickets)
      const severityScore = calculateSeverityScore(syncResult.metrics)

      // Insert or update today's metrics
      const { error: metricsError } = await supabase
        .from('support_metrics')
        .upsert({
          organization_id: organization.id,
          account_id: account.id,
          provider,
          metric_date: today,
          ...syncResult.metrics,
          volume_trend: volumeTrend,
          severity_score: severityScore,
          last_sync_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,account_id,provider,metric_date'
        })

      if (metricsError) {
        console.error('Failed to save metrics for account:', account.id, metricsError)
      } else {
        metricsCreated++
      }
    }

    // Update integration sync status
    await supabase
      .from('support_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_error: null,
        status: 'connected'
      })
      .eq('id', integrations.id)

    return NextResponse.json({
      success: true,
      provider,
      metricsCreated,
      accountsProcessed: accounts?.length || 0,
      syncTimestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Support sync error:', error)
    
    // Try to update integration status on error
    try {
      const { provider } = await request.json()
      if (provider) {
        const { user, organization } = await getCurrentUserOrganization()
        if (user && organization) {
          const supabase = await createSecureClient()
          await supabase
            .from('support_integrations')
            .update({
              last_sync_at: new Date().toISOString(),
              last_sync_status: 'error',
              last_error: error.message,
              status: 'error'
            })
            .eq('provider', provider)
        }
      }
    } catch (updateError) {
      console.error('Failed to update integration status:', updateError)
    }

    return NextResponse.json(
      { error: error.message || 'Support sync failed' },
      { status: 500 }
    )
  }
}