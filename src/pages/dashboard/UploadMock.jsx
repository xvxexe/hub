import { useState } from 'react'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { RecentUploadList } from '../../components/RecentUploadList'
import { UploadCard } from '../../components/UploadCard'
import { mockCantieri } from '../../data/mockCantieri'
import {
  createDocumentUpload,
  createFotoUpload,
  pubblicazioneFoto,
  tipiDocumento,
  todayIso,
} from '../../data/mockUploads'

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
  const [fotoForm, setFotoForm] = useState({ ...defaultFotoForm, caricatoDa: session.name })
  const [documentForm, setDocumentForm] = useState({ ...defaultDocumentForm, caricatoDa: session.name })
  const isAccounting = session.role === 'accounting'
  const isEmployee = session.role === 'employee'
  const visibleFotoUploads = isEmployee
    ? fotoUploads.filter((upload) => upload.caricatoDa === session.name)
    : fotoUploads
  const visibleDocumentUploads = isEmployee
    ? documentUploads.filter((upload) => upload.caricatoDa === session.name)
    : documentUploads

  function updateFoto(field, value) {
    setFotoForm((current) => ({ ...current, [field]: value }))
  }

  function updateDocument(field, value) {
    setDocumentForm((current) => ({ ...current, [field]: value }))
  }

  function submitFoto(event) {
    event.preventDefault()
    onAddFoto(createFotoUpload(fotoForm, mockCantieri, session))
    setFotoForm({ ...defaultFotoForm, caricatoDa: session.name })
  }

  function submitDocument(event) {
    event.preventDefault()
    onAddDocument(createDocumentUpload(documentForm, mockCantieri, session))
    setDocumentForm({ ...defaultDocumentForm, caricatoDa: session.name })
  }

  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">Upload mock</p>
        <h1>{isEmployee ? 'Carica materiale cantiere' : 'Upload foto e documenti'}</h1>
        <p>
          Flusso locale per simulare caricamenti da cantiere. I file non vengono inviati a cloud,
          backend o Supabase.
        </p>
      </section>

      <section className={isEmployee ? 'employee-upload-layout' : 'upload-layout'}>
        {!isAccounting ? (
          <UploadCard
            title="Carica foto cantiere"
            description="Foto mock con stato iniziale da revisionare."
          >
            <FotoForm form={fotoForm} onChange={updateFoto} onSubmit={submitFoto} compact={isEmployee} />
          </UploadCard>
        ) : null}

        <UploadCard
          title="Carica documento"
          description="Documento mock con stato iniziale da verificare."
        >
          <DocumentForm
            form={documentForm}
            onChange={updateDocument}
            onSubmit={submitDocument}
            compact={isEmployee}
          />
        </UploadCard>
      </section>

      <section className="upload-recent-layout">
        {!isAccounting ? (
          <RecentUploadList title="Foto caricate di recente" type="foto" uploads={visibleFotoUploads.slice(0, 4)} />
        ) : null}
        {!isEmployee ? (
          <RecentUploadList
            title="Documenti caricati di recente"
            type="documento"
            uploads={visibleDocumentUploads.slice(0, 4)}
          />
        ) : (
          <RecentUploadList
            title="Documenti caricati di recente"
            type="documento"
            uploads={visibleDocumentUploads.slice(0, 2)}
            showAmount={false}
          />
        )}
      </section>
    </>
  )
}

function FotoForm({ form, onChange, onSubmit, compact }) {
  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <label>
        Cantiere
        <select value={form.cantiereId} onChange={(event) => onChange('cantiereId', event.target.value)}>
          {mockCantieri.map((cantiere) => (
            <option key={cantiere.id} value={cantiere.id}>
              {cantiere.nome}
            </option>
          ))}
        </select>
      </label>
      <label>
        Zona
        <input value={form.zona} onChange={(event) => onChange('zona', event.target.value)} />
      </label>
      <label>
        Lavorazione
        <input value={form.lavorazione} onChange={(event) => onChange('lavorazione', event.target.value)} />
      </label>
      {!compact ? (
        <label>
          Stato avanzamento
          <select value={form.avanzamento} onChange={(event) => onChange('avanzamento', event.target.value)}>
            <option value="da avviare">da avviare</option>
            <option value="in corso">in corso</option>
            <option value="avanzato">avanzato</option>
            <option value="completato">completato</option>
          </select>
        </label>
      ) : null}
      <label>
        File immagine
        <input
          accept="image/*"
          type="file"
          onChange={(event) => onChange('fileName', event.target.files?.[0]?.name ?? '')}
        />
      </label>
      <FilePreviewMock fileName={form.fileName} type="image" />
      {!compact ? (
        <label>
          Pubblicabile sul sito
          <select value={form.pubblicabile} onChange={(event) => onChange('pubblicabile', event.target.value)}>
            {pubblicazioneFoto.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        Nota
        <textarea rows="4" value={form.nota} onChange={(event) => onChange('nota', event.target.value)} />
      </label>
      {!compact ? (
        <label>
          Caricata da
          <input value={form.caricatoDa} onChange={(event) => onChange('caricatoDa', event.target.value)} />
        </label>
      ) : null}
      <div className="upload-static-fields">
        <span>Data caricamento: automatica</span>
        <span>Stato revisione: da revisionare</span>
      </div>
      <button className="button button-primary" type="submit">
        Invia foto mock
      </button>
    </form>
  )
}

function DocumentForm({ form, onChange, onSubmit, compact }) {
  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <label>
        Cantiere
        <select value={form.cantiereId} onChange={(event) => onChange('cantiereId', event.target.value)}>
          {mockCantieri.map((cantiere) => (
            <option key={cantiere.id} value={cantiere.id}>
              {cantiere.nome}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tipo documento
        <select
          value={form.tipoDocumento}
          onChange={(event) => onChange('tipoDocumento', event.target.value)}
        >
          {tipiDocumento.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>
      {!compact ? (
        <>
          <label>
            Fornitore
            <input value={form.fornitore} onChange={(event) => onChange('fornitore', event.target.value)} />
          </label>
          <label>
            Data documento
            <input
              type="date"
              value={form.dataDocumento}
              onChange={(event) => onChange('dataDocumento', event.target.value)}
            />
          </label>
          <label>
            Importo totale
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.importoTotale}
              onChange={(event) => onChange('importoTotale', event.target.value)}
            />
          </label>
        </>
      ) : null}
      <label>
        File documento
        <input
          accept=".pdf,image/*"
          type="file"
          onChange={(event) => onChange('fileName', event.target.files?.[0]?.name ?? '')}
        />
      </label>
      <FilePreviewMock fileName={form.fileName} />
      <label>
        Nota
        <textarea rows="4" value={form.nota} onChange={(event) => onChange('nota', event.target.value)} />
      </label>
      {!compact ? (
        <label>
          Caricato da
          <input value={form.caricatoDa} onChange={(event) => onChange('caricatoDa', event.target.value)} />
        </label>
      ) : null}
      <div className="upload-static-fields">
        <span>Data caricamento: automatica</span>
        <span>Stato verifica: da verificare</span>
      </div>
      <button className="button button-primary" type="submit">
        Invia documento mock
      </button>
    </form>
  )
}
