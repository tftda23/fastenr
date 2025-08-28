import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Users API: Starting request')
    
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Users API: User not authenticated:', userError)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }
    
    console.log('Users API: Current user:', user.email)
    
    // Get user's profile to find organization_id
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, full_name, email, role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Users API: Failed to get user profile:', profileError)
      console.log('Users API: User ID from auth:', user.id)
      
      // Let's check if there are any users in the table at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('user_profiles')
        .select('id, email, organization_id')
        .limit(5)
      
      console.log('Users API: Sample users in table:', allUsers)
      console.log('Users API: Sample users error:', allUsersError)
      
      return NextResponse.json({ error: 'Failed to get user profile', details: profileError.message }, { status: 500 })
    }
    
    if (!profile) {
      console.error('Users API: User profile not found for ID:', user.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    console.log('Users API: User profile:', profile)
    console.log('Users API: User organization_id:', profile.organization_id)
    
    // Get all users in the same organization
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role')
      .eq('organization_id', profile.organization_id)
      .order('full_name')
    
    if (usersError) {
      console.error('Users API: Failed to fetch users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    console.log('Users API: Found users:', users?.length)
    console.log('Users API: Users data:', users)
    
    return NextResponse.json(users || [])
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}