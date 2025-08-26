import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=oauth_error', request.url))
      }

      if (user) {
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, organization_id, role')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile lookup error:', profileError)
          return NextResponse.redirect(new URL('/auth/login?error=profile_error', request.url))
        }

        // If no profile exists, redirect to onboarding
        if (!profile) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // Profile exists, redirect to dashboard or specified redirect
        const redirectTo = redirectParam || '/dashboard'
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url))
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}