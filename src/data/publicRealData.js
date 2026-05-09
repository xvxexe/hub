import { projectImages } from './publicImages'

export const publicCompanyProfile = {
  name: 'EUROPA SERVICE S.R.L.',
  tradingName: 'EuropaService',
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

export const publicCompanyLegalRows = [
  { label: 'Rag. Sociale', value: 'EUROPA SERVICE S.R.L.' },
  { label: 'Partita IVA', value: '02399910518' },
  { label: 'Codice Fiscale', value: '02399910518' },
  { label: 'Vat Europeo', value: 'IT02399910518' },
  { label: 'Indirizzo', value: 'VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR)' },
  { label: 'REA', value: '208794' },
  { label: 'PEC', value: 'europaservizi272@pec.it' },
]

export const realContactCards = [
  {
    title: 'Sede legale',
    value: 'VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR)',
    text: 'Ragione sociale: EUROPA SERVICE S.R.L. · REA 208794.',
  },
  {
    title: 'PEC',
    value: 'europaservizi272@pec.it',
    text: 'Canale ufficiale per comunicazioni amministrative e documentali.',
  },
  {
    title: 'Partita IVA / CF',
    value: '02399910518',
    text: 'Vat Europeo: IT02399910518.',
  },
  {
    title: 'Area operativa',
    value: 'Arezzo · Toscana · Roma',
    text: 'Cantieri edilizia, cartongesso, finiture interne e supporto operativo su richiesta.',
  },
]

export const realPublicProjects = [
  {
    id: 'barcelo-roma',
    title: 'Barcelò Roma',
    city: 'Roma, zona EUR',
    category: 'Hospitality',
    status: 'In corso',
    year: '2026',
    image: projectImages.barceloRoma.src,
    alt: projectImages.barceloRoma.alt,
    summary: 'Intervento hospitality con lavorazioni interne, aree esterne, supporto operativo e finiture coordinate in una struttura complessa.',
    longText: 'Un cantiere in ambito hospitality richiede ordine, protezione degli ambienti, coordinamento tra più fasi e continuità operativa. EuropaService segue lavorazioni interne ed esterne mantenendo attenzione su pulizia, dettagli e avanzamento delle aree operative.',
    metrics: ['Hospitality', 'Roma', 'Lavorazioni coordinate'],
    services: ['Piscina', 'Soffitti tecnici', 'Scala e aiuola', 'Scarichi e pergole', 'Docce esterne', 'Gestione rifiuti'],
    challenge: 'Coordinare più aree di intervento in una struttura ricettiva, mantenendo ordine, sicurezza e qualità visiva durante l’avanzamento del cantiere.',
    solution: 'Organizzazione delle lavorazioni per zone, controllo delle priorità e gestione progressiva delle fasi per ridurre interferenze tra squadre e attività.',
    results: ['Maggiore ordine operativo', 'Aree di lavoro più leggibili', 'Finiture gestite con più continuità'],
  },
]
