import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getRoleFromEmail, type UserRole } from '@/lib/auth/roles'

function isValidRole(value: unknown): value is UserRole {
  return value === 'technician' || value === 'employee'
}

export async function ensureUserRole(
  supabase: SupabaseClient,
  user: User
): Promise<UserRole> {
  const email = user.email
  if (!email) {
    throw new Error('Authenticated user is missing an email address.')
  }

  const existingRole = user.user_metadata?.role
  if (isValidRole(existingRole)) {
    return existingRole
  }

  const inferredRole = getRoleFromEmail(email)
  const { error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      role: inferredRole,
    },
  })

  if (error) {
    throw error
  }

  return inferredRole
}
