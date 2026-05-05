import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database, TablesInsert } from '@/lib/database'
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
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error("Missing supabase env variables");
  }

  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  const privateSupabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
  console.log(role, user.email);

  const fullName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()) ||
    (typeof user.user_metadata?.given_name === 'string' && user.user_metadata.given_name.trim()) ||
    user.email.split('@')[0] ||
    'User'

  const [{ data: employeeProfile, error: employeeLookupError }, { data: technicianProfile, error: technicianLookupError }] =
    await Promise.all([
      privateSupabase.from('employees').select('id').eq('id', user.id).maybeSingle(),
      privateSupabase.from('technicians').select('id').eq('id', user.id).maybeSingle(),
    ])

  if (employeeLookupError || technicianLookupError) {
    const lookupError = employeeLookupError ?? technicianLookupError
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(lookupError.message)}`, requestUrl.origin)
    )
  }

  const isNewAccount = !employeeProfile && !technicianProfile
  if (isNewAccount) {
    if (role === 'technician') {
      const technicianInsert: TablesInsert<'technicians'> = {
        id: user.id,
        full_name: fullName,
        email: user.email,
      }
      const { error: technicianInsertError } = await privateSupabase
        .from('technicians')
        .upsert(technicianInsert, { onConflict: 'id', ignoreDuplicates: true })

      if (technicianInsertError) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(technicianInsertError.message)}`, requestUrl.origin)
        )
      }
    } else {
      const employeeInsert: TablesInsert<'employees'> = {
        id: user.id,
        full_name: fullName,
        email: user.email,
      }
      const { error: employeeInsertError } = await privateSupabase
        .from('employees')
        .upsert(employeeInsert, { onConflict: 'id', ignoreDuplicates: true })

      if (employeeInsertError) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(employeeInsertError.message)}`, requestUrl.origin)
        )
      }
    }
  }

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
