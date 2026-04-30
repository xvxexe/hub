import {
  ActivityFeed,
  AlertPanel,
  DashboardHeader,
  DataModeBadge,
  QuickActionCard,
  StatCard,
  WorkflowStepper,
} from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { RecentUploadList } from '../../components/RecentUploadList'
import { Section } from '../../components/Section'
import { StatusBadge } from '../../components/StatusBadge'
import { quotes } from '../../data/mockData'
import { mockCantieri } from '../../data/mockCantieri'
import {
  getAccountingAlerts,
  getAccountingTotals,
  getCategoryTotals,
  mockMovimentiContabili,
} from '../../data/mockMovimentiContabili'
import { getRole } from '../../lib/roles'

const documentFlow = ['Caricato', 'Da verificare', 'Confermato', 'Collegato al cantiere']
const photoFlow = ['Caricata', 'Da revisionare', 'Approvata', 'Pubblicabile sul sito']
const quoteFlow = ['Nuovo', 'Da valutare', 'Contattato', 'Accettato/Rifiutato']

export function DashboardHome({ session, fotoUploads, documentUploads }) {
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
        <AdminDashboard fotoUploads={fotoUploads} documentUploads={documentUploads} />
      ) : null}
      {session.role === 'accounting' ? <AccountingDashboard documentUploads={documentUploads} /> : null}
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

function AdminDashboard({ fotoUploads, documentUploads }) {
  const activeSites = mockCantieri.filter((cantiere) => cantiere.stato === 'attivo').length
  const openProblems = mockCantieri.reduce((total, cantiere) => total + cantiere.problemi.length, 0)
  const accountingTotals = getAccountingTotals(mockMovimentiContabili)
  const alerts = getAccountingAlerts(mockMovimentiContabili)
  const docsToCheck = documentUploads.filter((doc) => doc.stato === 'da verificare').length
  const siteAlerts = mockCantieri.flatMap((cantiere) =>
    cantiere.problemi.map((problema) => ({
      id: `${cantiere.id}-${problema.id}`,
      title: problema.titolo,
      meta: `${cantiere.nome} · ${cantiere.responsabile}`,
      status: problema.priorita,
    })),
  )
  const urgentDocs = documentUploads
    .filter((doc) => ['da verificare', 'incompleto', 'possibile duplicato'].includes(doc.stato))
    .map((doc) => ({
      id: doc.id,
      title: `${doc.tipoDocumento}: ${doc.fornitore || doc.descrizione}`,
      meta: `${doc.cantiere} · ${doc.nota || doc.fileName}`,
      status: doc.stato,
    }))

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Cantieri attivi" value={activeSites} hint="Da seguire oggi" />
        <StatCard label="Documenti da verificare" value={docsToCheck} hint="Upload e contabilità" />
        <StatCard label="Foto recenti" value={fotoUploads.length} hint="Da revisione cantiere" />
        <StatCard label="Preventivi ricevuti" value={quotes.length} hint="Pipeline commerciale" />
        <StatCard label="Spese totali mock" value={<MoneyValue value={accountingTotals.totale} />} hint="Da movimenti" />
        <StatCard label="Problemi aperti" value={openProblems} hint="Cantieri da controllare" />
      </div>

      <Section title="Cantieri attivi e problemi">
        <div className="dashboard-card-grid">
          {mockCantieri.filter((cantiere) => cantiere.stato === 'attivo').map((cantiere) => (
            <a className="dashboard-cantiere-link" href={`#/dashboard/cantieri/${cantiere.id}`} key={cantiere.id}>
              <StatusBadge>{cantiere.stato}</StatusBadge>
              <strong>{cantiere.nome}</strong>
              <small>{cantiere.responsabile} · {cantiere.avanzamento}% · {cantiere.problemi.length} problemi</small>
            </a>
          ))}
        </div>
      </Section>

      <section className="quick-actions-grid internal-padded">
        <QuickActionCard title="Apri cantieri" text="Controlla avanzamento, problemi e responsabili." href="#/dashboard/cantieri" action="Vai" />
        <QuickActionCard title="Verifica documenti" text="Rivedi fatture, FIR e caricamenti da controllare." href="#/dashboard/caricamenti" action="Controlla" />
        <QuickActionCard title="Nuovi preventivi" text="Consulta le richieste arrivate dal sito pubblico mock." href="#/dashboard/preventivi" action="Apri" />
        <QuickActionCard title="Contabilità" text="Guarda spese, IVA mock e alert amministrativi." href="#/dashboard/contabilita" action="Analizza" />
      </section>

      <div className="internal-two-column">
        <ActivityFeed
          title="Ultime attività"
          items={[
            ...fotoUploads.slice(0, 2).map((item) => ({ title: `Foto: ${item.lavorazione}`, meta: `${item.cantiere} · ${item.caricatoDa}`, status: item.stato })),
            ...documentUploads.slice(0, 2).map((item) => ({ title: `Documento: ${item.tipoDocumento}`, meta: `${item.cantiere} · ${item.fornitore}`, status: item.stato })),
            ...quotes.slice(0, 2).map((item) => ({ title: `Preventivo: ${item.client}`, meta: item.request, status: item.status })),
          ]}
        />
        <AlertPanel
          title="Alert importanti"
          alerts={[
            ...siteAlerts,
            ...urgentDocs,
            ...alerts.slice(0, 4).map((alert) => ({
              id: alert.id,
              title: alert.message,
              meta: `${alert.movimento.descrizione} · ${alert.movimento.fornitore}`,
              status: alert.movimento.statoVerifica,
            })),
          ].slice(0, 8)}
        />
      </div>

      <div className="internal-three-column">
        <WorkflowStepper title="Flusso documenti" steps={documentFlow} />
        <WorkflowStepper title="Flusso foto" steps={photoFlow} />
        <WorkflowStepper title="Flusso preventivo" steps={quoteFlow} />
      </div>
    </>
  )
}

function AccountingDashboard({ documentUploads }) {
  const documentsToCheck = documentUploads.filter((documento) => documento.stato === 'da verificare')
  const firIncomplete = mockMovimentiContabili.filter((row) => row.tipoDocumento === 'FIR' && row.statoVerifica === 'Incompleto')
  const duplicates = mockMovimentiContabili.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const transfersToLink = mockMovimentiContabili.filter((row) => row.tipoDocumento === 'Bonifico' && row.note.toLowerCase().includes('collegare'))
  const totals = getAccountingTotals(mockMovimentiContabili)
  const categoryTotals = getCategoryTotals(mockMovimentiContabili).filter((row) => row.totale > 0).slice(0, 5)
  const accountingAlerts = getAccountingAlerts(mockMovimentiContabili).map((alert) => ({
    id: alert.id,
    title: alert.message,
    meta: `${alert.movimento.fornitore} · ${alert.movimento.numeroDocumento}`,
    status: alert.movimento.statoVerifica,
  }))

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Fatture da verificare" value={documentsToCheck.length} />
        <StatCard label="Bonifici da collegare" value={transfersToLink.length} />
        <StatCard label="FIR incompleti" value={firIncomplete.length} />
        <StatCard label="Possibili duplicati" value={duplicates.length} />
        <StatCard label="IVA mock" value={<MoneyValue value={totals.iva} />} />
        <StatCard label="Documenti senza cantiere" value="0" />
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading"><h2>Spese per categoria</h2></div>
          <div className="activity-feed">
            {categoryTotals.map((item) => (
              <article className="activity-item" key={item.categoria}>
                <span />
                <div><strong>{item.categoria}</strong><small><MoneyValue value={item.totale} /></small></div>
              </article>
            ))}
          </div>
        </section>
        <ActivityFeed
          title="Ultime attività contabili"
          items={mockMovimentiContabili.slice(0, 6).map((row) => ({
            title: row.descrizione,
            meta: `${row.fornitore} · ${row.numeroDocumento}`,
            status: row.statoVerifica,
          }))}
        />
      </div>

      <AlertPanel title="Alert contabili" alerts={accountingAlerts} />
      <WorkflowStepper title="Flusso documenti amministrativi" steps={documentFlow} />
      <RecentUploadList title="Documenti recenti" type="documento" uploads={documentUploads.slice(0, 4)} />
    </>
  )
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
        <RecentUploadList title="Le mie foto recenti" type="foto" uploads={myPhotos.slice(0, 3)} />
        <RecentUploadList title="I miei documenti recenti" type="documento" uploads={myDocuments.slice(0, 3)} showAmount={false} />
      </div>
      <WorkflowStepper title="Flusso foto" steps={photoFlow} />
    </>
  )
}
