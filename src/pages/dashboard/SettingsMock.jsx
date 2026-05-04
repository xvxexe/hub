import { useEffect, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  DataCardRow,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { StatusBadge } from '../../components/StatusBadge'
import {
  exportSupabaseToGoogleSheets,
  importGoogleSheetsToSupabase,
  isGoogleSheetsSyncConfigured,
} from '../../lib/googleSheetsSync'
import { inviteUserFromAdmin, supabaseRequest } from '../../lib/supabaseClient'

const roleOptions = [
  { value: 'employee', label: 'Dipendente' },
  { value: 'accounting', label: 'Contabile' },
  { value: 'admin', label: 'Admin' },
]

function normalizeRole(value) {
  return String(value ?? '').trim().toLowerCase()
}

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
  const isAdmin = normalizeRole(session?.role) === 'admin'
  const selectedRole = roleOptions.find((role) => role.value === inviteForm.role) ?? roleOptions[0]

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
      setInviteStatus({ type: 'error', message: 'Solo un admin può invitare utenti.' })
      return
    }

    const email = inviteForm.email.trim().toLowerCase()
    const fullName = inviteForm.fullName.trim()

    if (!email || !fullName) {
      setInviteStatus({ type: 'error', message: 'Email e nome completo sono obbligatori.' })
      return
    }

    setInviteLoading(true)
    const result = await inviteUserFromAdmin({
      email,
      fullName,
      role: inviteForm.role,
    })
    setInviteLoading(false)

    if (result.error) {
      setInviteStatus({ type: 'error', message: result.error.message })
      return
    }

    setInviteForm({ email: '', fullName: '', role: 'employee' })
    setInviteStatus({
      type: 'success',
      message: result.data?.message || 'Utente creato e profilo collegato al ruolo selezionato.',
      actionLink: result.data?.actionLink,
    })
    await loadInvitations()
  }

  async function copyInviteLink() {
    if (!inviteStatus?.actionLink) return
    await navigator.clipboard.writeText(inviteStatus.actionLink)
    setInviteStatus((current) => ({
      ...current,
      message: 'Link invito copiato. Mandalo alla persona su WhatsApp o email.',
    }))
  }

  async function runImport() {
    setIsRunning(true)
    setSyncStatus({ type: 'loading', message: 'Import da Google Sheets verso Supabase in corso...' })
    const result = await importGoogleSheetsToSupabase(session)
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

      <KpiStrip ariaLabel="Indicatori impostazioni">
        <KpiCard icon="settings" label="Ruolo sessione" value={getCurrentRoleLabel(session?.role)} hint={isAdmin ? 'Accesso completo' : 'Accesso limitato'} />
        <KpiCard icon="users" tone="purple" label="Inviti" value={invitations.length} hint={isAdmin ? 'Utenti creati' : 'Solo admin'} muted={!isAdmin} />
        <KpiCard icon="link" tone={isGoogleSheetsSyncConfigured ? 'green' : 'amber'} label="Sync Sheets" value={isGoogleSheetsSyncConfigured ? 'Pronto' : 'Manca URL'} hint="Google Sheets" />
        <KpiCard icon={syncStatus?.type === 'error' ? 'warning' : 'check'} tone={getSyncTone(syncStatus)} label="Ultima azione" value={syncStatus?.type ?? 'Nessuna'} hint={isRunning ? 'In corso' : 'Sessione'} />
      </KpiStrip>

      <WorkspaceLayout
        className="settings-workspace"
        sidebar={(
          <>
            <RoleContextPanel selectedRole={selectedRole} isAdmin={isAdmin} />
            <SyncStatusPanel syncStatus={syncStatus} />
            <ConfigurationPanel />
          </>
        )}
      >
        {isAdmin ? (
          <InvitePeoplePanel
            inviteForm={inviteForm}
            inviteLoading={inviteLoading}
            inviteStatus={inviteStatus}
            onChange={setInviteForm}
            onCopyInviteLink={copyInviteLink}
            onSubmit={createInvite}
          />
        ) : null}

        {isAdmin ? <InvitationsPanel invitations={invitations} /> : null}

        <section className="internal-panel internal-padded">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Sincronizzazione dati</h2>
              <p>Importa o esporta i dati tra Google Sheets, Supabase e sito senza cambiare formule del master.</p>
            </div>
            <StatusBadge>{isGoogleSheetsSyncConfigured ? 'Pronto' : 'Manca URL'}</StatusBadge>
          </div>
          <div className="internal-two-column">
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
          </div>
        </section>
      </WorkspaceLayout>
    </>
  )
}

function InvitePeoplePanel({ inviteForm, inviteLoading, inviteStatus, onChange, onCopyInviteLink, onSubmit }) {
  return (
    <section className="internal-panel internal-padded admin-invitations-panel">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Invita persone</h2>
          <p>Crea l’utente reale in Supabase Auth, assegna il ruolo e genera un link invito da inviare manualmente.</p>
        </div>
        <StatusBadge>Solo admin</StatusBadge>
      </div>

      <form className="admin-invite-form" onSubmit={onSubmit}>
        <label>
          Nome completo
          <input
            type="text"
            placeholder="Es. Mario Rossi"
            value={inviteForm.fullName}
            onChange={(event) => onChange((current) => ({ ...current, fullName: event.target.value }))}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            placeholder="nome@azienda.it"
            value={inviteForm.email}
            onChange={(event) => onChange((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label>
          Ruolo
          <select
            value={inviteForm.role}
            onChange={(event) => onChange((current) => ({ ...current, role: event.target.value }))}
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </label>
        <div className="full-row">
          <button className="button button-primary" type="submit" disabled={inviteLoading}>
            {inviteLoading ? 'Creo link invito...' : 'Crea utente e link invito'}
          </button>
        </div>
      </form>

      {inviteStatus ? (
        <div className="role-description login-error">
          <p>{inviteStatus.message}</p>
          {inviteStatus.actionLink ? (
            <div className="admin-invite-link-box">
              <input readOnly value={inviteStatus.actionLink} />
              <button className="button button-secondary" type="button" onClick={onCopyInviteLink}>
                Copia link
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function InvitationsPanel({ invitations }) {
  return (
    <section className="internal-panel internal-padded admin-invitations-panel">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Inviti / utenti creati</h2>
          <p>Lista degli utenti creati tramite area admin.</p>
        </div>
        <StatusBadge>{invitations.length} totali</StatusBadge>
      </div>
      <div className="document-card-list">
        {invitations.length > 0 ? invitations.map((invite) => (
          <DataCardRow
            key={invite.id}
            icon="users"
            title={invite.full_name}
            description={invite.email}
            status={invite.status}
            meta={[
              { label: 'Ruolo', value: roleOptions.find((role) => role.value === invite.role)?.label ?? invite.role },
              { label: 'Creato il', value: formatDate(invite.created_at) },
            ]}
          />
        )) : (
          <article className="accounting-alert"><strong>Nessun invito ancora creato</strong><small>Gli inviti creati appariranno qui.</small></article>
        )}
      </div>
    </section>
  )
}

function RoleContextPanel({ selectedRole, isAdmin }) {
  return (
    <SideContextPanel
      title="Ruolo nuovo invito"
      description="Permessi previsti per la persona che stai invitando."
      action={<StatusBadge>{selectedRole.label}</StatusBadge>}
    >
      <dl className="detail-list">
        <div><dt>Ruolo</dt><dd>{selectedRole.label}</dd></div>
        <div><dt>Permessi</dt><dd>{getRolePermissionHint(selectedRole.value)}</dd></div>
        <div><dt>Admin attivo</dt><dd>{isAdmin ? 'Sì' : 'No'}</dd></div>
      </dl>
    </SideContextPanel>
  )
}

function SyncStatusPanel({ syncStatus }) {
  return (
    <SideContextPanel
      title="Stato sincronizzazione"
      description="Ultimo risultato di import/export in questa sessione."
      action={syncStatus ? <StatusBadge>{syncStatus.type}</StatusBadge> : null}
    >
      {syncStatus ? <p>{syncStatus.message}</p> : <p>Nessuna sincronizzazione eseguita in questa sessione.</p>}
    </SideContextPanel>
  )
}

function ConfigurationPanel() {
  if (isGoogleSheetsSyncConfigured) return null

  return (
    <SideContextPanel title="Configurazione richiesta" description="Dettagli tecnici per attivare la sincronizzazione.">
      <p>
        Pubblica lo script Google Apps Script in <code>scripts/google-apps-script/Code.gs</code> come Web App e aggiungi l’URL in <code>VITE_GOOGLE_SHEETS_SYNC_URL</code> nel workflow GitHub Pages.
      </p>
    </SideContextPanel>
  )
}

function getRolePermissionHint(role) {
  if (role === 'admin') return 'Accesso completo: utenti, dati, impostazioni e sync.'
  if (role === 'accounting') return 'Documenti, contabilità, report e upload documenti.'
  return 'Upload operativo e propri caricamenti.'
}

function getCurrentRoleLabel(role) {
  if (role === 'admin') return 'Admin'
  if (role === 'accounting') return 'Contabile'
  if (role === 'employee') return 'Dipendente'
  return 'Utente'
}

function getSyncTone(syncStatus) {
  if (syncStatus?.type === 'error') return 'red'
  if (syncStatus?.type === 'success') return 'green'
  if (syncStatus?.type === 'loading') return 'amber'
  return 'blue'
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
