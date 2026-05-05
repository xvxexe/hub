import { useEffect, useMemo, useState } from 'react'

const INVITES_STORAGE_KEY = 'europaservice-created-invites-v001'
const LEGACY_INVITES_KEYS = [
  'europaservice-invites-v001',
  'europaservice-admin-invites-v001',
  'createdInvites',
]

const roleOptions = [
  { value: 'employee', label: 'Dipendente' },
  { value: 'accounting', label: 'Contabile' },
  { value: 'admin', label: 'Admin / Capo' },
]

const roleLabels = {
  employee: 'Dipendente',
  accounting: 'Contabile',
  admin: 'Admin / Capo',
}

export function SettingsMock({ session, store }) {
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'employee' })
  const [createdInvites, setCreatedInvites] = useState(() => loadStoredInvites())
  const [feedback, setFeedback] = useState('')
  const [busyInviteId, setBusyInviteId] = useState('')

  useEffect(() => {
    window.localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(createdInvites))
  }, [createdInvites])

  const canManageUsers = session?.role === 'admin'
  const inviteCount = createdInvites.length
  const syncStatus = store?.syncState?.status ?? 'Pronto'
  const baseInviteUrl = useMemo(() => getPublicInviteBaseUrl(), [])

  function updateInviteField(field, value) {
    setInviteForm((current) => ({ ...current, [field]: value }))
    setFeedback('')
  }

  function createInvite(event) {
    event.preventDefault()
    if (!canManageUsers) {
      setFeedback('Solo admin può creare inviti.')
      return
    }

    const name = inviteForm.name.trim()
    const email = inviteForm.email.trim().toLowerCase()
    if (!name || !email) {
      setFeedback('Compila nome ed email prima di creare il link.')
      return
    }

    const token = createInviteToken()
    const invite = {
      id: `invite-${Date.now()}`,
      name,
      email,
      role: inviteForm.role,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      createdBy: session?.email ?? session?.name ?? 'Admin',
      inviteUrl: `${baseInviteUrl}?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&role=${encodeURIComponent(inviteForm.role)}`,
      token,
    }

    setCreatedInvites((current) => [invite, ...current.filter((item) => item.email !== email)])
    setInviteForm({ name: '', email: '', role: 'employee' })
    setFeedback('Link invito creato con URL pubblico del sito.')
  }

  async function copyInviteLink(invite) {
    try {
      await navigator.clipboard.writeText(normalizeInviteUrl(invite.inviteUrl, invite))
      setFeedback(`Link invito copiato per ${invite.email}.`)
    } catch {
      setFeedback('Copia automatica non riuscita: apri il link e copialo manualmente.')
    }
  }

  async function removeInvite(inviteId) {
    const invite = createdInvites.find((item) => item.id === inviteId)
    if (!invite) return

    const confirmed = window.confirm(`Eliminare ${invite.email} dalla lista inviti e, se presente, da Supabase Auth?`)
    if (!confirmed) return

    setBusyInviteId(inviteId)

    try {
      const result = await deleteSupabaseUser(invite.email)
      setCreatedInvites((current) => current.filter((item) => item.id !== inviteId))

      if (result?.deleted) {
        setFeedback(`${invite.email} eliminato dalla lista e da Supabase Auth.`)
      } else if (result?.notFound) {
        setFeedback(`${invite.email} rimosso dalla lista. Non risultava presente in Supabase Auth.`)
      } else if (result?.notConfigured) {
        setFeedback(`${invite.email} rimosso dalla lista. Funzione Supabase delete-user non configurata/deployata.`)
      } else {
        setFeedback(`${invite.email} rimosso dalla lista. Eliminazione Supabase non confermata.`)
      }
    } catch (error) {
      setFeedback(`Errore Supabase: ${error.message}. L’invito non è stato rimosso.`)
    } finally {
      setBusyInviteId('')
    }
  }

  function openInvite(invite) {
    window.open(normalizeInviteUrl(invite.inviteUrl, invite), '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="settings-page settings-page-restored">
      <style>{settingsRestoreStyles}</style>
      <header className="dashboard-header internal-header settings-header-restored">
        <div>
          <p className="eyebrow">Impostazioni</p>
          <h1>Impostazioni area privata</h1>
          <p>Gestione accessi, inviti, sincronizzazione e preferenze operative dell’hub.</p>
        </div>
        <span className="data-mode-badge">{syncStatus}</span>
      </header>

      <section className="internal-panel internal-padded settings-admin-panel settings-card-restored">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Utenti</p>
            <h2>Crea invito utente</h2>
            <p>Il link viene generato sull’URL reale del sito, quindi non punta più a localhost.</p>
          </div>
          <span className="data-mode-badge">Admin</span>
        </div>

        <form className="admin-invite-form settings-invite-form-restored" onSubmit={createInvite}>
          <label>
            Nome completo
            <input type="text" value={inviteForm.name} onChange={(event) => updateInviteField('name', event.target.value)} placeholder="Es. Mario Rossi" disabled={!canManageUsers} />
          </label>
          <label>
            Email
            <input type="email" value={inviteForm.email} onChange={(event) => updateInviteField('email', event.target.value)} placeholder="nome@azienda.it" disabled={!canManageUsers} />
          </label>
          <label>
            Ruolo
            <select value={inviteForm.role} onChange={(event) => updateInviteField('role', event.target.value)} disabled={!canManageUsers}>
              {roleOptions.map((role) => <option value={role.value} key={role.value}>{role.label}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={!canManageUsers}>Crea link invito</button>
          </div>
        </form>

        {feedback ? <p className="success-alert settings-feedback-restored">{feedback}</p> : null}
      </section>

      <section className="internal-panel internal-padded settings-admin-panel settings-card-restored">
        <div className="panel-title-row">
          <div>
            <h2>Inviti / utenti creati</h2>
            <p>Puoi copiare, aprire o eliminare un invito. Elimina prova anche a rimuovere l’utente da Supabase Auth.</p>
          </div>
          <span className="data-mode-badge">{inviteCount} totali</span>
        </div>

        <div className="settings-invite-list-restored">
          {createdInvites.length ? createdInvites.map((invite) => (
            <article className="settings-invite-row-restored" key={invite.id}>
              <div className="settings-invite-avatar-restored" aria-hidden="true">👥</div>
              <div className="settings-invite-main-restored">
                <strong>{invite.name || invite.email}</strong>
                <span>{invite.email}</span>
                <dl>
                  <div><dt>Ruolo</dt><dd>{roleLabels[invite.role] ?? invite.role}</dd></div>
                  <div><dt>Creato il</dt><dd>{formatDate(invite.createdAt)}</dd></div>
                </dl>
              </div>
              <span className="status-badge settings-status-restored">{invite.status ?? 'Pending'}</span>
              <div className="settings-invite-actions-restored">
                <button className="button button-secondary button-small" type="button" onClick={() => copyInviteLink(invite)}>Copia</button>
                <button className="button button-secondary button-small" type="button" onClick={() => openInvite(invite)}>Apri</button>
                <button className="button button-danger button-small" type="button" onClick={() => removeInvite(invite.id)} disabled={busyInviteId === invite.id}>{busyInviteId === invite.id ? 'Elimino…' : 'Elimina'}</button>
              </div>
            </article>
          )) : (
            <article className="empty-state-card settings-empty-restored"><strong>Nessun invito creato</strong><p>Crea un invito usando il form sopra. Il link userà automaticamente il dominio pubblico del sito.</p></article>
          )}
        </div>
      </section>

      <section className="internal-panel internal-padded settings-sync-panel settings-card-restored">
        <div className="panel-title-row">
          <div>
            <h2>Sincronizzazione dati</h2>
            <p>Importa o esporta i dati tra Google Sheets, Supabase e sito senza cambiare formule del master.</p>
          </div>
          <span className="data-mode-badge">Pronto</span>
        </div>
        <div className="settings-sync-grid-restored">
          <article className="settings-sync-card-restored"><span className="data-mode-badge">Pronto</span><h3>Google Sheets → Supabase → Sito</h3><p>Usa il flusso già configurato nel progetto per importare il master nel database operativo.</p></article>
          <article className="settings-sync-card-restored"><span className="data-mode-badge">Pronto</span><h3>Sito / Supabase → Google Sheets</h3><p>Esporta lo store Supabase nel tab controllato Hub_Sync_Data, senza toccare formule o tab contabili esistenti.</p></article>
        </div>
      </section>
    </section>
  )
}

function loadStoredInvites() {
  const keys = [INVITES_STORAGE_KEY, ...LEGACY_INVITES_KEYS]
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map(normalizeStoredInvite).filter(Boolean)
    } catch {
      window.localStorage.removeItem(key)
    }
  }
  return []
}

function normalizeStoredInvite(invite) {
  if (!invite || typeof invite !== 'object') return null
  const email = String(invite.email ?? '').trim().toLowerCase()
  if (!email) return null
  const role = invite.role ?? invite.userRole ?? 'employee'
  const token = invite.token ?? createInviteToken()
  return {
    id: invite.id ?? `invite-${email}`,
    name: invite.name ?? invite.fullName ?? invite.displayName ?? email,
    email,
    role,
    status: invite.status ?? invite.state ?? 'Pending',
    createdAt: invite.createdAt ?? invite.created_at ?? new Date().toISOString(),
    createdBy: invite.createdBy ?? invite.created_by ?? 'Admin',
    token,
    inviteUrl: normalizeInviteUrl(invite.inviteUrl ?? invite.invite_url ?? invite.link, { email, role, token }),
  }
}

function getPublicInviteBaseUrl() {
  const { origin, pathname } = window.location
  const safePathname = pathname && pathname !== '/' ? pathname : '/hub/'
  return `${origin}${safePathname}#/dashboard/login`
}

function normalizeInviteUrl(url, invite) {
  const fallback = `${getPublicInviteBaseUrl()}?invite=${encodeURIComponent(invite?.token ?? createInviteToken())}&email=${encodeURIComponent(invite?.email ?? '')}&role=${encodeURIComponent(invite?.role ?? 'employee')}`
  if (!url || typeof url !== 'string') return fallback
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) return url
  try {
    const parsed = new URL(url)
    return `${getPublicInviteBaseUrl()}${parsed.search}`
  } catch {
    return fallback
  }
}

async function deleteSupabaseUser(email) {
  const functionUrl = getSupabaseFunctionUrl('delete-user')
  if (!functionUrl) return { deleted: false, notConfigured: true }
  const accessToken = await getSupabaseAccessToken()
  if (!accessToken) throw new Error('sessione Supabase non disponibile')
  const response = await fetch(functionUrl, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'delete-user non riuscita')
  return data
}

function getSupabaseFunctionUrl(functionName) {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  if (!envUrl) return ''
  return `${envUrl.replace(/\/$/, '')}/functions/v1/${functionName}`
}

async function getSupabaseAccessToken() {
  try {
    const raw = Object.entries(window.localStorage).find(([key]) => key.startsWith('sb-') && key.endsWith('-auth-token'))?.[1]
    if (!raw) return ''
    const parsed = JSON.parse(raw)
    return parsed?.access_token ?? parsed?.currentSession?.access_token ?? ''
  } catch {
    return ''
  }
}

function createInviteToken() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function formatDate(value) {
  if (!value) return 'DA VERIFICARE'
  try {
    return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  } catch {
    return value
  }
}

const settingsRestoreStyles = `
.settings-page-restored{width:min(100% - 2rem,980px);margin:0 auto;display:grid;gap:.95rem}.settings-header-restored,.settings-card-restored{width:100%!important;max-width:100%!important;margin:0!important}.settings-card-restored{border-radius:1rem!important}.settings-invite-form-restored{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:.8rem!important;align-items:end!important}.settings-invite-form-restored label:nth-child(3){grid-column:1/2}.settings-invite-form-restored .form-actions{grid-column:2/3;align-self:end}.settings-invite-form-restored .form-actions .button{min-height:2.65rem}.settings-feedback-restored{margin-top:.8rem!important}.settings-invite-list-restored{display:grid;gap:.6rem}.settings-invite-row-restored{display:grid;grid-template-columns:2.45rem minmax(0,1fr) auto auto;align-items:center;gap:.75rem;min-height:5.1rem;padding:.78rem .85rem;border:1px solid rgba(214,224,232,.86);border-radius:.86rem;background:rgba(248,250,252,.72)}.settings-invite-avatar-restored{display:grid;width:2.25rem;height:2.25rem;place-items:center;border-radius:.75rem;background:rgba(37,99,235,.1)}.settings-invite-main-restored{min-width:0;display:grid;gap:.16rem}.settings-invite-main-restored strong{color:var(--dash-title,#17212b);font-size:.92rem;font-weight:760;line-height:1.15}.settings-invite-main-restored>span{overflow:hidden;color:var(--dash-muted,#6f7b85);font-size:.8rem;text-overflow:ellipsis;white-space:nowrap}.settings-invite-main-restored dl{display:flex;flex-wrap:wrap;gap:.85rem;margin:.2rem 0 0}.settings-invite-main-restored dl div{display:grid;gap:.02rem}.settings-invite-main-restored dt{color:var(--dash-muted,#6f7b85);font-size:.62rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase}.settings-invite-main-restored dd{margin:0;color:var(--dash-title,#17212b);font-size:.72rem;font-weight:720}.settings-invite-actions-restored{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.38rem}.settings-invite-actions-restored .button-small{min-height:2rem!important;padding:.42rem .58rem!important;border-radius:.62rem!important;font-size:.72rem!important}.button-danger{border:1px solid rgba(220,38,38,.24)!important;background:rgba(254,242,242,.92)!important;color:#b91c1c!important}.button-danger:hover{background:rgba(254,226,226,.98)!important;border-color:rgba(220,38,38,.42)!important}.settings-empty-restored{padding:1rem!important;border-radius:.86rem!important}.settings-sync-grid-restored{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}.settings-sync-card-restored{position:relative;display:grid;gap:.7rem;min-height:11rem;padding:1rem;border:1px solid rgba(214,224,232,.86);border-radius:1rem;background:rgba(255,255,255,.84)}.settings-sync-card-restored .data-mode-badge{justify-self:end}.settings-sync-card-restored h3{margin:0;color:var(--dash-title,#17212b);font-size:1.18rem;line-height:1.12;letter-spacing:-.04em}.settings-sync-card-restored p{margin:0;color:var(--dash-muted,#6f7b85);font-size:.84rem;line-height:1.42}@media(max-width:767px){.settings-page-restored{width:100%;gap:.82rem}.settings-invite-form-restored,.settings-sync-grid-restored{grid-template-columns:minmax(0,1fr)!important}.settings-invite-form-restored label:nth-child(3),.settings-invite-form-restored .form-actions{grid-column:auto}.settings-invite-form-restored .form-actions .button{width:100%}.settings-invite-row-restored{grid-template-columns:2.25rem minmax(0,1fr);align-items:start;gap:.58rem;padding:.76rem}.settings-status-restored,.settings-invite-actions-restored{grid-column:1/-1;justify-content:flex-start}.settings-invite-actions-restored{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%}.settings-invite-actions-restored .button-small{width:100%}}
`
