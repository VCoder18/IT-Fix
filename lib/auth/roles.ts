export type UserRole = 'technician' | 'employee'

export const technicianEmailMap: Set<string> = new Set<string>([
  'b_saidani@estin.dz',
  'm_merzoug@estin.dz',
]);

export function getRoleFromEmail(email: string): UserRole {
  const normalizedEmail = email.trim().toLowerCase()
  return technicianEmailMap.has(normalizedEmail) ? 'technician' : 'employee'
}
