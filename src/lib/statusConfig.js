const statusMap = {
  'da verificare': 'warning',
  confermato: 'success',
  incompleto: 'danger',
  'possibile duplicato': 'danger',
  scartato: 'muted',
  'da revisionare': 'warning',
  approvata: 'success',
  pubblicata: 'success',
  'non pubblicabile': 'muted',
  'da avviare': 'muted',
  attivo: 'success',
  sospeso: 'danger',
  completato: 'success',
  archiviato: 'muted',
  nuovo: 'warning',
  'da valutare': 'warning',
  contattato: 'info',
  'in attesa cliente': 'info',
  accettato: 'success',
  rifiutato: 'danger',
  aperto: 'danger',
  alta: 'danger',
  media: 'warning',
  bassa: 'info',
}

export function getStatusTone(status) {
  return statusMap[String(status).toLowerCase()] ?? 'info'
}
