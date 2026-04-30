export const publicNav = [
  { label: 'Home', path: '/' },
  { label: 'Servizi', path: '/servizi' },
  { label: 'Cantieri', path: '/cantieri' },
  { label: 'Preventivo', path: '/preventivo' },
  { label: 'Contatti', path: '/contatti' },
]

export const dashboardNav = [
  { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'accounting', 'employee'] },
  { label: 'Cantieri', path: '/dashboard/cantieri', roles: ['admin', 'accounting', 'employee'] },
  { label: 'Documenti', path: '/dashboard/documenti', roles: ['admin', 'accounting', 'employee'] },
  { label: 'Foto cantiere', path: '/dashboard/foto', roles: ['admin', 'employee'] },
  { label: 'Preventivi', path: '/dashboard/preventivi', roles: ['admin', 'accounting'] },
  { label: 'Contabilita', path: '/dashboard/contabilita', roles: ['admin', 'accounting'] },
  { label: 'Dipendenti', path: '/dashboard/dipendenti', roles: ['admin'] },
]

export function getDashboardNavForRole(role) {
  return dashboardNav.filter((item) => item.roles.includes(role))
}

export function canAccessDashboardPath(path, role) {
  if (path === '/dashboard/login') {
    return true
  }

  return dashboardNav.some((item) => item.path === path && item.roles.includes(role))
}

export function normalizePath(hash) {
  const path = hash.replace(/^#/, '') || '/'
  return path === '' ? '/' : path
}

export function isActive(currentPath, itemPath) {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath
}
