import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  MobileActionMenu,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { buildOperationalCantiereOptions } from '../../lib/cantiereOptions'
import { getOfficialMasterTotals, preferOfficialTotals } from '../../lib/masterTotals'
import { formatMasterSheetLabel, getMasterSheetSummary, mergeMasterSheetOptions } from '../../lib/masterSheets'

const tipiDocumentoFallback = ['Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Scontrino', 'Riepilogo tab', 'Altro']
const qualitaFallback = ['Pulito', 'Da verificare', 'Da controllare']

export function DocumentiMock({ session, store }) {
  const [selectedId, setSelectedId] = useState(store.documents[0]?.id ?? null)
  const [page, setPage] = useState(1)
  const [modalAction, setModalAction] = useState(null)
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    tipoDocumento: 'tutti',
    lavorazione: 'tutte',
    sheetTab: 'tutti',
    qualitaDati: 'tutte',
    stato: 'tutti',
    quick: 'tutti',
    search: '',
  })

  const rows = useMemo(() => (store.documents ?? []).map(normalizeDocumentRow), [store.documents])
  const cantieri = useMemo(() => buildOperationalCantiereOptions({ store, rows }), [store?.cantieri, store?.documents, store?.movements, rows])
  const officialMaster = getOfficialMasterTotals(store)
  const masterSummary = useMemo(() => getMasterSheetSummary(store), [store?.masterSheets])
  const tipiDocumento = useMemo(() => buildUniqueOptions(rows, 'tipoDocumento', tipiDocumentoFallback), [rows])
  const lavorazioni = useMemo(() => buildUniqueOptions(rows, 'lavorazione', []), [rows])
  const tabOptions = useMemo(() => mergeMasterSheetOptions(store, buildUniqueOptions(rows, 'sheetTab', []), { operationalOnly: true }), [rows, store?.masterSheets])
  const qualitaOptions = useMemo(() => buildUniqueOptions(rows, 'qualitaDati', qualitaFallback), [rows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return rows.filter((row) => {
      const status = row.statoVerifica
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesType = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesLavorazione = filters.lavorazione === 'tutte' || row.lavorazione === filters.lavorazione
      const matchesTab = filters.sheetTab === 'tutti' || row.sheetTab === filters.sheetTab
      const matchesQualita = filters.qualitaDati === 'tutte' || row.qualitaDati === filters.qualitaDati
      const matchesStatus = filters.stato === 'tutti' || status === filters.stato
      const matchesQuick =
        filters.quick === 'tutti' ||
        (filters.quick === 'da-verificare' && (status === 'Da verificare' || row.qualitaDati === 'Da verificare')) ||
        (filters.quick === 'duplicati' && status === 'Possibile duplicato') ||
        (filters.quick === 'incompleti' && status === 'Incompleto') ||
        (filters.quick === 'scarti' && row.controlloMatematico === 'Scarto da verificare') ||
        (filters.quick === 'da-collegare' && row.statoCollegamento === 'Da collegare')
      const haystack = [
        row.fornitore,
        row.descrizione,
        row.fileName,
        row.numeroDocumento,
        row.cantiere,
        row.categoria,
        row.categoriaOriginale,
        row.lavorazione,
        row.sheetTab,
        row.qualitaDati,
        row.controlloMatematico,
        row.dataQualityNote,
      ].filter(Boolean).join(' ').toLowerCase()
      const matchesSearch = search === '' || haystack.includes(search)

      return matchesCantiere && matchesType && matchesLavorazione && matchesTab && matchesQualita && matchesStatus && matchesQuick && matchesSearch
    })
  }, [filters, rows])

  const toCheck = rows.filter((row) => row.statoVerifica === 'Da verificare' || row.qualitaDati === 'Da verificare')
  const verified = rows.filter((row) => ['Verificato', 'Confermato'].includes(row.statoVerifica) || row.qualitaDati === 'Pulito')
  const incomplete = rows.filter((row) => row.statoVerifica === 'Incompleto')
  const duplicates = rows.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const qualityWarnings = rows.filter((row) => row.qualitaDati === 'Da verificare' || row.controlloMatematico === 'Scarto da verificare' || row.statoCollegamento === 'Da collegare')
  const filteredTotals = getDocumentTotals(filteredRows)
  const allRowsSelected = isAllDocumentFilters(filters)
  const displayedTotals = allRowsSelected ? preferOfficialTotals(store, filteredTotals) : filteredTotals
  const displayedTotalLabel = allRowsSelected && officialMaster ? 'Totale ufficiale master' : 'Totale filtrato operativo'
  const displayedTotalHint = allRowsSelected && officialMaster ? 'Da Google Sheets' : 'Somma documenti filtrati'
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const selectedDocument = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0] ?? rows[0]
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedRows = filteredRows.slice(pageStart, pageStart + pageSize)
  const priorityRows = [...toCheck, ...incomplete, ...duplicates].slice(0, 8)

  function updateFilter(field, value) {
    setPage(1)
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Documenti reali"
        title="Centro documenti"
        description="Documenti, lavorazioni e tab origine usano il catalogo completo del master, non solo i tab con righe importate."
      >
        <DataModeBadge>{officialMaster ? 'Totali master' : 'Dati reali Supabase'}</DataModeBadge>
        {canEdit ? <a className="button button-secondary button-small" href="#/dashboard/drive-documenti">Automazione Drive</a> : null}
        <a className="button button-primary button-small" href="#/dashboard/upload">Carica documento</a>
      </DashboardHeader>

      <MasterSheetKpis summary={masterSummary} />

      {allRowsSelected && officialMaster ? (
        <section className="accounting-alert success-alert master-source-alert">
          <strong>Totale economico ufficiale dal master Google Sheets</strong>
          <p>Il totale principale coincide con il tab Riepilogo. Le righe documento restano il dettaglio operativo e possono avere una somma diversa.</p>
        </section>
      ) : null}

      <FilterGrid ariaLabel="Filtri documenti">
        <label className="accounting-search">
          Cerca
          <input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Documento, fornitore, lavorazione, tab, qualità..." />
        </label>
        <label>Tipo documento<select value={filters.tipoDocumento} onChange={(event) => updateFilter('tipoDocumento', event.target.value)}><option value="tutti">Tutti</option>{tipiDocumento.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}</select></label>
        <label>Lavorazione / voce<select value={filters.lavorazione} onChange={(event) => updateFilter('lavorazione', event.target.value)}><option value="tutte">Tutte</option>{lavorazioni.map((lavorazione) => <option key={lavorazione} value={lavorazione}>{formatMasterSheetLabel(lavorazione)}</option>)}</select></label>
        <label>Tab origine<select value={filters.sheetTab} onChange={(event) => updateFilter('sheetTab', event.target.value)}><option value="tutti">Tutti i tab operativi</option>{tabOptions.map((tab) => <option key={tab.value} value={tab.value}>{tab.label}</option>)}</select></label>
        <label>Qualità dati<select value={filters.qualitaDati} onChange={(event) => updateFilter('qualitaDati', event.target.value)}><option value="tutte">Tutte</option>{qualitaOptions.map((qualita) => <option key={qualita} value={qualita}>{qualita}</option>)}</select></label>
        <label>Stato<select value={filters.stato} onChange={(event) => updateFilter('stato', event.target.value)}><option value="tutti">Tutti</option>{(store.documentStatuses ?? []).map((stato) => <option key={stato} value={stato}>{stato}</option>)}</select></label>
        <label>Cantiere<select value={filters.cantiereId} onChange={(event) => updateFilter('cantiereId', event.target.value)}><option value="tutti">Tutti</option>{cantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}</select></label>
        <label>Filtro rapido<select value={filters.quick} onChange={(event) => updateFilter('quick', event.target.value)}><option value="tutti">Tutti</option><option value="da-verificare">Da verificare</option><option value="duplicati">Possibili duplicati</option><option value="incompleti">Incompleti</option><option value="scarti">Scarti matematici</option><option value="da-collegare">Da collegare</option></select></label>
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori documenti">
        <KpiCard icon="file" label="Documenti filtrati" value={filteredRows.length} hint={`${rows.length} totali`} />
        <KpiCard icon="warning" tone="amber" label="Da controllare" value={toCheck.length} hint="Verifica aperta" />
        <KpiCard icon="check" tone="green" label="Puliti / confermati" value={verified.length} hint="Qualità dati" />
        <KpiCard icon="warning" tone="red" label="Duplicati" value={duplicates.length} hint={`${incomplete.length} incompleti`} />
      </KpiStrip>
      <KpiStrip className="document-operational-kpis" ariaLabel="Indicatori economici documenti">
        <KpiCard icon="wallet" tone="green" label={displayedTotalLabel} value={<MoneyValue value={displayedTotals.totale} />} hint={displayedTotalHint} />
        <KpiCard icon="report" label="Tipi documento" value={tipiDocumento.length} hint="Classificazione" />
        <KpiCard icon="building" tone="purple" label="Lavorazioni" value={lavorazioni.length} hint="Voci operative" />
        <KpiCard icon="warning" tone={qualityWarnings.length ? 'amber' : 'green'} label="Qualità dati" value={qualityWarnings.length} hint={qualityWarnings.length ? 'Anomalie reali' : 'Nessun alert'} />
      </KpiStrip>

      <DocumentPriorityPanel rows={priorityRows} />

      <WorkspaceLayout
        className="documents-workspace"
        sidebar={selectedDocument ? <DocumentPreviewPanel document={selectedDocument} canEdit={canEdit} store={store} /> : <SideContextPanel title="Anteprima documento" description="Seleziona un documento dalla lista per vedere dettagli e azioni." />}
      >
        <section className="accounting-section document-table-panel document-list-panel">
          <div className="section-heading panel-title-row"><div><h2>Tutti i documenti ({filteredRows.length})</h2><p>Lista operativa: documento, lavorazione, categoria, tab origine, importo e qualità sempre visibili.</p></div><span className="data-mode-badge"><MoneyValue value={displayedTotals.totale} /></span></div>
          {filteredRows.length > 0 ? (
            <>
              <div className="document-card-list">
                {paginatedRows.map((row) => (
                  <DataCardRow key={row.id} icon={getDocumentIcon(row.tipoDocumento)} selected={selectedDocument?.id === row.id} warning={hasAmountWarning(row) || row.qualitaDati === 'Da verificare' || row.controlloMatematico === 'Scarto da verificare'} title={row.numeroDocumento ?? row.fileName} description={`${row.descrizione ?? '-'} · ${formatMasterSheetLabel(row.lavorazione)}`} status={getDocumentStatus(row)} meta={[{ label: 'Tipo', value: row.tipoDocumento ?? '-' }, { label: 'Lavorazione / voce', value: formatMasterSheetLabel(row.lavorazione) }, { label: 'Categoria', value: row.categoria ?? '-' }, { label: 'Tab origine', value: formatMasterSheetLabel(row.sheetTab) }, { label: 'Fornitore', value: row.fornitore ?? '-' }, { label: 'Cantiere', value: row.cantiere ?? '-' }, { label: 'Qualità dati', value: row.qualitaDati ?? 'Da controllare' }, { label: 'Controllo', value: row.controlloMatematico ?? 'Da controllare' }, { label: 'Importo riga', value: <MoneyValue value={row.totale} /> }]} action={<ActionList><button className="button button-secondary button-small" type="button" onClick={() => setSelectedId(row.id)}>Anteprima</button><a className="button button-secondary button-small" href={`#/dashboard/documenti/${row.id}`}>Apri</a></ActionList>} />
                ))}
              </div>
              <div className="pagination-bar"><span>Mostra {pageStart + 1} - {Math.min(pageStart + pageSize, filteredRows.length)} di {filteredRows.length}</span><div>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button aria-current={currentPage === pageNumber ? 'page' : undefined} type="button" key={pageNumber} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}</div></div>
            </>
          ) : <EmptyState title="Nessun documento trovato">Modifica cantiere, tipo, lavorazione, tab, qualità, stato o ricerca per visualizzare altri documenti reali.</EmptyState>}
        </section>
      </WorkspaceLayout>

      <div className="internal-two-column">
        <section className="internal-panel"><div className="section-heading panel-title-row"><h2>Righe Google Sheets importate</h2><a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi contabilità</a></div><div className="compact-upload-list">{rows.slice(0, 5).map((row) => <a className="compact-upload-row" href={`#/dashboard/documenti/${row.id}`} key={`recent-${row.id}`}><span className="file-chip file-pdf">TAB</span><div><strong>{row.numeroDocumento ?? row.descrizione}</strong><small>{formatMasterSheetLabel(row.lavorazione)} · {row.cantiere}</small></div><StatusBadge>{getDocumentStatus(row)}</StatusBadge></a>)}</div></section>
        <section className="internal-panel"><div className="section-heading panel-title-row"><h2>Attività e cronologia</h2></div><div className="activity-feed">{filteredRows.slice(0, 5).map((row) => <a className="activity-item interactive-row" href={`#/dashboard/documenti/${row.id}`} key={`activity-${row.id}`}><span /><div><strong>{row.fornitore} · {row.numeroDocumento ?? row.fileName}</strong><small>{formatMasterSheetLabel(row.lavorazione)} · {formatDate(row.dataDocumento)}</small></div><StatusBadge>{getDocumentStatus(row)}</StatusBadge></a>)}</div></section>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function MasterSheetKpis({ summary }) {
  if (!summary?.total) return null
  return <KpiStrip className="master-sheet-kpis" ariaLabel="Fogli master Google Sheets"><KpiCard icon="report" tone="purple" label="Fogli master" value={summary.total} hint="Catalogo completo" /><KpiCard icon="building" tone="green" label="Tab operativi" value={summary.operational} hint="Lavorazioni / sezioni" /><KpiCard icon="file" label="Tab dettaglio" value={summary.detail} hint="Fogli Dett_*" /><KpiCard icon="warning" tone="amber" label="Tab sistema" value={summary.system} hint={`${summary.hidden} nascosti`} /></KpiStrip>
}

function DocumentPriorityPanel({ rows }) {
  return <section className="accounting-section real-accounting-section"><div className="section-heading panel-title-row"><div><h2>Documenti da controllare</h2><p>Priorità generate dagli stati, dalla qualità dati, da scarti matematici o collegamenti mancanti.</p></div><StatusBadge>{rows.length ? `${rows.length} priorità` : 'Tutto ok'}</StatusBadge></div><div className="document-card-list">{rows.length > 0 ? rows.map((row) => <DataCardRow key={row.id} icon="warning" title={`${row.tipoDocumento}: ${row.descrizione}`} description={`${row.cantiere} · ${row.fornitore} · ${formatMasterSheetLabel(row.lavorazione)}`} status={getDocumentStatus(row)} href={`#/dashboard/documenti/${row.id}`} warning={row.statoVerifica !== 'Da verificare' || row.qualitaDati === 'Da verificare'} meta={[{ label: 'Documento', value: row.numeroDocumento ?? row.fileName ?? '-' }, { label: 'Lavorazione / voce', value: formatMasterSheetLabel(row.lavorazione) }, { label: 'Categoria', value: row.categoria ?? '-' }, { label: 'Tab origine', value: formatMasterSheetLabel(row.sheetTab) }, { label: 'Qualità dati', value: row.qualitaDati ?? 'Da controllare' }, { label: 'Totale riga', value: <MoneyValue value={row.totale} /> }]} />) : <article className="accounting-alert"><strong>Nessuna priorità aperta</strong><small>I documenti filtrati non richiedono controlli immediati.</small></article>}</div></section>
}

function DocumentPreviewPanel({ document, canEdit, store }) {
  const [modalAction, setModalAction] = useState(null)
  const warning = hasAmountWarning(document) || document.qualitaDati === 'Da verificare' || document.controlloMatematico === 'Scarto da verificare'

  return <SideContextPanel className="document-preview-panel" title="Anteprima documento" description="Dati estratti e azioni rapide collegate al documento selezionato." action={<a className="button button-secondary button-small" href={`#/dashboard/documenti/${document.id}`}>Apri</a>}><div className="document-preview-sheet"><div className="recent-upload-title"><strong>{document.tipoDocumento}</strong><StatusBadge>{getDocumentStatus(document)}</StatusBadge></div><span>n. {document.numeroDocumento ?? document.id} del {formatDate(document.dataDocumento)}</span><div className="invoice-lines"><span>Descrizione</span><span>Q.ta</span><span>Importo</span><strong>{document.descrizione}</strong><span>1</span><strong><MoneyValue value={document.totale} /></strong></div></div><section className="extracted-data"><h3>Dati estratti</h3><dl className="detail-list"><div><dt>Fornitore</dt><dd>{document.fornitore}</dd></div><div><dt>Cantiere</dt><dd>{document.cantiere}</dd></div><div><dt>Data documento</dt><dd>{formatDate(document.dataDocumento)}</dd></div><div><dt>Numero</dt><dd>{document.numeroDocumento ?? '-'}</dd></div><div><dt>Lavorazione / voce</dt><dd>{formatMasterSheetLabel(document.lavorazione)}</dd></div><div><dt>Categoria contabile</dt><dd>{document.categoria ?? '-'}</dd></div><div><dt>Categoria originaria</dt><dd>{formatMasterSheetLabel(document.categoriaOriginale)}</dd></div><div><dt>Tab origine</dt><dd>{formatMasterSheetLabel(document.sheetTab)}</dd></div><div><dt>Qualità dati</dt><dd>{document.qualitaDati ?? 'Da controllare'}</dd></div><div><dt>Controllo</dt><dd><StatusBadge>{warning ? getDocumentStatus(document) : document.controlloMatematico ?? 'OK'}</StatusBadge></dd></div><div><dt>Imponibile</dt><dd><MoneyValue value={document.imponibile} /></dd></div><div><dt>IVA</dt><dd><MoneyValue value={document.iva} /></dd></div><div><dt>Totale riga</dt><dd><MoneyValue value={document.totale} /></dd></div></dl></section><section className="document-actions-panel"><h3>Azioni rapide</h3><button className="button button-success" type="button" disabled={!canEdit} onClick={() => store.markDocumentChecked(document.id)}>Approva e verifica</button><a className="button button-secondary" href="#/dashboard/contabilita">Collega a spesa</a><button className="button button-secondary warning-action" type="button" disabled={!canEdit} onClick={() => store.markDocumentDuplicate(document.id)}>Segnala duplicato</button><button className="button button-secondary" type="button" onClick={() => setModalAction({ icon: 'tag', title: 'Assegna lavorazione', text: 'La categoria contabile resta separata. Usa la lavorazione per voci come Generatore, Fase 2 solaio, Piscina o Docce esterne.', confirmLabel: 'Assegna lavorazione', fields: [{ label: 'Lavorazione / voce', type: 'text' }] })}>Assegna lavorazione</button><MobileActionMenu label="Altre azioni"><a className="button button-secondary" href={`#/dashboard/documenti/${document.id}`}>Apri dettaglio completo</a></MobileActionMenu></section><MockActionModal action={modalAction} onClose={() => setModalAction(null)} /></SideContextPanel>
}

function normalizeDocumentRow(row) {
  return { ...row, categoria: row.categoria ?? 'Extra / Altro', categoriaOriginale: row.categoriaOriginale ?? row.categoria_originale ?? null, lavorazione: row.lavorazione ?? row.categoriaOriginale ?? row.categoria_originale ?? row.sheetTab ?? 'Senza lavorazione', qualitaDati: row.qualitaDati ?? row.qualita_dati ?? 'Da controllare', controlloMatematico: row.controlloMatematico ?? row.controllo_matematico ?? 'Da controllare', naturaMovimento: row.naturaMovimento ?? row.natura_movimento ?? null, statoCollegamento: row.statoCollegamento ?? row.stato_collegamento ?? 'Collegato', dataQualityNote: row.dataQualityNote ?? row.data_quality_note ?? '', sheetTab: row.sheetTab ?? '' }
}

function isAllDocumentFilters(filters) {
  return filters.cantiereId === 'tutti' && filters.tipoDocumento === 'tutti' && filters.lavorazione === 'tutte' && filters.sheetTab === 'tutti' && filters.qualitaDati === 'tutte' && filters.stato === 'tutti' && filters.quick === 'tutti' && filters.search.trim() === ''
}

function getDocumentTotals(rows) {
  return rows.reduce((acc, row) => ({ imponibile: acc.imponibile + Number(row.imponibile || 0), iva: acc.iva + Number(row.iva || 0), totale: acc.totale + Number(row.totale || 0), daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' || row.qualitaDati === 'Da verificare' ? 1 : 0) }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0 })
}

function buildUniqueOptions(rows, field, fallback) {
  const values = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
  return values.length ? values.sort((a, b) => String(a).localeCompare(String(b), 'it')) : fallback
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

function getDocumentStatus(row) {
  if (row.controlloMatematico === 'Scarto da verificare') return 'Scarto da verificare'
  if (row.statoCollegamento === 'Da collegare') return 'Da collegare'
  if (row.qualitaDati === 'Da verificare') return 'Da verificare'
  if (hasAmountWarning(row)) return 'Totale da verificare'
  return displayStatus(row.statoVerifica)
}

function getDocumentIcon(tipoDocumento) {
  if (tipoDocumento === 'Bonifico') return 'wallet'
  if (tipoDocumento === 'Preventivo') return 'estimate'
  if (tipoDocumento === 'FIR') return 'warning'
  return 'file'
}

function hasAmountWarning(row) {
  const imponibile = Number(row.imponibile || 0)
  const iva = Number(row.iva || 0)
  const totale = Number(row.totale || 0)
  if (row.controlloMatematico === 'Non applicabile') return false
  if (row.tipoDocumento === 'Bonifico') return false
  if (!imponibile && !iva) return false
  return Math.abs((imponibile + iva) - totale) > 0.01
}
