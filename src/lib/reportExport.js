import { findDuplicateMovements, hasAmountWarning } from './accountingChecks'

export function openOperationalReportPdf({ rows, sites, categoryTotals, pending, payments, duplicateIds, deletedRecords = [] }) {
  const generatedAt = new Date()
  const totals = getTotals(rows)
  const html = buildReportHtml({
    rows,
    sites,
    categoryTotals,
    pending,
    payments,
    duplicateIds,
    deletedRecords,
    totals,
    generatedAt,
  })

  const reportWindow = window.open('', '_blank', 'width=1200,height=900')

  if (!reportWindow) {
    downloadReportHtml(html, generatedAt)
    return {
      ok: true,
      mode: 'download',
      message: 'Popup bloccato dal browser: ho scaricato un file HTML del report. Aprilo e usa Stampa → Salva come PDF.',
    }
  }

  try {
    reportWindow.document.open()
    reportWindow.document.write(html)
    reportWindow.document.close()
    reportWindow.focus()
    reportWindow.setTimeout(() => reportWindow.print(), 500)
    return { ok: true, mode: 'popup' }
  } catch (error) {
    reportWindow.close()
    downloadReportHtml(html, generatedAt)
    return {
      ok: true,
      mode: 'download',
      message: `Il browser non ha permesso di scrivere nella nuova scheda: ho scaricato un file HTML del report. Dettaglio: ${error.message}`,
    }
  }
}

export function buildReportRows({ documents = [], movements = [] }) {
  const source = Array.isArray(movements) && movements.length ? movements : documents.map(documentToMovement)
  return source.map(normalizeReportRow)
}

export function buildDuplicateIdSet(rows) {
  const duplicates = new Set()
  rows.forEach((row) => {
    if (findDuplicateMovements(row, rows).length) duplicates.add(row.id)
  })
  return duplicates
}

export function buildReportPendingRows(rows, duplicateIds) {
  return rows.filter((row) => (
    ['Da verificare', 'Incompleto', 'Possibile duplicato'].includes(row.statoVerifica)
    || duplicateIds.has(row.id)
    || hasAmountWarning(row)
    || (!row.documentId && !row.documentoCollegato)
  ))
}

export function normalizeReportRow(row) {
  return {
    id: row.id,
    documentId: row.documentId,
    cantiereId: row.cantiereId ?? 'barcelo-roma',
    cantiere: row.cantiere ?? 'Barcelò Roma',
    data: row.data ?? row.dataDocumento ?? '',
    descrizione: row.descrizione ?? row.tipoDocumento ?? 'Movimento contabile',
    fornitore: row.fornitore ?? 'Non indicato',
    categoria: row.categoria ?? 'Extra / Altro',
    tipoDocumento: row.tipoDocumento ?? 'Altro',
    numeroDocumento: row.numeroDocumento ?? row.fileName ?? row.documentId ?? row.id,
    imponibile: Number(row.imponibile || 0),
    iva: Number(row.iva || 0),
    totale: Number(row.totale || row.importoTotale || 0),
    pagamento: row.pagamento ?? 'Non indicato',
    statoVerifica: row.statoVerifica ?? 'Da verificare',
    documentoCollegato: row.documentoCollegato ?? row.fileName ?? '',
    note: row.notes ?? row.note ?? '',
  }
}

export function buildReportSites(rows) {
  const groups = rows.reduce((acc, row) => {
    if (!acc[row.cantiereId]) acc[row.cantiereId] = { id: row.cantiereId, nome: row.cantiere, localita: 'Da hub', totale: 0, movimenti: 0 }
    acc[row.cantiereId].totale += row.totale
    acc[row.cantiereId].movimenti += 1
    return acc
  }, {})
  const sites = Object.values(groups)
  const max = Math.max(...sites.map((site) => site.totale), 1)
  return sites.map((site) => ({ ...site, avanzamento: Math.max(5, Math.round((site.totale / max) * 100)) }))
}

export function buildReportCategoryTotals(rows) {
  const grouped = rows.reduce((acc, row) => {
    acc[row.categoria] = (acc[row.categoria] ?? 0) + row.totale
    return acc
  }, {})
  const total = Object.values(grouped).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(grouped)
    .map(([categoria, value]) => ({ categoria, totale: value, percent: Math.round((value / total) * 1000) / 10 }))
    .sort((a, b) => b.totale - a.totale)
}

function buildReportHtml({ rows, sites, categoryTotals, pending, payments, duplicateIds, deletedRecords, totals, generatedAt }) {
  const duplicateRows = rows.filter((row) => duplicateIds.has(row.id))
  const unlinkedRows = rows.filter((row) => !row.documentId && !row.documentoCollegato)
  const mathWarnings = rows.filter(hasAmountWarning)

  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>Report EuropaService - ${escapeHtml(formatDateIso(generatedAt))}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; font-family: Inter, Arial, sans-serif; color: #111827; background: #f8fafc; }
    .page { max-width: 1120px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 32px; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 24px; }
    h1 { margin: 0 0 8px; font-size: 32px; letter-spacing: -0.04em; }
    h2 { margin: 28px 0 12px; font-size: 18px; }
    p, small { color: #64748b; }
    button { border: 1px solid #dbeafe; background: #2563eb; color: #fff; border-radius: 999px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
    .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #eef2ff; color: #3730a3; font-size: 12px; font-weight: 700; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 18px; padding: 16px; background: #f8fafc; }
    .kpi strong { display: block; font-size: 22px; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border-bottom: 1px solid #e5e7eb; padding: 9px 8px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; color: #334155; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    tr.warning td { background: #fff7ed; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .card { border: 1px solid #e5e7eb; border-radius: 18px; padding: 14px; background: #fff; }
    .muted { color: #64748b; }
    .danger { color: #b91c1c; font-weight: 700; }
    .ok { color: #047857; font-weight: 700; }
    @media print { body { background: #fff; padding: 0; } .page { border: 0; border-radius: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <div>
        <span class="badge">EuropaService · Hub operativo</span>
        <h1>Report contabilità cantieri</h1>
        <p>Report generato il ${escapeHtml(formatDateTime(generatedAt))}. Include movimenti, categorie, verifiche aperte, duplicati e record eliminati tracciati.</p>
      </div>
      <button class="no-print" onclick="window.print()">Stampa / Salva PDF</button>
    </header>

    <section class="kpis">
      <div class="kpi"><span>Movimenti</span><strong>${rows.length}</strong></div>
      <div class="kpi"><span>Imponibile</span><strong>${formatMoney(totals.imponibile)}</strong></div>
      <div class="kpi"><span>IVA</span><strong>${formatMoney(totals.iva)}</strong></div>
      <div class="kpi"><span>Totale</span><strong>${formatMoney(totals.totale)}</strong></div>
    </section>

    <section class="grid">
      <div class="card"><strong>Verifiche aperte</strong><p>${pending.length} movimenti/documenti richiedono controllo.</p></div>
      <div class="card"><strong>Duplicati reali</strong><p>${duplicateRows.length} movimenti simili rilevati automaticamente.</p></div>
      <div class="card"><strong>Importi non coerenti</strong><p>${mathWarnings.length} righe con imponibile + IVA diverso dal totale.</p></div>
      <div class="card"><strong>Documenti da collegare</strong><p>${unlinkedRows.length} movimenti senza allegato/documento collegato.</p></div>
    </section>

    ${tableSection('Riepilogo per cantiere', ['Cantiere', 'Movimenti', 'Totale', 'Peso'], sites.map((site) => [site.nome, site.movimenti, formatMoney(site.totale), `${site.avanzamento}%`]))}
    ${tableSection('Spese per categoria', ['Categoria', 'Totale', 'Percentuale'], categoryTotals.map((item) => [item.categoria, formatMoney(item.totale), `${item.percent}%`]))}
    ${tableSection('Verifiche aperte', ['Data', 'Fornitore', 'Descrizione', 'Categoria', 'Totale', 'Problema'], pending.map((row) => [formatDate(row.data), row.fornitore, row.descrizione, row.categoria, formatMoney(row.totale), buildIssueLabel(row, duplicateIds)]), true)}
    ${tableSection('Pagamenti / bonifici', ['Data', 'Fornitore', 'Descrizione', 'Totale', 'Documento'], payments.map((row) => [formatDate(row.data), row.fornitore, row.descrizione, formatMoney(row.totale), row.documentoCollegato || row.numeroDocumento]))}
    ${tableSection('Record eliminati tracciati', ['Data', 'Tipo', 'Origine', 'Motivo'], deletedRecords.map((record) => [formatDate(record.deletedAt || record.deleted_at), record.entityType || record.entity_type, record.entityId || record.entity_id, record.reason || 'Eliminazione hub']), true)}
    ${tableSection('Movimenti completi', ['Data', 'Fornitore', 'Descrizione', 'Categoria', 'Imponibile', 'IVA', 'Totale', 'Pagamento', 'Stato'], rows.map((row) => [formatDate(row.data), row.fornitore, row.descrizione, row.categoria, formatMoney(row.imponibile), formatMoney(row.iva), formatMoney(row.totale), row.pagamento, buildIssueLabel(row, duplicateIds)]), true)}
  </main>
</body>
</html>`
}

function tableSection(title, headers, rows, allowEmpty = false) {
  if (!rows.length && !allowEmpty) return ''
  const body = rows.length
    ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${headers.length}" class="muted">Nessun dato disponibile.</td></tr>`
  return `<section><h2>${escapeHtml(title)}</h2><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></section>`
}

function buildIssueLabel(row, duplicateIds) {
  const issues = []
  if (row.statoVerifica) issues.push(row.statoVerifica)
  if (duplicateIds.has(row.id)) issues.push('Duplicato reale')
  if (hasAmountWarning(row)) issues.push('Importi non coerenti')
  if (!row.documentId && !row.documentoCollegato) issues.push('Documento da collegare')
  return issues.join(' · ') || 'Ok'
}

function getTotals(rows) {
  return rows.reduce((acc, row) => ({
    imponibile: acc.imponibile + row.imponibile,
    iva: acc.iva + row.iva,
    totale: acc.totale + row.totale,
  }), { imponibile: 0, iva: 0, totale: 0 })
}

function documentToMovement(document) {
  return {
    id: `movement-${document.id}`,
    documentId: document.id,
    cantiereId: document.cantiereId,
    cantiere: document.cantiere,
    data: document.dataDocumento,
    descrizione: document.descrizione ?? document.tipoDocumento,
    fornitore: document.fornitore,
    categoria: document.categoria,
    tipoDocumento: document.tipoDocumento,
    numeroDocumento: document.numeroDocumento ?? document.fileName,
    imponibile: document.imponibile,
    iva: document.iva,
    totale: document.totale ?? document.importoTotale,
    pagamento: document.pagamento,
    statoVerifica: document.statoVerifica,
    documentoCollegato: document.fileName,
  }
}

function downloadReportHtml(html, generatedAt) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `EuropaService_Report_${formatDateIso(generatedAt)}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatDateIso(date) {
  return date.toISOString().slice(0, 10)
}

function formatMoney(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
