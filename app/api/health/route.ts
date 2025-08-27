import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected', // TODO: Add actual DB check
      services: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        email: !!process.env.RESEND_API_KEY,
        stripe: !!process.env.STRIPE_SECRET_KEY
      }
    }

    return NextResponse.json(checks)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}