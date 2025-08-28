import { NextRequest, NextResponse } from 'next/server'
import { getChurnRiskAccounts } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('owner_id')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const churnRiskAccounts = await getChurnRiskAccounts(limit, ownerId || undefined)
    
    return NextResponse.json(churnRiskAccounts || [])
  } catch (error) {
    console.error('Error fetching churn risk accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch churn risk accounts' }, 
      { status: 500 }
    )
  }
}