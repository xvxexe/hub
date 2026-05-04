import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
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

      <FilterGrid ariaLabel="Filtri caricamenti">
        <label className="accounting-search">
          Cerca
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Fornitore, file, lavorazione, nota..."
          />
        </label>
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
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori caricamenti">
        <KpiCard icon="inbox" label="Totali filtrati" value={allFiltered.length} hint="Foto + documenti" />
        <KpiCard icon="warning" tone="amber" label="Priorità" value={priorities.length} hint="Da lavorare" />
        <KpiCard icon="file" tone="green" label="Documenti" value={filteredDocuments.length} hint="Contabilità" />
        <KpiCard icon="image" tone="purple" label="Foto" value={filteredPhotos.length} hint={canSeePhotos ? 'Revisione' : 'Nascoste'} muted={!canSeePhotos} />
      </KpiStrip>

      <WorkspaceLayout
        className="caricamenti-workspace"
        sidebar={(
          <>
            {session.role !== 'employee' ? <PriorityPanel title="Da verificare" rows={toCheck} /> : null}
            {session.role !== 'employee' ? <PriorityPanel title="Possibili duplicati" rows={duplicates} danger /> : null}
            <WorkflowPanel role={session.role} />
          </>
        )}
      >
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>{priorities.length ? 'Coda prioritaria' : 'Ultimi caricamenti'}</h2>
              <p>Lista operativa compatta: scegli un caricamento e apri il dettaglio corretto.</p>
            </div>
            <span className="data-mode-badge">{selectedQueue.length} elementi</span>
          </div>
          <div className="document-card-list">
            {selectedQueue.length > 0 ? selectedQueue.map((upload) => <UploadQueueRow key={`${upload.uploadKind}-${upload.id}`} upload={upload} />) : <EmptyQueue />}
          </div>
        </section>
      </WorkspaceLayout>

      <section className={canSeePhotos ? 'caricamenti-recent-grid' : 'caricamenti-recent-grid single'}>
        {canSeePhotos ? <RecentUploadList title="Foto filtrate" type="foto" uploads={filteredPhotos} /> : null}
        <RecentUploadList title="Documenti filtrati" type="documento" uploads={filteredDocuments} showAmount={session.role !== 'employee'} />
      </section>
    </>
  )
}

function UploadQueueRow({ upload }) {
  const isPhoto = upload.uploadKind === 'foto'
  const href = isPhoto ? `#/dashboard/foto/${upload.id}` : `#/dashboard/documenti/${upload.id}`
  return (
    <DataCardRow
      icon={isPhoto ? 'image' : getDocumentIcon(upload.tipoDocumento)}
      title={isPhoto ? upload.lavorazione : upload.descrizione}
      description={`${upload.cantiere} · ${isPhoto ? upload.zona : upload.tipoDocumento} · ${upload.fileName || 'file mock'}`}
      status={displayStatus(upload.stato)}
      href={href}
      warning={isPriorityUpload(upload)}
      meta={[
        { label: 'Tipo', value: isPhoto ? 'Foto' : 'Documento' },
        { label: 'Data', value: formatDate(upload.dataCaricamento) },
        { label: 'Caricato da', value: upload.caricatoDa ?? '-' },
        { label: 'Cantiere', value: upload.cantiere ?? '-' },
        { label: 'File', value: upload.fileName || '-' },
      ]}
    />
  )
}

function PriorityPanel({ title, rows, danger = false }) {
  return (
    <SideContextPanel
      className={danger ? 'caricamenti-side-card danger' : 'caricamenti-side-card'}
      title={title}
      description={danger ? 'Possibili duplicati da controllare prima di registrare.' : 'Documenti arrivati e ancora da verificare.'}
      action={<a className="button button-secondary button-small" href="#/dashboard/documenti">Apri</a>}
    >
      <div className="document-card-list">
        {rows.length > 0 ? rows.slice(0, 4).map((row) => (
          <DataCardRow
            key={row.id}
            icon={danger ? 'warning' : 'file'}
            title={row.fornitore || row.descrizione}
            description={`${row.cantiere} · ${row.fileName || row.tipoDocumento}`}
            status={displayStatus(row.stato)}
            href={`#/dashboard/documenti/${row.id}`}
            warning={danger}
            meta={[
              { label: 'Tipo', value: row.tipoDocumento ?? 'Documento' },
              { label: 'Data', value: formatDate(row.dataCaricamento) },
            ]}
          />
        )) : <article className="accounting-alert"><strong>Nessun elemento</strong><small>Niente da mostrare nei filtri attuali.</small></article>}
      </div>
    </SideContextPanel>
  )
}

function WorkflowPanel({ role }) {
  const steps = role === 'employee'
    ? ['Carica file dal cantiere', 'Controlla che sia leggibile', 'Riapri i tuoi caricamenti se serve']
    : ['Controlla priorità', 'Apri documento/foto', 'Conferma, classifica o segnala duplicato']
  return (
    <SideContextPanel title="Flusso consigliato" description="Ordine pratico per lavorare i caricamenti senza duplicare dati.">
      <div className="workflow-stepper">
        {steps.map((step, index) => <article className="workflow-step" key={step}><span>{index + 1}</span><strong>{step}</strong></article>)}
      </div>
    </SideContextPanel>
  )
}

function EmptyQueue() {
  return <article className="accounting-alert"><strong>Nessun caricamento trovato</strong><small>Modifica filtri o ricerca per visualizzare altri elementi.</small></article>
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

function getDocumentIcon(tipoDocumento) {
  if (tipoDocumento === 'Bonifico') return 'wallet'
  if (tipoDocumento === 'Preventivo') return 'estimate'
  if (tipoDocumento === 'FIR') return 'warning'
  return 'file'
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
