import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gps as readGps } from 'exifr'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { EmptyState } from '../../components/EmptyState'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { InternalIcon } from '../../components/InternalIcons'
import { StatusBadge } from '../../components/StatusBadge'
import { placeholderImages } from '../../data/publicImages'
import { siteImages } from '../../data/siteImages'
import { createSignedFileUrl } from '../../lib/supabaseStorage'

const placementOptions = buildPlacementOptions()

function buildPlacementOptions() {
  const options = [
  'Home · Hero principale',
  'Home · Sezione approccio',
  'Home · Card servizi / carousel',
  'Home · Griglia cantieri in evidenza',
  'Home · Sezione documentazione',
  'Servizi · Hero pagina',
  'Servizi · Card servizio',
  'Servizi · Sezione cartongesso',
  'Servizi · Sezione ristrutturazioni / demolizioni',
  'Cantieri · Hero pagina',
  'Cantieri · Cantiere in evidenza',
  'Cantieri · Griglia case study',
  'Cantieri · Sezione approccio',
  'Dettaglio cantiere · Hero',
  'Dettaglio cantiere · Galleria',
  'Dettaglio cantiere · Metodo applicato',
  'Chi siamo · Hero pagina',
  'Chi siamo · Sezione metodo',
  'Chi siamo · Sezione come lavoriamo',
  'Contatti · Hero pagina',
  'Archivio immagini sito',
  'Archivio interno',
  'Non usare sul sito',
  'Altro / DA VERIFICARE',
  ]

  const usageOptions = siteImages.flatMap((photo) => (Array.isArray(photo.usageLocations) ? photo.usageLocations : []).map(usageToDestinationLabel))
  return [...new Set([...options, ...usageOptions])]
}

const categoryOptions = [
  'Hero / immagine forte',
  'Lavorazione in corso',
  'Dettaglio tecnico',
  'Prima / dopo',
  'Materiali / attrezzatura',
  'Risultato finito',
  'Squadra / operatività',
  'DA VERIFICARE',
]

const priorityOptions = ['Alta', 'Media', 'Bassa']
const hiddenStorageKey = 'europaservice-hidden-site-photo-ids'
const gpsUnreadableMessage = 'Metadata non leggibili dal browser: verificare accesso al file originale'

function usageToDestinationLabel(usage) {
  return [usage?.pagina, usage?.sezione].filter(Boolean).join(' · ') || 'Altro / DA VERIFICARE'
}

function makePlacementId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `placement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createDesiredPlacement(overrides = {}) {
  return {
    id: makePlacementId(),
    destination: 'Altro / DA VERIFICARE',
    action: 'aggiungi',
    priority: 'Media',
    note: '',
    ...overrides,
  }
}

function normalizeDesiredPlacements(desiredPlacements = []) {
  if (!Array.isArray(desiredPlacements)) return []
  return desiredPlacements.map((placement) => createDesiredPlacement(placement))
}

export function PhotoPlacementTool({ store }) {
  const photos = Array.isArray(store?.photos) ? store.photos : []
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('tutti')
  const [originFilter, setOriginFilter] = useState('tutti')
  const [usageFilter, setUsageFilter] = useState('tutti')
  const [showDiscarded, setShowDiscarded] = useState(false)
  const [selection, setSelection] = useState(() => ({}))
  const [hiddenIds, setHiddenIds] = useState(() => loadHiddenPhotoIds())
  const [previewErrors, setPreviewErrors] = useState(() => ({}))
  const [photoMetadataById, setPhotoMetadataById] = useState(() => ({}))
  const [copyState, setCopyState] = useState('')
  const metadataLoadedRef = useRef(new Set())
  const metadataInFlightRef = useRef(new Set())

  const privatePhotos = useMemo(() => photos.map(normalizePrivatePhoto), [photos])
  const publicPhotos = useMemo(() => siteImages.map(normalizeSitePhoto), [])
  const catalogPhotos = useMemo(() => [...privatePhotos, ...publicPhotos], [privatePhotos, publicPhotos])
  const hiddenIdSet = useMemo(() => new Set(hiddenIds), [hiddenIds])
  const hiddenCount = hiddenIds.length

  const cantieri = useMemo(() => {
    const map = new Map()
    catalogPhotos.forEach((photo) => {
      if (!photo.cantiere || photo.cantiere === 'DA VERIFICARE') return
      map.set(photo.cantiere, photo.cantiere)
    })
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [catalogPhotos])

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase()

    return catalogPhotos
      .filter((photo) => {
        const matchesSite = siteFilter === 'tutti' || photo.cantiere === siteFilter
        const matchesOrigin = originFilter === 'tutti' || photo.originKey === originFilter
        const isHidden = hiddenIdSet.has(photo.id)
        const matchesUsage = usageFilter === 'tutti'
          || (usageFilter === 'used' && isUsedInSite(photo))
          || (usageFilter === 'unused' && !isUsedInSite(photo))
          || (usageFilter === 'preview-missing' && isPreviewMissing(photo, previewErrors))
          || (usageFilter === 'discarded' && isHidden)

        const haystack = [
          photo.id,
          photo.origin,
          photo.area,
          photo.posizione,
          photo.categoria,
          photo.cantiere,
          photo.fileName,
          photo.note,
          photo.zona,
          photo.lavorazione,
          photo.caricatoDa,
          photo.stato,
          photo.pubblicabile,
          formatUsageLocations(photo.usageLocations).join(' '),
        ].filter(Boolean).join(' ').toLowerCase()

        return matchesSite && matchesOrigin && matchesUsage && (!term || haystack.includes(term))
      })
      .sort((a, b) => compareCatalogPhotos(a, b, previewErrors))
  }, [catalogPhotos, hiddenIdSet, originFilter, previewErrors, search, siteFilter, usageFilter])

  const activeRows = useMemo(() => filteredCatalog.filter((photo) => !hiddenIdSet.has(photo.id)), [filteredCatalog, hiddenIdSet])
  const discardedRows = useMemo(() => filteredCatalog.filter((photo) => hiddenIdSet.has(photo.id)), [filteredCatalog, hiddenIdSet])
  const revealDiscarded = showDiscarded || usageFilter === 'discarded'
  const selectedRows = activeRows.filter((photo) => selection[photo.id]?.selected)
  const exportText = buildExportText(selectedRows, selection, previewErrors, photoMetadataById)

  const ensureGpsMetadata = useCallback(async (photo) => {
    if (!photo?.id) return
    if (metadataLoadedRef.current.has(photo.id) || metadataInFlightRef.current.has(photo.id)) return

    metadataInFlightRef.current.add(photo.id)
    setPhotoMetadataById((current) => ({
      ...current,
      [photo.id]: {
        status: 'loading',
        latitude: null,
        longitude: null,
        error: '',
      },
    }))

    try {
      const originalUrl = await resolveOriginalPhotoUrl(photo)
      if (!originalUrl) {
        throw new Error(gpsUnreadableMessage)
      }

      const response = await fetch(originalUrl, { method: 'GET', mode: 'cors', credentials: 'omit' })
      if (!response.ok) {
        throw new Error(gpsUnreadableMessage)
      }

      const fileBlob = await response.blob()
      const gps = await readGps(fileBlob)
      if (Number.isFinite(gps?.latitude) && Number.isFinite(gps?.longitude)) {
        const latitude = Number(gps.latitude)
        const longitude = Number(gps.longitude)
        metadataLoadedRef.current.add(photo.id)
        setPhotoMetadataById((current) => ({
          ...current,
          [photo.id]: {
            status: 'found',
            latitude,
            longitude,
            error: '',
          },
        }))
        return
      }

      metadataLoadedRef.current.add(photo.id)
      setPhotoMetadataById((current) => ({
        ...current,
        [photo.id]: {
          status: 'no-gps',
          latitude: null,
          longitude: null,
          error: '',
        },
      }))
    } catch (error) {
      metadataLoadedRef.current.add(photo.id)
      setPhotoMetadataById((current) => ({
        ...current,
        [photo.id]: {
          status: 'error',
          latitude: null,
          longitude: null,
          error: gpsUnreadableMessage,
        },
      }))
      console.error('Errore lettura GPS foto', photo.id, error)
    } finally {
      metadataInFlightRef.current.delete(photo.id)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(hiddenStorageKey, JSON.stringify(hiddenIds))
  }, [hiddenIds])

  function patchPhoto(photoId, patch) {
    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photoId] ?? {}
      const nextDraft = {
        selected: false,
        desiredPlacements: [],
        category: categoryOptions[1],
        note: '',
        ...currentDraft,
        ...patch,
      }

      nextDraft.desiredPlacements = normalizeDesiredPlacements(
        patch.desiredPlacements ?? currentDraft.desiredPlacements ?? [],
      )

      return {
        ...current,
        [photoId]: nextDraft,
      }
    })
  }

  function discardPhoto(photoId) {
    setHiddenIds((current) => (current.includes(photoId) ? current : [...current, photoId]))
    setSelection((current) => ({
      ...current,
      [photoId]: {
        ...(current[photoId] ?? {}),
        selected: false,
      },
    }))
  }

  function restorePhoto(photoId) {
    setHiddenIds((current) => current.filter((id) => id !== photoId))
  }

  function selectAllVisible() {
    setSelection((current) => {
      const next = { ...current }
      activeRows.forEach((photo) => {
        next[photo.id] = {
          selected: true,
          desiredPlacements: normalizeDesiredPlacements(next[photo.id]?.desiredPlacements),
          category: next[photo.id]?.category ?? categoryOptions[1],
          note: next[photo.id]?.note ?? '',
        }
      })
      return next
    })
  }

  function deselectAllVisible() {
    setSelection((current) => {
      const next = { ...current }
      activeRows.forEach((photo) => {
        next[photo.id] = {
          selected: false,
          desiredPlacements: normalizeDesiredPlacements(next[photo.id]?.desiredPlacements),
          category: next[photo.id]?.category ?? categoryOptions[1],
          note: next[photo.id]?.note ?? '',
        }
      })
      return next
    })
  }

  function hideUnselectedVisible() {
    const idsToHide = activeRows.filter((photo) => !selection[photo.id]?.selected).map((photo) => photo.id)
    if (!idsToHide.length) return
    setHiddenIds((current) => [...new Set([...current, ...idsToHide])])
  }

  function resetDiscarded() {
    if (typeof window !== 'undefined' && !window.confirm('Vuoi davvero ripristinare tutte le foto scartate dal tool?')) return
    setHiddenIds([])
  }

  function addDesiredPlacement(photo, placementPatch = {}) {
    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photo.id] ?? {}
      const nextPlacements = normalizeDesiredPlacements(currentDraft.desiredPlacements)
      nextPlacements.push(createDesiredPlacement(placementPatch))

      return {
        ...current,
        [photo.id]: {
          ...currentDraft,
          selected: true,
          desiredPlacements: nextPlacements,
        },
      }
    })
  }

  function upsertDesiredPlacement(photo, placementPatch = {}) {
    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photo.id] ?? {}
      const nextPlacements = normalizeDesiredPlacements(currentDraft.desiredPlacements)
      const draftPlacement = createDesiredPlacement(placementPatch)
      const matchIndex = nextPlacements.findIndex((placement) => placement.destination === draftPlacement.destination && placement.action === draftPlacement.action)
      if (matchIndex >= 0) {
        nextPlacements[matchIndex] = {
          ...nextPlacements[matchIndex],
          ...draftPlacement,
          id: nextPlacements[matchIndex].id,
        }
      } else {
        nextPlacements.push(draftPlacement)
      }

      return {
        ...current,
        [photo.id]: {
          ...currentDraft,
          selected: true,
          desiredPlacements: nextPlacements,
        },
      }
    })
  }

  function updateDesiredPlacement(photo, placementId, patch) {
    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photo.id] ?? {}
      const nextPlacements = normalizeDesiredPlacements(currentDraft.desiredPlacements).map((placement) => (
        placement.id === placementId ? { ...placement, ...patch } : placement
      ))
      return {
        ...current,
        [photo.id]: {
          ...currentDraft,
          desiredPlacements: nextPlacements,
          selected: true,
        },
      }
    })
  }

  function removeDesiredPlacement(photo, placementId) {
    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photo.id] ?? {}
      return {
        ...current,
        [photo.id]: {
          ...currentDraft,
          desiredPlacements: normalizeDesiredPlacements(currentDraft.desiredPlacements).filter((placement) => placement.id !== placementId),
        },
      }
    })
  }

  function addDestinationRow(photo) {
    addDesiredPlacement(photo, { destination: 'Altro / DA VERIFICARE', action: 'aggiungi', priority: 'Media', note: '' })
  }

  function applyUsageAction(photo, usage, action) {
    const destination = usageToDestinationLabel(usage)
    upsertDesiredPlacement(photo, {
      destination,
      action,
      priority: action === 'rimuovi' ? 'Alta' : 'Media',
      note: action === 'sostituisci' ? 'Sostituire in questa posizione' : '',
    })
  }

  function applyAllCurrentUsages(photo, action) {
    const usages = Array.isArray(photo.usageLocations) ? photo.usageLocations : []
    if (!usages.length) {
      addDestinationRow(photo)
      return
    }

    usages.forEach((usage) => {
      applyUsageAction(photo, usage, action)
    })
  }

  function requestDoNotUse(photo) {
    if (isUsedInSite(photo) && !window.confirm('Questa foto è già usata nel sito. Vuoi chiedere la rimozione da tutte le posizioni pubbliche?')) return

    setCopyState('')
    setSelection((current) => {
      const currentDraft = current[photo.id] ?? {}
      return {
        ...current,
        [photo.id]: {
          ...currentDraft,
          selected: true,
          desiredPlacements: [
            createDesiredPlacement({
              destination: 'Non usare sul sito',
              action: 'rimuovi',
              priority: 'Alta',
              note: 'Richiesta: rimuovere da tutte le posizioni pubbliche',
            }),
          ],
        },
      }
    })
  }

  function markPreviewFailed(photoId) {
    setPreviewErrors((current) => (current[photoId] ? current : { ...current, [photoId]: true }))
  }

  async function copyOutput() {
    if (!exportText.trim()) return

    try {
      await navigator.clipboard.writeText(exportText)
      setCopyState('Copiato')
    } catch {
      setCopyState('Copia manualmente dal box output')
    }
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Tool sito pubblico"
        title="Selezione foto per sito"
        description="Scegli le foto migliori, verifica dove sono già usate e genera un output ordinato da passare per la modifica del codice."
      >
        <DataModeBadge>Tool operativo</DataModeBadge>
      </DashboardHeader>

      <section className="photo-placement-toolbar" aria-label="Filtri selezione foto sito">
        <label>
          Cerca foto
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cantiere, zona, file, lavorazione..."
          />
        </label>
        <label>
          Cantiere
          <select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}>
            <option value="tutti">Tutti i cantieri</option>
            {cantieri.map((cantiere) => <option key={cantiere.id} value={cantiere.id}>{cantiere.name}</option>)}
          </select>
        </label>
        <label>
          Origine
          <select value={originFilter} onChange={(event) => setOriginFilter(event.target.value)}>
            <option value="tutti">Tutte</option>
            <option value="site">Sito pubblico</option>
            <option value="private">Area privata / Supabase</option>
          </select>
        </label>
        <label>
          Uso nel sito
          <select value={usageFilter} onChange={(event) => setUsageFilter(event.target.value)}>
            <option value="tutti">Tutte</option>
            <option value="used">Già usate nel sito</option>
            <option value="unused">Non usate nel sito</option>
            <option value="preview-missing">Preview non disponibile</option>
            <option value="discarded">Scartate</option>
          </select>
        </label>
        <label className="photo-placement-toggle">
          <span>Mostra scartate</span>
          <button className="button button-secondary button-small" type="button" onClick={() => setShowDiscarded((current) => !current)}>
            {showDiscarded ? 'Sì' : 'No'}
          </button>
        </label>
        <div className="photo-placement-stats" aria-label="Riepilogo selezione">
          <strong>{selectedRows.length}</strong>
          <span>foto selezionate</span>
        </div>
        <div className="photo-placement-stats photo-placement-stats-discarded" aria-label="Riepilogo scartate">
          <strong>{hiddenCount}</strong>
          <span>foto scartate</span>
        </div>
      </section>

      <div className="photo-placement-layout">
        <section className="internal-panel photo-placement-list">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Immagini disponibili ({activeRows.length})</h2>
              <p>Le foto già usate nel sito sono evidenziate con il loro conteggio e con la lista delle posizioni attuali.</p>
            </div>
            <StatusBadge>{originFilter === 'tutti' ? 'Tutte le origini' : originFilter === 'site' ? 'Sito pubblico' : 'Area privata / Supabase'}</StatusBadge>
          </div>

          <div className="photo-placement-actions">
            <button className="button button-secondary button-small" type="button" onClick={selectAllVisible}>Seleziona tutte visibili</button>
            <button className="button button-secondary button-small" type="button" onClick={deselectAllVisible}>Deseleziona tutte</button>
            <button className="button button-secondary button-small" type="button" onClick={hideUnselectedVisible}>Nascondi non selezionate</button>
            <button className="button button-secondary button-small" type="button" onClick={() => setShowDiscarded((current) => !current)}>
              {showDiscarded ? 'Nascondi scartate' : 'Mostra scartate'}
            </button>
            <button className="button button-secondary button-small" type="button" onClick={resetDiscarded}>Reset scartate</button>
          </div>

          {activeRows.length > 0 ? (
            <div className="photo-placement-grid">
              {activeRows.map((photo) => (
                <PhotoPlacementCard
                  key={photo.id}
                  photo={photo}
                  draft={selection[photo.id] ?? {}}
                  isDiscarded={false}
                  isPreviewBroken={isPreviewMissing(photo, previewErrors)}
                  metadata={photoMetadataById[photo.id]}
                  onDiscard={discardPhoto}
                  onPatch={patchPhoto}
                  onPreviewError={markPreviewFailed}
                  onEnsureGpsMetadata={ensureGpsMetadata}
                  onAddDesiredPlacement={addDesiredPlacement}
                  onUpdateDesiredPlacement={updateDesiredPlacement}
                  onRemoveDesiredPlacement={removeDesiredPlacement}
                  onUsageAction={applyUsageAction}
                  onAllUsageAction={applyAllCurrentUsages}
                  onDoNotUse={requestDoNotUse}
                />
              ))}
            </div>
          ) : !revealDiscarded ? (
            <EmptyState title="Nessuna foto trovata">Modifica ricerca, origine, uso nel sito o filtro cantiere.</EmptyState>
          ) : null}

          {revealDiscarded ? (
            <div className="photo-placement-discarded-section">
              <div className="section-heading">
                <h2>Foto scartate ({discardedRows.length})</h2>
                <p>Restano nel catalogo, ma non entrano nell’output finché non le ripristini.</p>
              </div>

              {discardedRows.length > 0 ? (
                <div className="photo-placement-grid">
                  {discardedRows.map((photo) => (
                    <PhotoPlacementCard
                      key={photo.id}
                      photo={photo}
                      draft={selection[photo.id] ?? {}}
                      isDiscarded
                      isPreviewBroken={isPreviewMissing(photo, previewErrors)}
                      metadata={photoMetadataById[photo.id]}
                      onDiscard={discardPhoto}
                      onPatch={patchPhoto}
                      onPreviewError={markPreviewFailed}
                      onRestore={restorePhoto}
                      onEnsureGpsMetadata={ensureGpsMetadata}
                      onAddDesiredPlacement={addDesiredPlacement}
                      onUpdateDesiredPlacement={updateDesiredPlacement}
                      onRemoveDesiredPlacement={removeDesiredPlacement}
                      onUsageAction={applyUsageAction}
                      onAllUsageAction={applyAllCurrentUsages}
                      onDoNotUse={requestDoNotUse}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="Nessuna foto scartata">Usa il pulsante Scarta sulla riga di una foto per nasconderla dal catalogo operativo.</EmptyState>
              )}
            </div>
          ) : null}
        </section>

        <aside className="internal-panel photo-placement-output">
          <div className="section-heading">
            <span className="eyebrow">Output per ChatGPT</span>
            <h2>Blocco copiabile</h2>
            <p>Incollami questo testo quando vuoi che sistemi le immagini nel sito.</p>
          </div>

          <button className="button button-primary" type="button" onClick={copyOutput} disabled={!exportText.trim()}>
            <InternalIcon name="copy" size={16} />
            Copia output
          </button>
          {copyState ? <small className="photo-placement-copy-state">{copyState}</small> : null}

          <textarea
            className="photo-placement-export"
            readOnly
            value={exportText || 'Seleziona almeno una foto per generare l’output.'}
            rows="18"
          />
        </aside>
      </div>
    </>
  )
}

function PhotoPlacementCard({
  photo,
  draft,
  isDiscarded,
  isPreviewBroken,
  metadata,
  onDiscard,
  onPatch,
  onPreviewError,
  onRestore,
  onEnsureGpsMetadata,
  onAddDesiredPlacement,
  onUpdateDesiredPlacement,
  onRemoveDesiredPlacement,
  onUsageAction,
  onAllUsageAction,
  onDoNotUse,
}) {
  useEffect(() => {
    onEnsureGpsMetadata(photo)
  }, [onEnsureGpsMetadata, photo])

  const usageLocations = Array.isArray(photo.usageLocations) ? photo.usageLocations : []
  const usageCount = usageLocations.length
  const desiredPlacements = normalizeDesiredPlacements(draft.desiredPlacements)
  const usedInSite = isUsedInSite(photo)
  const hasManyUses = usageCount > 2
  const hasTooManyDesiredPlacements = desiredPlacements.length > 3
  const previewStatus = isPreviewBroken ? 'Non disponibile' : 'OK'
  const gpsStatus = getGpsStatusLabel(metadata)
  const gpsMapsUrl = metadata?.status === 'found' && Number.isFinite(metadata.latitude) && Number.isFinite(metadata.longitude)
    ? buildMapsUrl(metadata.latitude, metadata.longitude)
    : ''

  return (
    <article className={composeCardClassName({ isSelected: Boolean(draft.selected), isDiscarded })} key={photo.id}>
      <div className="photo-placement-row-main">
        <div className="photo-placement-preview">
          <PhotoPreview photo={photo} isPreviewBroken={isPreviewBroken} onPreviewError={onPreviewError} />
        </div>

        <div className="photo-placement-main">
          <div className="photo-placement-topline">
            <div className="photo-placement-title-badges">
              <h3>{photo.fileName}</h3>
              <StatusBadge>{photo.origin}</StatusBadge>
              <StatusBadge>{usedInSite ? `Usata nel sito (${usageCount})` : 'Non usata nel sito'}</StatusBadge>
              {hasManyUses ? <StatusBadge>Usata in più punti</StatusBadge> : null}
              {hasTooManyDesiredPlacements ? <StatusBadge tone="amber">Rischio ripetizione visiva</StatusBadge> : null}
              <StatusBadge>{photo.pubblicabile === 'si' ? 'Pubblicabile' : displayPublicable(photo.pubblicabile)}</StatusBadge>
              <StatusBadge>{previewStatus === 'OK' ? 'Preview OK' : 'Preview non disponibile'}</StatusBadge>
              {isDiscarded ? <StatusBadge>Scartata</StatusBadge> : null}
            </div>
            <div className="photo-placement-inline-meta">
              <span>{photo.areaAttuale || photo.area || 'Area DA VERIFICARE'}</span>
              <span>{photo.posizioneAttuale || photo.posizione || 'Posizione DA VERIFICARE'}</span>
              <span>{photo.cantiere || 'Cantiere DA VERIFICARE'}</span>
            </div>
          </div>

          <div className="photo-placement-quick-actions">
            <label className="photo-placement-check">
              <input
                type="checkbox"
                checked={Boolean(draft.selected)}
                onChange={(event) => onPatch(photo.id, { selected: event.target.checked })}
              />
              Usa
            </label>
            <label className="photo-placement-card-select">
              Categoria
              <select
                value={draft.category ?? categoryOptions[1]}
                onChange={(event) => onPatch(photo.id, { category: event.target.value, selected: true })}
              >
                {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            {usedInSite ? (
              <>
                <button className="button button-secondary button-small" type="button" onClick={() => onAllUsageAction(photo, 'mantieni')}>Mantieni tutti</button>
                <button className="button button-secondary button-small" type="button" onClick={() => onAllUsageAction(photo, 'rimuovi')}>Rimuovi da tutto</button>
                <button className="button button-secondary button-small" type="button" onClick={() => onAddDesiredPlacement(photo, { action: 'aggiungi', priority: 'Media', note: '' })}>
                  Usa anche in…
                </button>
                <button className="button button-secondary button-small" type="button" onClick={() => onDoNotUse(photo)}>
                  Non usare sul sito
                </button>
              </>
            ) : (
              <button className="button button-secondary button-small" type="button" onClick={() => onAddDesiredPlacement(photo, { action: 'aggiungi', priority: 'Media', note: '' })}>
                Aggiungi destinazione
              </button>
            )}
            {isDiscarded && onRestore ? (
              <button className="button button-primary button-small photo-placement-discard-button" type="button" onClick={() => onRestore(photo.id)}>
                Ripristina
              </button>
            ) : (
              <button
                className="button button-secondary button-small photo-placement-discard-button"
                type="button"
                onClick={() => onDiscard(photo.id)}
              >
                Scarta
              </button>
            )}
          </div>

          <dl className="photo-placement-meta photo-placement-meta-site">
            <div><dt>ID</dt><dd>{photo.id}</dd></div>
            <div><dt>File</dt><dd>{photo.fileName || 'DA VERIFICARE'}</dd></div>
            <div><dt>Origine</dt><dd>{photo.origin || 'DA VERIFICARE'}</dd></div>
            <div><dt>Area attuale</dt><dd>{photo.areaAttuale || photo.area || photo.cantiere || 'DA VERIFICARE'}</dd></div>
            <div><dt>Posizione attuale</dt><dd>{photo.posizioneAttuale || photo.posizione || 'DA VERIFICARE'}</dd></div>
            <div><dt>Usata nel sito</dt><dd>{usedInSite ? `Sì (${usageCount})` : 'No'}</dd></div>
            <div><dt>Categoria</dt><dd>{photo.categoria || 'DA VERIFICARE'}</dd></div>
            <div><dt>Pubblicabile</dt><dd>{displayPublicable(photo.pubblicabile)}</dd></div>
            <div><dt>Stato preview</dt><dd>{previewStatus}</dd></div>
            <div><dt>GPS</dt><dd>{gpsStatus}</dd></div>
          </dl>

          <section className="photo-placement-gps">
            <div className="photo-placement-section-head">
              <h4>Leggi posizione</h4>
              <StatusBadge>{gpsStatus}</StatusBadge>
            </div>

            {metadata?.status === 'loading' || !metadata ? (
              <p className="photo-placement-gps-message">Posizione: caricamento…</p>
            ) : null}

            {metadata?.status === 'found' ? (
              <div className="photo-placement-gps-found">
                <div className="photo-placement-gps-coords">
                  <span>Latitudine: {formatGpsCoordinate(metadata.latitude)}</span>
                  <span>Longitudine: {formatGpsCoordinate(metadata.longitude)}</span>
                </div>
                <a className="photo-placement-source-link" href={gpsMapsUrl} target="_blank" rel="noreferrer noopener">
                  Apri Maps
                </a>
              </div>
            ) : null}

            {metadata?.status === 'no-gps' ? (
              <p className="photo-placement-gps-message">GPS non presente nei metadata</p>
            ) : null}

            {metadata?.status === 'error' ? (
              <p className="photo-placement-gps-message is-error">{metadata.error || gpsUnreadableMessage}</p>
            ) : null}
          </section>

          <section className="photo-placement-usage-details">
            <div className="photo-placement-section-head">
              <h4>Utilizzi attuali</h4>
              <StatusBadge>{usedInSite ? `Sì · ${usageCount}` : 'No'}</StatusBadge>
            </div>

            {usedInSite ? (
              <ul className="photo-placement-usage-list">
                {usageLocations.map((usage, index) => (
                  <li className="photo-placement-usage-item" key={`${photo.id}-${usage.route}-${usage.pagina}-${usage.sezione}-${usage.componente}-${usage.slot}-${index}`}>
                    <div className="photo-placement-usage-copy">
                      <strong>{usage.pagina}</strong>
                      <span>{usage.sezione}</span>
                      <small>{usage.componente} · {usage.slot} · {usage.route}</small>
                    </div>
                    <div className="photo-placement-usage-actions">
                      <button className="button button-secondary button-small" type="button" onClick={() => onUsageAction(photo, usage, 'mantieni')}>Mantieni</button>
                      <button className="button button-secondary button-small" type="button" onClick={() => onUsageAction(photo, usage, 'rimuovi')}>Rimuovi</button>
                      <button className="button button-secondary button-small" type="button" onClick={() => onUsageAction(photo, usage, 'sostituisci')}>Sostituisci</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="photo-placement-usage-empty">Non usata nel sito</p>
            )}
          </section>

          <section className="photo-placement-desired-panel">
            <div className="photo-placement-section-head">
              <h4>Destinazioni desiderate</h4>
              <button className="button button-secondary button-small" type="button" onClick={() => onAddDesiredPlacement(photo, { action: 'aggiungi', priority: 'Media', note: '' })}>
                + Aggiungi destinazione
              </button>
            </div>

            {desiredPlacements.length > 0 ? (
              <div className="photo-placement-desired-list">
                {desiredPlacements.map((placement) => (
                  <div className="photo-placement-desired-row" key={placement.id}>
                    <label>
                      Destinazione
                      <select
                        value={placement.destination}
                        onChange={(event) => {
                          const value = event.target.value
                          if (value === 'Non usare sul sito' && usedInSite && !window.confirm('Questa foto è già usata nel sito. Vuoi chiedere la rimozione da tutte le posizioni pubbliche?')) return
                          onUpdateDesiredPlacement(photo, placement.id, { destination: value, selected: true })
                        }}
                      >
                        {placementOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label>
                      Azione
                      <select
                        value={placement.action}
                        onChange={(event) => onUpdateDesiredPlacement(photo, placement.id, { action: event.target.value, selected: true })}
                      >
                        <option value="mantieni">Mantieni</option>
                        <option value="aggiungi">Aggiungi</option>
                        <option value="sostituisci">Sostituisci</option>
                        <option value="rimuovi">Rimuovi</option>
                      </select>
                    </label>
                    <label>
                      Priorità
                      <select
                        value={placement.priority}
                        onChange={(event) => onUpdateDesiredPlacement(photo, placement.id, { priority: event.target.value, selected: true })}
                      >
                        {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="photo-placement-desired-note">
                      Nota
                      <input
                        type="text"
                        value={placement.note}
                        onChange={(event) => onUpdateDesiredPlacement(photo, placement.id, { note: event.target.value, selected: true })}
                        placeholder="Nota breve..."
                      />
                    </label>
                    <button className="button button-secondary button-small photo-placement-remove-row" type="button" onClick={() => onRemoveDesiredPlacement(photo, placement.id)}>
                      Rimuovi riga
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="photo-placement-usage-empty">Nessuna destinazione desiderata ancora impostata.</p>
            )}
          </section>

          {photo.sourceUrl ? (
            <a className="photo-placement-source-link" href={photo.sourceUrl} target="_blank" rel="noreferrer noopener">
              Apri su Drive
            </a>
          ) : null}

          <label className="photo-placement-note">
            Note generali
            <textarea
              value={draft.note ?? ''}
              onChange={(event) => onPatch(photo.id, { note: event.target.value, selected: true })}
              placeholder="Note rapide..."
              rows="2"
            />
          </label>
        </div>
      </div>
    </article>
  )
}

function PhotoPreview({ photo, isPreviewBroken, onPreviewError }) {
  if (!photo.previewSrc || isPreviewBroken) {
    if (photo.originKey === 'private') {
      return (
        <FilePreviewMock
          fileName={photo.fileName}
          storageBucket={photo.storageBucket}
          storagePath={photo.storagePath}
          type="image"
        />
      )
    }

    return (
      <div className="photo-placement-preview-fallback">
        <img alt={photo.fileName} className="photo-placement-site-image is-broken" src={placeholderImages.project.src} />
        <div className="photo-placement-preview-fallback-copy">
          <strong>Preview non disponibile</strong>
          <span>Il file non risponde più bene come thumbnail.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="photo-placement-preview-frame">
      <img
        alt={photo.fileName}
        className="photo-placement-site-image"
        loading="lazy"
        onError={() => onPreviewError(photo.id)}
        src={photo.previewSrc}
        title={photo.fileName}
      />
    </div>
  )
}

function buildExportText(photos, selection, previewErrors, photoMetadataById) {
  if (!photos.length) return ''

  const lines = [
    'SELEZIONE FOTO PER SITO EUROPASERVICE',
    `Foto selezionate: ${photos.length}`,
    '',
  ]

  photos.forEach((photo, index) => {
    const draft = selection[photo.id] ?? {}
    const usageLocations = Array.isArray(photo.usageLocations) ? photo.usageLocations : []
    const usageCount = usageLocations.length
    const desiredPlacements = normalizeDesiredPlacements(draft.desiredPlacements)
    const duplicateWarning = usageCount > 2 ? 'Usata in più punti' : ''
    const repeatWarning = desiredPlacements.length > 3 ? 'Rischio ripetizione visiva' : ''
    const gpsMetadata = photoMetadataById?.[photo.id] ?? { status: 'loading', latitude: null, longitude: null, error: '' }
    const gpsStatus = getGpsStatusLabel(gpsMetadata)
    const gpsLatitude = Number.isFinite(gpsMetadata.latitude) ? gpsMetadata.latitude : 'null'
    const gpsLongitude = Number.isFinite(gpsMetadata.longitude) ? gpsMetadata.longitude : 'null'
    const mapsUrl = gpsMetadata.status === 'found' && Number.isFinite(gpsMetadata.latitude) && Number.isFinite(gpsMetadata.longitude)
      ? buildMapsUrl(gpsMetadata.latitude, gpsMetadata.longitude)
      : 'null'
    const removalRequest = desiredPlacements.some((placement) => placement.destination === 'Non usare sul sito')
      || (usedInSite(photo) && desiredPlacements.length > 0 && desiredPlacements.every((placement) => placement.action === 'rimuovi'))
    const previewStatus = isPreviewMissing(photo, previewErrors) ? 'Non disponibile' : 'OK'

    lines.push(
      `${index + 1}. ${photo.fileName || 'FILE DA VERIFICARE'}`,
      `- ID: ${photo.id}`,
      `- Origine: ${photo.origin || 'DA VERIFICARE'}`,
      `- Area attuale: ${photo.areaAttuale || photo.area || photo.cantiere || 'DA VERIFICARE'}`,
      `- Posizione attuale: ${photo.posizioneAttuale || photo.posizione || 'DA VERIFICARE'}`,
      `- Source URL / Drive URL: ${photo.sourceUrl || 'non disponibile'}`,
      `- Usata nel sito: ${(photo.usataNelSito || usageCount > 0) ? 'Sì' : 'No'}`,
      `- Numero utilizzi attuali: ${usageCount}`,
      `- Utilizzi attuali: ${usageLocations.length ? formatUsageLocations(usageLocations).join(' | ') : 'Nessuno'}`,
      '- Piano richiesto:',
    )

    if (desiredPlacements.length > 0) {
      desiredPlacements.forEach((placement, placementIndex) => {
        lines.push(
          `  ${placementIndex + 1}. azione: ${placement.action}`,
          `     destinazione: ${placement.destination}`,
          `     priorità: ${placement.priority}`,
          `     note: ${placement.note?.trim() || 'Nessuna nota'}`,
        )
      })
    } else {
      lines.push('  Nessuna destinazione ancora impostata.')
    }

    lines.push(
      `- Categoria: ${draft.category || 'DA VERIFICARE'}`,
      `- Pubblicabile: ${displayPublicable(photo.pubblicabile)}`,
      `- Stato preview: ${previewStatus}`,
      `- gpsStatus: ${gpsStatus}`,
      `- gpsLatitude: ${gpsLatitude}`,
      `- gpsLongitude: ${gpsLongitude}`,
      `- mapsUrl: ${mapsUrl}`,
      `- Note generali: ${draft.note?.trim() || photo.note || 'Nessuna nota'}`,
      `- Warning doppioni: ${[duplicateWarning, repeatWarning].filter(Boolean).join(' · ') || 'Nessuno'}`,
    )

    if (removalRequest && (photo.usataNelSito || usageCount > 0)) {
      lines.push('- Richiesta: rimuovere da tutte le posizioni pubbliche')
    }

    lines.push('')
  })

  lines.push('AZIONE RICHIESTA: usa questa selezione per aggiornare immagini, posizioni e testi del sito pubblico direttamente nel codice.')
  return lines.join('\n')
}

function normalizePrivatePhoto(photo) {
  return {
    id: photo.id,
    fileName: photo.fileName || 'DA VERIFICARE',
    src: photo.src ?? null,
    previewSrc: photo.src ?? null,
    origin: 'Area privata / Supabase',
    originKey: 'private',
    area: photo.cantiere ?? 'DA VERIFICARE',
    areaAttuale: photo.cantiere ?? 'DA VERIFICARE',
    posizione: [photo.zona, photo.lavorazione].filter(Boolean).join(' · ') || 'DA VERIFICARE',
    posizioneAttuale: [photo.zona, photo.lavorazione].filter(Boolean).join(' · ') || 'DA VERIFICARE',
    categoria: photo.lavorazione ?? photo.tipoDocumento ?? 'DA VERIFICARE',
    cantiere: photo.cantiere ?? 'DA VERIFICARE',
    usataNelSito: false,
    usageLocations: [],
    pubblicabile: photo.pubblicabile ?? 'da valutare',
    note: photo.descrizionePubblica ?? photo.note ?? '',
    stato: photo.stato ?? 'DA VERIFICARE',
    storagePath: photo.storagePath,
    storageBucket: photo.storageBucket,
  }
}

function normalizeSitePhoto(photo) {
  return {
    ...photo,
    originKey: 'site',
    origin: 'Sito pubblico',
    previewSrc: photo.src ?? null,
    usataNelSito: photo.usataNelSito ?? (Array.isArray(photo.usageLocations) && photo.usageLocations.length > 0),
  }
}

async function resolveOriginalPhotoUrl(photo) {
  if (photo?.originKey === 'private') {
    if (!photo.storageBucket || !photo.storagePath) return null
    const { data, error } = await createSignedFileUrl({
      bucket: photo.storageBucket,
      storagePath: photo.storagePath,
      expiresIn: 900,
    })
    if (error) return null
    return data?.signedUrl ?? null
  }

  if (photo?.sourceUrl) {
    const driveDownloadUrl = buildDriveDownloadUrl(photo.sourceUrl)
    return driveDownloadUrl || photo.sourceUrl
  }

  if (photo?.src && !String(photo.src).includes('drive.google.com/thumbnail')) {
    return photo.src
  }

  return null
}

function isUsedInSite(photo) {
  return Boolean(photo.usataNelSito || (Array.isArray(photo.usageLocations) && photo.usageLocations.length > 0))
}

function isPreviewMissing(photo, previewErrors) {
  return !photo.previewSrc || Boolean(previewErrors[photo.id])
}

function compareCatalogPhotos(a, b, previewErrors) {
  const rankA = photoRank(a, previewErrors)
  const rankB = photoRank(b, previewErrors)
  if (rankA !== rankB) return rankA - rankB

  const usageDiff = (Array.isArray(a.usageLocations) ? a.usageLocations.length : 0) - (Array.isArray(b.usageLocations) ? b.usageLocations.length : 0)
  if (usageDiff !== 0) return usageDiff

  return (a.fileName || '').localeCompare(b.fileName || '', 'it', { sensitivity: 'base' })
}

function photoRank(photo, previewErrors) {
  if (isPreviewMissing(photo, previewErrors)) return 3
  const usageCount = Array.isArray(photo.usageLocations) ? photo.usageLocations.length : 0
  const used = isUsedInSite(photo)
  if (!used || usageCount === 0) return 0
  if (usageCount === 1) return 1
  return 2
}

function formatUsageLocations(usageLocations = []) {
  return usageLocations.map((usage) => {
    const parts = [usage.pagina, usage.sezione, usage.componente, usage.slot].filter(Boolean)
    return parts.join(' · ')
  })
}

function loadHiddenPhotoIds() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(hiddenStorageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function composeCardClassName({ isSelected, isDiscarded }) {
  return [
    'photo-placement-card',
    isSelected ? 'is-selected' : '',
    isDiscarded ? 'is-discarded' : '',
  ].filter(Boolean).join(' ')
}

function displayPublicable(value) {
  if (value === 'si') return 'Sì'
  if (value === 'no') return 'No'
  if (value === 'da valutare') return 'Da valutare'
  return value ?? 'DA VERIFICARE'
}

function buildDriveDownloadUrl(sourceUrl) {
  if (!sourceUrl) return null
  const match = String(sourceUrl).match(/\/file\/d\/([^/]+)\//) || String(sourceUrl).match(/[?&]id=([^&]+)/)
  const fileId = match?.[1]
  if (!fileId) return sourceUrl
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

function buildMapsUrl(latitude, longitude) {
  return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`
}

function formatGpsCoordinate(value) {
  if (!Number.isFinite(value)) return 'DA VERIFICARE'
  return value.toFixed(6)
}

function getGpsStatusLabel(metadata) {
  if (!metadata || metadata.status === 'idle' || metadata.status === 'loading') return 'Caricamento…'
  if (metadata.status === 'found') return 'GPS trovato'
  if (metadata.status === 'no-gps') return 'GPS non presente nei metadata'
  return metadata.error || gpsUnreadableMessage
}
