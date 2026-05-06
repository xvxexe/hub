import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import {
  ActionList,
  DataCardRow,
  KpiCard,
  KpiStrip,
  WorkspaceLayout,
} from '../../components/InternalLayout'
import { StatusBadge } from '../../components/StatusBadge'
import {
  DRIVE_AUTOMATION_CONFIG,
  DRIVE_AUTOMATION_SCRIPT,
  buildDocumentAutomationRows,
  buildPlanTsv,
  callDriveAutomationEndpoint,
  getDriveAutomationStats,
} from '../../lib/driveDocumentAutomation'

const STORAGE_KEY = 'europaservice-drive-automation-endpoint'
const endpointFromEnv = import.meta.env.VITE_DRIVE_AUTOMATION_URL || ''

export function DriveDocumentAutomation({ session, store }) {
  const [endpoint, setEndpoint] = useState(() => window.localStorage.getItem(STORAGE_KEY) || endpointFromEnv)
  const [status, setStatus] = useState({ state: 'idle', message: 'Pronto: carica i file in Drive e premi Sistema automaticamente.' })
  const rows = useMemo(() => buildDocumentAutomationRows(store?.documents ?? []), [store?.documents])
  const stats = useMemo(() => getDriveAutomationStats(rows), [rows])
  const previewRows = rows.filter((row) => row.status === 'DA COLLEGARE').slice(0, 8)
  const canRun = session?.role === 'admin' || session?.role === 'accounting'
  const planTsv = useMemo(() => buildPlanTsv(rows.filter((row) => row.status === 'DA COLLEGARE')), [rows])

  function saveEndpoint(value) {
    setEndpoint(value)
    window.localStorage.setItem(STORAGE_KEY, value)
  }

  async function copyText(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text)
      setStatus({ state: 'success', message: successMessage })
    } catch {
      setStatus({ state: 'error', message: 'Copia non riuscita: seleziona e copia manualmente.' })
    }
  }

  async function runAction(action, label) {
    if (!canRun) {
      setStatus({ state: 'error', message: 'Solo admin o contabile possono usare questa automazione.' })
      return
    }

    setStatus({ state: 'loading', message: `${label} in corso...` })
    const result = await callDriveAutomationEndpoint(endpoint, action)
    if (!result.ok) {
      setStatus({ state: 'error', message: result.error ?? 'Errore Apps Script.' })
      return
    }

    const summary = formatResultSummary(result)
    setStatus({ state: 'success', message: `${label} completato. ${summary}` })
  }

  return (
    <section className="drive-automation-page">
      <DashboardHeader
        eyebrow="Automazione Drive"
        title="Sistema documenti Barcelo Roma"
        description="Sistema automatico per leggere i file grezzi da Drive, abbinarli alle righe del master, rinominarli, spostarli e collegare il link al documento."
      >
        <DataModeBadge>Google Drive + Master</DataModeBadge>
      </DashboardHeader>

      <KpiStrip ariaLabel="Indicatori automazione Drive">
        <KpiCard icon="file" label="Documenti store" value={stats.total} hint="Da Supabase/master" />
        <KpiCard icon="warning" tone="amber" label="Da collegare" value={stats.missing} hint="Senza link Drive" />
        <KpiCard icon="check" tone="green" label="Già collegati" value={stats.linked} hint="File presente" />
        <KpiCard icon="building" tone="purple" label="Aree/tab" value={stats.areas} hint="Destinazioni" />
      </KpiStrip>

      <section className="internal-panel drive-auto-hero">
        <div>
          <span className="eyebrow">Modalità consigliata</span>
          <h2>Sistema automaticamente i documenti sicuri</h2>
          <p>
            Premi un solo pulsante: lo script prepara i tab, scannerizza Drive, genera il piano, approva solo i match sicuri,
            fa un dry-run e applica automaticamente le righe senza rischi evidenti. I casi dubbi restano fermi da controllare.
          </p>
        </div>
        <button
          className="button button-primary drive-auto-main-button"
          type="button"
          disabled={!canRun || !endpoint || status.state === 'loading'}
          onClick={() => runAction('runFullAuto', 'Sistema automatico')}
        >
          {status.state === 'loading' ? 'Automazione in corso…' : 'Sistema automaticamente'}
        </button>
      </section>

      <section className={`drive-automation-status drive-status-${status.state}`}>
        <strong>{status.state === 'loading' ? 'Operazione in corso' : 'Stato automazione'}</strong>
        <p>{status.message}</p>
      </section>

      <section className="accounting-alert warning-alert drive-automation-warning">
        <strong>La prima configurazione resta necessaria una sola volta</strong>
        <p>Copia lo script, pubblicalo come Web App separata, incolla qui l’URL /exec. Dopo questa configurazione userai quasi sempre solo “Sistema automaticamente”.</p>
      </section>

      <WorkspaceLayout
        className="drive-automation-workspace"
        sidebar={(
          <aside className="internal-panel drive-automation-side">
            <div className="section-heading panel-title-row">
              <div>
                <h2>Configurazione</h2>
                <p>ID già impostati per Barcelo Roma.</p>
              </div>
              <StatusBadge>{endpoint ? 'Endpoint inserito' : 'Endpoint mancante'}</StatusBadge>
            </div>

            <dl className="detail-list drive-config-list">
              <div><dt>Master</dt><dd>{DRIVE_AUTOMATION_CONFIG.masterSpreadsheetId}</dd></div>
              <div><dt>Cartella Barcelo</dt><dd>{DRIVE_AUTOMATION_CONFIG.barceloFolderId}</dd></div>
              <div><dt>Documenti grezzi</dt><dd>{DRIVE_AUTOMATION_CONFIG.rawDocumentsFolderId}</dd></div>
              <div><dt>Tab piano</dt><dd>{DRIVE_AUTOMATION_CONFIG.planTab}</dd></div>
            </dl>

            <label className="drive-endpoint-field">
              Endpoint Apps Script separato
              <input
                type="url"
                value={endpoint}
                onChange={(event) => saveEndpoint(event.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </label>

            <ActionList className="drive-automation-actions">
              <button className="button button-secondary" type="button" onClick={() => copyText(DRIVE_AUTOMATION_SCRIPT, 'Codice Apps Script copiato.')}>Copia Apps Script</button>
              <button className="button button-secondary" type="button" onClick={() => copyText(planTsv, 'Piano TSV copiato. Incollalo nel tab Drive_Automation_Plan se vuoi lavorare manualmente.')}>Copia piano TSV</button>
            </ActionList>
          </aside>
        )}
      >
        <section className="internal-panel drive-automation-flow">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Strumenti tecnici</h2>
              <p>Da usare solo se vuoi controllare un passaggio specifico. Il flusso normale è il pulsante automatico sopra.</p>
            </div>
            <StatusBadge>Emergenza / debug</StatusBadge>
          </div>

          <div className="drive-step-grid">
            <DriveStep
              number="1"
              title="Setup"
              text="Crea o aggiorna i tab tecnici nel master. Serve anche dentro al flusso automatico."
              action={<button className="button button-secondary button-small" type="button" disabled={!canRun} onClick={() => runAction('setup', 'Setup')}>Setup</button>}
            />
            <DriveStep
              number="2"
              title="Scannerizza"
              text="Legge tutti i PDF/JPG presenti nella cartella Documenti grezzi di Barcelo Roma."
              action={<button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('scan', 'Scansione')}>Scannerizza</button>}
            />
            <DriveStep
              number="3"
              title="Genera piano"
              text="Crea il piano di match tra righe del master e file grezzi trovati in Drive."
              action={<button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('buildPlan', 'Generazione piano')}>Genera piano</button>}
            />
            <DriveStep
              number="4"
              title="Applica approvate"
              text="Esegue solo righe già approvate nel tab Drive_Automation_Plan. Il flusso automatico approva solo i match sicuri."
              action={(
                <ActionList>
                  <button className="button button-secondary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('dryRun', 'Dry-run')}>Dry-run</button>
                  <button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('applyApproved', 'Applicazione')}>Applica</button>
                </ActionList>
              )}
            />
          </div>
        </section>

        <section className="internal-panel drive-automation-preview">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Prime righe da collegare</h2>
              <p>Queste sono le righe senza link Drive nello store. L’automazione prova a collegarle automaticamente quando trova un match sicuro.</p>
            </div>
            <StatusBadge>{previewRows.length} visibili</StatusBadge>
          </div>

          <div className="document-card-list">
            {previewRows.length ? previewRows.map((row) => (
              <DataCardRow
                key={row.id}
                icon="file"
                title={row.documentLabel}
                description={`${row.supplier} · ${row.area}`}
                status={row.status}
                meta={[
                  { label: 'Data', value: row.date },
                  { label: 'Totale', value: formatMoney(row.total) },
                  { label: 'Nome nuovo', value: row.suggestedName },
                  { label: 'Percorso', value: row.targetPath },
                ]}
              />
            )) : (
              <article className="accounting-alert success-alert">
                <strong>Nessun documento da collegare nello store corrente</strong>
                <small>Controlla comunque il tab Drive_Documenti: potrebbe avere stati MANCANTE non ancora importati nello store.</small>
              </article>
            )}
          </div>
        </section>
      </WorkspaceLayout>

      <section className="internal-panel drive-docs-panel">
        <div className="section-heading panel-title-row">
          <div>
            <h2>Come funziona l’automatico</h2>
            <p>Il sistema agisce da solo solo dove il match è sicuro. Non forza righe dubbie, duplicati o file senza corrispondenza.</p>
          </div>
          <StatusBadge>Automatico sicuro</StatusBadge>
        </div>

        <div className="drive-docs-grid">
          <GuideCard
            title="1. Tu fai solo una cosa"
            items={[
              'Metti PDF/foto ricevuti da WhatsApp nella cartella Documenti grezzi di Barcelo Roma.',
              'Torna qui e premi Sistema automaticamente.',
              'Non devi aprire il master se tutto viene riconosciuto correttamente.'
            ]}
          />
          <GuideCard
            title="2. Cosa fa il sistema"
            items={[
              'Crea/aggiorna i tab tecnici del master.',
              'Scannerizza i file presenti nella cartella Drive.',
              'Confronta file grezzi e righe del master.',
              'Approva automaticamente solo i match esatti e sicuri.'
            ]}
          />
          <GuideCard
            title="3. Cosa viene applicato"
            items={[
              'Rinomina i file con nome standard.',
              'Sposta i file nella cartella corretta del cantiere/tab.',
              'Aggiorna il master con il link Drive del documento.',
              'Segna nel log cosa è stato fatto.'
            ]}
          />
          <GuideCard
            title="4. Cosa resta fermo"
            items={[
              'File con nome non riconosciuto.',
              'Righe con dati insufficienti.',
              'Possibili duplicati nella cartella di destinazione.',
              'Match ambigui che richiedono controllo umano.'
            ]}
          />
        </div>
      </section>

      <section className="internal-panel drive-script-panel">
        <div className="section-heading panel-title-row">
          <div>
            <h2>Script Apps Script separato</h2>
            <p>Serve per rinominare/spostare fisicamente i file su Drive e aggiornare il link nella colonna K del master.</p>
          </div>
          <button className="button button-secondary button-small" type="button" onClick={() => copyText(DRIVE_AUTOMATION_SCRIPT, 'Codice Apps Script copiato.')}>Copia</button>
        </div>
        <pre><code>{DRIVE_AUTOMATION_SCRIPT}</code></pre>
      </section>
    </section>
  )
}

function DriveStep({ number, title, text, action }) {
  return (
    <article className="drive-step-card">
      <span>{number}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      {action ? <div className="drive-step-action">{action}</div> : null}
    </article>
  )
}

function GuideCard({ title, items }) {
  return (
    <article className="drive-guide-card">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  )
}

function formatMoney(value) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0))
}

function formatResultSummary(result) {
  const parts = []
  if (typeof result.scannedFiles === 'number') parts.push(`${result.scannedFiles} file letti`)
  if (typeof result.planRows === 'number') parts.push(`${result.planRows} righe piano`)
  if (typeof result.autoApproved === 'number') parts.push(`${result.autoApproved} auto-approvati`)
  if (typeof result.processed === 'number') parts.push(`${result.processed} processati`)
  if (typeof result.success === 'number') parts.push(`${result.success} ok`)
  if (typeof result.failed === 'number') parts.push(`${result.failed} errori/dubbi`)
  if (typeof result.needsReview === 'number') parts.push(`${result.needsReview} da controllare`)
  return parts.length ? parts.join(' · ') : 'Operazione completata.'
}
