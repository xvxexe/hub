import { placeholderImages, sectorImages } from './publicImages'

export const sectors = [
  sector({
    id: 'privati',
    title: 'Privati',
    imageRef: sectorImages.privati,
    seoTitle: 'Ristrutturazioni interne e cartongesso per privati',
    seoDescription: 'Ristrutturazioni interne, pareti divisorie, finiture e piccoli interventi per abitazioni private.',
    text: 'Ristrutturazioni interne, pareti divisorie, controsoffitti, rasature e piccoli interventi per abitazioni più ordinate e funzionali.',
    needs: ['Ristrutturazioni interne', 'Pareti divisorie', 'Finiture pulite', 'Piccoli interventi programmati'],
  }),
  sector({
    id: 'aziende',
    title: 'Aziende',
    imageRef: sectorImages.aziende,
    seoTitle: 'Lavori interni per aziende e uffici',
    seoDescription: 'Interventi per uffici, spazi operativi, manutenzioni e modifiche interne aziendali.',
    text: 'Uffici, spazi operativi e ambienti rappresentativi con lavorazioni coordinate e tempi compatibili con l’attività.',
    needs: ['Uffici', 'Spazi operativi', 'Manutenzioni', 'Modifiche interne'],
  }),
  sector({
    id: 'hotel',
    title: 'Hotel',
    imageRef: sectorImages.hotel,
    seoTitle: 'Lavori per hotel, camere e aree comuni',
    seoDescription: 'Cartongesso, controsoffitti e finiture per camere, corridoi, reception e aree comuni hotel.',
    text: 'Camere, corridoi, reception e aree comuni con interventi organizzati per ridurre disagi e mantenere ordine.',
    needs: ['Camere', 'Corridoi', 'Reception', 'Aree comuni'],
  }),
  sector({
    id: 'negozi',
    title: 'Negozi e locali commerciali',
    imageRef: sectorImages.negozi,
    seoTitle: 'Lavori per negozi e locali commerciali',
    seoDescription: 'Allestimenti, controsoffitti, pareti, finiture e interventi rapidi per negozi.',
    text: 'Allestimenti, controsoffitti, pareti e finiture per locali che devono comunicare qualità ed essere pronti nei tempi.',
    needs: ['Allestimenti', 'Controsoffitti', 'Pareti e finiture', 'Tempi rapidi'],
  }),
  sector({
    id: 'studi-tecnici',
    title: 'Studi tecnici',
    imageRef: sectorImages.studiTecnici,
    seoTitle: 'Supporto operativo per studi tecnici',
    seoDescription: 'Collaborazione con progettisti e studi tecnici per esecuzione lavori e supporto operativo.',
    text: 'Supporto a progettisti, direzione lavori e studi che cercano un referente operativo per lavorazioni interne.',
    needs: ['Supporto operativo', 'Collaborazione su progetti', 'Esecuzione lavori', 'Confronto tecnico chiaro'],
  }),
  sector({
    id: 'general-contractor',
    title: 'General contractor',
    imageRef: sectorImages.generalContractor,
    seoTitle: 'Supporto a general contractor e imprese',
    seoDescription: 'Supporto su cantieri, lavorazioni specialistiche e affidabilità operativa per general contractor.',
    text: 'Pacchetti di cartongesso, controsoffitti, finiture e assistenze per cantieri strutturati e fasi coordinate.',
    needs: ['Supporto su cantieri', 'Lavorazioni specialistiche', 'Affidabilità operativa', 'Documentazione fasi'],
  }),
  sector({
    id: 'amministratori',
    title: 'Amministratori immobiliari',
    imageRef: sectorImages.amministratori,
    seoTitle: 'Manutenzioni per amministratori immobiliari',
    seoDescription: 'Manutenzioni, ripristini, lavori condominiali e interventi programmati per amministratori immobiliari.',
    text: 'Manutenzioni, ripristini e interventi programmati su parti comuni con comunicazione semplice e tempi chiari.',
    needs: ['Manutenzioni', 'Ripristini', 'Lavori condominiali', 'Interventi programmati'],
  }),
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

function sector({ id, title, imageRef, seoTitle, seoDescription, text, needs }) {
  return {
    id,
    title,
    image: imageRef.src,
    fallbackImage: placeholderImages.sector.src,
    imageAlt: imageRef.alt,
    seoTitle,
    seoDescription,
    text,
    needs,
  }
}
