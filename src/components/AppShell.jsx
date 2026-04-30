import { company } from '../data/mockData'
import { isActive, publicNav } from '../lib/navigation'
import { getDashboardNavForRole, getRole } from '../lib/roles'

export function AppShell({ children, currentPath, session, onLogout, onRoleChange, roles }) {
  const isDashboard = currentPath.startsWith('/dashboard')
  const visibleDashboardNav = session ? getDashboardNavForRole(session.role) : []
  const activeRole = session ? getRole(session.role) : null

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#/">
          <span className="brand-mark">ES</span>
          <span>
            <strong>{company.name}</strong>
            <small>{company.payoff}</small>
          </span>
        </a>

        <nav className="top-nav" aria-label="Navigazione principale">
          {publicNav.map((item) => (
            <a
              aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
              href={`#${item.path}`}
              key={item.path}
            >
              {item.label}
            </a>
          ))}
          <a
            className="nav-cta"
            aria-current={currentPath.startsWith('/dashboard') ? 'page' : undefined}
            href="#/dashboard/login"
          >
            Area riservata
          </a>
        </nav>
      </header>

      {isDashboard ? (
        <div className="dashboard-shell">
          <aside className="dashboard-sidebar" aria-label="Menu area interna">
            <div>
              <p className="eyebrow">Accesso mock</p>
              <h2>Area interna</h2>
              {session ? <span className="role-pill">{activeRole?.label}</span> : null}
            </div>
            {session ? (
              <>
                <nav className="side-nav">
                  {visibleDashboardNav.map((item) => (
                    <a
                      aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
                      href={`#${item.path}`}
                      key={item.path}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="dev-role-panel">
                  <label htmlFor="dev-role">Modalità sviluppo: scegli ruolo</label>
                  <select
                    id="dev-role"
                    value={session.role}
                    onChange={(event) => onRoleChange(event.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <button className="sidebar-button" type="button" onClick={onLogout}>
                    Esci mock
                  </button>
                </div>
              </>
            ) : (
              <a className="sidebar-button" href="#/dashboard/login">
                Login mock
              </a>
            )}
          </aside>
          <main className="dashboard-main">
            <div className="internal-topbar">
              <div>
                <span>EuropaService Hub</span>
                <strong>{activeRole?.label ?? 'Login mock'}</strong>
              </div>
              <a className="button button-secondary" href="#/">Sito pubblico</a>
            </div>
            <div className="breadcrumb">
              <a href="#/dashboard">Area interna</a>
              <span>{currentPath.replace('/dashboard', '') || '/dashboard'}</span>
            </div>
            {children}
          </main>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  )
}
