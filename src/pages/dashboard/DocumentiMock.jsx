import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { AlertPanel, DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'

const tipiDocumentoFallback = ['Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Scontrino', 'Riepilogo tab', 'Altro']

export function DocumentiMock({ session, store }) {
  const [selectedId, setSelectedId] = useState(store.documents[0]?.id ?? null)
  const [page, setPage] = useState(1)
  const [modalAction, setModalAction] = useState(null)
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    tipoDocumento: 'tutti',
    stato: 'tutti',
    quick: 'tutti',
    search: '',
  })

  const rows = store.documents ?? []
  const cantieri = useMemo(() => getCantieriFromRows(rows), [rows])
  const tipiDocumento = useMemo(() => {
    const realTypes = [...new Set(rows.map((row) => row.tipoDocumento).filter(Boolean))]
    return realTypes.length ? realTypes : tipiDocumentoFallback
  }, [rows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return rows.filter((row) => {
      const status = row.statoVerifica
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesType = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesStatus = filters.stato === 'tutti' || status === filters.stato
      const matchesQuick =
        filters.quick === 'tutti' ||
        (filters.quick === 'da-verificare' && status === 'Da verificare') ||
        (filters.quick === 'duplicati' && status === 'Possibile duplicato') ||
        (filters.quick === 'incompleti' && status === 'Incompleto')
      const haystack = [row.fornitore, row.descrizione, row.fileName, row.numeroDocumento, row.cantiere, row.categoria]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesSearch = search === '' || haystack.includes(search)

      return matchesCantiere && matchesType && matchesStatus && matchesQuick && matchesSearch
    })
  }, [filters, rows])

  const toCheck = rows.filter((row) => row.statoVerifica === 'Da verificare')
  const verified = rows.filter((row) => ['Verificato', 'Confermato'].includes(row.statoVerifica))
  const incomplete = rows.filter((row) => row.statoVerifica === 'Incompleto')
  const duplicates = rows.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.totale || 0), 0)
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const selectedDocument = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? rows[0]
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize)

  function updateFilter(field, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Documenti reali"
        title="Centro documenti"
        description="Dati letti da Supabase, importati da BARCELO_ROMA_master."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-primary" href="#/dashboard/upload">Carica documento</a>
      </DashboardHeader>

      <section className="cantieri-tools document-filters" aria-label="Filtri documenti">
        <label className="accounting-search">
          Cerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Documento, fornitore, cantiere..."
          />
        </label>
        <label>
          Tipo documento
          <select value={filters.tipoDocumento} onChange={(event) => updateFilter('tipoDocumento', event.target.value)}>
            <option value="tutti">Tutti</option>
            {tipiDocumento.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </label>
        <label>
          Stato
          <select value={filters.stato} onChange={(event) => updateFilter('stato', event.target.value)}>
            <option value="tutti">Tutti</option>
            {store.documentStatuses.map((stato) => <option key={stato} value={stato}>{stato}</option>)}
          </select>
        </label>
        <label>
          Cantiere
          <select value={filters.cantiereId} onChange={(event) => updateFilter('cantiereId', event.target.value)}>
            <option value="tutti">Tutti</option>
            {cantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
          </select>
        </label>
        <label>
          Filtro rapido
          <select value={filters.quick} onChange={(event) => updateFilter('quick', event.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="da-verificare">Da verificare</option>
            <option value="duplicati">Possibili duplicati</option>
            <option value="incompleti">Incompleti</option>
          </select>
        </label>
      </section>

      <section className="stats-grid hub-kpi-grid">
        <StatCard icon="file" tone="amber" label="Da controllare" value={toCheck.length} hint="Dati reali" />
        <StatCard icon="check" tone="green" label="Confermati" value={verified.length} hint="Dati reali" />
        <StatCard icon="inbox" label="In attesa" value={incomplete.length} hint="Dati reali" />
        <StatCard icon="warning" tone="red" label="Duplicati" value={duplicates.length} hint="Dati reali" />
      </section>

      <AlertPanel
        title="Documenti da controllare"
        alerts={[...toCheck, ...incomplete, ...duplicates].slice(0, 8).map((row) => ({
          id: row.id,
          title: `${row.tipoDocumento}: ${row.descrizione}`,
          meta: `${row.cantiere} · ${row.fornitore}`,
          status: displayStatus(row.statoVerifica),
          href: `#/dashboard/documenti/${row.id}`,
        }))}
      />

      <div className="document-center-layout document-page-fixed">
        <section className="accounting-section document-table-panel document-list-panel">
          <div className="section-heading panel-title-row">
            <h2>Tutti i documenti ({filteredRows.length})</h2>
            <span className="data-mode-badge"><MoneyValue value={totalAmount} /></span>
          </div>
          {filteredRows.length > 0 ? (
            <>
              <div className="document-card-list">
                {paginatedRows.map((row) => (
                  <article
                    className={`document-card-row ${selectedDocument?.id === row.id ? 'selected' : ''} ${hasAmountWarning(row) ? 'validation-warning-row' : ''}`}
                    key={row.id}
                  >
                    <button className="document-card-main" type="button" onClick={() => setSelectedId(row.id)}>
                      <div className="document-card-titleline">
                        <strong>{row.numeroDocumento ?? row.fileName}</strong>
                        <StatusBadge>{displayStatus(row.statoVerifica)}</StatusBadge>
                      </div>
                      <p>{row.descrizione}</p>
                      <div className="document-card-meta">
                        <span><b>Tipo</b>{row.tipoDocumento}</span>
                        <span><b>Fornitore</b>{row.fornitore}</span>
                        <span><b>Cantiere</b>{row.cantiere}</span>
                        <span><b>Data</b>{formatDate(row.dataDocumento)}</span>
                        <span><b>Importo</b><MoneyValue value={row.totale} /></span>
                      </div>
                    </button>
                    <button
                      className="row-menu document-card-menu"
                      type="button"
                      aria-label={`Azioni per ${row.numeroDocumento ?? row.fileName}`}
                      onClick={() => {
                        setSelectedId(row.id)
                        setModalAction({
                          icon: 'more',
                          title: 'Azioni documento',
                          text: `${row.numeroDocumento ?? row.fileName}: scegli un'azione rapida dal pannello laterale o apri il dettaglio completo.`,
                          confirmLabel: 'Ok',
                        })
                      }}
                    >
                      <InternalIcon name="more" size={17} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="pagination-bar">
                <span>
                  Mostra {pageStart + 1} - {Math.min(pageStart + pageSize, filteredRows.length)} di {filteredRows.length}
                </span>
                <div>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      aria-current={currentPage === pageNumber ? 'page' : undefined}
                      type="button"
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState title="Nessun documento trovato">
              Modifica cantiere, tipo, stato o ricerca per visualizzare altri documenti reali.
            </EmptyState>
          )}
        </section>

        {selectedDocument ? <DocumentPreviewPanel document={selectedDocument} canEdit={canEdit} store={store} /> : null}
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Righe Google Sheets importate</h2><a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi contabilità</a></div>
          <div className="compact-upload-list">
            {rows.slice(0, 5).map((row) => (
              <article className="compact-upload-row" key={`recent-${row.id}`}>
                <span className="file-chip file-pdf">TAB</span>
                <div><strong>{row.numeroDocumento ?? row.descrizione}</strong><small>{row.cantiere}</small></div>
                <StatusBadge>{displayStatus(row.statoVerifica)}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <h2>Attività e cronologia</h2>
          </div>
          <div className="activity-feed">
            {filteredRows.slice(0, 5).map((row) => (
              <a className="activity-item interactive-row" href={`#/dashboard/documenti/${row.id}`} key={`activity-${row.id}`}>
                <span />
                <div><strong>{row.fornitore} · {row.numeroDocumento ?? row.fileName}</strong><small>{row.cantiere} · {formatDate(row.dataDocumento)}</small></div>
                <StatusBadge>{displayStatus(row.statoVerifica)}</StatusBadge>
              </a>
            ))}
          </div>
        </section>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function DocumentPreviewPanel({ document, canEdit, store }) {
  const [modalAction, setModalAction] = useState(null)

  return (
    <aside className="document-preview-panel">
      <div className="section-heading panel-title-row">
        <h2>Anteprima documento</h2>
        <a className="text-link" href={`#/dashboard/documenti/${document.id}`}>Apri</a>
      </div>
      <div className="document-preview-sheet">
        <strong>{document.tipoDocumento}</strong>
        <span>n. {document.numeroDocumento ?? document.id} del {formatDate(document.dataDocumento)}</span>
        <div className="invoice-lines">
          <span>Descrizione</span><span>Q.ta</span><span>Importo</span>
          <strong>{document.descrizione}</strong><span>1</span><strong><MoneyValue value={document.totale} /></strong>
        </div>
      </div>
      <section className="extracted-data">
        <h3>Dati estratti</h3>
        <dl className="detail-list">
          <div><dt>Fornitore</dt><dd>{document.fornitore}</dd></div>
          <div><dt>Cantiere</dt><dd>{document.cantiere}</dd></div>
          <div><dt>Data documento</dt><dd>{formatDate(document.dataDocumento)}</dd></div>
          <div><dt>Numero</dt><dd>{document.numeroDocumento ?? '-'}</dd></div>
          <div><dt>Importo totale</dt><dd><MoneyValue value={document.totale} /></dd></div>
          <div><dt>IVA</dt><dd><MoneyValue value={document.iva} /></dd></div>
        </dl>
      </section>
      <section className="document-actions-panel">
        <h3>Azioni rapide</h3>
        <button className="button button-success" type="button" disabled={!canEdit} onClick={() => store.markDocumentChecked(document.id)}>Approva e verifica</button>
        <a className="button button-secondary" href="#/dashboard/contabilita">Collega a spesa</a>
        <button className="button button-secondary warning-action" type="button" disabled={!canEdit} onClick={() => store.markDocumentDuplicate(document.id)}>Segnala duplicato</button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setModalAction({
            icon: 'tag',
            title: 'Assegna tab',
            text: 'Assegna il documento a una categoria contabile.',
            confirmLabel: 'Assegna tab',
            fields: [{ label: 'Tab', type: 'select', options: ['Fatture fornitori', 'Bonifici', 'FIR rifiuti', 'SAL'] }],
          })}
        >
          Assegna tab
        </button>
      </section>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </aside>
  )
}

function getCantieriFromRows(rows) {
  const map = new Map()
  rows.forEach((row) => {
    if (!row.cantiereId) return
    map.set(row.cantiereId, { id: row.cantiereId, nome: row.cantiere ?? row.cantiereId })
  })
  return [...map.values()]
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function displayStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function hasAmountWarning(row) {
  const imponibile = Number(row.imponibile || 0)
  const iva = Number(row.iva || 0)
  const totale = Number(row.totale || 0)
  if (row.tipoDocumento === 'Bonifico') return false
  if (!imponibile && !iva) return false
  return Math.abs((imponibile + iva) - totale) > 0.01
}
