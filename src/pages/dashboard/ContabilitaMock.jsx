import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import {
  categorieContabili,
  getAccountingAlerts,
  getAccountingTotals,
  getCategoryTotals,
  getSiteAccountingSummaries,
  mockMovimentiContabili,
  statiVerificaContabili,
  tipiDocumentoContabili,
} from '../../data/mockMovimentiContabili'

export function ContabilitaMock() {
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    categoria: 'tutte',
    statoVerifica: 'tutti',
    tipoDocumento: 'tutti',
    search: '',
  })

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return mockMovimentiContabili.filter((row) => {
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesCategoria = filters.categoria === 'tutte' || row.categoria === filters.categoria
      const matchesStato = filters.statoVerifica === 'tutti' || row.statoVerifica === filters.statoVerifica
      const matchesTipo = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesSearch =
        search === '' ||
        row.descrizione.toLowerCase().includes(search) ||
        row.fornitore.toLowerCase().includes(search) ||
        row.numeroDocumento.toLowerCase().includes(search) ||
        row.note.toLowerCase().includes(search)

      return matchesCantiere && matchesCategoria && matchesStato && matchesTipo && matchesSearch
    })
  }, [filters])

  const totals = getAccountingTotals(filteredRows)
  const siteSummaries = getSiteAccountingSummaries(mockCantieri, filteredRows)
  const categoryTotals = getCategoryTotals(filteredRows)
  const alerts = getAccountingAlerts(filteredRows)

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Contabilità mock"
        title="Contabilità"
        description="Movimenti, documenti, alert e riepiloghi per cantiere."
      >
        <DataModeBadge />
      </DashboardHeader>

      <AccountingFilters filters={filters} onChange={updateFilter} />
      <AccountingSummaryCards totals={totals} />
      <AccountingAlerts alerts={alerts} />
      <AccountingTable rows={filteredRows} />
      <CantiereAccountingSummary summaries={siteSummaries} />
      <CategoryBreakdown rows={categoryTotals} />
    </>
  )
}

function AccountingFilters({ filters, onChange }) {
  return (
    <section className="accounting-filters" aria-label="Filtri contabilità">
      <label>
        Cantiere
        <select value={filters.cantiereId} onChange={(event) => onChange('cantiereId', event.target.value)}>
          <option value="tutti">Tutti</option>
          {mockCantieri.map((cantiere) => (
            <option key={cantiere.id} value={cantiere.id}>
              {cantiere.nome}
            </option>
          ))}
        </select>
      </label>
      <label>
        Categoria
        <select value={filters.categoria} onChange={(event) => onChange('categoria', event.target.value)}>
          <option value="tutte">Tutte</option>
          {categorieContabili.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </label>
      <label>
        Stato verifica
        <select
          value={filters.statoVerifica}
          onChange={(event) => onChange('statoVerifica', event.target.value)}
        >
          <option value="tutti">Tutti</option>
          {statiVerificaContabili.map((stato) => (
            <option key={stato} value={stato}>
              {stato}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo documento
        <select
          value={filters.tipoDocumento}
          onChange={(event) => onChange('tipoDocumento', event.target.value)}
        >
          <option value="tutti">Tutti</option>
          {tipiDocumentoContabili.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>
      <label className="accounting-search">
        Ricerca
        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange('search', event.target.value)}
          placeholder="Descrizione, fornitore, documento..."
        />
      </label>
    </section>
  )
}

function AccountingSummaryCards({ totals }) {
  return (
    <section className="accounting-summary-grid">
      <SummaryCard label="Totale imponibile" value={<MoneyValue value={totals.imponibile} />} />
      <SummaryCard label="Totale IVA" value={<MoneyValue value={totals.iva} />} />
      <SummaryCard label="Totale complessivo" value={<MoneyValue value={totals.totale} />} />
      <SummaryCard label="Da verificare" value={totals.daVerificare} />
      <SummaryCard label="Possibili duplicati" value={totals.duplicati} />
      <SummaryCard label="Pagamenti / bonifici" value={<MoneyValue value={totals.pagamenti} />} />
    </section>
  )
}

function SummaryCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function AccountingAlerts({ alerts }) {
  return (
    <section className="accounting-section">
      <div className="section-heading">
        <h2>Controlli contabili</h2>
        <p>Alert mock derivati dai movimenti filtrati.</p>
      </div>
      <div className="accounting-alert-grid">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <article className="accounting-alert" key={alert.id}>
              <StatusBadge>{alert.message}</StatusBadge>
              <strong>{alert.movimento.descrizione}</strong>
              <small>
                {alert.movimento.fornitore} · {alert.movimento.numeroDocumento}
              </small>
            </article>
          ))
        ) : (
          <article className="accounting-alert">
            <strong>Nessun alert sui filtri attuali</strong>
            <small>I movimenti selezionati non hanno controlli aperti nei dati mock.</small>
          </article>
        )}
      </div>
    </section>
  )
}

function AccountingTable({ rows }) {
  return (
    <section className="accounting-section">
      <div className="section-heading">
        <h2>Movimenti</h2>
        <p>Tabella desktop e card compatte su mobile.</p>
      </div>
      {rows.length > 0 ? (
        <>
          <div className="accounting-table-wrap">
            <table className="accounting-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrizione</th>
                  <th>Fornitore</th>
                  <th>Categoria</th>
                  <th>Imponibile</th>
                  <th>IVA</th>
                  <th>Totale</th>
                  <th>Pagamento</th>
                  <th>Documento</th>
                  <th>Stato</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{formatDate(row.data)}</td>
                    <td>{row.descrizione}</td>
                    <td>{row.fornitore}</td>
                    <td>{row.categoria}</td>
                    <td><MoneyValue value={row.imponibile} /></td>
                    <td><MoneyValue value={row.iva} /></td>
                    <td><MoneyValue value={row.totale} /></td>
                    <td>{row.pagamento}</td>
                    <td>{row.tipoDocumento} {row.numeroDocumento}</td>
                    <td><StatusBadge>{row.statoVerifica}</StatusBadge></td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="accounting-mobile-list">
            {rows.map((row) => (
              <AccountingMobileCard key={row.id} row={row} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="Nessun movimento trovato">
          Modifica filtri, cantiere o ricerca per visualizzare altri movimenti contabili mock.
        </EmptyState>
      )}
    </section>
  )
}

function AccountingMobileCard({ row }) {
  return (
    <article className="accounting-mobile-card">
      <div className="recent-upload-title">
        <h3>{row.descrizione}</h3>
        <StatusBadge>{row.statoVerifica}</StatusBadge>
      </div>
      <p>{row.fornitore} · {row.categoria}</p>
      <dl className="compact-meta">
        <div>
          <dt>Data</dt>
          <dd>{formatDate(row.data)}</dd>
        </div>
        <div>
          <dt>Totale</dt>
          <dd><MoneyValue value={row.totale} /></dd>
        </div>
        <div>
          <dt>Pagamento</dt>
          <dd>{row.pagamento}</dd>
        </div>
      </dl>
      <small>{row.tipoDocumento} {row.numeroDocumento} · {row.note}</small>
    </article>
  )
}

function CantiereAccountingSummary({ summaries }) {
  return (
    <section className="accounting-section">
      <div className="section-heading">
        <h2>Riepilogo per cantiere</h2>
      </div>
      <div className="accounting-site-grid">
        {summaries.map((summary) => (
          <article className="accounting-site-card" key={summary.cantiere.id}>
            <h3>{summary.cantiere.nome}</h3>
            <dl className="detail-list">
              <div>
                <dt>Imponibile</dt>
                <dd><MoneyValue value={summary.totals.imponibile} /></dd>
              </div>
              <div>
                <dt>IVA</dt>
                <dd><MoneyValue value={summary.totals.iva} /></dd>
              </div>
              <div>
                <dt>Totale spese</dt>
                <dd><MoneyValue value={summary.totals.totale} /></dd>
              </div>
              <div>
                <dt>Documenti</dt>
                <dd>{summary.movimenti.length}</dd>
              </div>
              <div>
                <dt>Da verificare</dt>
                <dd>{summary.totals.daVerificare}</dd>
              </div>
            </dl>
            <CategoryBreakdown rows={summary.categories} compact />
          </article>
        ))}
      </div>
    </section>
  )
}

function CategoryBreakdown({ rows, compact = false }) {
  const max = Math.max(...rows.map((row) => row.totale), 1)

  return (
    <section className={compact ? 'category-breakdown compact-breakdown' : 'accounting-section'}>
      {!compact ? (
        <div className="section-heading">
          <h2>Spese per categoria</h2>
        </div>
      ) : null}
      <div className="category-list">
        {rows.map((row) => (
          <div className="category-row" key={row.categoria}>
            <div>
              <span>{row.categoria}</span>
              <strong><MoneyValue value={row.totale} /></strong>
            </div>
            <div className="category-track">
              <span style={{ width: `${Math.round((row.totale / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
