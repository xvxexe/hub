import { placeholderImages, projectImages } from './publicImages'

export const publicProjects = [
  {
    id: 'barcelo-roma',
    title: 'Barcelo Roma',
    location: 'Roma, zona Eur',
    type: 'Hotel',
    clientType: 'Hotel',
    status: 'in corso',
    year: '2026',
    imageLabel: 'Hotel',
    image: projectImages.barceloRoma.src,
    fallbackImage: placeholderImages.project.src,
    imageAlt: projectImages.barceloRoma.alt,
    seoTitle: 'Cantiere Barcelo Roma - controsoffitti hotel',
    seoDescription: 'Cantiere pubblico mock per hotel con controsoffitti, cartongesso e finiture interne.',
    summary: 'Controsoffitti tecnici, velette e finiture interne per camere e corridoi.',
    objective:
      'Realizzare lavorazioni interne coordinate con l’operatività della struttura, curando continuità degli spazi, impianti e qualità delle finiture.',
    description:
      'Intervento organizzato per aree, con attenzione a pulizia, accessi e continuità operativa della struttura.',
    services: ['Controsoffitti', 'Cartongesso', 'Finiture interne'],
    phases: ['Preparazione aree e protezioni', 'Strutture e controsoffitti', 'Integrazione ispezioni e impianti', 'Rasature e controllo finale'],
    result: 'Ambienti più ordinati, impianti integrati e finiture coerenti con lo standard hotel.',
    gallery: ['Corridoio piano camere', 'Veletta reception', 'Botole ispezionabili'],
  },
  {
    id: 'residenza-verdi',
    title: 'Residenza Verdi',
    location: 'Verona, Borgo Venezia',
    type: 'Residenziale',
    clientType: 'Privato',
    status: 'in corso',
    year: '2026',
    imageLabel: 'Residenza',
    image: projectImages.residenzaVerdi.src,
    fallbackImage: placeholderImages.project.src,
    imageAlt: projectImages.residenzaVerdi.alt,
    seoTitle: 'Residenza Verdi - pareti in cartongesso',
    seoDescription: 'Intervento residenziale mock con pareti divisorie, isolamenti e rasature.',
    summary: 'Pareti divisorie, contropareti acustiche e rasature per palazzina residenziale.',
    objective:
      'Organizzare gli spazi interni degli appartamenti con pareti leggere, isolamento e superfici pronte per le finiture.',
    description:
      'Lavorazioni interne coordinate con avanzamento per piani e attenzione alle finiture degli appartamenti campione.',
    services: ['Pareti divisorie', 'Isolamenti', 'Rasature'],
    phases: ['Tracciamenti interni', 'Posa pareti divisorie', 'Contropareti acustiche', 'Rasature e verifica superfici'],
    result: 'Spazi distribuiti meglio, superfici pronte e maggiore comfort acustico.',
    gallery: ['Pareti appartamento', 'Vano scala', 'Controparete acustica'],
  },
  {
    id: 'hotel-interno-milano',
    title: 'Hotel Interno Milano',
    location: 'Milano, Porta Nuova',
    type: 'Hotel',
    clientType: 'Hotel',
    status: 'in corso',
    year: '2026',
    imageLabel: 'Interni',
    image: projectImages.hotelInternoMilano.src,
    fallbackImage: placeholderImages.project.src,
    imageAlt: projectImages.hotelInternoMilano.alt,
    seoTitle: 'Hotel Interno Milano - finiture interne',
    seoDescription: 'Cantiere hotel mock con pareti curve, isolamento acustico e controsoffitti.',
    summary: 'Pareti curve, isolamento acustico e controsoffitti per sale comuni.',
    objective:
      'Migliorare estetica e comfort delle aree comuni attraverso cartongesso, isolamento e controsoffitti integrati.',
    description:
      'Ristrutturazione interna con soluzioni in cartongesso per migliorare estetica, comfort e funzionalità.',
    services: ['Cartongesso', 'Isolamenti', 'Controsoffitti'],
    phases: ['Analisi quote e raggi', 'Strutture in cartongesso', 'Inserimento isolamento', 'Rasature e pulizia dettagli'],
    result: 'Sale comuni più curate, miglior comfort acustico e impianti integrati.',
    gallery: ['Sala meeting', 'Parete curva', 'Rasatura corridoio'],
  },
  {
    id: 'negozio-centro',
    title: 'Negozio Centro',
    location: 'Verona, centro storico',
    type: 'Commerciale',
    clientType: 'Negozio',
    status: 'in corso',
    year: '2026',
    imageLabel: 'Retail',
    image: projectImages.negozioCentro.src,
    fallbackImage: placeholderImages.project.src,
    imageAlt: projectImages.negozioCentro.alt,
    seoTitle: 'Negozio Centro - lavori per locale commerciale',
    seoDescription: 'Allestimento mock di negozio con pareti tecniche, controsoffitti e finiture.',
    summary: 'Preparazione locale commerciale con pareti tecniche e controsoffitto illuminazione.',
    objective:
      'Preparare il locale per l’allestimento commerciale, coordinando pareti, controsoffitti e finiture con i fornitori impianti.',
    description:
      'Intervento pensato per apertura rapida, gestione accessi e coordinamento con fornitori impianti.',
    services: ['Pareti divisorie', 'Controsoffitti', 'Finiture interne'],
    phases: ['Protezione accessi', 'Pareti tecniche', 'Controsoffitto illuminazione', 'Finiture area vendita'],
    result: 'Locale pronto per allestimento, con spazi più funzionali e immagine ordinata.',
    gallery: ['Locale prima lavori', 'Pareti tecniche', 'Area cassa'],
  },
  {
    id: 'condominio-bianchi',
    title: 'Condominio Bianchi',
    location: 'Padova, Arcella',
    type: 'Condominio',
    clientType: 'Amministratore immobiliare',
    status: 'completato',
    year: '2026',
    imageLabel: 'Condominio',
    image: projectImages.condominioBianchi.src,
    fallbackImage: placeholderImages.project.src,
    imageAlt: projectImages.condominioBianchi.alt,
    seoTitle: 'Condominio Bianchi - manutenzione parti comuni',
    seoDescription: 'Cantiere condominiale mock con ripristini, rasature e finiture lavabili.',
    summary: 'Ripristino vani scala, locali tecnici, rasature e tinteggiatura lavabile.',
    objective:
      'Ripristinare parti comuni e locali tecnici con lavorazioni pulite, limitando i disagi per residenti e gestione condominiale.',
    description:
      'Lavoro completato con attenzione a ordine nelle parti comuni e riduzione dei disagi per i residenti.',
    services: ['Manutenzioni', 'Rasature', 'Finiture interne'],
    phases: ['Programmazione accessi', 'Ripristini localizzati', 'Rasature e preparazione', 'Finitura lavabile e consegna'],
    result: 'Parti comuni più pulite, resistenti e facili da mantenere.',
    gallery: ['Vano scala completato', 'Locale tecnico', 'Finitura lavabile'],
  },
]

export const projectTypes = ['Tutti', 'Hotel', 'Residenziale', 'Commerciale', 'Condominio']
export const projectStatuses = ['Tutti', 'in corso', 'completato']

export function getPublicProjectById(id) {
  return publicProjects.find((project) => project.id === id)
}
