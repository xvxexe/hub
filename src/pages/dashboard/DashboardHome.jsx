import { useMemo, useState } from 'react'
import {
  ActivityFeed,
  AlertPanel,
  DashboardHeader,
  DataModeBadge,
  WorkflowStepper,
} from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { RecentUploadList } from '../../components/RecentUploadList'
import { StatusBadge } from '../../components/StatusBadge'
import { StatusDot } from '../../components/StatusDot'
import {
  getAccountingAlerts,
  getAccountingTotals,
  getCategoryTotals,
} from '../../data/mockMovimentiContabili'
import { getOfficialMasterTotals, preferOfficialCategoryTotals, preferOfficialTotals } from '../../lib/masterTotals'
import { getRole } from '../../lib/roles'

const documentFlow = ['Importato', 'Da verificare', 'Confermato', 'Collegato al cantiere']
const photoFlow = ['Caricata', 'Da revisionare', 'Approvata', 'Pubblicabile sul sito']
const quoteFlow = ['Nuovo', 'Da valutare', 'Contattato', 'Accettato/Rifiutato']

export function DashboardHome({ session, fotoUploads, documentUploads, documents = [], activities = [], estimates = [], syncState, store = null }) {
  const activeRole = getRole(session.role)
  const isSupabase = syncState?.status === 'supabase'

  return (
    <>
      <DashboardHeader
        eyebrow={isSupabase ? 'Area interna reale' : 'Area interna'}
        title={getDashboardTitle(session.role)}
        description={isSupabase
          ? 'Dati caricati da Supabase / BARCELO_ROMA_master Google Sheets.'
          : activeRole.description}
        roleLabel={activeRole.label}
      >
        <DataModeBadge>{isSupabase ? 'Dati reali Supabase' : syncState?.status === 'loading' ? 'Caricamento dati' : 'Dati locali'}</DataModeBadge>
      </DashboardHeader>

      {session.role === 'admin' ? (
        <AdminDashboard fotoUploads={fotoUploads} documentUploads={documentUploads} documents={documents} activities={activities} estimates={estimates} store={store} />
      ) : null}
      {session.role === 'accounting' ? <AccountingDashboard documentUploads={documentUploads} documents={documents} store={store} /> : null}
      {session.role === 'employee' ? (
        <EmployeeDashboard session={session} fotoUploads={fotoUploads} documentUploads={documentUploads} documents={documents} />
      ) : null}
    </>
  )
}

function getDashboardTitle(role) {
  if (role === 'accounting') return 'Dashboard contabilità'
  if (role === 'employee') return 'Dashboard dipendente'
  return 'Dashboard admin / capo'
}

function AdminDashboard({ documentUploads, documents, activities, store }) {
  const accountingRows = documents.map(documentToAccountingRow)
  const calculatedTotals = getAccountingTotals(accountingRows)
  const accountingTotals = preferOfficialTotals(store, calculatedTotals)
  const officialMaster = getOfficialMasterTotals(store)
  const docsToCheck = documentUploads.filter((doc) => doc.stato === 'da verificare').length
  const sites = useMemo(() => buildSitesFromDocuments(documents, accountingTotals), [documents, accountingTotals.totale])
  const calculatedCategoryTotals = getCategoryTotals(accountingRows).filter((row) => row.totale > 0).slice(0, 6)
  const categoryTotals = preferOfficialCategoryTotals(store, calculatedCategoryTotals).filter((row) => row.totale > 0).slice(0, 6)
  const pendingPayments = accountingRows
    .filter((row) => row.pagamento?.toLowerCase().includes('da') || row.categoria?.toLowerCase().includes('bonifici'))
    .reduce((total, row) => total + Number(row.totale || 0), 0)

  return (
    <>
      <div className="hub-priority-grid">
        <div className="hub-summary-first">
          <CostSummaryPanel total={accountingTotals.totale} categoryTotals={categoryTotals} officialMaster={officialMaster} />
        </div>

        <section className="internal-panel hub-command-panel">
          <div className="hub-command-head">
            <div>
              <span className="eyebrow">Centro controllo</span>
              <h2>Operativo oggi</h2>
              <p>Filtri, verifiche e scorciatoie nello stesso punto.</p>
            </div>
          </div>

          <label className="date-filter hub-period-control">
            <span>Periodo</span>
            <select defaultValue="current">
              <option value="current">BARCELO ROMA MASTER</option>
              <option value="all">Tutti i dati importati</option>
            </select>
          </label>

          <div className="hub-command-actions">
            <a href="#/dashboard/documenti">
              <InternalIcon name="file" size={17} />
              <span><b>Controlla documenti</b><small>{docsToCheck} da verificare</small></span>
            </a>
            <a href="#/dashboard/contabilita">
              <InternalIcon name="wallet" size={17} />
              <span><b>Apri contabilità</b><small>Righe e bonifici</small></span>
            </a>
            <a href="#/dashboard/contabilita">
              <InternalIcon name="plus" size={17} />
              <span><b>Nuova spesa</b><small>Form reale in contabilità</small></span>
            </a>
          </div>
        </section>
      </div>

      <div className="hub-kpi-strip" aria-label="Indicatori principali">
        <MiniKpi icon="building" label="Cantieri" value={sites.length} hint="Fonte Supabase" />
        <MiniKpi icon="file" label="Da controllare" value={docsToCheck} hint={`${documents.length} righe operative`} tone="amber" />
        <MiniKpi icon="wallet" label="Totale spese" value={<MoneyValue value={accountingTotals.totale} />} hint={officialMaster ? 'Da master' : 'Calcolato'} tone="green" />
        <MiniKpi icon="calendar" label="Pagamenti" value={<MoneyValue value={pendingPayments} />} hint="Da classificare" tone="purple" />
      </div>

      <div className="hub-workspace-grid">
        <section className="internal-panel hub-panel-wide hub-documents-panel">
          <PanelTitle title="Documenti recenti da lavorare" actionHref="#/dashboard/documenti" />
          <div className="hub-table">
            <div className="hub-table-head hub-doc-row">
              <span>Documento</span><span>Cantiere</span><span>Origine</span><span>Data</span><span>Stato</span>
            </div>
            {documentUploads.slice(0, 5).map((doc) => {
              const documentStatus = normalizeDocumentStatus(doc.stato)
              return (
                <a className="hub-table-row hub-doc-row" href={`#/dashboard/documenti/${doc.id}`} key={doc.id}>
                  <strong>{doc.fileName}</strong>
                  <span>{doc.cantiere}</span>
                  <span>{doc.caricatoDa}</span>
                  <span>{doc.dataCaricamento}</span>
                  <span className="desktop-status-cell"><StatusBadge>{documentStatus}</StatusBadge></span>
                  <StatusDot status={documentStatus} className="mobile-status-dot" />
                </a>
              )
            })}
          </div>
        </section>

        <div className="hub-side-stack">
          <section className="internal-panel site-progress-panel">
            <PanelTitle title="Cantieri" actionHref="#/dashboard/cantieri" />
            <div className="site-progress-list">
              {sites.map((cantiere) => (
                <a className="site-progress-row" href={`#/dashboard/cantieri/${cantiere.id}`} key={cantiere.id}>
                  <div className="site-progress-main">
                    <strong>{cantiere.nome}</strong>
                    <small>{cantiere.localita}</small>
                  </div>
                  <div className="site-progress-meter">
                    <ProgressBar value={cantiere.avanzamento} />
                  </div>
                  <div className="site-progress-meta">
                    <StatusDot status={cantiere.statoLabel} label={cantiere.statoLabel} />
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="internal-panel hub-imported-panel">
            <PanelTitle title="Ultime righe operative" actionHref="#/dashboard/contabilita" />
            <div className="compact-upload-list">
              {documents.slice(0, 4).map((document) => (
                <article className="compact-upload-row" key={document.id}>
                  <span className="file-chip file-pdf">TAB</span>
                  <div>
                    <strong>{document.numeroDocumento ?? document.descrizione}</strong>
                    <small>{document.categoria}</small>
                  </div>
                  <span><MoneyValue value={document.totale ?? document.importoTotale ?? 0} /></span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="hub-activity-row hub-activity-compact">
        <ActivityFeed title="Attività recenti" items={(activities.length ? activities : []).slice(0, 5).map((item) => ({
          title: item.description,
          meta: `${item.author ?? 'Sistema'} · ${item.date ?? ''}`,
          status: item.type,
        }))} />
      </div>

      <FloatingQuickActions />

      <div className="internal-three-column workflow-desktop-only">
        <WorkflowStepper title="Flusso documenti" steps={documentFlow} />
        <WorkflowStepper title="Flusso foto" steps={photoFlow} />
        <WorkflowStepper title="Flusso preventivo" steps={quoteFlow} />
      </div>
    </>
  )
}

function PanelTitle({ title, actionHref }) {
  return (
    <div className="section-heading panel-title-row">
      <h2>{title}</h2>
      {actionHref ? <a className="button button-secondary button-small" href={actionHref}>Vedi tutti</a> : null}
    </div>
  )
}

function FloatingQuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { icon: 'upload', label: 'Carica documento', hint: 'Apri upload', href: '#/dashboard/upload' },
    { icon: 'wallet', label: 'Nuova spesa', hint: 'Form reale', href: '#/dashboard/contabilita' },
    { icon: 'report', label: 'Report', hint: 'Riepilogo', href: '#/dashboard/report' },
  ]

  return (
    <div className={isOpen ? 'floating-actions open' : 'floating-actions'}>
      {isOpen ? <button aria-label="Chiudi azioni rapide" className="floating-actions-backdrop" type="button" onClick={() => setIsOpen(false)} /> : null}
      <div className="floating-actions-menu" aria-hidden={!isOpen}>
        <strong>Azioni rapide</strong>
        <div>
          {actions.map((item) => (
            <a href={item.href} key={item.label} onClick={() => setIsOpen(false)}>
              <InternalIcon name={item.icon} size={18} />
              <span><b>{item.label}</b><small>{item.hint}</small></span>
            </a>
          ))}
        </div>
      </div>
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Chiudi azioni rapide' : 'Apri azioni rapide'}
        className="floating-actions-trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <InternalIcon name={isOpen ? 'check' : 'plus'} size={22} />
      </button>
    </div>
  )
}

function normalizeDocumentStatus(status) {
  if (status === 'da verificare') return 'Da controllare'
  if (status === 'possibile duplicato') return 'Duplicato'
  return status
}

function MiniKpi({ icon, label, value, hint, tone = 'blue' }) {
  return (
    <article className={`hub-mini-kpi hub-mini-kpi-${tone}`}>
      <span className="hub-mini-kpi-icon"><InternalIcon name={icon} size={17} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  )
}

function CostSummaryPanel({ total, categoryTotals, officialMaster }) {
  return (
    <section className="internal-panel cost-card-redesign">
      <div className="cost-card-head">
        <div>
          <span className="eyebrow">Spese</span>
          <h2>Riepilogo spese</h2>
          <p>{officialMaster ? 'Totali ufficiali letti dal master Google Sheets.' : 'Vista compatta per capire subito dove stanno andando i costi.'}</p>
        </div>
        <a className="button button-secondary button-small" href="#/dashboard/contabilita">Dettaglio</a>
      </div>

      <div className="cost-summary cost-summary-redesign">
        <div className="cost-total-block">
          <span>Totale costi</span>
          <strong><MoneyValue value={total} /></strong>
          <small className="positive-trend">{officialMaster ? 'Da tab Riepilogo' : 'Dati reali importati'}</small>
        </div>
        <div className="donut-chart" aria-label="Ripartizione costi">
          <span>Totale<br /><MoneyValue value={total} /></span>
        </div>
      </div>

      <div className="cost-legend cost-legend-redesign">
        {categoryTotals.map((item) => (
          <div key={item.categoria}>
            <span />
            <strong>{item.categoria}</strong>
            <small><MoneyValue value={item.totale} /></small>
          </div>
        ))}
      </div>
    </section>
  )
}

function AccountingDashboard({ documentUploads, documents, store }) {
  const accountingRows = documents.map(documentToAccountingRow)
  const documentsToCheck = documentUploads.filter((documento) => documento.stato === 'da verificare')
  const firIncomplete = accountingRows.filter((row) => row.tipoDocumento === 'FIR' && row.statoVerifica === 'Incompleto')
  const duplicates = accountingRows.filter((row) => row.statoVerifica === 'Possibile duplicato')
  const transfersToLink = accountingRows.filter((row) => row.tipoDocumento === 'Bonifico' && row.note.toLowerCase().includes('collegare'))
  const documentsWithoutSite = accountingRows.filter((row) => !row.cantiereId)
  const totals = preferOfficialTotals(store, getAccountingTotals(accountingRows))
  const categoryTotals = preferOfficialCategoryTotals(store, getCategoryTotals(accountingRows)).filter((row) => row.totale > 0).slice(0, 5)
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
        <MiniKpi label="Fatture da verificare" value={documentsToCheck.length} />
        <MiniKpi label="Bonifici da collegare" value={transfersToLink.length} />
        <MiniKpi label="FIR incompleti" value={firIncomplete.length} />
        <MiniKpi label="Possibili duplicati" value={duplicates.length} />
        <MiniKpi label="IVA" value={<MoneyValue value={totals.iva} />} />
        <MiniKpi label="Documenti senza cantiere" value={documentsWithoutSite.length} />
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

function EmployeeDashboard({ session, fotoUploads, documentUploads, documents }) {
  const sites = buildSitesFromDocuments(documents)
  const myPhotos = fotoUploads.filter((upload) => upload.caricatoDa === session.name)
  const myDocuments = documentUploads.filter((upload) => upload.caricatoDa === session.name)

  return (
    <>
      <section className="employee-action-panel employee-action-panel-strong">
        <label>
          Scegli cantiere
          <select defaultValue={sites[0]?.id ?? 'barcelo-roma'}>
            {sites.map((cantiere) => (
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
          <textarea rows="4" placeholder="Scrivi una nota operativa" />
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

function buildSitesFromDocuments(documents, officialTotals = null) {
  const groups = documents.reduce((acc, document) => {
    const id = document.cantiereId ?? 'barcelo-roma'
    const name = document.cantiere ?? 'Barcelò Roma'
    if (!acc[id]) {
      acc[id] = {
        id,
        nome: name,
        localita: id === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da Google Sheets',
        statoLabel: 'In corso',
        totale: 0,
        movimenti: 0,
      }
    }
    acc[id].totale += Number(document.totale || document.importoTotale || 0)
    acc[id].movimenti += Number(document.movimentiCount || 1)
    return acc
  }, {})

  const sites = Object.values(groups)
  if (officialTotals?.isOfficialMaster && sites.length === 1) {
    return [{ ...sites[0], totale: officialTotals.totale, avanzamento: 100 }]
  }

  const maxTotal = Math.max(...sites.map((site) => site.totale), 1)
  return sites.map((site) => ({
    ...site,
    avanzamento: Math.max(5, Math.round((site.totale / maxTotal) * 100)),
  }))
}
