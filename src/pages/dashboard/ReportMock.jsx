import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge, MockActionModal } from '../../components/InternalComponents'
import {
  DataCardRow,
  KpiCard,
  KpiStrip,
  SideContextPanel,
  WorkspaceLayout,
} from '../../components/InternalLayout'
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
  const summary = buildBossSummary({ rows, sites, totals, pending, payments, categoryTotals })

  return (
    <>
      <DashboardHeader
        eyebrow="Report reale"
        title="Report"
        description="Riepilogo direzionale dai dati Supabase importati da BARCELO_ROMA_master: costi, criticità, pagamenti e categorie."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button
          className="button button-primary button-small"
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

      <KpiStrip ariaLabel="Indicatori report">
        <KpiCard icon="building" label="Cantieri" value={sites.length} hint="Nel master" />
        <KpiCard icon="report" label="Righe importate" value={rows.length} hint="Movimenti" />
        <KpiCard icon="wallet" tone="green" label="Imponibile" value={<MoneyValue value={totals.imponibile} />} hint="Totale netto" />
        <KpiCard icon="file" tone="amber" label="Totale spese" value={<MoneyValue value={totals.totale} />} hint="IVA inclusa" />
      </KpiStrip>

      <section className="internal-panel">
        <div className="section-heading panel-title-row">
          <div>
            <h2>Sintesi capo</h2>
            <p>Le informazioni più importanti prima dei dettagli: totale, problemi aperti e pagamenti da collegare.</p>
          </div>
          <StatusBadge>{pending.length ? `${pending.length} verifiche` : 'Tutto ok'}</StatusBadge>
        </div>
        <div className="document-card-list">
          {summary.map((item) => (
            <DataCardRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              status={item.status}
              meta={item.meta}
              href={item.href}
              warning={item.warning}
            />
          ))}
        </div>
      </section>

      <WorkspaceLayout
        className="report-workspace"
        sidebar={(
          <>
            <CategoryPanel categoryTotals={categoryTotals} />
            <PaymentsPanel rows={payments.length ? payments : rows} />
          </>
        )}
      >
        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Andamento cantieri</h2>
              <p>Confronto rapido tra cantieri in base al totale registrato.</p>
            </div>
            <StatusBadge>{sites.length} cantieri</StatusBadge>
          </div>
          <div className="site-progress-list">
            {sites.length > 0 ? sites.map((cantiere) => (
              <article className="site-progress-row" key={cantiere.id}>
                <div>
                  <strong>{cantiere.nome}</strong>
                  <small>{cantiere.localita} · <MoneyValue value={cantiere.totale} /></small>
                </div>
                <ProgressBar value={cantiere.avanzamento} />
                <StatusBadge>In corso</StatusBadge>
              </article>
            )) : <p>Nessun cantiere nei dati importati.</p>}
          </div>
        </section>

        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Verifiche in attesa</h2>
              <p>Documenti che richiedono controllo prima del riepilogo definitivo.</p>
            </div>
            <a className="button button-secondary button-small" href="#/dashboard/documenti">Documenti</a>
          </div>
          <div className="document-card-list">
            {pending.length > 0 ? pending.slice(0, 6).map((item) => (
              <DataCardRow
                key={item.id}
                icon="warning"
                title={item.descrizione}
                description={`${item.fornitore} · ${formatDate(item.data)}`}
                status={displayStatus(item.statoVerifica)}
                href={`#/dashboard/documenti/${item.id}`}
                warning
                meta={[
                  { label: 'Documento', value: item.numeroDocumento },
                  { label: 'Categoria', value: item.categoria },
                  { label: 'Totale', value: <MoneyValue value={item.totale} /> },
                ]}
              />
            )) : <p>Nessuna verifica aperta nei dati importati.</p>}
          </div>
        </section>
      </WorkspaceLayout>

      <MockActionModal action={modalAction} onClose={() => setModalAction(null)} />
    </>
  )
}

function CategoryPanel({ categoryTotals }) {
  return (
    <SideContextPanel
      title="Riepilogo costi"
      description="Categorie ordinate per peso economico sul totale."
      action={<a className="button button-secondary button-small" href="#/dashboard/contabilita">Dettaglio</a>}
    >
      <div className="cost-legend report-cost-list">
        {categoryTotals.length > 0 ? categoryTotals.map((item) => (
          <div key={item.categoria}>
            <span />
            <strong>{item.categoria}</strong>
            <small><MoneyValue value={item.totale} /> · {item.percent}%</small>
          </div>
        )) : <p>Nessuna categoria nei dati importati.</p>}
      </div>
    </SideContextPanel>
  )
}

function PaymentsPanel({ rows }) {
  return (
    <SideContextPanel
      title="Pagamenti / bonifici"
      description="Ultimi pagamenti o movimenti economici da controllare."
      action={<a className="button button-secondary button-small" href="#/dashboard/contabilita">Contabilità</a>}
    >
      <div className="compact-upload-list">
        {rows.slice(0, 6).map((payment) => (
          <a className="compact-upload-row" href={`#/dashboard/contabilita/${payment.id}`} key={payment.id}>
            <span className="file-chip file-pdf">€</span>
            <div>
              <strong>{payment.fornitore}</strong>
              <small>{formatDate(payment.data)} · {payment.numeroDocumento}</small>
            </div>
            <StatusBadge><MoneyValue value={payment.totale} /></StatusBadge>
          </a>
        ))}
      </div>
    </SideContextPanel>
  )
}

function buildBossSummary({ rows, sites, totals, pending, payments, categoryTotals }) {
  const biggestCategory = categoryTotals[0]
  return [
    {
      icon: 'wallet',
      title: 'Totale spese registrate',
      description: 'Valore complessivo importato dal master, IVA inclusa.',
      status: 'Totale',
      href: '#/dashboard/contabilita',
      meta: [
        { label: 'Totale', value: <MoneyValue value={totals.totale} /> },
        { label: 'Imponibile', value: <MoneyValue value={totals.imponibile} /> },
        { label: 'IVA', value: <MoneyValue value={totals.iva} /> },
      ],
    },
    {
      icon: pending.length ? 'warning' : 'check',
      title: pending.length ? 'Controlli ancora aperti' : 'Nessun controllo aperto',
      description: pending.length ? 'Documenti da verificare prima di chiudere il riepilogo.' : 'I movimenti importati non hanno criticità aperte nei dati attuali.',
      status: pending.length ? 'Da controllare' : 'Ok',
      href: '#/dashboard/documenti',
      warning: pending.length > 0,
      meta: [
        { label: 'Documenti', value: pending.length },
        { label: 'Righe importate', value: rows.length },
        { label: 'Cantieri', value: sites.length },
      ],
    },
    {
      icon: 'report',
      title: 'Categoria più pesante',
      description: biggestCategory ? 'Categoria che pesa di più sul totale filtrato.' : 'Nessuna categoria disponibile nei dati importati.',
      status: biggestCategory ? `${biggestCategory.percent}%` : 'N/D',
      href: '#/dashboard/report',
      meta: [
        { label: 'Categoria', value: biggestCategory?.categoria ?? '-' },
        { label: 'Importo', value: biggestCategory ? <MoneyValue value={biggestCategory.totale} /> : '-' },
        { label: 'Pagamenti', value: payments.length },
      ],
    },
  ]
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

function displayStatus(status) {
  if (status === 'Possibile duplicato') return 'Duplicato'
  if (status === 'Da verificare') return 'Da controllare'
  if (status === 'Incompleto') return 'In attesa'
  return status
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
