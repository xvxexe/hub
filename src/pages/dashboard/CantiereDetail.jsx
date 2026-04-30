import { useState } from 'react'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { ActivityFeed, DashboardHeader } from '../../components/InternalComponents'
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

const tabs = ['Panoramica', 'Foto', 'Documenti', 'Spese', 'Note', 'Problemi']

export function CantiereDetail({ cantiereId, fotoUploads = [], documentUploads = [], session }) {
  const [activeTab, setActiveTab] = useState('Panoramica')
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
        eyebrow="Dettaglio cantiere interno"
        title={cantiere.nome}
        description={cantiere.descrizione}
      >
        <StatusBadge>{cantiere.stato}</StatusBadge>
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
        )}
      </section>
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
) {
  if (activeTab === 'Panoramica') {
    return (
      <div className="detail-two-column">
        <article className="info-card">
          <h2>Lavorazioni</h2>
          <ul className="clean-list">
            {cantiere.lavorazioni.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        {canViewEconomics ? (
          <article className="info-card">
            <h2>Riepilogo economico mock</h2>
            <dl className="detail-list">
              <div>
                <dt>Totale imponibile</dt>
                <dd><MoneyValue value={accountingTotals.imponibile} /></dd>
              </div>
              <div>
                <dt>Totale IVA</dt>
                <dd><MoneyValue value={accountingTotals.iva} /></dd>
              </div>
              <div>
                <dt>Totale complessivo</dt>
                <dd><MoneyValue value={accountingTotals.totale} /></dd>
              </div>
              <div>
                <dt>Documenti da verificare</dt>
                <dd>{accountingTotals.daVerificare}</dd>
              </div>
            </dl>
          </article>
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
      </div>
    )
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
              </div>
            </article>
          ))}
        </LinkedUploads>
      </>
    )
  }

  if (activeTab === 'Spese') {
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

  if (activeTab === 'Note') {
    return (
      <div className="detail-list-grid">
        {cantiere.note.map((nota) => (
          <article className="info-card" key={nota}>
            <h3>Nota operativa</h3>
            <p>{nota}</p>
          </article>
        ))}
      </div>
    )
  }

  if (activeTab === 'Problemi') {
    const activityItems = [
      ...linkedFotoUploads.slice(0, 2).map((item) => ({
        title: `Foto caricata: ${item.lavorazione}`,
        meta: `${item.zona} · ${item.caricatoDa}`,
        status: item.stato,
      })),
      ...linkedDocumentUploads.slice(0, 2).map((item) => ({
        title: `Documento: ${item.tipoDocumento}`,
        meta: `${item.fornitore} · ${item.caricatoDa}`,
        status: item.stato,
      })),
    ]

    return (
      <>
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
        <ActivityFeed title="Attività recenti cantiere" items={activityItems} />
      </>
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
