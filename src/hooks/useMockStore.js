import { useEffect, useState } from 'react'
import { mockCantieri } from '../data/mockCantieri'
import { quotes } from '../data/mockData'
import { mockMovimentiContabili } from '../data/mockMovimentiContabili'
import { mockDocumentUploads, mockFotoUploads } from '../data/mockUploads'
import { fetchRemoteStore, saveRemoteStore, seedRemoteStore } from '../lib/supabaseStore'

const STORAGE_KEY = 'europaservice-mock-store-v057'

const documentStatuses = ['Da verificare', 'Confermato', 'Incompleto', 'Possibile duplicato', 'Scartato']
const photoStatuses = ['Da revisionare', 'Approvata', 'Pubblicata', 'Non pubblicabile']
const estimateStatuses = ['Nuovo', 'Da valutare', 'Contattato', 'In attesa cliente', 'Accettato', 'Rifiutato', 'Archiviato']
const priorities = ['Bassa', 'Media', 'Alta']

export function useMockStore(session) {
  const [store, setStore] = useState(() => loadStore())
  const [syncState, setSyncState] = useState({ status: 'local', error: null })

  useEffect(() => {
    let cancelled = false

    async function hydrateFromSupabase() {
      try {
        const seeded = await seedRemoteStore(store)
        if (cancelled) return

        if (seeded.error) {
          setSyncState({ status: 'error', error: seeded.error.message })
          return
        }

        const remote = await fetchRemoteStore()
        if (cancelled) return

        if (remote.error) {
          setSyncState({ status: 'error', error: remote.error.message })
          return
        }

        if (remote.data) {
          setStore(remote.data)
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote.data))
          setSyncState({ status: 'supabase', error: null })
          return
        }

        setSyncState({ status: 'local', error: null })
      } catch (error) {
        if (!cancelled) setSyncState({ status: 'error', error: error.message })
      }
    }

    hydrateFromSupabase()

    return () => {
      cancelled = true
    }
    // La prima idratazione deve partire una sola volta dal fallback locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function persist(nextStore) {
    setStore(nextStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore))

    const saved = await saveRemoteStore(nextStore)
    if (saved.error) {
      setSyncState({ status: 'error', error: saved.error.message })
      return
    }

    setSyncState({ status: saved.source === 'supabase' ? 'supabase' : 'local', error: null })
  }

  function actor() {
    return session?.name ?? 'Sistema mock'
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
    const nextStore = createInitialStore()
    persist(nextStore)
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
    updateDocumentStatus: (id, status) => updateEntity('documents', id, { statoVerifica: status }, `Documento segnato come ${status}`),
    updateDocumentData: (id, data) => updateEntity('documents', id, data, 'Documento modificato'),
    markDocumentChecked: (id) => updateEntity('documents', id, { statoVerifica: 'Confermato' }, 'Documento segnato come controllato'),
    markDocumentDuplicate: (id) => updateEntity('documents', id, { statoVerifica: 'Possibile duplicato' }, 'Documento segnato come possibile duplicato'),
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
    if (stored) return JSON.parse(stored)
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return createInitialStore()
}

function createInitialStore() {
  return {
    documents: [
      ...mockMovimentiContabili.map(movementToDocument),
      ...mockDocumentUploads.map(uploadToDocument),
    ],
    photos: mockFotoUploads.map(normalizePhoto),
    estimates: quotes.map((quote, index) => ({
      id: `estimate-${index + 1}`,
      client: quote.client,
      phone: '+39 045 000 0000',
      email: `${quote.client.toLowerCase().replaceAll(' ', '.')}@example.com`,
      city: index === 1 ? 'Peschiera del Garda' : 'Verona',
      customerType: index === 1 ? 'Hotel' : index === 2 ? 'Azienda' : 'Privato',
      workType: quote.request,
      description: `Richiesta mock per ${quote.request}.`,
      urgency: index === 0 ? 'Entro 2 settimane' : 'Da programmare',
      budget: quote.value,
      contactPreference: 'Telefono',
      status: quote.status,
      priority: index === 0 ? 'Alta' : 'Media',
      internalNotes: '',
      requestDate: `2026-04-${28 + index}`,
      value: quote.value,
      request: quote.request,
    })),
    notes: [],
    activities: [
      createActivity({ type: 'system', entityType: 'dashboard', entityId: 'init', description: 'Store mock inizializzato con dati locali' }, 'Sistema mock'),
    ],
  }
}

function movementToDocument(row) {
  const cantiere = mockCantieri.find((item) => item.id === row.cantiereId)
  return {
    id: row.id,
    cantiereId: row.cantiereId,
    cantiere: cantiere?.nome ?? row.cantiereId,
    tipoDocumento: row.tipoDocumento,
    fornitore: row.fornitore,
    descrizione: row.descrizione,
    numeroDocumento: row.numeroDocumento,
    dataDocumento: row.data,
    categoria: row.categoria,
    imponibile: row.imponibile,
    iva: row.iva,
    totale: row.totale,
    importoTotale: row.totale,
    pagamento: row.pagamento,
    statoVerifica: row.statoVerifica,
    stato: row.statoVerifica.toLowerCase(),
    fileName: row.documentoCollegato,
    note: row.note,
    nota: row.note,
    source: 'movimento-contabile',
  }
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
  return {
    id: document.id,
    cantiereId: document.cantiereId,
    cantiere: document.cantiere,
    tipoDocumento: document.tipoDocumento,
    fornitore: document.fornitore,
    descrizione: document.descrizione,
    dataDocumento: document.dataDocumento,
    importoTotale: document.totale,
    fileName: document.fileName,
    nota: document.note,
    caricatoDa: document.caricatoDa ?? 'Sistema mock',
    dataCaricamento: document.dataCaricamento ?? document.dataDocumento,
    stato: document.statoVerifica.toLowerCase(),
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
