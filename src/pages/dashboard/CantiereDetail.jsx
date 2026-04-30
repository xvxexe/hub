import { useState } from 'react'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import {
  formatCurrency,
  formatDate,
  getCantiereById,
  getCantiereTotals,
} from '../../data/mockCantieri'

const tabs = ['Panoramica', 'Foto', 'Documenti', 'Spese', 'Note', 'Problemi']

export function CantiereDetail({ cantiereId }) {
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

  return (
    <>
      <section className="cantiere-detail-header">
        <div className="detail-title">
          <a className="text-link" href="#/dashboard/cantieri">
            Torna alla lista
          </a>
          <p className="eyebrow">Dettaglio cantiere interno</p>
          <h1>{cantiere.nome}</h1>
          <p>{cantiere.descrizione}</p>
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
        <SummaryItem label="Spese mock" value={formatCurrency(totals.spese)} />
      </section>

      <section className="detail-tabs" aria-label="Sezioni dettaglio cantiere">
        {tabs.map((tab) => (
          <button
            aria-pressed={activeTab === tab}
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="detail-tab-panel">{renderTab(activeTab, cantiere, totals)}</section>
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

function renderTab(activeTab, cantiere, totals) {
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
        <article className="info-card">
          <h2>Riepilogo economico mock</h2>
          <dl className="detail-list">
            <div>
              <dt>Totale spese</dt>
              <dd>{formatCurrency(totals.spese)}</dd>
            </div>
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
      </div>
    )
  }

  if (activeTab === 'Foto') {
    return (
      <div className="detail-list-grid">
        {cantiere.foto.map((foto) => (
          <article className="mock-photo-card" key={foto.id}>
            <div className="mock-photo-thumb">Foto mock</div>
            <h3>{foto.titolo}</h3>
            <p>{formatDate(foto.data)} · {foto.autore}</p>
          </article>
        ))}
      </div>
    )
  }

  if (activeTab === 'Documenti') {
    return (
      <div className="table-card">
        {cantiere.documenti.map((documento) => (
          <div className="table-row table-row-4" key={documento.id}>
            <strong>{documento.nome}</strong>
            <span>{documento.tipo}</span>
            <StatusBadge>{documento.stato}</StatusBadge>
          </div>
        ))}
      </div>
    )
  }

  if (activeTab === 'Spese') {
    return (
      <div className="table-card">
        {cantiere.spese.map((spesa) => (
          <div className="table-row table-row-4" key={spesa.id}>
            <strong>{spesa.voce}</strong>
            <span>{spesa.categoria}</span>
            <span>{formatCurrency(spesa.importo)}</span>
          </div>
        ))}
      </div>
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
