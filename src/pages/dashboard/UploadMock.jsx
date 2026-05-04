import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import {
  CommandPanel,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { InternalIcon } from '../../components/InternalIcons'
import { RecentUploadList } from '../../components/RecentUploadList'
import { StatusBadge } from '../../components/StatusBadge'
import { mockCantieri } from '../../data/mockCantieri'
import {
  createDocumentUpload,
  createFotoUpload,
  pubblicazioneFoto,
  tipiDocumento,
  todayIso,
} from '../../data/mockUploads'
import { uploadOperationalFile } from '../../lib/supabaseStorage'

const defaultFotoForm = {
  cantiereId: 'barcelo-roma',
  zona: 'Piscina',
  lavorazione: 'controsoffitto',
  avanzamento: 'in corso',
  fileName: '',
  nota: '',
  pubblicabile: 'da valutare',
  caricatoDa: '',
}

const defaultDocumentForm = {
  cantiereId: 'barcelo-roma',
  tipoDocumento: 'Fattura',
  fornitore: '',
  descrizione: '',
  dataDocumento: todayIso(),
  importoTotale: '',
  fileName: '',
  nota: '',
  caricatoDa: '',
}

export function UploadMock({ session, fotoUploads, documentUploads, onAddFoto, onAddDocument }) {
  const isAccounting = session.role === 'accounting'
  const isEmployee = session.role === 'employee'
  const [activeType, setActiveType] = useState(isAccounting ? 'documento' : 'foto')
  const [fotoForm, setFotoForm] = useState({ ...defaultFotoForm, caricatoDa: session.name })
  const [documentForm, setDocumentForm] = useState({ ...defaultDocumentForm, caricatoDa: session.name })
  const [fotoFile, setFotoFile] = useState(null)
  const [documentFile, setDocumentFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const visibleFotoUploads = isEmployee ? fotoUploads.filter((upload) => upload.caricatoDa === session.name) : fotoUploads
  const visibleDocumentUploads = isEmployee ? documentUploads.filter((upload) => upload.caricatoDa === session.name) : documentUploads
  const stats = useMemo(() => buildUploadStats(visibleFotoUploads, visibleDocumentUploads), [visibleFotoUploads, visibleDocumentUploads])
  const activeForm = activeType === 'foto' ? fotoForm : documentForm
  const selectedSite = mockCantieri.find((cantiere) => cantiere.id === activeForm.cantiereId) ?? mockCantieri[0]
  const canUploadFoto = !isAccounting

  function updateFoto(field, value) {
    setFotoForm((current) => ({ ...current, [field]: value }))
  }

  function updateDocument(field, value) {
    setDocumentForm((current) => ({ ...current, [field]: value }))
  }

  function selectFotoFile(file) {
    setFotoFile(file)
    updateFoto('fileName', file?.name ?? '')
  }

  function selectDocumentFile(file) {
    setDocumentFile(file)
    updateDocument('fileName', file?.name ?? '')
  }

  async function submitFoto(event) {
    event.preventDefault()
    setUploadStatus(null)

    if (!fotoFile) {
      setUploadStatus({ type: 'error', message: 'Seleziona una foto reale prima di inviare.' })
      return
    }

    setIsUploading(true)
    const localUpload = createFotoUpload(fotoForm, mockCantieri, session)
    const uploaded = await uploadOperationalFile({
      file: fotoFile,
      type: 'photo',
      cantiereId: fotoForm.cantiereId,
      entityId: localUpload.id,
    })
    setIsUploading(false)

    if (uploaded.error) {
      setUploadStatus({ type: 'error', message: uploaded.error.message })
      return
    }

    onAddFoto({
      ...localUpload,
      fileName: uploaded.data.fileName,
      storagePath: uploaded.data.storagePath,
      storageBucket: uploaded.data.bucket,
      mimeType: uploaded.data.mimeType,
      fileSize: uploaded.data.size,
    })
    setFotoFile(null)
    setFotoForm({ ...defaultFotoForm, caricatoDa: session.name })
    setUploadStatus({ type: 'success', message: 'Foto caricata realmente su Supabase Storage.' })
  }

  async function submitDocument(event) {
    event.preventDefault()
    setUploadStatus(null)

    if (!documentFile) {
      setUploadStatus({ type: 'error', message: 'Seleziona un PDF o una foto documento reale prima di inviare.' })
      return
    }

    setIsUploading(true)
    const localUpload = createDocumentUpload(documentForm, mockCantieri, session)
    const uploaded = await uploadOperationalFile({
      file: documentFile,
      type: 'document',
      cantiereId: documentForm.cantiereId,
      entityId: localUpload.id,
    })
    setIsUploading(false)

    if (uploaded.error) {
      setUploadStatus({ type: 'error', message: uploaded.error.message })
      return
    }

    onAddDocument({
      ...localUpload,
      fileName: uploaded.data.fileName,
      storagePath: uploaded.data.storagePath,
      storageBucket: uploaded.data.bucket,
      mimeType: uploaded.data.mimeType,
      fileSize: uploaded.data.size,
    })
    setDocumentFile(null)
    setDocumentForm({ ...defaultDocumentForm, caricatoDa: session.name })
    setUploadStatus({ type: 'success', message: 'Documento caricato realmente su Supabase Storage.' })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Upload operativo"
        title={isEmployee ? 'Carica materiale cantiere' : 'Upload foto e documenti'}
        description="Flusso compatto: scegli cosa caricare, compila i dati utili, controlla destinazione e ultimi caricamenti senza cambiare pagina."
      >
        <DataModeBadge>Upload reale Storage</DataModeBadge>
        <a className="button button-secondary button-small" href="#/dashboard/caricamenti">Caricamenti</a>
      </DashboardHeader>

      <CommandPanel
        eyebrow="Scelta caricamento"
        title={activeType === 'foto' ? 'Foto → revisione' : 'Documento → verifica contabile'}
        description="La scelta del tipo cambia form, checklist e destinazione del caricamento."
        aside={<StatusBadge>{activeType === 'foto' ? 'Da revisionare' : 'Da verificare'}</StatusBadge>}
      >
        <div className="upload-type-switch">
          {canUploadFoto ? (
            <button type="button" aria-pressed={activeType === 'foto'} onClick={() => setActiveType('foto')}>
              <InternalIcon name="image" size={18} />
              <span><b>Foto cantiere</b><small>Zona, lavorazione, pubblicabilità</small></span>
            </button>
          ) : null}
          <button type="button" aria-pressed={activeType === 'documento'} onClick={() => setActiveType('documento')}>
            <InternalIcon name="file" size={18} />
            <span><b>Documento</b><small>Fatture, bonifici, ricevute, FIR</small></span>
          </button>
        </div>
      </CommandPanel>

      {uploadStatus ? (
        <section className={uploadStatus.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{uploadStatus.type === 'error' ? 'Upload non completato' : 'Upload completato'}</strong>
          <p>{uploadStatus.message}</p>
        </section>
      ) : null}

      <KpiStrip ariaLabel="Indicatori upload">
        <KpiCard icon="image" label="Foto" value={visibleFotoUploads.length} hint={isAccounting ? 'Nascoste per contabilità' : 'Da revisionare'} muted={isAccounting} />
        <KpiCard icon="file" label="Documenti" value={visibleDocumentUploads.length} hint="Da verificare" />
        <KpiCard icon="warning" tone="amber" label="Aperti" value={stats.toReview} hint="Stati da lavorare" />
        <KpiCard icon="check" tone="green" label="Recenti" value={stats.recentCount} hint="Ultimi 7 giorni" />
      </KpiStrip>

      <WorkspaceLayout
        className="upload-workspace"
        sidebar={(
          <>
            <UploadDestinationCard activeType={activeType} selectedSite={selectedSite} activeForm={activeForm} isEmployee={isEmployee} />
            <UploadChecklist activeType={activeType} isEmployee={isEmployee} />
            <RecentCompactPanel activeType={activeType} fotoUploads={visibleFotoUploads} documentUploads={visibleDocumentUploads} />
          </>
        )}
      >
        <section className="internal-panel upload-form-panel">
          <div className="section-heading panel-title-row">
            <div>
              <span className="eyebrow">Step principale</span>
              <h2>{activeType === 'foto' ? 'Carica foto cantiere' : 'Carica documento'}</h2>
              <p>{activeType === 'foto'
                ? 'Cantiere, zona e lavorazione servono per ritrovare subito la foto dopo.'
                : 'Cantiere, tipo, fornitore e importo servono per il controllo contabile.'}</p>
            </div>
            <StatusBadge>{isUploading ? 'Caricamento...' : activeType === 'foto' ? 'Da revisionare' : 'Da verificare'}</StatusBadge>
          </div>
          {activeType === 'foto' ? (
            <FotoForm form={fotoForm} onChange={updateFoto} onFileChange={selectFotoFile} onSubmit={submitFoto} compact={isEmployee} disabled={isUploading} />
          ) : (
            <DocumentForm form={documentForm} onChange={updateDocument} onFileChange={selectDocumentFile} onSubmit={submitDocument} compact={isEmployee} disabled={isUploading} />
          )}
        </section>
      </WorkspaceLayout>

      <section className="upload-recent-redesign">
        {canUploadFoto ? <RecentUploadList title="Foto caricate di recente" type="foto" uploads={visibleFotoUploads} /> : null}
        <RecentUploadList title="Documenti caricati di recente" type="documento" uploads={visibleDocumentUploads} showAmount={!isEmployee} />
      </section>
    </>
  )
}

function UploadDestinationCard({ activeType, selectedSite, activeForm, isEmployee }) {
  return (
    <SideContextPanel title="Dove finisce" description="Conferma subito destinazione, stato iniziale e visibilità del caricamento.">
      <div className="upload-destination-flow">
        <article><span>1</span><div><strong>{selectedSite?.nome ?? 'Cantiere'}</strong><small>Cantiere selezionato</small></div></article>
        <article><span>2</span><div><strong>{activeType === 'foto' ? activeForm.zona || 'Zona' : activeForm.tipoDocumento}</strong><small>{activeType === 'foto' ? 'Zona / lavorazione' : 'Tipo documento'}</small></div></article>
        <article><span>3</span><div><strong>{activeType === 'foto' ? 'Revisione foto' : 'Controllo contabile'}</strong><small>{isEmployee ? 'Visibile nei tuoi caricamenti' : 'Visibile ad admin e contabilità'}</small></div></article>
      </div>
    </SideContextPanel>
  )
}

function UploadChecklist({ activeType, isEmployee }) {
  const checks = activeType === 'foto'
    ? ['Cantiere corretto', 'Zona chiara', 'Foto leggibile', isEmployee ? 'Nota breve' : 'Pubblicabilità indicata']
    : ['Cantiere corretto', 'Tipo documento corretto', isEmployee ? 'PDF/foto leggibile' : 'Fornitore e importo', 'Nota se ci sono dubbi']

  return (
    <SideContextPanel title="Checklist" description="Controlli minimi prima di inviare.">
      <div className="upload-checklist">
        {checks.map((check) => <article key={check}><InternalIcon name="check" size={15} /><span>{check}</span></article>)}
      </div>
    </SideContextPanel>
  )
}

function RecentCompactPanel({ activeType, fotoUploads, documentUploads }) {
  const uploads = activeType === 'foto' ? fotoUploads : documentUploads
  const typeLabel = activeType === 'foto' ? 'foto' : 'documenti'

  return (
    <SideContextPanel
      title={`Ultimi ${typeLabel}`}
      description="Controllo rapido per evitare caricamenti doppi."
      action={<a className="button button-secondary button-small" href="#/dashboard/caricamenti">Tutti</a>}
    >
      <div className="compact-upload-list">
        {uploads.slice(0, 4).map((upload) => (
          <a className="compact-upload-row" href={activeType === 'foto' ? `#/dashboard/foto/${upload.id}` : `#/dashboard/documenti/${upload.id}`} key={upload.id}>
            <span className="file-chip file-pdf">{activeType === 'foto' ? 'IMG' : 'DOC'}</span>
            <div><strong>{activeType === 'foto' ? upload.lavorazione : upload.descrizione}</strong><small>{upload.cantiere} · {upload.fileName || 'file'}</small></div>
            <StatusBadge>{upload.stato}</StatusBadge>
          </a>
        ))}
        {uploads.length === 0 ? <article className="accounting-alert"><strong>Nessun caricamento</strong><small>Gli ultimi elementi appariranno qui.</small></article> : null}
      </div>
    </SideContextPanel>
  )
}

function FotoForm({ form, onChange, onFileChange, onSubmit, compact, disabled }) {
  return (
    <form className="upload-redesign-form" onSubmit={onSubmit}>
      <div className="upload-form-grid">
        <FieldSelect label="Cantiere" value={form.cantiereId} onChange={(value) => onChange('cantiereId', value)} options={mockCantieri.map((cantiere) => ({ value: cantiere.id, label: cantiere.nome }))} />
        <FieldInput label="Zona" value={form.zona} onChange={(value) => onChange('zona', value)} placeholder="Es. Piscina" />
        <FieldInput label="Lavorazione" value={form.lavorazione} onChange={(value) => onChange('lavorazione', value)} placeholder="Es. controsoffitto" />
        {!compact ? <FieldSelect label="Stato avanzamento" value={form.avanzamento} onChange={(value) => onChange('avanzamento', value)} options={['da avviare', 'in corso', 'avanzato', 'completato'].map((item) => ({ value: item, label: item }))} /> : null}
      </div>
      <FileZone title="Seleziona immagine" text="Foto cantiere da controllare e collegare alla lavorazione." accept="image/*" type="image" fileName={form.fileName} onChange={onFileChange} />
      <div className="upload-form-grid upload-form-grid-secondary">
        {!compact ? <FieldSelect label="Pubblicabile sul sito" value={form.pubblicabile} onChange={(value) => onChange('pubblicabile', value)} options={pubblicazioneFoto.map((item) => ({ value: item, label: item }))} /> : null}
        {!compact ? <FieldInput label="Caricata da" value={form.caricatoDa} onChange={(value) => onChange('caricatoDa', value)} /> : null}
      </div>
      <NoteField value={form.nota} onChange={(value) => onChange('nota', value)} placeholder="Es. foto lato piscina, da controllare prima della pubblicazione..." />
      <SubmitRow status="Stato iniziale: da revisionare" label={disabled ? 'Caricamento foto...' : 'Carica foto reale'} disabled={disabled} />
    </form>
  )
}

function DocumentForm({ form, onChange, onFileChange, onSubmit, compact, disabled }) {
  return (
    <form className="upload-redesign-form" onSubmit={onSubmit}>
      <div className="upload-form-grid">
        <FieldSelect label="Cantiere" value={form.cantiereId} onChange={(value) => onChange('cantiereId', value)} options={mockCantieri.map((cantiere) => ({ value: cantiere.id, label: cantiere.nome }))} />
        <FieldSelect label="Tipo documento" value={form.tipoDocumento} onChange={(value) => onChange('tipoDocumento', value)} options={tipiDocumento.map((tipo) => ({ value: tipo, label: tipo }))} />
        {!compact ? <FieldInput label="Fornitore" value={form.fornitore} onChange={(value) => onChange('fornitore', value)} placeholder="Es. Falea" /> : null}
        {!compact ? <FieldInput label="Data documento" type="date" value={form.dataDocumento} onChange={(value) => onChange('dataDocumento', value)} /> : null}
        {!compact ? <FieldInput label="Importo totale" type="number" min="0" step="0.01" value={form.importoTotale} onChange={(value) => onChange('importoTotale', value)} placeholder="0,00" /> : null}
      </div>
      <FileZone title="Seleziona documento" text="PDF o immagine da mandare in verifica contabile." accept=".pdf,image/*" fileName={form.fileName} onChange={onFileChange} />
      <div className="upload-form-grid upload-form-grid-secondary">
        {!compact ? <FieldInput label="Caricato da" value={form.caricatoDa} onChange={(value) => onChange('caricatoDa', value)} /> : null}
      </div>
      <NoteField value={form.nota} onChange={(value) => onChange('nota', value)} placeholder="Es. collegare a bonifico, importo da verificare, possibile duplicato..." />
      <SubmitRow status="Stato iniziale: da verificare" label={disabled ? 'Caricamento documento...' : 'Carica documento reale'} disabled={disabled} />
    </form>
  )
}

function FieldInput({ label, value, onChange, type = 'text', ...props }) {
  return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></label>
}

function FieldSelect({ label, value, onChange, options }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

function FileZone({ title, text, accept, fileName, onChange, type = 'file' }) {
  return (
    <div className="upload-file-zone">
      <label>
        <span><InternalIcon name="upload" size={20} /></span>
        <strong>{title}</strong>
        <small>{fileName ? `File selezionato: ${fileName}` : text}</small>
        <input accept={accept} type="file" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      </label>
      <FilePreviewMock fileName={fileName} type={type} />
    </div>
  )
}

function NoteField({ value, onChange, placeholder }) {
  return <label className="upload-note-field">Nota<textarea rows="3" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>
}

function SubmitRow({ status, label, disabled }) {
  return (
    <div className="upload-submit-row">
      <div className="upload-static-fields"><span>Data caricamento automatica</span><span>{status}</span></div>
      <button className="button button-primary" type="submit" disabled={disabled}>{label}</button>
    </div>
  )
}

function buildUploadStats(fotoUploads, documentUploads) {
  const allUploads = [...fotoUploads, ...documentUploads]
  const toReview = allUploads.filter((upload) => ['da revisionare', 'da verificare', 'Da verificare', 'Incompleto', 'possibile duplicato'].includes(upload.stato)).length
  const recentLimit = new Date()
  recentLimit.setDate(recentLimit.getDate() - 7)
  const recentCount = allUploads.filter((upload) => upload.dataCaricamento && new Date(upload.dataCaricamento) >= recentLimit).length
  return { toReview, recentCount }
}
