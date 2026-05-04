import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  FilterGrid,
  KpiCard,
  KpiStrip,
  MobileActionMenu,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { InternalIcon } from '../../components/InternalIcons'
import { StatusBadge } from '../../components/StatusBadge'

export function PhotosMock({ session, store }) {
  const [filters, setFilters] = useState({
    cantiereId: 'tutti',
    stato: 'tutti',
    pubblicabile: 'tutti',
    search: '',
  })
  const [selectedId, setSelectedId] = useState(store.photos[0]?.id ?? null)
  const canPublish = session.role === 'admin'
  const scopedRows = session.role === 'employee'
    ? store.photos.filter((photo) => photo.caricatoDa === session.name)
    : store.photos
  const cantieri = useMemo(() => getCantieriFromPhotos(store.photos), [store.photos])

  const rows = useMemo(() => scopedRows.filter((photo) => {
    const search = filters.search.trim().toLowerCase()
    const matchesSite = filters.cantiereId === 'tutti' || photo.cantiereId === filters.cantiereId
    const matchesStatus = filters.stato === 'tutti' || photo.stato === filters.stato
    const matchesPublicable = filters.pubblicabile === 'tutti' || photo.pubblicabile === filters.pubblicabile
    const haystack = [
      photo.cantiere,
      photo.zona,
      photo.lavorazione,
      photo.caricatoDa,
      photo.fileName,
      photo.pubblicabile,
      photo.stato,
    ].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = search === '' || haystack.includes(search)
    return matchesSite && matchesStatus && matchesPublicable && matchesSearch
  }), [filters, scopedRows])

  const selectedPhoto = rows.find((photo) => photo.id === selectedId) ?? rows[0] ?? scopedRows[0]
  const toReview = scopedRows.filter((row) => row.stato === 'Da revisionare').length
  const approved = scopedRows.filter((row) => row.stato === 'Approvata').length
  const published = scopedRows.filter((row) => row.stato === 'Pubblicata').length

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function selectPhoto(photoId) {
    setSelectedId(photoId)
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Foto cantiere"
        title={session.role === 'employee' ? 'Le mie foto' : 'Foto cantiere'}
        description="Registro foto collegato allo store Supabase, con revisione e pubblicabilità nello stesso flusso dell’area privata."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-primary button-small" href="#/dashboard/upload">Carica foto</a>
      </DashboardHeader>

      <FilterGrid ariaLabel="Filtri foto cantiere">
        <label>
          Cerca
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Cantiere, zona, lavorazione, file..."
          />
        </label>
        <label>
          Cantiere
          <select value={filters.cantiereId} onChange={(event) => update('cantiereId', event.target.value)}>
            <option value="tutti">Tutti</option>
            {cantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>)}
          </select>
        </label>
        <label>
          Stato
          <select value={filters.stato} onChange={(event) => update('stato', event.target.value)}>
            <option value="tutti">Tutti</option>
            {store.photoStatuses.map((stato) => <option key={stato} value={stato}>{stato}</option>)}
          </select>
        </label>
        <label>
          Pubblicabile
          <select value={filters.pubblicabile} onChange={(event) => update('pubblicabile', event.target.value)}>
            <option value="tutti">Tutti</option>
            <option value="si">Sì</option>
            <option value="no">No</option>
            <option value="da valutare">Da valutare</option>
          </select>
        </label>
      </FilterGrid>

      <KpiStrip ariaLabel="Indicatori foto cantiere">
        <KpiCard icon="image" label="Foto filtrate" value={rows.length} hint={`${scopedRows.length} totali`} />
        <KpiCard icon="warning" tone="amber" label="Da revisionare" value={toReview} hint="Da lavorare" />
        <KpiCard icon="check" tone="green" label="Approvate" value={approved} hint="Pronte" />
        <KpiCard icon="report" tone="purple" label="Pubblicate" value={published} hint="Visibili / archivio" />
      </KpiStrip>

      <WorkspaceLayout
        className="photos-workspace"
        sidebar={selectedPhoto ? (
          <PhotoPreviewPanel photo={selectedPhoto} canPublish={canPublish} store={store} />
        ) : (
          <SideContextPanel title="Anteprima foto" description="Seleziona una foto dalla lista per vedere dettagli e azioni." />
        )}
      >
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Archivio foto ({rows.length})</h2>
              <p>Lista compatta coerente con documenti e caricamenti: seleziona una foto o apri il dettaglio.</p>
            </div>
            <StatusBadge>{filters.stato === 'tutti' ? 'Tutti gli stati' : filters.stato}</StatusBadge>
          </div>

          {rows.length > 0 ? (
            <div className="document-card-list">
              {rows.map((photo) => (
                <DataCardRow
                  key={photo.id}
                  icon="image"
                  selected={selectedPhoto?.id === photo.id}
                  title={`${photo.cantiere} · ${photo.zona}`}
                  description={`${photo.lavorazione} · ${photo.fileName || 'file senza nome'}`}
                  status={photo.stato}
                  meta={[
                    { label: 'Data', value: formatDate(photo.dataCaricamento) },
                    { label: 'Caricata da', value: photo.caricatoDa ?? '-' },
                    { label: 'Pubblicabile', value: displayPublicable(photo.pubblicabile) },
                    { label: 'Cantiere', value: photo.cantiere ?? '-' },
                    { label: 'Zona', value: photo.zona ?? '-' },
                  ]}
                  action={(
                    <ActionList>
                      <button className="button button-secondary button-small" type="button" onClick={() => selectPhoto(photo.id)}>
                        Anteprima
                      </button>
                      <a className="button button-secondary button-small" href={`#/dashboard/foto/${photo.id}`}>Apri</a>
                    </ActionList>
                  )}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Nessuna foto reale trovata">Modifica filtri, ricerca o importa nuove foto nello store Supabase.</EmptyState>
          )}
        </section>
      </WorkspaceLayout>
    </>
  )
}

function PhotoPreviewPanel({ photo, canPublish, store }) {
  return (
    <SideContextPanel
      className="photo-preview-panel"
      title="Anteprima foto"
      description="Dettagli e azioni collegate alla foto selezionata."
      action={<a className="button button-secondary button-small" href={`#/dashboard/foto/${photo.id}`}>Apri</a>}
    >
      <div className="document-preview-sheet">
        <FilePreviewMock fileName={photo.fileName} type="image" />
        <div className="recent-upload-title">
          <h3>{photo.cantiere} · {photo.zona}</h3>
          <StatusBadge>{photo.stato}</StatusBadge>
        </div>
        <p>{photo.lavorazione}</p>
        <small>{photo.fileName || 'File non indicato'}</small>
      </div>

      <section className="extracted-data">
        <h3>Dati foto</h3>
        <dl className="detail-list">
          <div><dt>Cantiere</dt><dd>{photo.cantiere ?? '-'}</dd></div>
          <div><dt>Zona</dt><dd>{photo.zona ?? '-'}</dd></div>
          <div><dt>Lavorazione</dt><dd>{photo.lavorazione ?? '-'}</dd></div>
          <div><dt>Caricata da</dt><dd>{photo.caricatoDa ?? '-'}</dd></div>
          <div><dt>Data</dt><dd>{formatDate(photo.dataCaricamento)}</dd></div>
          <div><dt>Pubblicabile</dt><dd>{displayPublicable(photo.pubblicabile)}</dd></div>
        </dl>
      </section>

      {canPublish ? (
        <section className="document-actions-panel">
          <h3>Azioni admin</h3>
          <button className="button button-success" type="button" onClick={() => store.approvePhoto(photo.id)}>Approva</button>
          <button className="button button-secondary" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Pubblicata')}>Pubblica</button>
          <button className="button button-secondary warning-action" type="button" onClick={() => store.updatePhotoStatus(photo.id, 'Non pubblicabile')}>Non pubblicabile</button>
          <MobileActionMenu label="Altre azioni">
            <a className="button button-secondary" href={`#/dashboard/foto/${photo.id}`}>Apri dettaglio</a>
          </MobileActionMenu>
        </section>
      ) : (
        <section className="document-actions-panel">
          <h3>Azioni</h3>
          <a className="button button-secondary" href={`#/dashboard/foto/${photo.id}`}>Apri dettaglio</a>
        </section>
      )}
    </SideContextPanel>
  )
}

function getCantieriFromPhotos(photos) {
  const map = new Map()
  photos.forEach((photo) => {
    if (!photo.cantiereId) return
    map.set(photo.cantiereId, { id: photo.cantiereId, nome: photo.cantiere ?? photo.cantiereId })
  })
  return [...map.values()]
}

function displayPublicable(value) {
  if (value === 'si') return 'Sì'
  if (value === 'no') return 'No'
  if (value === 'da valutare') return 'Da valutare'
  return value ?? '-'
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
