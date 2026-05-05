import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
} from '../../components/InternalLayout'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { findDuplicateMovements, hasAmountWarning } from '../../lib/accountingChecks'
import { getOfficialMasterTotals, preferOfficialCategoryTotals, preferOfficialTotals } from '../../lib/masterTotals'

const defaultCategories = ['Materiali', 'Manodopera', 'Non materiali', 'Extra / Altro', 'Vitto', 'Alloggi', 'FIR / Rifiuti', 'Bonifici / Pagamenti', 'Noleggi / Servizi']
const defaultStatuses = ['Da verificare', 'Confermato', 'Incompleto', 'Possibile duplicato', 'Scartato']
const defaultDocTypes = ['Riepilogo tab', 'Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Altro']
const defaultPayments = ['Non indicato', 'Bonifico', 'Carta', 'Contanti', 'Da collegare', 'Da classificare']

export function ContabilitaMock({ documents = [], store = null, session = null }) {
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    sheetTab: 'tutti',
    categoria: 'tutte',
    statoVerifica: 'tutti',
    tipoDocumento: 'tutti',
    search: '',
  })

  const sourceRows = useMemo(() => {
    const movements = Array.isArray(store?.movements) ? store.movements : []
    return movements.length ? movements.map(normalizeAccountingRow) : documents.map(documentToAccountingRow)
  }, [documents, store?.movements])
  const officialMaster = getOfficialMasterTotals(store)
  const duplicateIds = useMemo(() => buildDuplicateIdSet(sourceRows), [sourceRows])
  const sites = useMemo(() => buildSiteOptions(sourceRows), [sourceRows])
  const tabs = useMemo(() => buildUniqueOptions(sourceRows, 'sheetTab', []), [sourceRows])
  const categories = useMemo(() => buildUniqueOptions(sourceRows, 'categoria', defaultCategories), [sourceRows])
  const statuses = useMemo(() => buildUniqueOptions(sourceRows, 'statoVerifica', defaultStatuses), [sourceRows])
  const docTypes = useMemo(() => buildUniqueOptions(sourceRows, 'tipoDocumento', defaultDocTypes), [sourceRows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return sourceRows.filter((row) => {
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesTab = filters.sheetTab === 'tutti' || row.sheetTab === filters.sheetTab
      const matchesCategoria = filters.categoria === 'tutte' || row.categoria === filters.categoria
      const matchesStato = filters.statoVerifica === 'tutti' || row.statoVerifica === filters.statoVerifica
      const matchesTipo = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesSearch = search === '' || [row.descrizione, row.fornitore, row.numeroDocumento, row.note, row.cantiere, row.sheetTab]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

      return matchesCantiere && matchesTab && matchesCategoria && matchesStato && matchesTipo && matchesSearch
    })
  }, [filters, sourceRows])

  const calculatedTotals = getAccountingTotals(filteredRows, duplicateIds)
  const totals = preferOfficialTotals(store, calculatedTotals)
  const siteSummaries = getSiteAccountingSummaries(filteredRows, duplicateIds, store)
  const calculatedCategoryTotals = getCategoryTotals(filteredRows)
  const categoryTotals = preferOfficialCategoryTotals(store, calculatedCategoryTotals)
  const alerts = getAccountingAlerts(filteredRows, duplicateIds)
  const mathWarnings = filteredRows.filter(hasAmountWarning).length

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Contabilità reale"
        title="Contabilità"
        description="Numeri ufficiali letti dal master Google Sheets. Le righe sotto sono dettagli operativi filtrabili per tab/lavorazione."
      >
        <DataModeBadge>{officialMaster ? 'Totali ufficiali master' : 'Dati reali Supabase'}</DataModeBadge>
        <a className="button button-secondary button-small" href="#/dashboard/report">Report</a>
      </DashboardHeader>

      {store?.addDocumentUpload && session && session.role !== 'employee' ? (
        <ManualExpenseForm store={store} session={session} sites={sites} categories={categories} />
      ) : null}

      <AccountingFilters filters={filters} onChange={updateFilter} sites={sites} tabs={tabs} categories={categories} statuses={statuses} docTypes={docTypes} />
      <AccountingSummaryCards totals={totals} rowsCount={filteredRows.length} mathWarnings={mathWarnings} officialMaster={officialMaster} />
      <AccountingAlerts alerts={alerts} />
      <AccountingTable rows={filteredRows} duplicateIds={duplicateIds} />
      <CantiereAccountingSummary summaries={siteSummaries} />
      <CategoryBreakdown rows={categoryTotals} total={totals.totale} official={Boolean(officialMaster)} />
    </>
  )
}

function ManualExpenseForm({ store, session, sites, categories }) {
  const defaultSite = sites[0] ?? { id: 'barcelo-roma', nome: 'Barcelò Roma' }
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState(null)
  const [form, setForm] = useState({
    cantiereId: defaultSite.id,
    tipoDocumento: 'Fattura',
    fornitore: '',
    descrizione: '',
    dataDocumento: todayIso(),
    categoria: categories[0] ?? 'Extra / Altro',
    imponibile: '',
    iva: '',
    totale: '',
    pagamento: 'Non indicato',
    note: '',
  })

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    setStatus(null)

    const imponibile = Number(form.imponibile || 0)
    const iva = Number(form.iva || 0)
    const totale = Number(form.totale || 0)

    if (!form.descrizione.trim() || !form.fornitore.trim()) {
      setStatus({ type: 'error', message: 'Descrizione e fornitore sono obbligatori.' })
      return
    }

    if (!totale || totale <= 0) {
      setStatus({ type: 'error', message: 'Inserisci un totale valido.' })
      return
    }

    const selectedSite = sites.find((site) => site.id === form.cantiereId) ?? defaultSite
    const id = `manual-expense-${Date.now()}`
    store.addDocumentUpload({
      id,
      cantiereId: form.cantiereId,
      cantiere: selectedSite.nome,
      tipoDocumento: form.tipoDocumento,
      fornitore: form.fornitore.trim(),
      descrizione: form.descrizione.trim(),
      numeroDocumento: `manuale-${id}`,
      dataDocumento: form.dataDocumento,
      categoria: form.categoria,
      imponibile,
      iva,
      totale,
      importoTotale: totale,
      pagamento: form.pagamento,
      fileName: 'Inserimento manuale',
      nota: form.note.trim() || 'Spesa inserita manualmente da hub, senza allegato iniziale.',
      caricatoDa: session.name,
      dataCaricamento: todayIso(),
      stato: 'da verificare',
      source: 'manual-accounting-entry',
    })

    setStatus({ type: 'success', message: 'Spesa inserita: controllala nella tabella movimenti. Puoi collegare o cambiare documento dal dettaglio movimento.' })
    setForm((current) => ({
      ...current,
      fornitore: '',
      descrizione: '',
      imponibile: '',
      iva: '',
      totale: '',
      note: '',
    }))
  }

  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Inserimento spesa reale</h2>
          <p>Crea un movimento/documento contabile persistente in Supabase. L’allegato può essere caricato dopo da Upload.</p>
        </div>
        <button className="button button-primary button-small" type="button" onClick={() => setIsOpen((current) => !current)}>
          {isOpen ? 'Chiudi' : 'Nuova spesa'}
        </button>
      </div>

      {status ? (
        <div className={status.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{status.type === 'error' ? 'Spesa non inserita' : 'Spesa inserita'}</strong>
          <p>{status.message}</p>
        </div>
      ) : null}

      {isOpen ? (
        <form className="mock-form detail-edit-form" onSubmit={submit}>
          <label>Cantiere<select value={form.cantiereId} onChange={(event) => update('cantiereId', event.target.value)}>{sites.map((site) => <option key={site.id} value={site.id}>{site.nome}</option>)}</select></label>
          <label>Tipo documento<select value={form.tipoDocumento} onChange={(event) => update('tipoDocumento', event.target.value)}>{defaultDocTypes.filter((type) => type !== 'Riepilogo tab').map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label>Fornitore<input value={form.fornitore} onChange={(event) => update('fornitore', event.target.value)} placeholder="Es. Falea" /></label>
          <label>Descrizione<input value={form.descrizione} onChange={(event) => update('descrizione', event.target.value)} placeholder="Es. Materiale cartongesso" /></label>
          <label>Data<input type="date" value={form.dataDocumento} onChange={(event) => update('dataDocumento', event.target.value)} /></label>
          <label>Categoria<select value={form.categoria} onChange={(event) => update('categoria', event.target.value)}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
          <label>Imponibile<input type="number" min="0" step="0.01" value={form.imponibile} onChange={(event) => update('imponibile', event.target.value)} /></label>
          <label>IVA<input type="number" min="0" step="0.01" value={form.iva} onChange={(event) => update('iva', event.target.value)} /></label>
          <label>Totale<input type="number" min="0" step="0.01" value={form.totale} onChange={(event) => update('totale', event.target.value)} /></label>
          <label>Pagamento<select value={form.pagamento} onChange={(event) => update('pagamento', event.target.value)}>{defaultPayments.map((payment) => <option key={payment} value={payment}>{payment}</option>)}</select></label>
          <label className="form-wide">Note<textarea rows="3" value={form.note} onChange={(event) => update('note', event.target.value)} placeholder="Es. da collegare a bonifico, allegato da caricare..." /></label>
          <button className="button button-primary" type="submit">Inserisci spesa</button>
        </form>
      ) : null}
    </section>
  )
}

function normalizeAccountingRow(row) {
  return {
    id: row.id,
    documentId: row.documentId,
    cantiereId: row.cantiereId ?? 'barcelo-roma',
    cantiere: row.cantiere ?? 'Barcelò Roma',
    data: row.data ?? row.dataDocumento,
    descrizione: row.descrizione ?? row.tipoDocumento ?? 'Movimento contabile',
    fornitore: row.fornitore ?? 'Non indicato',
    categoria: row.categoria ?? 'Extra / Altro',
    tipoDocumento: row.tipoDocumento ?? 'Altro',
    numeroDocumento: row.numeroDocumento ?? row.fileName ?? row.documentId ?? row.id,
    sheetTab: row.sheetTab ?? 'Senza tab',
    imponibile: Number(row.imponibile || 0),
    iva: Number(row.iva || 0),
    totale: Number(row.totale || row.importoTotale || 0),
    pagamento: row.pagamento ?? 'Non indicato',
    statoVerifica: row.statoVerifica ?? 'Da verificare',
    documentoCollegato: row.documentoCollegato ?? row.fileName ?? '',
    fileName: row.fileName,
    storagePath: row.storagePath,
    note: row.notes ?? row.note ?? '',
  }
}

function documentToAccountingRow(document) {
  return normalizeAccountingRow({
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento ?? 'Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    sheetTab: document.sheetTab ?? 'Senza tab',
    imponibile: document.imponibile,
    iva: document.iva,
    totale: document.totale ?? document.importoTotale,
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica ?? 'Da verificare',
    documentoCollegato: document.fileName,
    fileName: document.fileName,
    storagePath: document.storagePath,
    note: document.notes ?? document.note ?? '',
  })
}

function AccountingFilters({ filters, onChange, sites, tabs, categories, statuses, docTypes }) {
  return (
    <FilterGrid className="real-accounting-filters" ariaLabel="Filtri contabilità">
      <label>Cantiere<select value={filters.cantiereId} onChange={(event) => onChange('cantiereId', event.target.value)}><option value="tutti">Tutti</option>{sites.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}</select></label>
      <label>Lavorazione / tab<select value={filters.sheetTab} onChange={(event) => onChange('sheetTab', event.target.value)}><option value="tutti">Tutte</option>{tabs.map((tab) => <option key={tab} value={tab}>{tab}</option>)}</select></label>
      <label>Categoria<select value={filters.categoria} onChange={(event) => onChange('categoria', event.target.value)}><option value="tutte">Tutte</option>{categories.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}</select></label>
      <label>Stato verifica<select value={filters.statoVerifica} onChange={(event) => onChange('statoVerifica', event.target.value)}><option value="tutti">Tutti</option>{statuses.map((stato) => <option key={stato} value={stato}>{stato}</option>)}</select></label>
      <label>Tipo documento<select value={filters.tipoDocumento} onChange={(event) => onChange('tipoDocumento', event.target.value)}><option value="tutti">Tutti</option>{docTypes.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}</select></label>
      <label className="accounting-search">Ricerca<input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Descrizione, fornitore, documento, tab..." /></label>
    </FilterGrid>
  )
}

function AccountingSummaryCards({ totals, rowsCount, mathWarnings, officialMaster }) {
  return (
    <>
      {officialMaster ? (
        <section className="accounting-alert success-alert">
          <strong>Totali ufficiali dal master Google Sheets</strong>
          <p>I numeri economici qui sotto vengono dal tab Riepilogo. Le righe operative non vengono usate per ricalcolare il totale.</p>
        </section>
      ) : null}
      <KpiStrip ariaLabel="Indicatori economici contabilità">
        <KpiCard icon="wallet" tone="green" label="Totale complessivo" value={<MoneyValue value={totals.totale} />} hint={officialMaster ? 'Da master' : 'IVA inclusa'} />
        <KpiCard icon="report" label="Totale imponibile" value={<MoneyValue value={totals.imponibile} />} hint={officialMaster ? 'Da master' : 'Netto'} />
        <KpiCard icon="file" tone="purple" label="Totale IVA" value={<MoneyValue value={totals.iva} />} hint={officialMaster ? 'Da master' : 'Imposta'} />
        <KpiCard icon="inbox" label="Movimenti" value={rowsCount} hint="Righe operative" />
      </KpiStrip>
      <KpiStrip className="accounting-operational-kpis" ariaLabel="Indicatori operativi contabilità">
        <KpiCard icon="warning" tone="amber" label="Da verificare" value={totals.daVerificare ?? 0} hint="Controllo aperto" />
        <KpiCard icon="warning" tone="red" label="Possibili duplicati" value={totals.duplicati ?? 0} hint="Da evitare" />
        <KpiCard icon="wallet" tone="green" label="Pagamenti / bonifici" value={<MoneyValue value={totals.pagamenti ?? 0} />} hint="Da collegare" />
        <KpiCard icon="check" tone={mathWarnings ? 'amber' : 'green'} label="Controllo importi" value={mathWarnings} hint={mathWarnings ? 'Warning matematici' : 'Nessun errore'} />
      </KpiStrip>
    </>
  )
}

function AccountingAlerts({ alerts }) {
  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row"><div><h2>Controlli contabili</h2><p>Alert calcolati sulle righe operative, non sui totali ufficiali del master.</p></div><StatusBadge>{alerts.length ? `${alerts.length} alert` : 'Tutto ok'}</StatusBadge></div>
      <div className="document-card-list">
        {alerts.length > 0 ? alerts.map((alert) => <DataCardRow key={alert.id} icon={alert.message === 'Duplicato reale' || alert.message === 'Duplicato' ? 'warning' : 'file'} title={alert.movimento.descrizione} description={`${alert.movimento.fornitore} · ${alert.movimento.numeroDocumento}`} status={alert.message} href={`#/dashboard/contabilita/${alert.movimento.id}`} warning={alert.message !== 'Da controllare'} meta={[{ label: 'Tab', value: alert.movimento.sheetTab }, { label: 'Categoria', value: alert.movimento.categoria }, { label: 'Totale', value: <MoneyValue value={alert.movimento.totale} /> }, { label: 'Pagamento', value: alert.movimento.pagamento }]} />) : <article className="accounting-alert"><strong>Nessun alert sui filtri attuali</strong><small>I movimenti selezionati non hanno controlli aperti.</small></article>}
      </div>
    </section>
  )
}

function AccountingTable({ rows, duplicateIds }) {
  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row"><div><h2>Movimenti</h2><p>Righe operative importate dai tab del master: servono per leggere fornitore, documento, pagamento e note.</p></div><StatusBadge>{rows.length} righe</StatusBadge></div>
      {rows.length > 0 ? (
        <>
          <div className="accounting-table-wrap"><table className="accounting-table real-accounting-table"><thead><tr><th>Data</th><th>Lavorazione</th><th>Descrizione</th><th>Fornitore</th><th>Categoria</th><th>Imponibile</th><th>IVA</th><th>Totale</th><th>Pagamento</th><th>Documento</th><th>Stato</th><th>Note</th><th>Azione</th></tr></thead><tbody>{rows.map((row) => { const warning = hasAmountWarning(row); const duplicate = duplicateIds.has(row.id); return <tr className={warning || duplicate ? 'accounting-warning-row' : undefined} key={row.id}><td>{formatDate(row.data)}</td><td>{row.sheetTab}</td><td>{row.descrizione}</td><td>{row.fornitore}</td><td>{row.categoria}</td><td><MoneyValue value={row.imponibile} /></td><td><MoneyValue value={row.iva} /></td><td><MoneyValue value={row.totale} /></td><td>{row.pagamento}</td><td>{row.documentoCollegato || row.numeroDocumento || 'Da collegare'}</td><td><StatusBadge>{warning ? 'Totale da verificare' : duplicate ? 'Possibile duplicato' : row.statoVerifica}</StatusBadge></td><td>{row.note}</td><td><a className="text-link" href={`#/dashboard/contabilita/${row.id}`}>Apri</a></td></tr> })}</tbody></table></div>
          <div className="accounting-mobile-list">{rows.map((row) => <AccountingMobileCard key={row.id} row={row} duplicate={duplicateIds.has(row.id)} />)}</div>
        </>
      ) : <EmptyState title="Nessun movimento trovato">Modifica filtri, cantiere o ricerca per visualizzare altri movimenti contabili.</EmptyState>}
    </section>
  )
}

function AccountingMobileCard({ row, duplicate }) {
  const warning = hasAmountWarning(row)
  return <DataCardRow className="accounting-mobile-card" icon={warning || duplicate ? 'warning' : 'wallet'} title={row.descrizione} description={`${row.fornitore} · ${row.sheetTab}`} status={warning ? 'Totale da verificare' : duplicate ? 'Possibile duplicato' : row.statoVerifica} href={`#/dashboard/contabilita/${row.id}`} warning={warning || duplicate} meta={[{ label: 'Data', value: formatDate(row.data) }, { label: 'Lavorazione', value: row.sheetTab }, { label: 'Categoria', value: row.categoria }, { label: 'Imponibile', value: <MoneyValue value={row.imponibile} /> }, { label: 'IVA', value: <MoneyValue value={row.iva} /> }, { label: 'Totale riga', value: <MoneyValue value={row.totale} /> }, { label: 'Pagamento', value: row.pagamento }, { label: 'Documento', value: row.documentoCollegato || 'Da collegare' }]}><small>{row.numeroDocumento} · {row.note}</small></DataCardRow>
}

function CantiereAccountingSummary({ summaries }) {
  return <section className="accounting-section real-accounting-section"><div className="section-heading panel-title-row"><div><h2>Riepilogo per cantiere</h2><p>Se il master ha totali ufficiali, questi valori vengono dal tab Riepilogo.</p></div><StatusBadge>{summaries.length} cantieri</StatusBadge></div><div className="accounting-site-grid real-site-grid">{summaries.map((summary) => <article className="accounting-site-card" key={summary.cantiere.id}><h3>{summary.cantiere.nome}</h3><dl className="detail-list"><div><dt>Imponibile</dt><dd><MoneyValue value={summary.totals.imponibile} /></dd></div><div><dt>IVA</dt><dd><MoneyValue value={summary.totals.iva} /></dd></div><div><dt>Totale spese</dt><dd><MoneyValue value={summary.totals.totale} /></dd></div><div><dt>Movimenti</dt><dd>{summary.movimenti.length}</dd></div><div><dt>Da verificare</dt><dd>{summary.totals.daVerificare ?? 0}</dd></div></dl><CategoryBreakdown rows={summary.categories} total={summary.totals.totale} compact /></article>)}</div></section>
}

function CategoryBreakdown({ rows, total, compact = false, official = false }) {
  const visibleRows = rows.filter((row) => Number(row.totale || 0) > 0)
  const max = Math.max(...visibleRows.map((row) => row.totale), 1)
  return <section className={compact ? 'category-breakdown compact-breakdown compact-category-card' : 'accounting-section real-accounting-section compact-category-card'}>{!compact ? <div className="section-heading panel-title-row"><div><h2>Spese per tab / categoria</h2><p>{official ? 'Valori ufficiali letti dal tab Riepilogo del master.' : 'Distribuzione calcolata dalle righe operative.'}</p></div><StatusBadge>{visibleRows.length} voci</StatusBadge></div> : null}<div className="compact-category-grid">{visibleRows.map((row) => { const percent = total > 0 ? Math.round((row.totale / total) * 100) : 0; const width = Math.max(6, Math.round((row.totale / max) * 100)); return <article className="compact-category-item" key={row.categoria}><div className="compact-category-top"><strong>{row.categoria}</strong><span><MoneyValue value={row.totale} /></span></div><div className="compact-category-bar"><span style={{ width: `${width}%` }} /></div><small>{percent}% del totale</small></article> })}</div></section>
}

function getAccountingTotals(rows, duplicateIds) {
  return rows.reduce((acc, row) => ({ imponibile: acc.imponibile + row.imponibile, iva: acc.iva + row.iva, totale: acc.totale + row.totale, daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0), duplicati: acc.duplicati + ((row.statoVerifica === 'Possibile duplicato' || duplicateIds.has(row.id)) ? 1 : 0), pagamenti: acc.pagamenti + (row.categoria === 'Bonifici / Pagamenti' || String(row.pagamento).toLowerCase().includes('bonifico') ? row.totale : 0) }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0, duplicati: 0, pagamenti: 0 })
}

function getSiteAccountingSummaries(rows, duplicateIds, store) {
  return buildSiteOptions(rows).map((cantiere) => { const movimenti = rows.filter((row) => row.cantiereId === cantiere.id); const calculatedTotals = getAccountingTotals(movimenti, duplicateIds); const totals = preferOfficialTotals(store, calculatedTotals); const categories = preferOfficialCategoryTotals(store, getCategoryTotals(movimenti)); return { cantiere, movimenti, totals, categories } })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => ({ ...acc, [row.categoria]: (acc[row.categoria] ?? 0) + row.totale }), {})
  return Object.entries(grouped).map(([categoria, totale]) => ({ categoria, totale })).sort((a, b) => b.totale - a.totale)
}

function getAccountingAlerts(rows, duplicateIds) {
  return rows.flatMap((row) => { const alerts = []; if (row.statoVerifica === 'Da verificare') alerts.push({ id: `${row.id}-check`, message: 'Da controllare', movimento: row }); if (row.statoVerifica === 'Possibile duplicato') alerts.push({ id: `${row.id}-duplicate`, message: 'Duplicato', movimento: row }); if (duplicateIds.has(row.id)) alerts.push({ id: `${row.id}-auto-duplicate`, message: 'Duplicato reale', movimento: row }); if (row.statoVerifica === 'Incompleto') alerts.push({ id: `${row.id}-incomplete`, message: 'Incompleto', movimento: row }); if (!row.documentId && !row.documentoCollegato) alerts.push({ id: `${row.id}-link`, message: 'Documento da collegare', movimento: row }); if (hasAmountWarning(row)) alerts.push({ id: `${row.id}-math`, message: 'Totale da verificare', movimento: row }); return alerts })
}

function buildDuplicateIdSet(rows) {
  const duplicates = new Set()
  rows.forEach((row) => {
    const matches = findDuplicateMovements(row, rows)
    if (matches.length) duplicates.add(row.id)
  })
  return duplicates
}

function buildSiteOptions(rows) {
  const map = new Map()
  rows.forEach((row) => map.set(row.cantiereId, { id: row.cantiereId, nome: row.cantiere }))
  return [...map.values()]
}

function buildUniqueOptions(rows, field, fallback) {
  const values = [...new Set(rows.map((row) => row[field]).filter(Boolean))]
  return values.length ? values : fallback
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
