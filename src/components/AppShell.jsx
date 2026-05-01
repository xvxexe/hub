import { useEffect, useState } from 'react'
import { company } from '../data/mockData'
import { isActive, publicNav } from '../lib/navigation'
import { getDashboardNavForRole, getRole } from '../lib/roles'

const primaryPublicNav = publicNav.filter((item) => ['/', '/servizi', '/cantieri'].includes(item.path))
const secondaryPublicNav = publicNav.filter((item) => ['/preventivo', '/contatti'].includes(item.path))
const companyNav = publicNav.filter((item) => ['/settori', '/chi-siamo'].includes(item.path))

export function AppShell({ children, currentPath, session, onLogout, onRoleChange, roles }) {
  const isDashboard = currentPath.startsWith('/dashboard')
  const visibleDashboardNav = session ? getDashboardNavForRole(session.role) : []
  const activeRole = session ? getRole(session.role) : null

  return (
    <div className="app-shell">
      <PublicHeader currentPath={currentPath} />

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

function PublicHeader({ currentPath }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isCompanyActive = companyNav.some((item) => isActive(currentPath, item.path))

  useEffect(() => {
    if (!isMenuOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMenuOpen])

  return (
    <header className="site-header">
      <a className="brand" href="#/" onClick={() => setIsMenuOpen(false)}>
        <span className="brand-mark">ES</span>
        <span>
          <strong>{company.name}</strong>
          <small>{company.payoff}</small>
        </span>
      </a>

      <button
        aria-controls="public-mobile-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Chiudi menu principale' : 'Apri menu principale'}
        className="mobile-menu-button"
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className="top-nav desktop-public-nav" aria-label="Navigazione principale">
        {primaryPublicNav.map((item) => (
          <a
            aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
            href={`#${item.path}`}
            key={item.path}
          >
            {item.label}
          </a>
        ))}
        <div className="nav-dropdown">
          <button
            className={isCompanyActive ? 'nav-dropdown-trigger active' : 'nav-dropdown-trigger'}
            type="button"
          >
            Azienda
          </button>
          <div className="nav-dropdown-menu">
            {companyNav.map((item) => (
              <a
                aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
                href={`#${item.path}`}
                key={item.path}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        {secondaryPublicNav.map((item) => (
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

      <div
        className={isMenuOpen ? 'mobile-menu-backdrop open' : 'mobile-menu-backdrop'}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav
        aria-label="Menu principale mobile"
        className={isMenuOpen ? 'mobile-public-menu open' : 'mobile-public-menu'}
        id="public-mobile-menu"
      >
        <div className="mobile-menu-header">
          <strong>Menu</strong>
          <button type="button" className="mobile-menu-close" onClick={() => setIsMenuOpen(false)}>
            Chiudi
          </button>
        </div>
        {publicNav.map((item) => (
          <a
            aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
            href={`#${item.path}`}
            key={item.path}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <a
          className="nav-cta"
          aria-current={currentPath.startsWith('/dashboard') ? 'page' : undefined}
          href="#/dashboard/login"
          onClick={() => setIsMenuOpen(false)}
        >
          Area riservata
        </a>
      </nav>
    </header>
  )
}
