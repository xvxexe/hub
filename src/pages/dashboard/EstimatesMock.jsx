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
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState(null)
  const [newEstimate, setNewEstimate] = useState({
    client: '',
    phone: '',
    email: '',
    city: '',
    customerType: 'Privato',
    workType: '',
    urgency: 'Da programmare',
    budget: '',
    contactPreference: 'Telefono',
    priority: 'Media',
    description: '',
    internalNotes: '',
  })
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const urgencyOptions = [...new Set([...store.estimates.map((estimate) => estimate.urgency).filter(Boolean), 'Da programmare', 'Entro 2 settimane', 'Urgente'])]
  const customerTypes = [...new Set([...store.estimates.map((estimate) => estimate.customerType).filter(Boolean), 'Privato', 'Azienda', 'Hotel', 'Negozio', 'Studio tecnico', 'Altro'])]

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

  function updateNewEstimate(field, value) {
    setNewEstimate((current) => ({ ...current, [field]: value }))
  }

  function selectEstimate(estimateId) {
    setSelectedId(estimateId)
  }

  function createEstimate(event) {
    event.preventDefault()
    setCreateStatus(null)

    if (!canEdit || !store.addEstimate) {
      setCreateStatus({ type: 'error', message: 'Creazione preventivo non disponibile per questo ruolo.' })
      return
    }

    if (!newEstimate.client.trim() || !newEstimate.workType.trim()) {
      setCreateStatus({ type: 'error', message: 'Cliente e tipo lavoro sono obbligatori.' })
      return
    }

    const id = `estimate-${Date.now()}`
    const estimate = {
      id,
      ...newEstimate,
      client: newEstimate.client.trim(),
      workType: newEstimate.workType.trim(),
      city: newEstimate.city.trim(),
      phone: newEstimate.phone.trim(),
      email: newEstimate.email.trim(),
      budget: newEstimate.budget.trim() || 'Da definire',
      description: newEstimate.description.trim(),
      internalNotes: newEstimate.internalNotes.trim(),
      requestDate: todayIso(),
      status: 'Nuovo',
      source: 'hub-manual-estimate',
    }

    store.addEstimate(estimate)
    setSelectedId(id)
    setCreateStatus({ type: 'success', message: 'Preventivo creato e salvato nello store operativo.' })
    setNewEstimate({
      client: '',
      phone: '',
      email: '',
      city: '',
      customerType: 'Privato',
      workType: '',
      urgency: 'Da programmare',
      budget: '',
      contactPreference: 'Telefono',
      priority: 'Media',
      description: '',
      internalNotes: '',
    })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Preventivi reali"
        title="Richieste preventivo"
        description="Pipeline commerciale collegata allo store operativo Supabase, con creazione, modifica, priorità e note."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button className="button button-primary button-small" type="button" onClick={() => setIsCreateOpen((current) => !current)}>
          {isCreateOpen ? 'Chiudi' : 'Nuovo preventivo'}
        </button>
      </DashboardHeader>

      {isCreateOpen ? (
        <section className="internal-panel internal-padded admin-invitations-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Nuovo preventivo</h2>
              <p>Inserisci una richiesta arrivata da telefono, WhatsApp, email o sopralluogo.</p>
            </div>
            <StatusBadge>{canEdit ? 'Salvataggio reale' : 'Solo lettura'}</StatusBadge>
          </div>
          <form className="admin-invite-form" onSubmit={createEstimate}>
            <label>Cliente<input value={newEstimate.client} onChange={(event) => updateNewEstimate('client', event.target.value)} placeholder="Nome cliente / azienda" /></label>
            <label>Telefono<input value={newEstimate.phone} onChange={(event) => updateNewEstimate('phone', event.target.value)} placeholder="Numero telefono" /></label>
            <label>Email<input type="email" value={newEstimate.email} onChange={(event) => updateNewEstimate('email', event.target.value)} placeholder="email@cliente.it" /></label>
            <label>Città<input value={newEstimate.city} onChange={(event) => updateNewEstimate('city', event.target.value)} placeholder="Comune / zona" /></label>
            <label>Tipo cliente<select value={newEstimate.customerType} onChange={(event) => updateNewEstimate('customerType', event.target.value)}>{customerTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <label>Tipo lavoro<input value={newEstimate.workType} onChange={(event) => updateNewEstimate('workType', event.target.value)} placeholder="Es. cartongesso, controsoffitto, tinteggiatura..." /></label>
            <label>Urgenza<select value={newEstimate.urgency} onChange={(event) => updateNewEstimate('urgency', event.target.value)}>{urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select></label>
            <label>Budget<input value={newEstimate.budget} onChange={(event) => updateNewEstimate('budget', event.target.value)} placeholder="Es. Da definire / 5.000€" /></label>
            <label>Contatto<select value={newEstimate.contactPreference} onChange={(event) => updateNewEstimate('contactPreference', event.target.value)}><option>Telefono</option><option>WhatsApp</option><option>Email</option></select></label>
            <label>Priorità<select value={newEstimate.priority} onChange={(event) => updateNewEstimate('priority', event.target.value)}>{store.priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
            <label className="full-row">Descrizione<textarea rows="3" value={newEstimate.description} onChange={(event) => updateNewEstimate('description', event.target.value)} placeholder="Descrizione lavori, misure, note sopralluogo..." /></label>
            <label className="full-row">Note interne<textarea rows="3" value={newEstimate.internalNotes} onChange={(event) => updateNewEstimate('internalNotes', event.target.value)} placeholder="Cosa fare dopo, chi deve chiamare, dubbi..." /></label>
            <div className="full-row"><button className="button button-primary" type="submit" disabled={!canEdit}>Crea preventivo</button></div>
          </form>
          {createStatus ? <div className={createStatus.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}><strong>{createStatus.type === 'error' ? 'Errore' : 'Creato'}</strong><p>{createStatus.message}</p></div> : null}
        </section>
      ) : null}

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
            <EmptyState title="Nessun preventivo reale trovato">Crea una nuova richiesta oppure aspetta che arrivino preventivi dal modulo pubblico.</EmptyState>
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

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
