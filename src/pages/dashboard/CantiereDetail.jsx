import { useMemo, useState } from 'react'
import { ActivityFeed, DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
import { InternalIcon } from '../../components/InternalIcons'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import { getOfficialMasterTotals, preferOfficialCategoryTotals, preferOfficialTotals } from '../../lib/masterTotals'

const tabs = ['Panoramica', 'Lavorazioni', 'Documenti', 'Contabilità', 'Foto', 'Note']

export function CantiereDetail({ cantiereId, documents = [], fotoUploads = [], documentUploads = [], session, notes = [], onAddNote, store = null }) {
  const [activeTab, setActiveTab] = useState('Panoramica')
  const [noteText, setNoteText] = useState('')
  const [noteStatus, setNoteStatus] = useState(null)
  const storeDocuments = Array.isArray(store?.documents) && store.documents.length ? store.documents : documents
  const storeMovements = Array.isArray(store?.movements) ? store.movements : []
  const storeNotes = Array.isArray(store?.notes) ? store.notes : notes
  const storeCantieri = Array.isArray(store?.cantieri) ? store.cantieri : []

  const siteDocuments = useMemo(() => storeDocuments.filter((document) => (document.cantiereId ?? 'barcelo-roma') === cantiereId), [storeDocuments, cantiereId])
  const accountingRows = useMemo(() => {
    const rows = storeMovements.length ? storeMovements.map(normalizeMovementRow) : siteDocuments.map(documentToAccountingRow)
    return rows.filter((row) => (row.cantiereId ?? 'barcelo-roma') === cantiereId)
  }, [storeMovements, siteDocuments, cantiereId])
  const cantiereRecord = useMemo(() => storeCantieri.find((item) => item.id === cantiereId), [storeCantieri, cantiereId])
  const cantiere = useMemo(() => buildCantiere(cantiereId, siteDocuments, accountingRows, cantiereRecord), [cantiereId, siteDocuments, accountingRows, cantiereRecord])

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
  const availableTabs = canViewEconomics ? tabs : tabs.filter((tab) => tab !== 'Contabilità')
  const currentTab = availableTabs.includes(activeTab) ? activeTab : 'Panoramica'
  const linkedFotoUploads = fotoUploads.filter((upload) => (upload.cantiereId ?? 'barcelo-roma') === cantiere.id)
  const linkedDocumentUploads = documentUploads.filter((upload) => (upload.cantiereId ?? 'barcelo-roma') === cantiere.id)
  const officialMaster = getOfficialMasterTotals(store)
  const calculatedTotals = getTotals(accountingRows)
  const accountingTotals = preferOfficialTotals(store, calculatedTotals)
  const calculatedCategoryTotals = getCategoryTotals(accountingRows)
  const categoryTotals = preferOfficialCategoryTotals(store, calculatedCategoryTotals)
  const lavorazioni = getWorkPackages(accountingRows, siteDocuments)
  const pendingRows = accountingRows.filter((row) => ['Da verificare', 'Incompleto', 'Possibile duplicato'].includes(row.statoVerifica) || !row.documentId)
  const siteNotes = storeNotes.filter((note) => note.entityType === 'cantieri' && note.entityId === cantiereId)
  const lastDocuments = [...siteDocuments].sort((a, b) => new Date(b.dataDocumento || 0) - new Date(a.dataDocumento || 0)).slice(0, 5)
  const lastUploads = [...linkedDocumentUploads, ...linkedFotoUploads]
    .sort((a, b) => new Date(b.dataCaricamento || 0) - new Date(a.dataCaricamento || 0))
    .slice(0, 5)
  const isEmptyOperationalCantiere = cantiere.source === 'supabase-operational' && !siteDocuments.length && !accountingRows.length && !linkedFotoUploads.length

  function submitNote(event) {
    event.preventDefault()
    const text = noteText.trim()
    if (!text) {
      setNoteStatus({ type: 'error', message: 'Scrivi una nota prima di salvarla.' })
      return
    }
    const saveNote = store?.addInternalNote ?? onAddNote
    if (!saveNote) {
      setNoteStatus({ type: 'error', message: 'Salvataggio note non disponibile.' })
      return
    }
    saveNote('cantieri', cantiereId, text)
    setNoteText('')
    setNoteStatus({ type: 'success', message: 'Nota salvata sul cantiere.' })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio cantiere reale"
        title={cantiere.nome}
        description="Centro operativo del cantiere: lavorazioni, documenti, movimenti, foto e note persistenti collegate."
      >
        <DataModeBadge>{officialMaster ? 'Totali master' : 'Dati Supabase'}</DataModeBadge>
        <a className="button button-secondary button-small" href="#/dashboard/cantieri">Lista cantieri</a>
        <a className="button button-primary button-small" href="#/dashboard/report">Report</a>
      </DashboardHeader>

      {isEmptyOperationalCantiere ? (
        <section className="accounting-alert success-alert">
          <strong>Bozza cantiere creata</strong>
          <p>Questo cantiere esiste su Supabase ma non ha ancora documenti, foto o movimenti. Carica il primo documento oppure aggiungi una nota operativa.</p>
        </section>
      ) : null}

      <section className="cantiere-detail-hero" aria-label="Panoramica cantiere">
        <div className="cantiere-identity-card">
          <div className="cantiere-identity-top">
            <span className="site-avatar">ES</span>
            <div>
              <span className="eyebrow">Centro cantiere</span>
              <h2>{cantiere.cliente}</h2>
              <p>{cantiere.indirizzo} · {cantiere.localita}</p>
            </div>
            <StatusBadge>{isEmptyOperationalCantiere ? 'Bozza operativa' : pendingRows.length ? 'Da controllare' : 'In corso'}</StatusBadge>
          </div>
          <ProgressBar value={cantiere.avanzamento} />
          <div className="cantiere-hero-meta">
            <div><span>Ultimo movimento</span><strong>{formatDate(cantiere.lastDate)}</strong></div>
            <div><span>Lavorazioni</span><strong>{lavorazioni.length}</strong></div>
            <div><span>Movimenti</span><strong>{accountingRows.length}</strong></div>
            <div><span>Criticità</span><strong>{pendingRows.length}</strong></div>
          </div>
        </div>

        {canViewEconomics ? (
          <div className="cantiere-money-card">
            <span className="eyebrow">Economia</span>
            <div className="cantiere-money-total">
              <span>{officialMaster ? 'Totale ufficiale master' : 'Totale movimenti'}</span>
              <strong><MoneyValue value={accountingTotals.totale} /></strong>
              <small>Imponibile <MoneyValue value={accountingTotals.imponibile} /> · IVA <MoneyValue value={accountingTotals.iva} /></small>
            </div>
            <div className="cantiere-money-split">
              {categoryTotals.slice(0, 4).map((item) => (
                <div key={item.categoria}>
                  <span>{formatLabel(item.categoria)}</span>
                  <strong><MoneyValue value={item.totale} /></strong>
                  <small>{item.percent ?? '-'}%</small>
                </div>
              ))}
              {categoryTotals.length === 0 ? <p>Nessuna spesa ancora collegata.</p> : null}
            </div>
          </div>
        ) : null}

        <div className="cantiere-action-rail">
          <span className="eyebrow">Azioni rapide</span>
          <a href="#/dashboard/upload"><InternalIcon name="upload" size={17} /><span><b>Carica</b><small>Foto o documento</small></span></a>
          <a href="#/dashboard/documenti"><InternalIcon name="file" size={17} /><span><b>Documenti</b><small>{siteDocuments.length} righe</small></span></a>
          {canViewEconomics ? <a href="#/dashboard/contabilita"><InternalIcon name="wallet" size={17} /><span><b>Contabilità</b><small>{accountingRows.length} movimenti</small></span></a> : null}
          <button type="button" onClick={() => setActiveTab('Note')}><InternalIcon name="plus" size={17} /><span><b>Nota</b><small>{siteNotes.length} salvate</small></span></button>
        </div>
      </section>

      <section className="cantiere-detail-kpis" aria-label="Indicatori cantiere">
        <DetailKpi icon="building" tone="amber" label="Lavorazioni" value={lavorazioni.length} hint="Tab / gruppi" />
        <DetailKpi icon="file" label="Documenti" value={siteDocuments.length} hint="Righe collegate" />
        <DetailKpi icon="warning" tone="red" label="Da controllare" value={pendingRows.length} hint="Alert aperti" />
        {canViewEconomics ? <DetailKpi icon="wallet" tone="green" label="Totale" value={<MoneyValue value={accountingTotals.totale} />} hint={officialMaster ? 'Da master' : 'Da righe'} /> : null}
      </section>

      <div className="cantiere-detail-layout">
        <main className="cantiere-detail-main">
          <section className="cantiere-tabs-card" aria-label="Sezioni dettaglio cantiere">
            <div className="cantiere-tabs-head">
              <div>
                <h2>Area di lavoro</h2>
                <p>Scegli cosa controllare: lavorazioni, documenti, movimenti, foto o note cantiere.</p>
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
              photos={linkedFotoUploads}
              notes={siteNotes}
              noteText={noteText}
              noteStatus={noteStatus}
              setNoteText={setNoteText}
              submitNote={submitNote}
              canViewEconomics={canViewEconomics}
              isEmptyOperationalCantiere={isEmptyOperationalCantiere}
            />
          </section>
        </main>

        <aside className="cantiere-context-panel">
          <OpenControls pendingRows={pendingRows} documents={siteDocuments} isEmptyOperationalCantiere={isEmptyOperationalCantiere} />
          <RecentDocumentsPanel documents={lastDocuments} />
          <RecentActivityPanel documents={lastDocuments} uploads={lastUploads} notes={siteNotes} />
        </aside>
      </div>
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

function TabContent(props) {
  const { currentTab, documents, lavorazioni, pendingRows, categoryTotals, accountingRows, accountingTotals, photos, notes, noteText, noteStatus, setNoteText, submitNote, canViewEconomics, isEmptyOperationalCantiere } = props
  if (currentTab === 'Lavorazioni') return <WorkPackages lavorazioni={lavorazioni} />
  if (currentTab === 'Documenti') return <DocumentsTab documents={documents} />
  if (currentTab === 'Contabilità') return <AccountingTab accountingRows={accountingRows} accountingTotals={accountingTotals} />
  if (currentTab === 'Foto') return <PhotosTab photos={photos} />
  if (currentTab === 'Note') return <NotesTab notes={notes} noteText={noteText} noteStatus={noteStatus} setNoteText={setNoteText} submitNote={submitNote} />

  return (
    <div className="cantiere-overview-grid">
      {isEmptyOperationalCantiere ? <EmptyCantierePanel /> : null}
      <WorkPackages lavorazioni={lavorazioni.slice(0, 6)} compact />
      {canViewEconomics ? <MaterialsPanel categoryTotals={categoryTotals} total={accountingTotals.totale} /> : null}
      <DocumentsTab documents={documents.slice(0, 5)} compact />
      <AccountingSnapshot accountingTotals={accountingTotals} pendingRows={pendingRows} />
    </div>
  )
}

function EmptyCantierePanel() {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row">
        <div>
          <h2>Primo passo operativo</h2>
          <p>Il cantiere è pronto ma va popolato con documenti, foto o note.</p>
        </div>
      </div>
      <div className="quick-actions-grid">
        <a className="quick-action-card" href="#/dashboard/upload"><InternalIcon name="upload" size={18} /><strong>Carica documento</strong><span>Fattura, ricevuta o foto</span></a>
        <a className="quick-action-card" href="#/dashboard/contabilita"><InternalIcon name="wallet" size={18} /><strong>Nuova spesa</strong><span>Movimento manuale</span></a>
      </div>
    </section>
  )
}

function MaterialsPanel({ categoryTotals, total }) {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><h2>Spese principali</h2></div>
      <div className="detail-category-list">
        {categoryTotals.slice(0, 8).map((item) => <div key={item.categoria}><span>{formatLabel(item.categoria)}</span><strong><MoneyValue value={item.totale} /></strong></div>)}
        {categoryTotals.length === 0 ? <p>Nessuna categoria collegata.</p> : null}
      </div>
      <small>Totale riferimento: <MoneyValue value={total} /></small>
    </section>
  )
}

function OpenControls({ pendingRows, documents, isEmptyOperationalCantiere = false }) {
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
        <div><h2>Controlli aperti</h2><p>Criticità da chiudere prima del report.</p></div>
        <a className="button button-secondary button-small" href="#/dashboard/contabilita">Apri</a>
      </div>
      <div className="detail-alert-list">
        {alerts.map((item) => <a href={`#/dashboard/contabilita/${item.id}`} key={`${item.id}-${item.statoVerifica}`}><span className="file-chip file-pdf">!</span><div><strong>{item.numeroDocumento ?? item.descrizione}</strong><small>{item.fornitore} · {formatLabel(item.sheetTab ?? item.categoria)}</small></div><StatusBadge>{normalizeDocumentStatus(item.statoVerifica ?? 'Totale da verificare')}</StatusBadge></a>)}
        {alerts.length === 0 ? <article><span className="file-chip">OK</span><div><strong>{isEmptyOperationalCantiere ? 'Bozza senza criticità' : 'Nessun controllo urgente'}</strong><small>{isEmptyOperationalCantiere ? 'Collega il primo documento per iniziare i controlli.' : 'Documento e contabilità risultano ordinati.'}</small></div></article> : null}
      </div>
    </section>
  )
}

function WorkPackages({ lavorazioni, compact = false }) {
  return (
    <section className={compact ? 'detail-section-card compact-work-card' : 'detail-section-card'}>
      <div className="section-heading panel-title-row">
        <div><h2>Lavorazioni</h2><p>Gruppi derivati dai tab/lavorazioni del master.</p></div>
        <a className="button button-secondary button-small" href="#/dashboard/contabilita">Contabilità</a>
      </div>
      <div className="detail-work-list">
        {lavorazioni.map((item) => <article key={item.name}><div><strong>{formatLabel(item.name)}</strong><small>{item.movimenti} movimenti · <MoneyValue value={item.spent} /></small></div><StatusBadge>{item.status}</StatusBadge><ProgressBar value={item.progress} /></article>)}
        {lavorazioni.length === 0 ? <p>Nessuna lavorazione ancora collegata.</p> : null}
      </div>
    </section>
  )
}

function DocumentsTab({ documents, compact = false }) {
  return (
    <section className={compact ? 'detail-section-card compact-doc-card' : 'detail-section-card'}>
      <div className="section-heading panel-title-row"><div><h2>Documenti</h2><p>Righe e documenti collegati al cantiere.</p></div><a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a></div>
      <div className="detail-document-list">
        {documents.map((doc) => <a href={`#/dashboard/documenti/${doc.id}`} key={doc.id}><span className="file-chip file-pdf">DOC</span><div><strong>{doc.numeroDocumento ?? doc.tipoDocumento ?? 'Documento'}</strong><small>{doc.fornitore} · {formatLabel(doc.sheetTab ?? doc.categoria)}</small></div><strong><MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></strong><StatusBadge>{normalizeDocumentStatus(doc.statoVerifica)}</StatusBadge></a>)}
        {documents.length === 0 ? <p>Nessun documento collegato a questo cantiere.</p> : null}
      </div>
    </section>
  )
}

function PhotosTab({ photos }) {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><div><h2>Foto cantiere</h2><p>Foto operative collegate al cantiere.</p></div><a className="button button-secondary button-small" href="#/dashboard/foto">Tutte</a></div>
      <div className="detail-document-list">
        {photos.length ? photos.map((photo) => <a href={`#/dashboard/foto/${photo.id}`} key={photo.id}><span className="file-chip">IMG</span><div><strong>{photo.fileName ?? photo.zona ?? 'Foto cantiere'}</strong><small>{photo.lavorazione ?? photo.zona ?? 'Senza zona'} · {formatDate(photo.dataCaricamento)}</small></div><StatusBadge>{photo.stato ?? 'Da revisionare'}</StatusBadge></a>) : <p>Nessuna foto collegata a questo cantiere.</p>}
      </div>
    </section>
  )
}

function NotesTab({ notes, noteText, noteStatus, setNoteText, submitNote }) {
  return (
    <section className="detail-section-card">
      <div className="section-heading panel-title-row"><div><h2>Note cantiere</h2><p>Note operative persistenti collegate al cantiere.</p></div><StatusBadge>{notes.length} note</StatusBadge></div>
      <form className="mock-form detail-edit-form" onSubmit={submitNote}>
        <label className="form-wide">Nuova nota<textarea rows="3" value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Es. verificare bonifico, foto mancanti, materiale da controllare..." /></label>
        <button className="button button-primary" type="submit">Salva nota</button>
        {noteStatus ? <p className={noteStatus.type === 'error' ? 'form-error-text' : 'form-success-text'}>{noteStatus.message}</p> : null}
      </form>
      <div className="detail-mini-list">
        {notes.length ? notes.map((note) => <article key={note.id}><div><strong>{note.text}</strong><small>{note.author ?? 'Utente'} · {note.date ?? '-'}</small></div></article>) : <p>Nessuna nota ancora salvata.</p>}
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
        {accountingRows.map((movimento) => <a href={`#/dashboard/contabilita/${movimento.id}`} key={movimento.id}><div><strong>{movimento.descrizione}</strong><small>{movimento.fornitore} · {formatLabel(movimento.sheetTab ?? movimento.categoria)}</small></div><span><MoneyValue value={movimento.imponibile} /></span><span><MoneyValue value={movimento.iva} /></span><strong><MoneyValue value={movimento.totale} /></strong><StatusBadge>{normalizeDocumentStatus(movimento.statoVerifica)}</StatusBadge></a>)}
        {accountingRows.length === 0 ? <p>Nessun movimento contabile collegato.</p> : null}
      </div>
    </section>
  )
}

function RecentDocumentsPanel({ documents }) {
  return (
    <section className="detail-side-card">
      <div className="section-heading panel-title-row"><h2>Ultimi documenti</h2><a className="button button-secondary button-small" href="#/dashboard/documenti">Tutti</a></div>
      <div className="detail-mini-list">
        {documents.map((doc) => <a href={`#/dashboard/documenti/${doc.id}`} key={doc.id}><div><strong>{doc.numeroDocumento ?? doc.tipoDocumento}</strong><small>{doc.fornitore} · {formatDate(doc.dataDocumento)}</small></div><span><MoneyValue value={doc.totale ?? doc.importoTotale ?? 0} /></span></a>)}
        {documents.length === 0 ? <p>Nessun documento recente.</p> : null}
      </div>
    </section>
  )
}

function RecentActivityPanel({ documents, uploads, notes }) {
  const activities = [
    ...documents.map((item) => ({ id: `doc-${item.id}`, title: item.numeroDocumento ?? item.descrizione, meta: `${item.categoria} · ${formatDate(item.dataDocumento)}`, status: item.statoVerifica, href: `#/dashboard/documenti/${item.id}` })),
    ...uploads.map((item) => ({ id: `upload-${item.id}`, title: item.fileName ?? item.tipoDocumento ?? 'Caricamento', meta: `${item.caricatoDa ?? 'Utente'} · ${formatDate(item.dataCaricamento)}`, status: item.stato, href: '#/dashboard/caricamenti' })),
    ...notes.map((item) => ({ id: `note-${item.id}`, title: item.text, meta: `${item.author ?? 'Utente'} · ${item.date ?? ''}`, status: 'Nota', href: '#/dashboard/cantieri' })),
  ].slice(0, 6)

  return <ActivityFeed title="Timeline" items={activities} />
}

function buildCantiere(cantiereId, documents, movements, cantiereRecord) {
  if (!documents.length && !movements.length && !cantiereRecord) return null
  const first = documents[0] ?? movements[0]
  const lastDate = [...documents.map((doc) => doc.dataDocumento), ...movements.map((row) => row.data), cantiereRecord?.updatedAt, cantiereRecord?.createdAt].filter(Boolean).sort().at(-1)
  return {
    id: cantiereId,
    nome: cantiereRecord?.nome ?? first?.cantiere ?? 'Cantiere',
    cliente: cantiereRecord?.cliente ?? cantiereRecord?.nome ?? first?.cantiere ?? 'Cantiere',
    indirizzo: cantiereRecord?.indirizzo || (first ? 'Fonte: BARCELO_ROMA_master Google Sheets' : 'Creato da hub operativo'),
    localita: cantiereRecord?.localita || (cantiereId === 'barcelo-roma' ? 'Roma, zona Eur' : 'Da hub'),
    avanzamento: Number(cantiereRecord?.avanzamento ?? (first ? 100 : 0)),
    lastDate,
    source: cantiereRecord ? 'supabase-operational' : 'documents',
  }
}

function normalizeMovementRow(row) {
  return {
    id: row.id,
    documentId: row.documentId,
    cantiereId: row.cantiereId ?? 'barcelo-roma',
    cantiere: row.cantiere ?? 'Barcelò Roma',
    data: row.data ?? row.dataDocumento,
    descrizione: row.descrizione ?? row.tipoDocumento ?? 'Movimento',
    fornitore: row.fornitore ?? 'Non indicato',
    categoria: row.categoria ?? 'Extra / Altro',
    sheetTab: row.sheetTab ?? 'Senza tab',
    numeroDocumento: row.numeroDocumento ?? row.fileName ?? row.id,
    imponibile: Number(row.imponibile || 0),
    iva: Number(row.iva || 0),
    totale: Number(row.totale || row.importoTotale || 0),
    statoVerifica: row.statoVerifica ?? 'Da verificare',
  }
}

function documentToAccountingRow(document) {
  return normalizeMovementRow({
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento,
    fornitore: document.fornitore,
    categoria: document.categoria,
    sheetTab: document.sheetTab,
    numeroDocumento: document.numeroDocumento ?? document.fileName,
    imponibile: document.imponibile,
    iva: document.iva,
    totale: document.totale ?? document.importoTotale,
    statoVerifica: document.statoVerifica,
  })
}

function getTotals(rows) {
  return rows.reduce((acc, row) => ({ imponibile: acc.imponibile + row.imponibile, iva: acc.iva + row.iva, totale: acc.totale + row.totale, daVerificare: acc.daVerificare + (row.statoVerifica === 'Da verificare' ? 1 : 0) }), { imponibile: 0, iva: 0, totale: 0, daVerificare: 0 })
}

function getCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => { const key = row.sheetTab ?? row.categoria ?? 'Senza tab'; acc[key] = (acc[key] ?? 0) + row.totale; return acc }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped).map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 })).sort((a, b) => b.totale - a.totale)
}

function getWorkPackages(movements, documents) {
  const source = movements.length ? movements : documents.map(documentToAccountingRow)
  const grouped = source.reduce((acc, row) => {
    const name = row.sheetTab ?? row.categoria ?? 'Senza tab'
    if (!acc[name]) acc[name] = { name, spent: 0, movimenti: 0 }
    acc[name].spent += Number(row.totale || 0)
    acc[name].movimenti += 1
    return acc
  }, {})
  const rows = Object.values(grouped).sort((a, b) => b.spent - a.spent)
  const max = Math.max(...rows.map((row) => row.spent), 1)
  return rows.map((row) => ({ ...row, progress: Math.max(5, Math.round((row.spent / max) * 100)), status: 'Importata' }))
}

function normalizeDocumentStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status ?? 'Da verificare'
}

function formatLabel(value) {
  return String(value ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
