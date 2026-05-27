export function getOfficialMasterSource(store) {
  return store?.source?.officialMaster ?? store?.source?.masterSummary ?? store?.source ?? null
}

export function getOfficialFinancialSummary(store) {
  const source = getOfficialMasterSource(store)
  const summary = source?.financialSummary ?? source?.financial_summary ?? null
  if (!summary) return null

  const speseRegistrate = Number(summary.speseRegistrate ?? summary.spese_registrate ?? 0)
  const bonificiDaCollegare = Number(summary.bonificiDaCollegare ?? summary.bonifici_da_collegare ?? 0)
  const commissioniBonifici = Number(summary.commissioniBonifici ?? summary.commissioni_bonifici ?? 0)
  const totaleComplessivo = Number(
    summary.totaleComplessivo
    ?? summary.totale_complessivo
    ?? speseRegistrate + bonificiDaCollegare + commissioniBonifici
  )
  const operationalRowsTotal = Number(summary.operationalRowsTotal ?? summary.operational_rows_total ?? source?.rowTotals?.totale ?? 0)

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
    return {
      imponibile: Number(totals?.imponibile || 0),
      iva: Number(totals?.iva || 0),
      totale: financialSummary.totaleComplessivo,
      speseRegistrate: financialSummary.speseRegistrate,
      bonificiDaCollegare: financialSummary.bonificiDaCollegare,
      commissioniBonifici: financialSummary.commissioniBonifici,
      rows: Number(totals?.rows || totals?.movimenti || totals?.tabs || 0),
      sourceLabel: source?.name ?? 'BARCELO_ROMA_master',
      importedAt: source?.importedAt,
      isOfficialMaster: true,
      financialSummary,
      rowTotals: source?.rowTotals ?? null,
    }
  }

  if (!totals) return null

  return {
    imponibile: Number(totals.imponibile || 0),
    iva: Number(totals.iva || 0),
    totale: Number(totals.totale || 0),
    speseRegistrate: Number(totals.totale || 0),
    bonificiDaCollegare: 0,
    commissioniBonifici: 0,
    rows: Number(totals.rows || totals.movimenti || totals.tabs || 0),
    sourceLabel: source?.name ?? 'BARCELO_ROMA_master',
    importedAt: source?.importedAt,
    isOfficialMaster: Boolean(source?.officialMaster || source?.masterSummary || source?.type === 'google-sheets'),
    rowTotals: source?.rowTotals ?? null,
  }
}

export function getOfficialCategoryTotals(store) {
  const source = getOfficialMasterSource(store)
  const categories = source?.categoryTotals ?? source?.categories ?? source?.officialMaster?.categoryTotals ?? []
  if (!Array.isArray(categories)) return []

  return categories
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
}

export function preferOfficialTotals(store, calculatedTotals = null) {
  const official = getOfficialMasterTotals(store)
  return official ?? calculatedTotals
}

export function preferOfficialCategoryTotals(store, calculatedCategoryTotals = []) {
  const official = getOfficialCategoryTotals(store)
  return official.length ? official : calculatedCategoryTotals
}
