const fallbackProjectRef = 'qmdwfdfmhhhghykfahfo'
const fallbackSupabaseUrl = `https://${fallbackProjectRef}.supabase.co`
const fallbackSupabaseAnonKey = 'sb_publishable_raEK7djY88sSILLUQ821Aw_LasJfO6x'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? fallbackSupabaseAnonKey

const AUTH_STORAGE_KEY = 'europaservice-auth-session-v001'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function authHeaders(accessToken) {
  const token = accessToken || getStoredAuthSession()?.access_token || supabaseAnonKey

  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export function getStoredAuthSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.access_token) return null

    if (parsed.expires_at && Date.now() > parsed.expires_at * 1000) {
      clearStoredAuthSession()
      return null
    }

    return parsed
  } catch {
    clearStoredAuthSession()
    return null
  }
}

export function setStoredAuthSession(session) {
  if (!session?.access_token) return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

async function authRequest(path, options = {}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase non configurato'), source: 'local' }
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
      ...options,
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      return {
        data: null,
        error: new Error(data?.msg || data?.message || data?.error_description || `Auth error ${response.status}`),
        source: 'supabase',
      }
    }

    return { data, error: null, source: 'supabase' }
  } catch (error) {
    return { data: null, error, source: 'supabase' }
  }
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await authRequest('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (error) return { data: null, error, source: 'supabase' }

  setStoredAuthSession(data)
  const profile = await fetchProfileForUser(data.user, data.access_token)

  if (profile.error) {
    clearStoredAuthSession()
    return profile
  }

  return {
    data: buildAppSession(data.user, profile.data, data),
    error: null,
    source: 'supabase',
  }
}

export async function signOutSupabase() {
  const session = getStoredAuthSession()

  if (session?.access_token && isSupabaseConfigured) {
    await authRequest('logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  }

  clearStoredAuthSession()
  return { error: null }
}

export async function fetchCurrentAuthSession() {
  const session = getStoredAuthSession()
  if (!session?.access_token) return { data: null, error: null, source: 'local' }

  const userResponse = await authRequest('user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (userResponse.error || !userResponse.data) {
    clearStoredAuthSession()
    return { data: null, error: userResponse.error, source: 'supabase' }
  }

  const profile = await fetchProfileForUser(userResponse.data, session.access_token)
  if (profile.error) return { data: null, error: profile.error, source: 'supabase' }

  return {
    data: buildAppSession(userResponse.data, profile.data, session),
    error: null,
    source: 'supabase',
  }
}

export function readInviteSessionFromUrl() {
  const sources = [window.location.search, window.location.hash]
  const params = new URLSearchParams()

  sources.forEach((source) => {
    String(source || '')
      .replace(/^#/, '')
      .split('?')
      .forEach((part) => {
        if (!part || !part.includes('=')) return
        new URLSearchParams(part).forEach((value, key) => params.set(key, value))
      })
  })

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')
  const email = params.get('email')
  const role = params.get('role')
  const invite = params.get('invite')

  const isSupabaseInvite = Boolean(accessToken && refreshToken && (type === 'invite' || type === 'recovery'))
  const isLocalInvite = Boolean(invite && email)

  if (!isSupabaseInvite && !isLocalInvite) return null

  return {
    accessToken,
    refreshToken,
    type: type || 'invite',
    email,
    role,
    invite,
    isSupabaseInvite,
    isLocalInvite,
  }
}

export async function completeInviteWithPassword({ accessToken, refreshToken, password }) {
  if (!accessToken || !refreshToken) {
    return { data: null, error: new Error('Link Supabase non valido: token invito mancanti.'), source: 'supabase' }
  }

  const updateResponse = await authRequest('user', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  })

  if (updateResponse.error) return updateResponse

  const session = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: updateResponse.data,
  }

  setStoredAuthSession(session)

  const profile = await fetchProfileForUser(updateResponse.data, accessToken)
  if (profile.error) {
    clearStoredAuthSession()
    return profile
  }

  cleanInviteParamsFromUrl()

  return {
    data: buildAppSession(updateResponse.data, profile.data, session),
    error: null,
    source: 'supabase',
  }
}

function cleanInviteParamsFromUrl() {
  const cleanPath = `${window.location.origin}${window.location.pathname}#/dashboard`
  window.history.replaceState(null, '', cleanPath)
}

async function fetchProfileForUser(user, accessToken) {
  const response = await supabaseRequest(`profiles?id=eq.${user.id}&select=id,email,full_name,role,active`, {
    method: 'GET',
    headers: {
      ...authHeaders(accessToken),
      Accept: 'application/vnd.pgrst.object+json',
    },
  })

  if (response.error) return response
  if (!response.data?.active) {
    return { data: null, error: new Error('Account disattivato o profilo mancante.'), source: 'supabase' }
  }

  return response
}

function buildAppSession(user, profile, authSession) {
  return {
    id: user.id,
    email: user.email,
    name: profile.full_name || user.user_metadata?.full_name || user.email,
    role: profile.role || user.user_metadata?.app_role || 'employee',
    authMode: 'supabase',
    accessToken: authSession.access_token,
  }
}

export async function inviteUserFromAdmin({ email, fullName, role }) {
  const session = getStoredAuthSession()
  if (!session?.access_token) {
    return { data: null, error: new Error('Sessione admin non valida'), source: 'local' }
  }

  const endpoint = `${supabaseUrl}/functions/v1/invite-user`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...authHeaders(session.access_token),
      },
      body: JSON.stringify({ email, full_name: fullName, role }),
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      return { data: null, error: new Error(data?.error || `Invite error ${response.status}`), source: 'supabase' }
    }

    return { data, error: null, source: 'supabase' }
  } catch (error) {
    return { data: null, error: new Error(`${error.message}. Endpoint: ${endpoint}`), source: 'supabase' }
  }
}

export async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null, source: 'local' }
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...options,
      headers: {
        ...authHeaders(),
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
