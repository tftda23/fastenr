import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserOrganization } from '@/lib/supabase/queries'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, domain } = body
    const productId = params.id

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

    // Check if product exists and belongs to user's organization
    const { data: existingProduct, error: fetchError } = await supabase
      .from('usage_tracking_products')
      .select('*')
      .eq('id', productId)
      .eq('organization_id', organization.id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('usage_tracking_products')
      .update({
        name: name.trim(),
        domain: domain?.trim() || null,
      })
      .eq('id', productId)
      .eq('organization_id', organization.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating product:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
    })

  } catch (error) {
    console.error('Error in product update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Get user organization
    const { user, organization } = await getCurrentUserOrganization()
    if (!user || !organization) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Check if product exists and belongs to user's organization
    const { data: existingProduct, error: fetchError } = await supabase
      .from('usage_tracking_products')
      .select('*')
      .eq('id', productId)
      .eq('organization_id', organization.id)
      .single()

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the product (cascading deletes will handle related data)
    const { error: deleteError } = await supabase
      .from('usage_tracking_products')
      .delete()
      .eq('id', productId)
      .eq('organization_id', organization.id)

    if (deleteError) {
      console.error('Error deleting product:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error in product deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}