import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
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
import { StatusBadge } from '../../components/StatusBadge'

export function EstimatesMock({ session, store }) {
  const [filters, setFilters] = useState({
    status: 'tutti',
    urgency: 'tutti',
    customerType: 'tutti',
    search: '',
  })
  const [selectedId, setSelectedId] = useState(store.estimates[0]?.id ?? null)
  const canEdit = session.role === 'admin'
  const urgencyOptions = [...new Set(store.estimates.map((estimate) => estimate.urgency).filter(Boolean))]
  const customerTypes = [...new Set(store.estimates.map((estimate) => estimate.customerType).filter(Boolean))]

  const rows = useMemo(() => store.estimates.filter((estimate) => {
    const search = filters.search.trim().toLowerCase()
    const matchesStatus = filters.status === 'tutti' || estimate.status === filters.status
    const matchesUrgency = filters.urgency === 'tutti' || estimate.urgency === filters.urgency
    const matchesCustomer = filters.customerType === 'tutti' || estimate.customerType === filters.customerType
    const haystack = [
      estimate.client,
      estimate.workType,
      estimate.customerType,
      estimate.city,
      estimate.urgency,
      estimate.budget,
      estimate.priority,
      estimate.status,
    ].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = search === '' || haystack.includes(search)
    return matchesStatus && matchesUrgency && matchesCustomer && matchesSearch
  }), [filters, store.estimates])

  const selectedEstimate = rows.find((estimate) => estimate.id === selectedId) ?? rows[0] ?? store.estimates[0]
  const newCount = store.estimates.filter((item) => item.status === 'Nuovo').length
  const toEvaluate = store.estimates.filter((item) => item.status === 'Da valutare').length
  const contacted = store.estimates.filter((item) => item.status === 'Contattato').length
  const pipeline = buildPipeline(store.estimates, store.estimateStatuses)

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function selectEstimate(estimateId) {
    setSelectedId(estimateId)
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Preventivi"
        title="Richieste preventivo"
        description="Pipeline commerciale collegata allo store Supabase, con filtri, priorità e azioni nello stesso stile della dashboard."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-primary button-small" href="#/preventivo">Modulo pubblico</a>
      </DashboardHeader>

      <FilterGrid ariaLabel="Filtri preventivi">
        <label>
          Cerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Cliente, città, lavoro, budget..."
          />
        </label>
        <label>
          Stato
          <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
            <option value="tutti">Tutti</option>
            {store.estimateStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          Urgenza
          <select value={filters.urgency} onChange={(event) => update('urgency', event.target.value)}>
            <option value="tutti">Tutte</option>
            {urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}
          </select>
        </label>
        <label>
          Tipo cliente
          <select value={filters.customerType} onChange={(event) => update('customerType', event.target.value)}>
            <option value="tutti">Tutti</option>
            {customerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori preventivi">
        <KpiCard icon="estimate" label="Preventivi filtrati" value={rows.length} hint={`${store.estimates.length} totali`} />
        <KpiCard icon="plus" label="Nuovi" value={newCount} hint="Da aprire" />
        <KpiCard icon="warning" tone="amber" label="Da valutare" value={toEvaluate} hint="Priorità commerciale" />
        <KpiCard icon="check" tone="green" label="Contattati" value={contacted} hint="Follow-up avviato" />
      </KpiStrip>

      <WorkspaceLayout
        className="estimates-workspace"
        sidebar={(
          <>
            {selectedEstimate ? (
              <EstimateContextPanel estimate={selectedEstimate} canEdit={canEdit} store={store} />
            ) : (
              <SideContextPanel title="Preventivo selezionato" description="Seleziona una richiesta per vedere dettagli e azioni." />
            )}
            <PipelinePanel pipeline={pipeline} />
          </>
        )}
      >
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Pipeline richieste ({rows.length})</h2>
              <p>Lista operativa compatta: cliente, lavoro, priorità e azioni principali sempre visibili.</p>
            </div>
            <StatusBadge>{filters.status === 'tutti' ? 'Tutti gli stati' : filters.status}</StatusBadge>
          </div>

          {rows.length > 0 ? (
            <div className="document-card-list">
              {rows.map((estimate) => (
                <DataCardRow
                  key={estimate.id}
                  icon="estimate"
                  selected={selectedEstimate?.id === estimate.id}
                  title={estimate.client}
                  description={`${estimate.workType} · ${estimate.customerType} · ${estimate.city}`}
                  status={estimate.status}
                  meta={[
                    { label: 'Urgenza', value: estimate.urgency ?? '-' },
                    { label: 'Budget', value: estimate.budget ?? '-' },
                    { label: 'Priorità', value: estimate.priority ?? '-' },
                    { label: 'Cliente', value: estimate.customerType ?? '-' },
                    { label: 'Città', value: estimate.city ?? '-' },
                  ]}
                  action={(
                    <ActionList>
                      <button className="button button-secondary button-small" type="button" onClick={() => selectEstimate(estimate.id)}>
                        Anteprima
                      </button>
                      <a className="button button-secondary button-small" href={`#/dashboard/preventivi/${estimate.id}`}>Apri</a>
                    </ActionList>
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nessun preventivo reale trovato">Quando arriveranno richieste preventivo reali, verranno mostrate qui da Supabase.</EmptyState>
          )}
        </section>
      </WorkspaceLayout>
    </>
  )
}

function EstimateContextPanel({ estimate, canEdit, store }) {
  return (
    <SideContextPanel
      title="Preventivo selezionato"
      description="Dettaglio rapido per decidere il prossimo passaggio senza uscire dalla pagina."
      action={<a className="button button-secondary button-small" href={`#/dashboard/preventivi/${estimate.id}`}>Apri</a>}
    >
      <div className="document-preview-sheet">
        <div className="recent-upload-title">
          <h3>{estimate.client}</h3>
          <StatusBadge>{estimate.status}</StatusBadge>
        </div>
        <p>{estimate.workType}</p>
        <small>{estimate.customerType} · {estimate.city}</small>
      </div>

      <section className="extracted-data">
        <h3>Dati richiesta</h3>
        <dl className="detail-list">
          <div><dt>Cliente</dt><dd>{estimate.client ?? '-'}</dd></div>
          <div><dt>Lavoro</dt><dd>{estimate.workType ?? '-'}</dd></div>
          <div><dt>Tipo cliente</dt><dd>{estimate.customerType ?? '-'}</dd></div>
          <div><dt>Città</dt><dd>{estimate.city ?? '-'}</dd></div>
          <div><dt>Urgenza</dt><dd>{estimate.urgency ?? '-'}</dd></div>
          <div><dt>Budget</dt><dd>{estimate.budget ?? '-'}</dd></div>
          <div><dt>Priorità</dt><dd>{estimate.priority ?? '-'}</dd></div>
        </dl>
      </section>

      {canEdit ? (
        <section className="document-actions-panel">
          <h3>Azioni admin</h3>
          <button className="button button-success" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Contattato')}>Segna contattato</button>
          <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'In attesa cliente')}>In attesa cliente</button>
          <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Accettato')}>Accetta</button>
          <button className="button button-secondary warning-action" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Rifiutato')}>Rifiuta</button>
          <MobileActionMenu label="Altre azioni">
            <a className="button button-secondary" href={`#/dashboard/preventivi/${estimate.id}`}>Apri dettaglio</a>
          </MobileActionMenu>
        </section>
      ) : (
        <section className="document-actions-panel">
          <h3>Azioni</h3>
          <a className="button button-secondary" href={`#/dashboard/preventivi/${estimate.id}`}>Apri dettaglio</a>
        </section>
      )}
    </SideContextPanel>
  )
}

function PipelinePanel({ pipeline }) {
  return (
    <SideContextPanel title="Pipeline" description="Riepilogo veloce per stato richiesta.">
      <div className="compact-upload-list">
        {pipeline.map((item) => (
          <article className="compact-upload-row" key={item.status}>
            <span className="file-chip file-pdf">{item.count}</span>
            <div>
              <strong>{item.status}</strong>
              <small>{item.hint}</small>
            </div>
            <StatusBadge>{item.count}</StatusBadge>
          </article>
        ))}
      </div>
    </SideContextPanel>
  )
}

function buildPipeline(estimates, statuses) {
  const sourceStatuses = statuses.length ? statuses : [...new Set(estimates.map((estimate) => estimate.status).filter(Boolean))]
  return sourceStatuses.map((status) => {
    const count = estimates.filter((estimate) => estimate.status === status).length
    return {
      status,
      count,
      hint: count === 1 ? '1 richiesta' : `${count} richieste`,
    }
  })
}
