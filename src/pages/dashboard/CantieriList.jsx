import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

export function CantieriList({ documents = [] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('tutti')
  const [sort, setSort] = useState('spese-desc')
  const [page, setPage] = useState(1)
  const [selectedCantiereId, setSelectedCantiereId] = useState(null)
  const [modalAction, setModalAction] = useState(null)
  const cantieri = useMemo(() => buildCantieriFromDocuments(documents), [documents])

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cantieri
      .filter((cantiere) => {
        const matchesSearch =
          normalizedSearch === '' ||
          cantiere.nome.toLowerCase().includes(normalizedSearch) ||
          cantiere.localita.toLowerCase().includes(normalizedSearch) ||
          cantiere.responsabile.toLowerCase().includes(normalizedSearch)
        const matchesStatus = status === 'tutti' || cantiere.stato === status
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sort === 'spese-desc') return b.spese - a.spese
        if (sort === 'spese-asc') return a.spese - b.spese
        if (sort === 'movimenti-desc') return b.movimenti - a.movimenti
        if (sort === 'criticita-desc') return b.criticita - a.criticita
        if (sort === 'aggiornamento-desc') return new Date(b.lastDate || 0) - new Date(a.lastDate || 0)
        if (sort === 'nome') return a.nome.localeCompare(b.nome)
        return b.avanzamento - a.avanzamento
      })
  }, [cantieri, search, sort, status])

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredCantieri.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedCantieri = filteredCantieri.slice(pageStart, pageStart + pageSize)
  const selectedCantiere = filteredCantieri.find((item) => item.id === selectedCantiereId) ?? filteredCantieri[0] ?? cantieri[0]
  const selectedDocuments = selectedCantiere ? documents.filter((item) => (item.cantiereId ?? 'barcelo-roma') === selectedCantiere.id) : []
  const criticalDocuments = documents.filter(isCriticalDocument)
  const totalCost = cantieri.reduce((sum, item) => sum + item.spese, 0)
  const active = cantieri.filter((item) => item.stato === 'attivo').length
  const toReview = cantieri.filter((item) => item.stato === 'da-verificare').length
  const averageCost = cantieri.length ? totalCost / cantieri.length : 0

  function updateSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function updateStatus(value) {
    setStatus(value)
    setPage(1)
  }

  function updateSort(value) {
    setSort(value)
    setPage(1)
  }

  function selectCantiere(id) {
    setSelectedCantiereId(id)
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Cantieri reali"
        title="Gestione cantieri"
        description="Vista operativa compatta: prima trovi il cantiere, poi vedi subito costi, criticità, documenti e azioni collegate."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => setModalAction(mockActions.newSite)}
        >
          <InternalIcon name="plus" size={16} />
          Nuovo cantiere
        </button>
      </DashboardHeader>

      <section className="cantieri-command-center" aria-label="Controllo cantieri">
        <div className="cantieri-search-card">
          <div>
            <span className="eyebrow">Ricerca e priorità</span>
            <h2>Trova il cantiere da lavorare</h2>
            <p>Filtri messi in alto perché decidono cosa mostrare nella lista e nel pannello laterale.</p>
          </div>
          <label className="cantieri-search-input">
            <InternalIcon name="search" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Cerca per nome, zona o responsabile..."
            />
          </label>
          <div className="cantieri-segmented" aria-label="Filtro stato">
            <button type="button" aria-pressed={status === 'tutti'} onClick={() => updateStatus('tutti')}>Tutti</button>
            <button type="button" aria-pressed={status === 'attivo'} onClick={() => updateStatus('attivo')}>In corso</button>
            <button type="button" aria-pressed={status === 'da-verificare'} onClick={() => updateStatus('da-verificare')}>Da controllare</button>
          </div>
        </div>

        <div className="cantieri-sort-card">
          <label>
            Ordina elenco
            <select value={sort} onChange={(event) => updateSort(event.target.value)}>
              <option value="spese-desc">Spese più alte</option>
              <option value="spese-asc">Spese più basse</option>
              <option value="criticita-desc">Più criticità</option>
              <option value="movimenti-desc">Più movimenti</option>
              <option value="aggiornamento-desc">Ultimo aggiornamento</option>
              <option value="nome">Nome A-Z</option>
            </select>
          </label>
          <div className="cantieri-filter-result">
            <strong>{filteredCantieri.length}</strong>
            <span>cantieri mostrati</span>
          </div>
        </div>
      </section>

      <section className="cantieri-overview-strip" aria-label="Indicatori cantieri">
        <CantiereMetric icon="building" label="Cantieri" value={cantieri.length} hint={`${active} in corso`} />
        <CantiereMetric icon="warning" tone="amber" label="Da controllare" value={toReview} hint={`${criticalDocuments.length} documenti critici`} />
        <CantiereMetric icon="wallet" tone="green" label="Totale spese" value={<MoneyValue value={totalCost} />} hint="Somma cantieri" />
        <CantiereMetric icon="report" tone="purple" label="Media cantiere" value={<MoneyValue value={averageCost} />} hint="Costo medio" />
      </section>

      <div className="cantieri-redesign-layout">
        <section className="internal-panel cantieri-master-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Elenco operativo</h2>
              <p>Lista principale a sinistra: è il punto da cui scegli il cantiere e confronti costi, stato e aggiornamenti.</p>
            </div>
            <span className="data-mode-badge">{getSortLabel(sort)}</span>
          </div>

          {filteredCantieri.length > 0 ? (
            <>
              <div className="cantieri-card-list">
                {paginatedCantieri.map((cantiere) => (
                  <CantiereRow
                    cantiere={cantiere}
                    isSelected={selectedCantiere?.id === cantiere.id}
                    key={cantiere.id}
                    onSelect={selectCantiere}
                  />
                ))}
              </div>
              <div className="pagination-bar cantieri-pagination">
                <span>
                  {pageStart + 1} - {Math.min(pageStart + pageSize, filteredCantieri.length)} di {filteredCantieri.length}
                </span>
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
              <p>Modifica ricerca, stato o ordinamento per visualizzare altri cantieri.</p>
            </section>
          )}
        </section>

        <aside className="cantieri-context-column">
          {selectedCantiere ? (
            <SelectedSitePanel cantiere={selectedCantiere} documents={selectedDocuments} />
          ) : null}
          <CriticalDocumentsPanel documents={criticalDocuments} />
          <section className="internal-panel cantieri-action-panel">
            <div className="section-heading panel-title-row"><h2>Azioni vicine al contesto</h2></div>
            <p>Azioni posizionate accanto al dettaglio cantiere: quando scegli un cantiere hai già qui documenti, report e contabilità.</p>
            <div className="cantieri-action-grid">
              <a className="quick-action-card" href={selectedCantiere ? `#/dashboard/cantieri/${selectedCantiere.id}` : '#/dashboard/cantieri'}>
                <InternalIcon name="building" size={18} />
                <strong>Apri dettaglio</strong>
                <span>Cantiere</span>
              </a>
              <a className="quick-action-card" href="#/dashboard/documenti">
                <InternalIcon name="file" size={18} />
                <strong>Documenti</strong>
                <span>Verifica</span>
              </a>
              <a className="quick-action-card" href="#/dashboard/contabilita">
                <InternalIcon name="wallet" size={18} />
                <strong>Contabilità</strong>
                <span>Costi</span>
              </a>
              <a className="quick-action-card" href="#/dashboard/report">
                <InternalIcon name="report" size={18} />
                <strong>Report</strong>
                <span>Riepilogo</span>
              </a>
            </div>
          </section>
        </aside>
      </div>

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

const mockActions = {
  newSite: {
    icon: 'building',
    title: 'Nuovo cantiere',
    text: 'Prepara un nuovo cantiere da collegare a documenti, contabilità e report.',
    confirmLabel: 'Crea bozza',
    fields: [
      { label: 'Nome cantiere', placeholder: 'Es. Barcelò Roma - Fase 2' },
      { label: 'Località', placeholder: 'Es. Roma' },
    ],
  },
}

function CantiereMetric({ icon, label, value, hint, tone = 'blue' }) {
  return (
    <article className={`cantieri-metric cantieri-metric-${tone}`}>
      <span><InternalIcon name={icon} size={17} /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{hint}</em>
      </div>
    </article>
  )
}

function CantiereRow({ cantiere, isSelected, onSelect }) {
  return (
    <article className={isSelected ? 'cantiere-row-card selected' : 'cantiere-row-card'}>
      <button type="button" onClick={() => onSelect(cantiere.id)}>
        <div className="cantiere-row-main">
          <div>
            <strong>{cantiere.nome}</strong>
            <small>{cantiere.localita} · {cantiere.responsabile}</small>
          </div>
          <StatusBadge>{displaySiteStatus(cantiere)}</StatusBadge>
        </div>
        <div className="cantiere-row-stats">
          <span><b><MoneyValue value={cantiere.spese} /></b><small>Spese</small></span>
          <span><b>{cantiere.movimenti}</b><small>Movimenti</small></span>
          <span><b>{cantiere.criticita}</b><small>Criticità</small></span>
          <span><b>{formatDate(cantiere.lastDate)}</b><small>Aggiornato</small></span>
        </div>
        <ProgressBar value={cantiere.avanzamento} />
      </button>
      <a className="button button-secondary button-small" href={`#/dashboard/cantieri/${cantiere.id}`}>Apri</a>
    </article>
  )
}

function SelectedSitePanel({ cantiere, documents }) {
  const categoryPreview = getCategoryPreview(documents)

  return (
    <section className="internal-panel selected-cantiere-panel">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Cantiere selezionato</h2>
          <p>Pannello a destra perché cambia in base alla riga scelta e tiene le azioni vicine al contesto.</p>
        </div>
        <a className="button button-secondary button-small" href={`#/dashboard/cantieri/${cantiere.id}`}>Dettaglio</a>
      </div>
      <div className="selected-site-hero">
        <span className="site-avatar">ES</span>
        <div>
          <strong>{cantiere.nome}</strong>
          <small>{cantiere.localita}</small>
        </div>
      </div>
      <dl className="selected-site-meta">
        <div><dt>Spese</dt><dd><MoneyValue value={cantiere.spese} /></dd></div>
        <div><dt>Movimenti</dt><dd>{cantiere.movimenti}</dd></div>
        <div><dt>Criticità</dt><dd>{cantiere.criticita}</dd></div>
        <div><dt>Ultimo agg.</dt><dd>{formatDate(cantiere.lastDate)}</dd></div>
      </dl>
      <ProgressBar value={cantiere.avanzamento} />
      <div className="selected-category-list">
        {categoryPreview.map((item) => (
          <div key={item.categoria}>
            <span>{item.categoria}</span>
            <strong><MoneyValue value={item.totale} /></strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function CriticalDocumentsPanel({ documents }) {
  return (
    <section className="internal-panel cantieri-critical-panel">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Da controllare</h2>
          <p>Criticità sotto il dettaglio: dopo aver scelto il cantiere sai subito cosa sistemare.</p>
        </div>
        <a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a>
      </div>
      <div className="critical-document-list">
        {documents.length > 0 ? documents.slice(0, 5).map((item) => (
          <a className="critical-document-row" href={`#/dashboard/documenti/${item.id}`} key={item.id}>
            <span className="file-chip file-pdf">DOC</span>
            <div>
              <strong>{item.numeroDocumento ?? item.descrizione}</strong>
              <small>{item.cantiere} · {item.fornitore}</small>
            </div>
            <StatusBadge>{normalizeDocumentStatus(item.statoVerifica)}</StatusBadge>
          </a>
        )) : (
          <article className="critical-document-row empty-critical">
            <span className="file-chip">OK</span>
            <div><strong>Nessuna criticità aperta</strong><small>I documenti importati risultano ordinati.</small></div>
          </article>
        )}
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
        responsabile: 'Gianni Europa',
        spese: 0,
        movimenti: 0,
        criticita: 0,
        lastDate: document.dataDocumento,
      }
    }
    acc[id].spese += Number(document.totale || document.importoTotale || 0)
    acc[id].movimenti += Number(document.movimentiCount || 1)
    if (isCriticalDocument(document)) acc[id].criticita += 1
    if (document.dataDocumento && new Date(document.dataDocumento) > new Date(acc[id].lastDate || 0)) {
      acc[id].lastDate = document.dataDocumento
    }
    return acc
  }, {})

  const sites = Object.values(groups)
  const maxTotal = Math.max(...sites.map((site) => site.spese), 1)
  return sites.map((site) => ({
    ...site,
    stato: site.criticita > 0 ? 'da-verificare' : 'attivo',
    avanzamento: Math.max(5, Math.round((site.spese / maxTotal) * 100)),
  }))
}

function getCategoryPreview(documents) {
  const grouped = documents.reduce((acc, document) => {
    const categoria = document.categoria ?? 'Extra / Altro'
    acc[categoria] = (acc[categoria] ?? 0) + Number(document.totale || document.importoTotale || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([categoria, totale]) => ({ categoria, totale }))
    .sort((a, b) => b.totale - a.totale)
    .slice(0, 4)
}

function isCriticalDocument(document) {
  return ['Possibile duplicato', 'Incompleto', 'Da verificare'].includes(document.statoVerifica)
}

function displaySiteStatus(cantiere) {
  if (cantiere.stato === 'attivo') return 'In corso'
  if (cantiere.stato === 'da-verificare') return 'Da controllare'
  return cantiere.stato
}

function normalizeDocumentStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function getSortLabel(sort) {
  const labels = {
    'spese-desc': 'Spese alte',
    'spese-asc': 'Spese basse',
    'criticita-desc': 'Criticità',
    'movimenti-desc': 'Movimenti',
    'aggiornamento-desc': 'Aggiornamento',
    nome: 'Nome',
  }

  return labels[sort] ?? 'Ordine'
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
