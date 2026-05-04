import { useMemo, useState } from 'react'
import { DashboardHeader, DataModeBadge } from '../../components/InternalComponents'
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
import {
  buildDuplicateIdSet,
  buildReportCategoryTotals,
  buildReportPendingRows,
  buildReportRows,
  buildReportSites,
  openOperationalReportPdf,
} from '../../lib/reportExport'

export function ReportMock({ documents = [], store = null }) {
  const [exportStatus, setExportStatus] = useState(null)
  const rows = useMemo(() => buildReportRows({ documents, movements: store?.movements ?? [] }), [documents, store?.movements])
  const duplicateIds = useMemo(() => buildDuplicateIdSet(rows), [rows])
  const sites = useMemo(() => buildReportSites(rows), [rows])
  const categoryTotals = useMemo(() => buildReportCategoryTotals(rows), [rows])
  const totals = rows.reduce((acc, row) => ({
    imponibile: acc.imponibile + row.imponibile,
    iva: acc.iva + row.iva,
    totale: acc.totale + row.totale,
  }), { imponibile: 0, iva: 0, totale: 0 })
  const pending = useMemo(() => buildReportPendingRows(rows, duplicateIds), [rows, duplicateIds])
  const payments = rows.filter((row) => row.pagamento?.toLowerCase().includes('bonifico') || row.categoria?.toLowerCase().includes('bonifici'))
  const deletedRecords = store?.deletedRecords ?? []
  const summary = buildBossSummary({ rows, sites, totals, pending, payments, categoryTotals, duplicateIds, deletedRecords })

  function exportPdf() {
    const result = openOperationalReportPdf({
      rows,
      sites,
      categoryTotals,
      pending,
      payments,
      duplicateIds,
      deletedRecords,
    })

    setExportStatus(result.ok
      ? { type: 'success', message: 'Report aperto in una nuova scheda. Usa “Salva come PDF” dalla finestra di stampa.' }
      : { type: 'error', message: result.error })
  }

  return (
    <>
      <DashboardHeader
        eyebrow="Report reale"
        title="Report"
        description="Riepilogo direzionale dai dati Supabase: costi, criticità, pagamenti, duplicati e record eliminati."
      >
        <DataModeBadge>Dati reali Supabase</DataModeBadge>
        <button className="button button-primary button-small" type="button" onClick={exportPdf}>Report PDF</button>
      </DashboardHeader>

      {exportStatus ? (
        <section className={exportStatus.type === 'error' ? 'validation-alert-block' : 'accounting-alert success-alert'}>
          <strong>{exportStatus.type === 'error' ? 'Export non riuscito' : 'Export avviato'}</strong>
          <p>{exportStatus.message}</p>
        </section>
      ) : null}

      <KpiStrip ariaLabel="Indicatori report">
        <KpiCard icon="building" label="Cantieri" value={sites.length} hint="Nel master" />
        <KpiCard icon="report" label="Movimenti" value={rows.length} hint="Righe operative" />
        <KpiCard icon="wallet" tone="green" label="Imponibile" value={<MoneyValue value={totals.imponibile} />} hint="Totale netto" />
        <KpiCard icon="file" tone="amber" label="Totale spese" value={<MoneyValue value={totals.totale} />} hint="IVA inclusa" />
      </KpiStrip>

      <KpiStrip ariaLabel="Indicatori controlli report">
        <KpiCard icon="warning" tone="amber" label="Verifiche aperte" value={pending.length} hint="Da controllare" />
        <KpiCard icon="warning" tone="red" label="Duplicati reali" value={rows.filter((row) => duplicateIds.has(row.id)).length} hint="Match automatici" />
        <KpiCard icon="file" label="Record eliminati" value={deletedRecords.length} hint="Tombstone" />
        <KpiCard icon="wallet" tone="green" label="Pagamenti" value={payments.length} hint="Bonifici / pagamenti" />
      </KpiStrip>

      <section className="internal-panel">
        <div className="section-heading panel-title-row">
          <div>
            <h2>Sintesi capo</h2>
            <p>Le informazioni più importanti prima dei dettagli: totale, problemi aperti, duplicati e pagamenti da collegare.</p>
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
            <DeletedRecordsPanel rows={deletedRecords} />
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
                <StatusBadge>{cantiere.movimenti} mov.</StatusBadge>
              </article>
            )) : <p>Nessun cantiere nei dati importati.</p>}
          </div>
        </section>

        <section className="internal-panel">
          <div className="section-heading panel-title-row">
            <div>
              <h2>Verifiche in attesa</h2>
              <p>Movimenti che richiedono controllo prima del riepilogo definitivo.</p>
            </div>
            <a className="button button-secondary button-small" href="#/dashboard/contabilita">Contabilità</a>
          </div>
          <div className="document-card-list">
            {pending.length > 0 ? pending.slice(0, 8).map((item) => (
              <DataCardRow
                key={item.id}
                icon="warning"
                title={item.descrizione}
                description={`${item.fornitore} · ${formatDate(item.data)}`}
                status={displayStatus(item, duplicateIds)}
                href={`#/dashboard/contabilita/${item.id}`}
                warning
                meta={[
                  { label: 'Documento', value: item.documentoCollegato || item.numeroDocumento || 'Da collegare' },
                  { label: 'Categoria', value: item.categoria },
                  { label: 'Totale', value: <MoneyValue value={item.totale} /> },
                ]}
              />
            )) : <p>Nessuna verifica aperta nei dati importati.</p>}
          </div>
        </section>
      </WorkspaceLayout>
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

function DeletedRecordsPanel({ rows }) {
  return (
    <SideContextPanel
      title="Record eliminati"
      description="Tombstone usati per evitare re-import da Google Sheets."
    >
      <div className="compact-upload-list">
        {rows.length ? rows.slice(0, 6).map((record) => (
          <div className="compact-upload-row" key={record.id}>
            <span className="file-chip file-pdf">DEL</span>
            <div>
              <strong>{record.entityType ?? record.entity_type}</strong>
              <small>{formatDate(record.deletedAt ?? record.deleted_at)} · {record.entityId ?? record.entity_id}</small>
            </div>
          </div>
        )) : <p>Nessun record eliminato tracciato.</p>}
      </div>
    </SideContextPanel>
  )
}

function buildBossSummary({ rows, sites, totals, pending, payments, categoryTotals, duplicateIds, deletedRecords }) {
  const biggestCategory = categoryTotals[0]
  const duplicateCount = rows.filter((row) => duplicateIds.has(row.id)).length
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
      description: pending.length ? 'Movimenti da verificare prima di chiudere il riepilogo.' : 'I movimenti importati non hanno criticità aperte nei dati attuali.',
      status: pending.length ? 'Da controllare' : 'Ok',
      href: '#/dashboard/contabilita',
      warning: pending.length > 0,
      meta: [
        { label: 'Verifiche', value: pending.length },
        { label: 'Duplicati', value: duplicateCount },
        { label: 'Eliminati', value: deletedRecords.length },
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

function displayStatus(row, duplicateIds) {
  if (duplicateIds.has(row.id)) return 'Duplicato reale'
  if (!row.documentId && !row.documentoCollegato) return 'Da collegare'
  if (row.statoVerifica === 'Possibile duplicato') return 'Duplicato'
  if (row.statoVerifica === 'Da verificare') return 'Da controllare'
  if (row.statoVerifica === 'Incompleto') return 'In attesa'
  return row.statoVerifica
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}
