import { placeholderImages, sectorImages } from './publicImages'

export const sectors = [
  {
    id: 'privati',
    title: 'Privati',
    image: sectorImages.privati.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.privati.alt,
    seoTitle: 'Lavori in cartongesso per privati',
    seoDescription: 'Ristrutturazioni interne, cartongesso e finiture per abitazioni private.',
    text: 'Ristrutturazioni interne, cartongesso, controsoffitti, rasature e finiture per abitazioni curate.',
  },
  {
    id: 'aziende',
    title: 'Aziende',
    image: sectorImages.aziende.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.aziende.alt,
    seoTitle: 'Lavori interni per aziende',
    seoDescription: 'Interventi per uffici, spazi operativi e ambienti aziendali.',
    text: 'Uffici, aree operative e spazi rappresentativi con interventi ordinati e programmati.',
  },
  {
    id: 'hotel',
    title: 'Hotel',
    image: sectorImages.hotel.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.hotel.alt,
    seoTitle: 'Lavori per hotel',
    seoDescription: 'Cartongesso, controsoffitti e finiture per hotel e strutture ricettive.',
    text: 'Camere, corridoi, sale comuni e manutenzioni con attenzione a tempi, pulizia e ospiti.',
  },
  {
    id: 'negozi',
    title: 'Negozi',
    image: sectorImages.negozi.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.negozi.alt,
    seoTitle: 'Lavori per negozi e locali commerciali',
    seoDescription: 'Allestimenti e finiture interne per negozi e locali retail.',
    text: 'Allestimenti e restyling per locali commerciali, vetrine e spazi vendita.',
  },
  {
    id: 'studi-tecnici',
    title: 'Studi tecnici',
    image: sectorImages.studiTecnici.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.studiTecnici.alt,
    seoTitle: 'Supporto operativo per studi tecnici',
    seoDescription: 'Supporto a progettisti e studi tecnici per cantieri interni.',
    text: 'Supporto operativo a progettisti, direzione lavori e studi che cercano squadre affidabili.',
  },
  {
    id: 'general-contractor',
    title: 'General contractor',
    image: sectorImages.generalContractor.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.generalContractor.alt,
    seoTitle: 'Lavorazioni per general contractor',
    seoDescription: 'Pacchetti di cartongesso, finiture e assistenze per cantieri strutturati.',
    text: 'Esecuzione di pacchetti cartongesso, finiture e assistenze edili dentro cantieri strutturati.',
  },
  {
    id: 'amministratori',
    title: 'Amministratori immobili',
    image: sectorImages.amministratori.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: sectorImages.amministratori.alt,
    seoTitle: 'Manutenzioni per amministratori immobili',
    seoDescription: 'Ripristini e lavori su parti comuni per amministratori immobiliari.',
    text: 'Manutenzioni, ripristini e parti comuni condominiali con comunicazione semplice e chiara.',
  },
]

export const whyChooseUs = [
  'Cantiere ordinato e protezione degli ambienti',
  'Comunicazione chiara con cliente e tecnici',
  'Squadre coordinate e tempi controllati',
  'Finiture pulite per abitazioni e spazi professionali',
]

export const mockTestimonials = [
  {
    quote: 'Intervento ordinato, tempi rispettati e buona gestione degli accessi in struttura.',
    author: 'Direzione hotel, Roma',
  },
  {
    quote: 'Preventivo chiaro e cantiere seguito con attenzione fino alla consegna.',
    author: 'Cliente residenziale, Verona',
  },
]
