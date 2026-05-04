import { useEffect, useState } from 'react'
import { exportSupabaseToGoogleSheets, isGoogleSheetsSyncConfigured, STORE_SYNC_EVENT } from '../lib/googleSheetsSync'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { fetchRemoteStore, saveRemoteStore } from '../lib/supabaseStore'

const STORAGE_KEY = 'europaservice-real-store-v001'

const documentStatuses = ['Da verificare', 'Confermato', 'Incompleto', 'Possibile duplicato', 'Scartato']
const photoStatuses = ['Da revisionare', 'Approvata', 'Pubblicata', 'Non pubblicabile']
const estimateStatuses = ['Nuovo', 'Da valutare', 'Contattato', 'In attesa cliente', 'Accettato', 'Rifiutato', 'Archiviato']
const priorities = ['Bassa', 'Media', 'Alta']

const EMPTY_STORE = {
  documents: [],
  photos: [],
  estimates: [],
  notes: [],
  activities: [],
}

export function useMockStore(session) {
  const [store, setStore] = useState(() => loadStore())
  const [syncState, setSyncState] = useState({
    status: isSupabaseConfigured ? 'loading' : 'local',
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function hydrateFromSupabase() {
      if (!isSupabaseConfigured) return

      try {
        const remote = await fetchRemoteStore()
        if (cancelled) return

        if (remote.error) {
          setSyncState({ status: 'error', error: remote.error.message })
          return
        }

        if (isValidStore(remote.data)) {
          setStore(remote.data)
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote.data))
          setSyncState({ status: 'supabase', error: null })
          return
        }

        setSyncState({ status: 'empty', error: null })
      } catch (error) {
        if (!cancelled) setSyncState({ status: 'error', error: error.message })
      }
    }

    hydrateFromSupabase()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleStoreSync(event) {
      const nextStore = event.detail?.store
      if (!isValidStore(nextStore)) return
      setStore(nextStore)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore))
      setSyncState({ status: 'supabase', error: null })
    }

    window.addEventListener(STORE_SYNC_EVENT, handleStoreSync)
    return () => window.removeEventListener(STORE_SYNC_EVENT, handleStoreSync)
  }, [])

  async function persist(nextStore) {
    if (!isValidStore(nextStore)) {
      setSyncState({ status: 'error', error: 'Store non valido: salvataggio bloccato.' })
      return
    }

    setStore(nextStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore))

    const saved = await saveRemoteStore(nextStore)
    if (saved.error) {
      setSyncState({ status: 'error', error: saved.error.message })
      return
    }

    if (saved.source === 'supabase' && isGoogleSheetsSyncConfigured) {
      const exported = await exportSupabaseToGoogleSheets(nextStore)
      if (!exported.ok) {
        setSyncState({ status: 'error', error: exported.error })
        return
      }
    }

    setSyncState({ status: saved.source === 'supabase' ? 'supabase' : 'local', error: null })
  }

  function actor() {
    return session?.name ?? 'Sistema'
  }

  function addActivityLog(activity) {
    persist({
      ...store,
      activities: [createActivity(activity, actor()), ...store.activities],
    })
  }

  function updateEntity(collection, id, data, activityText) {
    const current = store[collection].find((item) => item.id === id)
    const nextStore = {
      ...store,
      [collection]: store[collection].map((item) => (item.id === id ? { ...item, ...data } : item)),
      activities: current
        ? [createActivity({
            type: collection,
            entityType: collection,
            entityId: id,
            description: `${entityLabel(collection, current)} ${activityText}`,
          }, actor()), ...store.activities]
        : store.activities,
    }
    persist(nextStore)
  }

  function addInternalNote(entityType, entityId, text) {
    if (!text.trim()) return

    const note = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      author: actor(),
      date: todayIso(),
      entityType,
      entityId,
    }
    persist({
      ...store,
      notes: [note, ...store.notes],
      activities: [createActivity({
        type: 'note',
        entityType,
        entityId,
        description: `Nota aggiunta a ${entityType} ${entityId}`,
      }, actor()), ...store.activities],
    })
  }

  function addFotoUpload(upload) {
    persist({
      ...store,
      photos: [normalizePhoto(upload), ...store.photos],
      activities: [createActivity({
        type: 'photo',
        entityType: 'photos',
        entityId: upload.id,
        description: `Foto ${upload.cantiere} caricata`,
      }, actor()), ...store.activities],
    })
  }

  function addDocumentUpload(upload) {
    const document = uploadToDocument(upload)
    persist({
      ...store,
      documents: [document, ...store.documents],
      activities: [createActivity({
        type: 'document',
        entityType: 'documents',
        entityId: document.id,
        description: `Documento ${document.tipoDocumento} ${document.fornitore || document.descrizione} caricato`,
      }, actor()), ...store.activities],
    })
  }

  function resetMockStore() {
    persist(EMPTY_STORE)
  }

  return {
    ...store,
    syncState,
    documentUploads: store.documents.map(documentToUpload),
    fotoUploads: store.photos,
    documentStatuses,
    photoStatuses,
    estimateStatuses,
    priorities,
    updateDocumentStatus: (id, status) => updateEntity('documents', id, { statoVerifica: status, stato: status.toLowerCase() }, `Documento segnato come ${status}`),
    updateDocumentData: (id, data) => updateEntity('documents', id, data, 'Documento modificato'),
    markDocumentChecked: (id) => updateEntity('documents', id, { statoVerifica: 'Confermato', stato: 'confermato' }, 'Documento segnato come controllato'),
    markDocumentDuplicate: (id) => updateEntity('documents', id, { statoVerifica: 'Possibile duplicato', stato: 'possibile duplicato' }, 'Documento segnato come possibile duplicato'),
    updatePhotoStatus: (id, status) => updateEntity('photos', id, {
      stato: status,
      pubblicata: status === 'Pubblicata',
      pubblicabile: status === 'Pubblicata'
        ? 'si'
        : status === 'Non pubblicabile'
          ? 'no'
          : store.photos.find((photo) => photo.id === id)?.pubblicabile ?? 'da valutare',
    }, `Foto segnata come ${status}`),
    updatePhotoData: (id, data) => updateEntity('photos', id, data, 'Foto modificata'),
    approvePhoto: (id) => updateEntity('photos', id, { stato: 'Approvata', pubblicata: false }, 'Foto approvata'),
    markPhotoPublicable: (id, value) => updateEntity('photos', id, { pubblicabile: value ? 'si' : 'no' }, value ? 'Foto segnata pubblicabile' : 'Foto segnata non pubblicabile'),
    updateEstimateStatus: (id, status) => updateEntity('estimates', id, { status }, `Preventivo segnato come ${status}`),
    updateEstimateData: (id, data) => updateEntity('estimates', id, data, 'Preventivo modificato'),
    addInternalNote,
    addActivityLog,
    resetMockStore,
    addFotoUpload,
    addDocumentUpload,
  }
}

function loadStore() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (isValidStore(parsed)) return parsed
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return EMPTY_STORE
}

function isValidStore(data) {
  return Boolean(
    data
      && typeof data === 'object'
      && Array.isArray(data.documents)
      && data.documents.length > 0
      && Array.isArray(data.photos)
      && Array.isArray(data.estimates)
      && Array.isArray(data.activities),
  )
}

function uploadToDocument(upload) {
  return {
    id: upload.id,
    cantiereId: upload.cantiereId,
    cantiere: upload.cantiere,
    tipoDocumento: upload.tipoDocumento,
    fornitore: upload.fornitore,
    descrizione: upload.descrizione,
    numeroDocumento: upload.numeroDocumento ?? upload.fileName,
    dataDocumento: upload.dataDocumento,
    categoria: upload.categoria ?? 'Extra / Altro',
    imponibile: upload.imponibile ?? Number(upload.importoTotale || 0),
    iva: upload.iva ?? 0,
    totale: upload.totale ?? Number(upload.importoTotale || 0),
    importoTotale: upload.totale ?? Number(upload.importoTotale || 0),
    pagamento: upload.pagamento ?? 'Non indicato',
    statoVerifica: titleStatus(upload.stato),
    stato: upload.stato,
    fileName: upload.fileName,
    note: upload.nota,
    nota: upload.nota,
    caricatoDa: upload.caricatoDa,
    dataCaricamento: upload.dataCaricamento,
    source: 'upload-documento',
  }
}

function documentToUpload(document) {
  const status = document.statoVerifica ?? document.stato ?? 'Da verificare'

  return {
    id: document.id,
    cantiereId: document.cantiereId,
    cantiere: document.cantiere,
    tipoDocumento: document.tipoDocumento,
    fornitore: document.fornitore,
    descrizione: document.descrizione,
    dataDocumento: document.dataDocumento,
    importoTotale: document.totale,
    fileName: document.numeroDocumento ?? document.fileName ?? document.descrizione,
    nota: document.note,
    caricatoDa: document.caricatoDa ?? document.fornitore ?? 'Google Sheets',
    dataCaricamento: document.dataCaricamento ?? document.dataDocumento,
    stato: String(status).toLowerCase(),
  }
}

function normalizePhoto(photo) {
  return {
    ...photo,
    stato: titleStatus(photo.stato),
    pubblicabile: photo.pubblicabile ?? 'da valutare',
    pubblicata: photo.stato?.toLowerCase() === 'pubblicata',
    descrizionePubblica: photo.descrizionePubblica ?? '',
  }
}

function titleStatus(status) {
  const normalized = String(status ?? '').toLowerCase()
  const special = {
    'da verificare': 'Da verificare',
    confermato: 'Confermato',
    incompleto: 'Incompleto',
    'possibile duplicato': 'Possibile duplicato',
    scartato: 'Scartato',
    'da revisionare': 'Da revisionare',
    approvata: 'Approvata',
    pubblicata: 'Pubblicata',
    'non pubblicabile': 'Non pubblicabile',
  }
  if (special[normalized]) return special[normalized]
  if (normalized === 'si' || normalized === 'sì') return 'si'
  if (normalized === 'no') return 'no'
  return normalized
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function createActivity(activity, author) {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: todayIso(),
    author,
    type: activity.type,
    description: activity.description,
    entityType: activity.entityType,
    entityId: activity.entityId,
  }
}

function entityLabel(collection, entity) {
  if (collection === 'documents') return `Documento ${entity.tipoDocumento} ${entity.fornitore || entity.descrizione}`
  if (collection === 'photos') return `Foto ${entity.cantiere}`
  if (collection === 'estimates') return `Preventivo ${entity.client}`
  return 'Elemento'
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
