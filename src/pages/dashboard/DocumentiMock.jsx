import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { AlertPanel, DashboardHeader, DataModeBadge, StatCard } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import { tipiDocumento } from '../../data/mockUploads'

export function DocumentiMock({ session, store }) {
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
  const incomplete = rows.filter((row) => row.statoVerifica === 'Incompleto')
  const duplicates = rows.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.totale || 0), 0)
  const canEdit = session.role === 'admin' || session.role === 'accounting'

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Documenti mock"
        title="Documenti cantiere e contabilità"
        description="Archivio operativo con dettagli, stati modificabili, attività e controlli importi."
      >
        <DataModeBadge />
        <button className="button button-secondary" type="button" onClick={store.resetMockStore}>Reset mock</button>
      </DashboardHeader>

      <section className="stats-grid">
        <StatCard label="Documenti filtrati" value={filteredRows.length} />
        <StatCard label="Da verificare" value={toCheck.length} />
        <StatCard label="Incompleti" value={incomplete.length} />
        <StatCard label="Possibili duplicati" value={duplicates.length} />
        <StatCard label="Totale importi mock" value={<MoneyValue value={totalAmount} />} />
      </section>

      <section className="cantieri-tools document-filters" aria-label="Filtri documenti">
        <label>
          Cantiere
          <select value={filters.cantiereId} onChange={(event) => updateFilter('cantiereId', event.target.value)}>
            <option value="tutti">Tutti</option>
            {mockCantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
          </select>
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
          Filtro rapido
          <select value={filters.quick} onChange={(event) => updateFilter('quick', event.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="da-verificare">Da verificare</option>
            <option value="duplicati">Possibili duplicati</option>
            <option value="incompleti">Incompleti</option>
          </select>
        </label>
        <label className="accounting-search">
          Ricerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Fornitore, nome documento, file..."
          />
        </label>
      </section>

      <AlertPanel
        title="Documenti da controllare"
        alerts={[...toCheck, ...incomplete, ...duplicates].slice(0, 8).map((row) => ({
          id: row.id,
          title: `${row.tipoDocumento}: ${row.descrizione}`,
          meta: `${row.cantiere} · ${row.fornitore}`,
          status: row.statoVerifica,
        }))}
      />

      <section className="accounting-section">
        <div className="section-heading">
          <h2>Lista documenti</h2>
          <p>Apri un documento per modificarne stato, dati, note e storico attività.</p>
        </div>
        {filteredRows.length > 0 ? (
          <div className="document-list">
            {filteredRows.map((row) => (
              <article className={`document-row ${hasAmountWarning(row) ? 'validation-warning-row' : ''}`} key={row.id}>
                <div>
                  <div className="recent-upload-title">
                    <h3>{row.descrizione}</h3>
                    <StatusBadge>{row.statoVerifica}</StatusBadge>
                  </div>
                  <p>{row.cantiere} · {row.tipoDocumento} · {row.fornitore}</p>
                  <small>{formatDate(row.dataDocumento)} · {row.fileName} · {row.note}</small>
                  {hasAmountWarning(row) ? <strong className="validation-alert">Importi da controllare</strong> : null}
                </div>
                <div className="row-actions">
                  <strong><MoneyValue value={row.totale} /></strong>
                  <a className="button button-secondary" href={`#/dashboard/documenti/${row.id}`}>Apri</a>
                  {canEdit ? (
                    <>
                      <button className="button button-secondary" type="button" onClick={() => store.markDocumentChecked(row.id)}>Conferma</button>
                      <button className="button button-secondary" type="button" onClick={() => store.markDocumentDuplicate(row.id)}>Duplicato</button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nessun documento trovato">
            Modifica cantiere, tipo, stato o ricerca per visualizzare altri documenti mock.
          </EmptyState>
        )}
      </section>
    </>
  )
}

function hasAmountWarning(row) {
  return Number(row.imponibile || 0) + Number(row.iva || 0) !== Number(row.totale || 0) && row.tipoDocumento !== 'Bonifico'
}
