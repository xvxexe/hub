import { useEffect, useMemo, useState } from 'react'
import { EditableField, EntityTimeline, NotesPanel } from '../../components/EntityPanels'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'
import { categorieContabili, metodiPagamentoContabili, statiVerificaContabili } from '../../data/mockMovimentiContabili'
import { checkDocumentMovementCompatibility, findDuplicateMovements, hasAmountWarning } from '../../lib/accountingChecks'

export function AccountingMovementDetail({ movementId, session, store }) {
  const movement = useMemo(() => resolveMovement(movementId, store), [movementId, store])
  const documents = store.documents ?? []
  const movements = store.movements ?? []
  const linkedDocument = documents.find((document) => document.id === movement?.documentId)
  const canEdit = session.role === 'admin' || session.role === 'accounting'
  const canViewEconomics = session.role !== 'employee'
  const canAddNote = canEdit
  const [form, setForm] = useState(movement ?? {})
  const [selectedDocumentId, setSelectedDocumentId] = useState(movement?.documentId ?? '')
  const [statusMessage, setStatusMessage] = useState(null)

  useEffect(() => {
    if (!movement) return
    setForm(movement)
    setSelectedDocumentId(movement.documentId ?? '')
  }, [movement?.id, movement?.updatedAt, movement?.documentId])

  if (!movement || session.role === 'employee') {
    return (
      <DashboardHeader
        eyebrow="Movimento non disponibile"
        title="Movimento contabile non accessibile"
        description="Il ruolo corrente può vedere solo movimenti consentiti oppure il movimento non esiste più."
      >
        <a className="button button-secondary" href="#/dashboard/contabilita">Torna alla contabilità</a>
      </DashboardHeader>
    )
  }

  const amountWarning = canViewEconomics && hasAmountWarning(form)
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId)
  const documentOptions = buildDocumentOptions(documents, movement)
  const compatibilityWarnings = selectedDocument ? checkDocumentMovementCompatibility(selectedDocument, form) : []
  const duplicateMatches = findDuplicateMovements(form, movements.map(normalizeMovement)).slice(0, 4)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: numberFields.includes(field) ? Number(value) : value }))
  }

  function save(event) {
    event.preventDefault()
    const cantiere = mockCantieri.find((item) => item.id === form.cantiereId)
    store.updateAccountingMovementData(movement.id, {
      ...form,
      cantiere: cantiere?.nome ?? form.cantiere,
      importoTotale: Number(form.totale || 0),
    })
    setStatusMessage({ type: 'success', message: 'Movimento contabile salvato.' })
  }

  function linkDocument(event) {
    event.preventDefault()
    const document = documents.find((item) => item.id === selectedDocumentId)
    if (!document) {
      setStatusMessage({ type: 'error', message: 'Seleziona un documento valido da collegare.' })
      return
    }

    store.linkAccountingMovementDocument(movement.id, document)
    setForm((current) => ({
      ...current,
      documentId: document.id,
      documentoCollegato: document.fileName ?? document.numeroDocumento ?? document.descrizione ?? document.id,
      fileName: document.fileName,
      storagePath: document.storagePath,
      storageBucket: document.storageBucket ?? 'documents',
      tipoDocumento: document.tipoDocumento ?? current.tipoDocumento,
      numeroDocumento: document.numeroDocumento ?? document.fileName ?? current.numeroDocumento,
    }))
    setStatusMessage({
      type: compatibilityWarnings.length ? 'warning' : 'success',
      message: compatibilityWarnings.length
        ? 'Documento collegato, ma ci sono avvisi di compatibilità da controllare.'
        : 'Documento collegato al movimento.',
    })
  }

  function unlinkDocument() {
    store.unlinkAccountingMovementDocument(movement.id)
    setSelectedDocumentId('')
    setForm((current) => ({
      ...current,
      documentId: null,
      documentoCollegato: '',
      fileName: '',
      storagePath: '',
      storageBucket: '',
    }))
    setStatusMessage({ type: 'success', message: 'Documento scollegato dal movimento.' })
  }

  function setVerificationStatus(value) {
    setForm((current) => ({ ...current, statoVerifica: value }))
    store.updateAccountingMovementData(movement.id, { statoVerifica: value })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio movimento contabile"
        title={`${movement.fornitore || 'Fornitore non indicato'} · ${movement.descrizione}`}
        description="Scheda operativa separata dal documento: modifica spesa, pagamento, verifica e collegamento allegato."
      >
        <StatusBadge>{movement.statoVerifica}</StatusBadge>
        <DataModeBadge>{movement.documentId ? 'Documento collegato' : 'Da collegare'}</DataModeBadge>
      </DashboardHeader>

      <section className="detail-action-bar">
        <a className="button button-secondary" href="#/dashboard/contabilita">Torna alla contabilità</a>
        {canEdit ? (
          <>
            <button className="button button-secondary" type="button" onClick={() => setVerificationStatus('Da verificare')}>Rimetti da verificare</button>
            <button className="button button-secondary" type="button" onClick={() => setVerificationStatus('Confermato')}>Conferma</button>
            <button className="button button-secondary" type="button" onClick={() => setVerificationStatus('Incompleto')}>Segna incompleto</button>
            <button className="button button-secondary" type="button" onClick={() => setVerificationStatus('Possibile duplicato')}>Segna duplicato</button>
            <button className="button button-secondary" type="button" onClick={() => setVerificationStatus('Scartato')}>Scarta</button>
          </>
        ) : null}
      </section>

      {statusMessage ? (
        <section className={statusMessage.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{statusMessage.type === 'error' ? 'Azione non completata' : 'Azione completata'}</strong>
          <p>{statusMessage.message}</p>
        </section>
      ) : null}

      {amountWarning ? (
        <section className="validation-alert-block">
          <strong>Importi da controllare</strong>
          <p>Imponibile + IVA non coincide con il totale. Correggi il movimento prima di confermarlo.</p>
        </section>
      ) : null}

      {duplicateMatches.length ? (
        <section className="validation-alert-block">
          <strong>Possibili duplicati movimento</strong>
          <p>Ho trovato movimenti simili per fornitore, data, totale, numero documento o file collegato.</p>
          <ul>
            {duplicateMatches.map(({ movement: duplicate, reasons }) => (
              <li key={duplicate.id}>
                <a className="text-link" href={`#/dashboard/contabilita/${duplicate.id}`}>{duplicate.fornitore} · {duplicate.descrizione}</a>
                {' '}— {reasons.join(', ')} · <MoneyValue value={duplicate.totale} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="detail-layout internal-padded">
        <form className="mock-form detail-edit-form" onSubmit={save}>
          <EditableField label="Data" type="date" value={form.data ?? ''} onChange={(value) => update('data', value)} disabled={!canEdit} />
          <EditableField label="Descrizione" value={form.descrizione ?? ''} onChange={(value) => update('descrizione', value)} disabled={!canEdit} />
          <EditableField label="Fornitore" value={form.fornitore ?? ''} onChange={(value) => update('fornitore', value)} disabled={!canEdit} />
          <EditableField label="Cantiere" value={form.cantiereId ?? 'barcelo-roma'} onChange={(value) => update('cantiereId', value)} options={mockCantieri.map((item) => item.id)} disabled={!canEdit} />
          {canViewEconomics ? (
            <>
              <EditableField label="Categoria" value={form.categoria ?? 'Extra / Altro'} onChange={(value) => update('categoria', value)} options={categorieContabili} disabled={!canEdit} />
              <EditableField label="Imponibile" type="number" value={form.imponibile ?? 0} onChange={(value) => update('imponibile', value)} disabled={!canEdit} />
              <EditableField label="IVA" type="number" value={form.iva ?? 0} onChange={(value) => update('iva', value)} disabled={!canEdit} />
              <EditableField label="Totale" type="number" value={form.totale ?? 0} onChange={(value) => update('totale', value)} disabled={!canEdit} />
              <EditableField label="Pagamento" value={form.pagamento ?? 'Non indicato'} onChange={(value) => update('pagamento', value)} options={metodiPagamentoContabili} disabled={!canEdit} />
              <EditableField label="Stato verifica" value={form.statoVerifica ?? 'Da verificare'} onChange={(value) => update('statoVerifica', value)} options={statiVerificaContabili} disabled={!canEdit} />
            </>
          ) : null}
          <label className="form-wide">Note<textarea rows="4" value={form.note ?? ''} onChange={(event) => update('note', event.target.value)} disabled={!canEdit} /></label>
          <button className="button button-primary" type="submit" disabled={!canEdit}>Salva movimento</button>
        </form>

        <aside className="info-card">
          <h2>Riepilogo operativo</h2>
          <dl className="detail-list">
            <div><dt>Data</dt><dd>{formatDate(movement.data)}</dd></div>
            <div><dt>Fornitore</dt><dd>{movement.fornitore}</dd></div>
            <div><dt>Categoria</dt><dd>{movement.categoria}</dd></div>
            {canViewEconomics ? <div><dt>Imponibile</dt><dd><MoneyValue value={movement.imponibile} /></dd></div> : null}
            {canViewEconomics ? <div><dt>IVA</dt><dd><MoneyValue value={movement.iva} /></dd></div> : null}
            {canViewEconomics ? <div><dt>Totale</dt><dd><MoneyValue value={movement.totale} /></dd></div> : null}
            <div><dt>Pagamento</dt><dd>{movement.pagamento}</dd></div>
            <div><dt>Documento collegato</dt><dd>{linkedDocument ? linkedDocument.fileName ?? linkedDocument.numeroDocumento : movement.documentoCollegato || 'Da collegare'}</dd></div>
            <div><dt>Stato verifica</dt><dd><StatusBadge>{movement.statoVerifica}</StatusBadge></dd></div>
          </dl>
          <FilePreviewMock
            fileName={linkedDocument?.fileName ?? movement.fileName ?? movement.documentoCollegato}
            storagePath={linkedDocument?.storagePath ?? movement.storagePath}
            storageBucket={linkedDocument?.storageBucket ?? movement.storageBucket ?? 'documents'}
          />
          {linkedDocument ? <a className="text-link" href={`#/dashboard/documenti/${linkedDocument.id}`}>Apri scheda documento</a> : null}
        </aside>
      </section>

      {canEdit ? (
        <section className="accounting-section real-accounting-section">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Collegamento documento / pagamento</h2>
              <p>Scegli un allegato già presente oppure scollega il movimento se il pagamento/documento è stato associato male.</p>
            </div>
            <StatusBadge>{movement.documentId ? 'Collegato' : 'Da collegare'}</StatusBadge>
          </div>
          {compatibilityWarnings.length ? (
            <div className="validation-alert-block">
              <strong>Compatibilità da verificare</strong>
              <ul>{compatibilityWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </div>
          ) : selectedDocument ? (
            <div className="accounting-alert success-alert">
              <strong>Documento compatibile</strong>
              <p>Cantiere, fornitore, data e totale non mostrano conflitti evidenti.</p>
            </div>
          ) : null}
          <form className="mock-form detail-edit-form" onSubmit={linkDocument}>
            <label className="form-wide">Documento da collegare<select value={selectedDocumentId} onChange={(event) => setSelectedDocumentId(event.target.value)}><option value="">Seleziona documento</option>{documentOptions.map((document) => <option key={document.id} value={document.id}>{document.label}</option>)}</select></label>
            <button className="button button-primary" type="submit">Collega documento</button>
            <button className="button button-secondary" type="button" onClick={unlinkDocument} disabled={!movement.documentId && !movement.documentoCollegato}>Scollega documento</button>
          </form>
        </section>
      ) : null}

      <div className="internal-two-column">
        <NotesPanel
          entityType="movements"
          entityId={movement.id}
          notes={store.notes}
          onAddNote={store.addInternalNote}
          canAdd={canAddNote}
          disabledMessage="Solo admin e contabilità possono aggiungere note ai movimenti."
        />
        <EntityTimeline entityType="movements" entityId={movement.id} activities={store.activities} />
      </div>
    </>
  )
}

function resolveMovement(movementId, store) {
  const movement = store.movements?.find((item) => item.id === movementId)
  if (movement) return normalizeMovement(movement)

  const documentId = movementId.startsWith('movement-') ? movementId.replace('movement-', '') : movementId
  const document = store.documents?.find((item) => item.id === documentId)
  if (!document) return null

  return normalizeMovement({
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId,
    cantiere: document.cantiere,
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore,
    categoria: document.categoria,
    tipoDocumento: document.tipoDocumento,
    numeroDocumento: document.numeroDocumento ?? document.fileName,
    imponibile: document.imponibile,
    iva: document.iva,
    totale: document.totale ?? document.importoTotale,
    pagamento: document.pagamento,
    statoVerifica: document.statoVerifica,
    documentoCollegato: document.fileName ?? document.numeroDocumento,
    fileName: document.fileName,
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
    note: document.note ?? document.nota,
  })
}

function normalizeMovement(movement) {
  return {
    ...movement,
    cantiereId: movement.cantiereId ?? 'barcelo-roma',
    cantiere: movement.cantiere ?? 'Barcelò Roma',
    data: movement.data ?? null,
    descrizione: movement.descrizione ?? 'Movimento contabile',
    fornitore: movement.fornitore ?? 'Non indicato',
    categoria: movement.categoria ?? 'Extra / Altro',
    tipoDocumento: movement.tipoDocumento ?? 'Altro',
    numeroDocumento: movement.numeroDocumento ?? movement.fileName ?? movement.id,
    imponibile: Number(movement.imponibile || 0),
    iva: Number(movement.iva || 0),
    totale: Number(movement.totale || movement.importoTotale || 0),
    pagamento: movement.pagamento ?? 'Non indicato',
    statoVerifica: movement.statoVerifica ?? 'Da verificare',
    documentoCollegato: movement.documentoCollegato ?? movement.fileName ?? '',
    note: movement.note ?? movement.nota ?? '',
  }
}

function buildDocumentOptions(documents, movement) {
  return documents
    .filter((document) => document.cantiereId === movement.cantiereId || document.id === movement.documentId)
    .map((document) => ({
      id: document.id,
      label: [
        document.dataDocumento ? formatDate(document.dataDocumento) : null,
        document.fornitore,
        document.tipoDocumento,
        document.numeroDocumento ?? document.fileName,
        document.totale ? `€ ${Number(document.totale).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null,
      ].filter(Boolean).join(' · '),
    }))
}

const numberFields = ['imponibile', 'iva', 'totale']
