import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/database';
import { getRoleFromEmail } from '@/lib/auth/roles';
import { LoginForm } from './login-form';

type LoginPageProps = {
  searchParams?: Promise<{ error?: string | string[] }>;
};

function resolveRole(user: { email?: string | null; user_metadata?: { role?: unknown } }): 'technician' | 'employee' {
  if (user.user_metadata?.role === 'technician' || user.user_metadata?.role === 'employee') {
    return user.user_metadata.role;
  }
  return getRoleFromEmail(user.email ?? '');
}

export default async function UnifiedLogin({ searchParams }: LoginPageProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing supabase env variables');
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const role = resolveRole(user);
    redirect(role === 'technician' ? '/admin' : '/user-dashboard');
  }

  const params = searchParams ? await searchParams : undefined;
  const urlError = Array.isArray(params?.error) ? params?.error[0] : params?.error;

  return <LoginForm initialError={urlError ?? ''} />;
}
