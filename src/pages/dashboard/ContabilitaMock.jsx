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

const defaultCategories = ['Materiali', 'Manodopera', 'Non materiali', 'Extra / Altro', 'Vitto', 'Alloggi', 'FIR / Rifiuti', 'Bonifici / Pagamenti', 'Noleggi / Servizi']
const defaultStatuses = ['Da verificare', 'Confermato', 'Incompleto', 'Possibile duplicato', 'Scartato']
const defaultDocTypes = ['Riepilogo tab', 'Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Altro']

export function ContabilitaMock({ documents = [] }) {
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    categoria: 'tutte',
    statoVerifica: 'tutti',
    tipoDocumento: 'tutti',
    search: '',
  })

  const sourceRows = useMemo(() => documents.map(documentToAccountingRow), [documents])
  const sites = useMemo(() => buildSiteOptions(sourceRows), [sourceRows])
  const categories = useMemo(() => buildUniqueOptions(sourceRows, 'categoria', defaultCategories), [sourceRows])
  const statuses = useMemo(() => buildUniqueOptions(sourceRows, 'statoVerifica', defaultStatuses), [sourceRows])
  const docTypes = useMemo(() => buildUniqueOptions(sourceRows, 'tipoDocumento', defaultDocTypes), [sourceRows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return sourceRows.filter((row) => {
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesCategoria = filters.categoria === 'tutte' || row.categoria === filters.categoria
      const matchesStato = filters.statoVerifica === 'tutti' || row.statoVerifica === filters.statoVerifica
      const matchesTipo = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesSearch = search === '' || [row.descrizione, row.fornitore, row.numeroDocumento, row.note, row.cantiere]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

      return matchesCantiere && matchesCategoria && matchesStato && matchesTipo && matchesSearch
    })
  }, [filters, sourceRows])

  const totals = getAccountingTotals(filteredRows)
  const siteSummaries = getSiteAccountingSummaries(filteredRows)
  const categoryTotals = getCategoryTotals(filteredRows)
  const alerts = getAccountingAlerts(filteredRows)
  const mathWarnings = filteredRows.filter(hasAmountWarning).length

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Contabilità reale"
        title="Contabilità"
        description="Movimenti, riepiloghi e controlli calcolati dai dati reali Supabase / BARCELO_ROMA_master."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-secondary button-small" href="#/dashboard/report">Report</a>
      </DashboardHeader>

      <AccountingFilters filters={filters} onChange={updateFilter} sites={sites} categories={categories} statuses={statuses} docTypes={docTypes} />
      <AccountingSummaryCards totals={totals} rowsCount={filteredRows.length} mathWarnings={mathWarnings} />
      <AccountingAlerts alerts={alerts} />
      <AccountingTable rows={filteredRows} />
      <CantiereAccountingSummary summaries={siteSummaries} />
      <CategoryBreakdown rows={categoryTotals} total={totals.totale} />
    </>
  )
}

function documentToAccountingRow(document) {
  return {
    id: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento ?? 'Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica ?? 'Da verificare',
    documentoCollegato: document.fileName,
    note: document.notes ?? document.note ?? '',
  }
}

function AccountingFilters({ filters, onChange, sites, categories, statuses, docTypes }) {
  return (
    <FilterGrid className="real-accounting-filters" ariaLabel="Filtri contabilità">
      <label>
        Cantiere
        <select value={filters.cantiereId} onChange={(event) => onChange('cantiereId', event.target.value)}>
          <option value="tutti">Tutti</option>
          {sites.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
        </select>
      </label>
      <label>
        Categoria
        <select value={filters.categoria} onChange={(event) => onChange('categoria', event.target.value)}>
          <option value="tutte">Tutte</option>
          {categories.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
        </select>
      </label>
      <label>
        Stato verifica
        <select value={filters.statoVerifica} onChange={(event) => onChange('statoVerifica', event.target.value)}>
          <option value="tutti">Tutti</option>
          {statuses.map((stato) => <option key={stato} value={stato}>{stato}</option>)}
        </select>
      </label>
      <label>
        Tipo documento
        <select value={filters.tipoDocumento} onChange={(event) => onChange('tipoDocumento', event.target.value)}>
          <option value="tutti">Tutti</option>
          {docTypes.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
        </select>
      </label>
      <label className="accounting-search">
        Ricerca
        <input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Descrizione, fornitore, documento..." />
      </label>
    </FilterGrid>
  )
}

function AccountingSummaryCards({ totals, rowsCount, mathWarnings }) {
  return (
    <>
      <KpiStrip ariaLabel="Indicatori economici contabilità">
        <KpiCard icon="wallet" tone="green" label="Totale complessivo" value={<MoneyValue value={totals.totale} />} hint="IVA inclusa" />
        <KpiCard icon="report" label="Totale imponibile" value={<MoneyValue value={totals.imponibile} />} hint="Netto" />
        <KpiCard icon="file" tone="purple" label="Totale IVA" value={<MoneyValue value={totals.iva} />} hint="Imposta" />
        <KpiCard icon="inbox" label="Movimenti" value={rowsCount} hint="Righe filtrate" />
      </KpiStrip>
      <KpiStrip className="accounting-operational-kpis" ariaLabel="Indicatori operativi contabilità">
        <KpiCard icon="warning" tone="amber" label="Da verificare" value={totals.daVerificare} hint="Controllo aperto" />
        <KpiCard icon="warning" tone="red" label="Possibili duplicati" value={totals.duplicati} hint="Da evitare" />
        <KpiCard icon="wallet" tone="green" label="Pagamenti / bonifici" value={<MoneyValue value={totals.pagamenti} />} hint="Da collegare" />
        <KpiCard icon="check" tone={mathWarnings ? 'amber' : 'green'} label="Controllo importi" value={mathWarnings} hint={mathWarnings ? 'Warning matematici' : 'Nessun errore'} />
      </KpiStrip>
    </>
  )
}

function AccountingAlerts({ alerts }) {
  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Controlli contabili</h2>
          <p>Alert calcolati sui dati reali filtrati.</p>
        </div>
        <StatusBadge>{alerts.length ? `${alerts.length} alert` : 'Tutto ok'}</StatusBadge>
      </div>
      <div className="document-card-list">
        {alerts.length > 0 ? alerts.map((alert) => (
          <DataCardRow
            key={alert.id}
            icon={alert.message === 'Duplicato' ? 'warning' : 'file'}
            title={alert.movimento.descrizione}
            description={`${alert.movimento.fornitore} · ${alert.movimento.numeroDocumento}`}
            status={alert.message}
            href={`#/dashboard/contabilita/${alert.movimento.id}`}
            warning={alert.message !== 'Da controllare'}
            meta={[
              { label: 'Categoria', value: alert.movimento.categoria },
              { label: 'Totale', value: <MoneyValue value={alert.movimento.totale} /> },
              { label: 'Pagamento', value: alert.movimento.pagamento },
            ]}
          />
        )) : (
          <article className="accounting-alert"><strong>Nessun alert sui filtri attuali</strong><small>I movimenti selezionati non hanno controlli aperti.</small></article>
        )}
      </div>
    </section>
  )
}

function AccountingTable({ rows }) {
  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Movimenti</h2>
          <p>Tabella desktop con importi, IVA e stato documento. Su mobile diventa card.</p>
        </div>
        <StatusBadge>{rows.length} righe</StatusBadge>
      </div>
      {rows.length > 0 ? (
        <>
          <div className="accounting-table-wrap">
            <table className="accounting-table real-accounting-table">
              <thead><tr><th>Data</th><th>Descrizione</th><th>Fornitore</th><th>Categoria</th><th>Imponibile</th><th>IVA</th><th>Totale</th><th>Pagamento</th><th>Documento</th><th>Stato</th><th>Note</th><th>Azione</th></tr></thead>
              <tbody>
                {rows.map((row) => {
                  const warning = hasAmountWarning(row)
                  return (
                    <tr className={warning ? 'accounting-warning-row' : undefined} key={row.id}>
                      <td>{formatDate(row.data)}</td><td>{row.descrizione}</td><td>{row.fornitore}</td><td>{row.categoria}</td><td><MoneyValue value={row.imponibile} /></td><td><MoneyValue value={row.iva} /></td><td><MoneyValue value={row.totale} /></td><td>{row.pagamento}</td><td>{row.tipoDocumento} {row.numeroDocumento}</td><td><StatusBadge>{warning ? 'Totale da verificare' : row.statoVerifica}</StatusBadge></td><td>{row.note}</td><td><a className="text-link" href={`#/dashboard/contabilita/${row.id}`}>Apri</a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="accounting-mobile-list">{rows.map((row) => <AccountingMobileCard key={row.id} row={row} />)}</div>
        </>
      ) : <EmptyState title="Nessun movimento trovato">Modifica filtri, cantiere o ricerca per visualizzare altri movimenti contabili.</EmptyState>}
    </section>
  )
}

function AccountingMobileCard({ row }) {
  const warning = hasAmountWarning(row)
  return (
    <DataCardRow
      className="accounting-mobile-card"
      icon={warning ? 'warning' : 'wallet'}
      title={row.descrizione}
      description={`${row.fornitore} · ${row.categoria}`}
      status={warning ? 'Totale da verificare' : row.statoVerifica}
      href={`#/dashboard/contabilita/${row.id}`}
      warning={warning}
      meta={[
        { label: 'Data', value: formatDate(row.data) },
        { label: 'Imponibile', value: <MoneyValue value={row.imponibile} /> },
        { label: 'IVA', value: <MoneyValue value={row.iva} /> },
        { label: 'Totale', value: <MoneyValue value={row.totale} /> },
        { label: 'Pagamento', value: row.pagamento },
      ]}
    >
      <small>{row.tipoDocumento} {row.numeroDocumento} · {row.note}</small>
    </DataCardRow>
  )
}

function CantiereAccountingSummary({ summaries }) {
  return (
    <section className="accounting-section real-accounting-section">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Riepilogo per cantiere</h2>
          <p>Totali e controlli raggruppati per cantiere.</p>
        </div>
        <StatusBadge>{summaries.length} cantieri</StatusBadge>
      </div>
      <div className="accounting-site-grid real-site-grid">
        {summaries.map((summary) => (
          <article className="accounting-site-card" key={summary.cantiere.id}>
            <h3>{summary.cantiere.nome}</h3>
            <dl className="detail-list">
              <div><dt>Imponibile</dt><dd><MoneyValue value={summary.totals.imponibile} /></dd></div>
              <div><dt>IVA</dt><dd><MoneyValue value={summary.totals.iva} /></dd></div>
              <div><dt>Totale spese</dt><dd><MoneyValue value={summary.totals.totale} /></dd></div>
              <div><dt>Documenti</dt><dd>{summary.movimenti.length}</dd></div>
              <div><dt>Da verificare</dt><dd>{summary.totals.daVerificare}</dd></div>
            </dl>
            <CategoryBreakdown rows={summary.categories} total={summary.totals.totale} compact />
          </article>
        ))}
      </div>
    </section>
  )
}

function CategoryBreakdown({ rows, total, compact = false }) {
  const visibleRows = rows.filter((row) => Number(row.totale || 0) > 0)
  const max = Math.max(...visibleRows.map((row) => row.totale), 1)

  return (
    <section className={compact ? 'category-breakdown compact-breakdown compact-category-card' : 'accounting-section real-accounting-section compact-category-card'}>
      {!compact ? <div className="section-heading panel-title-row"><div><h2>Spese per categoria</h2><p>Distribuzione dei costi per categoria contabile standard.</p></div><StatusBadge>{visibleRows.length} categorie</StatusBadge></div> : null}
      <div className="compact-category-grid">
        {visibleRows.map((row) => {
          const percent = total > 0 ? Math.round((row.totale / total) * 100) : 0
          const width = Math.max(6, Math.round((row.totale / max) * 100))
          return (
            <article className="compact-category-item" key={row.categoria}>
              <div className="compact-category-top"><strong>{row.categoria}</strong><span><MoneyValue value={row.totale} /></span></div>
              <div className="compact-category-bar"><span style={{ width: `${width}%` }} /></div>
              <small>{percent}% del totale</small>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function getAccountingTotals(rows) {
  return rows.reduce((acc, row) => ({
    imponibile: acc.imponibile + row.imponibile,
    iva: acc.iva + row.iva,
    totale: acc.totale + row.totale,
    daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0),
    duplicati: acc.duplicati + (row.statoVerifica === 'Possibile duplicato' ? 1 : 0),
    pagamenti: acc.pagamenti + (row.categoria === 'Bonifici / Pagamenti' || String(row.pagamento).toLowerCase().includes('bonifico') ? row.totale : 0),
  }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0, duplicati: 0, pagamenti: 0 })
}

function getSiteAccountingSummaries(rows) {
  return buildSiteOptions(rows).map((cantiere) => {
    const movimenti = rows.filter((row) => row.cantiereId === cantiere.id)
    const totals = getAccountingTotals(movimenti)
    const categories = getCategoryTotals(movimenti)
    return { cantiere, movimenti, totals, categories }
  })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => ({ ...acc, [row.categoria]: (acc[row.categoria] ?? 0) + row.totale }), {})
  return Object.entries(grouped).map(([categoria, totale]) => ({ categoria, totale })).sort((a, b) => b.totale - a.totale)
}

function getAccountingAlerts(rows) {
  return rows.flatMap((row) => {
    const alerts = []
    if (row.statoVerifica === 'Da verificare') alerts.push({ id: `${row.id}-check`, message: 'Da controllare', movimento: row })
    if (row.statoVerifica === 'Possibile duplicato') alerts.push({ id: `${row.id}-duplicate`, message: 'Duplicato', movimento: row })
    if (row.statoVerifica === 'Incompleto') alerts.push({ id: `${row.id}-incomplete`, message: 'Incompleto', movimento: row })
    if (hasAmountWarning(row)) alerts.push({ id: `${row.id}-math`, message: 'Totale da verificare', movimento: row })
    return alerts
  })
}

function hasAmountWarning(row) {
  if (row.tipoDocumento === 'Bonifico') return false
  if (!row.imponibile && !row.iva) return false
  return Math.abs((row.imponibile + row.iva) - row.totale) > 0.01
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
