export type AppRole = 'super_admin' | 'admin' | 'manager' | 'employee'

const roleRoutes: Record<AppRole, readonly string[]> = {
  employee: [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/ai',
    '/dashboard/team',
    '/dashboard/notifications',
    '/dashboard/settings',
  ],
  manager: [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/ai',
    '/dashboard/team',
    '/dashboard/analytics',
    '/dashboard/notifications',
    '/dashboard/billing',
    '/dashboard/settings',
  ],
  admin: [
    '/dashboard',
    '/dashboard/crm',
    '/dashboard/customers',
    '/dashboard/projects',
    '/dashboard/ai',
    '/dashboard/team',
    '/dashboard/analytics',
    '/dashboard/notifications',
    '/dashboard/billing',
    '/dashboard/settings',
  ],
  super_admin: [
    '/dashboard',
    '/dashboard/crm',
    '/dashboard/customers',
    '/dashboard/projects',
    '/dashboard/ai',
    '/dashboard/team',
    '/dashboard/analytics',
    '/dashboard/notifications',
    '/dashboard/billing',
    '/dashboard/settings',
    '/dashboard/admin',
  ],
}

export function canAccessRoute(role: AppRole | undefined, pathname: string) {
  if (!role) return false
  return roleRoutes[role].some(route => pathname === route || (route !== '/dashboard' && pathname.startsWith(`${route}/`)))
}

export function visibleRoutes(role: AppRole | undefined) {
  return role ? roleRoutes[role] : []
}
