import { supabase, isSupabaseConfigured } from './supabaseClient'

const STORE_ROW_ID = 'default'
const STORE_TABLE = 'app_store'

export async function fetchRemoteStore() {
  if (!isSupabaseConfigured) return { data: null, error: null, source: 'local' }

  const { data, error } = await supabase
    .from(STORE_TABLE)
    .select('data')
    .eq('id', STORE_ROW_ID)
    .maybeSingle()

  if (error) return { data: null, error, source: 'supabase' }
  return { data: data?.data ?? null, error: null, source: 'supabase' }
}

export async function saveRemoteStore(store) {
  if (!isSupabaseConfigured) return { error: null, source: 'local' }

  const { error } = await supabase
    .from(STORE_TABLE)
    .upsert({
      id: STORE_ROW_ID,
      data: store,
      updated_at: new Date().toISOString(),
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
