import { fetchRemoteStore, saveRemoteStore } from './supabaseStore'

export const STORE_SYNC_EVENT = 'europaservice-store-sync'

const fallbackSyncUrl = 'https://script.google.com/macros/s/AKfycbw-QeSDBIIShY3CaI4Ra10NdBA1XWcl9LBhupHkHVITCgBt3XcqsIh8xNSj3Ox3vM7y4w/exec'
const syncUrl = import.meta.env.VITE_GOOGLE_SHEETS_SYNC_URL || fallbackSyncUrl

export const isGoogleSheetsSyncConfigured = Boolean(syncUrl)

export async function importGoogleSheetsToSupabase() {
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

  const saved = await saveRemoteStore(payload.store)
  if (saved.error) return { ok: false, error: saved.error.message }

  notifyStoreSync(payload.store)

  return {
    ok: true,
    store: payload.store,
    summary: payload.summary ?? {
      documents: payload.store.documents.length,
      photos: payload.store.photos?.length ?? 0,
      estimates: payload.store.estimates?.length ?? 0,
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

  const store = storeOverride ?? await loadRemoteStore()
  if (!store) return { ok: false, error: 'Nessun dato Supabase da esportare.' }

  const response = await fetch(syncUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'export', store }),
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
    },
  }
}

async function loadRemoteStore() {
  const remote = await fetchRemoteStore()
  if (remote.error) throw remote.error
  return remote.data
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
