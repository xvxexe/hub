import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { InternalIcon } from '../../components/InternalIcons'
import { RecentUploadList } from '../../components/RecentUploadList'
import { StatusBadge } from '../../components/StatusBadge'

const tipiDocumentoFallback = ['Fattura', 'Bonifico', 'Ricevuta', 'FIR', 'Preventivo', 'Scontrino', 'Riepilogo tab', 'Altro']
const statiFoto = ['Da revisionare', 'Approvata', 'Pubblicata', 'Non pubblicabile']
const statiDocumenti = ['da verificare', 'confermato', 'incompleto', 'possibile duplicato', 'scartato']

export function CaricamentiRecenti({ session, fotoUploads, documentUploads }) {
  const [cantiereId, setCantiereId] = useState('tutti')
  const [tipo, setTipo] = useState('tutti')
  const [stato, setStato] = useState('tutti')
  const [search, setSearch] = useState('')
  const canSeePhotos = session.role !== 'accounting'
  const scopedFotoUploads = session.role === 'employee' ? fotoUploads.filter((upload) => upload.caricatoDa === session.name) : fotoUploads
  const scopedDocumentUploads = session.role === 'employee' ? documentUploads.filter((upload) => upload.caricatoDa === session.name) : documentUploads
  const cantieri = useMemo(() => getCantieriFromUploads([...fotoUploads, ...documentUploads]), [fotoUploads, documentUploads])
  const tipiDocumento = useMemo(() => {
    const realTypes = [...new Set(documentUploads.map((upload) => upload.tipoDocumento).filter(Boolean))]
    return realTypes.length ? realTypes : tipiDocumentoFallback
  }, [documentUploads])

  const filteredPhotos = useMemo(() => {
    if (!canSeePhotos) return []
    return scopedFotoUploads.filter((upload) => matchesFilters(upload, { cantiereId, tipo, stato, search, isPhoto: true }))
  }, [canSeePhotos, cantiereId, scopedFotoUploads, search, stato, tipo])

  const filteredDocuments = useMemo(() => {
    return scopedDocumentUploads.filter((upload) => matchesFilters(upload, { cantiereId, tipo, stato, search, isPhoto: false }))
  }, [cantiereId, scopedDocumentUploads, search, stato, tipo])

  const allFiltered = useMemo(() => [
    ...filteredPhotos.map((upload) => ({ ...upload, uploadKind: 'foto' })),
    ...filteredDocuments.map((upload) => ({ ...upload, uploadKind: 'documento' })),
  ].sort((a, b) => new Date(b.dataCaricamento || 0) - new Date(a.dataCaricamento || 0)), [filteredDocuments, filteredPhotos])

  const priorities = allFiltered.filter(isPriorityUpload)
  const toCheck = filteredDocuments.filter((upload) => normalizeStatus(upload.stato) === 'da verificare')
  const duplicates = filteredDocuments.filter((upload) => normalizeStatus(upload.stato) === 'possibile duplicato')
  const selectedQueue = priorities.length ? priorities : allFiltered.slice(0, 8)

  function clearFilters() {
    setCantiereId('tutti')
    setTipo('tutti')
    setStato('tutti')
    setSearch('')
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Caricamenti reali"
        title={session.role === 'employee' ? 'I miei caricamenti' : 'Centro caricamenti'}
        description="Pagina di smistamento: filtra cosa è arrivato, controlla le priorità e apri subito il dettaglio giusto."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-primary button-small" href="#/dashboard/upload">Nuovo upload</a>
      </DashboardHeader>

      <section className="caricamenti-command-center" aria-label="Filtri caricamenti">
        <div className="caricamenti-search-panel">
          <div>
            <span className="eyebrow">Trova caricamento</span>
            <h2>Filtra prima di lavorare</h2>
            <p>Questi controlli stanno in alto perché decidono tutta la coda sotto: priorità, foto, documenti e duplicati.</p>
          </div>
          <label className="caricamenti-search-input">
            <InternalIcon name="search" size={18} />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Fornitore, file, lavorazione, nota..." />
          </label>
        </div>

        <div className="caricamenti-filter-grid">
          <label>
            Cantiere
            <select value={cantiereId} onChange={(event) => setCantiereId(event.target.value)}>
              <option value="tutti">Tutti</option>
              {cantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
            </select>
          </label>
          <label>
            Tipo
            <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option value="tutti">Tutti</option>
              {canSeePhotos ? <option value="foto">Foto</option> : null}
              <option value="documento">Documento</option>
              {tipiDocumento.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Stato
            <select value={stato} onChange={(event) => setStato(event.target.value)}>
              <option value="tutti">Tutti</option>
              {canSeePhotos ? statiFoto.map((item) => <option key={item} value={item}>{item}</option>) : null}
              {statiDocumenti.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className="button button-secondary" type="button" onClick={clearFilters}>Reset</button>
        </div>
      </section>

      <section className="caricamenti-kpi-strip" aria-label="Indicatori caricamenti">
        <CaricamentiMetric icon="inbox" label="Totali filtrati" value={allFiltered.length} hint="Foto + documenti" />
        <CaricamentiMetric icon="warning" tone="amber" label="Priorità" value={priorities.length} hint="Da lavorare" />
        <CaricamentiMetric icon="file" tone="green" label="Documenti" value={filteredDocuments.length} hint="Contabilità" />
        <CaricamentiMetric icon="image" tone="purple" label="Foto" value={filteredPhotos.length} hint={canSeePhotos ? 'Revisione' : 'Nascoste'} muted={!canSeePhotos} />
      </section>

      <div className="caricamenti-workspace-layout">
        <main className="caricamenti-main-panel">
          <section className="caricamenti-queue-panel">
            <div className="section-heading panel-title-row">
              <div>
                <h2>{priorities.length ? 'Coda prioritaria' : 'Ultimi caricamenti'}</h2>
                <p>La lista principale sta qui perché è il punto operativo: scegli un caricamento e apri il dettaglio.</p>
              </div>
              <span className="data-mode-badge">{selectedQueue.length} elementi</span>
            </div>
            <div className="caricamenti-queue-list">
              {selectedQueue.length > 0 ? selectedQueue.map((upload) => <UploadQueueRow key={`${upload.uploadKind}-${upload.id}`} upload={upload} />) : <EmptyQueue />}
            </div>
          </section>
        </main>

        <aside className="caricamenti-side-column">
          {session.role !== 'employee' ? <PriorityPanel title="Da verificare" rows={toCheck} /> : null}
          {session.role !== 'employee' ? <PriorityPanel title="Possibili duplicati" rows={duplicates} danger /> : null}
          <WorkflowPanel role={session.role} />
        </aside>
      </div>

      <section className={canSeePhotos ? 'caricamenti-recent-grid' : 'caricamenti-recent-grid single'}>
        {canSeePhotos ? <RecentUploadList title="Foto filtrate" type="foto" uploads={filteredPhotos} /> : null}
        <RecentUploadList title="Documenti filtrati" type="documento" uploads={filteredDocuments} showAmount={session.role !== 'employee'} />
      </section>
    </>
  )
}

function CaricamentiMetric({ icon, label, value, hint, tone = 'blue', muted = false }) {
  return (
    <article className={`caricamenti-metric caricamenti-metric-${tone} ${muted ? 'is-muted' : ''}`}>
      <span><InternalIcon name={icon} size={17} /></span>
      <div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
    </article>
  )
}

function UploadQueueRow({ upload }) {
  const isPhoto = upload.uploadKind === 'foto'
  const href = isPhoto ? `#/dashboard/foto/${upload.id}` : `#/dashboard/documenti/${upload.id}`
  return (
    <a className="caricamento-queue-row" href={href}>
      <FilePreviewMock fileName={upload.fileName} type={isPhoto ? 'image' : 'file'} />
      <div className="caricamento-queue-main">
        <div className="caricamento-queue-title">
          <strong>{isPhoto ? upload.lavorazione : upload.descrizione}</strong>
          <StatusBadge>{displayStatus(upload.stato)}</StatusBadge>
        </div>
        <p>{upload.cantiere} · {isPhoto ? upload.zona : upload.tipoDocumento} · {upload.fileName || 'file mock'}</p>
        <small>{formatDate(upload.dataCaricamento)} · {upload.caricatoDa}</small>
      </div>
      <span className="caricamento-kind-chip">{isPhoto ? 'Foto' : 'Documento'}</span>
    </a>
  )
}

function PriorityPanel({ title, rows, danger = false }) {
  return (
    <section className={danger ? 'caricamenti-side-card danger' : 'caricamenti-side-card'}>
      <div className="section-heading panel-title-row">
        <h2>{title}</h2>
        <a className="button button-secondary button-small" href="#/dashboard/documenti">Apri</a>
      </div>
      <div className="caricamenti-priority-list">
        {rows.length > 0 ? rows.slice(0, 4).map((row) => (
          <a href={`#/dashboard/documenti/${row.id}`} key={row.id}>
            <span className="file-chip file-pdf">DOC</span>
            <div><strong>{row.fornitore || row.descrizione}</strong><small>{row.cantiere} · {row.fileName || row.tipoDocumento}</small></div>
            <StatusBadge>{displayStatus(row.stato)}</StatusBadge>
          </a>
        )) : <article><span className="file-chip">OK</span><div><strong>Nessun elemento</strong><small>Niente da mostrare nei filtri attuali.</small></div></article>}
      </div>
    </section>
  )
}

function WorkflowPanel({ role }) {
  const steps = role === 'employee'
    ? ['Carica file dal cantiere', 'Controlla che sia leggibile', 'Riapri i tuoi caricamenti se serve']
    : ['Controlla priorità', 'Apri documento/foto', 'Conferma, classifica o segnala duplicato']
  return (
    <section className="caricamenti-side-card workflow">
      <div className="section-heading panel-title-row"><h2>Flusso consigliato</h2></div>
      <div className="caricamenti-workflow-list">
        {steps.map((step, index) => <article key={step}><span>{index + 1}</span><strong>{step}</strong></article>)}
      </div>
    </section>
  )
}

function EmptyQueue() {
  return <article className="caricamenti-empty"><strong>Nessun caricamento trovato</strong><p>Modifica filtri o ricerca per visualizzare altri elementi.</p></article>
}

function matchesFilters(upload, { cantiereId, tipo, stato, search, isPhoto }) {
  const normalizedSearch = search.trim().toLowerCase()
  const matchCantiere = cantiereId === 'tutti' || upload.cantiereId === cantiereId
  const matchTipo = isPhoto ? (tipo === 'tutti' || tipo === 'foto') : (tipo === 'tutti' || tipo === 'documento' || upload.tipoDocumento === tipo)
  const matchStato = stato === 'tutti' || upload.stato === stato
  const haystack = isPhoto
    ? [upload.lavorazione, upload.zona, upload.fileName, upload.cantiere, upload.nota]
    : [upload.fornitore, upload.descrizione, upload.fileName, upload.cantiere, upload.nota, upload.tipoDocumento]
  const matchSearch = normalizedSearch === '' || haystack.filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch)
  return matchCantiere && matchTipo && matchStato && matchSearch
}

function isPriorityUpload(upload) {
  const status = normalizeStatus(upload.stato)
  return ['da revisionare', 'da verificare', 'incompleto', 'possibile duplicato'].includes(status)
}

function normalizeStatus(status) {
  return String(status ?? '').trim().toLowerCase()
}

function displayStatus(status) {
  const normalized = normalizeStatus(status)
  if (normalized === 'possibile duplicato') return 'Duplicato'
  if (normalized === 'da verificare') return 'Da verificare'
  if (normalized === 'da revisionare') return 'Da revisionare'
  if (normalized === 'incompleto') return 'Incompleto'
  return status
}

function getCantieriFromUploads(uploads) {
  const map = new Map()
  uploads.forEach((upload) => {
    if (!upload.cantiereId) return
    map.set(upload.cantiereId, { id: upload.cantiereId, nome: upload.cantiere ?? upload.cantiereId })
  })
  return [...map.values()]
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
