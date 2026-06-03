import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { EmptyState } from '../../components/EmptyState'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { InternalIcon } from '../../components/InternalIcons'
import { StatusBadge } from '../../components/StatusBadge'

const placementOptions = [
  'Home · Hero principale',
  'Home · Servizi in evidenza',
  'Servizi · Cartongesso',
  'Servizi · Demolizioni',
  'Cantieri · Griglia progetti',
  'Dettaglio cantiere',
  'Chi siamo · Metodo di lavoro',
  'Contatti · Sfondo/sezione finale',
  'Non usare sul sito',
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

export function PhotoPlacementTool({ store }) {
  const photos = Array.isArray(store?.photos) ? store.photos : []
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('tutti')
  const [selection, setSelection] = useState(() => ({}))
  const [copyState, setCopyState] = useState('')

  const cantieri = useMemo(() => {
    const map = new Map()
    photos.forEach((photo) => {
      if (!photo.cantiereId) return
      map.set(photo.cantiereId, photo.cantiere ?? photo.cantiereId)
    })
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [photos])

  const rows = useMemo(() => photos.filter((photo) => {
    const term = search.trim().toLowerCase()
    const matchesSite = siteFilter === 'tutti' || photo.cantiereId === siteFilter
    const haystack = [
      photo.cantiere,
      photo.zona,
      photo.lavorazione,
      photo.fileName,
      photo.caricatoDa,
      photo.stato,
      photo.pubblicabile,
    ].filter(Boolean).join(' ').toLowerCase()
    return matchesSite && (!term || haystack.includes(term))
  }), [photos, search, siteFilter])

  const selectedRows = rows.filter((photo) => selection[photo.id]?.selected)
  const exportText = buildExportText(selectedRows, selection)

  function patchPhoto(photoId, patch) {
    setCopyState('')
    setSelection((current) => ({
      ...current,
      [photoId]: {
        selected: false,
        placement: placementOptions[0],
        category: categoryOptions[1],
        priority: 'Media',
        note: '',
        ...(current[photoId] ?? {}),
        ...patch,
      },
    }))
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
        <div className="photo-placement-stats" aria-label="Riepilogo selezione">
          <strong>{selectedRows.length}</strong>
          <span>foto selezionate</span>
        </div>
      </section>

      <div className="photo-placement-layout">
        <section className="internal-panel photo-placement-list">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Foto disponibili ({rows.length})</h2>
              <p>Spunta solo le foto utili per il sito. Le foto scartate restano fuori dall’output.</p>
            </div>
            <StatusBadge>{siteFilter === 'tutti' ? 'Tutti' : cantieri.find((item) => item.id === siteFilter)?.name}</StatusBadge>
          </div>

          {rows.length > 0 ? (
            <div className="photo-placement-grid">
              {rows.map((photo) => {
                const draft = selection[photo.id] ?? {}
                const isSelected = Boolean(draft.selected)

                return (
                  <article className={isSelected ? 'photo-placement-card is-selected' : 'photo-placement-card'} key={photo.id}>
                    <div className="photo-placement-preview">
                      <FilePreviewMock fileName={photo.fileName} type="image" />
                    </div>
                    <div className="photo-placement-main">
                      <div className="photo-placement-title-row">
                        <div>
                          <h3>{photo.cantiere ?? 'Cantiere non indicato'}</h3>
                          <p>{photo.zona ?? 'Zona DA VERIFICARE'} · {photo.lavorazione ?? 'Lavorazione DA VERIFICARE'}</p>
                        </div>
                        <label className="photo-placement-check">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => patchPhoto(photo.id, { selected: event.target.checked })}
                          />
                          Usa
                        </label>
                      </div>

                      <dl className="photo-placement-meta">
                        <div><dt>File</dt><dd>{photo.fileName || 'DA VERIFICARE'}</dd></div>
                        <div><dt>Stato</dt><dd>{photo.stato || 'DA VERIFICARE'}</dd></div>
                        <div><dt>Pubblicabile</dt><dd>{displayPublicable(photo.pubblicabile)}</dd></div>
                      </dl>

                      <div className="photo-placement-controls">
                        <label>
                          Dove metterla
                          <select
                            value={draft.placement ?? placementOptions[0]}
                            onChange={(event) => patchPhoto(photo.id, { placement: event.target.value, selected: true })}
                          >
                            {placementOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </label>
                        <label>
                          Categoria visiva
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
                        <label className="photo-placement-note">
                          Note per modifica sito
                          <textarea
                            value={draft.note ?? ''}
                            onChange={(event) => patchPhoto(photo.id, { note: event.target.value, selected: true })}
                            placeholder="Es. usare come hero mobile, tagliare in orizzontale, evitare volti visibili..."
                            rows="3"
                          />
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
      `- ID foto: ${photo.id}`,
      `- Cantiere: ${photo.cantiere || 'DA VERIFICARE'}`,
      `- Zona/lavorazione: ${photo.zona || 'DA VERIFICARE'} / ${photo.lavorazione || 'DA VERIFICARE'}`,
      `- Dove metterla: ${draft.placement || 'DA VERIFICARE'}`,
      `- Categoria visiva: ${draft.category || 'DA VERIFICARE'}`,
      `- Priorità: ${draft.priority || 'DA VERIFICARE'}`,
      `- Pubblicabile: ${displayPublicable(photo.pubblicabile)}`,
      `- Stato interno: ${photo.stato || 'DA VERIFICARE'}`,
      `- Note: ${draft.note?.trim() || 'Nessuna nota'}`,
      '',
    )
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
