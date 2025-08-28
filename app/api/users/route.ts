import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    logger.apiRequest('GET', '/api/users')
    
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      logger.authError('User authentication failed', userError || new Error('No user found'))
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }
    
    logger.auth('User authenticated', user.id, { email: user.email })
    
    // Get user's profile to find organization_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, full_name, email, role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      logger.dbError('Failed to get user profile', profileError, { userId: user.id })
      
      // Let's check if there are any users in the table at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('user_profiles')
        .select('id, email, organization_id')
        .limit(5)
      
      logger.debug('Sample users in table', { userId: user.id }, { count: allUsers?.length, hasError: !!allUsersError })
      
      return NextResponse.json({ error: 'Failed to get user profile', details: profileError.message }, { status: 500 })
    }
    
    if (!profile) {
      logger.error('User profile not found', { userId: user.id })
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    logger.debug('User profile retrieved', { userId: user.id, organizationId: profile.organization_id })
    
    // Get all users in the same organization
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role')
      .eq('organization_id', profile.organization_id)
      .order('full_name')
    
    if (usersError) {
      logger.dbError('Failed to fetch users', usersError, { organizationId: profile.organization_id })
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    logger.info('Users fetched successfully', { organizationId: profile.organization_id, count: users?.length || 0 })
    
    return NextResponse.json(users || [])
  } catch (error) {
    logger.apiError('GET', '/api/users', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}