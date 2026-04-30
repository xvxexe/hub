import { canAccessDashboardPath, getDashboardNavForRole } from './roles'

export const publicNav = [
  { label: 'Home', path: '/' },
  { label: 'Servizi', path: '/servizi' },
  { label: 'Cantieri', path: '/cantieri' },
  { label: 'Settori', path: '/settori' },
  { label: 'Chi siamo', path: '/chi-siamo' },
  { label: 'Preventivo', path: '/preventivo' },
  { label: 'Contatti', path: '/contatti' },
]

export { canAccessDashboardPath, getDashboardNavForRole }

export function normalizePath(hash) {
  const path = hash.replace(/^#/, '') || '/'
  return path === '' ? '/' : path
}

export function isActive(currentPath, itemPath) {
  if (itemPath === '/') {
    return currentPath === '/'
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}
