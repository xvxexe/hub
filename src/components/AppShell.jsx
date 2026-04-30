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
              {session ? (
                <label className="mobile-dashboard-nav">
                  Vai a
                  <select
                    value={visibleDashboardNav.find((item) => isActive(currentPath, item.path))?.path ?? '/dashboard'}
                    onChange={(event) => {
                      window.location.assign(`#${event.target.value}`)
                    }}
                  >
                    {visibleDashboardNav.map((item) => (
                      <option key={item.path} value={item.path}>{item.label}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="internal-topbar-actions">
                {session ? <span className="data-mode-badge">Solo frontend mock</span> : null}
                <a className="button button-secondary" href="#/">Sito pubblico</a>
              </div>
            </div>
            <div className="breadcrumb">
              <a href="#/dashboard">Area interna</a>
              <span>{currentPath.replace('/dashboard', '') || '/dashboard'}</span>
            </div>
            {children}
          </main>
        </div>
      ) : (
        <>
          <main>{children}</main>
          <footer className="public-footer">
            <div className="footer-brand">
              <a className="brand" href="#/">
                <span className="brand-mark">ES</span>
                <span>
                  <strong>{company.name}</strong>
                  <small>{company.payoff}</small>
                </span>
              </a>
              <p>
                Edilizia, cartongesso, controsoffitti, pareti divisorie e finiture interne per
                privati, aziende, hotel, negozi e cantieri organizzati.
              </p>
              <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
            </div>
            <nav aria-label="Link rapidi footer">
              <h2>Link rapidi</h2>
              {publicNav.map((item) => <a href={`#${item.path}`} key={item.path}>{item.label}</a>)}
              <a href="#/dashboard/login">Area riservata</a>
            </nav>
            <div>
              <h2>Servizi principali</h2>
              <p>Cartongesso</p>
              <p>Controsoffitti</p>
              <p>Pareti divisorie</p>
              <p>Rasature e finiture interne</p>
              <p>Manutenzioni e lavori edili</p>
            </div>
            <div>
              <h2>Contatti</h2>
              <p>{company.phone}</p>
              <p>{company.email}</p>
              <p>{company.area}</p>
              <p>Lun-Ven 8:00-18:00</p>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
