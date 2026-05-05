export const technicianEmailMap: Record<string, string> = {
  'admin@itfix.com': 'Admin',
  'test@itfix.com': 'Test Technician',
}

export type UserRole = 'technician' | 'employee'

export function getRoleFromEmail(email: string): UserRole {
  const normalizedEmail = email.trim().toLowerCase()
  return technicianEmailMap[normalizedEmail] ? 'technician' : 'employee'
}
