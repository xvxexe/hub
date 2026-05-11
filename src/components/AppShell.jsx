import { useEffect, useMemo, useState } from 'react'
import { GlobalFloatingActions } from './GlobalFloatingActions'
import { InternalIcon } from './InternalIcons'
import europaServiceLogoUrl from '../assets/europaservice-logo.svg'
import europaServiceFooterLogoUrl from '../assets/europaservice-logo-footer.svg'
import { company } from '../data/mockData'
import { isActive, publicNav } from '../lib/navigation'
import { getDashboardNavForRole, getRole } from '../lib/roles'

const primaryPublicNav = publicNav.filter((item) => ['/', '/servizi', '/cantieri'].includes(item.path))
const secondaryPublicNav = publicNav.filter((item) => item.path === '/contatti')
const publicMobileNav = [
  { path: '/', label: 'Home', description: 'Panoramica servizi' },
  { path: '/servizi', label: 'Servizi', description: 'Cartongesso e finiture' },
  { path: '/cantieri', label: 'Progetti', description: 'Cantieri e case study' },
  { path: '/chi-siamo', label: 'Azienda', description: 'Metodo e valori' },
  { path: '/contatti', label: 'Contatti', description: 'Email, PEC e sede' },
  { path: '/preventivo', label: 'Preventivo', description: 'Richiedi sopralluogo' },
  { path: '/dashboard/login', label: 'Area privata', description: 'Accesso riservato' },
]

function getInitialPublicTheme() {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem('europaservice-public-theme')
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function BrandLogo({ className = '', variant = 'default' }) {
  const logoUrl = variant === 'footer' ? europaServiceFooterLogoUrl : europaServiceLogoUrl
  return <img className={`brand-logo ${className}`.trim()} src={logoUrl} alt="EuropaService" />
}

function PublicThemeToggle({ isDarkTheme, onToggle, className = '' }) {
  return (
    <button
      className={`public-theme-toggle ${className}`.trim()}
      type="button"
      aria-label={isDarkTheme ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
      aria-pressed={isDarkTheme}
      onClick={onToggle}
    >
      <span aria-hidden="true">{isDarkTheme ? '☀' : '☾'}</span>
      <small>{isDarkTheme ? 'Chiara' : 'Scura'}</small>
    </button>
  )
}

export function AppShell({ children, currentPath, session, onLogout, roles, dataStore }) {
  const isDashboard = currentPath.startsWith('/dashboard')
  const visibleDashboardNav = session ? getDashboardNavForRole(session.role) : []
  const activeRole = session ? getRole(session.role) : null
  const [activeTopbarPanel, setActiveTopbarPanel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchResults = session ? getInternalSearchResults(searchQuery, visibleDashboardNav, dataStore) : []
  const notifications = useMemo(() => (session ? buildNotifications(dataStore) : { count: 0, items: [] }), [dataStore, session])

  function toggleTopbarPanel(panel) {
    setActiveTopbarPanel((current) => (current === panel ? null : panel))
  }

  return (
    <div className="app-shell">
      {!isDashboard ? <PublicHeader currentPath={currentPath} /> : null}

      {isDashboard ? (
        <div className={session ? 'dashboard-shell' : 'dashboard-shell dashboard-shell-locked'}>
          {session ? (
            <aside className="dashboard-sidebar" aria-label="Menu area interna">
              <div className="sidebar-brand-block">
                <a className="dashboard-brand" href="#/dashboard">
                  <BrandLogo className="dashboard-brand-logo" />
                  <span>
                    <strong>Area Privata</strong>
                    <small>EuropaService Hub</small>
                  </span>
                </a>
              </div>
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
                <span className="role-managed-label">Ruolo gestito da Supabase</span>
                <button className="sidebar-button" type="button" onClick={onLogout}>
                  Esci
                </button>
              </div>
            </aside>
          ) : null}
          <main className={session ? 'dashboard-main' : 'dashboard-main dashboard-login-main'}>
            {session ? (
              <>
                <div className="internal-topbar">
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
                            key={`${item.path}-${item.label}`}
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
                    <div className="topbar-popover-wrap">
                      <button
                        className={notifications.count > 0 ? 'icon-button with-dot' : 'icon-button'}
                        type="button"
                        aria-expanded={activeTopbarPanel === 'notifications'}
                        aria-label="Notifiche"
                        onClick={() => toggleTopbarPanel('notifications')}
                      >
                        <InternalIcon name="bell" size={18} />
                      </button>
                      {activeTopbarPanel === 'notifications' ? (
                        <TopbarPanel title="Notifiche">
                          {notifications.items.length > 0 ? notifications.items.map((item) => (
                            <a href={`#${item.path}`} key={item.title} onClick={() => setActiveTopbarPanel(null)}>
                              <strong>{item.title}</strong>
                              <small>{item.description}</small>
                            </a>
                          )) : (
                            <article className="topbar-empty-state">
                              <strong>Nessuna criticità aperta</strong>
                              <small>I dati reali Supabase non hanno notifiche da mostrare.</small>
                            </article>
                          )}
                        </TopbarPanel>
                      ) : null}
                    </div>
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
                            <small>Usa Upload per aggiungere dati reali nello store Supabase.</small>
                          </a>
                          <a href="#/dashboard/documenti" onClick={() => setActiveTopbarPanel(null)}>
                            <strong>Verificare un documento</strong>
                            <small>Apri Documenti, seleziona una riga e usa le azioni rapide.</small>
                          </a>
                          <a href="#/dashboard/report" onClick={() => setActiveTopbarPanel(null)}>
                            <strong>Preparare un report</strong>
                            <small>La pagina Report usa i dati reali presenti in Supabase.</small>
                          </a>
                        </TopbarPanel>
                      ) : null}
                    </div>
                    <a className="button button-secondary" href="#/">Sito pubblico</a>
                    <div className="user-menu">
                      <span className="avatar">{session.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
                      <span>
                        <strong>{session.name}</strong>
                        <small>{activeRole?.label}</small>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="breadcrumb">
                  <a href="#/dashboard">Area interna</a>
                  <span>{currentPath.replace('/dashboard', '') || '/dashboard'}</span>
                </div>
              </>
            ) : null}
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
                <BrandLogo className="footer-brand-logo" variant="footer" />
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

function buildNotifications(dataStore) {
  const documents = dataStore?.documents ?? []
  const estimates = dataStore?.estimates ?? []
  const photos = dataStore?.photos ?? []
  const toCheck = documents.filter((doc) => ['Da verificare', 'Incompleto', 'Possibile duplicato'].includes(doc.statoVerifica))
  const toClassify = documents.filter((doc) => String(doc.categoria ?? '').toLowerCase().includes('classificare'))
  const pendingPayments = documents.filter((doc) => String(doc.categoria ?? '').toLowerCase().includes('bonifici') || String(doc.pagamento ?? '').toLowerCase().includes('da'))
  const photoReviews = photos.filter((photo) => ['Da revisionare', 'Non pubblicabile'].includes(photo.stato))
  const estimateReviews = estimates.filter((estimate) => ['Nuovo', 'Da valutare', 'Contattato'].includes(estimate.status))

  const items = []
  if (toCheck.length) {
    items.push({ path: '/dashboard/documenti', title: `${toCheck.length} documenti da controllare`, description: 'Documenti reali con stato da verificare, incompleto o duplicato.' })
  }
  if (toClassify.length) {
    items.push({ path: '/dashboard/contabilita', title: `${toClassify.length} righe da classificare`, description: 'Categorie o tab contabili da verificare nel master.' })
  }
  if (pendingPayments.length) {
    items.push({ path: '/dashboard/contabilita', title: `${pendingPayments.length} pagamenti / bonifici da rivedere`, description: 'Righe reali con pagamento o categoria da collegare.' })
  }
  if (photoReviews.length) {
    items.push({ path: '/dashboard/foto', title: `${photoReviews.length} foto da revisionare`, description: 'Foto reali in attesa di approvazione o pubblicazione.' })
  }
  if (estimateReviews.length) {
    items.push({ path: '/dashboard/preventivi', title: `${estimateReviews.length} preventivi da seguire`, description: 'Richieste preventivo reali ancora aperte.' })
  }

  return { count: items.length, items }
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
    'Sito pubblico': 'home',
  }

  return <InternalIcon name={icons[label] ?? 'file'} size={17} />
}

function getInternalSearchResults(query, navItems, dataStore) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const documents = (dataStore?.documents ?? []).slice(0, 8).map((doc) => ({
    label: doc.numeroDocumento ?? doc.descrizione ?? 'Documento',
    path: `/dashboard/documenti/${doc.id}`,
    description: `${doc.cantiere ?? 'Cantiere'} · ${doc.fornitore ?? 'Fornitore'} · ${doc.statoVerifica ?? 'Stato'}`,
  }))

  const sites = [...new Map((dataStore?.documents ?? []).map((doc) => [doc.cantiereId ?? 'barcelo-roma', {
    label: doc.cantiere ?? 'Barcelò Roma',
    path: `/dashboard/cantieri/${doc.cantiereId ?? 'barcelo-roma'}`,
    description: 'Cantiere reale da Supabase',
  }])).values()]

  return [
    ...navItems.map((item) => ({ ...item, description: `Vai a ${item.label}` })),
    ...sites,
    ...documents,
  ].filter((item) =>
    item.label.toLowerCase().includes(normalized) ||
    item.description.toLowerCase().includes(normalized),
  ).slice(0, 6)
}

function BottomDashboardNav({ items, currentPath }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const shouldShowAllItems = items.length <= 5
  const publicSiteItem = { path: '/', label: 'Sito pubblico' }
  const primaryLabels = ['Dashboard', 'Cantieri', 'Documenti', 'Contabilita']
  const preferredItems = primaryLabels
    .map((label) => items.find((item) => item.label === label || item.label.startsWith(label)))
    .filter(Boolean)
  const fallbackItems = shouldShowAllItems
    ? items
    : (preferredItems.length ? preferredItems : items.slice(0, 4))
  const primaryPaths = new Set(fallbackItems.map((item) => item.path))
  const dashboardMoreItems = shouldShowAllItems ? [] : items.filter((item) => !primaryPaths.has(item.path))
  const moreItems = [publicSiteItem, ...dashboardMoreItems]
  const isMoreActive = dashboardMoreItems.some((item) => isActive(currentPath, item.path))

  function closeMore() {
    setIsMoreOpen(false)
  }

  return (
    <>
      {isMoreOpen ? <button className="dashboard-mobile-more-backdrop" type="button" aria-label="Chiudi menu sezioni" onClick={closeMore} /> : null}
      {isMoreOpen ? (
        <section className="dashboard-mobile-more-panel" aria-label="Altre sezioni area privata">
          <div>
            <strong>Altre sezioni</strong>
            <button type="button" onClick={closeMore} aria-label="Chiudi">×</button>
          </div>
          <nav>
            {moreItems.map((item) => (
              <a
                aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
                href={`#${item.path}`}
                key={item.path}
                onClick={closeMore}
              >
                <span aria-hidden="true">{getNavIcon(item.label)}</span>
                <span>{getCompactNavLabel(item.label)}</span>
              </a>
            ))}
          </nav>
        </section>
      ) : null}
      <nav className={shouldShowAllItems ? 'dashboard-bottom-nav dashboard-bottom-nav-direct' : 'dashboard-bottom-nav'} aria-label="Navigazione area interna mobile">
        {fallbackItems.map((item) => (
          <a
            aria-current={isActive(currentPath, item.path) ? 'page' : undefined}
            href={`#${item.path}`}
            key={item.path}
            onClick={closeMore}
          >
            <span aria-hidden="true">{getNavIcon(item.label)}</span>
            {getCompactNavLabel(item.label)}
          </a>
        ))}
        {moreItems.length ? (
          <button
            className="dashboard-bottom-more-button"
            type="button"
            aria-current={isMoreActive ? 'page' : undefined}
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((current) => !current)}
          >
            <span aria-hidden="true"><InternalIcon name="menu" size={17} /></span>
            Altro
          </button>
        ) : null}
      </nav>
    </>
  )
}

function getCompactNavLabel(label) {
  const labels = {
    Contabilita: 'Conti',
    Caricamenti: 'Carichi',
    Impostazioni: 'Impost.',
    'Sito pubblico': 'Sito',
  }

  return labels[label] ?? label
}

function getPublicLabel(item) {
  if (item.path === '/cantieri') return 'Progetti'
  if (item.path === '/chi-siamo') return 'Azienda'
  return item.label
}

function PublicHeader({ currentPath }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [publicTheme, setPublicTheme] = useState(getInitialPublicTheme)
  const isDarkTheme = publicTheme === 'dark'
  const readableLogoUrl = isDarkTheme ? europaServiceFooterLogoUrl : europaServiceLogoUrl
  const togglePublicTheme = () => setPublicTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  const menuPanelStyle = {
    position: 'fixed',
    zIndex: 10000,
    inset: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: '1rem',
    width: '100vw',
    height: '100dvh',
    minHeight: '100vh',
    padding: 'max(1rem, env(safe-area-inset-top)) 1rem max(1rem, env(safe-area-inset-bottom))',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: isDarkTheme ? '#070c16' : '#fff',
    color: isDarkTheme ? '#f8fafc' : '#111827',
    pointerEvents: isMenuOpen ? 'auto' : 'none',
    opacity: isMenuOpen ? 1 : 0,
    transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.34s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
  }

  const menuHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'start',
    justifyItems: 'start',
    gap: '0.75rem',
    padding: '0 3.75rem 0.85rem 0',
    borderBottom: isDarkTheme ? '1px solid rgba(148, 163, 184, 0.2)' : '1px solid #e2e8f0',
  }

  const menuLogoStyle = {
    display: 'block',
    width: 'min(52vw, 180px)',
    maxWidth: '180px',
    height: 'auto',
    objectFit: 'contain',
  }

  const menuLinksStyle = {
    display: 'grid',
    alignContent: 'start',
    gap: '0.7rem',
    padding: '0.25rem 0 1rem',
  }

  useEffect(() => {
    document.documentElement.dataset.publicTheme = publicTheme
    document.documentElement.style.colorScheme = publicTheme
    window.localStorage.setItem('europaservice-public-theme', publicTheme)
  }, [publicTheme])

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event) {
      if (event.key === 'Escape') setIsMenuOpen(false)
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
        <img className="brand-logo site-brand-logo" src={readableLogoUrl} alt="EuropaService" />
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
        {primaryPublicNav.map((item) => <a aria-current={isActive(currentPath, item.path) ? 'page' : undefined} href={`#${item.path}`} key={item.path}>{getPublicLabel(item)}</a>)}
        <a aria-current={isActive(currentPath, '/chi-siamo') ? 'page' : undefined} href="#/chi-siamo">Azienda</a>
        {secondaryPublicNav.map((item) => <a aria-current={isActive(currentPath, item.path) ? 'page' : undefined} href={`#${item.path}`} key={item.path}>{getPublicLabel(item)}</a>)}
        <PublicThemeToggle isDarkTheme={isDarkTheme} onToggle={togglePublicTheme} />
        <a className="nav-private" aria-current={isActive(currentPath, '/dashboard/login') ? 'page' : undefined} href="#/dashboard/login">Area privata</a>
        <a className="nav-cta" aria-current={isActive(currentPath, '/preventivo') ? 'page' : undefined} href="#/preventivo">Richiedi preventivo</a>
      </nav>

      <div className={isMenuOpen ? 'mobile-menu-backdrop open' : 'mobile-menu-backdrop'} onClick={() => setIsMenuOpen(false)} />
      <nav aria-label="Menu principale mobile" id="public-mobile-menu" style={menuPanelStyle}>
        <div style={menuHeaderStyle}>
          <div>
            <a href="#/" onClick={() => setIsMenuOpen(false)} aria-label="Vai alla home">
              <img style={menuLogoStyle} src={readableLogoUrl} alt="EuropaService" />
            </a>
            <small style={{ color: isDarkTheme ? '#a8b5c5' : '#64748b', fontSize: '0.86rem', fontWeight: 850, letterSpacing: '0.02em' }}>Menu principale</small>
          </div>
          <PublicThemeToggle isDarkTheme={isDarkTheme} onToggle={togglePublicTheme} className="public-theme-toggle-mobile" />
        </div>

        <div style={menuLinksStyle}>
          {publicMobileNav.map((item) => {
            const active = isActive(currentPath, item.path)
            const privateLink = item.path.startsWith('/dashboard')
            return (
              <a
                aria-current={active ? 'page' : undefined}
                href={`#${item.path}`}
                key={item.path}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'grid',
                  gap: '0.26rem',
                  minHeight: '4.35rem',
                  padding: '0.86rem 1rem',
                  border: isDarkTheme
                    ? active ? '1px solid rgba(214, 138, 75, 0.48)' : '1px solid rgba(148, 163, 184, 0.2)'
                    : privateLink ? '1px solid #111827' : active ? '1px solid rgba(184, 100, 43, 0.32)' : '1px solid #e2e8f0',
                  borderRadius: '1.05rem',
                  background: isDarkTheme
                    ? active ? 'rgba(214, 138, 75, 0.16)' : 'rgba(15, 23, 42, 0.78)'
                    : privateLink ? '#111827' : active ? '#fff7ed' : '#fff',
                  color: isDarkTheme ? '#f8fafc' : privateLink ? '#fff' : '#111827',
                  textDecoration: 'none',
                  boxShadow: active || privateLink || isDarkTheme ? '0 14px 30px rgba(15, 23, 42, 0.18)' : 'none',
                }}
              >
                <span style={{ fontSize: '1.28rem', lineHeight: 1.05, fontWeight: 900 }}>{item.label}</span>
                <small style={{ color: isDarkTheme ? '#a8b5c5' : privateLink ? 'rgba(255,255,255,0.68)' : '#64748b', fontSize: '0.98rem', lineHeight: 1.28, fontWeight: 760 }}>{item.description}</small>
              </a>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
