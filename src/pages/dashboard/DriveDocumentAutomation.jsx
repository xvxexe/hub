import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { orderedDriveDocuments } from '../../data/orderedDriveDocuments'

const ALL = 'tutti'

export function DriveDocumentAutomation({ session }) {
  const [filters, setFilters] = useState({
    tab: ALL,
    type: ALL,
    category: ALL,
    search: '',
  })

  const canView = session?.role === 'admin' || session?.role === 'accounting' || session?.role === 'employee'

  const options = useMemo(() => ({
    tabs: uniqueSorted(orderedDriveDocuments.map((document) => document.tab)),
    types: uniqueSorted(orderedDriveDocuments.map((document) => document.type)),
    categories: uniqueSorted(orderedDriveDocuments.map((document) => document.category)),
  }), [])

  const filteredDocuments = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return orderedDriveDocuments.filter((document) => {
      const matchesTab = filters.tab === ALL || document.tab === filters.tab
      const matchesType = filters.type === ALL || document.type === filters.type
      const matchesCategory = filters.category === ALL || document.category === filters.category
      const haystack = [
        document.fileName,
        document.documentNumber,
        document.supplier,
        document.tab,
        document.category,
        document.type,
      ].join(' ').toLowerCase()
      const matchesSearch = !search || haystack.includes(search)

      return matchesTab && matchesType && matchesCategory && matchesSearch
    })
  }, [filters])

  const stats = useMemo(() => {
    const total = orderedDriveDocuments.reduce((sum, document) => sum + Number(document.total || 0), 0)
    const filteredTotal = filteredDocuments.reduce((sum, document) => sum + Number(document.total || 0), 0)
    return {
      totalDocuments: orderedDriveDocuments.length,
      filteredDocuments: filteredDocuments.length,
      tabs: options.tabs.length,
      total,
      filteredTotal,
    }
  }, [filteredDocuments, options.tabs.length])

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  if (!canView) {
    return (
      <section className="accounting-alert warning-alert">
        <strong>Accesso non consentito</strong>
        <p>Non hai i permessi per vedere l’archivio documenti Drive.</p>
      </section>
    )
  }

  return (
    <section className="drive-automation-page">
      <DashboardHeader
        eyebrow="Archivio Drive"
        title="Documenti ordinati Barcelo Roma"
        description="Elenco operativo dei file già rinominati e spostati in Drive. I link aprono direttamente il documento originale nella cartella corretta."
      >
        <DataModeBadge>Google Drive condiviso</DataModeBadge>
        <a className="button button-primary button-small" href="https://drive.google.com/drive/folders/1NxsrNnhxOxmgOgpHOQGU_Z5s7BPjLpft" target="_blank" rel="noreferrer">
          Apri cartella EuropaService
        </a>
      </DashboardHeader>

      <KpiStrip ariaLabel="Indicatori documenti Drive">
        <KpiCard icon="file" label="Documenti ordinati" value={stats.totalDocuments} hint="Spostamento sicuri" />
        <KpiCard icon="building" tone="purple" label="Tab / lavorazioni" value={stats.tabs} hint="Cartelle finali" />
        <KpiCard icon="wallet" tone="green" label="Totale documenti" value={<MoneyValue value={stats.total} />} hint="Solo righe sicure" />
        <KpiCard icon="check" tone="green" label="Risultati filtro" value={stats.filteredDocuments} hint={<MoneyValue value={stats.filteredTotal} />} />
      </KpiStrip>

      <section className="accounting-alert success-alert master-source-alert">
        <strong>Archivio accessibile dal sito</strong>
        <p>
          La cartella EuropaService è condivisa con “Chiunque abbia il link può visualizzare”, quindi i pulsanti Apri documento funzionano anche dal sito.
          I file dubbi restano esclusi e vanno risolti dal tab 02_FILE_DA_VERIFICARE nel master.
        </p>
      </section>

      <FilterGrid ariaLabel="Filtri documenti Drive">
        <label className="accounting-search">
          Cerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Fornitore, documento, file..."
          />
        </label>
        <label>
          Lavorazione / cartella
          <select value={filters.tab} onChange={(event) => updateFilter('tab', event.target.value)}>
            <option value={ALL}>Tutte</option>
            {options.tabs.map((tab) => <option key={tab} value={tab}>{tab}</option>)}
          </select>
        </label>
        <label>
          Tipo documento
          <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value={ALL}>Tutti</option>
            {options.types.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Categoria
          <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
            <option value={ALL}>Tutte</option>
            {options.categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
      </FilterGrid>

      <WorkspaceLayout
        className="drive-automation-workspace"
        sidebar={(
          <aside className="internal-panel drive-automation-side">
            <div className="section-heading panel-title-row">
              <div>
                <h2>Regole archivio</h2>
                <p>Questa pagina mostra solo file già considerati sicuri.</p>
              </div>
              <StatusBadge>Drive</StatusBadge>
            </div>
            <dl className="detail-list drive-config-list">
              <div><dt>Cantiere</dt><dd>Barcelò Roma</dd></div>
              <div><dt>Origine</dt><dd>01_SPOSTAMENTO_SICURI</dd></div>
              <div><dt>Esclusi</dt><dd>Duplicati, split, Booking dubbi, extra aprile/maggio</dd></div>
              <div><dt>Prossimo step</dt><dd>Classificare 02_FILE_DA_VERIFICARE</dd></div>
            </dl>
            <ActionList className="drive-automation-actions">
              <a className="button button-secondary" href="#/dashboard/documenti">Centro documenti</a>
              <a className="button button-secondary" href="#/dashboard/contabilita">Contabilità</a>
            </ActionList>
          </aside>
        )}
      >
        <section className="internal-panel drive-automation-preview">
          <div className="section-heading panel-title-row">
            <div>
              <h2>File ordinati ({filteredDocuments.length})</h2>
              <p>Apri il documento originale su Drive, oppure usa il nome file per controllarlo nel master.</p>
            </div>
            <StatusBadge>Link attivi</StatusBadge>
          </div>

          <div className="document-card-list">
            {filteredDocuments.map((document) => (
              <DataCardRow
                key={document.fileId}
                icon={getIcon(document.type)}
                title={document.fileName}
                description={`${document.supplier} · ${document.tab}`}
                status={document.type}
                meta={[
                  { label: 'Data', value: formatDate(document.date) },
                  { label: 'Documento', value: document.documentNumber },
                  { label: 'Categoria', value: document.category },
                  { label: 'Totale', value: <MoneyValue value={document.total} /> },
                ]}
                action={(
                  <ActionList>
                    <a className="button button-primary button-small" href={document.url} target="_blank" rel="noreferrer">Apri documento</a>
                    <a className="button button-secondary button-small" href={buildPreviewUrl(document.fileId)} target="_blank" rel="noreferrer">Preview</a>
                  </ActionList>
                )}
              />
            ))}
          </div>
        </section>
      </WorkspaceLayout>
    </section>
  )
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'it'))
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function buildPreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
}

function getIcon(type) {
  if (type === 'Bonifico') return 'wallet'
  if (type === 'FIR') return 'warning'
  return 'file'
}
