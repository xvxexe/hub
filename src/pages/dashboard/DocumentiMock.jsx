import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { AlertPanel, DashboardHeader, DataModeBadge, StatCard } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { documents } from '../../data/mockData'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import { statiDocumenti, tipiDocumento } from '../../data/mockUploads'

export function DocumentiMock({ documentUploads }) {
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    tipoDocumento: 'tutti',
    stato: 'tutti',
    search: '',
  })

  const archivedDocuments = useMemo(
    () =>
      documents.map((documento, index) => ({
        id: `archivio-${index}`,
        cantiereId: mockCantieri.find((cantiere) => cantiere.nome.includes(documento.project))?.id ?? 'archivio',
        cantiere: documento.project,
        tipoDocumento: documento.type,
        fornitore: 'Archivio mock',
        descrizione: documento.name,
        dataDocumento: '2026-04-01',
        importoTotale: 0,
        fileName: `${documento.name.toLowerCase().replaceAll(' ', '-')}.pdf`,
        nota: 'Documento mock già presente in archivio.',
        caricatoDa: 'Sistema mock',
        dataCaricamento: '2026-04-01',
        stato: normalizeDocumentStatus(documento.status),
      })),
    [],
  )

  const rows = useMemo(() => [...documentUploads, ...archivedDocuments], [archivedDocuments, documentUploads])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesCantiere = filters.cantiereId === 'tutti' || row.cantiereId === filters.cantiereId
      const matchesType = filters.tipoDocumento === 'tutti' || row.tipoDocumento === filters.tipoDocumento
      const matchesStatus = filters.stato === 'tutti' || row.stato === filters.stato
      const matchesSearch =
        search === '' ||
        row.fornitore.toLowerCase().includes(search) ||
        row.descrizione.toLowerCase().includes(search) ||
        row.fileName.toLowerCase().includes(search) ||
        row.cantiere.toLowerCase().includes(search)

      return matchesCantiere && matchesType && matchesStatus && matchesSearch
    })
  }, [filters, rows])

  const toCheck = rows.filter((row) => row.stato === 'da verificare')
  const incomplete = rows.filter((row) => row.stato === 'incompleto')
  const duplicates = rows.filter((row) => row.stato === 'possibile duplicato')
  const totalAmount = filteredRows.reduce((sum, row) => sum + Number(row.importoTotale || 0), 0)

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Documenti mock"
        title="Documenti cantiere e contabilità"
        description="Archivio operativo per fatture, bonifici, ricevute, FIR e documenti caricati dai cantieri."
      >
        <DataModeBadge />
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
            {statiDocumenti.map((stato) => <option key={stato} value={stato}>{stato}</option>)}
          </select>
        </label>
        <label>
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
          status: row.stato,
        }))}
      />

      <section className="accounting-section">
        <div className="section-heading">
          <h2>Lista documenti</h2>
          <p>Vista leggibile su desktop e mobile, con importi visibili solo ai ruoli autorizzati.</p>
        </div>
        {filteredRows.length > 0 ? (
          <div className="document-list">
            {filteredRows.map((row) => (
              <article className="document-row" key={row.id}>
                <div>
                  <div className="recent-upload-title">
                    <h3>{row.descrizione}</h3>
                    <StatusBadge>{row.stato}</StatusBadge>
                  </div>
                  <p>{row.cantiere} · {row.tipoDocumento} · {row.fornitore}</p>
                  <small>{formatDate(row.dataCaricamento)} · {row.fileName} · {row.nota}</small>
                </div>
                <strong><MoneyValue value={row.importoTotale} /></strong>
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

function normalizeDocumentStatus(status) {
  const normalized = String(status).toLowerCase()
  if (normalized === 'archiviato') return 'confermato'
  return normalized
}
