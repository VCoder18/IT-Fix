import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromEmail } from '@/lib/auth/roles'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const oauthError =
    requestUrl.searchParams.get('error_description') ??
    requestUrl.searchParams.get('error')

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError)}`, requestUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=Missing%20authorization%20code', requestUrl.origin)
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL('/login?error=Missing%20Supabase%20configuration', requestUrl.origin)
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    return NextResponse.redirect(
      new URL('/login?error=Unable%20to%20read%20authenticated%20user', requestUrl.origin)
    )
  }

  const role = getRoleFromEmail(user.email)
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      role,
    },
  })

  if (metadataError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(metadataError.message)}`, requestUrl.origin)
    )
  }

  const destination = role === 'technician' ? '/admin' : '/user-dashboard'
  return NextResponse.redirect(new URL(destination, requestUrl.origin))
}
