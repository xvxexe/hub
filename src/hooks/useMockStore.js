import { useEffect, useState } from 'react'
import { exportSupabaseToGoogleSheets, isGoogleSheetsSyncConfigured, STORE_SYNC_EVENT } from '../lib/googleSheetsSync'
import { deleteOperationalEntity } from '../lib/operationalDeletes'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { fetchOperationalStore, saveOperationalStore } from '../lib/supabaseOperationalStore'
import { fetchRemoteStore, saveRemoteStore } from '../lib/supabaseStore'

const STORAGE_KEY = 'europaservice-real-store-v001'

const documentStatuses = ['Da verificare', 'Confermato', 'Incompleto', 'Possibile duplicato', 'Scartato']
const photoStatuses = ['Da revisionare', 'Approvata', 'Pubblicata', 'Non pubblicabile']
const estimateStatuses = ['Nuovo', 'Da valutare', 'Contattato', 'In attesa cliente', 'Accettato', 'Rifiutato', 'Archiviato']
const priorities = ['Bassa', 'Media', 'Alta']

const EMPTY_STORE = {
  cantieri: [],
  documents: [],
  movements: [],
  photos: [],
  estimates: [],
  notes: [],
  activities: [],
  deletedRecords: [],
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
        const operational = await fetchOperationalStore()
        if (cancelled) return

        if (operational.error) {
          const legacy = await fetchLegacyStoreFallback()
          if (cancelled) return
          if (legacy.data) {
            setStore(legacy.data)
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy.data))
            setSyncState({ status: 'supabase', error: `Fallback legacy app_store: ${operational.error.message}` })
            return
          }
          setSyncState({ status: 'error', error: operational.error.message })
          return
        }

        if (isValidStore(operational.data)) {
          setStore(normalizeStore(operational.data))
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStore(operational.data)))
          setSyncState({ status: 'supabase', error: null })
          return
        }

        const legacy = await fetchLegacyStoreFallback()
        if (cancelled) return
        if (legacy.data) {
          setStore(legacy.data)
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy.data))
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
      const normalized = normalizeStore(nextStore)
      setStore(normalized)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      setSyncState({ status: 'supabase', error: null })
    }

    window.addEventListener(STORE_SYNC_EVENT, handleStoreSync)
    return () => window.removeEventListener(STORE_SYNC_EVENT, handleStoreSync)
  }, [])

  async function persist(nextStore) {
    const normalizedStore = normalizeStore(nextStore)
    if (!isValidStore(normalizedStore)) {
      setSyncState({ status: 'error', error: 'Store non valido: salvataggio bloccato.' })
      return
    }

    setStore(normalizedStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedStore))

    if (session?.authMode === 'supabase') {
      const savedOperational = await saveOperationalStore(normalizedStore, session)
      if (savedOperational.error) {
        setSyncState({ status: 'error', error: savedOperational.error.message })
        return
      }

      if (isGoogleSheetsSyncConfigured) {
        const exported = await exportSupabaseToGoogleSheets(normalizedStore)
        if (!exported.ok) {
          setSyncState({ status: 'error', error: exported.error })
          return
        }
      }

      setSyncState({ status: 'supabase', error: null })
      return
    }

    const savedLegacy = await saveRemoteStore(normalizedStore)
    if (savedLegacy.error) {
      setSyncState({ status: 'error', error: savedLegacy.error.message })
      return
    }

    setSyncState({ status: savedLegacy.source === 'supabase' ? 'supabase' : 'local', error: null })
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

  function addCantiere(cantiere) {
    const nextCantiere = normalizeCantiere({
      ...cantiere,
      id: cantiere.id ?? `cantiere-${slugify(cantiere.nome ?? cantiere.cliente)}-${Date.now()}`,
      stato: cantiere.stato ?? 'attivo',
      avanzamento: cantiere.avanzamento ?? 0,
      source: cantiere.source ?? 'hub-ui',
    })

    persist({
      ...store,
      cantieri: [nextCantiere, ...store.cantieri.filter((item) => item.id !== nextCantiere.id)],
      activities: [createActivity({
        type: 'cantieri',
        entityType: 'cantieri',
        entityId: nextCantiere.id,
        description: `Cantiere ${nextCantiere.nome} creato`,
      }, actor()), ...store.activities],
    })

    return nextCantiere
  }

  function addEstimate(estimate) {
    const nextEstimate = normalizeEstimate({
      ...estimate,
      id: estimate.id ?? `estimate-${Date.now()}`,
      requestDate: estimate.requestDate ?? todayIso(),
      status: estimate.status ?? 'Nuovo',
      priority: estimate.priority ?? 'Media',
      source: estimate.source ?? 'hub-ui',
    })

    persist({
      ...store,
      estimates: [nextEstimate, ...store.estimates.filter((item) => item.id !== nextEstimate.id)],
      activities: [createActivity({
        type: 'estimates',
        entityType: 'estimates',
        entityId: nextEstimate.id,
        description: `Preventivo ${nextEstimate.client} creato`,
      }, actor()), ...store.activities],
    })
  }

  function upsertAccountingMovement(id, data, activityText) {
    const current = store.movements.find((item) => item.id === id)
    const nextMovement = normalizeMovement({
      ...(current ?? {}),
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    })

    const movements = current
      ? store.movements.map((item) => (item.id === id ? nextMovement : item))
      : [nextMovement, ...store.movements]

    persist({
      ...store,
      movements,
      activities: [createActivity({
        type: 'movements',
        entityType: 'movements',
        entityId: id,
        description: `${entityLabel('movements', nextMovement)} ${activityText}`,
      }, actor()), ...store.activities],
    })
  }

  async function deleteEntity(collection, id) {
    const entity = store[collection]?.find((item) => item.id === id)
    if (!entity) return { ok: false, error: 'Elemento non trovato.' }

    const result = await deleteOperationalEntity({ entityType: collection, entity, session })
    if (!result.ok) {
      setSyncState({ status: 'error', error: result.error })
      return result
    }

    const nextStore = {
      ...store,
      [collection]: store[collection].filter((item) => item.id !== id),
      movements: collection === 'documents'
        ? store.movements.filter((movement) => movement.documentId !== id && movement.id !== `movement-${id}`)
        : store.movements,
      notes: store.notes.filter((note) => !(note.entityType === collection && note.entityId === id)),
      activities: store.activities.filter((activity) => !(activity.entityType === collection && activity.entityId === id)),
    }

    setStore(nextStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore))
    setSyncState({ status: 'supabase', error: null })
    return { ok: true }
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
    const movement = documentToMovement(document)
    const existingMovement = store.movements.find((item) => item.id === movement.id)

    persist({
      ...store,
      documents: [document, ...store.documents.filter((item) => item.id !== document.id)],
      movements: existingMovement
        ? store.movements.map((item) => (item.id === movement.id ? { ...item, ...movement } : item))
        : [movement, ...store.movements],
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
    addCantiere,
    updateCantiereData: (id, data) => updateEntity('cantieri', id, data, 'Cantiere modificato'),
    updateDocumentStatus: (id, status) => updateEntity('documents', id, { statoVerifica: status, stato: status.toLowerCase() }, `Documento segnato come ${status}`),
    updateDocumentData: (id, data) => updateEntity('documents', id, data, 'Documento modificato'),
    deleteDocument: (id) => deleteEntity('documents', id),
    markDocumentChecked: (id) => updateEntity('documents', id, { statoVerifica: 'Confermato', stato: 'confermato' }, 'Documento segnato come controllato'),
    markDocumentDuplicate: (id) => updateEntity('documents', id, { statoVerifica: 'Possibile duplicato', stato: 'possibile duplicato' }, 'Documento segnato come possibile duplicato'),
    updateAccountingMovementData: (id, data) => upsertAccountingMovement(id, data, 'Movimento contabile modificato'),
    linkAccountingMovementDocument: (id, document) => upsertAccountingMovement(id, movementLinkData(document), 'collegato a un documento'),
    unlinkAccountingMovementDocument: (id) => upsertAccountingMovement(id, { documentId: null, documentoCollegato: '', fileName: '', storagePath: '', storageBucket: '' }, 'scollegato dal documento'),
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
    deletePhoto: (id) => deleteEntity('photos', id),
    approvePhoto: (id) => updateEntity('photos', id, { stato: 'Approvata', pubblicata: false }, 'Foto approvata'),
    markPhotoPublicable: (id, value) => updateEntity('photos', id, { pubblicabile: value ? 'si' : 'no' }, value ? 'Foto segnata pubblicabile' : 'Foto segnata non pubblicabile'),
    addEstimate,
    updateEstimateStatus: (id, status) => updateEntity('estimates', id, { status }, `Preventivo segnato come ${status}`),
    updateEstimateData: (id, data) => updateEntity('estimates', id, data, 'Preventivo modificato'),
    deleteEstimate: (id) => deleteEntity('estimates', id),
    addInternalNote,
    addActivityLog,
    resetMockStore,
    addFotoUpload,
    addDocumentUpload,
  }
}

async function fetchLegacyStoreFallback() {
  const remote = await fetchRemoteStore()
  if (remote.error) return remote
  return isValidStore(remote.data) ? { ...remote, data: normalizeStore(remote.data) } : { ...remote, data: null }
}

function loadStore() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (isValidStore(parsed)) return normalizeStore(parsed)
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  return EMPTY_STORE
}

function normalizeStore(data) {
  return {
    ...EMPTY_STORE,
    ...(data ?? {}),
    cantieri: Array.isArray(data?.cantieri) ? data.cantieri.map(normalizeCantiere) : [],
    documents: Array.isArray(data?.documents) ? data.documents : [],
    movements: Array.isArray(data?.movements) ? data.movements.map(normalizeMovement) : [],
    photos: Array.isArray(data?.photos) ? data.photos : [],
    estimates: Array.isArray(data?.estimates) ? data.estimates.map(normalizeEstimate) : [],
    notes: Array.isArray(data?.notes) ? data.notes : [],
    activities: Array.isArray(data?.activities) ? data.activities : [],
    deletedRecords: Array.isArray(data?.deletedRecords) ? data.deletedRecords : [],
  }
}

function isValidStore(data) {
  return Boolean(
    data
      && typeof data === 'object'
      && Array.isArray(data.documents)
      && Array.isArray(data.photos)
      && Array.isArray(data.estimates)
      && Array.isArray(data.notes)
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
    storagePath: upload.storagePath,
    storageBucket: upload.storageBucket,
    mimeType: upload.mimeType,
    fileSize: upload.fileSize,
    note: upload.nota,
    nota: upload.nota,
    caricatoDa: upload.caricatoDa,
    dataCaricamento: upload.dataCaricamento,
    source: upload.source ?? 'upload-documento',
  }
}

function documentToMovement(document) {
  return normalizeMovement({
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore,
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento ?? 'Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: document.imponibile,
    iva: document.iva,
    totale: document.totale ?? document.importoTotale,
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica ?? titleStatus(document.stato) ?? 'Da verificare',
    documentoCollegato: document.fileName ?? document.numeroDocumento ?? '',
    fileName: document.fileName,
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
    note: document.note ?? document.nota ?? '',
    source: 'document-linked-movement',
  })
}

function normalizeMovement(movement) {
  return {
    ...movement,
    id: movement.id,
    cantiereId: movement.cantiereId ?? 'barcelo-roma',
    cantiere: movement.cantiere ?? 'Barcelò Roma',
    data: movement.data ?? movement.dataDocumento ?? null,
    descrizione: movement.descrizione ?? movement.tipoDocumento ?? 'Movimento contabile',
    fornitore: movement.fornitore ?? 'Non indicato',
    categoria: movement.categoria ?? 'Extra / Altro',
    tipoDocumento: movement.tipoDocumento ?? 'Altro',
    numeroDocumento: movement.numeroDocumento ?? movement.fileName ?? movement.id,
    imponibile: Number(movement.imponibile || 0),
    iva: Number(movement.iva || 0),
    totale: Number(movement.totale || movement.importoTotale || 0),
    pagamento: movement.pagamento ?? 'Non indicato',
    statoVerifica: movement.statoVerifica ?? 'Da verificare',
    documentoCollegato: movement.documentoCollegato ?? movement.fileName ?? '',
    note: movement.note ?? movement.nota ?? '',
  }
}

function normalizeCantiere(cantiere) {
  return {
    ...cantiere,
    id: cantiere.id,
    nome: cantiere.nome ?? cantiere.cliente ?? 'Cantiere da verificare',
    cliente: cantiere.cliente ?? cantiere.nome ?? 'Cantiere da verificare',
    localita: cantiere.localita ?? '',
    indirizzo: cantiere.indirizzo ?? '',
    stato: cantiere.stato ?? 'attivo',
    avanzamento: Number(cantiere.avanzamento || 0),
    updatedAt: cantiere.updatedAt ?? new Date().toISOString(),
  }
}

function normalizeEstimate(estimate) {
  return {
    ...estimate,
    id: estimate.id,
    client: estimate.client ?? 'Cliente da verificare',
    phone: estimate.phone ?? '',
    email: estimate.email ?? '',
    city: estimate.city ?? '',
    customerType: estimate.customerType ?? 'Da verificare',
    workType: estimate.workType ?? 'Da verificare',
    urgency: estimate.urgency ?? 'Da programmare',
    budget: estimate.budget ?? 'Da definire',
    contactPreference: estimate.contactPreference ?? 'Telefono',
    priority: estimate.priority ?? 'Media',
    status: estimate.status ?? 'Nuovo',
    description: estimate.description ?? '',
    internalNotes: estimate.internalNotes ?? '',
    requestDate: estimate.requestDate ?? todayIso(),
  }
}

function movementLinkData(document) {
  if (!document) return {}

  return {
    documentId: document.id,
    documentoCollegato: document.fileName ?? document.numeroDocumento ?? document.descrizione ?? document.id,
    fileName: document.fileName,
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
    tipoDocumento: document.tipoDocumento,
    numeroDocumento: document.numeroDocumento ?? document.fileName,
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
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
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
  if (collection === 'cantieri') return `Cantiere ${entity.nome || entity.cliente}`
  if (collection === 'documents') return `Documento ${entity.tipoDocumento} ${entity.fornitore || entity.descrizione}`
  if (collection === 'movements') return `Movimento ${entity.fornitore || entity.descrizione}`
  if (collection === 'photos') return `Foto ${entity.cantiere}`
  if (collection === 'estimates') return `Preventivo ${entity.client}`
  return 'Elemento'
}

function slugify(value) {
  return String(value ?? 'nuovo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'nuovo'
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
