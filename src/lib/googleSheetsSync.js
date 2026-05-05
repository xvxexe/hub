import { fetchDeletedRecords, filterDeletedFromStore } from './operationalDeletes'
import { supabaseRequest } from './supabaseClient'
import { fetchOperationalStore, saveOperationalStore } from './supabaseOperationalStore'
import { fetchRemoteStore, saveRemoteStore } from './supabaseStore'

export const STORE_SYNC_EVENT = 'europaservice-store-sync'

const fallbackSyncUrl = 'https://script.google.com/macros/s/AKfycbw-QeSDBIIShY3CaI4Ra10NdBA1XWcl9LBhupHkHVITCgBt3XcqsIh8xNSj3Ox3vM7y4w/exec'
const syncUrl = import.meta.env.VITE_GOOGLE_SHEETS_SYNC_URL || fallbackSyncUrl

export const isGoogleSheetsSyncConfigured = Boolean(syncUrl)

const GOOGLE_SHEETS_SOURCES = new Set([
  'google-sheets-sync',
  'google-sheets-row-import',
])

export async function importGoogleSheetsToSupabase(session = null) {
  if (!isGoogleSheetsSyncConfigured) {
    return {
      ok: false,
      error: 'Sync Google Sheets non configurato: manca VITE_GOOGLE_SHEETS_SYNC_URL.',
    }
  }

  const response = await fetch(`${syncUrl}?action=import`, {
    method: 'GET',
  })

  const payload = await parseJsonResponse(response)
  if (!response.ok || payload.ok === false) {
    return { ok: false, error: payload.error ?? `Errore import Google Sheets ${response.status}` }
  }

  if (!payload.store?.documents || !Array.isArray(payload.store.documents)) {
    return { ok: false, error: 'Risposta Google Sheets non valida: documents mancante.' }
  }

  const currentOperational = await fetchOperationalStore()
  if (currentOperational.error) return { ok: false, error: currentOperational.error.message }

  const incomingStore = mergeOperationalData(
    normalizeImportedStore(payload.store),
    currentOperational.data,
  )
  const deletedRecords = await fetchDeletedRecords()
  if (deletedRecords.error) return { ok: false, error: deletedRecords.error.message }

  const filteredStore = filterDeletedFromStore(incomingStore, deletedRecords.data)
  const cleanup = await replaceGoogleSheetsSnapshot()
  if (!cleanup.ok) return { ok: false, error: cleanup.error }

  const savedOperational = await saveOperationalStore(filteredStore, session)
  if (savedOperational.error) return { ok: false, error: savedOperational.error.message }

  const savedLegacy = await saveRemoteStore(filteredStore)
  if (savedLegacy.error) return { ok: false, error: savedLegacy.error.message }

  notifyStoreSync(filteredStore)

  const removedByTombstones = {
    documents: incomingStore.documents.length - filteredStore.documents.length,
    movements: incomingStore.movements.length - filteredStore.movements.length,
    photos: (incomingStore.photos?.length ?? 0) - (filteredStore.photos?.length ?? 0),
    estimates: (incomingStore.estimates?.length ?? 0) - (filteredStore.estimates?.length ?? 0),
    cantieri: (incomingStore.cantieri?.length ?? 0) - (filteredStore.cantieri?.length ?? 0),
  }

  return {
    ok: true,
    store: filteredStore,
    summary: {
      ...(payload.summary ?? {}),
      parser: payload.summary?.parser ?? payload.store?.source?.parser ?? 'legacy',
      cantieri: filteredStore.cantieri?.length ?? 0,
      documents: filteredStore.documents.length,
      movements: filteredStore.movements.length,
      photos: filteredStore.photos?.length ?? 0,
      estimates: filteredStore.estimates?.length ?? 0,
      removedByTombstones,
      replacedGoogleSheetsSnapshot: cleanup.summary,
    },
  }
}

export async function exportSupabaseToGoogleSheets(storeOverride = null) {
  if (!isGoogleSheetsSyncConfigured) {
    return {
      ok: false,
      error: 'Sync Google Sheets non configurato: manca VITE_GOOGLE_SHEETS_SYNC_URL.',
    }
  }

  const store = storeOverride ?? await loadBestAvailableStore()
  if (!store) return { ok: false, error: 'Nessun dato Supabase da esportare.' }

  const deletedRecords = await fetchDeletedRecords()
  if (deletedRecords.error) return { ok: false, error: deletedRecords.error.message }

  const response = await fetch(syncUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'export', store, deletedRecords: deletedRecords.data }),
  })

  const payload = await parseJsonResponse(response)
  if (!response.ok || payload.ok === false) {
    return { ok: false, error: payload.error ?? `Errore export Google Sheets ${response.status}` }
  }

  return {
    ok: true,
    summary: payload.summary ?? {
      cantieri: store.cantieri?.length ?? 0,
      documents: store.documents?.length ?? 0,
      movements: store.movements?.length ?? 0,
      photos: store.photos?.length ?? 0,
      estimates: store.estimates?.length ?? 0,
      deletedRecords: deletedRecords.data?.length ?? 0,
    },
  }
}

async function loadBestAvailableStore() {
  const operational = await fetchOperationalStore()
  if (operational.error) throw operational.error
  if (operational.data) return operational.data

  const legacy = await fetchRemoteStore()
  if (legacy.error) throw legacy.error
  return legacy.data
}

function normalizeImportedStore(store) {
  const documents = Array.isArray(store.documents) ? store.documents : []
  const movements = Array.isArray(store.movements) && store.movements.length
    ? store.movements
    : documents.map(documentToMovement)

  return {
    ...store,
    cantieri: Array.isArray(store.cantieri) ? store.cantieri : [],
    documents,
    movements,
    photos: Array.isArray(store.photos) ? store.photos : [],
    estimates: Array.isArray(store.estimates) ? store.estimates : [],
    notes: Array.isArray(store.notes) ? store.notes : [],
    activities: Array.isArray(store.activities) ? store.activities : [],
  }
}

function mergeOperationalData(incomingStore, currentStore) {
  if (!currentStore) return incomingStore

  return {
    ...incomingStore,
    cantieri: mergeById(incomingStore.cantieri, currentStore.cantieri),
    photos: mergeById(incomingStore.photos, currentStore.photos),
    estimates: mergeById(incomingStore.estimates, currentStore.estimates),
    notes: mergeById(incomingStore.notes, currentStore.notes),
    activities: mergeById(incomingStore.activities, currentStore.activities).slice(0, 250),
    deletedRecords: Array.isArray(currentStore.deletedRecords) ? currentStore.deletedRecords : [],
  }
}

function mergeById(primary = [], secondary = []) {
  const map = new Map()
  ;(Array.isArray(secondary) ? secondary : []).forEach((item) => {
    if (item?.id) map.set(item.id, item)
  })
  ;(Array.isArray(primary) ? primary : []).forEach((item) => {
    if (item?.id) map.set(item.id, item)
  })
  return [...map.values()]
}

async function replaceGoogleSheetsSnapshot() {
  const existing = await supabaseRequest('documents?select=id,source&or=(source.eq.google-sheets-sync,source.eq.google-sheets-row-import,id.like.sheet-*)', { method: 'GET' })
  if (existing.error) return { ok: false, error: existing.error.message }

  const documentIds = (existing.data ?? [])
    .filter((document) => GOOGLE_SHEETS_SOURCES.has(document.source) || String(document.id).startsWith('sheet-'))
    .map((document) => document.id)

  if (!documentIds.length) {
    return { ok: true, summary: { documents: 0, movements: 0 } }
  }

  let deletedMovements = 0
  let deletedDocuments = 0

  for (const chunk of chunkArray(documentIds, 40)) {
    const movementByDocument = await supabaseRequest(`accounting_movements?document_id=in.(${toPostgrestList(chunk)})`, { method: 'DELETE' })
    if (movementByDocument.error) return { ok: false, error: movementByDocument.error.message }
    deletedMovements += movementByDocument.data?.length ?? 0

    const movementIds = chunk.map((id) => `movement-${id}`)
    const movementById = await supabaseRequest(`accounting_movements?id=in.(${toPostgrestList(movementIds)})`, { method: 'DELETE' })
    if (movementById.error) return { ok: false, error: movementById.error.message }
    deletedMovements += movementById.data?.length ?? 0

    const documents = await supabaseRequest(`documents?id=in.(${toPostgrestList(chunk)})`, { method: 'DELETE' })
    if (documents.error) return { ok: false, error: documents.error.message }
    deletedDocuments += documents.data?.length ?? 0
  }

  return { ok: true, summary: { documents: deletedDocuments, movements: deletedMovements } }
}

function documentToMovement(document) {
  return {
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento ?? 'Documento',
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento ?? 'Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica ?? 'Da verificare',
    documentoCollegato: document.fileName ?? document.numeroDocumento ?? '',
    fileName: document.fileName,
    storagePath: document.storagePath,
    storageBucket: document.storageBucket ?? 'documents',
    note: document.notes ?? document.note ?? document.nota ?? '',
  }
}

function notifyStoreSync(store) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STORE_SYNC_EVENT, { detail: { store } }))
}

function chunkArray(items, size) {
  const chunks = []
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size))
  return chunks
}

function toPostgrestList(values) {
  return values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(',')
}

async function parseJsonResponse(response) {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { ok: false, error: text || 'Risposta non JSON.' }
  }
}
