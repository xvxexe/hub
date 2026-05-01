import { useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal, StatCard } from '../../components/InternalComponents'
import { MoneyValue } from '../../components/MoneyValue'
import { ProgressBar } from '../../components/ProgressBar'
import { StatusBadge } from '../../components/StatusBadge'
import { formatCurrency, mockCantieri } from '../../data/mockCantieri'
import { costBreakdown, pendingChecks, recentPayments } from '../../data/mockHubData'

export function ReportMock() {
  const [modalAction, setModalAction] = useState(null)
  const activeSites = mockCantieri.filter((item) => item.stato === 'attivo').length
  const averageProgress = Math.round(mockCantieri.reduce((sum, item) => sum + item.avanzamento, 0) / mockCantieri.length)
  const budget = 9745000
  const spent = 5284200

  return (
    <>
      <DashboardHeader
        eyebrow="Report mock"
        title="Report"
        description="Vista riepilogativa pronta per export PDF mock, senza generazione reale."
      >
        <DataModeBadge />
        <button
          className="button button-primary"
          type="button"
          onClick={() => setModalAction({
            icon: 'report',
            title: 'Export report PDF mock',
            text: 'Generazione dimostrativa del report con cantieri, costi, verifiche e pagamenti. Il file reale verrà collegato al backend in una fase successiva.',
            confirmLabel: 'Genera mock',
            fields: [{ label: 'Tipo report', type: 'select', options: ['Direzionale', 'Contabile', 'Operativo cantiere'] }],
          })}
        >
          Report PDF
        </button>
      </DashboardHeader>

      <section className="stats-grid hub-kpi-grid">
        <StatCard icon="building" label="Cantieri attivi" value={activeSites} />
        <StatCard icon="report" label="Avanzamento medio" value={`${averageProgress}%`} />
        <StatCard icon="wallet" tone="green" label="Budget totale" value={formatCurrency(budget)} />
        <StatCard icon="file" tone="amber" label="Spese registrate" value={<MoneyValue value={spent} />} />
      </section>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Andamento cantieri</h2></div>
          <div className="site-progress-list">
            {mockCantieri.map((cantiere) => (
              <article className="site-progress-row" key={cantiere.id}>
                <div><strong>{cantiere.nome}</strong><small>{cantiere.responsabile}</small></div>
                <ProgressBar value={cantiere.avanzamento} />
                <StatusBadge>{cantiere.stato === 'attivo' ? 'In corso' : cantiere.stato}</StatusBadge>
              </article>
            ))}
          </div>
        </section>

        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Riepilogo costi</h2></div>
          <div className="cost-legend report-cost-list">
            {costBreakdown.map((item) => (
              <div key={item.label}>
                <span style={{ background: item.color }} />
                <strong>{item.label}</strong>
                <small><MoneyValue value={item.value} /> · {item.percent}%</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="internal-two-column">
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Verifiche in attesa</h2></div>
          <div className="activity-feed">
            {pendingChecks.map((item) => (
              <article className="activity-item" key={item.id}>
                <span />
                <div><strong>{item.title}</strong><small>{item.date}</small></div>
                <StatusBadge>{item.status}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <section className="internal-panel">
          <div className="section-heading panel-title-row"><h2>Pagamenti recenti</h2></div>
          <div className="hub-table">
            {recentPayments.map((payment) => (
              <article className="hub-table-row payment-row" key={payment.id}>
                <span>{payment.date}</span><strong>{payment.supplier}</strong><span>{payment.document}</span><span><MoneyValue value={payment.amount} /></span><StatusBadge>{payment.status}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
      </div>
      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}
