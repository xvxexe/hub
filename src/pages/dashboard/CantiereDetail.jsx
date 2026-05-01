import { useState } from 'react'
import { NotesPanel } from '../../components/EntityPanels'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { ActivityFeed, DashboardHeader, MockActionModal } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import {
  formatCurrency,
  formatDate,
  getCantiereById,
  getCantiereTotals,
} from '../../data/mockCantieri'
import {
  getAccountingTotals,
  getMovimentiByCantiere,
} from '../../data/mockMovimentiContabili'
import {
  accountingWarnings,
  pendingChecks,
  recentPayments,
  siteWorkPackages,
} from '../../data/mockHubData'

const tabs = ['Panoramica', 'Lavorazioni', 'Documenti', 'Contabilità', 'Report']

export function CantiereDetail({ cantiereId, fotoUploads = [], documentUploads = [], session, activities = [], notes = [], onAddNote }) {
  const [activeTab, setActiveTab] = useState('Panoramica')
  const [modalAction, setModalAction] = useState(null)
  const cantiere = getCantiereById(cantiereId)

  if (!cantiere) {
    return (
      <section className="dashboard-header">
        <p className="eyebrow">Cantiere non trovato</p>
        <h1>Il cantiere richiesto non esiste</h1>
        <p>Controlla la lista cantieri mock e apri un dettaglio disponibile.</p>
        <a className="button button-secondary" href="#/dashboard/cantieri">
          Torna ai cantieri
        </a>
      </section>
    )
  }

  const totals = getCantiereTotals(cantiere)
  const canViewEconomics = session?.role !== 'employee'
  const availableTabs = canViewEconomics ? tabs : tabs.filter((tab) => tab !== 'Spese')
  const currentTab = availableTabs.includes(activeTab) ? activeTab : 'Panoramica'
  const linkedFotoUploads = fotoUploads.filter((upload) => upload.cantiereId === cantiere.id)
  const linkedDocumentUploads = documentUploads.filter((upload) => {
    const isSameSite = upload.cantiereId === cantiere.id
    const isAllowedForEmployee = session?.role !== 'employee' || upload.caricatoDa === session.name
    return isSameSite && isAllowedForEmployee
  })
  const movimentiContabili = canViewEconomics ? getMovimentiByCantiere(cantiere.id) : []
  const accountingTotals = getAccountingTotals(movimentiContabili)

  return (
    <>
      <DashboardHeader
        eyebrow="Dettaglio cantiere"
        title={`Cantiere - ${cantiere.nome}`}
        description={cantiere.descrizione}
      >
        <StatusBadge>{cantiere.stato}</StatusBadge>
        <a className="button button-secondary" href="#/dashboard/upload">Carica documento</a>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => setModalAction({
            icon: 'wallet',
            title: 'Nuova spesa mock',
            text: `Registra una nuova spesa per ${cantiere.nome}. Per ora il dato resta dimostrativo e pronto per il futuro backend.`,
            confirmLabel: 'Salva spesa mock',
            fields: [
              { label: 'Fornitore', placeholder: 'Es. Eurofer' },
              { label: 'Importo', type: 'number', placeholder: '1250' },
              { label: 'Categoria', type: 'select', options: ['Materiali', 'Manodopera', 'Noleggi', 'FIR rifiuti'] },
            ],
          })}
        >
          Nuova spesa
        </button>
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
          <a className="text-link" href="#/dashboard/cantieri">
            Torna alla lista
          </a>
          <h2>{cantiere.cliente}</h2>
          <p>{cantiere.indirizzo} · {cantiere.localita}</p>
        </div>
        <div className="detail-status-card">
          <StatusBadge>{cantiere.stato}</StatusBadge>
          <ProgressBar value={cantiere.avanzamento} />
        </div>
      </section>

      <section className="detail-summary-grid">
        <SummaryItem label="Cliente" value={cantiere.cliente} />
        <SummaryItem label="Indirizzo/localita" value={`${cantiere.indirizzo} · ${cantiere.localita}`} />
        <SummaryItem label="Responsabile" value={cantiere.responsabile} />
        <SummaryItem label="Data inizio" value={formatDate(cantiere.dataInizio)} />
        <SummaryItem label="Fine prevista" value={formatDate(cantiere.dataFinePrevista)} />
        {canViewEconomics ? <SummaryItem label="Spese mock" value={formatCurrency(accountingTotals.totale)} /> : null}
      </section>

      <section className="detail-tabs" aria-label="Sezioni dettaglio cantiere">
        {availableTabs.map((tab) => (
          <button
            aria-pressed={currentTab === tab}
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="detail-tab-panel">
        {renderTab(
          currentTab,
          cantiere,
          totals,
          linkedFotoUploads,
          linkedDocumentUploads,
          movimentiContabili,
          accountingTotals,
          canViewEconomics,
          session,
          activities,
          notes,
          onAddNote,
          setModalAction,
        )}
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

function renderTab(
  activeTab,
  cantiere,
  totals,
  linkedFotoUploads,
  linkedDocumentUploads,
  movimentiContabili,
  accountingTotals,
  canViewEconomics,
  session,
  activities,
  notes,
  onAddNote,
  onMockAction,
) {
  if (activeTab === 'Panoramica') {
    return (
      <div className="cantiere-overview-grid">
        {canViewEconomics ? (
          <CostSplitPanel accountingTotals={accountingTotals} onMockAction={onMockAction} />
        ) : (
          <article className="info-card">
            <h2>Riepilogo operativo</h2>
            <dl className="detail-list">
              <div>
                <dt>Documenti</dt>
                <dd>{totals.documenti}</dd>
              </div>
              <div>
                <dt>Foto</dt>
                <dd>{totals.foto}</dd>
              </div>
              <div>
                <dt>Problemi aperti</dt>
                <dd>{totals.problemi}</dd>
              </div>
            </dl>
          </article>
        )}
        <MaterialsPanel accountingTotals={accountingTotals} />
        <SideOperationalPanels />
        <WorkPackages onMockAction={onMockAction} />
        <RecentDocuments linkedDocumentUploads={linkedDocumentUploads} cantiere={cantiere} session={session} />
        <RecentPayments onMockAction={onMockAction} />
        <TimelinePanel cantiere={cantiere} linkedFotoUploads={linkedFotoUploads} linkedDocumentUploads={linkedDocumentUploads} />
      </div>
    )
  }

  if (activeTab === 'Lavorazioni') {
    return <WorkPackages onMockAction={onMockAction} />
  }

  if (activeTab === 'Foto') {
    return (
      <>
        <div className="detail-list-grid">
          {cantiere.foto.map((foto) => (
            <article className="mock-photo-card" key={foto.id}>
              <div className="mock-photo-thumb">Foto mock</div>
              <h3>{foto.titolo}</h3>
              <p>{formatDate(foto.data)} · {foto.autore}</p>
            </article>
          ))}
        </div>
        <LinkedUploads title="Caricamenti foto collegati">
          {linkedFotoUploads.map((foto) => (
            <article className="recent-upload-card" key={foto.id}>
              <FilePreviewMock fileName={foto.fileName} type="image" />
              <div>
                <div className="recent-upload-title">
                  <h3>{foto.zona} · {foto.lavorazione}</h3>
                  <StatusBadge>{foto.stato}</StatusBadge>
                </div>
                <p>{foto.nota}</p>
                <small>{formatDate(foto.dataCaricamento)} · {foto.caricatoDa}</small>
                <a className="text-link" href={`#/dashboard/foto/${foto.id}`}>Apri dettaglio foto</a>
              </div>
            </article>
          ))}
        </LinkedUploads>
      </>
    )
  }

  if (activeTab === 'Documenti') {
    return (
      <>
        {session?.role !== 'employee' ? (
          <div className="table-card">
            {cantiere.documenti.map((documento) => (
              <div className="table-row table-row-4" key={documento.id}>
                <strong>{documento.nome}</strong>
                <span>{documento.tipo}</span>
                <StatusBadge>{documento.stato}</StatusBadge>
              </div>
            ))}
          </div>
        ) : null}
        <LinkedUploads title="Caricamenti documenti collegati">
          {linkedDocumentUploads.map((documento) => (
            <article className="recent-upload-card" key={documento.id}>
              <FilePreviewMock fileName={documento.fileName} />
              <div>
                <div className="recent-upload-title">
                  <h3>{documento.tipoDocumento} · {documento.fornitore}</h3>
                  <StatusBadge>{documento.stato}</StatusBadge>
                </div>
                <p>{documento.descrizione}</p>
                <small>
                  {formatDate(documento.dataCaricamento)} · {documento.caricatoDa}
                  {session?.role !== 'employee' ? ` · ${formatCurrency(documento.importoTotale)}` : ''}
                </small>
                <a className="text-link" href={`#/dashboard/documenti/${documento.id}`}>Apri dettaglio documento</a>
              </div>
            </article>
          ))}
        </LinkedUploads>
      </>
    )
  }

  if (activeTab === 'Contabilità') {
    return (
      <>
        <section className="accounting-summary-grid detail-accounting-summary">
          <article className="stat-card">
            <span>Totale imponibile</span>
            <strong><MoneyValue value={accountingTotals.imponibile} /></strong>
          </article>
          <article className="stat-card">
            <span>Totale IVA</span>
            <strong><MoneyValue value={accountingTotals.iva} /></strong>
          </article>
          <article className="stat-card">
            <span>Totale complessivo</span>
            <strong><MoneyValue value={accountingTotals.totale} /></strong>
          </article>
          <article className="stat-card">
            <span>Documenti da verificare</span>
            <strong>{accountingTotals.daVerificare}</strong>
          </article>
        </section>
        <div className="table-card">
          {movimentiContabili.map((movimento) => (
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

  if (activeTab === 'Report') {
    return (
      <div className="detail-two-column">
        <article className="info-card">
          <h2>Report cantiere mock</h2>
          <p>Anteprima per PDF con stato avanzamento, documenti critici, riepilogo materiali e note operative.</p>
          <div className="row-actions">
            <button className="button button-primary" type="button" onClick={() => onMockAction(reportAction(cantiere))}>Report PDF</button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => onMockAction({
                icon: 'link',
                title: 'Condivisione mock',
                text: 'Link dimostrativo pronto per invio a cliente o team interno.',
                confirmLabel: 'Copia link mock',
              })}
            >
              Condividi mock
            </button>
          </div>
        </article>
        <ActivityFeed
          title="Verifiche e scadenze"
          items={pendingChecks.map((item) => ({
            title: item.title,
            meta: item.date,
            status: item.status,
          }))}
        />
      </div>
    )
  }

  if (activeTab === 'Note') {
    return (
      <>
        <div className="detail-list-grid">
          {cantiere.note.map((nota) => (
            <article className="info-card" key={nota}>
              <h3>Nota operativa</h3>
              <p>{nota}</p>
            </article>
          ))}
        </div>
        {onAddNote ? <NotesPanel entityType="cantieri" entityId={cantiere.id} notes={notes} onAddNote={onAddNote} /> : null}
      </>
    )
  }

  if (activeTab === 'Problemi') {
    return (
      <div className="detail-list-grid">
        {cantiere.problemi.length > 0 ? (
          cantiere.problemi.map((problema) => (
            <article className="info-card problem-card" key={problema.id}>
              <StatusBadge>{problema.priorita}</StatusBadge>
              <h3>{problema.titolo}</h3>
              <p>{problema.stato}</p>
            </article>
          ))
        ) : (
          <article className="info-card">
            <h3>Nessun problema aperto</h3>
            <p>Il cantiere non ha elementi da controllare nei dati mock.</p>
          </article>
        )}
      </div>
    )
  }

  if (activeTab === 'Attività recenti') {
    const activityItems = [
      ...linkedFotoUploads.map((item) => ({
        title: `Foto caricata: ${item.lavorazione}`,
        meta: `${item.zona} · ${item.caricatoDa} · ${formatDate(item.dataCaricamento)}`,
        status: item.stato,
      })),
      ...linkedDocumentUploads.map((item) => ({
        title: `Documento: ${item.tipoDocumento}`,
        meta: `${item.fornitore || item.descrizione} · ${item.caricatoDa} · ${formatDate(item.dataCaricamento)}`,
        status: item.stato,
      })),
      ...cantiere.problemi.map((item) => ({
        title: `Problema: ${item.titolo}`,
        meta: `${cantiere.nome} · ${item.stato}`,
        status: item.priorita,
      })),
    ]

    return (
      <ActivityFeed
        title="Attività recenti cantiere"
        items={[
          ...activities.filter((item) => item.entityId === cantiere.id || item.description.includes(cantiere.nome)).map((item) => ({
            title: item.description,
            meta: `${item.author} · ${item.date}`,
            status: item.type,
          })),
          ...activityItems,
        ]}
      />
    )
  }

  return (
    <div className="detail-list-grid">
      {cantiere.problemi.length > 0 ? (
        cantiere.problemi.map((problema) => (
          <article className="info-card problem-card" key={problema.id}>
            <StatusBadge>{problema.priorita}</StatusBadge>
            <h3>{problema.titolo}</h3>
            <p>{problema.stato}</p>
          </article>
        ))
      ) : (
        <article className="info-card">
          <h3>Nessun problema aperto</h3>
          <p>Il cantiere non ha elementi da controllare nei dati mock.</p>
        </article>
      )}
    </div>
  )
}

function LinkedUploads({ title, children }) {
  return (
    <section className="linked-uploads">
      <h2>{title}</h2>
      <div className="recent-upload-list">{children}</div>
    </section>
  )
}

function CostSplitPanel({ accountingTotals, onMockAction }) {
  return (
    <article className="info-card cost-card">
      <div className="section-heading panel-title-row">
        <h2>Riepilogo costi per categoria</h2>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => onMockAction({
            icon: 'calendar',
            title: 'Periodo costi',
            text: 'Filtro periodo mock per riepilogo costi. I dati reali potranno arrivare da contabilità e movimenti collegati.',
            confirmLabel: 'Applica periodo',
            fields: [{ label: 'Periodo', type: 'select', options: ['Questo mese', 'Ultimi 30 giorni', 'Trimestre', 'Anno'] }],
          })}
        >
          Questo mese
        </button>
      </div>
      <div className="cost-summary">
        <div>
          <span>Totale spese</span>
          <strong><MoneyValue value={accountingTotals.totale} /></strong>
          <small className="positive-trend">-8,4% rispetto al mese scorso</small>
        </div>
        <div className="donut-chart"><span>Totale<br /><MoneyValue value={accountingTotals.totale} /></span></div>
        <dl className="detail-list">
          <div><dt>Materiali</dt><dd><MoneyValue value={accountingTotals.totale * 0.488} /></dd></div>
          <div><dt>Manodopera</dt><dd><MoneyValue value={accountingTotals.totale * 0.279} /></dd></div>
          <div><dt>Noleggi / Servizi</dt><dd><MoneyValue value={accountingTotals.totale * 0.14} /></dd></div>
          <div><dt>FIR / Rifiuti</dt><dd><MoneyValue value={accountingTotals.totale * 0.055} /></dd></div>
        </dl>
      </div>
    </article>
  )
}

function MaterialsPanel({ accountingTotals }) {
  const materials = accountingTotals.totale * 0.488
  const nonMaterials = accountingTotals.totale - materials
  return (
    <article className="info-card">
      <h2>Sintesi materiali vs non materiali</h2>
      <div className="split-bar"><span style={{ width: '48.8%' }} /></div>
      <div className="material-cards">
        <div><span>Materiali</span><strong><MoneyValue value={materials} /></strong><small>48,8% del totale</small></div>
        <div><span>Non materiali</span><strong><MoneyValue value={nonMaterials} /></strong><small>51,2% del totale</small></div>
      </div>
    </article>
  )
}

function SideOperationalPanels() {
  return (
    <div className="side-operational-panels">
      <article className="info-card note-highlight">
        <h2>Note operative</h2>
        <p>Prossima consegna materiali prevista per il 26/05. Coordinare accessi gru con impresa impianti.</p>
      </article>
      <article className="info-card">
        <h2>Alert contabili</h2>
        <div className="activity-feed">
          {accountingWarnings.map((item) => (
            <article className="activity-item" key={item.id}>
              <span />
              <div><strong>{item.title}</strong><small>{item.detail}</small></div>
              <StatusBadge>{item.status}</StatusBadge>
            </article>
          ))}
        </div>
      </article>
      <ActivityFeed title="Verifiche in attesa" items={pendingChecks.map((item) => ({ title: item.title, meta: item.date, status: item.status }))} />
    </div>
  )
}

function WorkPackages({ onMockAction }) {
  return (
    <article className="info-card work-packages">
      <div className="section-heading panel-title-row">
        <h2>Lavorazioni principali</h2>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => onMockAction({
            icon: 'building',
            title: 'Lavorazioni complete',
            text: 'Elenco completo mock di lavorazioni, avanzamenti, budget e spese collegate.',
            confirmLabel: 'Ok',
          })}
        >
          Vedi tutte
        </button>
      </div>
      <div className="hub-table work-package-table">
        <div className="hub-table-head work-package-row"><span>Lavorazione</span><span>Stato</span><span>Avanzamento</span><span>Budget</span><span>Speso</span></div>
        {siteWorkPackages.map((item) => (
          <article className="hub-table-row work-package-row" key={item.name}>
            <strong>{item.name}</strong>
            <StatusBadge>{item.status}</StatusBadge>
            <ProgressBar value={item.progress} />
            <span><MoneyValue value={item.budget} /></span>
            <span><MoneyValue value={item.spent} /></span>
          </article>
        ))}
      </div>
    </article>
  )
}

function RecentDocuments({ linkedDocumentUploads, cantiere, session }) {
  const fallbackDocs = cantiere.documenti.map((doc) => ({
    id: doc.id,
    tipoDocumento: doc.tipo,
    fornitore: doc.nome,
    dataCaricamento: cantiere.dataInizio,
    stato: doc.stato,
  }))
  const docs = linkedDocumentUploads.length > 0 ? linkedDocumentUploads : fallbackDocs
  return (
    <article className="info-card">
      <div className="section-heading panel-title-row"><h2>Ultimi documenti</h2><a className="button button-secondary button-small" href="#/dashboard/documenti">Vedi tutti</a></div>
      <div className="activity-feed">
        {docs.slice(0, 5).map((doc) => (
          <a className="activity-item interactive-row" href={doc.fileName ? `#/dashboard/documenti/${doc.id}` : '#/dashboard/documenti'} key={doc.id}>
            <span />
            <div><strong>{doc.tipoDocumento}</strong><small>{doc.fornitore}{session?.role !== 'employee' && doc.importoTotale ? ` · ${formatCurrency(doc.importoTotale)}` : ''}</small></div>
            <StatusBadge>{doc.stato}</StatusBadge>
          </a>
        ))}
      </div>
    </article>
  )
}

function RecentPayments({ onMockAction }) {
  return (
    <article className="info-card">
      <div className="section-heading panel-title-row">
        <h2>Pagamenti recenti / Bonifici</h2>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => onMockAction({
            icon: 'wallet',
            title: 'Pagamenti completi mock',
            text: 'Vista pagamenti completa pronta per filtrare bonifici, fatture collegate e stati di verifica.',
            confirmLabel: 'Ok',
          })}
        >
          Vedi tutti
        </button>
      </div>
      <div className="hub-table">
        {recentPayments.map((payment) => (
          <article className="hub-table-row payment-row" key={payment.id}>
            <span>{payment.date}</span><strong>{payment.supplier}</strong><span>{payment.document}</span><span><MoneyValue value={payment.amount} /></span><StatusBadge>{payment.status}</StatusBadge>
          </article>
        ))}
      </div>
    </article>
  )
}

function reportAction(cantiere) {
  return {
    icon: 'report',
    title: `Report PDF - ${cantiere.nome}`,
    text: 'Preparazione export PDF mock con avanzamento, documenti critici, costi e timeline. Nessun file reale viene generato in questa fase.',
    confirmLabel: 'Genera mock',
    fields: [{ label: 'Formato', type: 'select', options: ['PDF riepilogo', 'PDF completo', 'CSV contabile'] }],
  }
}

function TimelinePanel({ cantiere, linkedFotoUploads, linkedDocumentUploads }) {
  return (
    <ActivityFeed
      title="Timeline attività"
      items={[
        ...linkedDocumentUploads.slice(0, 2).map((item) => ({ title: `Caricato ${item.tipoDocumento}`, meta: `${item.fornitore} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
        ...linkedFotoUploads.slice(0, 2).map((item) => ({ title: `Foto caricata: ${item.lavorazione}`, meta: `${item.zona} · ${formatDate(item.dataCaricamento)}`, status: item.stato })),
        ...cantiere.problemi.map((item) => ({ title: item.titolo, meta: item.stato, status: item.priorita })),
      ]}
    />
  )
}
