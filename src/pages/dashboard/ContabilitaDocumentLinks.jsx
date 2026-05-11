import { useMemo, useState } from 'react'
import {
  FilterGrid,
  KpiCard,
  KpiStrip,
} from '../../components/InternalLayout'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { orderedDriveDocuments } from '../../data/orderedDriveDocuments'

const ALL = 'tutti'

export function ContabilitaDocumentLinks({ store }) {
  const [filters, setFilters] = useState({
    tab: ALL,
    status: ALL,
    search: '',
  })

  const rows = useMemo(() => {
    const movements = Array.isArray(store?.movements) ? store.movements : []
    return movements.map(normalizeMovement).map((movement) => {
      const linkedDocuments = findLinkedDriveDocuments(movement)
      return {
        ...movement,
        linkedDocuments,
        documentStatus: getDocumentStatus(linkedDocuments),
      }
    })
  }, [store?.movements])

  const tabOptions = useMemo(() => uniqueSorted(rows.map((row) => row.sheetTab)), [rows])

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesTab = filters.tab === ALL || row.sheetTab === filters.tab
      const matchesStatus = filters.status === ALL || row.documentStatus === filters.status
      const haystack = [
        row.descrizione,
        row.fornitore,
        row.numeroDocumento,
        row.sheetTab,
        row.categoria,
        ...row.linkedDocuments.map((document) => `${document.fileName} ${document.documentNumber} ${document.type}`),
      ].join(' ').toLowerCase()
      const matchesSearch = !search || haystack.includes(search)
      return matchesTab && matchesStatus && matchesSearch
    })
  }, [filters, rows])

  const stats = useMemo(() => {
    const complete = rows.filter((row) => row.documentStatus === 'Completo').length
    const partial = rows.filter((row) => row.documentStatus === 'Parziale').length
    const missing = rows.filter((row) => row.documentStatus === 'Da collegare').length
    const linked = rows.reduce((sum, row) => sum + row.linkedDocuments.length, 0)
    return { complete, partial, missing, linked }
  }, [rows])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  if (!rows.length) return null

  return (
    <section className="accounting-section real-accounting-section accounting-linked-documents-section">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Documenti collegati alla contabilità</h2>
          <p>Vista unica movimento → allegati Drive: fattura, bonifico, FIR o scontrino apribili direttamente dalla riga contabile.</p>
        </div>
        <StatusBadge>{filteredRows.length} movimenti</StatusBadge>
      </div>

      <KpiStrip className="accounting-operational-kpis" ariaLabel="Stato documenti collegati">
        <KpiCard icon="check" tone="green" label="Completi" value={stats.complete} hint="Fattura/scontrino + pagamento o documento unico" />
        <KpiCard icon="warning" tone="amber" label="Parziali" value={stats.partial} hint="Allegati presenti ma incompleti" />
        <KpiCard icon="warning" tone="red" label="Da collegare" value={stats.missing} hint="Nessun file sicuro trovato" />
        <KpiCard icon="file" label="Allegati Drive" value={stats.linked} hint="File ordinati apribili" />
      </KpiStrip>

      <FilterGrid ariaLabel="Filtri collegamenti documenti">
        <label className="accounting-search">
          Cerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Fornitore, fattura, bonifico, file..."
          />
        </label>
        <label>
          Lavorazione / tab
          <select value={filters.tab} onChange={(event) => updateFilter('tab', event.target.value)}>
            <option value={ALL}>Tutte</option>
            {tabOptions.map((tab) => <option key={tab} value={tab}>{tab}</option>)}
          </select>
        </label>
        <label>
          Stato documenti
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value={ALL}>Tutti</option>
            <option value="Completo">Completo</option>
            <option value="Parziale">Parziale</option>
            <option value="Da collegare">Da collegare</option>
          </select>
        </label>
      </FilterGrid>

      <div className="accounting-linked-list">
        {filteredRows.slice(0, 80).map((row) => (
          <article className={`accounting-linked-card ${row.documentStatus !== 'Completo' ? 'is-warning' : ''}`.trim()} key={row.id}>
            <span className="accounting-linked-icon"><InternalIcon name={row.documentStatus === 'Da collegare' ? 'warning' : 'file'} size={18} /></span>

            <div className="accounting-linked-body">
              <div className="accounting-linked-head">
                <div>
                  <h3>{row.fornitore} · {row.numeroDocumento}</h3>
                  <p>{row.descrizione} · {row.sheetTab}</p>
                </div>
                <StatusBadge>{row.documentStatus}</StatusBadge>
              </div>

              <dl className="accounting-linked-meta">
                <div><dt>Data</dt><dd>{formatDate(row.data)}</dd></div>
                <div><dt>Categoria</dt><dd>{row.categoria}</dd></div>
                <div><dt>Totale</dt><dd><MoneyValue value={row.totale} /></dd></div>
                <div><dt>Allegati</dt><dd>{row.linkedDocuments.length ? `${row.linkedDocuments.length} file` : 'Nessuno'}</dd></div>
              </dl>

              {row.linkedDocuments.length ? (
                <div className="accounting-document-list">
                  {row.linkedDocuments.map((document) => (
                    <a href={document.url} target="_blank" rel="noreferrer" key={`${row.id}-${document.fileId}`} title={document.fileName}>
                      <strong>{document.type}</strong>
                      <span>{document.fileName}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <small className="accounting-linked-empty">Nessun documento sicuro collegato: controlla Drive o il tab 02_FILE_DA_VERIFICARE.</small>
              )}
            </div>

            <a className="button button-primary button-small accounting-linked-main-action" href={`#/dashboard/contabilita/${row.id}`}>Apri scheda</a>
          </article>
        ))}
      </div>
    </section>
  )
}

function normalizeMovement(row) {
  return {
    id: row.id,
    data: row.data ?? row.dataDocumento,
    descrizione: row.descrizione ?? row.tipoDocumento ?? 'Movimento contabile',
    fornitore: row.fornitore ?? 'Non indicato',
    categoria: row.categoria ?? 'Extra / Altro',
    numeroDocumento: row.numeroDocumento ?? row.fileName ?? row.id,
    sheetTab: row.sheetTab ?? 'Senza tab',
    totale: Number(row.totale || row.importoTotale || 0),
    pagamento: row.pagamento ?? 'Non indicato',
  }
}

function findLinkedDriveDocuments(movement) {
  const numberKey = normalizeKey(movement.numeroDocumento)
  const supplierKey = normalizeKey(movement.fornitore)
  const tabKey = normalizeKey(movement.sheetTab)
  const total = Number(movement.totale || 0)

  const matches = orderedDriveDocuments.filter((document) => {
    const docNumberKey = normalizeKey(document.documentNumber)
    const docFileKey = normalizeKey(document.fileName)
    const docSupplierKey = normalizeKey(document.supplier)
    const docTabKey = normalizeKey(document.tab)
    const sameNumber = numberKey && (docNumberKey.includes(numberKey) || numberKey.includes(docNumberKey) || docFileKey.includes(numberKey))
    const sameSupplier = supplierKey && (docSupplierKey.includes(supplierKey) || supplierKey.includes(docSupplierKey))
    const sameTab = !movement.sheetTab || movement.sheetTab === 'Senza tab' || docTabKey === tabKey
    const sameTotal = total > 0 && Math.abs(Number(document.total || 0) - total) < 0.02

    return sameTab && ((sameNumber && sameSupplier) || (sameNumber && sameTotal) || (sameSupplier && sameTotal))
  })

  return dedupeByFileId(matches).sort((a, b) => documentTypeWeight(a.type) - documentTypeWeight(b.type))
}

function getDocumentStatus(linkedDocuments) {
  if (!linkedDocuments.length) return 'Da collegare'
  const types = new Set(linkedDocuments.map((document) => document.type))
  const hasInvoiceLike = types.has('Fattura') || types.has('Scontrino') || types.has('FIR')
  const hasPayment = types.has('Bonifico')
  if (hasInvoiceLike && hasPayment) return 'Completo'
  if (linkedDocuments.length === 1 && (types.has('Scontrino') || types.has('FIR'))) return 'Completo'
  return 'Parziale'
}

function normalizeKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function dedupeByFileId(documents) {
  const map = new Map()
  documents.forEach((document) => map.set(document.fileId, document))
  return [...map.values()]
}

function documentTypeWeight(type) {
  if (type === 'Fattura') return 1
  if (type === 'Scontrino') return 2
  if (type === 'FIR') return 3
  if (type === 'Bonifico') return 4
  return 9
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'))
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
