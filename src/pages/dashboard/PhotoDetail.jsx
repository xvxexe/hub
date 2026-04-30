import { useState } from 'react'
import { EditableField, EntityTimeline, NotesPanel } from '../../components/EntityPanels'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate } from '../../data/mockCantieri'

export function PhotoDetail({ photoId, session, store }) {
  const photo = store.photos.find((item) => item.id === photoId)
  const canPublish = session.role === 'admin'
  const canEditOwnNote = session.role === 'employee' && photo?.caricatoDa === session.name && photo?.stato === 'Da revisionare'
  const canAddNote = canPublish || canEditOwnNote
  const backHref = session.role === 'employee' ? '#/dashboard/caricamenti' : '#/dashboard/foto'
  const [form, setForm] = useState(photo ?? {})

  if (!photo || (session.role === 'employee' && photo.caricatoDa !== session.name)) {
    return (
      <DashboardHeader eyebrow="Foto non disponibile" title="Foto non accessibile" description="Il ruolo corrente può vedere solo le foto consentite.">
        <a className="button button-secondary" href={backHref}>Torna indietro</a>
      </DashboardHeader>
    )
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function save(event) {
    event.preventDefault()
    if (session.role === 'employee') {
      if (!canEditOwnNote) return
      store.updatePhotoData(photo.id, { nota: form.nota })
      return
    }
    store.updatePhotoData(photo.id, form)
  }

  return (
    <>
      <DashboardHeader eyebrow="Dettaglio foto" title={`${photo.cantiere} · ${photo.zona}`} description="Revisione foto, pubblicabilità mock e note operative.">
        <StatusBadge>{photo.stato}</StatusBadge>
        <DataModeBadge />
      </DashboardHeader>

      <section className="detail-action-bar">
        <a className="button button-secondary" href={backHref}>Torna indietro</a>
        {canPublish ? (
          <>
            <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Da revisionare')}>Rimetti da revisionare</button>
            <button className="button button-secondary" type="button" onClick={() => store.approvePhoto(photo.id)}>Approva</button>
            <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Non pubblicabile')}>Non pubblicabile</button>
            <button className="button button-secondary" type="button" onClick={() => store.markPhotoPublicable(photo.id, true)}>Pubblicabile</button>
            <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Pubblicata')}>Pubblica</button>
          </>
        ) : null}
      </section>

      <section className="detail-layout internal-padded">
        <article className="info-card">
          <FilePreviewMock fileName={photo.fileName} type="image" />
          <dl className="detail-list">
            <div><dt>Cantiere</dt><dd>{photo.cantiere}</dd></div>
            <div><dt>Avanzamento</dt><dd>{photo.avanzamento}</dd></div>
            <div><dt>Pubblicabile</dt><dd>{photo.pubblicabile}</dd></div>
            <div><dt>Pubblicata</dt><dd>{photo.stato === 'Pubblicata' ? 'Sì' : 'No'}</dd></div>
            <div><dt>Caricata da</dt><dd>{photo.caricatoDa}</dd></div>
            <div><dt>Data</dt><dd>{formatDate(photo.dataCaricamento)}</dd></div>
          </dl>
        </article>

        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Zona" value={form.zona} onChange={(value) => update('zona', value)} disabled={!canPublish} />
          <EditableField label="Lavorazione" value={form.lavorazione} onChange={(value) => update('lavorazione', value)} disabled={!canPublish} />
          <EditableField label="Pubblicabile" value={form.pubblicabile} onChange={(value) => update('pubblicabile', value)} options={['da valutare', 'si', 'no']} disabled={!canPublish} />
          <label className="form-wide">Nota<textarea rows="4" value={form.nota ?? ''} onChange={(event) => update('nota', event.target.value)} disabled={session.role === 'employee' && !canEditOwnNote} /></label>
          <label className="form-wide">Descrizione pubblica mock<textarea rows="4" value={form.descrizionePubblica ?? ''} onChange={(event) => update('descrizionePubblica', event.target.value)} disabled={!canPublish} /></label>
          <button className="button button-primary" type="submit" disabled={session.role === 'employee' && !canEditOwnNote}>Salva modifiche mock</button>
        </form>
      </section>

      <div className="internal-two-column">
        <NotesPanel
          entityType="photos"
          entityId={photo.id}
          notes={store.notes}
          onAddNote={store.addInternalNote}
          canAdd={canAddNote}
          disabledMessage="Il dipendente può aggiungere note solo sulle proprie foto ancora da revisionare."
        />
        <EntityTimeline entityType="photos" entityId={photo.id} activities={store.activities} />
      </div>
    </>
  )
}
