export const roleConfig = {
  admin: {
    id: 'admin',
    label: 'Admin / Capo',
    shortLabel: 'Admin',
    description:
      'Accesso completo: cantieri, documenti, foto, upload, caricamenti, preventivi, contabilità, dipendenti e impostazioni.',
    permissions: [
      'view:all',
      'view:site-publication',
      'view:accounting',
      'view:employees',
      'view:settings',
      'upload:photos',
      'upload:documents',
      'manage:users',
    ],
    menu: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Cantieri', path: '/dashboard/cantieri' },
      { label: 'Upload', path: '/dashboard/upload' },
      { label: 'Caricamenti', path: '/dashboard/caricamenti' },
      { label: 'Documenti', path: '/dashboard/documenti' },
      { label: 'Foto', path: '/dashboard/foto' },
      { label: 'Preventivi', path: '/dashboard/preventivi' },
      { label: 'Contabilita', path: '/dashboard/contabilita' },
      { label: 'Report', path: '/dashboard/report' },
      { label: 'Dipendenti', path: '/dashboard/dipendenti' },
      { label: 'Impostazioni', path: '/dashboard/impostazioni' },
    ],
  },
  accounting: {
    id: 'accounting',
    label: 'Contabile',
    shortLabel: 'Contabile',
    description:
      'Gestisce documenti, contabilità, report e verifiche amministrative senza modificare utenti o impostazioni critiche.',
    permissions: [
      'view:accounting',
      'view:documents',
      'view:reports',
      'upload:documents',
    ],
    menu: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Upload', path: '/dashboard/upload' },
      { label: 'Caricamenti', path: '/dashboard/caricamenti' },
      { label: 'Documenti', path: '/dashboard/documenti' },
      { label: 'Contabilita', path: '/dashboard/contabilita' },
      { label: 'Report', path: '/dashboard/report' },
    ],
  },
  employee: {
    id: 'employee',
    label: 'Dipendente',
    shortLabel: 'Dipendente',
    description:
      'Accesso operativo limitato: upload foto/documenti, note operative e propri caricamenti.',
    permissions: ['upload:photos', 'upload:documents', 'view:own-uploads'],
    menu: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Upload', path: '/dashboard/upload' },
      { label: 'I miei caricamenti', path: '/dashboard/caricamenti' },
    ],
  },
}

export const roles = Object.values(roleConfig)

export function getRole(roleId) {
  return roleConfig[roleId] ?? roleConfig.employee
}

export function getDashboardNavForRole(roleId) {
  return getRole(roleId).menu
}

export function canAccessDashboardPath(path, roleId) {
  if (path === '/dashboard/login') {
    return true
  }

  if (roleId === 'employee' && (path.startsWith('/dashboard/foto/') || path.startsWith('/dashboard/documenti/'))) {
    return true
  }

  return getDashboardNavForRole(roleId).some((item) => {
    if (item.path === '/dashboard') {
      return path === '/dashboard'
    }

    return path === item.path || path.startsWith(`${item.path}/`)
  })
}

export function hasPermission(roleId, permission) {
  const role = getRole(roleId)
  return role.permissions.includes('view:all') || role.permissions.includes(permission)
}
