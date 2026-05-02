import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
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
  const canSeeDocuments = true
  const scopedFotoUploads =
    session.role === 'employee' ? fotoUploads.filter((upload) => upload.caricatoDa === session.name) : fotoUploads
  const scopedDocumentUploads =
    session.role === 'employee'
      ? documentUploads.filter((upload) => upload.caricatoDa === session.name)
      : documentUploads
  const cantieri = useMemo(() => getCantieriFromUploads([...fotoUploads, ...documentUploads]), [fotoUploads, documentUploads])
  const tipiDocumento = useMemo(() => {
    const realTypes = [...new Set(documentUploads.map((upload) => upload.tipoDocumento).filter(Boolean))]
    return realTypes.length ? realTypes : tipiDocumentoFallback
  }, [documentUploads])

  const filteredPhotos = useMemo(() => {
    if (!canSeePhotos) return []

    return scopedFotoUploads.filter((upload) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchCantiere = cantiereId === 'tutti' || upload.cantiereId === cantiereId
      const matchTipo = tipo === 'tutti' || tipo === 'foto'
      const matchStato = stato === 'tutti' || upload.stato === stato
      const haystack = [upload.lavorazione, upload.zona, upload.fileName, upload.cantiere, upload.nota]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchSearch = normalizedSearch === '' || haystack.includes(normalizedSearch)
      return matchCantiere && matchTipo && matchStato && matchSearch
    })
  }, [canSeePhotos, cantiereId, scopedFotoUploads, search, stato, tipo])

  const filteredDocuments = useMemo(() => {
    if (!canSeeDocuments) return []

    return scopedDocumentUploads.filter((upload) => {
      const normalizedSearch = search.trim().toLowerCase()
      const matchCantiere = cantiereId === 'tutti' || upload.cantiereId === cantiereId
      const matchTipo = tipo === 'tutti' || tipo === 'documento' || upload.tipoDocumento === tipo
      const matchStato = stato === 'tutti' || upload.stato === stato
      const haystack = [upload.fornitore, upload.descrizione, upload.fileName, upload.cantiere, upload.nota]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchSearch = normalizedSearch === '' || haystack.includes(normalizedSearch)
      return matchCantiere && matchTipo && matchStato && matchSearch
    })
  }, [canSeeDocuments, cantiereId, scopedDocumentUploads, search, stato, tipo])

  const toCheck = filteredDocuments.filter((upload) => upload.stato === 'da verificare')
  const duplicates = filteredDocuments.filter((upload) => upload.stato === 'possibile duplicato')

  return (
    <>
      <DashboardHeader
        eyebrow="Caricamenti reali"
        title={session.role === 'employee' ? 'I miei caricamenti' : 'Foto e documenti caricati'}
        description="Registro collegato allo store Supabase. I dati mock WhatsApp sono stati rimossi."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
      </DashboardHeader>

      <section className="cantieri-tools upload-filters" aria-label="Filtri caricamenti">
        <label>
          Cantiere
          <select value={cantiereId} onChange={(event) => setCantiereId(event.target.value)}>
            <option value="tutti">Tutti</option>
            {cantieri.map((cantiere) => (
              <option key={cantiere.id} value={cantiere.id}>
                {cantiere.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
            <option value="tutti">Tutti</option>
            {canSeePhotos ? <option value="foto">Foto</option> : null}
            <option value="documento">Documento</option>
            {tipiDocumento.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stato
          <select value={stato} onChange={(event) => setStato(event.target.value)}>
            <option value="tutti">Tutti</option>
            {canSeePhotos
              ? statiFoto.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              : null}
            {statiDocumenti.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ricerca
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Fornitore, file, lavorazione..."
          />
        </label>
      </section>

      {session.role !== 'employee' ? (
        <section className="internal-two-column internal-padded">
          <HighlightBox title="Documenti da verificare" rows={toCheck} />
          <HighlightBox title="Possibili duplicati" rows={duplicates} />
        </section>
      ) : null}

      <section className={canSeePhotos ? 'upload-recent-layout' : 'upload-recent-layout upload-recent-layout-single'}>
        {canSeePhotos ? <RecentUploadList title="Foto recenti" type="foto" uploads={filteredPhotos} /> : null}
        <RecentUploadList
          title="Documenti recenti"
          type="documento"
          uploads={filteredDocuments}
          showAmount={session.role !== 'employee'}
        />
      </section>
    </>
  )
}

function HighlightBox({ title, rows }) {
  return (
    <section className="internal-panel">
      <div className="section-heading"><h2>{title}</h2></div>
      <div className="activity-feed">
        {rows.length > 0 ? rows.slice(0, 4).map((row) => (
          <a className="activity-item interactive-row" href={`#/dashboard/documenti/${row.id}`} key={row.id}>
            <span />
            <div><strong>{row.fornitore}</strong><small>{row.cantiere} · {row.descrizione}</small></div>
            <StatusBadge>{row.stato}</StatusBadge>
          </a>
        )) : <p>Nessun elemento nei filtri attuali.</p>}
      </div>
    </section>
  )
}

function getCantieriFromUploads(uploads) {
  const map = new Map()
  uploads.forEach((upload) => {
    if (!upload.cantiereId) return
    map.set(upload.cantiereId, { id: upload.cantiereId, nome: upload.cantiere ?? upload.cantiereId })
  })
  return [...map.values()]
}
