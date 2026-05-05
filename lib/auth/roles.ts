export type UserRole = 'technician' | 'employee'

export const technicianEmailMap: Set<string> = new Set<string>([
  'b_saidani@estin.dz',
  'am_allaoua@estin.dz',
  'm_merzoug@estin.dz',
  'a_medoura@estin.dz',
]);

export function getRoleFromEmail(email: string): UserRole {
  return technicianEmailMap.has(email) ? 'technician' : 'employee'
}
