import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import {
  employees,
  mockUsers,
} from './data/mockData'
import { useMockStore } from './hooks/useMockStore'
import { canAccessDashboardPath, normalizePath } from './lib/navigation'
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
import './styles/public-redesign.css'
import './styles/public-polish.css'
import './styles/public-motion-control.css'
import './styles/dashboard-polish.css'
import './styles/dashboard-mobile-compact.css'

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
      />
    )
  }

  if (path.startsWith('/dashboard') && !session) {
    return (
      <LoginMock
        selectedRole={selectedRole}
        onRoleSelect={handlers.onRoleSelect}
        onLogin={handlers.onLogin}
      />
    )
  }

  if (path.startsWith('/dashboard') && !canAccessDashboardPath(path, session.role)) {
    return <Unauthorized path={path} role={session.role} />
  }

  if (path === '/dashboard') {
    return (
      <DashboardHome
        session={session}
        documentUploads={mockStore.documentUploads}
        documents={mockStore.documents}
        fotoUploads={mockStore.fotoUploads}
        activities={mockStore.activities}
        estimates={mockStore.estimates}
      />
    )
  }
  if (path.startsWith('/dashboard/cantieri/')) {
    return (
      <CantiereDetail
        cantiereId={path.split('/').at(-1)}
        documentUploads={mockStore.documentUploads}
        fotoUploads={mockStore.fotoUploads}
        session={session}
        activities={mockStore.activities}
        notes={mockStore.notes}
        onAddNote={mockStore.addInternalNote}
      />
    )
  }
  if (path === '/dashboard/cantieri') {
    return <CantieriList />
  }
  if (path === '/dashboard/upload') {
    return (
      <UploadMock
        session={session}
        fotoUploads={mockStore.fotoUploads}
        documentUploads={mockStore.documentUploads}
        onAddFoto={mockStore.addFotoUpload}
        onAddDocument={mockStore.addDocumentUpload}
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
    return <ContabilitaMock documents={mockStore.documents} />
  }
  if (path === '/dashboard/report') {
    return <ReportMock />
  }
  if (path === '/dashboard/dipendenti') {
    return (
      <DashboardListPage
        eyebrow="Dipendenti"
        title="Squadra e assegnazioni"
        description="Anagrafica mock per preparare ruoli e permessi nelle fasi successive."
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
    return <SettingsMock />
  }

  return <Home />
}

export default function App() {
  const path = useHashPath()
  const [selectedRole, setSelectedRole] = useState('admin')
  const [session, setSession] = useState(null)
  const mockStore = useMockStore(session)

  function loginWithSelectedRole() {
    const user = mockUsers.find((item) => item.role === selectedRole) ?? mockUsers[0]
    setSession(user)
    navigateTo('/dashboard')
  }

  function changeRole(role) {
    const user = mockUsers.find((item) => item.role === role) ?? mockUsers[0]
    setSelectedRole(role)
    setSession(user)

    if (!canAccessDashboardPath(path, role)) {
      navigateTo('/dashboard')
    }
  }

  function logout() {
    setSession(null)
    navigateTo('/dashboard/login')
  }

  return (
    <AppShell
      currentPath={path}
      session={session}
      onLogout={logout}
      onRoleChange={changeRole}
      roles={roles}
    >
      {renderRoute(path, session, selectedRole, {
        onLogin: loginWithSelectedRole,
        onRoleSelect: setSelectedRole,
      }, mockStore)}
    </AppShell>
  )
}
