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
      <section className="dashboard-header internal-header">
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
  const lastDocuments = [...siteDocuments].sort((a, b) => new Date(b.dataDocumento || 0) - new Date(a.dataDocumento || 0)).slice(0, 5)
  const lastUploads = [...linkedDocumentUploads, ...linkedFotoUploads]
    .sort((a, b) => new Date(b.dataCaricamento || 0) - new Date(a.dataCaricamento || 0))
    .slice(0, 5)

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio cantiere reale"
        title={cantiere.nome}
        description="Vista operativa compatta: stato, costi, lavorazioni, documenti e azioni sono ordinati per frequenza d'uso."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <a className="button button-secondary button-small" href="#/dashboard/cantieri">Lista cantieri</a>
        <button className="button button-primary button-small" type="button" onClick={() => setModalAction(reportAction(cantiere))}>Report PDF</button>
      </DashboardHeader>

      <section className="cantiere-detail-hero" aria-label="Panoramica cantiere">
        <div className="cantiere-identity-card">
          <div className="cantiere-identity-top">
            <span className="site-avatar">ES</span>
            <div>
              <span className="eyebrow">Centro cantiere</span>
              <h2>{cantiere.cliente}</h2>
              <p>{cantiere.indirizzo} · {cantiere.localita}</p>
            </div>
            <StatusBadge>{pendingRows.length ? 'Da controllare' : 'In corso'}</StatusBadge>
          </div>
          <ProgressBar value={cantiere.avanzamento} />
          <div className="cantiere-hero-meta">
            <div><span>Responsabile</span><strong>{cantiere.responsabile}</strong></div>
            <div><span>Ultimo movimento</span><strong>{formatDate(cantiere.lastDate)}</strong></div>
            <div><span>Righe</span><strong>{siteDocuments.length}</strong></div>
            <div><span>Criticità</span><strong>{pendingRows.length}</strong></div>
          </div>
        </div>

        {canViewEconomics ? (
          <div className="cantiere-money-card">
            <span className="eyebrow">Economia</span>
            <div className="cantiere-money-total">
              <span>Totale spese</span>
              <strong><MoneyValue value={accountingTotals.totale} /></strong>
              <small>Imponibile <MoneyValue value={accountingTotals.imponibile} /> · IVA <MoneyValue value={accountingTotals.iva} /></small>
            </div>
            <div className="cantiere-money-split">
              {categoryTotals.slice(0, 4).map((item) => (
                <div key={item.categoria}>
                  <span>{item.categoria}</span>
                  <strong><MoneyValue value={item.totale} /></strong>
                  <small>{item.percent}%</small>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="cantiere-action-rail">
          <span className="eyebrow">Azioni rapide</span>
          <a href="#/dashboard/upload"><InternalIcon name="upload" size={17} /><span><b>Carica</b><small>Foto o documento</small></span></a>
          <a href="#/dashboard/documenti"><InternalIcon name="file" size={17} /><span><b>Documenti</b><small>{siteDocuments.length} righe</small></span></a>
          {canViewEconomics ? <a href="#/dashboard/contabilita"><InternalIcon name="wallet" size={17} /><span><b>Contabilità</b><small><MoneyValue value={accountingTotals.totale} /></small></span></a> : null}
          <button type="button" onClick={() => setModalAction(noteAction(cantiere))}><InternalIcon name="plus" size={17} /><span><b>Nota</b><small>Promemoria cantiere</small></span></button>
        </div>
      </section>

      <section className="cantiere-detail-kpis" aria-label="Indicatori cantiere">
        <DetailKpi icon="file" label="Documenti" value={siteDocuments.length} hint="Righe importate" />
        <DetailKpi icon="building" tone="amber" label="Lavorazioni" value={lavorazioni.length} hint="Tab / gruppi" />
        <DetailKpi icon="warning" tone="red" label="Da controllare" value={pendingRows.length} hint="Alert aperti" />
        {canViewEconomics ? <DetailKpi icon="wallet" tone="green" label="Totale" value={<MoneyValue value={accountingTotals.totale} />} hint="Spese cantiere" /> : null}
      </section>

      <div className="cantiere-detail-layout">
        <main className="cantiere-detail-main">
          <section className="cantiere-tabs-card" aria-label="Sezioni dettaglio cantiere">
            <div className="cantiere-tabs-head">
              <div>
                <h2>Area di lavoro</h2>
                <p>Le tab cambiano solo il blocco centrale: il contesto e le azioni restano sempre visibili.</p>
              </div>
              <div className="detail-tabs cantiere-detail-tabs">
                {availableTabs.map((tab) => (
                  <button aria-pressed={currentTab === tab} key={tab} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
              </div>
            </div>
            <TabContent
              currentTab={currentTab}
              documents={siteDocuments}
              lavorazioni={lavorazioni}
              pendingRows={pendingRows}
              categoryTotals={categoryTotals}
              accountingRows={accountingRows}
              accountingTotals={accountingTotals}
              cantiere={cantiere}
            />
          </section>
        </main>

        <aside className="cantiere-context-panel">
          <OpenControls pendingRows={pendingRows} documents={siteDocuments} />
          <RecentDocumentsPanel documents={lastDocuments} />
          <RecentActivityPanel documents={lastDocuments} uploads={lastUploads} />
        </aside>
      </div>

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function DetailKpi({ icon, label, value, hint, tone = 'blue' }) {
  return (
    <article className={`detail-kpi detail-kpi-${tone}`}>
      <span><InternalIcon name={icon} size={17} /></span>
      <div><small>{label}</small><strong>{value}</strong><em>{hint}</em></div>
    </article>
  )
}

function TabContent({ currentTab, documents, lavorazioni, pendingRows, categoryTotals, accountingRows, accountingTotals, cantiere }) {
  if (currentTab === 'Lavorazioni') return <WorkPackages lavorazioni={lavorazioni} />
  if (currentTab === 'Documenti') return <DocumentsTab documents={documents} />
  if (currentTab === 'Contabilità') return <AccountingTab accountingRows={accountingRows} accountingTotals={accountingTotals} />
  if (currentTab === 'Report') return <ReportTab cantiere={cantiere} accountingTotals={accountingTotals} categoryTotals={categoryTotals} pendingRows={pendingRows} />

  return (
    <div className="cantiere-overview-grid">
      <WorkPackages lavorazioni={lavorazioni.slice(0, 6)} compact />
      <MaterialsPanel categoryTotals={categoryTotals} total={accountingTotals.totale} />
      <DocumentsTab documents={documents.slice(0, 5)} compact />
      <AccountingSnapshot accountingTotals={accountingTotals} pendingRows={pendingRows} />
    </div>
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
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><h2>Materiali / non materiali</h2></div>
      <div className="detail-split-list">
        <article><span>Materiali</span><strong><MoneyValue value={materials} /></strong><small>{percent}% del totale</small></article>
        <article><span>Non materiali</span><strong><MoneyValue value={nonMaterials} /></strong><small>{Math.round((100 - percent) * 10) / 10}% del totale</small></article>
      </div>
      <div className="detail-category-list">
        {categoryTotals.slice(0, 5).map((item) => <div key={item.categoria}><span>{item.categoria}</span><strong><MoneyValue value={item.totale} /></strong></div>)}
      </div>
    </section>
  )
}

function OpenControls({ pendingRows, documents }) {
  const mathWarnings = documents.filter((item) => {
    const imponibile = Number(item.imponibile || 0)
    const iva = Number(item.iva || 0)
    const totale = Number(item.totale || item.importoTotale || 0)
    return imponibile || iva ? Math.abs((imponibile + iva) - totale) > 0.01 : false
  })
  const alerts = [...pendingRows, ...mathWarnings].slice(0, 6)

  return (
    <section className="detail-side-card detail-alert-card">
      <div className="section-heading panel-title-row">
        <div><h2>Controlli aperti</h2><p>In alto a destra perché sono le prime cose da sistemare.</p></div>
        <a className="button button-secondary button-small" href="#/dashboard/documenti">Apri</a>
      </div>
      <div className="detail-alert-list">
        {alerts.map((item) => <a href={`#/dashboard/documenti/${item.id}`} key={`${item.id}-${item.statoVerifica}`}><span className="file-chip file-pdf">!</span><div><strong>{item.numeroDocumento ?? item.descrizione}</strong><small>{item.fornitore} · {item.categoria}</small></div><StatusBadge>{normalizeDocumentStatus(item.statoVerifica ?? 'Totale da verificare')}</StatusBadge></a>)}
        {alerts.length === 0 ? <article><span className="file-chip">OK</span><div><strong>Nessun controllo urgente</strong><small>Documento e contabilità risultano ordinati.</small></div></article> : null}
      </div>
    </section>
  )
}

function WorkPackages({ lavorazioni, compact = false }) {
  return (
    <section className={compact ? 'detail-section-card compact-work-card' : 'detail-section-card'}>
      <div className="section-heading panel-title-row">
        <div><h2>Lavorazioni</h2><p>Gruppi vicini ai costi perché sono il modo più rapido per capire dove sta andando il budget.</p></div>
        <a className="button button-secondary button-small" href="#/dashboard/contabilita">Contabilità</a>
      </div>
      <div className="detail-work-list">
        {lavorazioni.map((item) => <article key={item.name}><div><strong>{item.name}</strong><small>{item.movimenti} movimenti · <MoneyValue value={item.spent} /></small></div><StatusBadge>{item.status}</StatusBadge><ProgressBar value={item.progress} /></article>)}
      </div>
    </section>
  )
}

function DocumentsTab({ documents, compact = false }) {
  return (
    <section className={compact ? 'detail-section-card compact-doc-card' : 'detail-section-card'}>
      <div className="section-heading panel-title-row">
        <div><h2>Documenti</h2><p>Documenti accanto ai controlli: apri subito la riga che crea dubbi o costi.</p></div>
        <a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a>
      </div>
      <div className="detail-document-list">
        {documents.map((doc) => <a href={`#/dashboard/documenti/${doc.id}`} key={doc.id}><span className="file-chip file-pdf">DOC</span><div><strong>{doc.tipoDocumento} {doc.numeroDocumento ?? ''}</strong><small>{doc.fornitore} · {doc.categoria}</small></div><strong><MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></strong><StatusBadge>{normalizeDocumentStatus(doc.statoVerifica)}</StatusBadge></a>)}
      </div>
    </section>
  )
}

function AccountingSnapshot({ accountingTotals, pendingRows }) {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><h2>Snapshot contabile</h2></div>
      <div className="detail-accounting-grid">
        <div><span>Imponibile</span><strong><MoneyValue value={accountingTotals.imponibile} /></strong></div>
        <div><span>IVA</span><strong><MoneyValue value={accountingTotals.iva} /></strong></div>
        <div><span>Totale</span><strong><MoneyValue value={accountingTotals.totale} /></strong></div>
        <div><span>Da verificare</span><strong>{pendingRows.length}</strong></div>
      </div>
    </section>
  )
}

function AccountingTab({ accountingRows, accountingTotals }) {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><h2>Contabilità cantiere</h2><span className="data-mode-badge"><MoneyValue value={accountingTotals.totale} /></span></div>
      <div className="detail-accounting-table">
        {accountingRows.map((movimento) => <a href={`#/dashboard/contabilita/${movimento.id}`} key={movimento.id}><div><strong>{movimento.descrizione}</strong><small>{movimento.fornitore} · {movimento.categoria}</small></div><span><MoneyValue value={movimento.imponibile} /></span><span><MoneyValue value={movimento.iva} /></span><strong><MoneyValue value={movimento.totale} /></strong><StatusBadge>{normalizeDocumentStatus(movimento.statoVerifica)}</StatusBadge></a>)}
      </div>
    </section>
  )
}

function ReportTab({ cantiere, accountingTotals, categoryTotals, pendingRows }) {
  return (
    <div className="cantiere-report-grid">
      <section className="detail-section-card">
        <div className="section-heading panel-title-row"><h2>Report pronto</h2></div>
        <p>Qui ha senso tenere il report dopo contabilità e controlli: prima verifichi i dati, poi esporti.</p>
        <div className="detail-split-list">
          <article><span>Totale spese</span><strong><MoneyValue value={accountingTotals.totale} /></strong><small>{cantiere.nome}</small></article>
          <article><span>Alert aperti</span><strong>{pendingRows.length}</strong><small>Da risolvere prima del PDF</small></article>
        </div>
      </section>
      <ActivityFeed title="Categorie principali" items={categoryTotals.slice(0, 6).map((item) => ({ title: item.categoria, meta: `${formatCurrency(item.totale)} · ${item.percent}%`, status: 'Reale' }))} />
    </div>
  )
}

function RecentDocumentsPanel({ documents }) {
  return (
    <section className="detail-side-card">
      <div className="section-heading panel-title-row"><h2>Ultimi documenti</h2><a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a></div>
      <div className="detail-mini-list">
        {documents.map((doc) => <a href={`#/dashboard/documenti/${doc.id}`} key={doc.id}><div><strong>{doc.numeroDocumento ?? doc.tipoDocumento}</strong><small>{doc.fornitore} · {formatDate(doc.dataDocumento)}</small></div><span><MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></span></a>)}
      </div>
    </section>
  )
}

function RecentActivityPanel({ documents, uploads }) {
  const activities = [
    ...documents.map((item) => ({ id: `doc-${item.id}`, title: item.numeroDocumento ?? item.descrizione, meta: `${item.categoria} · ${formatDate(item.dataDocumento)}`, status: item.statoVerifica, href: `#/dashboard/documenti/${item.id}` })),
    ...uploads.map((item) => ({ id: `upload-${item.id}`, title: item.fileName ?? item.tipoDocumento ?? 'Caricamento', meta: `${item.caricatoDa ?? 'Utente'} · ${formatDate(item.dataCaricamento)}`, status: item.stato, href: '#/dashboard/caricamenti' })),
  ].slice(0, 6)

  return <ActivityFeed title="Timeline" items={activities} />
}

function buildCantiere(cantiereId, documents) {
  if (!documents.length) return null
  const total = documents.reduce((sum, doc) => sum + Number(doc.totale || doc.importoTotale || 0), 0)
  const lastDate = documents.reduce((latest, doc) => doc.dataDocumento && new Date(doc.dataDocumento) > new Date(latest || 0) ? doc.dataDocumento : latest, documents[0]?.dataDocumento)
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
  return rows.reduce((acc, row) => ({ imponibile: acc.imponibile + row.imponibile, iva: acc.iva + row.iva, totale: acc.totale + row.totale, daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0) }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0 })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => { acc[row.categoria] = (acc[row.categoria] ?? 0) + row.totale; return acc }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped).map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 })).sort((a, b) => b.totale - a.totale)
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
  return { icon: 'report', title: `Report PDF - ${cantiere.nome}`, text: 'Export PDF non ancora collegato. I dati mostrati sono già reali da Supabase.', confirmLabel: 'Ok' }
}

function noteAction(cantiere) {
  return { icon: 'plus', title: `Nota cantiere - ${cantiere.nome}`, text: 'Aggiungi un promemoria operativo collegato al cantiere.', confirmLabel: 'Salva nota', fields: [{ label: 'Nota', placeholder: 'Es. verificare fattura materiali...' }] }
}

function normalizeDocumentStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value ?? 0)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
