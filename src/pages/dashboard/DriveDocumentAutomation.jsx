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
  buildDocumentAutomationRows,
  buildPlanTsv,
  callDriveAutomationEndpoint,
  getDriveAutomationStats,
} from '../../lib/driveDocumentAutomation'
import { CHUNKED_DRIVE_AUTOMATION_SCRIPT } from '../../lib/driveDocumentAutomationChunked'

const STORAGE_KEY = 'europaservice-drive-automation-endpoint'
const endpointFromEnv = import.meta.env.VITE_DRIVE_AUTOMATION_URL || ''

export function DriveDocumentAutomation({ session, store }) {
  const [endpoint, setEndpoint] = useState(() => window.localStorage.getItem(STORAGE_KEY) || endpointFromEnv)
  const [status, setStatus] = useState({ state: 'idle', message: 'Pronto: usa Avvia a blocchi, poi Continua blocco finché arriva al 100%.' })
  const [progress, setProgress] = useState(null)
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
      return null
    }

    setStatus({ state: 'loading', message: `${label} in corso...` })
    const result = await callDriveAutomationEndpoint(endpoint, action)
    if (result.progress) setProgress(result.progress)
    if (!result.ok) {
      setStatus({ state: 'error', message: result.error ?? 'Errore Apps Script.' })
      return result
    }

    const summary = formatResultSummary(result)
    setStatus({ state: result.progress?.status === 'complete' ? 'success' : 'idle', message: `${label} completato. ${summary}` })
    return result
  }

  async function startChunked() {
    await runAction('startChunked', 'Avvio a blocchi')
  }

  async function continueChunk() {
    await runAction('processNextChunk', 'Blocco successivo')
  }

  async function stopChunked() {
    await runAction('stopChunked', 'Stop sicuro')
  }

  async function refreshProgress() {
    await runAction('status', 'Aggiornamento stato')
  }

  return (
    <section className="drive-automation-page">
      <DashboardHeader
        eyebrow="Automazione Drive"
        title="Sistema documenti Barcelo Roma"
        description="Sistema a blocchi per leggere i file grezzi da Drive con OCR, abbinarli alle righe del master, rinominarli, spostarli e collegare il link al documento."
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
          <span className="eyebrow">Modalità sicura</span>
          <h2>Automazione OCR a blocchi</h2>
          <p>
            Invece di lavorare 103 file tutti insieme, il sistema legge circa 10 file per volta. Così eviti timeout,
            puoi fermare senza fare casino e vedi sempre se sta andando avanti.
          </p>
        </div>
        <div className="drive-auto-button-group">
          <button className="button button-primary drive-auto-main-button" type="button" disabled={!canRun || !endpoint || status.state === 'loading'} onClick={startChunked}>
            Avvia a blocchi
          </button>
          <button className="button button-secondary drive-auto-main-button" type="button" disabled={!canRun || !endpoint || status.state === 'loading'} onClick={continueChunk}>
            Continua blocco
          </button>
          <button className="button button-secondary drive-auto-main-button" type="button" disabled={!canRun || !endpoint || status.state === 'loading'} onClick={refreshProgress}>
            Aggiorna stato
          </button>
          <button className="button button-danger drive-auto-main-button" type="button" disabled={!canRun || !endpoint || status.state === 'loading'} onClick={stopChunked}>
            Stop sicuro
          </button>
        </div>
      </section>

      <ProgressPanel progress={progress} />

      <section className={`drive-automation-status drive-status-${status.state}`}>
        <strong>{status.state === 'loading' ? 'Operazione in corso' : 'Stato automazione'}</strong>
        <p>{status.message}</p>
      </section>

      <section className="accounting-alert warning-alert drive-automation-warning">
        <strong>Importante: aggiorna lo script prima di usare i blocchi</strong>
        <p>Copia il nuovo Apps Script a blocchi, sostituisci il codice nel progetto Apps Script separato e pubblica una nuova versione Web App. Poi usa Avvia a blocchi.</p>
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
              <input type="url" value={endpoint} onChange={(event) => saveEndpoint(event.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
            </label>

            <ActionList className="drive-automation-actions">
              <button className="button button-secondary" type="button" onClick={() => copyText(CHUNKED_DRIVE_AUTOMATION_SCRIPT, 'Nuovo Apps Script a blocchi copiato.')}>Copia Apps Script a blocchi</button>
              <button className="button button-secondary" type="button" onClick={() => copyText(planTsv, 'Piano TSV copiato. Incollalo nel tab Drive_Automation_Plan se vuoi lavorare manualmente.')}>Copia piano TSV</button>
            </ActionList>
          </aside>
        )}
      >
        <section className="internal-panel drive-automation-flow">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Come usarlo senza rischi</h2>
              <p>Avvia una volta, poi continua blocco per blocco. Se vuoi fermare, usa Stop sicuro: non interrompe a metà un file.</p>
            </div>
            <StatusBadge>A blocchi</StatusBadge>
          </div>

          <div className="drive-step-grid">
            <DriveStep number="1" title="Avvia a blocchi" text="Ricrea la lista file in Drive_Raw_Files e mette tutti i file in stato PENDING." action={<button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={startChunked}>Avvia</button>} />
            <DriveStep number="2" title="Continua blocco" text="Legge circa 10 file alla volta con OCR. Ripetilo finché la barra arriva al 100%." action={<button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={continueChunk}>Continua</button>} />
            <DriveStep number="3" title="Finalizza" text="Quando OCR è al 100%, Continua blocco genera piano, approva match sicuri e applica solo quelli." action={<button className="button button-secondary button-small" type="button" disabled={!canRun || !endpoint} onClick={continueChunk}>Finalizza</button>} />
            <DriveStep number="4" title="Stop sicuro" text="Richiede lo stop e si ferma al termine del blocco corrente, senza lasciare il file a metà." action={<button className="button button-danger button-small" type="button" disabled={!canRun || !endpoint} onClick={stopChunked}>Stop</button>} />
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
            <h2>Regola pratica</h2>
            <p>Non usare più il vecchio pulsante unico per 100+ file. Usa blocchi piccoli: più lento da cliccare, ma molto più stabile.</p>
          </div>
          <StatusBadge>Sicuro</StatusBadge>
        </div>
        <div className="drive-docs-grid">
          <GuideCard title="Quando premere Continua" items={[ 'Quando il blocco precedente è finito.', 'Quando la barra mostra ancora file pending.', 'Quando la fase è OCR o finalize.' ]} />
          <GuideCard title="Quando premere Stop" items={[ 'Se vedi che resta bloccato troppo tempo.', 'Se hai caricato file sbagliati.', 'Se vuoi evitare timeout e ripartire con calma.' ]} />
          <GuideCard title="Cosa controllare" items={[ 'OCR OK indica file letto.', 'VUOTO indica file letto ma senza testo utile.', 'ERRORE indica file non leggibile o problema permessi.' ]} />
          <GuideCard title="Quando applica davvero" items={[ 'Solo alla fase finale.', 'Solo sui match con score alto.', 'Solo se non trova duplicati nella cartella target.' ]} />
        </div>
      </section>

      <section className="internal-panel drive-script-panel">
        <div className="section-heading panel-title-row">
          <div>
            <h2>Script Apps Script a blocchi</h2>
            <p>Sostituisce il vecchio script. È pensato per evitare timeout e mostrare avanzamento reale.</p>
          </div>
          <button className="button button-secondary button-small" type="button" onClick={() => copyText(CHUNKED_DRIVE_AUTOMATION_SCRIPT, 'Nuovo Apps Script a blocchi copiato.')}>Copia</button>
        </div>
        <pre><code>{CHUNKED_DRIVE_AUTOMATION_SCRIPT}</code></pre>
      </section>
    </section>
  )
}

function ProgressPanel({ progress }) {
  const percent = Math.max(0, Math.min(100, Number(progress?.percent || 0)))
  return (
    <section className="internal-panel drive-progress-panel">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Progresso OCR</h2>
          <p>{progress?.message || 'Nessuna automazione a blocchi avviata.'}</p>
        </div>
        <StatusBadge>{progress?.phase || 'idle'}</StatusBadge>
      </div>
      <div className="drive-progress-bar" aria-label={`Progresso ${percent}%`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="drive-progress-stats">
        <span><strong>{percent}%</strong> completato</span>
        <span>{progress?.processed ?? 0}/{progress?.total ?? 0} file</span>
        <span>{progress?.ocrOk ?? 0} OCR OK</span>
        <span>{progress?.ocrFailed ?? 0} vuoti/errori</span>
        <span>{progress?.autoApproved ?? 0} auto-approvati</span>
        <span>{progress?.applied ?? 0} applicati</span>
        <span>{progress?.needsReview ?? 0} da controllare</span>
      </div>
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
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  )
}

function formatMoney(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
}

function formatResultSummary(result) {
  const parts = []
  if (typeof result.scannedFiles === 'number') parts.push(`${result.scannedFiles} file letti`)
  if (result.progress?.percent !== undefined) parts.push(`${result.progress.percent}%`)
  if (typeof result.processedThisChunk === 'number') parts.push(`${result.processedThisChunk} in questo blocco`)
  if (typeof result.ocrOk === 'number') parts.push(`${result.ocrOk} OCR ok`)
  if (typeof result.ocrFailed === 'number') parts.push(`${result.ocrFailed} vuoti/errori`)
  if (typeof result.planRows === 'number') parts.push(`${result.planRows} righe piano`)
  if (typeof result.autoApproved === 'number') parts.push(`${result.autoApproved} auto-approvati`)
  if (typeof result.success === 'number') parts.push(`${result.success} applicati`)
  if (typeof result.needsReview === 'number') parts.push(`${result.needsReview} da controllare`)
  return parts.length ? parts.join(' · ') : 'Operazione completata.'
}
