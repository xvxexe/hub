import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'

export function ReportMock({ documents = [] }) {
  const [modalAction, setModalAction] = useState(null)
  const rows = documents.map(toAccountingRow)
  const sites = useMemo(() => buildSites(rows), [rows])
  const categoryTotals = useMemo(() => buildCategoryTotals(rows), [rows])
  const totals = rows.reduce((acc, row) => ({
    imponibile: acc.imponibile + row.imponibile,
    iva: acc.iva + row.iva,
    totale: acc.totale + row.totale,
  }), { imponibile: 0, iva: 0, totale: 0 })
  const pending = rows.filter((row) => ['Da verificare', 'Incompleto', 'Possibile duplicato'].includes(row.statoVerifica))
  const payments = rows.filter((row) => row.pagamento?.toLowerCase().includes('bonifico') || row.categoria?.toLowerCase().includes('bonifici'))

  return (
    <>
      <DashboardHeader
        eyebrow="Report reale"
        title="Report"
        description="Riepilogo generato dai dati Supabase importati da BARCELO_ROMA_master."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button
          className="button button-primary"
          type="button"
          onClick={() => setModalAction({
            icon: 'report',
            title: 'Export report',
            text: 'La generazione PDF reale non è ancora collegata. I dati visualizzati sono già quelli reali dello store Supabase.',
            confirmLabel: 'Ok',
          })}
        >
          Report PDF
        </button>
      </DashboardHeader>

      <section className="stats-grid hub-kpi-grid">
        <StatCard icon="building" label="Cantieri" value={sites.length} />
        <StatCard icon="report" label="Righe importate" value={rows.length} />
        <StatCard icon="wallet" tone="green" label="Imponibile" value={<MoneyValue value={totals.imponibile} />} />
        <StatCard icon="file" tone="amber" label="Totale spese" value={<MoneyValue value={totals.totale} />} />
      </section>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Andamento cantieri</h2></div>
          <div className="site-progress-list">
            {sites.map((cantiere) => (
              <article className="site-progress-row" key={cantiere.id}>
                <div><strong>{cantiere.nome}</strong><small>{cantiere.localita}</small></div>
                <ProgressBar value={cantiere.avanzamento} />
                <StatusBadge>In corso</StatusBadge>
              </article>
            ))}
          </div>
        </section>

        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Riepilogo costi</h2></div>
          <div className="cost-legend report-cost-list">
            {categoryTotals.map((item) => (
              <div key={item.categoria}>
                <span />
                <strong>{item.categoria}</strong>
                <small><MoneyValue value={item.totale} /> · {item.percent}%</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Verifiche in attesa</h2></div>
          <div className="activity-feed">
            {pending.length > 0 ? pending.slice(0, 6).map((item) => (
              <article className="activity-item" key={item.id}>
                <span />
                <div><strong>{item.descrizione}</strong><small>{item.fornitore} · {formatDate(item.data)}</small></div>
                <StatusBadge>{item.statoVerifica}</StatusBadge>
              </article>
            )) : <p>Nessuna verifica aperta nei dati importati.</p>}
          </div>
        </section>
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Pagamenti / bonifici</h2></div>
          <div className="hub-table">
            {(payments.length ? payments : rows).slice(0, 6).map((payment) => (
              <article className="hub-table-row payment-row" key={payment.id}>
                <span>{formatDate(payment.data)}</span><strong>{payment.fornitore}</strong><span>{payment.numeroDocumento}</span><span><MoneyValue value={payment.totale} /></span><StatusBadge>{payment.statoVerifica}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function toAccountingRow(document) {
  return {
    id: document.id,
    cantiereId: document.cantiereId ?? 'barcelo-roma',
    cantiere: document.cantiere ?? 'Barcelò Roma',
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento,
    fornitore: document.fornitore ?? 'Non indicato',
    categoria: document.categoria ?? 'Extra / Altro',
    numeroDocumento: document.numeroDocumento ?? document.fileName ?? document.id,
    imponibile: Number(document.imponibile || 0),
    iva: Number(document.iva || 0),
    totale: Number(document.totale || document.importoTotale || 0),
    pagamento: document.pagamento ?? '',
    statoVerifica: document.statoVerifica ?? 'Da verificare',
  }
}

function buildSites(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.cantiereId]) acc[row.cantiereId] = { id: row.cantiereId, nome: row.cantiere, localita: 'Roma, zona Eur', totale: 0 }
    acc[row.cantiereId].totale += row.totale
    return acc
  }, {})
  const sites = Object.values(groups)
  const max = Math.max(...sites.map((site) => site.totale), 1)
  return sites.map((site) => ({ ...site, avanzamento: Math.max(5, Math.round((site.totale / max) * 100)) }))
}

function buildCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => {
    acc[row.categoria] = (acc[row.categoria] ?? 0) + row.totale
    return acc
  }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped)
    .map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 }))
    .sort((a, b) => b.totale - a.totale)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
