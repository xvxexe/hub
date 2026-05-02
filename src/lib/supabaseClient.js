const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null, source: 'local' }
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options.headers ?? {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data?.message || data?.hint || `Supabase error ${response.status}`),
        source: 'supabase',
      }
    }

    return { data, error: null, source: 'supabase' }
  } catch (error) {
    return { data: null, error, source: 'supabase' }
  }
}
