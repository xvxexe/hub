export const company = {
  name: 'EUROPA SERVICE S.R.L.',
  payoff: 'Cartongesso, ristrutturazioni tecniche, finiture interne e gestione cantieri',
  phone: '+39 045 000 0000',
  email: 'info@europaservice.example',
  pec: 'europaservizi272@pec.it',
  area: 'Arezzo, Toscana, Roma e cantieri su richiesta',
  address: 'VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR)',
  vatNumber: '02399910518',
  fiscalCode: '02399910518',
  europeanVat: 'IT02399910518',
  rea: '208794',
}

export const services = [
  {
    title: 'Cartongesso tecnico',
    description:
      'Pareti, contropareti, controsoffitti e velette con finiture pulite per abitazioni, hotel, locali commerciali e cantieri complessi.',
  },
  {
    title: 'Ristrutturazioni tecniche',
    description:
      'Coordinamento delle lavorazioni, protezione ambienti, ripristini, assistenze edili e consegna ordinata del cantiere.',
  },
  {
    title: 'Finiture interne e gestione cantiere',
    description:
      'Rasature, dettagli finali, controllo operativo, documentazione e supporto organizzato per ogni fase di lavoro.',
  },
]

export const publicProjects = [
  {
    id: 'barcelo-roma',
    title: 'Barcelò Roma',
    type: 'Hospitality',
    location: 'Roma, zona EUR',
    year: '2026',
    status: 'Attivo',
    summary: 'Cantiere reale collegato alla parte privata: piscina, soffitti fase 2, scala/aiuola, scarichi/pergole, docce esterne e rifiuti.',
  },
  {
    id: 'barcelo-piscina',
    title: 'Barcelò Roma · Piscina',
    type: 'Hospitality',
    location: 'Roma, zona EUR',
    year: '2026',
    status: 'In lavorazione',
    summary: 'Lavorazione reale dal tab Piscina: materiali, noleggi e lavorazioni dedicate alla zona piscina.',
  },
  {
    id: 'barcelo-soffitti-f2',
    title: 'Barcelò Roma · Soffitti fase 2',
    type: 'Hospitality',
    location: 'Roma, zona EUR',
    year: '2026',
    status: 'In lavorazione',
    summary: 'Lavorazioni reali su soffitti fase 2 e rete soffitti antincendio, lette dal master interno.',
  },
]

export const dashboardStats = [
  { label: 'Cantieri attivi', value: '6' },
  { label: 'Documenti da verificare', value: '14' },
  { label: 'Foto caricate oggi', value: '28' },
  { label: 'Preventivi aperti', value: '5' },
]

export const mockUsers = [
  { id: 'u-1', name: 'Dragos Gabriel Stroe', role: 'admin', email: 'gabrielstroe09@gmail.com' },
  { id: 'u-2', name: 'Contabile Test', role: 'accounting', email: 'contabile@europaservice.test' },
  { id: 'u-3', name: 'Dipendente Test', role: 'employee', email: 'dipendente@europaservice.test' },
]

export const internalProjects = [
  {
    code: 'C-001',
    name: 'Barcelò Roma',
    client: 'Barcelò Roma',
    status: 'Attivo',
    progress: 0,
    budget: '26.676,38 EUR tracciati',
  },
  {
    code: 'C-001-PISCINA',
    name: 'Barcelò Roma · Piscina',
    client: 'Barcelò Roma',
    status: 'In lavorazione',
    progress: 0,
    budget: '8.490,95 EUR',
  },
  {
    code: 'C-001-SOFFITTI-F2',
    name: 'Barcelò Roma · Soffitti fase 2',
    client: 'Barcelò Roma',
    status: 'In lavorazione',
    progress: 0,
    budget: '2.334,09 EUR',
  },
]

export const documents = [
  { name: 'Master contabile Barcelò Roma', project: 'C-001', type: 'Google Sheets', status: 'Importato' },
  { name: 'Riepilogo Piscina', project: 'C-001-PISCINA', type: 'Tab lavorazione', status: 'Collegato' },
  { name: 'Riepilogo Soffitti F2', project: 'C-001-SOFFITTI-F2', type: 'Tab lavorazione', status: 'Collegato' },
]

export const sitePhotos = [
  { title: 'Foto generica cantiere hospitality', project: 'C-001', date: '2026', author: 'EuropaService' },
  { title: 'Foto generica cartongesso e finiture', project: 'C-001-SOFFITTI-F2', date: '2026', author: 'EuropaService' },
  { title: 'Foto generica supporto operativo', project: 'C-001-PISCINA', date: '2026', author: 'EuropaService' },
]

export const quotes = [
  { client: 'Cliente privato', request: 'Cartongesso e finiture interne', status: 'Nuovo', value: 'Da stimare' },
  { client: 'Struttura ricettiva', request: 'Supporto operativo cantiere', status: 'Da valutare', value: 'Da definire' },
  { client: 'Studio tecnico', request: 'Assistenze edili e lavorazioni interne', status: 'Contattato', value: 'Da definire' },
]

export const accountingRows = [
  { item: 'Barcelò Roma · Totale tracciato', project: 'C-001', category: 'Master', amount: '26.676,38 EUR' },
  { item: 'Piscina', project: 'C-001-PISCINA', category: 'Lavorazione', amount: '8.490,95 EUR' },
  { item: 'Soffitti fase 2 e antincendio', project: 'C-001-SOFFITTI-F2', category: 'Lavorazione', amount: '2.334,09 EUR' },
]

export const employees = [
  { name: 'Dragos Gabriel Stroe', role: 'Admin / Capo', currentProject: 'Tutti i cantieri' },
  { name: 'Contabile Test', role: 'Contabile', currentProject: 'Contabilità e documenti' },
  { name: 'Dipendente Test', role: 'Dipendente', currentProject: 'Barcelò Roma' },
]
