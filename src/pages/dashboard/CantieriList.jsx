import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

export function CantieriList({ documents = [] }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('tutti')
  const [sort, setSort] = useState('spese-desc')
  const [page, setPage] = useState(1)
  const [selectedCantiereId, setSelectedCantiereId] = useState(null)
  const [modalAction, setModalAction] = useState(null)
  const cantieri = useMemo(() => buildCantieriFromDocuments(documents), [documents])

  const filteredCantieri = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return cantieri
      .filter((cantiere) => {
        const matchesSearch =
          normalizedSearch === '' ||
          cantiere.nome.toLowerCase().includes(normalizedSearch) ||
          cantiere.localita.toLowerCase().includes(normalizedSearch) ||
          cantiere.responsabile.toLowerCase().includes(normalizedSearch)
        const matchesStatus = status === 'tutti' || cantiere.stato === status
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sort === 'spese-desc') return b.spese - a.spese
        if (sort === 'spese-asc') return a.spese - b.spese
        if (sort === 'movimenti-desc') return b.movimenti - a.movimenti
        if (sort === 'criticita-desc') return b.criticita - a.criticita
        if (sort === 'aggiornamento-desc') return new Date(b.lastDate || 0) - new Date(a.lastDate || 0)
        if (sort === 'nome') return a.nome.localeCompare(b.nome)
        return b.avanzamento - a.avanzamento
      })
  }, [cantieri, search, sort, status])

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredCantieri.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedCantieri = filteredCantieri.slice(pageStart, pageStart + pageSize)
  const selectedCantiere = filteredCantieri.find((item) => item.id === selectedCantiereId) ?? filteredCantieri[0] ?? cantieri[0]
  const selectedDocuments = selectedCantiere ? documents.filter((item) => (item.cantiereId ?? 'barcelo-roma') === selectedCantiere.id) : []
  const criticalDocuments = documents.filter(isCriticalDocument)
  const totalCost = cantieri.reduce((sum, item) => sum + item.spese, 0)
  const active = cantieri.filter((item) => item.stato === 'attivo').length
  const toReview = cantieri.filter((item) => item.stato === 'da-verificare').length
  const averageCost = cantieri.length ? totalCost / cantieri.length : 0

  function updateSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function updateStatus(value) {
    setStatus(value)
    setPage(1)
  }

  function updateSort(value) {
    setSort(value)
    setPage(1)
  }

  function selectCantiere(id) {
    setSelectedCantiereId(id)
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Cantieri reali"
        title="Gestione cantieri"
        description="Vista operativa compatta: trovi il cantiere, controlli costi, criticità, documenti e azioni collegate."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => setModalAction(mockActions.newSite)}
        >
          <InternalIcon name="plus" size={16} />
          Nuovo cantiere
        </button>
      </DashboardHeader>

      <FilterGrid ariaLabel="Filtri cantieri">
        <label>
          Cerca
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Nome, zona o responsabile..."
          />
        </label>
        <label>
          Stato
          <select value={status} onChange={(event) => updateStatus(event.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="attivo">In corso</option>
            <option value="da-verificare">Da controllare</option>
          </select>
        </label>
        <label>
          Ordina elenco
          <select value={sort} onChange={(event) => updateSort(event.target.value)}>
            <option value="spese-desc">Spese più alte</option>
            <option value="spese-asc">Spese più basse</option>
            <option value="criticita-desc">Più criticità</option>
            <option value="movimenti-desc">Più movimenti</option>
            <option value="aggiornamento-desc">Ultimo aggiornamento</option>
            <option value="nome">Nome A-Z</option>
          </select>
        </label>
        <label>
          Risultati
          <input readOnly value={`${filteredCantieri.length} cantieri mostrati`} />
        </label>
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori cantieri">
        <KpiCard icon="building" label="Cantieri" value={cantieri.length} hint={`${active} in corso`} />
        <KpiCard icon="warning" tone="amber" label="Da controllare" value={toReview} hint={`${criticalDocuments.length} documenti critici`} />
        <KpiCard icon="wallet" tone="green" label="Totale spese" value={<MoneyValue value={totalCost} />} hint="Somma cantieri" />
        <KpiCard icon="report" tone="purple" label="Media cantiere" value={<MoneyValue value={averageCost} />} hint="Costo medio" />
      </KpiStrip>

      <WorkspaceLayout
        className="cantieri-workspace"
        sidebar={(
          <>
            {selectedCantiere ? <SelectedSitePanel cantiere={selectedCantiere} documents={selectedDocuments} /> : null}
            <CriticalDocumentsPanel documents={criticalDocuments} />
            <ActionsPanel selectedCantiere={selectedCantiere} />
          </>
        )}
      >
        <section className="internal-panel cantieri-master-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Elenco operativo</h2>
              <p>Lista principale: scegli il cantiere e confronta costi, stato, criticità e aggiornamenti.</p>
            </div>
            <span className="data-mode-badge">{getSortLabel(sort)}</span>
          </div>

          {filteredCantieri.length > 0 ? (
            <>
              <div className="document-card-list cantieri-card-list">
                {paginatedCantieri.map((cantiere) => (
                  <CantiereRow
                    cantiere={cantiere}
                    isSelected={selectedCantiere?.id === cantiere.id}
                    key={cantiere.id}
                    onSelect={selectCantiere}
                  />
                ))}
              </div>
              <div className="pagination-bar cantieri-pagination">
                <span>
                  {pageStart + 1} - {Math.min(pageStart + pageSize, filteredCantieri.length)} di {filteredCantieri.length}
                </span>
                <div>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      aria-current={currentPage === pageNumber ? 'page' : undefined}
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <section className="empty-state">
              <h2>Nessun cantiere trovato</h2>
              <p>Modifica ricerca, stato o ordinamento per visualizzare altri cantieri.</p>
            </section>
          )}
        </section>
      </WorkspaceLayout>

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

const mockActions = {
  newSite: {
    icon: 'building',
    title: 'Nuovo cantiere',
    text: 'Prepara un nuovo cantiere da collegare a documenti, contabilità e report.',
    confirmLabel: 'Crea bozza',
    fields: [
      { label: 'Nome cantiere', placeholder: 'Es. Barcelò Roma - Fase 2' },
      { label: 'Località', placeholder: 'Es. Roma' },
    ],
  },
}

function CantiereRow({ cantiere, isSelected, onSelect }) {
  return (
    <DataCardRow
      icon="building"
      selected={isSelected}
      title={cantiere.nome}
      description={`${cantiere.localita} · ${cantiere.responsabile}`}
      status={displaySiteStatus(cantiere)}
      warning={cantiere.criticita > 0}
      onClick={() => onSelect(cantiere.id)}
      meta={[
        { label: 'Spese', value: <MoneyValue value={cantiere.spese} /> },
        { label: 'Movimenti', value: cantiere.movimenti },
        { label: 'Criticità', value: cantiere.criticita },
        { label: 'Aggiornato', value: formatDate(cantiere.lastDate) },
      ]}
      action={(
        <ActionList>
          <button className="button button-secondary button-small" type="button" onClick={(event) => { event.stopPropagation(); onSelect(cantiere.id) }}>Anteprima</button>
          <a className="button button-secondary button-small" href={`#/dashboard/cantieri/${cantiere.id}`} onClick={(event) => event.stopPropagation()}>Apri</a>
        </ActionList>
      )}
    >
      <ProgressBar value={cantiere.avanzamento} />
    </DataCardRow>
  )
}

function SelectedSitePanel({ cantiere, documents }) {
  const categoryPreview = getCategoryPreview(documents)

  return (
    <SideContextPanel
      className="selected-cantiere-panel"
      title="Cantiere selezionato"
      description="Riepilogo rapido collegato alla riga scelta."
      action={<a className="button button-secondary button-small" href={`#/dashboard/cantieri/${cantiere.id}`}>Dettaglio</a>}
    >
      <div className="selected-site-hero">
        <span className="site-avatar">ES</span>
        <div>
          <strong>{cantiere.nome}</strong>
          <small>{cantiere.localita}</small>
        </div>
      </div>
      <dl className="selected-site-meta">
        <div><dt>Spese</dt><dd><MoneyValue value={cantiere.spese} /></dd></div>
        <div><dt>Movimenti</dt><dd>{cantiere.movimenti}</dd></div>
        <div><dt>Criticità</dt><dd>{cantiere.criticita}</dd></div>
        <div><dt>Ultimo agg.</dt><dd>{formatDate(cantiere.lastDate)}</dd></div>
      </dl>
      <ProgressBar value={cantiere.avanzamento} />
      <div className="selected-category-list">
        {categoryPreview.length > 0 ? categoryPreview.map((item) => (
          <div key={item.categoria}>
            <span>{item.categoria}</span>
            <strong><MoneyValue value={item.totale} /></strong>
          </div>
        )) : <p>Nessuna categoria collegata.</p>}
      </div>
    </SideContextPanel>
  )
}

function CriticalDocumentsPanel({ documents }) {
  return (
    <SideContextPanel
      className="cantieri-critical-panel"
      title="Da controllare"
      description="Documenti critici collegati ai cantieri."
      action={<a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a>}
    >
      <div className="document-card-list">
        {documents.length > 0 ? documents.slice(0, 5).map((item) => (
          <DataCardRow
            key={item.id}
            icon="warning"
            title={item.numeroDocumento ?? item.descrizione}
            description={`${item.cantiere} · ${item.fornitore}`}
            status={normalizeDocumentStatus(item.statoVerifica)}
            href={`#/dashboard/documenti/${item.id}`}
            warning
            meta={[
              { label: 'Tipo', value: item.tipoDocumento ?? 'Documento' },
              { label: 'Totale', value: <MoneyValue value={item.totale || item.importoTotale || 0} /> },
            ]}
          />
        )) : (
          <article className="accounting-alert"><strong>Nessuna criticità aperta</strong><small>I documenti importati risultano ordinati.</small></article>
        )}
      </div>
    </SideContextPanel>
  )
}

function ActionsPanel({ selectedCantiere }) {
  return (
    <SideContextPanel title="Azioni rapide" description="Scorciatoie collegate al cantiere selezionato.">
      <div className="quick-actions-grid">
        <a className="quick-action-card" href={selectedCantiere ? `#/dashboard/cantieri/${selectedCantiere.id}` : '#/dashboard/cantieri'}>
          <InternalIcon name="building" size={18} />
          <strong>Apri dettaglio</strong>
          <span>Cantiere</span>
        </a>
        <a className="quick-action-card" href="#/dashboard/documenti">
          <InternalIcon name="file" size={18} />
          <strong>Documenti</strong>
          <span>Verifica</span>
        </a>
        <a className="quick-action-card" href="#/dashboard/contabilita">
          <InternalIcon name="wallet" size={18} />
          <strong>Contabilità</strong>
          <span>Costi</span>
        </a>
        <a className="quick-action-card" href="#/dashboard/report">
          <InternalIcon name="report" size={18} />
          <strong>Report</strong>
          <span>Riepilogo</span>
        </a>
      </div>
    </SideContextPanel>
  )
}

function buildCantieriFromDocuments(documents) {
  const groups = documents.reduce((acc, document) => {
    const id = document.cantiereId ?? 'barcelo-roma'
    const name = document.cantiere ?? 'Barcelò Roma'
    if (!acc[id]) {
      acc[id] = {
        id,
        nome: name,
        localita: id === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da Google Sheets',
        responsabile: 'Gianni Europa',
        spese: 0,
        movimenti: 0,
        criticita: 0,
        lastDate: document.dataDocumento,
      }
    }
    acc[id].spese += Number(document.totale || document.importoTotale || 0)
    acc[id].movimenti += Number(document.movimentiCount || 1)
    if (isCriticalDocument(document)) acc[id].criticita += 1
    if (document.dataDocumento && new Date(document.dataDocumento) > new Date(acc[id].lastDate || 0)) {
      acc[id].lastDate = document.dataDocumento
    }
    return acc
  }, {})

  const sites = Object.values(groups)
  const maxTotal = Math.max(...sites.map((site) => site.spese), 1)
  return sites.map((site) => ({
    ...site,
    stato: site.criticita > 0 ? 'da-verificare' : 'attivo',
    avanzamento: Math.max(5, Math.round((site.spese / maxTotal) * 100)),
  }))
}

function getCategoryPreview(documents) {
  const grouped = documents.reduce((acc, document) => {
    const categoria = document.categoria ?? 'Extra / Altro'
    acc[categoria] = (acc[categoria] ?? 0) + Number(document.totale || document.importoTotale || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([categoria, totale]) => ({ categoria, totale }))
    .sort((a, b) => b.totale - a.totale)
    .slice(0, 4)
}

function isCriticalDocument(document) {
  return ['Possibile duplicato', 'Incompleto', 'Da verificare'].includes(document.statoVerifica)
}

function displaySiteStatus(cantiere) {
  if (cantiere.stato === 'attivo') return 'In corso'
  if (cantiere.stato === 'da-verificare') return 'Da controllare'
  return cantiere.stato
}

function normalizeDocumentStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function getSortLabel(sort) {
  const labels = {
    'spese-desc': 'Spese alte',
    'spese-asc': 'Spese basse',
    'criticita-desc': 'Criticità',
    'movimenti-desc': 'Movimenti',
    'aggiornamento-desc': 'Aggiornamento',
    nome: 'Nome',
  }

  return labels[sort] ?? 'Ordine'
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
