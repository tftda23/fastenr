import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calculateHealthScore, calculateHealthScoresForAccounts } from '@/lib/health-score-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Get current user and organization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const accountId = searchParams.get('account_id')
    const ownerId = searchParams.get('owner_id') // For filtering by account owner
    
    if (accountId) {
      // Get single account health score
      const { data: account } = await supabase
        .from('accounts')
        .select('id, organization_id, arr, created_at')
        .eq('id', accountId)
        .eq('organization_id', profile.organization_id)
        .single()

      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }

      const healthScore = await calculateHealthScore(account)
      
      return NextResponse.json({
        account_id: accountId,
        ...healthScore,
        calculated_at: new Date().toISOString()
      })
    } else {
      // Get health scores for all accounts
      let query = supabase
        .from('accounts')
        .select('id, organization_id, arr, created_at, owner_id')
        .eq('organization_id', profile.organization_id)

      // Filter by owner if specified
      if (ownerId) {
        query = query.eq('owner_id', ownerId)
      }

      const { data: accounts } = await query

      if (!accounts) {
        return NextResponse.json({ accounts: [] })
      }

      // Calculate health scores for all accounts
      const healthScores = await calculateHealthScoresForAccounts(accounts)
      
      // Format response
      const results = accounts.map(account => ({
        account_id: account.id,
        ...healthScores.get(account.id),
        calculated_at: new Date().toISOString()
      }))

      return NextResponse.json({
        accounts: results,
        count: results.length,
        calculated_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error calculating health scores:', error)
    return NextResponse.json(
      { error: 'Failed to calculate health scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
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

    const { account_ids } = body

    if (!account_ids || !Array.isArray(account_ids)) {
      return NextResponse.json({ error: 'account_ids array required' }, { status: 400 })
    }

    // Get the specified accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id, organization_id, arr, created_at')
      .in('id', account_ids)
      .eq('organization_id', profile.organization_id)

    if (!accounts) {
      return NextResponse.json({ error: 'No accounts found' }, { status: 404 })
    }

    // Calculate health scores
    const healthScores = await calculateHealthScoresForAccounts(accounts)
    
    // Optionally update the database with calculated scores
    // (This is useful for caching but the engine should be the source of truth)
    const updatePromises = accounts.map(async (account) => {
      const scores = healthScores.get(account.id)
      if (scores) {
        await supabase
          .from('accounts')
          .update({ health_score: scores.overall })
          .eq('id', account.id)
      }
    })
    
    await Promise.all(updatePromises)

    // Format response
    const results = accounts.map(account => ({
      account_id: account.id,
      ...healthScores.get(account.id),
      updated_in_db: true,
      calculated_at: new Date().toISOString()
    }))

    return NextResponse.json({
      message: 'Health scores calculated and updated',
      accounts: results,
      count: results.length
    })
  } catch (error) {
    console.error('Error updating health scores:', error)
    return NextResponse.json(
      { error: 'Failed to update health scores' },
      { status: 500 }
    )
  }
}