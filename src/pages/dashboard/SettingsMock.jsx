import { useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { StatusBadge } from '../../components/StatusBadge'
import {
  exportSupabaseToGoogleSheets,
  importGoogleSheetsToSupabase,
  isGoogleSheetsSyncConfigured,
} from '../../lib/googleSheetsSync'

export function SettingsMock() {
  const [syncStatus, setSyncStatus] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

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
        title="Sincronizzazione dati"
        description="Gestisci il collegamento operativo tra sito, Supabase e BARCELO_ROMA_master Google Sheets."
      >
        <DataModeBadge>{isGoogleSheetsSyncConfigured ? 'Sync configurabile' : 'Sync da configurare'}</DataModeBadge>
      </DashboardHeader>

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
