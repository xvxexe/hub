import { useState } from 'react'
import { EditableField, EntityTimeline, NotesPanel } from '../../components/EntityPanels'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate } from '../../data/mockCantieri'

export function EstimateDetail({ estimateId, session, store }) {
  const estimate = store.estimates.find((item) => item.id === estimateId)
  const canEdit = session.role === 'admin'
  const [form, setForm] = useState(estimate ?? {})

  if (!estimate || session.role === 'employee') {
    return (
      <DashboardHeader eyebrow="Preventivo non disponibile" title="Richiesta non accessibile" description="Il ruolo corrente non può aprire questo dettaglio preventivo.">
        <a className="button button-secondary" href="#/dashboard">Torna alla dashboard</a>
      </DashboardHeader>
    )
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function save(event) {
    event.preventDefault()
    store.updateEstimateData(estimate.id, form)
  }

  return (
    <>
      <DashboardHeader eyebrow="Dettaglio preventivo" title={estimate.client} description="Scheda mock della richiesta con stato, priorità, note e storico.">
        <StatusBadge>{estimate.status}</StatusBadge>
        <DataModeBadge />
      </DashboardHeader>

      <section className="detail-action-bar">
        <a className="button button-secondary" href="#/dashboard/preventivi">Torna ai preventivi</a>
        {canEdit ? (
          <>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Da valutare')}>Da valutare</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Contattato')}>Contattato</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'In attesa cliente')}>In attesa cliente</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Accettato')}>Accetta</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Rifiutato')}>Rifiuta</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateEstimateStatus(estimate.id, 'Archiviato')}>Archivia</button>
          </>
        ) : null}
      </section>

      <section className="detail-layout internal-padded">
        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Nome cliente" value={form.client} onChange={(value) => update('client', value)} />
          <EditableField label="Telefono" value={form.phone} onChange={(value) => update('phone', value)} />
          <EditableField label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
          <EditableField label="Città" value={form.city} onChange={(value) => update('city', value)} />
          <EditableField label="Tipo cliente" value={form.customerType} onChange={(value) => update('customerType', value)} options={['Privato', 'Azienda', 'Hotel', 'Negozio', 'Studio tecnico', 'Altro']} />
          <EditableField label="Tipo lavoro" value={form.workType} onChange={(value) => update('workType', value)} />
          <EditableField label="Urgenza" value={form.urgency} onChange={(value) => update('urgency', value)} options={['Da programmare', 'Entro 2 settimane', 'Urgente']} />
          <EditableField label="Budget indicativo" value={form.budget} onChange={(value) => update('budget', value)} />
          <EditableField label="Preferenza contatto" value={form.contactPreference} onChange={(value) => update('contactPreference', value)} options={['Telefono', 'WhatsApp', 'Email']} />
          <EditableField label="Priorità" value={form.priority} onChange={(value) => update('priority', value)} options={store.priorities} />
          <label className="form-wide">Descrizione<textarea rows="4" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} /></label>
          <label className="form-wide">Note interne<textarea rows="4" value={form.internalNotes ?? ''} onChange={(event) => update('internalNotes', event.target.value)} /></label>
          <button className="button button-primary" type="submit" disabled={!canEdit}>Salva preventivo mock</button>
          <button className="button button-secondary" type="button" disabled>Converti in cantiere mock</button>
        </form>

        <aside className="info-card">
          <h2>Riepilogo richiesta</h2>
          <dl className="detail-list">
            <div><dt>Stato</dt><dd><StatusBadge>{estimate.status}</StatusBadge></dd></div>
            <div><dt>Priorità</dt><dd><StatusBadge>{estimate.priority}</StatusBadge></dd></div>
            <div><dt>Data richiesta</dt><dd>{formatDate(estimate.requestDate)}</dd></div>
            <div><dt>Contatto</dt><dd>{estimate.contactPreference}</dd></div>
            <div><dt>Budget</dt><dd>{estimate.budget}</dd></div>
          </dl>
        </aside>
      </section>

      <div className="internal-two-column">
        <NotesPanel entityType="estimates" entityId={estimate.id} notes={store.notes} onAddNote={store.addInternalNote} />
        <EntityTimeline entityType="estimates" entityId={estimate.id} activities={store.activities} />
      </div>
    </>
  )
}
