import { getStoredAuthSession, isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './supabaseClient'

const BUCKETS = {
  document: 'documents',
  photo: 'site-photos',
}

export async function uploadOperationalFile({ file, type, cantiereId, entityId }) {
  if (!file) return { data: null, error: null, source: 'none' }
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase non configurato'), source: 'local' }

  const session = getStoredAuthSession()
  if (!session?.access_token) {
    return { data: null, error: new Error('Sessione Supabase non valida: ricarica la pagina e accedi di nuovo.'), source: 'supabase-storage' }
  }

  const bucket = BUCKETS[type]
  if (!bucket) return { data: null, error: new Error(`Tipo upload non supportato: ${type}`), source: 'supabase-storage' }

  const storagePath = buildStoragePath({ file, type, cantiereId, entityId })
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  })

  const text = await response.text()
  const payload = parseMaybeJson(text)

  if (!response.ok) {
    return {
      data: null,
      error: new Error(payload?.message || payload?.error || `Storage upload error ${response.status}`),
      source: 'supabase-storage',
    }
  }

  return {
    data: {
      bucket,
      storagePath,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    },
    error: null,
    source: 'supabase-storage',
  }
}

export async function createSignedFileUrl({ bucket, storagePath, expiresIn = 3600 }) {
  if (!bucket || !storagePath) return { data: null, error: null, source: 'none' }

  const session = getStoredAuthSession()
  if (!session?.access_token) {
    return { data: null, error: new Error('Sessione Supabase non valida'), source: 'supabase-storage' }
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn }),
  })

  const text = await response.text()
  const payload = parseMaybeJson(text)

  if (!response.ok) {
    return {
      data: null,
      error: new Error(payload?.message || payload?.error || `Signed URL error ${response.status}`),
      source: 'supabase-storage',
    }
  }

  const signedPath = payload?.signedURL || payload?.signedUrl || payload?.signed_url
  const signedUrl = signedPath?.startsWith('http') ? signedPath : `${supabaseUrl}/storage/v1${signedPath}`

  return {
    data: { signedUrl },
    error: null,
    source: 'supabase-storage',
  }
}

function buildStoragePath({ file, type, cantiereId, entityId }) {
  const date = new Date().toISOString().slice(0, 10)
  const safeCantiere = slug(cantiereId || 'senza-cantiere')
  const safeEntity = slug(entityId || `${type}-${Date.now()}`)
  const safeName = slugFileName(file.name || 'file')
  return `${safeCantiere}/${date}/${safeEntity}/${safeName}`
}

function slug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'item'
}

function slugFileName(fileName) {
  const clean = String(fileName).trim().toLowerCase()
  const lastDot = clean.lastIndexOf('.')
  const base = lastDot > 0 ? clean.slice(0, lastDot) : clean
  const ext = lastDot > 0 ? clean.slice(lastDot + 1).replace(/[^a-z0-9]/g, '') : ''
  const safeBase = slug(base)
  return ext ? `${safeBase}.${ext}` : safeBase
}

function parseMaybeJson(text) {
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}
