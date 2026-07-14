import { lazy, Suspense, useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import {
  employees,
  mockUsers,
} from './data/mockData'
import { useMockStore } from './hooks/useMockStore'
import { canAccessDashboardPath, normalizePath } from './lib/navigation'
import { fetchCurrentAuthSession, signInWithPassword, signOutSupabase } from './lib/supabaseClient'
import './styles/global.css'
import './styles/public.css'
import './styles/europaservice-brand.css'

function lazyNamed(factory, exportName) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] })))
}

const DashboardStyles = lazy(() => import('./components/DashboardStyles'))
const CantiereDeleteGuard = lazyNamed(() => import('./components/CantiereDeleteGuard'), 'CantiereDeleteGuard')
const OperationalCantieriPanel = lazyNamed(() => import('./components/OperationalCantieriPanel'), 'OperationalCantieriPanel')
const CaricamentiRecenti = lazyNamed(() => import('./pages/dashboard/CaricamentiRecenti'), 'CaricamentiRecenti')
const AccountingMovementDetail = lazyNamed(() => import('./pages/dashboard/AccountingMovementDetail'), 'AccountingMovementDetail')
const CantiereDetail = lazyNamed(() => import('./pages/dashboard/CantiereDetail'), 'CantiereDetail')
const CantieriList = lazyNamed(() => import('./pages/dashboard/CantieriList'), 'CantieriList')
const ContabilitaMock = lazyNamed(() => import('./pages/dashboard/ContabilitaMock'), 'ContabilitaMock')
const DashboardHome = lazyNamed(() => import('./pages/dashboard/DashboardHome'), 'DashboardHome')
const DashboardListPage = lazyNamed(() => import('./pages/dashboard/DashboardListPage'), 'DashboardListPage')
const DocumentDetail = lazyNamed(() => import('./pages/dashboard/DocumentDetail'), 'DocumentDetail')
const DocumentiMock = lazyNamed(() => import('./pages/dashboard/DocumentiMock'), 'DocumentiMock')
const DriveDocumentAutomation = lazyNamed(() => import('./pages/dashboard/DriveDocumentAutomation'), 'DriveDocumentAutomation')
const EstimateDetail = lazyNamed(() => import('./pages/dashboard/EstimateDetail'), 'EstimateDetail')
const EstimatesMock = lazyNamed(() => import('./pages/dashboard/EstimatesMock'), 'EstimatesMock')
const PhotoDetail = lazyNamed(() => import('./pages/dashboard/PhotoDetail'), 'PhotoDetail')
const PhotosMock = lazyNamed(() => import('./pages/dashboard/PhotosMock'), 'PhotosMock')
const LoginMock = lazyNamed(() => import('./pages/dashboard/LoginMock'), 'LoginMock')
const ReportMock = lazyNamed(() => import('./pages/dashboard/ReportMock'), 'ReportMock')
const SettingsMock = lazyNamed(() => import('./pages/dashboard/SettingsMock'), 'SettingsMock')
const Unauthorized = lazyNamed(() => import('./pages/dashboard/Unauthorized'), 'Unauthorized')
const UploadMock = lazyNamed(() => import('./pages/dashboard/UploadMock'), 'UploadMock')
const About = lazyNamed(() => import('./pages/public/About'), 'About')
const Contacts = lazyNamed(() => import('./pages/public/Contacts'), 'Contacts')
const Home = lazyNamed(() => import('./pages/public/Home'), 'Home')
const ProjectDetail = lazyNamed(() => import('./pages/public/ProjectDetail'), 'ProjectDetail')
const Projects = lazyNamed(() => import('./pages/public/Projects'), 'Projects')
const QuoteRequest = lazyNamed(() => import('./pages/public/QuoteRequest'), 'QuoteRequest')
const Sectors = lazyNamed(() => import('./pages/public/Sectors'), 'Sectors')
const Services = lazyNamed(() => import('./pages/public/Services'), 'Services')

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

function scrollPublicRoute(path, behavior = 'auto') {
  if (path === '/preventivo') {
    const target = document.getElementById('contatti-form')
    if (target) {
      target.scrollIntoView({ block: 'start', behavior })
      return
    }
  }

  window.scrollTo({ top: 0, left: 0, behavior })
}

function getDashboardAccountingRows(mockStore) {
  const movements = Array.isArray(mockStore?.movements) ? mockStore.movements : []
  return movements.length ? movements : mockStore?.documents ?? []
}

function RouteLoading() {
  return <div className="route-loading" role="status">Caricamento…</div>
}

function RouteBoundary({ dashboard, children }) {
  return (
    <Suspense fallback={<RouteLoading />}>
      {dashboard ? <DashboardStyles /> : null}
      {children}
    </Suspense>
  )
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

  if (path === '/dashboard/login' && !session) {
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
          documents={getDashboardAccountingRows(mockStore)}
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
  const effectivePath = path === '/dashboard/login' ? '/dashboard' : path

  return (
    <AppShell
      currentPath={effectivePath}
      session={session}
      onLogout={onLogout}
      onRoleChange={onRoleChange}
      dataStore={mockStore}
    >
      <RouteBoundary dashboard>
        {renderRoute(effectivePath, session, selectedRole, handlers, mockStore)}
      </RouteBoundary>
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

  useEffect(() => {
    if (session && path === '/dashboard/login') {
      navigateTo('/dashboard')
    }
  }, [session, path])

  useEffect(() => {
    if (path.startsWith('/dashboard')) return undefined

    const timeoutId = window.setTimeout(() => scrollPublicRoute(path), 90)
    return () => window.clearTimeout(timeoutId)
  }, [path])

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
      dataStore={null}
    >
      <RouteBoundary dashboard={path.startsWith('/dashboard')}>
        {renderRoute(path, session, selectedRole, routeHandlers, null)}
      </RouteBoundary>
    </AppShell>
  )
}
