import { useMemo, useState } from 'react'
import { ActivityFeed, DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

const tabs = ['Panoramica', 'Lavorazioni', 'Documenti', 'Contabilità', 'Report']

export function CantiereDetail({ cantiereId, documents = [], fotoUploads = [], documentUploads = [], session, activities = [], notes = [], onAddNote }) {
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
  const linkedDocumentUploads = documentUploads.filter((upload) => {
    const isSameSite = upload.cantiereId === cantiere.id
    const isAllowedForEmployee = session?.role !== 'employee' || upload.caricatoDa === session.name
    return isSameSite && isAllowedForEmployee
  })
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
        description="Dettaglio generato solo dai dati Supabase importati da BARCELO_ROMA_master."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <StatusBadge>In corso</StatusBadge>
        <a className="button button-secondary" href="#/dashboard/upload">Carica documento</a>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setModalAction(reportAction(cantiere))}
        >
          Report PDF
        </button>
      </DashboardHeader>

      <section className="cantiere-detail-header compact-detail-header">
        <div className="detail-title">
          <a className="text-link" href="#/dashboard/cantieri">Torna alla lista</a>
          <h2>{cantiere.cliente}</h2>
          <p>{cantiere.indirizzo} · {cantiere.localita}</p>
        </div>
        <div className="detail-status-card">
          <StatusBadge>In corso</StatusBadge>
          <ProgressBar value={cantiere.avanzamento} />
        </div>
      </section>

      <section className="detail-summary-grid">
        <SummaryItem label="Cliente" value={cantiere.cliente} />
        <SummaryItem label="Località" value={cantiere.localita} />
        <SummaryItem label="Responsabile" value={cantiere.responsabile} />
        <SummaryItem label="Righe importate" value={siteDocuments.length} />
        <SummaryItem label="Movimenti totali" value={String(siteDocuments.reduce((sum, doc) => sum + Number(doc.movimentiCount || 1), 0))} />
        {canViewEconomics ? <SummaryItem label="Totale spese" value={<MoneyValue value={accountingTotals.totale} />} /> : null}
      </section>

      <section className="detail-tabs" aria-label="Sezioni dettaglio cantiere">
        {availableTabs.map((tab) => (
          <button aria-pressed={currentTab === tab} key={tab} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </section>

      <section className="detail-tab-panel">
        {currentTab === 'Panoramica' ? (
          <OverviewTab
            accountingTotals={accountingTotals}
            categoryTotals={categoryTotals}
            documents={siteDocuments}
            lavorazioni={lavorazioni}
            pendingRows={pendingRows}
            linkedDocumentUploads={linkedDocumentUploads}
            linkedFotoUploads={linkedFotoUploads}
          />
        ) : null}
        {currentTab === 'Lavorazioni' ? <WorkPackages lavorazioni={lavorazioni} /> : null}
        {currentTab === 'Documenti' ? <DocumentsTab documents={siteDocuments} linkedDocumentUploads={linkedDocumentUploads} /> : null}
        {currentTab === 'Contabilità' ? <AccountingTab accountingRows={accountingRows} accountingTotals={accountingTotals} /> : null}
        {currentTab === 'Report' ? <ReportTab cantiere={cantiere} accountingTotals={accountingTotals} categoryTotals={categoryTotals} pendingRows={pendingRows} /> : null}
      </section>

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function SummaryItem({ label, value }) {
  return (
    <article className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function OverviewTab({ accountingTotals, categoryTotals, documents, lavorazioni, pendingRows, linkedDocumentUploads, linkedFotoUploads }) {
  return (
    <div className="cantiere-overview-grid">
      <CostSplitPanel accountingTotals={accountingTotals} categoryTotals={categoryTotals} />
      <MaterialsPanel categoryTotals={categoryTotals} total={accountingTotals.totale} />
      <SideOperationalPanels pendingRows={pendingRows} documents={documents} />
      <WorkPackages lavorazioni={lavorazioni} compact />
      <RecentDocuments documents={documents} />
      <RecentPayments documents={documents} />
      <ActivityFeed
        title="Timeline attività"
        items={[
          ...documents.slice(0, 5).map((item) => ({
            title: `${item.numeroDocumento ?? item.descrizione}`,
            meta: `${item.categoria ?? 'Categoria'} · ${formatDate(item.dataDocumento)}`,
            status: item.statoVerifica,
          })),
          ...linkedDocumentUploads.slice(0, 2).map((item) => ({ title: `Caricato ${item.tipoDocumento}`, meta: `${item.fornitore} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
          ...linkedFotoUploads.slice(0, 2).map((item) => ({ title: `Foto caricata`, meta: `${item.zona ?? item.cantiere} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
        ]}
      />
    </div>
  )
}

function CostSplitPanel({ accountingTotals, categoryTotals }) {
  return (
    <article className="info-card cost-card">
      <div className="section-heading panel-title-row"><h2>Riepilogo costi per categoria</h2></div>
      <div className="cost-summary">
        <div>
          <span>Totale spese</span>
          <strong><MoneyValue value={accountingTotals.totale} /></strong>
          <small className="positive-trend">Da BARCELO_ROMA_master</small>
        </div>
        <div className="donut-chart"><span>Totale<br /><MoneyValue value={accountingTotals.totale} /></span></div>
        <dl className="detail-list">
          {categoryTotals.slice(0, 5).map((item) => (
            <div key={item.categoria}><dt>{item.categoria}</dt><dd><MoneyValue value={item.totale} /></dd></div>
          ))}
        </dl>
      </div>
    </article>
  )
}

function MaterialsPanel({ categoryTotals, total }) {
  const materialCategories = ['Materiali', 'FIR / Rifiuti', 'Noleggi / Servizi']
  const materials = categoryTotals
    .filter((item) => materialCategories.includes(item.categoria) || item.categoria?.toLowerCase().includes('material'))
    .reduce((sum, item) => sum + item.totale, 0)
  const nonMaterials = Math.max(0, total - materials)
  const percent = total > 0 ? Math.round((materials / total) * 1000) / 10 : 0

  return (
    <article className="info-card">
      <h2>Sintesi materiali vs non materiali</h2>
      <div className="split-bar"><span style={{ width: `${Math.min(100, percent)}%` }} /></div>
      <div className="material-cards">
        <div><span>Materiali</span><strong><MoneyValue value={materials} /></strong><small>{percent}% del totale</small></div>
        <div><span>Non materiali</span><strong><MoneyValue value={nonMaterials} /></strong><small>{Math.round((100 - percent) * 10) / 10}% del totale</small></div>
      </div>
    </article>
  )
}

function SideOperationalPanels({ pendingRows, documents }) {
  const missingFiles = documents.filter((item) => String(item.note ?? '').toLowerCase().includes('manca') || item.statoVerifica === 'Incompleto')
  const toClassify = documents.filter((item) => String(item.categoria ?? '').toLowerCase().includes('classificare'))

  return (
    <div className="side-operational-panels">
      <article className="info-card note-highlight">
        <h2>Note operative</h2>
        <p>Dati importati da Google Sheets. Controlla le righe con categoria “Da classificare”, documenti mancanti o note di verifica.</p>
      </article>
      <article className="info-card">
        <h2>Alert contabili</h2>
        <div className="activity-feed">
          {[
            ...missingFiles.map((item) => ({ id: `missing-${item.id}`, title: item.numeroDocumento ?? item.descrizione, detail: item.note ?? 'Documento da verificare', status: 'Da controllare' })),
            ...toClassify.map((item) => ({ id: `classify-${item.id}`, title: item.numeroDocumento ?? item.descrizione, detail: item.categoria, status: 'Da classificare' })),
          ].slice(0, 5).map((item) => (
            <article className="activity-item" key={item.id}>
              <span />
              <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              <StatusBadge>{item.status}</StatusBadge>
            </article>
          ))}
          {missingFiles.length === 0 && toClassify.length === 0 ? <p>Nessun alert contabile aperto nei dati importati.</p> : null}
        </div>
      </article>
      <ActivityFeed title="Verifiche in attesa" items={pendingRows.slice(0, 5).map((item) => ({ title: item.descrizione, meta: item.fornitore, status: item.statoVerifica }))} />
    </div>
  )
}

function WorkPackages({ lavorazioni }) {
  return (
    <article className="info-card work-packages">
      <div className="section-heading panel-title-row">
        <h2>Lavorazioni principali</h2>
        <a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi contabilità</a>
      </div>
      <div className="hub-table work-package-table">
        <div className="hub-table-head work-package-row"><span>Lavorazione</span><span>Stato</span><span>Incidenza</span><span>Movimenti</span><span>Speso</span></div>
        {lavorazioni.map((item) => (
          <article className="hub-table-row work-package-row" key={item.name}>
            <strong>{item.name}</strong>
            <StatusBadge>{item.status}</StatusBadge>
            <ProgressBar value={item.progress} />
            <span>{item.movimenti}</span>
            <span><MoneyValue value={item.spent} /></span>
          </article>
        ))}
      </div>
    </article>
  )
}

function RecentDocuments({ documents }) {
  return (
    <article className="info-card">
      <div className="section-heading panel-title-row"><h2>Ultimi documenti</h2><a className="button button-secondary button-small" href="#/dashboard/documenti">Vedi tutti</a></div>
      <div className="activity-feed">
        {documents.slice(0, 5).map((doc) => (
          <a className="activity-item interactive-row" href={`#/dashboard/documenti/${doc.id}`} key={doc.id}>
            <span />
            <div><strong>{doc.tipoDocumento}</strong><small>{doc.numeroDocumento ?? doc.fornitore} · <MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></small></div>
            <StatusBadge>{doc.statoVerifica}</StatusBadge>
          </a>
        ))}
      </div>
    </article>
  )
}

function RecentPayments({ documents }) {
  const payments = documents.filter((document) => String(document.pagamento ?? '').toLowerCase().includes('bonifico') || String(document.categoria ?? '').toLowerCase().includes('bonifici'))
  const rows = payments.length ? payments : documents

  return (
    <article className="info-card">
      <div className="section-heading panel-title-row"><h2>Pagamenti / Bonifici</h2><a className="button button-secondary button-small" href="#/dashboard/contabilita">Vedi tutti</a></div>
      <div className="hub-table">
        {rows.slice(0, 6).map((payment) => (
          <article className="hub-table-row payment-row" key={payment.id}>
            <span>{formatDate(payment.dataDocumento)}</span><strong>{payment.fornitore}</strong><span>{payment.numeroDocumento}</span><span><MoneyValue value={payment.totale ?? payment.importoTotale ?? 0} /></span><StatusBadge>{payment.statoVerifica}</StatusBadge>
          </article>
        ))}
      </div>
    </article>
  )
}

function DocumentsTab({ documents }) {
  return (
    <div className="table-card">
      {documents.map((documento) => (
        <a className="table-row table-row-4" href={`#/dashboard/documenti/${documento.id}`} key={documento.id}>
          <strong>{documento.numeroDocumento ?? documento.descrizione}</strong>
          <span>{documento.tipoDocumento}</span>
          <span><MoneyValue value={documento.totale ?? documento.importoTotale ?? 0} /></span>
          <StatusBadge>{documento.statoVerifica}</StatusBadge>
        </a>
      ))}
    </div>
  )
}

function AccountingTab({ accountingRows, accountingTotals }) {
  return (
    <>
      <section className="accounting-summary-grid detail-accounting-summary">
        <article className="stat-card"><span>Totale imponibile</span><strong><MoneyValue value={accountingTotals.imponibile} /></strong></article>
        <article className="stat-card"><span>Totale IVA</span><strong><MoneyValue value={accountingTotals.iva} /></strong></article>
        <article className="stat-card"><span>Totale complessivo</span><strong><MoneyValue value={accountingTotals.totale} /></strong></article>
        <article className="stat-card"><span>Documenti da verificare</span><strong>{accountingTotals.daVerificare}</strong></article>
      </section>
      <div className="table-card">
        {accountingRows.map((movimento) => (
          <div className="table-row accounting-detail-row" key={movimento.id}>
            <strong>{movimento.descrizione}</strong>
            <span>{movimento.fornitore}</span>
            <span>{movimento.categoria}</span>
            <span><MoneyValue value={movimento.totale} /></span>
            <StatusBadge>{movimento.statoVerifica}</StatusBadge>
          </div>
        ))}
      </div>
    </>
  )
}

function ReportTab({ cantiere, accountingTotals, categoryTotals, pendingRows }) {
  return (
    <div className="detail-two-column">
      <article className="info-card">
        <h2>Report cantiere reale</h2>
        <p>Anteprima basata su Supabase / BARCELO_ROMA_master. Export PDF ancora da collegare.</p>
        <dl className="detail-list">
          <div><dt>Totale imponibile</dt><dd><MoneyValue value={accountingTotals.imponibile} /></dd></div>
          <div><dt>Totale IVA</dt><dd><MoneyValue value={accountingTotals.iva} /></dd></div>
          <div><dt>Totale spese</dt><dd><MoneyValue value={accountingTotals.totale} /></dd></div>
          <div><dt>Righe da verificare</dt><dd>{pendingRows.length}</dd></div>
        </dl>
      </article>
      <ActivityFeed
        title="Categorie principali"
        items={categoryTotals.slice(0, 6).map((item) => ({
          title: item.categoria,
          meta: `${formatCurrency(item.totale)} · ${item.percent}%`,
          status: 'Reale',
        }))}
      />
    </div>
  )
}

function buildCantiere(cantiereId, documents) {
  if (!documents.length) return null
  const total = documents.reduce((sum, doc) => sum + Number(doc.totale || doc.importoTotale || 0), 0)
  const lastDate = documents.reduce((latest, doc) => new Date(doc.dataDocumento || 0) > new Date(latest || 0) ? doc.dataDocumento : latest, documents[0]?.dataDocumento)
  return {
    id: cantiereId,
    nome: documents[0]?.cantiere ?? 'Barcelò Roma',
    cliente: documents[0]?.cantiere ?? 'Barcelò Roma',
    indirizzo: 'Fonte: BARCELO_ROMA_master Google Sheets',
    localita: cantiereId === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da Google Sheets',
    responsabile: 'Gianni Europa',
    avanzamento: total > 0 ? 100 : 0,
    lastDate,
  }
}

function toAccountingRow(document) {
  return {
    id: document.id,
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento,
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    statoVerifica: document.statoVerifica ?? 'Da verificare',
  }
}

function getTotals(rows) {
  return rows.reduce((acc, row) => ({
    imponibile: acc.imponibile + row.imponibile,
    iva: acc.iva + row.iva,
    totale: acc.totale + row.totale,
    daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0),
  }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0 })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => {
    acc[row.categoria] = (acc[row.categoria] ?? 0) + row.totale
    return acc
  }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped)
    .map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 }))
    .sort((a, b) => b.totale - a.totale)
}

function getWorkPackages(documents) {
  const grouped = documents.reduce((acc, doc) => {
    const name = doc.sheetTab ?? doc.numeroDocumento ?? doc.categoria ?? 'Senza tab'
    if (!acc[name]) acc[name] = { name, spent: 0, movimenti: 0 }
    acc[name].spent += Number(doc.totale || doc.importoTotale || 0)
    acc[name].movimenti += Number(doc.movimentiCount || 1)
    return acc
  }, {})
  const rows = Object.values(grouped).sort((a, b) => b.spent - a.spent)
  const max = Math.max(...rows.map((row) => row.spent), 1)
  return rows.map((row) => ({ ...row, progress: Math.max(5, Math.round((row.spent / max) * 100)), status: 'Importata' }))
}

function reportAction(cantiere) {
  return {
    icon: 'report',
    title: `Report PDF - ${cantiere.nome}`,
    text: 'Export PDF non ancora collegato. I dati mostrati sono già reali da Supabase.',
    confirmLabel: 'Ok',
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value ?? 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
