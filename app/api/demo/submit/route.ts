import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone if provided (optional)
    if (body.phone && typeof body.phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone must be a string' },
        { status: 400 }
      )
    }

    try {
      const supabase = createClient()

      // Insert demo submission - this is write-only, no read access via API
      // We use insert with select to get the tracking_id back without compromising security
      const { data, error } = await supabase
        .from('demo_submissions')
        .insert({
          name: body.name.trim(),
          email: body.email.trim().toLowerCase(),
          phone: body.phone?.trim() || null,
          wants_to_speak: body.wantsToSpeak === true,
          metadata: {
            user_agent: request.headers.get('user-agent'),
            ip: request.ip || request.headers.get('x-forwarded-for'),
            timestamp: new Date().toISOString()
          }
        })
        .select('tracking_id')
        .single()

      if (error) {
        console.error('Demo submission error:', error)
        // If database error, generate a temporary tracking ID and continue
        const tempTrackingId = `demo_temp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
        
        const response = NextResponse.json(
          { 
            success: true, 
            message: 'Demo access granted',
            trackingId: tempTrackingId
          },
          { status: 201 }
        )

        response.cookies.set('demo_tracking_id', tempTrackingId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })

        return response
      }

      // Return success with tracking ID for future operations
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Demo access granted',
          trackingId: data?.tracking_id
        },
        { status: 201 }
      )

      // Set cookie for tracking across the session
      if (data?.tracking_id) {
        response.cookies.set('demo_tracking_id', data.tracking_id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
      }

      return response
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      // Generate a temporary tracking ID and continue
      const tempTrackingId = `demo_temp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      
      const response = NextResponse.json(
        { 
          success: true, 
          message: 'Demo access granted',
          trackingId: tempTrackingId
        },
        { status: 201 }
      )

      response.cookies.set('demo_tracking_id', tempTrackingId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })

      return response
    }
  } catch (error) {
    console.error('Demo submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}