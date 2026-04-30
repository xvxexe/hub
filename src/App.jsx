import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import {
  documents,
  employees,
  mockUsers,
  quotes,
  sitePhotos,
} from './data/mockData'
import { mockDocumentUploads, mockFotoUploads } from './data/mockUploads'
import { canAccessDashboardPath, normalizePath } from './lib/navigation'
import { roles } from './lib/roles'
import { CaricamentiRecenti } from './pages/dashboard/CaricamentiRecenti'
import { CantiereDetail } from './pages/dashboard/CantiereDetail'
import { CantieriList } from './pages/dashboard/CantieriList'
import { ContabilitaMock } from './pages/dashboard/ContabilitaMock'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { DashboardListPage } from './pages/dashboard/DashboardListPage'
import { LoginMock } from './pages/dashboard/LoginMock'
import { SettingsMock } from './pages/dashboard/SettingsMock'
import { Unauthorized } from './pages/dashboard/Unauthorized'
import { UploadMock } from './pages/dashboard/UploadMock'
import { Contacts } from './pages/public/Contacts'
import { Home } from './pages/public/Home'
import { ProjectDetail } from './pages/public/ProjectDetail'
import { Projects } from './pages/public/Projects'
import { QuoteRequest } from './pages/public/QuoteRequest'
import { Services } from './pages/public/Services'
import './styles/global.css'

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

function renderRoute(path, session, selectedRole, handlers, uploads) {
  if (path === '/') return <Home />
  if (path === '/servizi') return <Services />
  if (path === '/cantieri') return <Projects />
  if (path.startsWith('/cantieri/')) return <ProjectDetail projectId={path.split('/').at(-1)} />
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
        documentUploads={uploads.documentUploads}
        fotoUploads={uploads.fotoUploads}
      />
    )
  }
  if (path.startsWith('/dashboard/cantieri/')) {
    return (
      <CantiereDetail
        cantiereId={path.split('/').at(-1)}
        documentUploads={uploads.documentUploads}
        fotoUploads={uploads.fotoUploads}
        session={session}
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
        fotoUploads={uploads.fotoUploads}
        documentUploads={uploads.documentUploads}
        onAddFoto={handlers.onAddFoto}
        onAddDocument={handlers.onAddDocument}
      />
    )
  }
  if (path === '/dashboard/caricamenti') {
    return (
      <CaricamentiRecenti
        session={session}
        fotoUploads={uploads.fotoUploads}
        documentUploads={uploads.documentUploads}
      />
    )
  }
  if (path === '/dashboard/documenti') {
    return (
      <DashboardListPage
        eyebrow="Documenti"
        title="Archivio documenti mock"
        description="Fatture, ricevute e FIR dimostrativi senza upload reale."
        rows={documents}
        columns={[
          { label: 'Nome', key: 'name' },
          { label: 'Cantiere', key: 'project' },
          { label: 'Tipo', key: 'type' },
          { label: 'Stato', key: 'status', badge: true },
        ]}
      />
    )
  }
  if (path === '/dashboard/foto') {
    return (
      <DashboardListPage
        eyebrow="Foto cantiere"
        title="Foto recenti mock"
        description="Registro dimostrativo dei caricamenti foto, senza storage reale."
        rows={sitePhotos}
        columns={[
          { label: 'Titolo', key: 'title' },
          { label: 'Cantiere', key: 'project' },
          { label: 'Data', key: 'date' },
          { label: 'Autore', key: 'author' },
        ]}
      />
    )
  }
  if (path === '/dashboard/preventivi') {
    return (
      <DashboardListPage
        eyebrow="Preventivi"
        title="Richieste preventivo"
        description="Pipeline mock delle richieste ricevute dal sito pubblico."
        rows={quotes}
        columns={[
          { label: 'Cliente', key: 'client' },
          { label: 'Richiesta', key: 'request' },
          { label: 'Stato', key: 'status', badge: true },
          { label: 'Valore', key: 'value' },
        ]}
      />
    )
  }
  if (path === '/dashboard/contabilita') {
    return <ContabilitaMock />
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
  const [fotoUploads, setFotoUploads] = useState(mockFotoUploads)
  const [documentUploads, setDocumentUploads] = useState(mockDocumentUploads)

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
        onAddFoto: (upload) => setFotoUploads((current) => [upload, ...current]),
        onAddDocument: (upload) => setDocumentUploads((current) => [upload, ...current]),
      }, {
        fotoUploads,
        documentUploads,
      })}
    </AppShell>
  )
}
