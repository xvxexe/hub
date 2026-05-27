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
  const [form, setForm] = useState(normalizeDocument(document) ?? {})
  const [deleteStatus, setDeleteStatus] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!document || (session.role === 'employee' && document.caricatoDa !== session.name)) {
    return (
      <DashboardHeader eyebrow="Documento non disponibile" title="Documento non accessibile" description="Il ruolo corrente può vedere solo documenti consentiti.">
        <a className="button button-secondary" href={resolvedBackHref}>Torna indietro</a>
      </DashboardHeader>
    )
  }

  const normalizedDocument = normalizeDocument(document)
  const amountWarning = canViewEconomics
    && Number(form.imponibile || 0) + Number(form.iva || 0) !== Number(form.totale || 0)
    && form.controlloMatematico !== 'Non applicabile'
    && form.tipoDocumento !== 'Bonifico'

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
      categoriaOriginale: form.categoriaOriginale ?? form.lavorazione ?? form.categoria,
    })
  }

  async function deleteDocument() {
    setDeleteStatus(null)
    const confirmed = window.confirm('Eliminare definitivamente questo documento, il file allegato, il movimento contabile collegato, note e log collegati?')
    if (!confirmed) return

    setIsDeleting(true)
    const result = await store.deleteDocument(document.id)
    setIsDeleting(false)

    if (!result.ok) {
      setDeleteStatus({ type: 'error', message: result.error })
      return
    }

    window.location.hash = resolvedBackHref
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio documento"
        title={`${document.tipoDocumento} · ${document.fornitore}`}
        description="Dettaglio modificabile: categoria contabile, lavorazione, tab origine e qualità dati restano separati."
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
            <button className="button button-danger" type="button" disabled={isDeleting} onClick={deleteDocument}>{isDeleting ? 'Elimino...' : 'Elimina'}</button>
          </>
        ) : null}
      </section>

      {deleteStatus?.type === 'error' ? (
        <section className="validation-alert-block"><strong>Eliminazione non riuscita</strong><p>{deleteStatus.message}</p></section>
      ) : null}

      {amountWarning ? (
        <section className="validation-alert-block">
          <strong>Importi da controllare</strong>
          <p>Imponibile + IVA non coincide con il totale. Se il documento è bonifico, vitto o alloggio senza dettaglio IVA, usa “Non applicabile” invece di inventare valori fiscali.</p>
        </section>
      ) : null}

      <section className="detail-layout internal-padded">
        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Fornitore" value={form.fornitore ?? ''} onChange={(value) => update('fornitore', value)} disabled={!canEdit} />
          <EditableField label="Data documento" type="date" value={form.dataDocumento ?? ''} onChange={(value) => update('dataDocumento', value)} disabled={!canEdit} />
          <EditableField label="Numero documento" value={form.numeroDocumento ?? ''} onChange={(value) => update('numeroDocumento', value)} disabled={!canEdit} />
          <EditableField label="Cantiere" value={form.cantiereId ?? 'barcelo-roma'} onChange={(value) => update('cantiereId', value)} options={mockCantieri.map((item) => item.id)} disabled={!canEdit} />
          {canViewEconomics ? (
            <>
              <EditableField label="Categoria contabile" value={form.categoria ?? 'Extra / Altro'} onChange={(value) => update('categoria', value)} options={categorieContabili} disabled={!canEdit} />
              <EditableField label="Lavorazione / voce" value={form.lavorazione ?? ''} onChange={(value) => update('lavorazione', value)} disabled={!canEdit} />
              <EditableField label="Categoria originaria" value={form.categoriaOriginale ?? ''} onChange={(value) => update('categoriaOriginale', value)} disabled={!canEdit} />
              <EditableField label="Tab origine" value={form.sheetTab ?? ''} onChange={(value) => update('sheetTab', value)} disabled />
              <EditableField label="Controllo matematico" value={form.controlloMatematico ?? 'Da controllare'} onChange={(value) => update('controlloMatematico', value)} options={['OK', 'Non applicabile', 'Scarto da verificare', 'Da controllare']} disabled={!canEdit} />
              <EditableField label="Stato collegamento" value={form.statoCollegamento ?? 'Collegato'} onChange={(value) => update('statoCollegamento', value)} options={['Collegato', 'Da collegare', 'Manuale']} disabled={!canEdit} />
              <EditableField label="Qualità dati" value={form.qualitaDati ?? 'Da controllare'} onChange={(value) => update('qualitaDati', value)} options={['Pulito', 'Da verificare', 'Da controllare']} disabled={!canEdit} />
              <EditableField label="Natura movimento" value={form.naturaMovimento ?? ''} onChange={(value) => update('naturaMovimento', value)} options={['Fattura', 'Bonifico / Pagamento', 'Ricevuta', 'Vitto', 'Alloggio', 'FIR / Rifiuti', 'Documento operativo', 'Nota credito / Reso']} disabled={!canEdit} />
              <EditableField label="Imponibile" type="number" value={form.imponibile ?? 0} onChange={(value) => update('imponibile', value)} disabled={!canEdit} />
              <EditableField label="IVA" type="number" value={form.iva ?? 0} onChange={(value) => update('iva', value)} disabled={!canEdit} />
              <EditableField label="Totale" type="number" value={form.totale ?? 0} onChange={(value) => update('totale', value)} disabled={!canEdit} />
              <EditableField label="Pagamento" value={form.pagamento ?? 'Non indicato'} onChange={(value) => update('pagamento', value)} options={metodiPagamentoContabili} disabled={!canEdit} />
            </>
          ) : null}
          <label className="form-wide">Note qualità<textarea rows="3" value={form.dataQualityNote ?? ''} onChange={(event) => update('dataQualityNote', event.target.value)} disabled={!canEdit} /></label>
          <label className="form-wide">Note<textarea rows="4" value={form.note ?? ''} onChange={(event) => update('note', event.target.value)} disabled={!canEdit} /></label>
          <button className="button button-primary" type="submit" disabled={!canEdit}>Salva modifiche</button>
        </form>

        <aside className="info-card">
          <h2>Riepilogo</h2>
          <dl className="detail-list">
            <div><dt>Tipo</dt><dd>{document.tipoDocumento}</dd></div>
            <div><dt>Cantiere</dt><dd>{document.cantiere}</dd></div>
            <div><dt>Data</dt><dd>{formatDate(document.dataDocumento)}</dd></div>
            <div><dt>Categoria contabile</dt><dd>{normalizedDocument.categoria}</dd></div>
            <div><dt>Lavorazione / voce</dt><dd>{formatLabel(normalizedDocument.lavorazione)}</dd></div>
            <div><dt>Categoria originaria</dt><dd>{formatLabel(normalizedDocument.categoriaOriginale)}</dd></div>
            <div><dt>Tab origine</dt><dd>{formatLabel(normalizedDocument.sheetTab)}</dd></div>
            <div><dt>Controllo matematico</dt><dd><StatusBadge>{normalizedDocument.controlloMatematico}</StatusBadge></dd></div>
            <div><dt>Stato collegamento</dt><dd>{normalizedDocument.statoCollegamento}</dd></div>
            <div><dt>Qualità dati</dt><dd>{normalizedDocument.qualitaDati}</dd></div>
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

function normalizeDocument(document) {
  if (!document) return null
  return {
    ...document,
    categoria: document.categoria ?? 'Extra / Altro',
    categoriaOriginale: document.categoriaOriginale ?? document.categoria_originale ?? null,
    lavorazione: document.lavorazione ?? document.categoriaOriginale ?? document.categoria_originale ?? document.sheetTab ?? '',
    qualitaDati: document.qualitaDati ?? document.qualita_dati ?? 'Da controllare',
    controlloMatematico: document.controlloMatematico ?? document.controllo_matematico ?? 'Da controllare',
    naturaMovimento: document.naturaMovimento ?? document.natura_movimento ?? '',
    statoCollegamento: document.statoCollegamento ?? document.stato_collegamento ?? 'Collegato',
    dataQualityNote: document.dataQualityNote ?? document.data_quality_note ?? '',
    sheetTab: document.sheetTab ?? '',
  }
}

function formatLabel(value) {
  return String(value ?? '-')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '-'
}

const numberFields = ['imponibile', 'iva', 'totale']
