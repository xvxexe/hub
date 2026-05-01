export const company = {
  name: 'EuropaService Hub',
  payoff: 'Cartongesso, ristrutturazioni e gestione cantieri',
  phone: '+39 045 000 0000',
  email: 'info@europaservice.example',
  area: 'Verona, Veneto e province limitrofe',
}

export const services = [
  {
    title: 'Cartongesso tecnico',
    description:
      'Pareti, contropareti, controsoffitti e velette con finiture pulite per abitazioni e locali commerciali.',
  },
  {
    title: 'Ristrutturazioni interne',
    description:
      'Coordinamento delle lavorazioni, protezione ambienti, ripristini e consegna ordinata del cantiere.',
  },
  {
    title: 'Isolamenti e finiture',
    description:
      'Soluzioni per comfort acustico e termico, rasature, tinteggiature e dettagli di chiusura.',
  },
]

export const publicProjects = [
  {
    id: 'villa-san-michele',
    title: 'Villa San Michele',
    type: 'Residenziale',
    location: 'Verona',
    year: '2026',
    status: 'Concluso',
    summary: 'Controsoffitti, pareti tecniche e finiture interne per una villa su due livelli.',
  },
  {
    id: 'uffici-borgo-roma',
    title: 'Uffici Borgo Roma',
    type: 'Commerciale',
    location: 'Verona',
    year: '2025',
    status: 'Concluso',
    summary: 'Ridisegno degli spazi interni con pareti modulari, isolamento e tinteggiatura.',
  },
  {
    id: 'appartamenti-lago',
    title: 'Appartamenti Lago',
    type: 'Residenziale',
    location: 'Peschiera del Garda',
    year: '2025',
    status: 'Concluso',
    summary: 'Finiture in cartongesso, nicchie tecniche e rasature per un complesso turistico.',
  },
]

export const dashboardStats = [
  { label: 'Cantieri attivi', value: '6' },
  { label: 'Documenti da verificare', value: '14' },
  { label: 'Foto caricate oggi', value: '28' },
  { label: 'Preventivi aperti', value: '5' },
]

export const mockUsers = [
  { id: 'u-1', name: 'Gianni Europa', role: 'admin' },
  { id: 'u-2', name: 'Capo EuropaService', role: 'admin' },
  { id: 'u-3', name: 'Marco Ferri', role: 'employee' },
]

export const internalProjects = [
  {
    code: 'C-104',
    name: 'Residenza Via Roma',
    client: 'Studio Bianchi',
    status: 'In corso',
    progress: 68,
    budget: '48.500 EUR',
  },
  {
    code: 'C-108',
    name: 'Negozio Centro',
    client: 'Retail Nord',
    status: 'Da pianificare',
    progress: 15,
    budget: '18.900 EUR',
  },
  {
    code: 'C-111',
    name: 'Uffici Direzionali',
    client: 'Tecnica Srl',
    status: 'In verifica',
    progress: 42,
    budget: '33.200 EUR',
  },
]

export const documents = [
  { name: 'Fattura materiale cartongesso', project: 'C-104', type: 'Fattura', status: 'Da verificare' },
  { name: 'Ricevuta bonifico acconto', project: 'C-108', type: 'Pagamento', status: 'Archiviato' },
  { name: 'FIR smaltimento macerie', project: 'C-111', type: 'FIR', status: 'Da verificare' },
]

export const sitePhotos = [
  { title: 'Avanzamento controsoffitto', project: 'C-104', date: '30/04/2026', author: 'Marco' },
  { title: 'Dettaglio veletta ingresso', project: 'C-104', date: '29/04/2026', author: 'Luca' },
  { title: 'Pareti negozio lato cassa', project: 'C-108', date: '28/04/2026', author: 'Sara' },
]

export const quotes = [
  { client: 'Famiglia Rossi', request: 'Ristrutturazione soggiorno', status: 'Nuovo', value: 'Da stimare' },
  { client: 'Hotel Garda', request: 'Controsoffitti corridoi', status: 'Da valutare', value: '24.000 EUR' },
  { client: 'Studio Medico Nord', request: 'Pareti divisorie', status: 'Contattato', value: '9.800 EUR' },
]

export const accountingRows = [
  { item: 'Materiali lastre e profili', project: 'C-104', category: 'Materiali', amount: '6.430 EUR' },
  { item: 'Acconto cliente', project: 'C-108', category: 'Entrata', amount: '5.000 EUR' },
  { item: 'Smaltimento', project: 'C-111', category: 'Servizi', amount: '780 EUR' },
]

export const employees = [
  { name: 'Marco Ferri', role: 'Caposquadra', currentProject: 'C-104' },
  { name: 'Luca Moretti', role: 'Cartongessista', currentProject: 'C-104' },
  { name: 'Sara Costa', role: 'Amministrazione', currentProject: 'Contabilita' },
]
