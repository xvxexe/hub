import { useState } from 'react'

export function NotesPanel({ entityType, entityId, notes, onAddNote, canAdd = true, disabledMessage = 'Note non modificabili per il ruolo corrente.' }) {
  const [note, setNote] = useState('')
  const entityNotes = notes.filter((item) => item.entityType === entityType && item.entityId === entityId)

  function submit(event) {
    event.preventDefault()
    if (!canAdd) return
    onAddNote(entityType, entityId, note)
    setNote('')
  }

  return (
    <section className="internal-panel">
      <div className="section-heading">
        <h2>Note interne</h2>
      </div>
      {canAdd ? (
        <form className="inline-note-form" onSubmit={submit}>
          <textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Aggiungi nota interna mock" />
          <button className="button button-primary" type="submit">Aggiungi nota</button>
        </form>
      ) : <p className="muted-text">{disabledMessage}</p>}
      <div className="activity-feed">
        {entityNotes.length > 0 ? entityNotes.map((item) => (
          <article className="activity-item" key={item.id}>
            <span />
            <div>
              <strong>{item.text}</strong>
              <small>{item.author} · {item.date}</small>
            </div>
          </article>
        )) : <p>Nessuna nota interna.</p>}
      </div>
    </section>
  )
}

export function EntityTimeline({ activities, entityType, entityId }) {
  const rows = activities.filter((item) => item.entityType === entityType && item.entityId === entityId)

  return (
    <section className="internal-panel">
      <div className="section-heading">
        <h2>Storico attività</h2>
      </div>
      <div className="activity-feed">
        {rows.length > 0 ? rows.map((item) => (
          <article className="activity-item" key={item.id}>
            <span />
            <div>
              <strong>{item.description}</strong>
              <small>{item.author} · {item.date}</small>
            </div>
          </article>
        )) : <p>Nessuna attività registrata per questo elemento.</p>}
      </div>
    </section>
  )
}

export function EditableField({ label, value, onChange, type = 'text', options, disabled = false }) {
  return (
    <label>
      {label}
      {options ? (
        <select value={value ?? ''} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
      )}
    </label>
  )
}
