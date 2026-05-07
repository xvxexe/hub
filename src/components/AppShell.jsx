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
  { path: '/', label: 'Home', description: 'Panoramica servizi e metodo EuropaService' },
  { path: '/servizi', label: 'Servizi', description: 'Cartongesso, finiture, ristrutturazioni e gestione cantiere' },
  { path: '/cantieri', label: 'Progetti', description: 'Portfolio, cantieri e case study' },
  { path: '/chi-siamo', label: 'Azienda', description: 'Metodo, valori e organizzazione operativa' },
  { path: '/contatti', label: 'Contatti', description: 'Telefono, email, modulo e sopralluogo' },
  { path: '/dashboard/login', label: 'Area privata', description: 'Accesso area privata admin, capo e dipendenti' },
]

function BrandLogo({ className = '', variant = 'default' }) {
  const logoUrl = variant === 'footer' ? europaServiceFooterLogoUrl : europaServiceLogoUrl
  return <img className={`brand-logo ${className}`.trim()} src={logoUrl} alt="EuropaService" />
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
  const primaryLabels = ['Dashboard', 'Cantieri', 'Documenti', 'Contabilita']
  const preferredItems = primaryLabels
    .map((label) => items.find((item) => item.label === label || item.label.startsWith(label)))
    .filter(Boolean)
  const fallbackItems = shouldShowAllItems
    ? items
    : (preferredItems.length ? preferredItems : items.slice(0, 4))
  const primaryPaths = new Set(fallbackItems.map((item) => item.path))
  const moreItems = shouldShowAllItems ? [] : items.filter((item) => !primaryPaths.has(item.path))
  const isMoreActive = moreItems.some((item) => isActive(currentPath, item.path))

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
        <BrandLogo className="site-brand-logo" />
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
        <a className="nav-private" aria-current={isActive(currentPath, '/dashboard/login') ? 'page' : undefined} href="#/dashboard/login">Area privata</a>
        <a className="nav-cta" aria-current={isActive(currentPath, '/preventivo') ? 'page' : undefined} href="#/preventivo">Richiedi preventivo</a>
      </nav>

      <div className={isMenuOpen ? 'mobile-menu-backdrop open' : 'mobile-menu-backdrop'} onClick={() => setIsMenuOpen(false)} />
      <nav aria-label="Menu principale mobile" className={isMenuOpen ? 'mobile-public-menu open' : 'mobile-public-menu'} id="public-mobile-menu">
        <div className="mobile-menu-header">
          <div><strong>EuropaService</strong><small>Menu principale</small></div>
          <button type="button" className="mobile-menu-close" aria-label="Chiudi menu" onClick={() => setIsMenuOpen(false)}>×</button>
        </div>

        <div className="mobile-menu-links">
          {publicMobileNav.map((item) => (
            <a className={item.path.startsWith('/dashboard') ? 'mobile-private-link' : undefined} aria-current={isActive(currentPath, item.path) ? 'page' : undefined} href={`#${item.path}`} key={item.path} onClick={() => setIsMenuOpen(false)}>
              <span>{item.label}</span>
              <small>{item.description}</small>
            </a>
          ))}
        </div>

        <div className="mobile-menu-cta-panel">
          <small>Hai un lavoro da valutare?</small>
          <strong>Richiedi un preventivo o un sopralluogo.</strong>
          <a className="nav-cta" aria-current={isActive(currentPath, '/preventivo') ? 'page' : undefined} href="#/preventivo" onClick={() => setIsMenuOpen(false)}>Richiedi preventivo</a>
        </div>
      </nav>
    </header>
  )
}
