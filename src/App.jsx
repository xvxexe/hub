import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import {
  accountingRows,
  documents,
  employees,
  mockUsers,
  quotes,
  roles,
  sitePhotos,
} from './data/mockData'
import { canAccessDashboardPath, normalizePath } from './lib/navigation'
import { CantiereDetail } from './pages/dashboard/CantiereDetail'
import { CantieriList } from './pages/dashboard/CantieriList'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { DashboardListPage } from './pages/dashboard/DashboardListPage'
import { LoginMock } from './pages/dashboard/LoginMock'
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

function renderRoute(path, session, selectedRole, handlers) {
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
    return (
      <DashboardListPage
        eyebrow="Accesso limitato"
        title="Sezione non disponibile per questo ruolo"
        description="Il menu mostra solo le aree abilitate per il ruolo mock selezionato."
        rows={[{ section: path.replace('/dashboard/', ''), role: session.role, status: 'Non abilitato' }]}
        columns={[
          { label: 'Sezione', key: 'section' },
          { label: 'Ruolo', key: 'role' },
          { label: 'Stato', key: 'status', badge: true },
        ]}
      />
    )
  }

  if (path === '/dashboard') return <DashboardHome session={session} />
  if (path.startsWith('/dashboard/cantieri/')) {
    return <CantiereDetail cantiereId={path.split('/').at(-1)} />
  }
  if (path === '/dashboard/cantieri') {
    return <CantieriList />
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
    return (
      <DashboardListPage
        eyebrow="Contabilita"
        title="Movimenti contabili mock"
        description="Prima vista contabile con importi e categorie dimostrative."
        rows={accountingRows}
        columns={[
          { label: 'Voce', key: 'item' },
          { label: 'Cantiere', key: 'project' },
          { label: 'Categoria', key: 'category' },
          { label: 'Importo', key: 'amount' },
        ]}
      />
    )
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

  return <Home />
}

export default function App() {
  const path = useHashPath()
  const [selectedRole, setSelectedRole] = useState('admin')
  const [session, setSession] = useState(null)

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
      })}
    </AppShell>
  )
}
