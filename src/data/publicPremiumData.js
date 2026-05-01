import { heroImages, projectImages, serviceImages, teamImages } from './publicImages'

export const premiumStats = [
  { value: '15+', label: 'anni di esperienza' },
  { value: '250+', label: 'cantieri completati' },
  { value: '120+', label: 'professionisti qualificati' },
  { value: '98%', label: 'clienti soddisfatti' },
]

export const premiumServices = [
  {
    id: 'cartongesso',
    title: 'Cartongesso',
    icon: 'cartongesso',
    image: serviceImages.cartongesso.src,
    alt: serviceImages.cartongesso.alt,
    summary: 'Pareti, contropareti, velette e soluzioni a secco per interni tecnici e residenziali.',
    benefits: ['Strutture precise', 'Integrazione impianti', 'Finiture pronte alla tinteggiatura'],
  },
  {
    id: 'ristrutturazioni-tecniche',
    title: 'Ristrutturazioni tecniche',
    icon: 'ristrutturazioni-tecniche',
    image: serviceImages.ediliGenerali.src,
    alt: serviceImages.ediliGenerali.alt,
    summary: 'Interventi coordinati su spazi interni, locali operativi, hotel, retail e uffici.',
    benefits: ['Fasi pianificate', 'Assistenze edili', 'Controllo tempi e accessi'],
  },
  {
    id: 'finiture-interne',
    title: 'Finiture interne',
    icon: 'finiture-interne',
    image: serviceImages.rasature.src,
    alt: serviceImages.rasature.alt,
    summary: 'Rasature, ripristini, dettagli e superfici curate per una consegna pulita.',
    benefits: ['Superfici uniformi', 'Dettagli puliti', 'Qualità percepibile'],
  },
  {
    id: 'gestione-cantiere',
    title: 'Gestione cantiere',
    icon: 'gestione-cantiere',
    image: heroImages.main.src,
    alt: heroImages.main.alt,
    summary: 'Organizzazione operativa, documentazione delle fasi e coordinamento delle squadre.',
    benefits: ['Referente unico', 'Priorità chiare', 'Aggiornamenti ordinati'],
  },
  {
    id: 'manutenzioni',
    title: 'Manutenzioni',
    icon: 'manutenzioni',
    image: serviceImages.manutenzioni.src,
    alt: serviceImages.manutenzioni.alt,
    summary: 'Ripristini e interventi programmati per mantenere immobili e attività efficienti.',
    benefits: ['Interventi mirati', 'Riduzione disagi', 'Programmazione semplice'],
  },
  {
    id: 'supporto-operativo',
    title: 'Supporto operativo',
    icon: 'supporto-operativo',
    image: serviceImages.supportoCantieri.src,
    alt: serviceImages.supportoCantieri.alt,
    summary: 'Squadre e lavorazioni specialistiche per imprese, studi tecnici e general contractor.',
    benefits: ['Pacchetti lavoro', 'Coordinamento DL', 'Documentazione ordinata'],
  },
]

export const premiumProjects = [
  {
    id: 'barcelo-roma',
    title: 'Barcelo Roma',
    city: 'Roma',
    category: 'Hospitality',
    status: 'In corso',
    year: '2026',
    image: projectImages.barceloRoma.src,
    alt: projectImages.barceloRoma.alt,
    summary: 'Controsoffitti tecnici, cartongesso e finiture interne per camere, corridoi e aree comuni.',
    metrics: ['4.200 mq', '18 settimane', '12 tecnici'],
    services: ['Cartongesso', 'Controsoffitti', 'Finiture interne'],
  },
  {
    id: 'negozio-centro',
    title: 'Boutique Centro',
    city: 'Verona',
    category: 'Retail',
    status: 'Completato',
    year: '2026',
    image: projectImages.negozioCentro.src,
    alt: projectImages.negozioCentro.alt,
    summary: 'Restyling tecnico di locale commerciale con pareti, controsoffitti e dettagli per illuminazione.',
    metrics: ['620 mq', '6 settimane', 'Apertura puntuale'],
    services: ['Retail', 'Finiture', 'Gestione cantiere'],
  },
  {
    id: 'hotel-interno-milano',
    title: 'Hotel Interno Milano',
    city: 'Milano',
    category: 'Hospitality',
    status: 'In corso',
    year: '2026',
    image: projectImages.hotelInternoMilano.src,
    alt: projectImages.hotelInternoMilano.alt,
    summary: 'Pareti curve, isolamento acustico e controsoffitti per spazi comuni ad alta percorrenza.',
    metrics: ['2.800 mq', '10 settimane', 'Acustica migliorata'],
    services: ['Isolamenti', 'Cartongesso', 'Controsoffitti'],
  },
  {
    id: 'residenza-verdi',
    title: 'Residenza Verdi',
    city: 'Verona',
    category: 'Residenziale',
    status: 'Completato',
    year: '2026',
    image: projectImages.residenzaVerdi.src,
    alt: projectImages.residenzaVerdi.alt,
    summary: 'Pareti divisorie, contropareti acustiche e rasature per palazzina residenziale.',
    metrics: ['28 unità', '14 settimane', 'Comfort acustico'],
    services: ['Pareti divisorie', 'Rasature', 'Isolamenti'],
  },
  {
    id: 'uffici-direzionali',
    title: 'Uffici Direzionali',
    city: 'Brescia',
    category: 'Uffici',
    status: 'Completato',
    year: '2025',
    image: '/assets/images/projects/cantiere-controsoffitto.jpg',
    alt: 'Uffici ristrutturati con pareti tecniche e finiture interne',
    summary: 'Nuova distribuzione interna con pareti tecniche, controsoffitti e finiture operative.',
    metrics: ['1.450 mq', '8 settimane', 'Fasi notturne'],
    services: ['Uffici', 'Cartongesso', 'Manutenzioni'],
  },
]

export const workMethod = [
  { step: '01', title: 'Analisi', text: 'Sopralluogo, misure, vincoli tecnici, accessi e priorità operative.' },
  { step: '02', title: 'Pianificazione', text: 'Materiali, tempi, squadre, interferenze e fasi di avanzamento.' },
  { step: '03', title: 'Esecuzione', text: 'Cantiere ordinato, protezioni, lavorazioni documentate e controlli intermedi.' },
  { step: '04', title: 'Consegna', text: 'Verifica dettagli, pulizia finale, report fotografico e chiusura attività.' },
]

export const sectorsServed = ['Retail', 'Hospitality', 'Uffici', 'Residenziale', 'Spazi commerciali']

export const premiumValues = [
  'Precisione',
  'Organizzazione',
  'Qualità',
  'Affidabilità',
  'Sicurezza',
]

export const testimonials = [
  {
    quote: 'EuropaService ha gestito lavorazioni e tempi con un livello di ordine raro in cantiere.',
    author: 'Direzione lavori, progetto hospitality',
  },
  {
    quote: 'Comunicazione chiara, squadra presente e finiture curate. Il locale è stato consegnato nei tempi.',
    author: 'Responsabile retail, Verona',
  },
]

export const partners = ['Studio tecnico', 'Direzione lavori', 'General contractor', 'Fornitori certificati', 'Facility manager']

export const leadership = [
  { name: 'Gianni Europa', role: 'Direzione operativa', text: 'Coordina sopralluoghi, priorità di cantiere e qualità finale.' },
  { name: 'Sara Costa', role: 'Amministrazione e controllo', text: 'Segue documenti, avanzamenti e comunicazione operativa.' },
  { name: 'Marco Ferri', role: 'Responsabile squadre', text: 'Gestisce posa, ordine di cantiere e verifiche intermedie.' },
]

export const contactCards = [
  { title: 'Telefono', value: '+39 045 000 0000', text: 'Per urgenze, sopralluoghi e prime valutazioni.' },
  { title: 'Email', value: 'info@europaservice.example', text: 'Per inviare richieste, planimetrie e documentazione.' },
  { title: 'Sede operativa', value: 'Verona, Veneto', text: 'Cantieri in Veneto, Lombardia, Roma e Nord Italia.' },
  { title: 'Orari', value: 'Lun-Ven 8:00-18:00', text: 'Sabato su appuntamento per sopralluoghi.' },
]

export const mainHeroImage = heroImages.main.src
export const teamImage = teamImages.squadra.src
