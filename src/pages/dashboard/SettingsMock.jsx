import { useEffect, useState } from 'react'

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

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invites))
  }, [invites])

  const isAdmin = session?.role === 'admin'

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback('')
  }

  function createInvite(event) {
    event.preventDefault()
    if (!isAdmin) {
      setFeedback('Solo admin può creare inviti.')
      return
    }

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (!name || !email) {
      setFeedback('Compila nome ed email.')
      return
    }

    const token = createToken()
    const invite = {
      id: `invite-${Date.now()}`,
      name,
      email,
      role: form.role,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      token,
      inviteUrl: buildInviteUrl({ token, email, role: form.role }),
    }

    setInvites((current) => [invite, ...current.filter((item) => item.email !== email)])
    setForm({ name: '', email: '', role: 'employee' })
    setFeedback('Invito creato. Il link ora apre correttamente la pagina login.')
  }

  async function copyInvite(invite) {
    const url = normalizeInviteUrl(invite)
    try {
      await navigator.clipboard.writeText(url)
      setFeedback(`Link copiato per ${invite.email}.`)
    } catch {
      setFeedback(url)
    }
  }

  function openInvite(invite) {
    window.open(normalizeInviteUrl(invite), '_blank', 'noopener,noreferrer')
  }

  async function removeInvite(invite) {
    if (!window.confirm(`Eliminare ${invite.email} dalla lista e da Supabase Auth se esiste?`)) return

    setBusyId(invite.id)
    setInvites((current) => current.filter((item) => item.id !== invite.id))

    try {
      const result = await deleteSupabaseUser(invite.email)
      if (result?.deleted) {
        setFeedback(`${invite.email} eliminato dalla lista e da Supabase Auth.`)
      } else if (result?.notFound) {
        setFeedback(`${invite.email} eliminato dalla lista. In Supabase Auth non esisteva.`)
      } else if (result?.notConfigured) {
        setFeedback(`${invite.email} eliminato dalla lista. Funzione Supabase delete-user non configurata.`)
      } else {
        setFeedback(`${invite.email} eliminato dalla lista. Supabase non ha confermato la cancellazione.`)
      }
    } catch (error) {
      setFeedback(`${invite.email} eliminato dalla lista locale. Supabase Auth non eliminato: ${error.message}`)
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className="settings-page settings-clean-page">
      <style>{settingsStyles}</style>

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
            <p>Il link usa il dominio reale del sito e non punta più a localhost.</p>
          </div>
          <span className="data-mode-badge">Admin</span>
        </div>

        <form className="settings-clean-form" onSubmit={createInvite}>
          <label>
            Nome completo
            <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="Es. Mario Rossi" disabled={!isAdmin} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} placeholder="nome@azienda.it" disabled={!isAdmin} />
          </label>
          <label>
            Ruolo
            <select value={form.role} onChange={(event) => updateForm('role', event.target.value)} disabled={!isAdmin}>
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>
          <button className="button button-primary" type="submit" disabled={!isAdmin}>Crea link invito</button>
        </form>

        {feedback ? <p className="success-alert settings-clean-feedback">{feedback}</p> : null}
      </section>

      <section className="internal-panel internal-padded settings-clean-card">
        <div className="panel-title-row">
          <div>
            <h2>Inviti / utenti creati</h2>
            <p>Copia, apri o elimina gli inviti creati. Elimina rimuove subito la riga e prova anche Supabase Auth.</p>
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
              <span className="status-badge">{invite.status ?? 'Pending'}</span>
              <div className="settings-clean-actions">
                <button className="button button-secondary button-small" type="button" onClick={() => copyInvite(invite)}>Copia</button>
                <button className="button button-secondary button-small" type="button" onClick={() => openInvite(invite)}>Apri</button>
                <button className="button button-danger button-small" type="button" disabled={busyId === invite.id} onClick={() => removeInvite(invite)}>
                  {busyId === invite.id ? 'Elimino…' : 'Elimina'}
                </button>
              </div>
            </article>
          )) : (
            <article className="empty-state-card settings-clean-empty">
              <strong>Nessun invito creato</strong>
              <p>Crea un invito usando il form sopra.</p>
            </article>
          )}
        </div>
      </section>

      <section className="internal-panel internal-padded settings-clean-card">
        <div className="panel-title-row">
          <div>
            <h2>Sincronizzazione dati</h2>
            <p>Importa o esporta i dati tra Google Sheets, Supabase e sito senza cambiare formule del master.</p>
          </div>
          <span className="data-mode-badge">Pronto</span>
        </div>
        <div className="settings-clean-sync">
          <article>
            <span className="data-mode-badge">Pronto</span>
            <h3>Google Sheets → Supabase → Sito</h3>
            <p>Importa i dati aggiornati dal master Google Sheets dentro Supabase.</p>
          </article>
          <article>
            <span className="data-mode-badge">Pronto</span>
            <h3>Sito / Supabase → Google Sheets</h3>
            <p>Esporta lo store Supabase nel tab controllato Hub_Sync_Data.</p>
          </article>
        </div>
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

function normalizeInviteUrl(invite) {
  return buildInviteUrl({
    token: invite.token ?? createToken(),
    email: invite.email ?? '',
    role: invite.role ?? 'employee',
  })
}

async function deleteSupabaseUser(email) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return { notConfigured: true }

  const token = getAccessToken()
  if (!token) throw new Error('sessione Supabase non disponibile')

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/delete-user`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'funzione delete-user non riuscita')
  return data
}

function getAccessToken() {
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

const settingsStyles = `
.settings-clean-page{width:min(100% - 2rem,980px);margin:0 auto;display:grid;gap:.95rem}.settings-clean-header,.settings-clean-card{width:100%!important;max-width:100%!important;margin:0!important}.settings-clean-card{border-radius:1rem!important}.settings-clean-form{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:.8rem!important;align-items:end!important}.settings-clean-form label:nth-child(3){grid-column:1/2}.settings-clean-form>button{grid-column:2/3;min-height:2.65rem;align-self:end;justify-self:start}.settings-clean-feedback{margin-top:.8rem!important}.settings-clean-list{display:grid;gap:.6rem}.settings-clean-row{display:grid;grid-template-columns:2.45rem minmax(0,1fr) auto auto;align-items:center;gap:.75rem;min-height:5.1rem;padding:.78rem .85rem;border:1px solid rgba(214,224,232,.86);border-radius:.86rem;background:rgba(248,250,252,.72)}.settings-clean-avatar{display:grid;width:2.25rem;height:2.25rem;place-items:center;border-radius:.75rem;background:rgba(37,99,235,.1)}.settings-clean-main{min-width:0;display:grid;gap:.12rem}.settings-clean-main strong{color:var(--dash-title,#17212b);font-size:.92rem;font-weight:760;line-height:1.15}.settings-clean-main span{overflow:hidden;color:var(--dash-muted,#6f7b85);font-size:.8rem;text-overflow:ellipsis;white-space:nowrap}.settings-clean-main small{color:var(--dash-title,#17212b);font-size:.72rem;font-weight:700}.settings-clean-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.38rem}.settings-clean-actions .button-small{min-height:2rem!important;padding:.42rem .58rem!important;border-radius:.62rem!important;font-size:.72rem!important}.button-danger{border:1px solid rgba(220,38,38,.24)!important;background:rgba(254,242,242,.92)!important;color:#b91c1c!important}.settings-clean-empty{padding:1rem!important;border-radius:.86rem!important}.settings-clean-sync{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}.settings-clean-sync article{display:grid;gap:.7rem;min-height:11rem;padding:1rem;border:1px solid rgba(214,224,232,.86);border-radius:1rem;background:rgba(255,255,255,.84)}.settings-clean-sync .data-mode-badge{justify-self:end}.settings-clean-sync h3{margin:0;color:var(--dash-title,#17212b);font-size:1.18rem;line-height:1.12;letter-spacing:-.04em}.settings-clean-sync p{margin:0;color:var(--dash-muted,#6f7b85);font-size:.84rem;line-height:1.42}@media(max-width:767px){.settings-clean-page{width:100%;gap:.82rem}.settings-clean-form,.settings-clean-sync{grid-template-columns:minmax(0,1fr)!important}.settings-clean-form label:nth-child(3),.settings-clean-form>button{grid-column:auto}.settings-clean-form>button{width:100%;justify-self:stretch}.settings-clean-row{grid-template-columns:2.25rem minmax(0,1fr);align-items:start;gap:.58rem;padding:.76rem}.settings-clean-row>.status-badge,.settings-clean-actions{grid-column:1/-1;justify-content:flex-start}.settings-clean-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%}.settings-clean-actions .button-small{width:100%}}
`
