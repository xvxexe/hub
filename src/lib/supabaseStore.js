import { isSupabaseConfigured, supabaseRequest } from './supabaseClient'

const STORE_ROW_ID = 'default'
const STORE_TABLE = 'app_store'

export async function fetchRemoteStore() {
  if (!isSupabaseConfigured) return { data: null, error: null, source: 'local' }

  const { data, error } = await supabaseRequest(`${STORE_TABLE}?id=eq.${STORE_ROW_ID}&select=data`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.pgrst.object+json',
    },
  })

  if (error) return { data: null, error, source: 'supabase' }
  return { data: data?.data ?? null, error: null, source: 'supabase' }
}

export async function saveRemoteStore(store) {
  if (!isSupabaseConfigured) return { error: null, source: 'local' }

  const { error } = await supabaseRequest(STORE_TABLE, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: STORE_ROW_ID,
      data: store,
      updated_at: new Date().toISOString(),
    }),
  })

  return { error, source: 'supabase' }
}

export async function seedRemoteStore(store) {
  if (!isSupabaseConfigured) return { error: null, source: 'local' }

  const current = await fetchRemoteStore()
  if (current.error || current.data) return current

  const saved = await saveRemoteStore(store)
  return { ...saved, data: store }
}
