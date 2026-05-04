export function getOfficialMasterSource(store) {
  return store?.source?.officialMaster ?? store?.source?.masterSummary ?? store?.source ?? null
}

export function getOfficialMasterTotals(store) {
  const source = getOfficialMasterSource(store)
  const totals = source?.totals ?? null
  if (!totals) return null

  return {
    imponibile: Number(totals.imponibile || 0),
    iva: Number(totals.iva || 0),
    totale: Number(totals.totale || 0),
    rows: Number(totals.rows || totals.movimenti || totals.tabs || 0),
    sourceLabel: source?.name ?? 'BARCELO_ROMA_master',
    importedAt: source?.importedAt,
    isOfficialMaster: Boolean(source?.officialMaster || source?.masterSummary || source?.type === 'google-sheets'),
  }
}

export function getOfficialCategoryTotals(store) {
  const source = getOfficialMasterSource(store)
  const categories = source?.categoryTotals ?? source?.categories ?? []
  if (!Array.isArray(categories)) return []

  return categories
    .map((item) => ({
      categoria: item.categoria ?? item.category ?? item.tab ?? item.name ?? 'Da verificare',
      imponibile: Number(item.imponibile || 0),
      iva: Number(item.iva || 0),
      totale: Number(item.totale || item.total || 0),
      movimenti: Number(item.movimenti || item.rows || item.count || 0),
      source: 'master',
    }))
    .filter((item) => item.totale || item.imponibile || item.iva || item.movimenti)
}

export function preferOfficialTotals(store, calculatedTotals) {
  return getOfficialMasterTotals(store) ?? calculatedTotals
}

export function preferOfficialCategoryTotals(store, calculatedCategoryTotals) {
  const official = getOfficialCategoryTotals(store)
  return official.length ? official : calculatedCategoryTotals
}
