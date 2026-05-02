import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

export function CantieriList({ documents = [] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('tutti')
  const [sort, setSort] = useState('spese-desc')
  const [page, setPage] = useState(1)
  const [modalAction, setModalAction] = useState(null)
  const cantieri = useMemo(() => buildCantieriFromDocuments(documents), [documents])

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cantieri
      .filter((cantiere) => {
        const matchesSearch =
          normalizedSearch === '' ||
          cantiere.nome.toLowerCase().includes(normalizedSearch) ||
          cantiere.localita.toLowerCase().includes(normalizedSearch)
        const matchesStatus = status === 'tutti' || cantiere.stato === status
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sort === 'spese-desc') return b.spese - a.spese
        if (sort === 'spese-asc') return a.spese - b.spese
        if (sort === 'movimenti-desc') return b.movimenti - a.movimenti
        if (sort === 'nome') return a.nome.localeCompare(b.nome)
        return b.avanzamento - a.avanzamento
      })
  }, [cantieri, search, sort, status])

  const active = cantieri.filter((item) => item.stato === 'attivo').length
  const waiting = cantieri.filter((item) => item.stato === 'da-verificare').length
  const delayed = documents.filter((item) => item.statoVerifica === 'Possibile duplicato' || item.statoVerifica === 'Incompleto').length
  const totalCost = cantieri.reduce((sum, item) => sum + item.spese, 0)
  const featured = filteredCantieri[0] ?? cantieri[0]
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredCantieri.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedCantieri = filteredCantieri.slice(pageStart, pageStart + pageSize)

  return (
    <>
      <DashboardHeader
        eyebrow="Cantieri reali"
        title="Gestione cantieri"
        description="Elenco generato dai dati Supabase importati da BARCELO_ROMA_master."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
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
            placeholder="Cantiere, località..."
          />
        </label>
        <label>
          Stato
          <select value={status} onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}>
            <option value="tutti">Tutti gli stati</option>
            <option value="attivo">In corso</option>
            <option value="da-verificare">Da verificare</option>
          </select>
        </label>
        <label>
          Ordina
          <select value={sort} onChange={(event) => {
            setSort(event.target.value)
            setPage(1)
          }}>
            <option value="spese-desc">Spese alte</option>
            <option value="spese-asc">Spese basse</option>
            <option value="movimenti-desc">Più movimenti</option>
            <option value="nome">Nome</option>
          </select>
        </label>
      </section>

      <section className="stats-grid hub-kpi-grid">
        <StatCard icon="building" label="Cantieri reali" value={cantieri.length} hint="Da Supabase" />
        <StatCard icon="calendar" tone="amber" label="In corso" value={active} hint="Dati importati" />
        <StatCard icon="warning" tone="red" label="Da controllare" value={delayed} hint="Incompleti o duplicati" />
        <StatCard icon="wallet" tone="green" label="Totale spese" value={<MoneyValue value={totalCost} />} hint="BARCELO_ROMA_master" />
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
                  <span>Nome cantiere</span><span>Località</span><span>Origine</span><span>Stato</span><span>Avanzamento</span><span>Movimenti</span><span>Spese</span><span>Responsabile</span><span>Ultimo agg.</span>
                </div>
                {paginatedCantieri.map((cantiere) => (
                  <a className="hub-table-row cantieri-data-row" href={`#/dashboard/cantieri/${cantiere.id}`} key={cantiere.id}>
                    <strong>{cantiere.nome}</strong>
                    <span>{cantiere.localita}</span>
                    <span>Google Sheets</span>
                    <StatusBadge>{displaySiteStatus(cantiere)}</StatusBadge>
                    <ProgressBar value={cantiere.avanzamento} />
                    <span>{cantiere.movimenti}</span>
                    <span><MoneyValue value={cantiere.spese} /></span>
                    <span>{cantiere.responsabile}</span>
                    <span>{formatDate(cantiere.lastDate)}</span>
                  </a>
                ))}
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
              <p>Modifica ricerca o filtro stato.</p>
            </section>
          )}
        </section>

        <aside className="cantieri-side-stack">
          {featured ? <FeaturedSite cantiere={featured} /> : null}
          <section className="internal-panel">
            <div className="section-heading panel-title-row">
              <h2>Righe principali</h2>
              <a className="button button-secondary button-small" href="#/dashboard/documenti">Documenti</a>
            </div>
            <div className="activity-feed">
              {documents.slice(0, 4).map((item) => (
                <article className="activity-item" key={item.id}>
                  <span />
                  <div><strong>{item.numeroDocumento ?? item.descrizione}</strong><small>{item.categoria}</small></div>
                  <StatusBadge>{item.statoVerifica}</StatusBadge>
                </article>
              ))}
            </div>
          </section>
          <section className="internal-panel">
            <div className="section-heading panel-title-row"><h2>Azioni rapide</h2></div>
            <div className="quick-actions-grid quick-actions-compact">
              <a className="quick-action-card" href="#/dashboard/report"><strong>Report cantiere</strong><span>Apri</span></a>
              <a className="quick-action-card" href="#/dashboard/documenti"><strong>Documenti</strong><span>Vedi</span></a>
            </div>
          </section>
        </aside>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function FeaturedSite({ cantiere }) {
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
        <div><dt>Movimenti</dt><dd>{cantiere.movimenti}</dd></div>
        <div><dt>Spese</dt><dd><MoneyValue value={cantiere.spese} /></dd></div>
        <div><dt>Ultimo aggiornamento</dt><dd>{formatDate(cantiere.lastDate)}</dd></div>
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

function buildCantieriFromDocuments(documents) {
  const groups = documents.reduce((acc, document) => {
    const id = document.cantiereId ?? 'barcelo-roma'
    const name = document.cantiere ?? 'Barcelò Roma'
    if (!acc[id]) {
      acc[id] = {
        id,
        nome: name,
        localita: id === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da Google Sheets',
        stato: 'attivo',
        responsabile: 'Gianni Europa',
        spese: 0,
        movimenti: 0,
        lastDate: document.dataDocumento,
      }
    }
    acc[id].spese += Number(document.totale || document.importoTotale || 0)
    acc[id].movimenti += Number(document.movimentiCount || 1)
    if (document.dataDocumento && new Date(document.dataDocumento) > new Date(acc[id].lastDate || 0)) {
      acc[id].lastDate = document.dataDocumento
    }
    return acc
  }, {})

  const sites = Object.values(groups)
  const maxTotal = Math.max(...sites.map((site) => site.spese), 1)
  return sites.map((site) => ({
    ...site,
    avanzamento: Math.max(5, Math.round((site.spese / maxTotal) * 100)),
  }))
}

function displaySiteStatus(cantiere) {
  if (cantiere.stato === 'attivo') return 'In corso'
  return cantiere.stato
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
