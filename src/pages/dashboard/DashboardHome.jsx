import { useState } from 'react'
import {
  ActivityFeed,
  AlertPanel,
  DashboardHeader,
  DataModeBadge,
  MockActionModal,
  QuickActionCard,
  StatCard,
  WorkflowStepper,
} from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { RecentUploadList } from '../../components/RecentUploadList'
import { StatusBadge } from '../../components/StatusBadge'
import { mockCantieri } from '../../data/mockCantieri'
import {
  costBreakdown,
  recentWhatsAppUploads,
  reminders,
} from '../../data/mockHubData'
import {
  getAccountingAlerts,
  getAccountingTotals,
  getCategoryTotals,
} from '../../data/mockMovimentiContabili'
import { getRole } from '../../lib/roles'

const documentFlow = ['Caricato', 'Da verificare', 'Confermato', 'Collegato al cantiere']
const photoFlow = ['Caricata', 'Da revisionare', 'Approvata', 'Pubblicabile sul sito']
const quoteFlow = ['Nuovo', 'Da valutare', 'Contattato', 'Accettato/Rifiutato']

export function DashboardHome({ session, fotoUploads, documentUploads, documents = [], activities = [], estimates = [] }) {
  const activeRole = getRole(session.role)

  return (
    <>
      <DashboardHeader
        eyebrow="Area interna mock"
        title={getDashboardTitle(session.role)}
        description={activeRole.description}
        roleLabel={activeRole.label}
      >
        <DataModeBadge />
      </DashboardHeader>

      {session.role === 'admin' ? (
        <AdminDashboard fotoUploads={fotoUploads} documentUploads={documentUploads} documents={documents} activities={activities} estimates={estimates} />
      ) : null}
      {session.role === 'accounting' ? <AccountingDashboard documentUploads={documentUploads} documents={documents} /> : null}
      {session.role === 'employee' ? (
        <EmployeeDashboard session={session} fotoUploads={fotoUploads} documentUploads={documentUploads} />
      ) : null}
    </>
  )
}

function getDashboardTitle(role) {
  if (role === 'accounting') return 'Dashboard contabilità'
  if (role === 'employee') return 'Dashboard dipendente'
  return 'Dashboard admin / capo'
}

function AdminDashboard({ documentUploads, documents }) {
  const [modalAction, setModalAction] = useState(null)
  const activeSites = mockCantieri.filter((cantiere) => cantiere.stato === 'attivo').length
  const accountingRows = documents.map(documentToAccountingRow)
  const accountingTotals = getAccountingTotals(accountingRows)
  const docsToCheck = documentUploads.filter((doc) => doc.stato === 'da verificare').length

  return (
    <>
      <div className="hub-toolbar">
        <label className="date-filter">
          <span>Periodo</span>
          <select defaultValue="week">
            <option value="week">15 - 22 Maggio 2026</option>
            <option value="month">Questo mese</option>
            <option value="quarter">Questo trimestre</option>
          </select>
        </label>
      </div>

      <div className="stats-grid hub-kpi-grid">
        <StatCard icon="building" label="Totale cantieri attivi" value={activeSites} hint="+2 rispetto alla settimana scorsa" />
        <StatCard icon="file" tone="amber" label="Documenti da controllare" value={docsToCheck} hint="+6 rispetto alla settimana scorsa" />
        <StatCard icon="wallet" tone="green" label="Spese del mese" value={<MoneyValue value={accountingTotals.totale} />} hint="-8,4% rispetto al mese scorso" />
        <StatCard icon="calendar" tone="purple" label="Pagamenti in attesa" value={<MoneyValue value={56230.4} />} hint="5 pagamenti" />
      </div>

      <div className="hub-dashboard-grid">
        <section className="internal-panel hub-panel-wide">
          <PanelTitle title="Attività documenti recenti" actionHref="#/dashboard/documenti" />
          <div className="hub-table">
            <div className="hub-table-head hub-doc-row">
              <span>Documento</span><span>Cantiere</span><span>Caricato da</span><span>Data</span><span>Stato</span>
            </div>
            {documentUploads.slice(0, 5).map((doc) => (
              <a className="hub-table-row hub-doc-row" href={`#/dashboard/documenti/${doc.id}`} key={doc.id}>
                <strong>{doc.fileName}</strong>
                <span>{doc.cantiere}</span>
                <span>{doc.caricatoDa}</span>
                <span>{doc.dataCaricamento}</span>
                <StatusBadge>{normalizeDocumentStatus(doc.stato)}</StatusBadge>
              </a>
            ))}
          </div>
          <a className="text-link" href="#/dashboard/documenti">Vedi tutti i documenti</a>
        </section>

        <section className="internal-panel">
          <PanelTitle title="Andamento cantieri" actionHref="#/dashboard/cantieri" />
          <div className="site-progress-list">
            {mockCantieri.slice(0, 5).map((cantiere) => (
              <a className="site-progress-row" href={`#/dashboard/cantieri/${cantiere.id}`} key={cantiere.id}>
                <div>
                  <strong>{cantiere.nome}</strong>
                  <small>{cantiere.localita}</small>
                </div>
                <ProgressBar value={cantiere.avanzamento} />
                <StatusBadge>{cantiere.stato === 'attivo' ? 'In corso' : cantiere.stato}</StatusBadge>
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="internal-two-column">
        <CostSummaryPanel total={accountingTotals.totale} />
        <ActivityFeed title="Attività e promemoria" items={reminders.map((item) => ({
          title: item.title,
          meta: `${item.site} · ${item.due}`,
          status: item.priority,
        }))} />
      </div>

      <div className="internal-two-column hub-lower-grid">
        <section className="internal-panel">
          <PanelTitle title="Ultimi caricamenti da WhatsApp" actionHref="#/dashboard/caricamenti" />
          <div className="compact-upload-list">
            {recentWhatsAppUploads.map((upload) => (
              <article className="compact-upload-row" key={upload.id}>
                <span className={`file-chip file-${upload.type}`}>{upload.type === 'pdf' ? 'PDF' : 'IMG'}</span>
                <div>
                  <strong>{upload.fileName}</strong>
                  <small>{upload.cantiere}</small>
                </div>
                <span>{upload.date}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="internal-panel">
          <PanelTitle title="Azioni rapide" />
          <div className="quick-actions-grid quick-actions-compact">
            <QuickActionCard icon="upload" title="Carica documento" text="Upload mock" href="#/dashboard/upload" action="Apri" />
            <QuickActionCard icon="building" title="Nuovo cantiere" text="Scheda mock" action="Crea" onClick={() => setModalAction(mockActions.newSite)} />
            <QuickActionCard icon="wallet" title="Nuova spesa" text="Movimento mock" action="Inserisci" onClick={() => setModalAction(mockActions.newExpense)} />
            <QuickActionCard icon="estimate" title="Crea preventivo" text="Pipeline mock" action="Crea" onClick={() => setModalAction(mockActions.newEstimate)} />
            <QuickActionCard icon="report" title="Report PDF" text="Anteprima mock" action="Genera" onClick={() => setModalAction(mockActions.report)} />
          </div>
        </section>
      </div>

      <div className="internal-three-column workflow-desktop-only">
        <WorkflowStepper title="Flusso documenti" steps={documentFlow} />
        <WorkflowStepper title="Flusso foto" steps={photoFlow} />
        <WorkflowStepper title="Flusso preventivo" steps={quoteFlow} />
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

const mockActions = {
  newSite: {
    icon: 'building',
    title: 'Nuovo cantiere mock',
    text: 'Crea una scheda cantiere dimostrativa. Nessun dato viene inviato a un backend reale.',
    confirmLabel: 'Crea cantiere',
    fields: [
      { label: 'Nome cantiere', placeholder: 'Es. Hotel Garda' },
      { label: 'Responsabile', type: 'select', options: ['Gianni Europa', 'Marco Ferri', 'Sara Costa'] },
    ],
  },
  newExpense: {
    icon: 'wallet',
    title: 'Nuova spesa mock',
    text: 'Registra una spesa dimostrativa collegabile alla contabilità mock.',
    confirmLabel: 'Inserisci spesa',
    fields: [
      { label: 'Fornitore', placeholder: 'Es. Eurofer' },
      { label: 'Importo', type: 'number', placeholder: '0,00' },
    ],
  },
  newEstimate: {
    icon: 'estimate',
    title: 'Crea preventivo mock',
    text: 'Apre una bozza preventivo dimostrativa per preparare la futura pipeline commerciale.',
    confirmLabel: 'Crea preventivo',
    fields: [
      { label: 'Cliente', placeholder: 'Nome cliente' },
      { label: 'Tipo lavoro', type: 'select', options: ['Cartongesso', 'Finiture interne', 'Ristrutturazione tecnica'] },
    ],
  },
  report: {
    icon: 'report',
    title: 'Report PDF mock',
    text: 'Genera una conferma dimostrativa. Il PDF reale resta non implementato come previsto dalla roadmap.',
    confirmLabel: 'Genera anteprima',
  },
}

function PanelTitle({ title, actionHref }) {
  return (
    <div className="section-heading panel-title-row">
      <h2>{title}</h2>
      {actionHref ? <a className="button button-secondary button-small" href={actionHref}>Vedi tutti</a> : null}
    </div>
  )
}

function normalizeDocumentStatus(status) {
  if (status === 'da verificare') return 'Da controllare'
  if (status === 'possibile duplicato') return 'Duplicato'
  return status
}

function CostSummaryPanel({ total }) {
  return (
    <section className="internal-panel">
      <PanelTitle title="Riepilogo costi" />
      <div className="cost-summary">
        <div>
          <span>Totale costi</span>
          <strong><MoneyValue value={total} /></strong>
          <small className="positive-trend">-8,4% rispetto al mese scorso</small>
        </div>
        <div className="donut-chart" aria-label="Ripartizione costi">
          <span>Totale<br /><MoneyValue value={total} /></span>
        </div>
        <div className="cost-legend">
          {costBreakdown.map((item) => (
            <div key={item.label}>
              <span style={{ background: item.color }} />
              <strong>{item.label}</strong>
              <small><MoneyValue value={item.value} /> · {item.percent}%</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AccountingDashboard({ documentUploads, documents }) {
  const accountingRows = documents.map(documentToAccountingRow)
  const documentsToCheck = documentUploads.filter((documento) => documento.stato === 'da verificare')
  const firIncomplete = accountingRows.filter((row) => row.tipoDocumento === 'FIR' && row.statoVerifica === 'Incompleto')
  const duplicates = accountingRows.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const transfersToLink = accountingRows.filter((row) => row.tipoDocumento === 'Bonifico' && row.note.toLowerCase().includes('collegare'))
  const documentsWithoutSite = accountingRows.filter((row) => !row.cantiereId)
  const totals = getAccountingTotals(accountingRows)
  const categoryTotals = getCategoryTotals(accountingRows).filter((row) => row.totale > 0).slice(0, 5)
  const accountingAlerts = getAccountingAlerts(accountingRows).map((alert) => ({
    id: alert.id,
    title: alert.message,
    meta: `${alert.movimento.fornitore} · ${alert.movimento.numeroDocumento}`,
    status: alert.movimento.statoVerifica,
    href: `#/dashboard/contabilita/${alert.movimento.id}`,
  }))

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Fatture da verificare" value={documentsToCheck.length} />
        <StatCard label="Bonifici da collegare" value={transfersToLink.length} />
        <StatCard label="FIR incompleti" value={firIncomplete.length} />
        <StatCard label="Possibili duplicati" value={duplicates.length} />
        <StatCard label="IVA mock" value={<MoneyValue value={totals.iva} />} />
        <StatCard label="Documenti senza cantiere" value={documentsWithoutSite.length} />
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading"><h2>Spese per categoria</h2></div>
          <div className="activity-feed">
            {categoryTotals.map((item) => (
              <a className="activity-item interactive-row" href="#/dashboard/contabilita" key={item.categoria}>
                <span />
                <div><strong>{item.categoria}</strong><small><MoneyValue value={item.totale} /></small></div>
              </a>
            ))}
          </div>
        </section>
        <ActivityFeed
          title="Ultime attività contabili"
          items={accountingRows.slice(0, 6).map((row) => ({
            title: row.descrizione,
            meta: `${row.fornitore} · ${row.numeroDocumento}`,
            status: row.statoVerifica,
            href: `#/dashboard/contabilita/${row.id}`,
          }))}
        />
      </div>

      <AlertPanel title="Alert contabili" alerts={accountingAlerts} />
      <WorkflowStepper title="Flusso documenti amministrativi" steps={documentFlow} />
      <RecentUploadList title="Documenti recenti" type="documento" uploads={documentUploads} />
    </>
  )
}

function documentToAccountingRow(document) {
  return {
    id: document.id,
    cantiereId: document.cantiereId,
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento,
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    tipoDocumento: document.tipoDocumento,
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? 'Non indicato',
    statoVerifica: document.statoVerifica,
    documentoCollegato: document.fileName,
    note: document.note ?? document.nota ?? '',
  }
}

function EmployeeDashboard({ session, fotoUploads, documentUploads }) {
  const myPhotos = fotoUploads.filter((upload) => upload.caricatoDa === session.name)
  const myDocuments = documentUploads.filter((upload) => upload.caricatoDa === session.name)

  return (
    <>
      <section className="employee-action-panel employee-action-panel-strong">
        <label>
          Scegli cantiere
          <select defaultValue={mockCantieri[0].id}>
            {mockCantieri.map((cantiere) => (
              <option key={cantiere.id} value={cantiere.id}>{cantiere.nome}</option>
            ))}
          </select>
        </label>
        <div className="employee-actions">
          <a className="button button-primary" href="#/dashboard/upload">Carica foto</a>
          <a className="button button-secondary" href="#/dashboard/upload">Carica documento</a>
          <a className="button button-secondary" href="#/dashboard/caricamenti">I miei caricamenti</a>
        </div>
        <label>
          Nota rapida
          <textarea rows="4" placeholder="Scrivi una nota operativa mock" />
        </label>
      </section>

      <div className="internal-two-column">
        <RecentUploadList title="Le mie foto recenti" type="foto" uploads={myPhotos} />
        <RecentUploadList title="I miei documenti recenti" type="documento" uploads={myDocuments} showAmount={false} />
      </div>
      <WorkflowStepper title="Flusso foto" steps={photoFlow} />
    </>
  )
}
