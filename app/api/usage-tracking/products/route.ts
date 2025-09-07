import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'
import { getFeatureAccess } from '@/lib/features'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, domain, track_by_account } = body

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Check if user has premium access for multiple products
    const { data: existingProducts, error: countError } = await supabase
      .from('usage_tracking_products')
      .select('id')
      .eq('organization_id', organization.id)

    if (countError) {
      console.error('Error checking existing products:', countError)
      return NextResponse.json(
        { error: 'Failed to check existing products' },
        { status: 500 }
      )
    }

    // Check premium limits (free tier gets 1 product, premium gets unlimited)
    const productCount = existingProducts?.length || 0
    const premiumAccess = await getFeatureAccess(organization.id)
    const hasPremium = premiumAccess.hasPremium

    // Allow first product on free tier, require premium for additional products
    if (productCount > 0 && !hasPremium) {
      return NextResponse.json(
        { 
          error: 'Multiple product tracking requires premium subscription',
          code: 'PREMIUM_REQUIRED'
        },
        { status: 402 }
      )
    }

    // Create the tracking product
    const { data: product, error: productError } = await supabase
      .from('usage_tracking_products')
      .insert({
        organization_id: organization.id,
        name: name.trim(),
        domain: domain?.trim() || null,
        is_active: true,
        track_page_views: true,
        track_click_events: true,
        track_form_interactions: true,
        track_scroll_depth: true,
        track_by_account: track_by_account !== false, // Default to true
        allowed_domains: domain ? [domain.trim()] : []
      })
      .select()
      .single()

    if (productError) {
      console.error('Error creating tracking product:', productError)
      return NextResponse.json(
        { error: 'Failed to create tracking product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        domain: product.domain,
        tracking_key: product.tracking_key,
        is_active: product.is_active
      }
    })

  } catch (error) {
    console.error('Error in tracking product creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { data: products, error } = await supabase
      .from('usage_tracking_products')
      .select(`
        id, name, domain, tracking_key, created_at,
        is_active, last_activity_at,
        track_page_views, track_click_events,
        track_form_interactions, track_scroll_depth
      `)
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tracking products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tracking products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products: products || []
    })

  } catch (error) {
    console.error('Error fetching tracking products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}