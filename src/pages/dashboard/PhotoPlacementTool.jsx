import { useEffect, useMemo, useState } from 'react'
import { SafeImage } from '../../components/SafeImage'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { EmptyState } from '../../components/EmptyState'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { InternalIcon } from '../../components/InternalIcons'
import { StatusBadge } from '../../components/StatusBadge'
import { siteImages } from '../../data/siteImages'

const placementOptions = [
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

const priorityOptions = ['Alta', 'Media', 'Bassa', 'Scartata']
const hiddenStorageKey = 'europaservice-hidden-site-photo-ids'

export function PhotoPlacementTool({ store }) {
  const photos = Array.isArray(store?.photos) ? store.photos : []
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('tutti')
  const [originFilter, setOriginFilter] = useState('tutti')
  const [showDiscarded, setShowDiscarded] = useState(false)
  const [selection, setSelection] = useState(() => ({}))
  const [hiddenIds, setHiddenIds] = useState(() => loadHiddenPhotoIds())
  const [copyState, setCopyState] = useState('')

  const privatePhotos = useMemo(() => photos.map(normalizePrivatePhoto), [photos])
  const catalogPhotos = useMemo(() => [...privatePhotos, ...normalizedSiteImages], [privatePhotos])
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

  const rows = useMemo(() => catalogPhotos.filter((photo) => {
    const term = search.trim().toLowerCase()
    const matchesSite = siteFilter === 'tutti' || photo.cantiere === siteFilter
    const matchesOrigin = originFilter === 'tutti' || photo.originKey === originFilter
    const isHidden = hiddenIdSet.has(photo.id)
    const matchesHidden = showDiscarded ? isHidden : !isHidden
    const haystack = [
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
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesSite && matchesOrigin && matchesHidden && (!term || haystack.includes(term))
  }), [search, siteFilter, originFilter, catalogPhotos, hiddenIdSet, showDiscarded])

  const selectedRows = rows.filter((photo) => selection[photo.id]?.selected && !hiddenIdSet.has(photo.id))
  const exportText = buildExportText(selectedRows, selection)
  const visibleRows = rows.filter((photo) => !hiddenIdSet.has(photo.id))
  const discardedRows = useMemo(() => catalogPhotos.filter((photo) => hiddenIdSet.has(photo.id)), [catalogPhotos, hiddenIdSet])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(hiddenStorageKey, JSON.stringify(hiddenIds))
  }, [hiddenIds])

  function patchPhoto(photoId, patch) {
    setCopyState('')
    setSelection((current) => ({
      ...current,
        [photoId]: {
          selected: false,
          placement: placementOptions[0],
          customPosition: '',
          category: categoryOptions[1],
          priority: 'Media',
          note: '',
          ...(current[photoId] ?? {}),
          ...patch,
        },
      }))
  }

  function discardPhoto(photoId) {
    setHiddenIds((current) => (current.includes(photoId) ? current : [...current, photoId]))
  }

  function restorePhoto(photoId) {
    setHiddenIds((current) => current.filter((id) => id !== photoId))
  }

  function selectAllVisible() {
    setSelection((current) => {
      const next = { ...current }
      visibleRows.forEach((photo) => {
        next[photo.id] = {
          selected: true,
          placement: next[photo.id]?.placement ?? placementOptions[0],
          customPosition: next[photo.id]?.customPosition ?? '',
          category: next[photo.id]?.category ?? categoryOptions[1],
          priority: next[photo.id]?.priority ?? 'Media',
          note: next[photo.id]?.note ?? '',
        }
      })
      return next
    })
  }

  function deselectAllVisible() {
    setSelection((current) => {
      const next = { ...current }
      visibleRows.forEach((photo) => {
        next[photo.id] = {
          selected: false,
          placement: next[photo.id]?.placement ?? placementOptions[0],
          customPosition: next[photo.id]?.customPosition ?? '',
          category: next[photo.id]?.category ?? categoryOptions[1],
          priority: next[photo.id]?.priority ?? 'Media',
          note: next[photo.id]?.note ?? '',
        }
      })
      return next
    })
  }

  function hideUnselectedVisible() {
    const idsToHide = visibleRows.filter((photo) => !selection[photo.id]?.selected).map((photo) => photo.id)
    if (!idsToHide.length) return
    setHiddenIds((current) => [...new Set([...current, ...idsToHide])])
  }

  function resetDiscarded() {
    if (typeof window !== 'undefined' && !window.confirm('Vuoi davvero ripristinare tutte le foto scartate dal tool?')) return
    setHiddenIds([])
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
        description="Scegli le foto migliori, assegna dove devono andare nel sito e genera un output ordinato da passare per la modifica del codice."
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
              <h2>Immagini disponibili ({rows.length})</h2>
              <p>Spunta solo le immagini utili per il sito. Le immagini scartate restano fuori dall’output.</p>
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

          {rows.length > 0 ? (
            <div className="photo-placement-grid">
              {rows.map((photo) => {
                const draft = selection[photo.id] ?? {}
                const isSelected = Boolean(draft.selected)
                const isSiteImage = photo.originKey === 'site'
                const isDiscarded = hiddenIdSet.has(photo.id)
                const placementValue = draft.placement ?? placementOptions[0]
                const showCustomPosition = placementValue === 'Altro / DA VERIFICARE'

                return (
                  <article className={composeCardClassName({ isSelected, isDiscarded })} key={photo.id}>
                    <div className="photo-placement-row-main">
                      <div className="photo-placement-preview">
                        {isSiteImage ? (
                          <SafeImage
                            alt={photo.fileName}
                            className="photo-placement-site-image"
                            fallbackSrc={photo.src}
                            finalFallbackSrc={photo.src}
                            loading="lazy"
                            src={photo.src}
                            title={photo.fileName}
                          />
                        ) : (
                          <FilePreviewMock fileName={photo.fileName} storageBucket={photo.storageBucket} storagePath={photo.storagePath} type="image" />
                        )}
                      </div>
                      <div className="photo-placement-main">
                        <div className="photo-placement-topline">
                          <div className="photo-placement-title-badges">
                            <h3>{photo.fileName}</h3>
                            <StatusBadge>{isSiteImage ? 'Sito pubblico' : 'Area privata / Supabase'}</StatusBadge>
                            {isDiscarded ? <StatusBadge>Scartata</StatusBadge> : null}
                          </div>
                          <div className="photo-placement-inline-meta">
                            <span>{isSiteImage ? photo.area ?? 'Area DA VERIFICARE' : photo.cantiere ?? 'Cantiere DA VERIFICARE'}</span>
                            <span>{isSiteImage ? photo.posizione ?? 'Posizione DA VERIFICARE' : photo.zona ?? 'Zona DA VERIFICARE'}</span>
                          </div>
                        </div>

                        <div className="photo-placement-compact-controls">
                          <label>
                            Dove metterla
                            <select
                              value={placementValue}
                              onChange={(event) => patchPhoto(photo.id, { placement: event.target.value, selected: true })}
                            >
                              {placementOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          </label>
                          <label>
                            Categoria
                            <select
                              value={draft.category ?? categoryOptions[1]}
                              onChange={(event) => patchPhoto(photo.id, { category: event.target.value, selected: true })}
                            >
                              {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          </label>
                          <label>
                            Priorità
                            <select
                              value={draft.priority ?? 'Media'}
                              onChange={(event) => patchPhoto(photo.id, { priority: event.target.value, selected: true })}
                            >
                              {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                          </label>
                          <label className="photo-placement-check">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => patchPhoto(photo.id, { selected: event.target.checked })}
                            />
                            Usa
                          </label>
                          <button
                            className="button button-secondary button-small photo-placement-discard-button"
                            type="button"
                            onClick={() => discardPhoto(photo.id)}
                          >
                            Scarta
                          </button>
                          {showCustomPosition ? (
                            <label className="photo-placement-custom-position">
                              Posizione personalizzata
                              <input
                                type="text"
                                value={draft.customPosition ?? ''}
                                onChange={(event) => patchPhoto(photo.id, { customPosition: event.target.value, selected: true })}
                                placeholder="Es. Hero mobile, galleria, card 2..."
                              />
                            </label>
                          ) : null}
                        </div>

                        <dl className={isSiteImage ? 'photo-placement-meta photo-placement-meta-site' : 'photo-placement-meta'}>
                          {isSiteImage ? (
                            <>
                              <div><dt>Origine</dt><dd>Sito pubblico</dd></div>
                              <div><dt>Area attuale</dt><dd>{photo.area || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Posizione attuale</dt><dd>{photo.posizione || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Categoria</dt><dd>{photo.categoria || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Pubblicabile</dt><dd>{displayPublicable(photo.pubblicabile)}</dd></div>
                            </>
                          ) : (
                            <>
                              <div><dt>Origine</dt><dd>Area privata / Supabase</dd></div>
                              <div><dt>Area attuale</dt><dd>{photo.cantiere || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Posizione attuale</dt><dd>{photo.posizione || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Stato</dt><dd>{photo.stato || 'DA VERIFICARE'}</dd></div>
                              <div><dt>Pubblicabile</dt><dd>{displayPublicable(photo.pubblicabile)}</dd></div>
                            </>
                          )}
                        </dl>

                        <label className="photo-placement-note">
                          Note
                          <textarea
                            value={draft.note ?? ''}
                            onChange={(event) => patchPhoto(photo.id, { note: event.target.value, selected: true })}
                            placeholder="Note rapide..."
                            rows="2"
                          />
                        </label>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : showDiscarded && discardedRows.length > 0 ? (
            <div className="photo-placement-grid">
              {discardedRows.map((photo) => {
                const draft = selection[photo.id] ?? {}
                const isSiteImage = photo.originKey === 'site'

                return (
                  <article className="photo-placement-card is-discarded" key={photo.id}>
                    <div className="photo-placement-row-main">
                      <div className="photo-placement-preview">
                        {isSiteImage ? (
                          <SafeImage
                            alt={photo.fileName}
                            className="photo-placement-site-image"
                            fallbackSrc={photo.src}
                            finalFallbackSrc={photo.src}
                            loading="lazy"
                            src={photo.src}
                            title={photo.fileName}
                          />
                        ) : (
                          <FilePreviewMock fileName={photo.fileName} storageBucket={photo.storageBucket} storagePath={photo.storagePath} type="image" />
                        )}
                      </div>
                      <div className="photo-placement-main">
                        <div className="photo-placement-topline">
                          <div className="photo-placement-title-badges">
                            <h3>{photo.fileName}</h3>
                            <StatusBadge>{isSiteImage ? 'Sito pubblico' : 'Area privata / Supabase'}</StatusBadge>
                            <StatusBadge>Scartata</StatusBadge>
                          </div>
                          <div className="photo-placement-inline-meta">
                            <span>{isSiteImage ? photo.area ?? 'Area DA VERIFICARE' : photo.cantiere ?? 'Cantiere DA VERIFICARE'}</span>
                            <span>{isSiteImage ? photo.posizione ?? 'Posizione DA VERIFICARE' : photo.zona ?? 'Zona DA VERIFICARE'}</span>
                          </div>
                        </div>
                        <div className="photo-placement-compact-controls">
                          <button className="button button-primary button-small photo-placement-discard-button" type="button" onClick={() => restorePhoto(photo.id)}>
                            Ripristina
                          </button>
                          <span className="photo-placement-discard-hint">Non entra nell’output finché resta scartata.</span>
                        </div>
                        <dl className="photo-placement-meta photo-placement-meta-site">
                          <div><dt>ID</dt><dd>{photo.id}</dd></div>
                          <div><dt>File</dt><dd>{photo.fileName || 'DA VERIFICARE'}</dd></div>
                          <div><dt>Origine</dt><dd>{photo.origin || 'DA VERIFICARE'}</dd></div>
                          <div><dt>Area attuale</dt><dd>{photo.area || photo.cantiere || 'DA VERIFICARE'}</dd></div>
                          <div><dt>Posizione attuale</dt><dd>{photo.posizione || 'DA VERIFICARE'}</dd></div>
                          <div><dt>Categoria</dt><dd>{photo.categoria || photo.stato || 'DA VERIFICARE'}</dd></div>
                        </dl>
                        <label className="photo-placement-note">
                          Note
                          <textarea readOnly value={draft.note ?? ''} rows="2" />
                        </label>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <EmptyState title="Nessuna foto trovata">Modifica ricerca o filtro cantiere.</EmptyState>
          )}
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

function buildExportText(photos, selection) {
  if (!photos.length) return ''

  const lines = [
    'SELEZIONE FOTO PER SITO EUROPASERVICE',
    `Foto selezionate: ${photos.length}`,
    '',
  ]

  photos.forEach((photo, index) => {
    const draft = selection[photo.id] ?? {}
    lines.push(
      `${index + 1}. ${photo.fileName || 'FILE DA VERIFICARE'}`,
      `- ID: ${photo.id}`,
      `- Origine: ${photo.origin || 'DA VERIFICARE'}`,
      `- Area attuale: ${photo.originKey === 'site' ? (photo.area || 'DA VERIFICARE') : (photo.cantiere || 'DA VERIFICARE')}`,
      `- Posizione attuale: ${photo.originKey === 'site' ? (photo.posizione || 'DA VERIFICARE') : (photo.zona || 'DA VERIFICARE')} ${photo.originKey === 'private' ? ` / ${photo.lavorazione || 'DA VERIFICARE'}` : ''}`,
      `- Nuova destinazione: ${draft.placement || 'DA VERIFICARE'}`,
      `- Categoria: ${draft.category || 'DA VERIFICARE'}`,
      `- Priorità: ${draft.priority || 'DA VERIFICARE'}`,
      `- Pubblicabile: ${displayPublicable(photo.pubblicabile)}`,
      '',
    )
    if (draft.customPosition?.trim()) {
      lines.push(`- Posizione custom: ${draft.customPosition.trim()}`)
    }
    lines.push(`- Note: ${draft.note?.trim() || 'Nessuna nota'}`, '')
  })

  lines.push('AZIONE RICHIESTA: usa questa selezione per aggiornare immagini, posizioni e testi del sito pubblico direttamente nel codice.')
  return lines.join('\n')
}

function displayPublicable(value) {
  if (value === 'si') return 'Sì'
  if (value === 'no') return 'No'
  if (value === 'da valutare') return 'Da valutare'
  return value ?? 'DA VERIFICARE'
}

function normalizePrivatePhoto(photo) {
  return {
    id: photo.id,
    fileName: photo.fileName || 'DA VERIFICARE',
    src: photo.src ?? null,
    origin: 'Area privata / Supabase',
    originKey: 'private',
    area: photo.cantiere ?? 'DA VERIFICARE',
    posizione: [photo.zona, photo.lavorazione].filter(Boolean).join(' · ') || 'DA VERIFICARE',
    categoria: photo.lavorazione ?? photo.tipoDocumento ?? 'DA VERIFICARE',
    cantiere: photo.cantiere ?? 'DA VERIFICARE',
    usataNelSito: false,
    pubblicabile: photo.pubblicabile ?? 'da valutare',
    note: photo.descrizionePubblica ?? photo.note ?? '',
    stato: photo.stato ?? 'DA VERIFICARE',
    storagePath: photo.storagePath,
    storageBucket: photo.storageBucket,
  }
}

const normalizedSiteImages = siteImages.map((photo) => ({
  ...photo,
  originKey: 'site',
  origin: 'Sito pubblico',
  usataNelSito: true,
}))

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
