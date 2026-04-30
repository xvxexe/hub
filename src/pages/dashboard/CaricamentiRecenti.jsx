import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { RecentUploadList } from '../../components/RecentUploadList'
import { mockCantieri } from '../../data/mockCantieri'
import { statiDocumenti, statiFoto, tipiDocumento } from '../../data/mockUploads'

export function CaricamentiRecenti({ session, fotoUploads, documentUploads }) {
  const [cantiereId, setCantiereId] = useState('tutti')
  const [tipo, setTipo] = useState('tutti')
  const [stato, setStato] = useState('tutti')
  const canSeePhotos = session.role !== 'accounting'
  const canSeeDocuments = true
  const scopedFotoUploads =
    session.role === 'employee' ? fotoUploads.filter((upload) => upload.caricatoDa === session.name) : fotoUploads
  const scopedDocumentUploads =
    session.role === 'employee'
      ? documentUploads.filter((upload) => upload.caricatoDa === session.name)
      : documentUploads

  const filteredPhotos = useMemo(() => {
    if (!canSeePhotos) return []

    return scopedFotoUploads.filter((upload) => {
      const matchCantiere = cantiereId === 'tutti' || upload.cantiereId === cantiereId
      const matchTipo = tipo === 'tutti' || tipo === 'foto'
      const matchStato = stato === 'tutti' || upload.stato === stato
      return matchCantiere && matchTipo && matchStato
    })
  }, [canSeePhotos, cantiereId, scopedFotoUploads, stato, tipo])

  const filteredDocuments = useMemo(() => {
    if (!canSeeDocuments) return []

    return scopedDocumentUploads.filter((upload) => {
      const matchCantiere = cantiereId === 'tutti' || upload.cantiereId === cantiereId
      const matchTipo = tipo === 'tutti' || tipo === 'documento' || upload.tipoDocumento === tipo
      const matchStato = stato === 'tutti' || upload.stato === stato
      return matchCantiere && matchTipo && matchStato
    })
  }, [canSeeDocuments, cantiereId, scopedDocumentUploads, stato, tipo])

  return (
    <>
      <section className="dashboard-header">
        <p className="eyebrow">Caricamenti recenti</p>
        <h1>{session.role === 'employee' ? 'I miei caricamenti' : 'Foto e documenti caricati'}</h1>
        <p>
          Registro mock dei caricamenti locali, filtrabile per cantiere, tipo e stato. Nessun file
          viene salvato su servizi esterni.
        </p>
      </section>

      <section className="cantieri-tools upload-filters" aria-label="Filtri caricamenti">
        <label>
          Cantiere
          <select value={cantiereId} onChange={(event) => setCantiereId(event.target.value)}>
            <option value="tutti">Tutti</option>
            {mockCantieri.map((cantiere) => (
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
      </section>

      <section className="upload-recent-layout">
        {canSeePhotos ? (
          filteredPhotos.length > 0 ? (
            <RecentUploadList title="Foto recenti" type="foto" uploads={filteredPhotos} />
          ) : (
            <EmptyState title="Nessuna foto trovata">Modifica i filtri per vedere altre foto mock.</EmptyState>
          )
        ) : null}

        {filteredDocuments.length > 0 ? (
          <RecentUploadList
            title="Documenti recenti"
            type="documento"
            uploads={filteredDocuments}
            showAmount={session.role !== 'employee'}
          />
        ) : (
          <EmptyState title="Nessun documento trovato">
            Modifica i filtri per vedere altri documenti mock.
          </EmptyState>
        )}
      </section>
    </>
  )
}
