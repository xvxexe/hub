import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { DashboardHeader, DataModeBadge, StatCard } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'

export function EstimatesMock({ session, store }) {
  const [filters, setFilters] = useState({ status: 'tutti', urgency: 'tutti', customerType: 'tutti' })
  const canEdit = session.role === 'admin'
  const urgencyOptions = [...new Set(store.estimates.map((estimate) => estimate.urgency))]
  const customerTypes = [...new Set(store.estimates.map((estimate) => estimate.customerType))]

  const rows = useMemo(() => store.estimates.filter((estimate) => {
    const matchesStatus = filters.status === 'tutti' || estimate.status === filters.status
    const matchesUrgency = filters.urgency === 'tutti' || estimate.urgency === filters.urgency
    const matchesCustomer = filters.customerType === 'tutti' || estimate.customerType === filters.customerType
    return matchesStatus && matchesUrgency && matchesCustomer
  }), [filters, store.estimates])

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader eyebrow="Preventivi" title="Richieste preventivo" description="Pipeline mock delle richieste ricevute dal sito pubblico.">
        <DataModeBadge />
      </DashboardHeader>

      <section className="stats-grid">
        <StatCard label="Preventivi filtrati" value={rows.length} />
        <StatCard label="Nuovi" value={store.estimates.filter((item) => item.status === 'Nuovo').length} />
        <StatCard label="Da valutare" value={store.estimates.filter((item) => item.status === 'Da valutare').length} />
        <StatCard label="Contattati" value={store.estimates.filter((item) => item.status === 'Contattato').length} />
      </section>

      <section className="cantieri-tools document-filters">
        <label>Stato<select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="tutti">Tutti</option>
          {store.estimateStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select></label>
        <label>Urgenza<select value={filters.urgency} onChange={(event) => update('urgency', event.target.value)}>
          <option value="tutti">Tutte</option>
          {urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}
        </select></label>
        <label>Tipo cliente<select value={filters.customerType} onChange={(event) => update('customerType', event.target.value)}>
          <option value="tutti">Tutti</option>
          {customerTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select></label>
      </section>

      <section className="accounting-section">
        {rows.length > 0 ? (
          <div className="document-list">
            {rows.map((estimate) => (
              <article className="document-row" key={estimate.id}>
                <div>
                  <div className="recent-upload-title">
                    <h3>{estimate.client}</h3>
                    <StatusBadge>{estimate.status}</StatusBadge>
                  </div>
                  <p>{estimate.workType} · {estimate.customerType} · {estimate.city}</p>
                  <small>{estimate.urgency} · {estimate.budget} · Priorità {estimate.priority}</small>
                </div>
                <div className="row-actions">
                  <a className="button button-secondary" href={`#/dashboard/preventivi/${estimate.id}`}>Apri</a>
                  {canEdit ? (
                    <>
                      <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Contattato')}>Contattato</button>
                      <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'In attesa cliente')}>In attesa</button>
                      <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Accettato')}>Accetta</button>
                      <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Rifiutato')}>Rifiuta</button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nessun preventivo trovato">Modifica i filtri per visualizzare altre richieste mock.</EmptyState>
        )}
      </section>
    </>
  )
}
