import { useEffect, useState } from 'react'
import { GlobalFloatingActions } from './GlobalFloatingActions'
import { InternalIcon } from './InternalIcons'
import { company } from '../data/mockData'
import { isActive, publicNav } from '../lib/navigation'
import { getDashboardNavForRole, getRole } from '../lib/roles'

const primaryPublicNav = publicNav.filter((item) => ['/', '/servizi', '/cantieri'].includes(item.path))
const secondaryPublicNav = publicNav.filter((item) => item.path === '/contatti')
const publicMobileNav = [
  { path: '/', label: 'Home', description: 'Panoramica servizi e metodo EuropaService' },
  { path: '/servizi', label: 'Servizi', description: 'Cartongesso, finiture, ristrutturazioni e gestione cantiere' },
  { path: '/cantieri', label: 'Progetti', description: 'Portfolio, cantieri e case study' },
  { path: '/chi-siamo', label: 'Azienda', description: 'Metodo, valori e organizzazione operativa' },
  { path: '/contatti', label: 'Contatti', description: 'Telefono, email, modulo e sopralluogo' },
  { path: '/dashboard/login', label: 'Area privata', description: 'Accesso mock per admin, capo e dipendenti' },
]

export function AppShell({ children, currentPath, session, onLogout, onRoleChange, roles }) {
  const isDashboard = currentPath.startsWith('/dashboard')
  const visibleDashboardNav = session ? getDashboardNavForRole(session.role) : []
  const activeRole = session ? getRole(session.role) : null
  const [activeTopbarPanel, setActiveTopbarPanel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarCompact, setIsSidebarCompact] = useState(false)
  const searchResults = getInternalSearchResults(searchQuery, visibleDashboardNav)

  function toggleTopbarPanel(panel) {
    setActiveTopbarPanel((current) => (current === panel ? null : panel))
  }

  return (
    <div className="app-shell">
      {!isDashboard ? <PublicHeader currentPath={currentPath} /> : null}

      {isDashboard ? (
        <div className={isSidebarCompact ? 'dashboard-shell dashboard-shell-compact' : 'dashboard-shell'}>
          <aside className="dashboard-sidebar" aria-label="Menu area interna">
            <div className="sidebar-brand-block">
              <button
                className="icon-button sidebar-menu-button"
                type="button"
                aria-label={isSidebarCompact ? 'Espandi menu' : 'Riduci menu'}
                aria-pressed={isSidebarCompact}
                onClick={() => setIsSidebarCompact((current) => !current)}
              >
                <InternalIcon name="menu" size={18} />
              </button>
              <a className="dashboard-brand" href="#/dashboard">
                <span className="brand-mark">ES</span>
                <span>
                  <strong>Area Privata</strong>
                  <small>EuropaService Hub</small>
                </span>
              </a>
            </div>
            {session ? (
              <>
                <nav className="side-nav">
                  {visibleDashboardNav.map((item) => (
                    <a
                      className="nav-icon-link"
                      aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
                      href={`#${item.path}`}
                      key={item.path}
                    >
                      <span className="nav-icon" aria-hidden="true">{getNavIcon(item.label)}</span>
                      {item.label}
                    </a>
                  ))}
                </nav>
                <div className="dev-role-panel">
                  <label htmlFor="dev-role">Ruolo mock</label>
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
              <button
                className="icon-button mobile-sidebar-trigger"
                type="button"
                aria-label="Menu"
                onClick={() => setIsSidebarCompact((current) => !current)}
              >
                <InternalIcon name="menu" size={18} />
              </button>
              <label className="global-search">
                <InternalIcon name="search" size={18} />
                <span>Cerca</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setActiveTopbarPanel('search')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchResults[0]) {
                      window.location.assign(`#${searchResults[0].path}`)
                      setSearchQuery('')
                      setActiveTopbarPanel(null)
                    }
                  }}
                  placeholder="Cerca cantieri, documenti, ..."
                />
                <kbd>⌘K</kbd>
                {activeTopbarPanel === 'search' && searchQuery.trim() ? (
                  <TopbarPanel title="Risultati ricerca">
                    {searchResults.length > 0 ? searchResults.map((item) => (
                      <a
                        href={`#${item.path}`}
                        key={item.path}
                        onClick={() => {
                          setSearchQuery('')
                          setActiveTopbarPanel(null)
                        }}
                      >
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </a>
                    )) : (
                      <article className="topbar-empty-state">
                        <strong>Nessun risultato</strong>
                        <small>Prova con cantieri, documenti, report o contabilità.</small>
                      </article>
                    )}
                  </TopbarPanel>
                ) : null}
              </label>
              <div className="internal-topbar-actions">
                {session ? (
                  <div className="topbar-popover-wrap">
                    <button
                      className="icon-button with-dot"
                      type="button"
                      aria-expanded={activeTopbarPanel === 'notifications'}
                      aria-label="Notifiche"
                      onClick={() => toggleTopbarPanel('notifications')}
                    >
                      <InternalIcon name="bell" size={18} />
                    </button>
                    {activeTopbarPanel === 'notifications' ? (
                      <TopbarPanel title="Notifiche">
                        <a href="#/dashboard/documenti" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>7 documenti da controllare</strong>
                          <small>Fatture, ricevute e DDT in attesa di verifica.</small>
                        </a>
                        <a href="#/dashboard/cantieri" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>2 cantieri con criticità</strong>
                          <small>Controlla avanzamento e scadenze operative.</small>
                        </a>
                        <a href="#/dashboard/contabilita" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>5 pagamenti in attesa</strong>
                          <small>Bonifici e collegamenti spesa da rivedere.</small>
                        </a>
                      </TopbarPanel>
                    ) : null}
                  </div>
                ) : null}
                {session ? (
                  <div className="topbar-popover-wrap">
                    <button
                      className="icon-button"
                      type="button"
                      aria-expanded={activeTopbarPanel === 'help'}
                      aria-label="Help"
                      onClick={() => toggleTopbarPanel('help')}
                    >
                      <InternalIcon name="help" size={18} />
                    </button>
                    {activeTopbarPanel === 'help' ? (
                      <TopbarPanel title="Help rapido">
                        <a href="#/dashboard/upload" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>Caricare documenti o foto</strong>
                          <small>Usa Upload per simulare un caricamento da cantiere.</small>
                        </a>
                        <a href="#/dashboard/documenti" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>Verificare un documento</strong>
                          <small>Apri Documenti, seleziona una riga e usa le azioni rapide.</small>
                        </a>
                        <a href="#/dashboard/report" onClick={() => setActiveTopbarPanel(null)}>
                          <strong>Preparare un report</strong>
                          <small>La pagina Report mostra la vista mock pronta per PDF.</small>
                        </a>
                      </TopbarPanel>
                    ) : null}
                  </div>
                ) : null}
                <a className="button button-secondary" href="#/">Sito pubblico</a>
                {session ? (
                  <div className="user-menu">
                    <span className="avatar">{session.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                    <span>
                      <strong>{session.name}</strong>
                      <small>{activeRole?.label}</small>
                    </span>
                  </div>
                ) : null}
              </div>
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
            <div className="breadcrumb">
              <a href="#/dashboard">Area interna</a>
              <span>{currentPath.replace('/dashboard', '') || '/dashboard'}</span>
            </div>
            {children}
            {session ? <BottomDashboardNav items={visibleDashboardNav} currentPath={currentPath} /> : null}
            {session && currentPath !== '/dashboard' ? <GlobalFloatingActions role={session.role} /> : null}
          </main>
        </div>
      ) : (
        <>
          <main>{children}</main>
          <footer className="public-footer">
            <section className="footer-cta-band">
              <div>
                <h2>Insieme costruiamo spazi di valore.</h2>
                <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
              </div>
            </section>
            <div className="footer-brand">
              <a className="brand" href="#/">
                <span className="brand-mark">ES</span>
                <span>
                  <strong>EuropaService</strong>
                  <small>Edilizia tecnica e finiture interne</small>
                </span>
              </a>
              <p>
                Costruiamo spazi di valore con cartongesso, ristrutturazioni tecniche, finiture
                interne e gestione cantieri per clienti privati e professionali.
              </p>
              <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
            </div>
            <nav aria-label="Link rapidi footer">
              <h2>Link rapidi</h2>
              {publicNav.filter((item) => item.path !== '/settori').map((item) => <a href={`#${item.path}`} key={item.path}>{item.label}</a>)}
              <a href="#/dashboard/login">Area riservata</a>
            </nav>
            <div>
              <h2>Servizi</h2>
              <p>Cartongesso</p>
              <p>Ristrutturazioni tecniche</p>
              <p>Finiture interne</p>
              <p>Gestione cantiere</p>
              <p>Manutenzioni</p>
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

function TopbarPanel({ title, children }) {
  return (
    <section className="topbar-popover">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}

function getNavIcon(label) {
  const icons = {
    Dashboard: 'home',
    Cantieri: 'building',
    Upload: 'upload',
    Caricamenti: 'inbox',
    Documenti: 'file',
    Foto: 'image',
    Preventivi: 'estimate',
    Contabilita: 'wallet',
    Report: 'report',
    Dipendenti: 'users',
    Impostazioni: 'settings',
  }

  return <InternalIcon name={icons[label] ?? 'file'} size={17} />
}

function getInternalSearchResults(query, navItems) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const extraItems = [
    { label: 'Barcelo Roma', path: '/dashboard/cantieri/barcelo-roma', description: 'Cantiere · Hospitality · In corso' },
    { label: 'Residenza Verdi', path: '/dashboard/cantieri/residenza-verdi', description: 'Cantiere · Residenziale · Verifiche aperte' },
    { label: 'Fattura eurofer 0428', path: '/dashboard/documenti/doc-eurofer-0428', description: 'Documento · Da controllare' },
    { label: 'Report PDF', path: '/dashboard/report', description: 'Report cantieri e contabilità mock' },
  ]

  return [
    ...navItems.map((item) => ({ ...item, description: `Vai a ${item.label}` })),
    ...extraItems,
  ].filter((item) =>
    item.label.toLowerCase().includes(normalized) ||
    item.description.toLowerCase().includes(normalized),
  ).slice(0, 6)
}

function BottomDashboardNav({ items, currentPath }) {
  const preferred = ['Dashboard', 'Cantieri', 'Documenti', 'Contabilita', 'Upload']
  const visibleItems = preferred
    .map((label) => items.find((item) => item.label === label || item.label.startsWith(label)))
    .filter(Boolean)
    .slice(0, 5)

  return (
    <nav className="dashboard-bottom-nav" aria-label="Navigazione area interna mobile">
      {visibleItems.map((item) => (
        <a
          aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
          href={`#${item.path}`}
          key={item.path}
        >
          <span aria-hidden="true">{getNavIcon(item.label)}</span>
          {item.label.replace('Contabilita', 'Conti')}
        </a>
      ))}
    </nav>
  )
}

function getPublicLabel(item) {
  if (item.path === '/cantieri') return 'Progetti'
  if (item.path === '/chi-siamo') return 'Azienda'
  return item.label
}

function PublicHeader({ currentPath }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [currentPath])

  return (
    <header className="site-header">
      <a className="brand" href="#/" onClick={() => setIsMenuOpen(false)}>
        <span className="brand-mark">ES</span>
        <span>
          <strong>EuropaService</strong>
          <small>{company.payoff}</small>
        </span>
      </a>

      <button
        aria-controls="public-mobile-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Chiudi menu principale' : 'Apri menu principale'}
        className={isMenuOpen ? 'mobile-menu-button open' : 'mobile-menu-button'}
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
            {getPublicLabel(item)}
          </a>
        ))}
        <a aria-current={isActive(currentPath, '/chi-siamo') ? 'page' : undefined} href="#/chi-siamo">
          Azienda
        </a>
        {secondaryPublicNav.map((item) => (
          <a
            aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
            href={`#${item.path}`}
            key={item.path}
          >
            {getPublicLabel(item)}
          </a>
        ))}
        <a
          className="nav-private"
          aria-current={isActive(currentPath, '/dashboard/login') ? 'page' : undefined}
          href="#/dashboard/login"
        >
          Area privata
        </a>
        <a
          className="nav-cta"
          aria-current={isActive(currentPath, '/preventivo') ? 'page' : undefined}
          href="#/preventivo"
        >
          Richiedi preventivo
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
          <div>
            <strong>EuropaService</strong>
            <small>Menu principale</small>
          </div>
          <button type="button" className="mobile-menu-close" aria-label="Chiudi menu" onClick={() => setIsMenuOpen(false)}>
            ×
          </button>
        </div>

        <div className="mobile-menu-links">
          {publicMobileNav.map((item) => (
            <a
              className={item.path.startsWith('/dashboard') ? 'mobile-private-link' : undefined}
              aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
              href={`#${item.path}`}
              key={item.path}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </a>
          ))}
        </div>

        <div className="mobile-menu-cta-panel">
          <small>Hai un lavoro da valutare?</small>
          <strong>Richiedi un preventivo o un sopralluogo.</strong>
          <a
            className="nav-cta"
            aria-current={isActive(currentPath, '/preventivo') ? 'page' : undefined}
            href="#/preventivo"
            onClick={() => setIsMenuOpen(false)}
          >
            Richiedi preventivo
          </a>
        </div>
      </nav>
    </header>
  )
}
