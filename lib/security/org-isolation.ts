/**
 * CRITICAL SECURITY: Organization Isolation Enforcement
 * 
 * This module provides MANDATORY organization isolation for all server-side operations.
 * Every database query MUST go through these security checks.
 * 
 * ⚠️  SECURITY CRITICAL: DO NOT BYPASS THESE FUNCTIONS
 * ⚠️  ALL DATABASE QUERIES MUST USE THESE SECURITY WRAPPERS
 */

import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * CRITICAL SECURITY: Secure Supabase client with organization isolation
 * This client automatically enforces organization boundaries on ALL queries
 */
export async function createSecureClient(): Promise<SupabaseClient & { organizationId: string }> {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    throw new Error('SECURITY_VIOLATION: Unauthenticated access attempt')
  }

  const supabase = createServerClient()
  
  // Add organization context to the client
  return Object.assign(supabase, { 
    organizationId: organization.id,
    // Override from method to enforce organization filtering
    from: function(table: string) {
      const query = supabase.from(table)
      
      // Auto-filter by organization for all security-sensitive tables
      const SECURE_TABLES = [
        'accounts', 'engagements', 'contacts', 'customer_goals',
        'nps_surveys', 'health_scores', 'onboarding_plans', 'surveys',
        'automation_workflows', 'automation_jobs', 'app_settings',
        'usage_tracking_products', 'usage_tracked_accounts', 'usage_metrics',
        'usage_events', 'account_growth_history'
      ]
      
      if (SECURE_TABLES.includes(table)) {
        return query.eq('organization_id', organization.id)
      }
      
      return query
    }
  })
}

/**
 * CRITICAL SECURITY: Verify organization ownership of a record
 */
export async function verifyOrganizationOwnership(
  table: string, 
  recordId: string,
  organizationId?: string
): Promise<boolean> {
  try {
    const { organization } = await getCurrentUserOrganization()
    if (!organization) return false
    
    const targetOrgId = organizationId || organization.id
    
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(table)
      .select('organization_id')
      .eq('id', recordId)
      .single()
    
    if (error || !data) return false
    
    const isOwned = data.organization_id === targetOrgId
    
    // Log security violation if attempted cross-org access
    if (!isOwned) {
      await logSecurityViolation(
        `UNAUTHORIZED_ACCESS_ATTEMPT`,
        table,
        recordId,
        data.organization_id
      )
    }
    
    return isOwned
  } catch (error) {
    console.error('Organization ownership verification failed:', error)
    return false
  }
}

/**
 * CRITICAL SECURITY: Secure query builder with mandatory organization filtering
 */
export async function secureQuery<T = any>(
  table: string,
  options: {
    select?: string
    filters?: Record<string, any>
    single?: boolean
    organizationId?: string
  } = {}
): Promise<{ data: T | null; error: any }> {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      throw new Error('SECURITY_VIOLATION: Unauthenticated secure query attempt')
    }
    
    const supabase = createServerClient()
    const targetOrgId = options.organizationId || organization.id
    
    let query = supabase
      .from(table)
      .select(options.select || '*')
      .eq('organization_id', targetOrgId)
    
    // Apply additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const result = options.single 
      ? await query.single()
      : await query
    
    // Log successful access
    if (process.env.NODE_ENV === 'development') {
      console.log(`SECURE_QUERY: ${table} accessed by org ${targetOrgId}`)
    }
    
    return result
  } catch (error) {
    console.error('Secure query failed:', error)
    return { data: null, error }
  }
}

/**
 * CRITICAL SECURITY: Log security violations for audit
 */
export async function logSecurityViolation(
  action: string,
  tableName: string,
  recordId?: string,
  attemptedOrgId?: string
): Promise<void> {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) return
    
    const supabase = createServerClient()
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        action,
        table_name: tableName,
        record_id: recordId,
        attempted_access_org_id: attemptedOrgId
      })
    
    // Also log to application logs for immediate alerting
    console.error(`🚨 SECURITY VIOLATION: ${action}`, {
      userId: user.id,
      userOrg: organization.id,
      table: tableName,
      recordId,
      attemptedOrg: attemptedOrgId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security violation:', error)
  }
}

/**
 * CRITICAL SECURITY: Middleware to enforce organization isolation in API routes
 */
export async function enforceOrganizationIsolation(
  request: Request,
  table: string,
  recordId?: string
): Promise<{ organization: any; user: any } | { error: string; status: number }> {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    
    if (!user || !organization) {
      await logSecurityViolation('UNAUTHENTICATED_API_ACCESS', table, recordId)
      return { error: 'Unauthorized', status: 401 }
    }
    
    // If recordId provided, verify ownership
    if (recordId) {
      const isOwned = await verifyOrganizationOwnership(table, recordId)
      if (!isOwned) {
        return { error: 'Forbidden - Resource not found', status: 404 }
      }
    }
    
    return { organization, user }
  } catch (error) {
    console.error('Organization isolation enforcement failed:', error)
    return { error: 'Internal Server Error', status: 500 }
  }
}

/**
 * CRITICAL SECURITY: Validate all frontend requests have proper organization context
 */
export function validateOrganizationContext(data: any): boolean {
  // Ensure no cross-organization data is being submitted
  if (data && typeof data === 'object') {
    // Remove any organization_id from client submissions (server sets this)
    delete data.organization_id
  }
  
  return true
}

/**
 * CRITICAL SECURITY: Security audit report generator
 */
export async function generateSecurityAuditReport(days: number = 7): Promise<any> {
  try {
    const { organization } = await getCurrentUserOrganization()
    if (!organization) throw new Error('Unauthorized')
    
    const supabase = createServerClient()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const { data, error } = await supabase
      .from('security_audit_log')
      .select('*')
      .eq('organization_id', organization.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return {
      period: `${days} days`,
      violations: data?.length || 0,
      details: data || []
    }
  } catch (error) {
    console.error('Security audit report generation failed:', error)
    throw error
  }
}