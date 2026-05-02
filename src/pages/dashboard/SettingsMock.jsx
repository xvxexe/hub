import { useEffect, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import {
  exportSupabaseToGoogleSheets,
  importGoogleSheetsToSupabase,
  isGoogleSheetsSyncConfigured,
} from '../../lib/googleSheetsSync'
import { supabaseRequest } from '../../lib/supabaseClient'

const roleOptions = [
  { value: 'employee', label: 'Dipendente' },
  { value: 'accounting', label: 'Contabile' },
  { value: 'admin', label: 'Admin' },
]

export function SettingsMock({ session }) {
  const [syncStatus, setSyncStatus] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [inviteStatus, setInviteStatus] = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'employee',
  })
  const isAdmin = session?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadInvitations()
    }
  }, [isAdmin])

  async function loadInvitations() {
    const result = await supabaseRequest('invitations?select=id,email,full_name,role,status,created_at&order=created_at.desc', {
      method: 'GET',
    })

    if (result.error) {
      setInviteStatus({ type: 'error', message: result.error.message })
      return
    }

    setInvitations(Array.isArray(result.data) ? result.data : [])
  }

  async function createInvite(event) {
    event.preventDefault()
    setInviteStatus(null)

    if (!isAdmin) {
      setInviteStatus({ type: 'error', message: 'Solo un admin può preparare inviti.' })
      return
    }

    const email = inviteForm.email.trim().toLowerCase()
    const fullName = inviteForm.fullName.trim()

    if (!email || !fullName) {
      setInviteStatus({ type: 'error', message: 'Email e nome completo sono obbligatori.' })
      return
    }

    setInviteLoading(true)
    const result = await supabaseRequest('invitations', {
      method: 'POST',
      body: JSON.stringify({
        email,
        full_name: fullName,
        role: inviteForm.role,
        invited_by: session.id,
        status: 'pending',
      }),
    })
    setInviteLoading(false)

    if (result.error) {
      setInviteStatus({ type: 'error', message: result.error.message })
      return
    }

    setInviteForm({ email: '', fullName: '', role: 'employee' })
    setInviteStatus({
      type: 'success',
      message: 'Invito preparato. Ora crea lo stesso utente in Supabase Auth e poi collegalo al profilo/ruolo indicato.',
    })
    await loadInvitations()
  }

  async function runImport() {
    setIsRunning(true)
    setSyncStatus({ type: 'loading', message: 'Import da Google Sheets verso Supabase in corso...' })
    const result = await importGoogleSheetsToSupabase()
    setIsRunning(false)
    if (!result.ok) {
      setSyncStatus({ type: 'error', message: result.error })
      return
    }
    setSyncStatus({ type: 'success', message: `Import completato: ${result.summary.documents} documenti sincronizzati in Supabase.` })
  }

  async function runExport() {
    setIsRunning(true)
    setSyncStatus({ type: 'loading', message: 'Export da Supabase verso Google Sheets in corso...' })
    const result = await exportSupabaseToGoogleSheets()
    setIsRunning(false)
    if (!result.ok) {
      setSyncStatus({ type: 'error', message: result.error })
      return
    }
    setSyncStatus({ type: 'success', message: `Export completato: ${result.summary.documents} documenti scritti nel tab Hub_Sync_Data.` })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Impostazioni"
        title="Impostazioni e accessi"
        description="Gestisci sincronizzazione dati, accessi reali Supabase e inviti per nuovi utenti dell’area privata."
      >
        <DataModeBadge>{isGoogleSheetsSyncConfigured ? 'Sync configurabile' : 'Sync da configurare'}</DataModeBadge>
      </DashboardHeader>

      {isAdmin ? (
        <section className="internal-panel internal-padded">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Invita persone</h2>
              <p>Prepara un nuovo accesso con ruolo corretto. Il ruolo non si cambia più manualmente dalla UI: viene letto da Supabase.</p>
            </div>
            <StatusBadge>Solo admin</StatusBadge>
          </div>

          <form className="admin-invite-form" onSubmit={createInvite}>
            <label>
              Nome completo
              <input
                type="text"
                placeholder="Es. Mario Rossi"
                value={inviteForm.fullName}
                onChange={(event) => setInviteForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="nome@azienda.it"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Ruolo
              <select
                value={inviteForm.role}
                onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </label>
            <div className="full-row">
              <button className="button button-primary" type="submit" disabled={inviteLoading}>
                {inviteLoading ? 'Creo invito...' : 'Prepara invito'}
              </button>
            </div>
          </form>

          {inviteStatus ? (
            <p className="role-description login-error">{inviteStatus.message}</p>
          ) : null}
        </section>
      ) : null}

      {isAdmin ? (
        <section className="internal-panel internal-padded">
          <div className="section-heading panel-title-row">
            <h2>Inviti preparati</h2>
            <StatusBadge>{invitations.length} totali</StatusBadge>
          </div>
          <div className="admin-invite-list">
            {invitations.length > 0 ? invitations.map((invite) => (
              <article className="admin-invite-row" key={invite.id}>
                <div>
                  <strong>{invite.full_name}</strong>
                  <small>{invite.email}</small>
                </div>
                <StatusBadge>{roleOptions.find((role) => role.value === invite.role)?.label ?? invite.role}</StatusBadge>
                <StatusBadge>{invite.status}</StatusBadge>
              </article>
            )) : (
              <p>Nessun invito preparato.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="internal-two-column internal-padded">
        <article className="internal-panel">
          <div className="section-heading panel-title-row">
            <h2>Google Sheets → Supabase → Sito</h2>
            <StatusBadge>{isGoogleSheetsSyncConfigured ? 'Pronto' : 'Manca URL'}</StatusBadge>
          </div>
          <p>
            Importa i dati aggiornati dal master Google Sheets dentro Supabase. Dopo il refresh, il sito legge i nuovi dati da Supabase.
          </p>
          <button className="button button-primary" type="button" disabled={isRunning || !isGoogleSheetsSyncConfigured} onClick={runImport}>
            Importa master in Supabase
          </button>
        </article>

        <article className="internal-panel">
          <div className="section-heading panel-title-row">
            <h2>Sito / Supabase → Google Sheets</h2>
            <StatusBadge>{isGoogleSheetsSyncConfigured ? 'Pronto' : 'Manca URL'}</StatusBadge>
          </div>
          <p>
            Esporta lo store Supabase nel tab controllato <strong>Hub_Sync_Data</strong>, senza toccare formule o tab contabili esistenti.
          </p>
          <button className="button button-secondary" type="button" disabled={isRunning || !isGoogleSheetsSyncConfigured} onClick={runExport}>
            Esporta Supabase nel master
          </button>
        </article>
      </section>

      <section className="internal-panel internal-padded">
        <div className="section-heading panel-title-row">
          <h2>Stato sincronizzazione</h2>
          {syncStatus ? <StatusBadge>{syncStatus.type}</StatusBadge> : null}
        </div>
        {syncStatus ? <p>{syncStatus.message}</p> : <p>Nessuna sincronizzazione eseguita in questa sessione.</p>}
        {!isGoogleSheetsSyncConfigured ? (
          <p>
            Per attivare i pulsanti, pubblica lo script Google Apps Script in <code>scripts/google-apps-script/Code.gs</code> come Web App e aggiungi l’URL in <code>VITE_GOOGLE_SHEETS_SYNC_URL</code> nel workflow GitHub Pages.
          </p>
        ) : null}
      </section>
    </>
  )
}
