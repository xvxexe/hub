export function getMasterSheetSummary(store) {
  const sheets = Array.isArray(store?.masterSheets) ? store.masterSheets : []

  return {
    total: sheets.length,
    operational: sheets.filter((sheet) => sheet.operational).length,
    detail: sheets.filter((sheet) => sheet.detail).length,
    system: sheets.filter((sheet) => sheet.system).length,
    hidden: sheets.filter((sheet) => sheet.hidden).length,
    visible: sheets.filter((sheet) => !sheet.hidden).length,
  }
}

export function getMasterSheetOptions(store, options = {}) {
  const {
    includeHidden = false,
    includeSystem = false,
    includeDetail = false,
    operationalOnly = false,
  } = options

  const sheets = Array.isArray(store?.masterSheets) ? store.masterSheets : []
  const filtered = sheets.filter((sheet) => {
    if (!includeHidden && sheet.hidden) return false
    if (!includeSystem && sheet.system) return false
    if (!includeDetail && sheet.detail) return false
    if (operationalOnly && !sheet.operational) return false
    return true
  })

  return filtered
    .sort((a, b) => Number(a.index ?? 0) - Number(b.index ?? 0))
    .map((sheet) => ({
      value: sheet.title,
      label: formatMasterSheetLabel(sheet.title),
      sheet,
    }))
}

export function mergeMasterSheetOptions(store, rowValues = [], options = {}) {
  const byValue = new Map()

  getMasterSheetOptions(store, options).forEach((option) => {
    byValue.set(option.value, option)
  })

  rowValues.filter(Boolean).forEach((value) => {
    if (!byValue.has(value)) {
      byValue.set(value, {
        value,
        label: formatMasterSheetLabel(value),
        sheet: null,
      })
    }
  })

  return [...byValue.values()]
}

export function formatMasterSheetLabel(value) {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function hasMasterSheetCatalog(store) {
  return Array.isArray(store?.masterSheets) && store.masterSheets.length > 0
}
