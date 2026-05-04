import { fetchDeletedRecords, filterDeletedFromStore } from './operationalDeletes'
import { fetchOperationalStore, saveOperationalStore } from './supabaseOperationalStore'
import { fetchRemoteStore, saveRemoteStore } from './supabaseStore'

export const STORE_SYNC_EVENT = 'europaservice-store-sync'

const fallbackSyncUrl = 'https://script.google.com/macros/s/AKfycbw-QeSDBIIShY3CaI4Ra10NdBA1XWcl9LBhupHkHVITCgBt3XcqsIh8xNSj3Ox3vM7y4w/exec'
const syncUrl = import.meta.env.VITE_GOOGLE_SHEETS_SYNC_URL || fallbackSyncUrl

export const isGoogleSheetsSyncConfigured = Boolean(syncUrl)

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

  const deletedRecords = await fetchDeletedRecords()
  if (deletedRecords.error) return { ok: false, error: deletedRecords.error.message }

  const filteredStore = filterDeletedFromStore(payload.store, deletedRecords.data)

  const savedOperational = await saveOperationalStore(filteredStore, session)
  if (savedOperational.error) return { ok: false, error: savedOperational.error.message }

  const savedLegacy = await saveRemoteStore(filteredStore)
  if (savedLegacy.error) return { ok: false, error: savedLegacy.error.message }

  notifyStoreSync(filteredStore)

  const removedByTombstones = {
    documents: payload.store.documents.length - filteredStore.documents.length,
    photos: (payload.store.photos?.length ?? 0) - (filteredStore.photos?.length ?? 0),
    estimates: (payload.store.estimates?.length ?? 0) - (filteredStore.estimates?.length ?? 0),
  }

  return {
    ok: true,
    store: filteredStore,
    summary: {
      ...(payload.summary ?? {}),
      documents: filteredStore.documents.length,
      photos: filteredStore.photos?.length ?? 0,
      estimates: filteredStore.estimates?.length ?? 0,
      removedByTombstones,
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
      documents: store.documents?.length ?? 0,
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

function notifyStoreSync(store) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(STORE_SYNC_EVENT, { detail: { store } }))
}

async function parseJsonResponse(response) {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return { ok: false, error: text || 'Risposta non JSON.' }
  }
}
