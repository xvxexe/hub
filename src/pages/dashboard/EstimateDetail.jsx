import { useEffect, useState } from 'react'
import { EditableField, EntityTimeline, NotesPanel } from '../../components/EntityPanels'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate } from '../../data/mockCantieri'

const CUSTOMER_TYPES = ['Privato', 'Azienda', 'Hotel', 'Negozio', 'Studio tecnico', 'Altro']
const URGENCY_OPTIONS = ['Da programmare', 'Entro 2 settimane', 'Urgente']
const CONTACT_OPTIONS = ['Telefono', 'WhatsApp', 'Email']

export function EstimateDetail({ estimateId, session, store }) {
  const estimate = store.estimates.find((item) => item.id === estimateId)
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const canDelete = session.role === 'admin'
  const [form, setForm] = useState(estimate ?? {})
  const [statusMessage, setStatusMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setForm(estimate ?? {})
    setStatusMessage(null)
  }, [estimate?.id])

  if (!estimate || session.role === 'employee') {
    return (
      <DashboardHeader eyebrow="Preventivo non disponibile" title="Richiesta non accessibile" description="Il ruolo corrente non può aprire questo dettaglio preventivo.">
        <a className="button button-secondary" href="#/dashboard/preventivi">Torna ai preventivi</a>
      </DashboardHeader>
    )
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function changeStatus(status) {
    if (!canEdit) return
    store.updateEstimateStatus(estimate.id, status)
    setStatusMessage({ type: 'success', message: `Preventivo segnato come ${status}.` })
  }

  function save(event) {
    event.preventDefault()
    if (!canEdit) {
      setStatusMessage({ type: 'error', message: 'Non hai i permessi per modificare questo preventivo.' })
      return
    }

    if (!String(form.client ?? '').trim() || !String(form.workType ?? '').trim()) {
      setStatusMessage({ type: 'error', message: 'Cliente e tipo lavoro sono obbligatori.' })
      return
    }

    store.updateEstimateData(estimate.id, {
      ...form,
      client: String(form.client ?? '').trim(),
      phone: String(form.phone ?? '').trim(),
      email: String(form.email ?? '').trim(),
      city: String(form.city ?? '').trim(),
      workType: String(form.workType ?? '').trim(),
      budget: String(form.budget ?? '').trim() || 'Da definire',
      description: String(form.description ?? '').trim(),
      internalNotes: String(form.internalNotes ?? '').trim(),
    })
    setStatusMessage({ type: 'success', message: 'Preventivo aggiornato nello store operativo.' })
  }

  async function deleteEstimate() {
    if (!canDelete || !store.deleteEstimate) return
    const confirmed = window.confirm(`Eliminare definitivamente il preventivo di ${estimate.client}?`)
    if (!confirmed) return

    setIsDeleting(true)
    const result = await store.deleteEstimate(estimate.id)
    setIsDeleting(false)

    if (!result?.ok) {
      setStatusMessage({ type: 'error', message: result?.error ?? 'Eliminazione preventivo non riuscita.' })
      return
    }

    window.location.assign('#/dashboard/preventivi')
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio preventivo reale"
        title={estimate.client}
        description="Scheda operativa collegata a Supabase: modifica dati, aggiorna stato, aggiungi note e controlla lo storico."
      >
        <StatusBadge>{estimate.status}</StatusBadge>
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
      </DashboardHeader>

      <section className="detail-action-bar">
        <a className="button button-secondary" href="#/dashboard/preventivi">Torna ai preventivi</a>
        {canEdit ? (
          <>
            {store.estimateStatuses.map((status) => (
              <button
                className="button button-secondary"
                type="button"
                key={status}
                disabled={estimate.status === status}
                onClick={() => changeStatus(status)}
              >
                {status}
              </button>
            ))}
            {canDelete ? (
              <button className="button button-secondary warning-action" type="button" onClick={deleteEstimate} disabled={isDeleting}>
                {isDeleting ? 'Elimino…' : 'Elimina'}
              </button>
            ) : null}
          </>
        ) : null}
      </section>

      {statusMessage ? (
        <div className={statusMessage.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{statusMessage.type === 'error' ? 'Attenzione' : 'Salvato'}</strong>
          <p>{statusMessage.message}</p>
        </div>
      ) : null}

      <section className="detail-layout internal-padded">
        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Nome cliente" value={form.client} onChange={(value) => update('client', value)} />
          <EditableField label="Telefono" value={form.phone} onChange={(value) => update('phone', value)} />
          <EditableField label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} />
          <EditableField label="Città" value={form.city} onChange={(value) => update('city', value)} />
          <EditableField label="Tipo cliente" value={form.customerType} onChange={(value) => update('customerType', value)} options={CUSTOMER_TYPES} />
          <EditableField label="Tipo lavoro" value={form.workType} onChange={(value) => update('workType', value)} />
          <EditableField label="Urgenza" value={form.urgency} onChange={(value) => update('urgency', value)} options={URGENCY_OPTIONS} />
          <EditableField label="Budget indicativo" value={form.budget} onChange={(value) => update('budget', value)} />
          <EditableField label="Preferenza contatto" value={form.contactPreference} onChange={(value) => update('contactPreference', value)} options={CONTACT_OPTIONS} />
          <EditableField label="Priorità" value={form.priority} onChange={(value) => update('priority', value)} options={store.priorities} />
          <label className="form-wide">Descrizione<textarea rows="4" value={form.description ?? ''} onChange={(event) => update('description', event.target.value)} /></label>
          <label className="form-wide">Note interne<textarea rows="4" value={form.internalNotes ?? ''} onChange={(event) => update('internalNotes', event.target.value)} /></label>
          <button className="button button-primary" type="submit" disabled={!canEdit}>Salva preventivo</button>
        </form>

        <aside className="info-card">
          <h2>Riepilogo richiesta</h2>
          <dl className="detail-list">
            <div><dt>Stato</dt><dd><StatusBadge>{estimate.status}</StatusBadge></dd></div>
            <div><dt>Priorità</dt><dd><StatusBadge>{estimate.priority}</StatusBadge></dd></div>
            <div><dt>Data richiesta</dt><dd>{formatDate(estimate.requestDate)}</dd></div>
            <div><dt>Contatto</dt><dd>{estimate.contactPreference}</dd></div>
            <div><dt>Budget</dt><dd>{estimate.budget}</dd></div>
            <div><dt>Origine</dt><dd>{estimate.source ?? 'hub-ui'}</dd></div>
          </dl>
          <div className="document-actions-panel">
            <h3>Prossima azione</h3>
            <p>Usa gli stati per seguire il cliente. La conversione preventivo → cantiere sarà il prossimo modulo operativo da completare.</p>
          </div>
        </aside>
      </section>

      <div className="internal-two-column">
        <NotesPanel entityType="estimates" entityId={estimate.id} notes={store.notes} onAddNote={store.addInternalNote} />
        <EntityTimeline entityType="estimates" entityId={estimate.id} activities={store.activities} />
      </div>
    </>
  )
}
