import { useState } from 'react'
import { EditableField, EntityTimeline, NotesPanel } from '../../components/EntityPanels'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import { categorieContabili, metodiPagamentoContabili } from '../../data/mockMovimentiContabili'

export function DocumentDetail({ documentId, session, store, backHref = '#/dashboard/documenti' }) {
  const document = store.documents.find((item) => item.id === documentId)
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const canViewEconomics = session.role !== 'employee'
  const canAddNote = canEdit || (session.role === 'employee' && document?.caricatoDa === session.name && document?.statoVerifica === 'Da verificare')
  const resolvedBackHref = session.role === 'employee' ? '#/dashboard/caricamenti' : backHref
  const [form, setForm] = useState(document ?? {})

  if (!document || (session.role === 'employee' && document.caricatoDa !== session.name)) {
    return (
      <DashboardHeader eyebrow="Documento non disponibile" title="Documento non accessibile" description="Il ruolo corrente può vedere solo documenti consentiti.">
        <a className="button button-secondary" href={resolvedBackHref}>Torna indietro</a>
      </DashboardHeader>
    )
  }

  const amountWarning = canViewEconomics && Number(form.imponibile || 0) + Number(form.iva || 0) !== Number(form.totale || 0) && form.tipoDocumento !== 'Bonifico'

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: numberFields.includes(field) ? Number(value) : value }))
  }

  function save(event) {
    event.preventDefault()
    const cantiere = mockCantieri.find((item) => item.id === form.cantiereId)
    store.updateDocumentData(document.id, {
      ...form,
      cantiere: cantiere?.nome ?? form.cantiere,
      importoTotale: Number(form.totale || 0),
    })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio documento"
        title={`${document.tipoDocumento} · ${document.fornitore}`}
        description="Dettaglio modificabile per verifica amministrativa, file reale e collegamento al cantiere."
      >
        <StatusBadge>{document.statoVerifica}</StatusBadge>
        <DataModeBadge>{document.storagePath ? 'File reale Storage' : 'Dato importato'}</DataModeBadge>
      </DashboardHeader>

      <section className="detail-action-bar">
        <a className="button button-secondary" href={resolvedBackHref}>Torna alla lista</a>
        {canEdit ? (
          <>
            <button className="button button-secondary" type="button" onClick={() => store.updateDocumentStatus(document.id, 'Da verificare')}>Rimetti da verificare</button>
            <button className="button button-secondary" type="button" onClick={() => store.markDocumentChecked(document.id)}>Conferma</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateDocumentStatus(document.id, 'Incompleto')}>Segna incompleto</button>
            <button className="button button-secondary" type="button" onClick={() => store.markDocumentDuplicate(document.id)}>Segna duplicato</button>
            <button className="button button-secondary" type="button" onClick={() => store.updateDocumentStatus(document.id, 'Scartato')}>Scarta</button>
          </>
        ) : null}
      </section>

      {amountWarning ? (
        <section className="validation-alert-block">
          <strong>Importi da controllare</strong>
          <p>Imponibile + IVA non coincide con il totale. Correggi prima di confermare il documento.</p>
        </section>
      ) : null}

      <section className="detail-layout internal-padded">
        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Fornitore" value={form.fornitore} onChange={(value) => update('fornitore', value)} disabled={!canEdit} />
          <EditableField label="Data documento" type="date" value={form.dataDocumento} onChange={(value) => update('dataDocumento', value)} disabled={!canEdit} />
          <EditableField label="Numero documento" value={form.numeroDocumento} onChange={(value) => update('numeroDocumento', value)} disabled={!canEdit} />
          <EditableField label="Cantiere" value={form.cantiereId} onChange={(value) => update('cantiereId', value)} options={mockCantieri.map((item) => item.id)} disabled={!canEdit} />
          {canViewEconomics ? (
            <>
              <EditableField label="Categoria" value={form.categoria} onChange={(value) => update('categoria', value)} options={categorieContabili} disabled={!canEdit} />
              <EditableField label="Imponibile" type="number" value={form.imponibile} onChange={(value) => update('imponibile', value)} disabled={!canEdit} />
              <EditableField label="IVA" type="number" value={form.iva} onChange={(value) => update('iva', value)} disabled={!canEdit} />
              <EditableField label="Totale" type="number" value={form.totale} onChange={(value) => update('totale', value)} disabled={!canEdit} />
              <EditableField label="Pagamento" value={form.pagamento} onChange={(value) => update('pagamento', value)} options={metodiPagamentoContabili} disabled={!canEdit} />
            </>
          ) : null}
          <label className="form-wide">Note<textarea rows="4" value={form.note ?? ''} onChange={(event) => update('note', event.target.value)} disabled={!canEdit} /></label>
          <button className="button button-primary" type="submit" disabled={!canEdit}>Salva modifiche</button>
        </form>

        <aside className="info-card">
          <h2>Riepilogo</h2>
          <dl className="detail-list">
            <div><dt>Tipo</dt><dd>{document.tipoDocumento}</dd></div>
            <div><dt>Cantiere</dt><dd>{document.cantiere}</dd></div>
            <div><dt>Data</dt><dd>{formatDate(document.dataDocumento)}</dd></div>
            {canViewEconomics ? <div><dt>Totale</dt><dd><MoneyValue value={document.totale} /></dd></div> : null}
            <div><dt>Stato</dt><dd><StatusBadge>{document.statoVerifica}</StatusBadge></dd></div>
          </dl>
          <FilePreviewMock fileName={document.fileName} storagePath={document.storagePath} storageBucket={document.storageBucket ?? 'documents'} />
        </aside>
      </section>

      <div className="internal-two-column">
        <NotesPanel
          entityType="documents"
          entityId={document.id}
          notes={store.notes}
          onAddNote={store.addInternalNote}
          canAdd={canAddNote}
          disabledMessage="Il dipendente può aggiungere note solo sui propri documenti ancora da verificare."
        />
        <EntityTimeline entityType="documents" entityId={document.id} activities={store.activities} />
      </div>
    </>
  )
}

const numberFields = ['imponibile', 'iva', 'totale']
