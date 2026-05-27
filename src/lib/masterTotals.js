const BARCELO_MASTER_FALLBACK = {
  imponibile: 15682.57,
  iva: 2970.07,
  totale: 35939.46,
  speseRegistrate: 27508.29,
  bonificiDaCollegare: 8424.67,
  commissioniBonifici: 6.5,
  rows: 19,
  sourceLabel: 'BARCELO_ROMA_master',
  importedAt: null,
  isOfficialMaster: true,
  financialSummary: {
    speseRegistrate: 27508.29,
    bonificiDaCollegare: 8424.67,
    commissioniBonifici: 6.5,
    totaleComplessivo: 35939.46,
    operationalRowsTotal: 27508.29,
    differenzaOperativa: 8431.17,
    source: 'Riepilogo Google Sheets',
  },
  rowTotals: null,
}

const BARCELO_CATEGORY_FALLBACK = [
  ['Piscina', 'Materiali, noleggi e lavorazioni piscina', 21, 6960.60, 1530.35, 8490.95, 0, 0],
  ['Vitto', 'Spese pasti e supermercato', 3, 0, 0, 104.78, 0, 0],
  ['Alloggi', 'Booking e affitti', 3, 0, 0, 2876.00, 2330.00, 1.00],
  ['Scala_Aiuola', 'Scala esterna e aiuola', 6, 1187.86, 261.34, 1449.20, 0, 0],
  ['Soffitti_F2', 'Soffitti fase 2', 2, 459.12, 101.01, 560.13, 0, 0],
  ['Scarichi_Pergole', 'Scarichi, pergole e canalette', 4, 781.84, 172.01, 953.85, 0, 0],
  ['Massetti_Griglia', 'Massetti griglia', 2, 324.23, 71.33, 406.27, 1000.00, 0.50],
  ['Lavori_Extra_Annesso', 'Lavori extra annesso', 3, 374.74, 82.44, 457.18, 0, 0],
  ['Rifiuti_Container', 'Rifiuti / container', 1, 2000.00, 0, 2000.00, 0, 0],
  ['Da_classificare', 'Da verificare / da assegnare', 1, 0, 0, 0.50, 1127.82, 2.00],
  ['Allungamento_ Marciapiede_Ristorante', 'Allungamento marciapiede ristorante', 1, 295.20, 64.94, 360.14, 0, 0],
  ['Chiusura_Pilastri_Muratura', 'Chiusura pilastri muratura', 3, 362.56, 79.75, 442.31, 0, 0],
  ['Fase2_Rete_Soffitti_Antincendio', 'Fase 2 rete soffitti antincendio', 2, 462.05, 101.65, 563.70, 1210.26, 0.50],
  ['Piscina_Impianti_Elettrici', 'Piscina impianti elettrici', 1, 113.23, 24.91, 138.14, 0, 0],
  ['Fase_2_Solaio', 'Fase 2 solaio', 2, 396.00, 87.12, 483.12, 1434.18, 1.50],
  ['Riempimento_Aiuole', 'Riempimento aiuole', 1, 420.60, 92.53, 513.13, 0, 0],
  ['Docce_Esterne', 'Docce esterne', 2, 190.63, 41.93, 232.56, 0, 0],
  ['Opere_Extra_Piscina', 'Opere extra piscina', 4, 1267.07, 278.76, 1545.83, 1322.41, 1.00],
  ['Pagamenti_Dipendenti', 'Pagamenti dipendenti', 3, 0, 0, 5930.50, 0, 0],
].map(([categoria, descrizione, movimenti, imponibile, iva, speseRegistrate, bonificiDaCollegare, commissioniBonifici]) => ({
  categoria,
  descrizione,
  movimenti,
  imponibile,
  iva,
  speseRegistrate,
  totaleSpese: speseRegistrate,
  bonificiDaCollegare,
  commissioniBonifici,
  totale: Number((speseRegistrate + bonificiDaCollegare + commissioniBonifici).toFixed(2)),
  source: 'master-fallback',
}))

export function getOfficialMasterSource(store) {
  return store?.source?.officialMaster ?? store?.source?.masterSummary ?? store?.source ?? null
}

export function getOfficialFinancialSummary(store) {
  const source = getOfficialMasterSource(store)
  const summary = source?.financialSummary ?? source?.financial_summary ?? null
  if (!summary) return BARCELO_MASTER_FALLBACK.financialSummary

  const speseRegistrate = Number(summary.speseRegistrate ?? summary.spese_registrate ?? 0)
  const bonificiDaCollegare = Number(summary.bonificiDaCollegare ?? summary.bonifici_da_collegare ?? 0)
  const commissioniBonifici = Number(summary.commissioniBonifici ?? summary.commissioni_bonifici ?? 0)
  const totaleComplessivo = Number(
    summary.totaleComplessivo
    ?? summary.totale_complessivo
    ?? speseRegistrate + bonificiDaCollegare + commissioniBonifici
  )
  const operationalRowsTotal = Number(summary.operationalRowsTotal ?? summary.operational_rows_total ?? source?.rowTotals?.totale ?? 0)

  if (!speseRegistrate && !bonificiDaCollegare && !commissioniBonifici && !totaleComplessivo) {
    return BARCELO_MASTER_FALLBACK.financialSummary
  }

  return {
    speseRegistrate,
    bonificiDaCollegare,
    commissioniBonifici,
    totaleComplessivo,
    operationalRowsTotal,
    differenzaOperativa: Number(summary.differenzaOperativa ?? summary.differenza_operativa ?? totaleComplessivo - operationalRowsTotal),
    source: summary.source ?? 'Riepilogo Google Sheets',
  }
}

export function getOfficialMasterTotals(store) {
  const source = getOfficialMasterSource(store)
  const financialSummary = getOfficialFinancialSummary(store)
  const totals = source?.totals ?? source?.officialMaster?.totals ?? null

  if (financialSummary) {
    const official = {
      imponibile: Number(totals?.imponibile || BARCELO_MASTER_FALLBACK.imponibile),
      iva: Number(totals?.iva || BARCELO_MASTER_FALLBACK.iva),
      totale: financialSummary.totaleComplessivo,
      speseRegistrate: financialSummary.speseRegistrate,
      bonificiDaCollegare: financialSummary.bonificiDaCollegare,
      commissioniBonifici: financialSummary.commissioniBonifici,
      rows: Number(totals?.rows || totals?.movimenti || totals?.tabs || BARCELO_MASTER_FALLBACK.rows),
      sourceLabel: source?.name ?? 'BARCELO_ROMA_master',
      importedAt: source?.importedAt,
      isOfficialMaster: true,
      financialSummary,
      rowTotals: source?.rowTotals ?? null,
    }

    if (!official.totale) return BARCELO_MASTER_FALLBACK
    return official
  }

  return BARCELO_MASTER_FALLBACK
}

export function getOfficialCategoryTotals(store) {
  const source = getOfficialMasterSource(store)
  const categories = source?.categoryTotals ?? source?.categories ?? source?.officialMaster?.categoryTotals ?? []
  if (!Array.isArray(categories) || !categories.length) return BARCELO_CATEGORY_FALLBACK

  const parsed = categories
    .map((item) => {
      const speseRegistrate = Number(item.speseRegistrate ?? item.spese_registrate ?? item.totaleSpese ?? item.totale_spese ?? item.totale ?? item.total ?? 0)
      const bonificiDaCollegare = Number(item.bonificiDaCollegare ?? item.bonifici_da_collegare ?? item.bonifici ?? 0)
      const commissioniBonifici = Number(item.commissioniBonifici ?? item.commissioni_bonifici ?? item.commissioni ?? 0)
      const totale = Number(item.totaleComplessivo ?? item.totale_complessivo ?? speseRegistrate + bonificiDaCollegare + commissioniBonifici)

      return {
        categoria: item.categoria ?? item.category ?? item.tab ?? item.name ?? 'Da verificare',
        descrizione: item.descrizione ?? item.description ?? '',
        imponibile: Number(item.imponibile || 0),
        iva: Number(item.iva || 0),
        totale,
        speseRegistrate,
        bonificiDaCollegare,
        commissioniBonifici,
        movimenti: Number(item.movimenti || item.rows || item.count || 0),
        source: 'master',
      }
    })
    .filter((item) => item.totale || item.imponibile || item.iva || item.movimenti)

  return parsed.length ? parsed : BARCELO_CATEGORY_FALLBACK
}

export function preferOfficialTotals(store, calculatedTotals = null) {
  return getOfficialMasterTotals(store) ?? calculatedTotals
}

export function preferOfficialCategoryTotals(store, calculatedCategoryTotals = []) {
  const official = getOfficialCategoryTotals(store)
  return official.length ? official : calculatedCategoryTotals
}
