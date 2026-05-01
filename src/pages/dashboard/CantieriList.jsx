import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import {
  formatCurrency,
  formatDate,
  getCantiereTotals,
  mockCantieri,
  statiCantiere,
} from '../../data/mockCantieri'
import { reminders } from '../../data/mockHubData'

export function CantieriList() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('tutti')
  const [manager, setManager] = useState('tutti')
  const [sort, setSort] = useState('avanzamento-desc')
  const [page, setPage] = useState(1)
  const [modalAction, setModalAction] = useState(null)
  const managers = [...new Set(mockCantieri.map((cantiere) => cantiere.responsabile))]

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return mockCantieri
      .filter((cantiere) => {
        const matchesSearch =
          normalizedSearch === '' ||
          cantiere.nome.toLowerCase().includes(normalizedSearch) ||
          cantiere.cliente.toLowerCase().includes(normalizedSearch) ||
          cantiere.localita.toLowerCase().includes(normalizedSearch)
        const matchesStatus = status === 'tutti' || cantiere.stato === status
        const matchesManager = manager === 'tutti' || cantiere.responsabile === manager

        return matchesSearch && matchesStatus && matchesManager
      })
      .sort((a, b) => {
        if (sort === 'avanzamento-desc') return b.avanzamento - a.avanzamento
        if (sort === 'avanzamento-asc') return a.avanzamento - b.avanzamento
        if (sort === 'data-desc') return new Date(b.dataInizio) - new Date(a.dataInizio)
        if (sort === 'data-asc') return new Date(a.dataInizio) - new Date(b.dataInizio)
        return a.nome.localeCompare(b.nome)
      })
  }, [manager, search, sort, status])

  const active = mockCantieri.filter((item) => item.stato === 'attivo').length
  const waiting = mockCantieri.filter((item) => item.stato === 'da avviare').length
  const delayed = mockCantieri.filter((item) => item.problemi.some((problem) => problem.priorita === 'Alta')).length
  const closed = mockCantieri.filter((item) => item.stato === 'completato').length
  const featured = filteredCantieri[0] ?? mockCantieri[0]
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredCantieri.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedCantieri = filteredCantieri.slice(pageStart, pageStart + pageSize)

  return (
    <>
      <DashboardHeader
        eyebrow="Cantieri mock"
        title="Gestione cantieri"
        description="Monitora lo stato, i costi e l’avanzamento di tutti i cantieri."
      >
        <DataModeBadge />
        <button
          className="button button-primary"
          type="button"
          onClick={() => setModalAction(newSiteAction)}
        >
          Nuovo cantiere
        </button>
      </DashboardHeader>

      <section className="cantieri-tools" aria-label="Filtri cantieri">
        <label>
          Cerca cantiere
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Cantiere, cliente, località..."
          />
        </label>
        <label>
          Stato
          <select value={status} onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}>
            <option value="tutti">Tutti gli stati</option>
            {statiCantiere.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Responsabile
          <select value={manager} onChange={(event) => {
            setManager(event.target.value)
            setPage(1)
          }}>
            <option value="tutti">Tutti i responsabili</option>
            {managers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          Ordina
          <select value={sort} onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}>
            <option value="avanzamento-desc">Recenti</option>
            <option value="avanzamento-asc">Avanzamento basso</option>
            <option value="data-desc">Data inizio recente</option>
            <option value="data-asc">Data inizio vecchia</option>
            <option value="nome">Nome</option>
          </select>
        </label>
      </section>

      <section className="stats-grid hub-kpi-grid">
        <StatCard icon="building" label="Cantieri attivi" value={active} hint="+2 rispetto alla settimana scorsa" />
        <StatCard icon="calendar" tone="amber" label="In attesa" value={waiting} hint="+1 rispetto alla settimana scorsa" />
        <StatCard icon="warning" tone="red" label="In ritardo" value={delayed} hint="+2 rispetto alla settimana scorsa" />
        <StatCard icon="check" tone="green" label="Chiusi questo mese" value={closed} hint="+3 rispetto al mese scorso" />
      </section>

      <div className="cantieri-page-layout">
        <section className="internal-panel cantieri-table-panel">
          <div className="section-heading panel-title-row">
            <h2>Elenco cantieri</h2>
            <span className="data-mode-badge">Ordine: {sort}</span>
          </div>
          {filteredCantieri.length > 0 ? (
            <>
              <div className="hub-table cantieri-data-table">
                <div className="hub-table-head cantieri-data-row">
                  <span>Nome cantiere</span><span>Località</span><span>Cliente</span><span>Stato</span><span>Avanzamento</span><span>Budget</span><span>Spese</span><span>Responsabile</span><span>Ultimo agg.</span>
                </div>
                {paginatedCantieri.map((cantiere) => {
                  const totals = getCantiereTotals(cantiere)
                  const budget = getMockBudget(cantiere)

                  return (
                    <a className="hub-table-row cantieri-data-row" href={`#/dashboard/cantieri/${cantiere.id}`} key={cantiere.id}>
                      <strong>{cantiere.nome}</strong>
                      <span>{cantiere.localita}</span>
                      <span>{cantiere.cliente}</span>
                      <StatusBadge>{displaySiteStatus(cantiere)}</StatusBadge>
                      <ProgressBar value={cantiere.avanzamento} />
                      <span>{formatCurrency(budget)}</span>
                      <span>{formatCurrency(totals.spese)}</span>
                      <span>{cantiere.responsabile}</span>
                      <span>{formatDate(cantiere.dataInizio)}</span>
                    </a>
                  )
                })}
              </div>
              <div className="pagination-bar">
                <span>Mostra {pageStart + 1} - {Math.min(pageStart + pageSize, filteredCantieri.length)} di {filteredCantieri.length} cantieri</span>
                <div>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      aria-current={currentPage === pageNumber ? 'page' : undefined}
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <section className="empty-state">
              <h2>Nessun cantiere trovato</h2>
              <p>Modifica ricerca o filtro stato per visualizzare altri cantieri mock.</p>
            </section>
          )}
        </section>

        <aside className="cantieri-side-stack">
          <FeaturedSite cantiere={featured} />
          <section className="internal-panel">
            <div className="section-heading panel-title-row">
              <h2>Scadenze cantiere</h2>
              <button
                className="button button-secondary button-small"
                type="button"
                onClick={() => setModalAction({
                  icon: 'calendar',
                  title: 'Tutte le scadenze mock',
                  text: 'Vista calendario dimostrativa pronta per essere collegata a scadenze reali, promemoria e notifiche.',
                  confirmLabel: 'Ok',
                })}
              >
                Vedi tutte
              </button>
            </div>
            <div className="activity-feed">
              {reminders.slice(0, 3).map((item) => (
                <article className="activity-item" key={item.id}>
                  <span />
                  <div><strong>{item.site}</strong><small>{item.title}</small></div>
                  <StatusBadge>{item.priority}</StatusBadge>
                </article>
              ))}
            </div>
          </section>
          <section className="internal-panel">
            <div className="section-heading panel-title-row"><h2>Azioni rapide</h2></div>
            <div className="quick-actions-grid quick-actions-compact">
              <button className="quick-action-card" type="button" onClick={() => setModalAction(newSiteAction)}><strong>Nuovo cantiere</strong><span>Crea</span></button>
              <a className="quick-action-card" href="#/dashboard/report"><strong>Report cantieri</strong><span>PDF</span></a>
            </div>
          </section>
        </aside>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

const newSiteAction = {
  icon: 'building',
  title: 'Nuovo cantiere mock',
  text: 'Crea la scheda iniziale del cantiere nei dati mock locali. Il backend reale sarà collegabile mantenendo questi campi.',
  confirmLabel: 'Crea cantiere mock',
  fields: [
    { label: 'Nome cantiere', placeholder: 'Es. Hotel Centro - fase 2' },
    { label: 'Responsabile', type: 'select', options: ['Marco Ferri', 'Giulia Riva', 'Luca Bianchi'] },
    { label: 'Stato', type: 'select', options: ['In corso', 'Da avviare', 'Critico'] },
  ],
}

function FeaturedSite({ cantiere }) {
  const totals = getCantiereTotals(cantiere)
  return (
    <section className="internal-panel featured-site">
      <div className="section-heading panel-title-row">
        <h2>Cantiere in evidenza</h2>
        <a className="button button-secondary button-small" href={`#/dashboard/cantieri/${cantiere.id}`}>Vedi dettaglio</a>
      </div>
      <strong>{cantiere.nome}</strong>
      <small>{cantiere.localita}</small>
      <ProgressBar value={cantiere.avanzamento} />
      <dl className="detail-list">
        <div><dt>Budget</dt><dd>{formatCurrency(getMockBudget(cantiere))}</dd></div>
        <div><dt>Spese</dt><dd>{formatCurrency(totals.spese)}</dd></div>
        <div><dt>Scadenza prevista</dt><dd>{formatDate(cantiere.dataFinePrevista)}</dd></div>
        <div><dt>Responsabile</dt><dd>{cantiere.responsabile}</dd></div>
      </dl>
      <div className="row-actions">
        <a className="button button-primary" href={`#/dashboard/cantieri/${cantiere.id}`}>Apri dettaglio</a>
        <a className="button button-secondary" href="#/dashboard/report">Report</a>
        <a className="button button-secondary" href="#/dashboard/documenti">Documenti</a>
      </div>
    </section>
  )
}

function displaySiteStatus(cantiere) {
  if (cantiere.problemi.some((problem) => problem.priorita === 'Alta')) return 'Critico'
  if (cantiere.stato === 'attivo') return 'In corso'
  if (cantiere.stato === 'completato') return 'Chiuso'
  return cantiere.stato
}

function getMockBudget(cantiere) {
  return {
    'barcelo-roma': 1245000,
    'residenza-verdi': 1250000,
    'negozio-centro': 950000,
    'hotel-interno-milano': 4200000,
    'condominio-bianchi': 1900000,
  }[cantiere.id] ?? 750000
}
