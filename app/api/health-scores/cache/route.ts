import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { clearHealthScoreSettingsCache } from '@/lib/health-score-engine'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get current user and organization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Clear cache for this organization
    clearHealthScoreSettingsCache(profile.organization_id)
    
    return NextResponse.json({ 
      message: 'Health score settings cache cleared',
      organization_id: profile.organization_id 
    })
  } catch (error) {
    console.error('Error clearing health score cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}