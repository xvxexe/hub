import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { DashboardHeader, DataModeBadge, StatCard } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import { formatDate, mockCantieri } from '../../data/mockCantieri'

export function PhotosMock({ session, store }) {
  const [filters, setFilters] = useState({ cantiereId: 'tutti', stato: 'tutti', pubblicabile: 'tutti' })
  const canPublish = session.role === 'admin'
  const scopedRows = session.role === 'employee'
    ? store.photos.filter((photo) => photo.caricatoDa === session.name)
    : store.photos

  const rows = useMemo(() => scopedRows.filter((photo) => {
    const matchesSite = filters.cantiereId === 'tutti' || photo.cantiereId === filters.cantiereId
    const matchesStatus = filters.stato === 'tutti' || photo.stato === filters.stato
    const matchesPublicable = filters.pubblicabile === 'tutti' || photo.pubblicabile === filters.pubblicabile
    return matchesSite && matchesStatus && matchesPublicable
  }), [filters, scopedRows])

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Foto cantiere"
        title={session.role === 'employee' ? 'Le mie foto' : 'Foto cantiere e pubblicazione mock'}
        description="Registro foto con dettaglio, stati di revisione e preparazione alla pubblicazione portfolio."
      >
        <DataModeBadge />
      </DashboardHeader>

      <section className="stats-grid">
        <StatCard label="Foto filtrate" value={rows.length} />
        <StatCard label="Da revisionare" value={scopedRows.filter((row) => row.stato === 'Da revisionare').length} />
        <StatCard label="Approvate" value={scopedRows.filter((row) => row.stato === 'Approvata').length} />
        <StatCard label="Pubblicate" value={scopedRows.filter((row) => row.stato === 'Pubblicata').length} />
      </section>

      <section className="cantieri-tools document-filters">
        <label>Cantiere<select value={filters.cantiereId} onChange={(event) => update('cantiereId', event.target.value)}>
          <option value="tutti">Tutti</option>
          {mockCantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
        </select></label>
        <label>Stato<select value={filters.stato} onChange={(event) => update('stato', event.target.value)}>
          <option value="tutti">Tutti</option>
          {store.photoStatuses.map((stato) => <option key={stato} value={stato}>{stato}</option>)}
        </select></label>
        <label>Pubblicabile<select value={filters.pubblicabile} onChange={(event) => update('pubblicabile', event.target.value)}>
          <option value="tutti">Tutti</option>
          <option value="si">Sì</option>
          <option value="no">No</option>
          <option value="da valutare">Da valutare</option>
        </select></label>
      </section>

      <section className="accounting-section">
        {rows.length > 0 ? (
          <div className="photo-grid">
            {rows.map((photo) => (
              <article className="photo-card" key={photo.id}>
                <FilePreviewMock fileName={photo.fileName} type="image" />
                <div className="recent-upload-title">
                  <h3>{photo.cantiere} · {photo.zona}</h3>
                  <StatusBadge>{photo.stato}</StatusBadge>
                </div>
                <p>{photo.lavorazione} · {photo.caricatoDa} · {formatDate(photo.dataCaricamento)}</p>
                <small>Pubblicabile: {photo.pubblicabile}</small>
                <div className="row-actions">
                  <a className="button button-secondary" href={`#/dashboard/foto/${photo.id}`}>Apri</a>
                  {canPublish ? (
                    <>
                      <button className="button button-secondary" type="button" onClick={() => store.approvePhoto(photo.id)}>Approva</button>
                      <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Non pubblicabile')}>Non pubblicabile</button>
                      <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Pubblicata')}>Pubblica</button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nessuna foto trovata">Modifica i filtri per vedere altre foto mock.</EmptyState>
        )}
      </section>
    </>
  )
}
