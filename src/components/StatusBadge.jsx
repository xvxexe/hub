import { getStatusTone } from '../lib/statusConfig'

const readableStatuses = {
  'da verificare': 'Da verificare',
  confermato: 'Confermato',
  confermata: 'Confermata',
  confermati: 'Confermati',
  verificato: 'Verificato',
  verificata: 'Verificata',
  incompleto: 'Incompleto',
  incompleta: 'Incompleta',
  'possibile duplicato': 'Possibile duplicato',
  duplicato: 'Duplicato',
  'in attesa': 'In attesa',
  'da controllare': 'Da controllare',
  scartato: 'Scartato',
  'da revisionare': 'Da revisionare',
  approvata: 'Approvata',
  pubblicata: 'Pubblicata',
  'non pubblicabile': 'Non pubblicabile',
  'da avviare': 'Da avviare',
  attivo: 'Attivo',
  'in corso': 'In corso',
  critico: 'Critico',
  chiuso: 'Chiuso',
  sospeso: 'Sospeso',
  completato: 'Completato',
  archiviato: 'Archiviato',
  nuovo: 'Nuovo',
  'da valutare': 'Da valutare',
  contattato: 'Contattato',
  'in attesa cliente': 'In attesa cliente',
  accettato: 'Accettato',
  rifiutato: 'Rifiutato',
  aperto: 'Aperto',
  alta: 'Alta',
  media: 'Media',
  bassa: 'Bassa',
  sync: 'Sync',
  system: 'Sistema',
  note: 'Nota',
  document: 'Documento',
  documents: 'Documenti',
  photo: 'Foto',
  photos: 'Foto',
  estimates: 'Preventivi',
}

export function StatusBadge({ children }) {
  const label = formatStatusLabel(children)
  return <span className={`status-badge status-${getStatusTone(children)}`} title={typeof label === 'string' ? label : undefined}>{label}</span>
}

function formatStatusLabel(value) {
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!normalized) return value
  if (readableStatuses[normalized]) return readableStatuses[normalized]
  return normalized
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
