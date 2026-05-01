import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { AlertPanel, DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import { recentWhatsAppUploads } from '../../data/mockHubData'
import { tipiDocumento } from '../../data/mockUploads'

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

  const rows = store.documents
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
      const matchesSearch =
        search === '' ||
        row.fornitore.toLowerCase().includes(search) ||
        row.descrizione.toLowerCase().includes(search) ||
        row.fileName.toLowerCase().includes(search) ||
        row.cantiere.toLowerCase().includes(search)

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
        eyebrow="Documenti mock"
        title="Centro documenti"
        description="Gestisci, verifica e controlla tutta la documentazione aziendale."
      >
        <DataModeBadge />
        <button className="button button-secondary" type="button" onClick={store.resetMockStore}>Reset mock</button>
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
            {mockCantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
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
        <StatCard icon="file" tone="amber" label="Da controllare" value={toCheck.length} hint="+2 rispetto alla settimana scorsa" />
        <StatCard icon="check" tone="green" label="Verificati" value={verified.length} hint="+10 rispetto alla settimana scorsa" />
        <StatCard icon="inbox" label="In attesa" value={incomplete.length} hint="Stabile rispetto alla settimana scorsa" />
        <StatCard icon="warning" tone="red" label="Duplicati" value={duplicates.length} hint="+2 rispetto alla settimana scorsa" />
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

      <div className="document-center-layout">
        <section className="accounting-section document-table-panel">
          <div className="section-heading panel-title-row">
            <h2>Tutti i documenti ({filteredRows.length})</h2>
            <span className="data-mode-badge"><MoneyValue value={totalAmount} /></span>
          </div>
          {filteredRows.length > 0 ? (
            <>
              <div className="hub-table document-data-table">
                <div className="hub-table-head document-data-row">
                  <span>Documento</span><span>Tipo</span><span>Fornitore</span><span>Cantiere</span><span>Data</span><span>Importo</span><span>Stato</span><span>Azioni</span>
                </div>
                {paginatedRows.map((row) => (
                  <div
                    className={`hub-table-row document-data-row ${selectedDocument?.id === row.id ? 'selected' : ''} ${hasAmountWarning(row) ? 'validation-warning-row' : ''}`}
                    key={row.id}
                  >
                    <button className="document-row-select" type="button" onClick={() => setSelectedId(row.id)}>
                      <strong>{row.fileName}</strong>
                      <span>{row.tipoDocumento}</span>
                      <span>{row.fornitore}</span>
                      <span>{row.cantiere}</span>
                      <span>{formatDate(row.dataDocumento)}</span>
                      <span><MoneyValue value={row.totale} /></span>
                      <StatusBadge>{displayStatus(row.statoVerifica)}</StatusBadge>
                    </button>
                    <button
                      className="row-menu"
                      type="button"
                      aria-label={`Azioni per ${row.fileName}`}
                      onClick={() => {
                        setSelectedId(row.id)
                        setModalAction({
                          icon: 'more',
                          title: `Azioni documento`,
                          text: `${row.fileName}: scegli un'azione rapida mock dal pannello laterale o apri il dettaglio completo.`,
                          confirmLabel: 'Ok',
                        })
                      }}
                    >
                      <InternalIcon name="more" size={17} />
                    </button>
                  </div>
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
              Modifica cantiere, tipo, stato o ricerca per visualizzare altri documenti mock.
            </EmptyState>
          )}
        </section>

        {selectedDocument ? <DocumentPreviewPanel document={selectedDocument} canEdit={canEdit} store={store} /> : null}
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Caricamenti recenti da WhatsApp</h2><a className="button button-secondary button-small" href="#/dashboard/caricamenti">Vedi tutti</a></div>
          <div className="compact-upload-list">
            {recentWhatsAppUploads.map((upload) => (
              <article className="compact-upload-row" key={upload.id}>
                <span className={`file-chip file-${upload.type}`}>{upload.type === 'pdf' ? 'PDF' : 'IMG'}</span>
                <div><strong>{upload.fileName}</strong><small>{upload.cantiere}</small></div>
                <StatusBadge>{upload.status}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <h2>Attività e cronologia</h2>
            <button
              className="button button-secondary button-small"
              type="button"
              onClick={() => setModalAction({
                icon: 'report',
                title: 'Cronologia completa mock',
                text: 'La cronologia completa sarà collegata al backend. Per ora le attività visibili sono generate dai dati mock locali.',
                confirmLabel: 'Ho capito',
              })}
            >
              Vedi tutte
            </button>
          </div>
          <div className="activity-feed">
            {filteredRows.slice(0, 5).map((row) => (
              <a className="activity-item interactive-row" href={`#/dashboard/documenti/${row.id}`} key={`activity-${row.id}`}>
                <span />
                <div><strong>{row.fornitore} ha caricato {row.fileName}</strong><small>{row.cantiere} · {formatDate(row.dataDocumento)}</small></div>
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
            title: 'Assegna tab mock',
            text: 'Assegna il documento a una categoria dimostrativa per preparare il futuro workflow documentale.',
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

function displayStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function hasAmountWarning(row) {
  return Number(row.imponibile || 0) + Number(row.iva || 0) !== Number(row.totale || 0) && row.tipoDocumento !== 'Bonifico'
}
