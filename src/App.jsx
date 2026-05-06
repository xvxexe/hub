import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { CantiereDeleteGuard } from './components/CantiereDeleteGuard'
import { OperationalCantieriPanel } from './components/OperationalCantieriPanel'
import {
  employees,
  mockUsers,
} from './data/mockData'
import { useMockStore } from './hooks/useMockStore'
import { canAccessDashboardPath, normalizePath } from './lib/navigation'
import { fetchCurrentAuthSession, signInWithPassword, signOutSupabase } from './lib/supabaseClient'
import { roles } from './lib/roles'
import { CaricamentiRecenti } from './pages/dashboard/CaricamentiRecenti'
import { AccountingMovementDetail } from './pages/dashboard/AccountingMovementDetail'
import { CantiereDetail } from './pages/dashboard/CantiereDetail'
import { CantieriList } from './pages/dashboard/CantieriList'
import { ContabilitaMock } from './pages/dashboard/ContabilitaMock'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { DashboardListPage } from './pages/dashboard/DashboardListPage'
import { DocumentDetail } from './pages/dashboard/DocumentDetail'
import { DocumentiMock } from './pages/dashboard/DocumentiMock'
import { DriveDocumentAutomation } from './pages/dashboard/DriveDocumentAutomation'
import { EstimateDetail } from './pages/dashboard/EstimateDetail'
import { EstimatesMock } from './pages/dashboard/EstimatesMock'
import { PhotoDetail } from './pages/dashboard/PhotoDetail'
import { PhotosMock } from './pages/dashboard/PhotosMock'
import { LoginMock } from './pages/dashboard/LoginMock'
import { ReportMock } from './pages/dashboard/ReportMock'
import { SettingsMock } from './pages/dashboard/SettingsMock'
import { Unauthorized } from './pages/dashboard/Unauthorized'
import { UploadMock } from './pages/dashboard/UploadMock'
import { About } from './pages/public/About'
import { Contacts } from './pages/public/Contacts'
import { Home } from './pages/public/Home'
import { ProjectDetail } from './pages/public/ProjectDetail'
import { Projects } from './pages/public/Projects'
import { QuoteRequest } from './pages/public/QuoteRequest'
import { Sectors } from './pages/public/Sectors'
import { Services } from './pages/public/Services'
import './styles/global.css'
import './styles/public.css'
import './styles/dashboard-polish.css'
import './styles/dashboard-mobile-compact.css'
import './styles/dashboard-real-data.css'
import './styles/dashboard-typography.css'
import './styles/dashboard-cost-summary.css'
import './styles/dashboard-internal-unified.css'
import './styles/dashboard-cantieri-redesign.css'
import './styles/dashboard-cantiere-detail-redesign.css'
import './styles/dashboard-upload-redesign.css'
import './styles/dashboard-caricamenti-redesign.css'
import './styles/dashboard-documenti-redesign.css'
import './styles/dashboard-contabilita-redesign.css'
import './styles/dashboard-final-uniformity.css'
import './styles/dashboard-navigation-fix.css'
import './styles/dashboard-search-sticky.css'
import './styles/dashboard-mobile-balanced.css'
import './styles/dashboard-login-mobile-restore.css'

function useHashPath() {
  const [path, setPath] = useState(() => normalizePath(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setPath(normalizePath(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return path
}

function navigateTo(path) {
  window.location.assign(`#${path}`)
}

function renderRoute(path, session, selectedRole, handlers, mockStore) {
  if (path === '/') return <Home />
  if (path === '/servizi') return <Services />
  if (path === '/cantieri') return <Projects />
  if (path.startsWith('/cantieri/')) return <ProjectDetail projectId={path.split('/').at(-1)} />
  if (path === '/settori') return <Sectors />
  if (path === '/chi-siamo') return <About />
  if (path === '/preventivo') return <QuoteRequest />
  if (path === '/contatti') return <Contacts />

  if (path === '/dashboard/login') {
    return (
      <LoginMock
        selectedRole={selectedRole}
        onRoleSelect={handlers.onRoleSelect}
        onLogin={handlers.onLogin}
        loginError={handlers.loginError}
        loginLoading={handlers.loginLoading}
      />
    )
  }

  if (path.startsWith('/dashboard') && !session) {
    return (
      <LoginMock
        selectedRole={selectedRole}
        onRoleSelect={handlers.onRoleSelect}
        onLogin={handlers.onLogin}
        loginError={handlers.loginError}
        loginLoading={handlers.loginLoading}
      />
    )
  }

  if (path.startsWith('/dashboard') && !canAccessDashboardPath(path, session.role)) {
    return <Unauthorized path={path} role={session.role} />
  }

  if (path === '/dashboard') {
    return (
      <>
        <DashboardHome
          session={session}
          documentUploads={mockStore.documentUploads}
          documents={mockStore.documents}
          fotoUploads={mockStore.fotoUploads}
          activities={mockStore.activities}
          estimates={mockStore.estimates}
          syncState={mockStore.syncState}
          store={mockStore}
        />
        <OperationalCantieriPanel store={mockStore} title="Cantieri operativi reali" compact />
      </>
    )
  }
  if (path.startsWith('/dashboard/cantieri/')) {
    const cantiereId = path.split('/').at(-1)
    return (
      <>
        <CantiereDetail
          cantiereId={cantiereId}
          documents={mockStore.documents}
          documentUploads={mockStore.documentUploads}
          fotoUploads={mockStore.fotoUploads}
          session={session}
          activities={mockStore.activities}
          notes={mockStore.notes}
          onAddNote={mockStore.addInternalNote}
          store={mockStore}
        />
        <CantiereDeleteGuard cantiereId={cantiereId} session={session} store={mockStore} />
      </>
    )
  }
  if (path === '/dashboard/cantieri') {
    return <CantieriList documents={mockStore.documents} store={mockStore} />
  }
  if (path === '/dashboard/upload') {
    return (
      <UploadMock
        session={session}
        fotoUploads={mockStore.fotoUploads}
        documentUploads={mockStore.documentUploads}
        onAddFoto={mockStore.addFotoUpload}
        onAddDocument={mockStore.addDocumentUpload}
        store={mockStore}
      />
    )
  }
  if (path === '/dashboard/caricamenti') {
    return (
      <CaricamentiRecenti
        session={session}
        fotoUploads={mockStore.fotoUploads}
        documentUploads={mockStore.documentUploads}
        store={mockStore}
      />
    )
  }
  if (path.startsWith('/dashboard/documenti/')) {
    return <DocumentDetail documentId={path.split('/').at(-1)} session={session} store={mockStore} />
  }
  if (path === '/dashboard/documenti') {
    return <DocumentiMock session={session} store={mockStore} />
  }
  if (path === '/dashboard/drive-documenti') {
    return <DriveDocumentAutomation session={session} store={mockStore} />
  }
  if (path.startsWith('/dashboard/foto/')) {
    return <PhotoDetail photoId={path.split('/').at(-1)} session={session} store={mockStore} />
  }
  if (path === '/dashboard/foto') {
    return <PhotosMock session={session} store={mockStore} />
  }
  if (path.startsWith('/dashboard/preventivi/')) {
    return <EstimateDetail estimateId={path.split('/').at(-1)} session={session} store={mockStore} />
  }
  if (path === '/dashboard/preventivi') {
    return <EstimatesMock session={session} store={mockStore} />
  }
  if (path.startsWith('/dashboard/contabilita/')) {
    return <AccountingMovementDetail movementId={path.split('/').at(-1)} session={session} store={mockStore} />
  }
  if (path === '/dashboard/contabilita') {
    return <ContabilitaMock documents={mockStore.documents} store={mockStore} session={session} />
  }
  if (path === '/dashboard/report') {
    return (
      <>
        <ReportMock documents={mockStore.documents} store={mockStore} />
        <OperationalCantieriPanel store={mockStore} title="Cantieri inclusi nello store operativo" compact />
      </>
    )
  }
  if (path === '/dashboard/dipendenti') {
    return (
      <DashboardListPage
        eyebrow="Dipendenti"
        title="Squadra e assegnazioni"
        description="Utenti e ruoli collegati a Supabase Auth. Gli inviti si preparano da Impostazioni solo per admin."
        rows={employees}
        columns={[
          { label: 'Nome', key: 'name' },
          { label: 'Ruolo', key: 'role' },
          { label: 'Assegnazione', key: 'currentProject' },
        ]}
      />
    )
  }
  if (path === '/dashboard/impostazioni') {
    return <SettingsMock session={session} store={mockStore} />
  }

  return <Home />
}

function AuthenticatedDashboardShell({ path, session, selectedRole, handlers, onLogout, onRoleChange }) {
  const mockStore = useMockStore(session)

  return (
    <AppShell
      currentPath={path}
      session={session}
      onLogout={onLogout}
      onRoleChange={onRoleChange}
      roles={roles}
      dataStore={mockStore}
    >
      {renderRoute(path, session, selectedRole, handlers, mockStore)}
    </AppShell>
  )
}

export default function App() {
  const path = useHashPath()
  const [selectedRole, setSelectedRole] = useState('admin')
  const [session, setSession] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const restored = await fetchCurrentAuthSession()
      if (!cancelled && restored.data) {
        setSession(restored.data)
        setSelectedRole(restored.data.role)
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  async function loginWithCredentials(credentials) {
    setLoginError('')
    setLoginLoading(true)

    try {
      if (credentials?.email && credentials?.password) {
        const result = await signInWithPassword(credentials)
        if (result.error) {
          setLoginError(result.error.message)
          return
        }

        setSession(result.data)
        setSelectedRole(result.data.role)
        navigateTo('/dashboard')
        return
      }

      const user = mockUsers.find((item) => item.role === selectedRole) ?? mockUsers[0]
      setSession({ ...user, authMode: 'mock' })
      navigateTo('/dashboard')
    } finally {
      setLoginLoading(false)
    }
  }

  function changeRole(role) {
    if (session?.authMode === 'supabase') return

    const user = mockUsers.find((item) => item.role === role) ?? mockUsers[0]
    setSelectedRole(role)
    setSession({ ...user, authMode: 'mock' })

    if (!canAccessDashboardPath(path, role)) {
      navigateTo('/dashboard')
    }
  }

  async function logout() {
    await signOutSupabase()
    setSession(null)
    navigateTo('/dashboard/login')
  }

  const routeHandlers = {
    onLogin: loginWithCredentials,
    onRoleSelect: setSelectedRole,
    loginError,
    loginLoading,
  }

  if (session) {
    return (
      <AuthenticatedDashboardShell
        path={path}
        session={session}
        selectedRole={selectedRole}
        handlers={routeHandlers}
        onLogout={logout}
        onRoleChange={changeRole}
      />
    )
  }

  return (
    <AppShell
      currentPath={path}
      session={session}
      onLogout={logout}
      onRoleChange={changeRole}
      roles={roles}
      dataStore={null}
    >
      {renderRoute(path, session, selectedRole, routeHandlers, null)}
    </AppShell>
  )
}
