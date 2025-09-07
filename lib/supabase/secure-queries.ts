/**
 * CRITICAL SECURITY: Secure Database Queries with Organization Isolation
 * 
 * This module replaces direct database queries with security-hardened versions
 * that ENFORCE organization boundaries at the application level.
 * 
 * ⚠️  SECURITY CRITICAL: All queries MUST use these secure wrappers
 * ⚠️  DO NOT use direct supabase queries for multi-tenant data
 */

import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from './queries'
import type { Account, Engagement, Contact } from '@/lib/types'

/**
 * CRITICAL SECURITY: Get accounts with MANDATORY organization isolation
 * This function CANNOT return accounts from other organizations
 */
export async function getSecureAccounts(
  page = 1,
  limit = 20,
  search?: string,
  ownerId?: string
): Promise<{
  data: Account[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}> {
  // SECURITY: Get user's organization - this is our security boundary
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    console.error('🚨 SECURITY: Unauthenticated access attempt to getSecureAccounts')
    throw new Error('Authentication required')
  }

  const supabase = createServerClient()
  const offset = (page - 1) * limit

  try {
    // SECURITY: Build query with MANDATORY organization filtering
    let query = supabase
      .from('accounts')
      .select(`
        *,
        owner:user_profiles!accounts_owner_id_fkey(id, full_name, email),
        csm:user_profiles!accounts_csm_id_fkey(id, full_name, email)
      `, { count: 'exact' })
      .eq('organization_id', organization.id) // CRITICAL: Organization boundary enforcement
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply additional filters ONLY within the organization
    if (search) {
      query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%,domain.ilike.%${search}%`)
    }
    
    if (ownerId && ownerId !== 'all') {
      query = query.eq('owner_id', ownerId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('🚨 SECURITY: Database error in getSecureAccounts:', error)
      throw new Error('Database query failed')
    }

    // SECURITY: Double-check that all returned accounts belong to the user's organization
    const accounts = (data || []) as Account[]
    const securityViolation = accounts.find(account => account.organization_id !== organization.id)
    
    if (securityViolation) {
      console.error('🚨 CRITICAL SECURITY VIOLATION: Cross-organization data leak detected!', {
        userOrg: organization.id,
        leakedOrg: securityViolation.organization_id,
        accountId: securityViolation.id,
        timestamp: new Date().toISOString()
      })
      
      // Log to security audit
      await logSecurityIncident('CROSS_ORG_DATA_LEAK', 'accounts', securityViolation.id, securityViolation.organization_id)
      
      // Filter out the violating records
      const secureAccounts = accounts.filter(account => account.organization_id === organization.id)
      
      return {
        data: secureAccounts,
        total: secureAccounts.length,
        page,
        limit,
        hasMore: false
      }
    }

    // Log successful secure access for audit
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ SECURE ACCESS: User ${user.id} from org ${organization.id} accessed ${accounts.length} accounts`)
    }

    return {
      data: accounts,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    }

  } catch (error) {
    console.error('🚨 SECURITY: Error in getSecureAccounts:', error)
    await logSecurityIncident('QUERY_ERROR', 'accounts', undefined, organization.id)
    throw error
  }
}

/**
 * CRITICAL SECURITY: Get single account with ownership verification
 */
export async function getSecureAccount(accountId: string): Promise<Account | null> {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    throw new Error('Authentication required')
  }

  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        owner:user_profiles!accounts_owner_id_fkey(id, full_name, email),
        csm:user_profiles!accounts_csm_id_fkey(id, full_name, email)
      `)
      .eq('id', accountId)
      .eq('organization_id', organization.id) // CRITICAL: Organization boundary
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found or not owned by organization
        await logSecurityIncident('UNAUTHORIZED_ACCOUNT_ACCESS', 'accounts', accountId, organization.id)
        return null
      }
      throw error
    }

    // SECURITY: Final verification
    if (data.organization_id !== organization.id) {
      console.error('🚨 CRITICAL: Organization mismatch in getSecureAccount')
      await logSecurityIncident('ORG_MISMATCH', 'accounts', accountId, data.organization_id)
      return null
    }

    return data as Account

  } catch (error) {
    console.error('🚨 SECURITY: Error in getSecureAccount:', error)
    await logSecurityIncident('SINGLE_ACCOUNT_ERROR', 'accounts', accountId, organization.id)
    throw error
  }
}

/**
 * CRITICAL SECURITY: Get contacts with organization isolation
 */
export async function getSecureContacts(accountId?: string): Promise<Contact[]> {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    throw new Error('Authentication required')
  }

  const supabase = createServerClient()

  try {
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', organization.id) // CRITICAL: Organization boundary

    if (accountId) {
      // SECURITY: Verify the account belongs to the user's organization first
      const account = await getSecureAccount(accountId)
      if (!account) {
        await logSecurityIncident('UNAUTHORIZED_CONTACT_ACCESS_VIA_ACCOUNT', 'contacts', accountId, organization.id)
        return []
      }
      query = query.eq('account_id', accountId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // SECURITY: Verify all contacts belong to user's organization
    const contacts = (data || []) as Contact[]
    const violations = contacts.filter(contact => contact.organization_id !== organization.id)
    
    if (violations.length > 0) {
      console.error('🚨 CRITICAL: Cross-organization contacts detected:', violations.length)
      violations.forEach(v => {
        logSecurityIncident('CROSS_ORG_CONTACT_LEAK', 'contacts', v.id, v.organization_id)
      })
      
      // Return only safe contacts
      return contacts.filter(contact => contact.organization_id === organization.id)
    }

    return contacts

  } catch (error) {
    console.error('🚨 SECURITY: Error in getSecureContacts:', error)
    await logSecurityIncident('CONTACTS_QUERY_ERROR', 'contacts', accountId, organization.id)
    throw error
  }
}

/**
 * CRITICAL SECURITY: Log security incidents
 */
async function logSecurityIncident(
  action: string,
  table: string,
  recordId?: string,
  attemptedOrgId?: string
): Promise<void> {
  try {
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) return

    const supabase = createServerClient()
    
    // Log to security audit table
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        action,
        table_name: table,
        record_id: recordId,
        attempted_access_org_id: attemptedOrgId
      })

    // Also log to application logs for immediate alerting
    console.error(`🚨 SECURITY INCIDENT: ${action}`, {
      userId: user.id,
      userOrg: organization.id,
      table,
      recordId,
      attemptedOrg: attemptedOrgId,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    })

  } catch (error) {
    console.error('Failed to log security incident:', error)
  }
}

/**
 * CRITICAL SECURITY: Verify organization ownership before any operation
 */
export async function verifySecureOwnership(table: string, recordId: string): Promise<boolean> {
  const { user, organization } = await getCurrentUserOrganization()
  
  if (!user || !organization) {
    return false
  }

  const supabase = createServerClient()

  try {
    const { data, error } = await supabase
      .from(table)
      .select('organization_id')
      .eq('id', recordId)
      .single()

    if (error || !data) {
      await logSecurityIncident('OWNERSHIP_VERIFICATION_FAILED', table, recordId, organization.id)
      return false
    }

    const isOwned = data.organization_id === organization.id

    if (!isOwned) {
      await logSecurityIncident('UNAUTHORIZED_ACCESS_BLOCKED', table, recordId, data.organization_id)
    }

    return isOwned

  } catch (error) {
    console.error('🚨 SECURITY: Ownership verification error:', error)
    await logSecurityIncident('OWNERSHIP_CHECK_ERROR', table, recordId, organization.id)
    return false
  }
}