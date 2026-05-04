export function normalizeAccountingKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

export function sameAccountingDate(left, right) {
  if (!left || !right) return false
  return String(left).slice(0, 10) === String(right).slice(0, 10)
}

export function sameAccountingAmount(left, right, tolerance = 0.01) {
  return Math.abs(Number(left || 0) - Number(right || 0)) <= tolerance
}

export function findDuplicateMovements(target, movements = []) {
  if (!target) return []

  const targetSupplier = normalizeAccountingKey(target.fornitore)
  const targetDocNumber = normalizeStrongKey(target.numeroDocumento)
  const targetFile = normalizeStrongKey(target.storagePath || target.fileName || target.documentoCollegato)

  return movements
    .filter((movement) => movement.id !== target.id)
    .map((movement) => {
      const reasons = []
      const supplierMatch = targetSupplier && targetSupplier === normalizeAccountingKey(movement.fornitore)
      const amountMatch = sameAccountingAmount(target.totale, movement.totale)
      const dateMatch = sameAccountingDate(target.data, movement.data)
      const movementDocNumber = normalizeStrongKey(movement.numeroDocumento)
      const movementFile = normalizeStrongKey(movement.storagePath || movement.fileName || movement.documentoCollegato)
      const documentNumberMatch = targetDocNumber && targetDocNumber === movementDocNumber
      const fileMatch = targetFile && targetFile === movementFile

      if (documentNumberMatch) reasons.push('stesso numero documento')
      if (fileMatch) reasons.push('stesso file/storage path')
      if (supplierMatch && amountMatch && dateMatch) reasons.push('stesso fornitore, data e totale')

      return reasons.length ? { movement, reasons } : null
    })
    .filter(Boolean)
}

export function findSoftDuplicateHints(target, movements = []) {
  if (!target) return []

  const targetSupplier = normalizeAccountingKey(target.fornitore)
  if (!targetSupplier || !Number(target.totale || 0)) return []

  return movements
    .filter((movement) => movement.id !== target.id)
    .filter((movement) => targetSupplier === normalizeAccountingKey(movement.fornitore))
    .filter((movement) => sameAccountingAmount(target.totale, movement.totale) && !sameAccountingDate(target.data, movement.data))
    .map((movement) => ({ movement, reasons: ['stesso fornitore e totale, data diversa'] }))
}

export function checkDocumentMovementCompatibility(document, movement) {
  if (!document || !movement) return []

  const warnings = []
  const docSupplier = normalizeAccountingKey(document.fornitore)
  const movementSupplier = normalizeAccountingKey(movement.fornitore)

  if (document.cantiereId && movement.cantiereId && document.cantiereId !== movement.cantiereId) {
    warnings.push('Il documento appartiene a un cantiere diverso dal movimento.')
  }

  if (docSupplier && movementSupplier && docSupplier !== movementSupplier) {
    warnings.push('Il fornitore del documento è diverso dal fornitore del movimento.')
  }

  if (document.totale && movement.totale && !sameAccountingAmount(document.totale, movement.totale)) {
    warnings.push('Il totale del documento non coincide con il totale del movimento.')
  }

  if (document.dataDocumento && movement.data && !sameAccountingDate(document.dataDocumento, movement.data)) {
    warnings.push('La data del documento è diversa dalla data del movimento.')
  }

  return warnings
}

export function hasAmountWarning(row) {
  if (row?.tipoDocumento === 'Bonifico') return false
  if (!Number(row?.imponibile || 0) && !Number(row?.iva || 0)) return false
  return Math.abs((Number(row.imponibile || 0) + Number(row.iva || 0)) - Number(row.totale || 0)) > 0.01
}

function normalizeStrongKey(value) {
  const normalized = normalizeAccountingKey(value)
  if (!normalized) return ''
  if (['-', 'n/d', 'nd', 'non indicato', 'da collegare', 'inserimento manuale'].includes(normalized)) return ''
  if (normalized.startsWith('manuale-manual-expense-')) return ''
  return normalized
}
