import { driveHeroImages, driveServiceImages } from './driveProjectPhotos'
import { heroImages, projectImages, serviceImages, teamImages } from './publicImages'

export const premiumStats = []

export const premiumServices = [
  {
    id: 'cartongesso',
    title: 'Cartongesso',
    icon: 'cartongesso',
    image: driveServiceImages.cartongesso,
    fallbackImage: serviceImages.cartongesso.src,
    alt: 'Foto reale di lavorazioni in cartongesso',
    summary: 'Pareti, contropareti, velette, nicchie, rivestimenti e sistemi a secco per interni tecnici, commerciali e residenziali.',
    benefits: ['Strutture precise e allineate', 'Integrazione con impianti e illuminazione', 'Finiture pronte alla tinteggiatura'],
    deliverables: ['Pareti divisorie', 'Velette', 'Contropareti', 'Nicchie'],
  },
  {
    id: 'ristrutturazioni-tecniche',
    title: 'Ristrutturazioni tecniche',
    icon: 'ristrutturazioni-tecniche',
    image: driveServiceImages.ristrutturazioniTecniche,
    fallbackImage: serviceImages.ediliGenerali.src,
    alt: 'Foto reale di ristrutturazione tecnica in cantiere',
    summary: 'Interventi coordinati su hotel, negozi, uffici, immobili residenziali e spazi ad alta percorrenza con fasi operative chiare.',
    benefits: ['Fasi pianificate prima dell’avvio', 'Assistenze edili coordinate', 'Riduzione interferenze con altri fornitori'],
    deliverables: ['Demolizioni leggere', 'Ripristini', 'Assistenze murarie', 'Consegna pulita'],
  },
  {
    id: 'demolizioni',
    title: 'Demolizioni',
    icon: 'demolizioni',
    image: driveServiceImages.ristrutturazioniTecniche,
    fallbackImage: serviceImages.ediliGenerali.src,
    alt: 'Foto reale di demolizioni e preparazione cantiere',
    summary: 'Demolizioni interne, rimozioni controllate, preparazione delle aree e gestione ordinata delle fasi preliminari prima delle nuove lavorazioni.',
    benefits: ['Aree isolate e protette', 'Fasi coordinate con il resto del cantiere', 'Pulizia e preparazione per le lavorazioni successive'],
    deliverables: ['Demolizioni interne', 'Rimozioni', 'Preparazione aree', 'Pulizia operativa'],
  },
  {
    id: 'finiture-interne',
    title: 'Finiture interne',
    icon: 'finiture-interne',
    image: driveServiceImages.finitureInterne,
    fallbackImage: serviceImages.rasature.src,
    alt: 'Foto reale di finiture interne',
    summary: 'Rasature, ripristini, dettagli, superfici e chiusure finali curate per dare agli ambienti un aspetto ordinato e professionale.',
    benefits: ['Superfici uniformi', 'Dettagli puliti e leggibili', 'Controllo qualità prima della consegna'],
    deliverables: ['Rasature', 'Riprese', 'Stuccature', 'Dettagli finali'],
  },
  {
    id: 'gestione-cantiere',
    title: 'Gestione cantiere',
    icon: 'gestione-cantiere',
    image: driveServiceImages.gestioneCantiere,
    fallbackImage: serviceImages.supportoCantieri.src,
    alt: 'Foto reale di gestione cantiere',
    summary: 'Coordinamento operativo, documentazione delle fasi, controllo accessi, priorità e avanzamento per lavorare senza caos.',
    benefits: ['Referente operativo unico', 'Aggiornamenti ordinati', 'Foto e note per ogni fase'],
    deliverables: ['Pianificazione', 'Controllo fasi', 'Report foto', 'Verifiche finali'],
  },
  {
    id: 'manutenzioni',
    title: 'Manutenzioni',
    icon: 'manutenzioni',
    image: driveServiceImages.manutenzioni,
    fallbackImage: serviceImages.manutenzioni.src,
    alt: 'Foto reale di manutenzioni edili',
    summary: 'Ripristini rapidi e programmati per immobili, strutture ricettive, locali commerciali e uffici che devono restare operativi.',
    benefits: ['Interventi mirati', 'Disagi ridotti', 'Programmazione semplice e tracciabile'],
    deliverables: ['Ripristini', 'Piccoli interventi', 'Urgenze', 'Controlli periodici'],
  },
  {
    id: 'supporto-operativo',
    title: 'Supporto operativo',
    icon: 'supporto-operativo',
    image: driveServiceImages.supportoOperativo,
    fallbackImage: serviceImages.tools.src,
    alt: 'Foto reale di supporto operativo in cantiere',
    summary: 'Squadre specializzate per imprese, studi tecnici e general contractor che cercano continuità, ordine e capacità esecutiva.',
    benefits: ['Pacchetti lavoro chiari', 'Coordinamento con DL e impresa', 'Documentazione ordinata'],
    deliverables: ['Squadre dedicate', 'Supporto imprese', 'Fasi extra', 'Presidio cantiere'],
  },
]

export const premiumProjects = []

export const workMethod = [
  { step: '01', title: 'Ascolto e sopralluogo', text: 'Raccogliamo obiettivi, foto, planimetrie, priorità, vincoli tecnici, accessi e stato reale degli ambienti.' },
  { step: '02', title: 'Analisi tecnica', text: 'Valutiamo lavorazioni, materiali, interferenze, tempi, sicurezza, protezioni e punti critici da chiarire prima dell’avvio.' },
  { step: '03', title: 'Pianificazione operativa', text: 'Definiamo squadre, fasi, zone di lavoro, approvvigionamenti, responsabilità e modalità di aggiornamento.' },
  { step: '04', title: 'Esecuzione controllata', text: 'Lavoriamo per step, documentiamo avanzamento, gestiamo imprevisti e manteniamo il cantiere ordinato.' },
  { step: '05', title: 'Verifica e consegna', text: 'Controlliamo dettagli, pulizia, difetti, riprese finali e consegniamo un risultato coerente con lo standard richiesto.' },
]

export const operationalMethod = [
  { step: 'A', title: 'Ordine documentale', text: 'Foto, note, preventivi e aggiornamenti vengono organizzati per cantiere e fase.' },
  { step: 'B', title: 'Controllo visivo', text: 'Ogni lavorazione viene verificata su allineamenti, pulizia, quote e coerenza con il progetto.' },
  { step: 'C', title: 'Comunicazione chiara', text: 'Il cliente sa cosa è stato fatto, cosa manca e quali decisioni servono.' },
  { step: 'D', title: 'Chiusura pulita', text: 'La consegna non è solo “fine lavori”: è controllo, ripristino e ordine finale.' },
]

export const sectorsServed = []

export const premiumValues = [
  { title: 'Precisione', text: 'Quote, allineamenti e dettagli vengono controllati perché il valore finale si vede nelle finiture.' },
  { title: 'Organizzazione', text: 'Ogni fase ha un ordine: materiali, squadre, accessi, documenti e verifiche non sono lasciati al caso.' },
  { title: 'Qualità', text: 'La qualità non è solo estetica: è durata, pulizia esecutiva, scelta dei materiali e controllo finale.' },
  { title: 'Affidabilità', text: 'Il cliente deve sapere chi segue il progetto, cosa succede e quando verrà consegnato.' },
  { title: 'Sicurezza', text: 'Protezione degli ambienti, gestione accessi e attenzione agli operatori sono parte del metodo.' },
  { title: 'Trasparenza', text: 'Comunicazione chiara, preventivi leggibili e aggiornamenti ordinati riducono incomprensioni e ritardi.' },
]

export const serviceFaq = [
  {
    question: 'Gestite solo cartongesso o anche lavorazioni edili?',
    answer: 'Gestiamo cartongesso, controsoffitti, finiture, demolizioni, manutenzioni, assistenze edili e supporto operativo. Il valore è coordinare queste lavorazioni con un metodo unico.',
  },
  {
    question: 'Lavorate con strutture già aperte al pubblico?',
    answer: 'Sì. Hotel, retail e uffici richiedono protezioni, orari pianificati, aree isolate e comunicazione precisa con direzione o facility manager.',
  },
  {
    question: 'È necessario un sopralluogo?',
    answer: 'Per interventi tecnici o con vincoli di accesso il sopralluogo è il modo più serio per valutare tempi, materiali, misure e criticità.',
  },
  {
    question: 'Potete coordinare più squadre?',
    answer: 'Sì. La gestione cantiere serve proprio a ridurre passaggi dispersi e mantenere una regia operativa chiara tra fornitori, DL e cliente.',
  },
  {
    question: 'Fornite documentazione fotografica?',
    answer: 'La documentazione delle fasi è parte del metodo: aiuta il cliente a vedere avanzamento, problemi risolti e lavorazioni completate.',
  },
]

export const testimonials = []
export const partners = []
export const leadership = []
export const contactCards = []

export const mainHeroImage = driveHeroImages.contact || heroImages.contact.src
export const teamImage = driveHeroImages.about || heroImages.about.src
export const servicesHeroImage = driveHeroImages.services || heroImages.services.src
export const projectsHeroImage = driveHeroImages.projects || heroImages.projects.src
export const homeHeroImage = driveHeroImages.home || heroImages.home.src
export const caseStudyHeroImage = driveHeroImages.caseStudy || heroImages.caseStudy.src
export { heroImages, projectImages, serviceImages, teamImages }
