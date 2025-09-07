import { NextRequest, NextResponse } from 'next/server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { withRateLimit, RATE_LIMITS, getUserIdFromSupabase } from '@/lib/rate-limiting'

async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend API key not configured' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const domainDetail = await resend.domains.get(params.id)

    if (domainDetail.error) {
      return NextResponse.json({
        success: false,
        error: domainDetail.error
      })
    }

    // Format DNS records for better display
    const formattedRecords = (domainDetail.data?.records || []).map((record: any) => ({
      type: record.record || record.type,
      name: record.name || '@',
      value: record.value,
      priority: record.priority,
      ttl: record.ttl || 'Auto',
      status: record.status || 'pending'
    }))

    // Add DMARC record if not present (common requirement)
    const hasDmarc = formattedRecords.some((record: any) => 
      record.name === '_dmarc' || record.type === 'DMARC'
    )
    
    if (!hasDmarc) {
      formattedRecords.push({
        type: 'TXT',
        name: '_dmarc',
        value: 'v=DMARC1; p=none;',
        priority: null,
        ttl: 'Auto',
        status: 'required'
      })
    }

    return NextResponse.json({
      success: true,
      domain: {
        ...domainDetail.data,
        records: formattedRecords,
        setupInstructions: generateSetupInstructions(domainDetail.data?.name, formattedRecords)
      }
    })

  } catch (error) {
    console.error('Domain details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domain details' },
      { status: 500 }
    )
  }
}

function generateSetupInstructions(domainName: string, records: any[]) {
  return {
    steps: [
      {
        step: 1,
        title: 'Log into your domain registrar',
        description: `Access the DNS management panel for ${domainName} at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)`
      },
      {
        step: 2,
        title: 'Add DNS records',
        description: 'Add the following DNS records exactly as shown below. This enables email authentication and delivery.'
      },
      {
        step: 3,
        title: 'Wait for propagation',
        description: 'DNS changes can take up to 48 hours to propagate, but usually take 15-30 minutes.'
      },
      {
        step: 4,
        title: 'Verify the domain',
        description: 'Use the "Verify" button to check if the DNS records are properly configured.'
      }
    ],
    tips: [
      'Most registrars use @ symbol for the root domain and require trailing dots to be omitted',
      'If you see "subdomain already exists" errors, the record may already be configured',
      'SPF records prevent your emails from being marked as spam',
      'DKIM records provide email authentication',
      'DMARC records specify how to handle unauthenticated emails'
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRateLimit(RATE_LIMITS.DEFAULT, getUserIdFromSupabase)(
    request,
    () => handleGET(request, { params })
  )
}