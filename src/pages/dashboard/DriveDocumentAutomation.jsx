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
  const [status, setStatus] = useState({ state: 'idle', message: 'Pronto per collegare Apps Script.' })
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
        description="Genera il piano di rinomina/spostamento dai file WhatsApp caricati in Drive e collega ogni documento alla riga del master."
      >
        <DataModeBadge>Google Drive + Master</DataModeBadge>
      </DashboardHeader>

      <KpiStrip ariaLabel="Indicatori automazione Drive">
        <KpiCard icon="file" label="Documenti store" value={stats.total} hint="Da Supabase/master" />
        <KpiCard icon="warning" tone="amber" label="Da collegare" value={stats.missing} hint="Senza link Drive" />
        <KpiCard icon="check" tone="green" label="Già collegati" value={stats.linked} hint="File presente" />
        <KpiCard icon="building" tone="purple" label="Aree/tab" value={stats.areas} hint="Destinazioni" />
      </KpiStrip>

      <section className={`drive-automation-status drive-status-${status.state}`}>
        <strong>{status.state === 'loading' ? 'Operazione in corso' : 'Stato automazione'}</strong>
        <p>{status.message}</p>
      </section>

      <section className="accounting-alert warning-alert drive-automation-warning">
        <strong>Importante: non incollare questo codice sotto allo script Google Sheets già esistente</strong>
        <p>Questo script ha propri doGet/doPost. Va pubblicato come Web App separata, poi devi incollare qui il nuovo URL /exec.</p>
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
              <h2>Flusso semi-automatico</h2>
              <p>Prima genera le schede nel master, poi scannerizza la cartella Documenti, poi approva solo le righe sicure.</p>
            </div>
            <StatusBadge>Review prima di applicare</StatusBadge>
          </div>

          <div className="drive-step-grid">
            <DriveStep
              number="1"
              title="Crea script separato"
              text="Vai su script.google.com, crea un nuovo progetto, incolla solo questo codice e pubblicalo come Web App autonoma."
              action={<button className="button button-secondary button-small" type="button" onClick={() => copyText(DRIVE_AUTOMATION_SCRIPT, 'Codice Apps Script copiato.')}>Copia codice</button>}
            />
            <DriveStep
              number="2"
              title="Setup + scansione"
              text="Crea i tab tecnici e legge tutti i PDF/JPG presenti in Barcelo Roma > Documenti."
              action={(
                <ActionList>
                  <button className="button button-secondary button-small" type="button" disabled={!canRun} onClick={() => runAction('setup', 'Setup')}>Setup</button>
                  <button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('scan', 'Scansione')}>Scannerizza</button>
                </ActionList>
              )}
            />
            <DriveStep
              number="3"
              title="Genera piano"
              text="Confronta Drive_Documenti con i file grezzi e compila Drive_Automation_Plan."
              action={<button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('buildPlan', 'Generazione piano')}>Genera piano</button>}
            />
            <DriveStep
              number="4"
              title="Approva e applica"
              text="Nel tab piano metti TRUE/SI solo sulle righe controllate. Dry-run prima, applica dopo."
              action={(
                <ActionList>
                  <button className="button button-secondary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('dryRun', 'Dry-run')}>Dry-run</button>
                  <button className="button button-primary button-small" type="button" disabled={!canRun || !endpoint} onClick={() => runAction('applyApproved', 'Applicazione')}>Applica approvate</button>
                </ActionList>
              )}
            />
          </div>
        </section>

        <section className="internal-panel drive-automation-preview">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Prime righe da collegare</h2>
              <p>Anteprima generata dai documenti nello store. Il match finale avviene nel master tramite Apps Script.</p>
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
            <h2>Guida operativa: come far sistemare i documenti</h2>
            <p>Questa automazione non decide da sola: prepara un piano, tu controlli le righe sicure, poi applichi solo quelle approvate.</p>
          </div>
          <StatusBadge>Procedura consigliata</StatusBadge>
        </div>

        <div className="drive-docs-grid">
          <GuideCard
            title="1. Prima prepara Drive"
            items={[
              'Metti tutti i PDF/foto ricevuti da WhatsApp nella cartella Documenti grezzi di Barcelo Roma.',
              'Non rinominare manualmente i file prima della scansione: lo script deve leggere i nomi originali.',
              'Evita doppioni evidenti se li vedi già, ma non cancellare file dubbi senza controllo.'
            ]}
          />
          <GuideCard
            title="2. Collega lo script una volta sola"
            items={[
              'Premi Copia Apps Script da questa pagina.',
              'Apri script.google.com e crea un progetto nuovo/separato, non dentro lo script del master già usato per import/export.',
              'Incolla il codice, distribuisci come Web App, accesso consentito al tuo account, poi copia l’URL che finisce con /exec.'
            ]}
          />
          <GuideCard
            title="3. Esegui i pulsanti in ordine"
            items={[
              'Incolla l’endpoint /exec nel campo a destra.',
              'Premi Setup per creare/aggiornare i tab tecnici nel master.',
              'Premi Scannerizza per leggere i file presenti in Drive.',
              'Premi Genera piano per creare le righe da controllare nel tab Drive_Automation_Plan.'
            ]}
          />
          <GuideCard
            title="4. Controlla prima di applicare"
            items={[
              'Apri il master Google Sheets e vai nel tab Drive_Automation_Plan.',
              'Controlla fornitore, importo, data, tab/lavorazione e nome suggerito.',
              'Metti TRUE/SI solo sulle righe dove sei sicuro del collegamento file-documento.',
              'Premi Dry-run: se il riepilogo torna, premi Applica approvate.'
            ]}
          />
          <GuideCard
            title="5. Cosa succede dopo Applica"
            items={[
              'I file approvati vengono rinominati con nome standard.',
              'I file vengono spostati nella cartella/tab corretta del cantiere.',
              'Il master viene aggiornato con il link Drive del documento collegato.',
              'Le righe non approvate restano ferme e non vengono toccate.'
            ]}
          />
          <GuideCard
            title="6. Se qualcosa non torna"
            items={[
              'Se lo script dà errore permessi, ridistribuisci la Web App e autorizza Drive/Sheets.',
              'Se non trova file, controlla che siano nella cartella Documenti grezzi corretta.',
              'Se il match è dubbio, non approvare la riga: rinominala o collegala manualmente.',
              'Se hai paura di fare danni, fai sempre Dry-run prima di Applica approvate.'
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
  if (typeof result.processed === 'number') parts.push(`${result.processed} righe processate`)
  if (typeof result.success === 'number') parts.push(`${result.success} ok`)
  if (typeof result.failed === 'number') parts.push(`${result.failed} errori`)
  return parts.join(' · ')
}
