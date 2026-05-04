import { useMemo, useState } from 'react'
import { ActivityFeed, DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

const tabs = ['Panoramica', 'Lavorazioni', 'Documenti', 'Contabilità', 'Report']

export function CantiereDetail({ cantiereId, documents = [], fotoUploads = [], documentUploads = [], session }) {
  const [activeTab, setActiveTab] = useState('Panoramica')
  const [modalAction, setModalAction] = useState(null)
  const siteDocuments = useMemo(() => documents.filter((document) => (document.cantiereId ?? 'barcelo-roma') === cantiereId), [documents, cantiereId])
  const cantiere = useMemo(() => buildCantiere(cantiereId, siteDocuments), [cantiereId, siteDocuments])

  if (!cantiere) {
    return (
      <section className="dashboard-header">
        <p className="eyebrow">Cantiere non trovato</p>
        <h1>Il cantiere richiesto non esiste nei dati Supabase</h1>
        <p>Controlla la lista cantieri reali importati dal master Google Sheets.</p>
        <a className="button button-secondary" href="#/dashboard/cantieri">Torna ai cantieri</a>
      </section>
    )
  }

  const canViewEconomics = session?.role !== 'employee'
  const availableTabs = canViewEconomics ? tabs : tabs.filter((tab) => tab !== 'Contabilità' && tab !== 'Report')
  const currentTab = availableTabs.includes(activeTab) ? activeTab : 'Panoramica'
  const linkedFotoUploads = fotoUploads.filter((upload) => upload.cantiereId === cantiere.id)
  const linkedDocumentUploads = documentUploads.filter((upload) => upload.cantiereId === cantiere.id)
  const accountingRows = siteDocuments.map(toAccountingRow)
  const accountingTotals = getTotals(accountingRows)
  const categoryTotals = getCategoryTotals(accountingRows)
  const lavorazioni = getWorkPackages(siteDocuments)
  const pendingRows = accountingRows.filter((row) => ['Da verificare', 'Incompleto', 'Possibile duplicato'].includes(row.statoVerifica))

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio cantiere reale"
        title={`Cantiere - ${cantiere.nome}`}
        description="Vista operativa coerente con la dashboard: costi, controlli e documenti principali nello stesso flusso."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-secondary" href="#/dashboard/cantieri">Lista cantieri</a>
        <button className="button button-primary" type="button" onClick={() => setModalAction(reportAction(cantiere))}>Report PDF</button>
      </DashboardHeader>

      <div className="hub-priority-grid">
        <CostSplitPanel accountingTotals={accountingTotals} categoryTotals={categoryTotals} />
        <section className="internal-panel hub-command-panel">
          <div className="hub-command-head">
            <div>
              <span className="eyebrow">Centro cantiere</span>
              <h2>{cantiere.cliente}</h2>
              <p>{cantiere.indirizzo} · {cantiere.localita}</p>
            </div>
          </div>
          <div className="hub-command-actions">
            <a href="#/dashboard/upload"><InternalIcon name="upload" size={17} /><span><b>Carica documento</b><small>Foto, fatture e ricevute</small></span></a>
            <a href="#/dashboard/documenti"><InternalIcon name="file" size={17} /><span><b>Documenti cantiere</b><small>{siteDocuments.length} righe importate</small></span></a>
            <a href="#/dashboard/contabilita"><InternalIcon name="wallet" size={17} /><span><b>Contabilità</b><small><MoneyValue value={accountingTotals.totale} /></small></span></a>
          </div>
        </section>
      </div>

      <section className="hub-kpi-strip" aria-label="Indicatori cantiere">
        <MiniKpi icon="building" label="Responsabile" value={cantiere.responsabile} hint="Cantiere attivo" />
        <MiniKpi icon="file" label="Righe" value={siteDocuments.length} hint="Importate" tone="amber" />
        <MiniKpi icon="calendar" label="Movimenti" value={String(siteDocuments.reduce((sum, doc) => sum + Number(doc.movimentiCount || 1), 0))} hint="Totali" tone="purple" />
        {canViewEconomics ? <MiniKpi icon="wallet" label="Totale spese" value={<MoneyValue value={accountingTotals.totale} />} hint="Master" tone="green" /> : null}
      </section>

      <section className="detail-tabs" aria-label="Sezioni dettaglio cantiere">
        {availableTabs.map((tab) => (
          <button aria-pressed={currentTab === tab} key={tab} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </section>

      {currentTab === 'Panoramica' ? (
        <OverviewTab
          documents={siteDocuments}
          lavorazioni={lavorazioni}
          pendingRows={pendingRows}
          linkedDocumentUploads={linkedDocumentUploads}
          linkedFotoUploads={linkedFotoUploads}
          categoryTotals={categoryTotals}
          accountingTotals={accountingTotals}
        />
      ) : null}
      {currentTab === 'Lavorazioni' ? <div className="hub-workspace-grid"><WorkPackages lavorazioni={lavorazioni} /></div> : null}
      {currentTab === 'Documenti' ? <div className="hub-workspace-grid"><DocumentsTab documents={siteDocuments} /></div> : null}
      {currentTab === 'Contabilità' ? <AccountingTab accountingRows={accountingRows} accountingTotals={accountingTotals} /> : null}
      {currentTab === 'Report' ? <ReportTab cantiere={cantiere} accountingTotals={accountingTotals} categoryTotals={categoryTotals} pendingRows={pendingRows} /> : null}

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function MiniKpi({ icon, label, value, hint, tone = 'blue' }) {
  return (
    <article className={`hub-mini-kpi hub-mini-kpi-${tone}`}>
      <span className="hub-mini-kpi-icon"><InternalIcon name={icon} size={17} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>
    </article>
  )
}

function OverviewTab({ documents, lavorazioni, pendingRows, linkedDocumentUploads, linkedFotoUploads, categoryTotals, accountingTotals }) {
  return (
    <>
      <div className="hub-workspace-grid">
        <WorkPackages lavorazioni={lavorazioni} />
        <div className="hub-side-stack">
          <MaterialsPanel categoryTotals={categoryTotals} total={accountingTotals.totale} />
          <SideOperationalPanels pendingRows={pendingRows} documents={documents} />
        </div>
      </div>
      <div className="hub-workspace-grid">
        <RecentDocuments documents={documents} />
        <div className="hub-side-stack">
          <RecentPayments documents={documents} />
          <ActivityFeed
            title="Timeline attività"
            items={[
              ...documents.slice(0, 4).map((item) => ({ title: `${item.numeroDocumento ?? item.descrizione}`, meta: `${item.categoria ?? 'Categoria'} · ${formatDate(item.dataDocumento)}`, status: item.statoVerifica })),
              ...linkedDocumentUploads.slice(0, 2).map((item) => ({ title: `Caricato ${item.tipoDocumento}`, meta: `${item.fornitore} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
              ...linkedFotoUploads.slice(0, 2).map((item) => ({ title: 'Foto caricata', meta: `${item.zona ?? item.cantiere} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
            ]}
          />
        </div>
      </div>
    </>
  )
}

function CostSplitPanel({ accountingTotals, categoryTotals }) {
  return (
    <section className="internal-panel cost-card-redesign">
      <div className="cost-card-head">
        <div><span className="eyebrow">Spese</span><h2>Riepilogo costi per categoria</h2><p>Totale e categorie principali del cantiere.</p></div>
      </div>
      <div className="cost-summary cost-summary-redesign">
        <div className="cost-total-block"><span>Totale spese</span><strong><MoneyValue value={accountingTotals.totale} /></strong><small className="positive-trend">Da BARCELO_ROMA_master</small></div>
        <div className="donut-chart"><span>Totale<br /><MoneyValue value={accountingTotals.totale} /></span></div>
      </div>
      <div className="cost-legend cost-legend-redesign">
        {categoryTotals.slice(0, 6).map((item) => <div key={item.categoria}><span /><strong>{item.categoria}</strong><small><MoneyValue value={item.totale} /></small></div>)}
      </div>
    </section>
  )
}

function MaterialsPanel({ categoryTotals, total }) {
  const materialCategories = ['Materiali', 'FIR / Rifiuti', 'Noleggi / Servizi']
  const materials = categoryTotals.filter((item) => materialCategories.includes(item.categoria) || item.categoria?.toLowerCase().includes('material')).reduce((sum, item) => sum + item.totale, 0)
  const nonMaterials = Math.max(0, total - materials)
  const percent = total > 0 ? Math.round((materials / total) * 1000) / 10 : 0
  return (
    <section className="internal-panel">
      <div className="section-heading panel-title-row"><h2>Materiali vs non materiali</h2></div>
      <div className="compact-upload-list">
        <article className="compact-upload-row"><span className="file-chip file-pdf">MAT</span><div><strong><MoneyValue value={materials} /></strong><small>{percent}% del totale</small></div></article>
        <article className="compact-upload-row"><span className="file-chip file-pdf">NON</span><div><strong><MoneyValue value={nonMaterials} /></strong><small>{Math.round((100 - percent) * 10) / 10}% del totale</small></div></article>
      </div>
    </section>
  )
}

function SideOperationalPanels({ pendingRows, documents }) {
  const missingFiles = documents.filter((item) => String(item.note ?? '').toLowerCase().includes('manca') || item.statoVerifica === 'Incompleto')
  const toClassify = documents.filter((item) => String(item.categoria ?? '').toLowerCase().includes('classificare'))
  const alerts = [
    ...missingFiles.map((item) => ({ id: `missing-${item.id}`, title: item.numeroDocumento ?? item.descrizione, detail: item.note ?? 'Documento da verificare', status: 'Da controllare' })),
    ...toClassify.map((item) => ({ id: `classify-${item.id}`, title: item.numeroDocumento ?? item.descrizione, detail: item.categoria, status: 'Da classificare' })),
    ...pendingRows.map((item) => ({ id: `pending-${item.id}`, title: item.descrizione, detail: item.fornitore, status: item.statoVerifica })),
  ]
  return (
    <section className="internal-panel">
      <div className="section-heading panel-title-row"><h2>Controlli aperti</h2></div>
      <div className="activity-feed">
        {alerts.slice(0, 5).map((item) => <article className="activity-item" key={item.id}><span /><div><strong>{item.title}</strong><small>{item.detail}</small></div><StatusBadge>{item.status}</StatusBadge></article>)}
        {alerts.length === 0 ? <p>Nessun controllo aperto nei dati importati.</p> : null}
      </div>
    </section>
  )
}

function WorkPackages({ lavorazioni }) {
  return (
    <section className="internal-panel hub-panel-wide hub-documents-panel">
      <div className="section-heading panel-title-row"><h2>Lavorazioni principali</h2><a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi contabilità</a></div>
      <div className="hub-table">
        <div className="hub-table-head hub-doc-row"><span>Lavorazione</span><span>Stato</span><span>Incidenza</span><span>Movimenti</span><span>Speso</span></div>
        {lavorazioni.map((item) => <article className="hub-table-row hub-doc-row" key={item.name}><strong>{item.name}</strong><span><StatusBadge>{item.status}</StatusBadge></span><span><ProgressBar value={item.progress} /></span><span>{item.movimenti}</span><span><MoneyValue value={item.spent} /></span></article>)}
      </div>
    </section>
  )
}

function RecentDocuments({ documents }) {
  return (
    <section className="internal-panel hub-panel-wide hub-documents-panel">
      <div className="section-heading panel-title-row"><h2>Ultimi documenti</h2><a className="button button-secondary button-small" href="#/dashboard/documenti">Vedi tutti</a></div>
      <div className="hub-table">
        {documents.slice(0, 5).map((doc) => <a className="hub-table-row hub-doc-row" href={`#/dashboard/documenti/${doc.id}`} key={doc.id}><strong>{doc.tipoDocumento}</strong><span>{doc.numeroDocumento ?? doc.fornitore}</span><span>{doc.categoria}</span><span><MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></span><span><StatusBadge>{doc.statoVerifica}</StatusBadge></span></a>)}
      </div>
    </section>
  )
}

function RecentPayments({ documents }) {
  const payments = documents.filter((document) => String(document.pagamento ?? '').toLowerCase().includes('bonifico') || String(document.categoria ?? '').toLowerCase().includes('bonifici'))
  const rows = payments.length ? payments : documents
  return (
    <section className="internal-panel">
      <div className="section-heading panel-title-row"><h2>Pagamenti / Bonifici</h2><a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi tutti</a></div>
      <div className="compact-upload-list">
        {rows.slice(0, 5).map((payment) => <article className="compact-upload-row" key={payment.id}><span className="file-chip file-pdf">€</span><div><strong>{payment.fornitore}</strong><small>{formatDate(payment.dataDocumento)} · {payment.numeroDocumento}</small></div><span><MoneyValue value={payment.totale ?? payment.importoTotale ?? 0} /></span></article>)}
      </div>
    </section>
  )
}

function DocumentsTab({ documents }) {
  return <RecentDocuments documents={documents} />
}

function AccountingTab({ accountingRows, accountingTotals }) {
  return (
    <>
      <section className="hub-kpi-strip">
        <MiniKpi icon="wallet" label="Imponibile" value={<MoneyValue value={accountingTotals.imponibile} />} hint="Totale" />
        <MiniKpi icon="wallet" label="IVA" value={<MoneyValue value={accountingTotals.iva} />} hint="Totale" tone="amber" />
        <MiniKpi icon="wallet" label="Complessivo" value={<MoneyValue value={accountingTotals.totale} />} hint="Totale" tone="green" />
        <MiniKpi icon="file" label="Da verificare" value={accountingTotals.daVerificare} hint="Documenti" tone="purple" />
      </section>
      <div className="hub-workspace-grid"><section className="internal-panel hub-panel-wide hub-documents-panel"><div className="hub-table">{accountingRows.map((movimento) => <div className="hub-table-row hub-doc-row" key={movimento.id}><strong>{movimento.descrizione}</strong><span>{movimento.fornitore}</span><span>{movimento.categoria}</span><span><MoneyValue value={movimento.totale} /></span><span><StatusBadge>{movimento.statoVerifica}</StatusBadge></span></div>)}</div></section></div>
    </>
  )
}

function ReportTab({ cantiere, accountingTotals, categoryTotals, pendingRows }) {
  return (
    <div className="hub-workspace-grid">
      <section className="internal-panel"><div className="section-heading panel-title-row"><h2>Report cantiere reale</h2></div><p>Anteprima basata su Supabase / BARCELO_ROMA_master.</p><div className="compact-upload-list"><article className="compact-upload-row"><span className="file-chip file-pdf">€</span><div><strong><MoneyValue value={accountingTotals.totale} /></strong><small>Totale spese</small></div></article><article className="compact-upload-row"><span className="file-chip file-pdf">!</span><div><strong>{pendingRows.length}</strong><small>Righe da verificare</small></div></article></div></section>
      <ActivityFeed title="Categorie principali" items={categoryTotals.slice(0, 6).map((item) => ({ title: item.categoria, meta: `${formatCurrency(item.totale)} · ${item.percent}%`, status: 'Reale' }))} />
    </div>
  )
}

function buildCantiere(cantiereId, documents) {
  if (!documents.length) return null
  const total = documents.reduce((sum, doc) => sum + Number(doc.totale || doc.importoTotale || 0), 0)
  return { id: cantiereId, nome: documents[0]?.cantiere ?? 'Barcelò Roma', cliente: documents[0]?.cantiere ?? 'Barcelò Roma', indirizzo: 'Fonte: BARCELO_ROMA_master Google Sheets', localita: cantiereId === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da Google Sheets', responsabile: 'Gianni Europa', avanzamento: total > 0 ? 100 : 0 }
}

function toAccountingRow(document) {
  return { id: document.id, data: document.dataDocumento, descrizione: document.descrizione ?? document.tipoDocumento, fornitore: document.fornitore ?? 'Non indicato', categoria: document.categoria ?? 'Extra / Altro', numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id, imponibile: Number(document.imponibile || 0), iva: Number(document.iva || 0), totale: Number(document.totale || document.importoTotale || 0), statoVerifica: document.statoVerifica ?? 'Da verificare' }
}

function getTotals(rows) {
  return rows.reduce((acc, row) => ({ imponibile: acc.imponibile + row.imponibile, iva: acc.iva + row.iva, totale: acc.totale + row.totale, daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0) }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0 })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => { acc[row.categoria] = (acc[row.categoria] ?? 0) + row.totale; return acc }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped).map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 })).sort((a, b) => b.totale - a.totale)
}

function getWorkPackages(documents) {
  const grouped = documents.reduce((acc, doc) => { const name = doc.sheetTab ?? doc.numeroDocumento ?? doc.categoria ?? 'Senza tab'; if (!acc[name]) acc[name] = { name, spent: 0, movimenti: 0 }; acc[name].spent += Number(doc.totale || doc.importoTotale || 0); acc[name].movimenti += Number(doc.movimentiCount || 1); return acc }, {})
  const rows = Object.values(grouped).sort((a, b) => b.spent - a.spent)
  const max = Math.max(...rows.map((row) => row.spent), 1)
  return rows.map((row) => ({ ...row, progress: Math.max(5, Math.round((row.spent / max) * 100)), status: 'Importata' }))
}

function reportAction(cantiere) {
  return { icon: 'report', title: `Report PDF - ${cantiere.nome}`, text: 'Export PDF non ancora collegato. I dati mostrati sono già reali da Supabase.', confirmLabel: 'Ok' }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value ?? 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
