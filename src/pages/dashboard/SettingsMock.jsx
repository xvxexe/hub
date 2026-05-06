import { useEffect, useState } from 'react'
import { exportSupabaseToGoogleSheets, importGoogleSheetsToSupabase } from '../../lib/googleSheetsSync'
import { getStoredAuthSession, supabaseUrl } from '../../lib/supabaseClient'

const STORAGE_KEY = 'europaservice-created-invites-v001'
const roleOptions = [
  { value: 'employee', label: 'Dipendente' },
  { value: 'accounting', label: 'Contabile' },
  { value: 'admin', label: 'Admin / Capo' },
]
const roleLabels = { employee: 'Dipendente', accounting: 'Contabile', admin: 'Admin / Capo' }

export function SettingsMock({ session, store }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' })
  const [invites, setInvites] = useState(loadInvites)
  const [feedback, setFeedback] = useState('')
  const [busyId, setBusyId] = useState('')
  const [syncBusy, setSyncBusy] = useState('')
  const [syncFeedback, setSyncFeedback] = useState('')
  const isAdmin = session?.role === 'admin'

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invites))
  }, [invites])

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback('')
  }

  async function createInvite(event) {
    event.preventDefault()
    if (!isAdmin) return setFeedback('Solo admin può creare inviti.')

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (!name || !email) return setFeedback('Compila nome ed email.')

    setBusyId('create')
    try {
      const invite = await generateInviteRecord({ name, email, role: form.role })
      setInvites((current) => [invite, ...current.filter((item) => item.email !== email)])
      setForm({ name: '', email: '', role: 'employee' })
      setFeedback('Utente creato in Supabase Auth. Usa Copia o Apri per generare un link fresco.')
    } catch (error) {
      setFeedback(`Errore creazione invito: ${error.message}`)
    } finally {
      setBusyId('')
    }
  }

  async function copyInvite(invite) {
    setBusyId(`copy-${invite.id}`)
    try {
      const url = await regenerateInviteUrl(invite)
      await navigator.clipboard.writeText(url)
      setFeedback(`Nuovo link Supabase copiato per ${invite.email}.`)
    } catch (error) {
      setFeedback(`Errore link invito: ${error.message}`)
    } finally {
      setBusyId('')
    }
  }

  async function openInvite(invite) {
    setBusyId(`open-${invite.id}`)
    try {
      const url = await regenerateInviteUrl(invite)
      window.open(url, '_blank', 'noopener,noreferrer')
      setFeedback(`Nuovo link Supabase aperto per ${invite.email}.`)
    } catch (error) {
      setFeedback(`Errore apertura invito: ${error.message}`)
    } finally {
      setBusyId('')
    }
  }

  async function regenerateInviteUrl(invite) {
    if (!isAdmin) throw new Error('solo admin può rigenerare il link invito reale')

    const updatedInvite = await generateInviteRecord({
      name: invite.name,
      email: invite.email,
      role: invite.role ?? 'employee',
      previousId: invite.id,
    })

    setInvites((current) => current.map((item) => (item.id === invite.id ? updatedInvite : item)))
    return updatedInvite.inviteUrl
  }

  async function generateInviteRecord({ name, email, role, previousId = '' }) {
    const result = await callInviteFunction({ email, full_name: name, fullName: name, role })
    if (!result?.actionLink) throw new Error('la funzione Supabase non ha restituito actionLink')

    return {
      id: previousId || (result?.user?.id ? `invite-${result.user.id}` : `invite-${Date.now()}`),
      name,
      email,
      role,
      status: 'created_in_auth',
      createdAt: new Date().toISOString(),
      token: createToken(),
      inviteUrl: result.actionLink,
      userId: result?.user?.id ?? '',
      redirectTo: result?.redirectTo ?? '',
      regeneratedAt: new Date().toISOString(),
    }
  }

  async function removeInvite(invite) {
    if (!window.confirm(`Eliminare ${invite.email} dalla lista e da Supabase Auth se esiste?`)) return

    setBusyId(invite.id)
    setInvites((current) => current.filter((item) => item.id !== invite.id))

    try {
      const result = await deleteSupabaseUser(invite)
      setFeedback(result?.deleted ? `${invite.email} eliminato dalla lista e da Supabase Auth.` : `${invite.email} eliminato dalla lista.`)
    } catch (error) {
      setFeedback(`${invite.email} eliminato dalla lista locale. Supabase Auth non eliminato: ${error.message}`)
    } finally {
      setBusyId('')
    }
  }

  async function handleImportMaster() {
    if (!isAdmin) return setSyncFeedback('Solo admin può importare il master.')

    setSyncBusy('import')
    setSyncFeedback('Import master in corso...')

    try {
      const result = await importGoogleSheetsToSupabase(session)
      if (!result.ok) return setSyncFeedback(`Errore import: ${result.error}`)
      const summary = result.summary ?? {}
      setSyncFeedback(`Import completato: ${summary.documents ?? 0} documenti, ${summary.movements ?? 0} movimenti, ${summary.cantieri ?? 0} cantieri.`)
    } catch (error) {
      setSyncFeedback(`Errore import: ${error.message}`)
    } finally {
      setSyncBusy('')
    }
  }

  async function handleExportMaster() {
    if (!isAdmin) return setSyncFeedback('Solo admin può esportare nel master.')

    setSyncBusy('export')
    setSyncFeedback('Export Supabase nel master in corso...')

    try {
      const result = await exportSupabaseToGoogleSheets(store)
      if (!result.ok) return setSyncFeedback(`Errore export: ${result.error}`)
      const summary = result.summary ?? {}
      setSyncFeedback(`Export completato: ${summary.documents ?? 0} documenti, ${summary.movements ?? 0} movimenti, ${summary.deletedRecords ?? 0} eliminazioni esportate.`)
    } catch (error) {
      setSyncFeedback(`Errore export: ${error.message}`)
    } finally {
      setSyncBusy('')
    }
  }

  return (
    <section className="settings-page settings-clean-page">
      <header className="dashboard-header internal-header settings-clean-header">
        <div>
          <p className="eyebrow">Impostazioni</p>
          <h1>Impostazioni area privata</h1>
          <p>Gestione accessi, inviti, sincronizzazione e preferenze operative dell’hub.</p>
        </div>
        <span className="data-mode-badge">{store?.syncState?.status ?? 'Pronto'}</span>
      </header>

      <section className="internal-panel internal-padded settings-clean-card">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Utenti</p>
            <h2>Crea invito utente</h2>
            <p>Copia e Apri generano sempre un link nuovo, così non vengono riusati link localhost o scaduti.</p>
          </div>
          <span className="data-mode-badge">Admin</span>
        </div>

        <form className="settings-clean-form" onSubmit={createInvite}>
          <label>Nome completo<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Es. Mario Rossi" disabled={!isAdmin || busyId === 'create'} /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="nome@azienda.it" disabled={!isAdmin || busyId === 'create'} /></label>
          <label>Ruolo<select value={form.role} onChange={(event) => updateForm('role', event.target.value)} disabled={!isAdmin || busyId === 'create'}>{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <button className="button button-primary" type="submit" disabled={!isAdmin || busyId === 'create'}>{busyId === 'create' ? 'Creo…' : 'Crea link invito'}</button>
        </form>

        {feedback ? <p className="success-alert settings-clean-feedback">{feedback}</p> : null}
      </section>

      <section className="internal-panel internal-padded settings-clean-card">
        <div className="panel-title-row">
          <div>
            <h2>Inviti / utenti creati</h2>
            <p>Premi Copia o Apri: il link viene rigenerato al momento.</p>
          </div>
          <span className="data-mode-badge">{invites.length} totali</span>
        </div>

        <div className="settings-clean-list">
          {invites.length ? invites.map((invite) => (
            <article className="settings-clean-row" key={invite.id}>
              <div className="settings-clean-avatar">👥</div>
              <div className="settings-clean-main">
                <strong>{invite.name}</strong>
                <span>{invite.email}</span>
                <small>{roleLabels[invite.role] ?? invite.role} · {formatDate(invite.createdAt)}</small>
              </div>
              <span className="status-badge">{invite.regeneratedAt ? 'link fresco' : (invite.status ?? 'Pending')}</span>
              <div className="settings-clean-actions">
                <button className="button button-secondary button-small" type="button" disabled={busyId === `copy-${invite.id}`} onClick={() => copyInvite(invite)}>{busyId === `copy-${invite.id}` ? 'Genero…' : 'Copia'}</button>
                <button className="button button-secondary button-small" type="button" disabled={busyId === `open-${invite.id}`} onClick={() => openInvite(invite)}>{busyId === `open-${invite.id}` ? 'Genero…' : 'Apri'}</button>
                <button className="button button-danger button-small" type="button" disabled={busyId === invite.id} onClick={() => removeInvite(invite)}>{busyId === invite.id ? 'Elimino…' : 'Elimina'}</button>
              </div>
            </article>
          )) : <article className="empty-state-card settings-clean-empty"><strong>Nessun invito creato</strong><p>Crea un invito usando il form sopra.</p></article>}
        </div>
      </section>

      <section className="internal-panel internal-padded settings-clean-card">
        <div className="panel-title-row"><div><h2>Sincronizzazione dati</h2><p>Importa o esporta i dati tra Google Sheets, Supabase e sito.</p></div><span className="data-mode-badge">{syncBusy ? 'In corso' : 'Pronto'}</span></div>
        <div className="settings-clean-sync">
          <article><span className="data-mode-badge">Pronto</span><h3>Google Sheets → Supabase → Sito</h3><p>Importa i dati aggiornati dal master Google Sheets dentro Supabase.</p><button className="button button-primary" type="button" disabled={!isAdmin || syncBusy === 'import' || syncBusy === 'export'} onClick={handleImportMaster}>{syncBusy === 'import' ? 'Import in corso…' : 'Importa master in Supabase'}</button></article>
          <article><span className="data-mode-badge">Pronto</span><h3>Sito / Supabase → Google Sheets</h3><p>Esporta lo store Supabase nel tab controllato Hub_Sync_Data.</p><button className="button button-secondary" type="button" disabled={!isAdmin || syncBusy === 'import' || syncBusy === 'export'} onClick={handleExportMaster}>{syncBusy === 'export' ? 'Export in corso…' : 'Esporta Supabase nel master'}</button></article>
        </div>
        {syncFeedback ? <p className="success-alert settings-clean-feedback">{syncFeedback}</p> : null}
      </section>
    </section>
  )
}

function loadInvites() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((invite) => ({
      id: invite.id ?? `invite-${invite.email ?? Date.now()}`,
      name: invite.name ?? invite.email ?? 'Utente',
      email: String(invite.email ?? '').toLowerCase(),
      role: invite.role ?? 'employee',
      status: invite.status ?? 'Pending',
      createdAt: invite.createdAt ?? new Date().toISOString(),
      token: invite.token ?? createToken(),
      inviteUrl: invite.inviteUrl,
      userId: invite.userId ?? invite.user_id ?? '',
      redirectTo: invite.redirectTo ?? '',
      regeneratedAt: invite.regeneratedAt ?? '',
    })).filter((invite) => invite.email)
  } catch {
    return []
  }
}

function buildInviteUrl({ token, email, role }) {
  const { origin, pathname } = window.location
  const safePath = pathname && pathname !== '/' ? pathname : '/hub/'
  const params = new URLSearchParams({ invite: token, email, role })
  return `${origin}${safePath}?${params.toString()}#/dashboard/login`
}

async function deleteSupabaseUser(invite) {
  return callInviteFunction({ action: 'delete_user', email: invite.email, userId: invite.userId ?? '' })
}

async function callInviteFunction(payload) {
  if (!supabaseUrl) throw new Error('Supabase URL non configurato')

  const token = getAccessToken()
  if (!token) throw new Error('sessione Supabase non disponibile: esci e rientra con login admin')

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/invite-user`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'funzione invite-user non riuscita')
  return data
}

function getAccessToken() {
  const storedSession = getStoredAuthSession()
  if (storedSession?.access_token) return storedSession.access_token

  try {
    const entry = Object.entries(window.localStorage).find(([key]) => key.startsWith('sb-') && key.endsWith('-auth-token'))
    if (!entry) return ''
    const parsed = JSON.parse(entry[1])
    return parsed?.access_token ?? parsed?.currentSession?.access_token ?? ''
  } catch {
    return ''
  }
}

function createToken() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  } catch {
    return 'DA VERIFICARE'
  }
}
