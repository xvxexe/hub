import { placeholderImages, serviceImages } from './publicImages'

export const publicServices = [
  service({
    id: 'cartongesso',
    icon: 'CG',
    title: 'Cartongesso',
    imageRef: serviceImages.cartongesso,
    seoTitle: 'Cartongesso per interni, pareti e contropareti',
    seoDescription: 'Pareti in cartongesso, contropareti, separazioni interne e soluzioni a secco per ambienti ordinati.',
    description: 'Pareti, contropareti e soluzioni leggere per dividere, correggere e rifinire gli ambienti interni.',
    extended:
      'Realizziamo lavorazioni in cartongesso per abitazioni, uffici, hotel, negozi e cantieri professionali. Il lavoro viene impostato con tracciamenti chiari, strutture adeguate, attenzione agli impianti e finiture pronte per le fasi successive.',
    when: 'Quando serve ridistribuire gli spazi, creare contropareti, nascondere impianti o ottenere superfici pulite senza interventi invasivi.',
    benefits: ['Soluzione pulita e versatile', 'Tempi di posa controllabili', 'Integrazione con impianti e isolamento'],
    examples: ['Pareti interne', 'Contropareti tecniche', 'Velette e nicchie', 'Chiusure e correzioni'],
    strengths: ['Tracciamenti precisi', 'Strutture pulite', 'Finiture pronte per tinteggiatura'],
  }),
  service({
    id: 'controsoffitti',
    icon: 'CS',
    title: 'Controsoffitti',
    imageRef: serviceImages.controsoffitti,
    seoTitle: 'Controsoffitti in cartongesso tecnici e decorativi',
    seoDescription: 'Controsoffitti in cartongesso per estetica, impianti, illuminazione, isolamento e finitura pulita.',
    description: 'Controsoffitti tecnici, decorativi e ispezionabili per ambienti più ordinati e funzionali.',
    extended:
      'I controsoffitti permettono di integrare illuminazione, impianti, botole di ispezione e soluzioni acustiche o termiche. Lavoriamo con attenzione alle quote, alla planarità e alla pulizia delle giunzioni.',
    when: 'Quando occorre nascondere impianti, migliorare l’estetica, gestire corpi illuminanti o aumentare comfort acustico e termico.',
    benefits: ['Impianti integrati', 'Aspetto finale più pulito', 'Soluzioni ispezionabili e tecniche'],
    examples: ['Corridoi hotel', 'Uffici', 'Negozi', 'Zone giorno e reception'],
    strengths: ['Integrazione impianti', 'Botole e ispezioni', 'Soluzioni acustiche e REI'],
  }),
  service({
    id: 'pareti-divisorie',
    icon: 'PD',
    title: 'Pareti divisorie',
    imageRef: serviceImages.paretiDivisorie,
    seoTitle: 'Pareti divisorie in cartongesso per abitazioni e attività',
    seoDescription: 'Pareti divisorie leggere per abitazioni, uffici, negozi, hotel e locali commerciali.',
    description: 'Divisione degli spazi con pareti leggere, resistenti e adatte a nuove distribuzioni interne.',
    extended:
      'Progettiamo e realizziamo pareti divisorie per separare ambienti, creare stanze, ridefinire uffici o organizzare spazi vendita. La posa viene coordinata con porte, impianti e successive finiture.',
    when: 'Quando bisogna modificare la distribuzione interna senza ricorrere a murature pesanti.',
    benefits: ['Rapidità di realizzazione', 'Buona integrazione con isolamento', 'Cantiere più ordinato'],
    examples: ['Uffici operativi', 'Camere hotel', 'Spazi retail', 'Abitazioni private'],
    strengths: ['Rapidità di posa', 'Isolamento', 'Cantiere ordinato'],
  }),
  service({
    id: 'rasature-finiture',
    icon: 'RF',
    title: 'Rasature e finiture interne',
    imageRef: serviceImages.rasature,
    seoTitle: 'Rasature e finiture interne professionali',
    seoDescription: 'Rasature, preparazione superfici e finiture interne per risultati puliti e uniformi.',
    description: 'Preparazione superfici, ripristini e finiture per ottenere pareti regolari e ambienti pronti all’uso.',
    extended:
      'Le finiture incidono sulla percezione finale del lavoro. Per questo curiamo rasature, ripristini, chiusure e dettagli in modo da consegnare superfici uniformi e coerenti con l’ambiente.',
    when: 'Quando pareti e soffitti devono essere preparati per tinteggiatura, rivestimenti o consegna finale.',
    benefits: ['Superfici più uniformi', 'Risultato finale pulito', 'Meno difetti visibili in consegna'],
    examples: ['Rasature pareti', 'Ripristini localizzati', 'Finiture su cartongesso', 'Preparazione alla tinteggiatura'],
    strengths: ['Superfici regolari', 'Ripristini localizzati', 'Dettagli curati'],
  }),
  service({
    id: 'isolamenti',
    icon: 'IS',
    title: 'Isolamenti',
    imageRef: serviceImages.isolamenti,
    seoTitle: 'Isolamenti acustici e termici per interni',
    seoDescription: 'Soluzioni di isolamento acustico e termico con contropareti, controsoffitti e materiali idonei.',
    description: 'Soluzioni per migliorare comfort acustico e termico con materiali e stratigrafie adeguate.',
    extended:
      'Gli isolamenti interni richiedono attenzione a materiali, spessori e obiettivo dell’intervento. Valutiamo contropareti, controsoffitti e sistemi a secco in base al contesto e alle prestazioni richieste.',
    when: 'Quando occorre migliorare comfort, ridurre rumori, trattare pareti fredde o separare ambienti con esigenze diverse.',
    benefits: ['Comfort migliore', 'Soluzioni integrate nel cartongesso', 'Materiali scelti in base all’uso'],
    examples: ['Contropareti acustiche', 'Soffitti isolati', 'Pareti tra camere', 'Spazi ufficio'],
    strengths: ['Materiali adeguati', 'Soluzioni stratificate', 'Migliore comfort'],
  }),
  service({
    id: 'lavori-edili-generali',
    icon: 'ED',
    title: 'Lavori edili generali',
    imageRef: serviceImages.ediliGenerali,
    seoTitle: 'Lavori edili generali e assistenze di cantiere',
    seoDescription: 'Interventi edili complementari, sistemazioni, assistenze murarie e preparazione ambienti.',
    description: 'Interventi complementari, sistemazioni e assistenze edili per completare il lavoro interno.',
    extended:
      'Oltre al cartongesso gestiamo lavorazioni edili di supporto: ripristini, piccole demolizioni, assistenze murarie, preparazione aree e sistemazioni necessarie alla continuità del cantiere.',
    when: 'Quando il cantiere richiede interventi pratici di supporto alle lavorazioni principali.',
    benefits: ['Meno passaggi tra fornitori', 'Cantiere più coordinato', 'Interventi mirati sulle necessità reali'],
    examples: ['Ripristini interni', 'Assistenze murarie', 'Sistemazioni locali tecnici', 'Preparazione ambienti'],
    strengths: ['Coordinamento', 'Protezione ambienti', 'Consegna controllata'],
  }),
  service({
    id: 'manutenzioni',
    icon: 'MN',
    title: 'Manutenzioni',
    imageRef: serviceImages.manutenzioni,
    seoTitle: 'Manutenzioni interne, ripristini e modifiche',
    seoDescription: 'Manutenzioni edili, interventi rapidi, ripristini, modifiche e sistemazioni interne.',
    description: 'Interventi rapidi o programmati per ripristinare, modificare e mantenere spazi interni efficienti.',
    extended:
      'Le manutenzioni richiedono velocità, ordine e chiarezza. Interveniamo su ripristini, modifiche puntuali, danni localizzati e sistemazioni utili a mantenere abitazioni e spazi professionali presentabili.',
    when: 'Quando serve correggere un problema, sistemare un ambiente o programmare piccoli lavori senza avviare un cantiere complesso.',
    benefits: ['Intervento mirato', 'Riduzione disagi', 'Spazi rapidamente riutilizzabili'],
    examples: ['Ripristino pareti', 'Sostituzioni localizzate', 'Modifiche interne', 'Manutenzioni condominiali'],
    strengths: ['Sopralluogo rapido', 'Interventi mirati', 'Riduzione fermo attività'],
  }),
  service({
    id: 'hotel',
    icon: 'HT',
    title: 'Lavori per hotel',
    imageRef: serviceImages.hotel,
    seoTitle: 'Lavori per hotel, camere e aree comuni',
    seoDescription: 'Cartongesso, controsoffitti e finiture interne per camere, corridoi, reception e aree comuni hotel.',
    description: 'Camere, corridoi, reception e aree comuni con lavorazioni organizzate per ridurre i disagi.',
    extended:
      'Negli hotel contano tempi, pulizia e coordinamento. Organizziamo le lavorazioni per zone, proteggendo gli spazi e mantenendo una comunicazione chiara con direzione, tecnici e altri fornitori.',
    when: 'Quando una struttura ricettiva deve rinnovare camere, corridoi, reception o aree comuni con tempi controllati.',
    benefits: ['Fasi di lavoro organizzate', 'Attenzione agli ospiti', 'Finiture coerenti con lo standard della struttura'],
    examples: ['Camere', 'Corridoi', 'Reception', 'Sale comuni'],
    strengths: ['Fasi organizzate', 'Pulizia giornaliera', 'Lavori per zone'],
  }),
  service({
    id: 'negozi-locali-commerciali',
    icon: 'NG',
    title: 'Lavori per negozi e locali commerciali',
    imageRef: serviceImages.negozi,
    seoTitle: 'Lavori per negozi e locali commerciali',
    seoDescription: 'Allestimenti interni, controsoffitti, pareti e finiture per negozi e locali commerciali.',
    description: 'Allestimenti, restyling e finiture per locali che devono presentarsi bene e aprire nei tempi previsti.',
    extended:
      'Per negozi e locali commerciali lavoriamo con attenzione all’immagine finale, alla rapidità e al coordinamento con impianti, arredi e fornitori. L’obiettivo è consegnare spazi puliti e pronti per l’attività.',
    when: 'Quando bisogna aprire, rinnovare o modificare un locale commerciale con tempi stretti e finiture curate.',
    benefits: ['Tempi di intervento controllati', 'Finiture adatte al pubblico', 'Coordinamento con altri fornitori'],
    examples: ['Pareti tecniche', 'Controsoffitti illuminazione', 'Area cassa', 'Sale vendita'],
    strengths: ['Tempi stretti', 'Coordinamento fornitori', 'Immagine finale curata'],
  }),
  service({
    id: 'supporto-cantieri-imprese',
    icon: 'SC',
    title: 'Supporto a cantieri e imprese',
    imageRef: serviceImages.supportoCantieri,
    seoTitle: 'Supporto a general contractor, studi tecnici e imprese',
    seoDescription: 'Collaborazione operativa con general contractor, studi tecnici, imprese e professionisti.',
    description: 'Collaborazione operativa per imprese, studi tecnici e general contractor su cantieri strutturati.',
    extended:
      'Affianchiamo professionisti e imprese su pacchetti di lavorazione specifici: cartongesso, controsoffitti, finiture, assistenze e ripristini. Lavoriamo con metodo, documentazione delle fasi e rispetto delle priorità di cantiere.',
    when: 'Quando un cantiere richiede una squadra affidabile per lavorazioni specialistiche o supporto operativo.',
    benefits: ['Interlocuzione chiara', 'Rispetto delle fasi di cantiere', 'Documentazione ordinata delle lavorazioni'],
    examples: ['Cantieri hotel', 'Uffici', 'Retail', 'Interventi per studi tecnici'],
    strengths: ['Affidabilità operativa', 'Lavorazioni specialistiche', 'Coordinamento con direzione lavori'],
  }),
]

export const workProcess = [
  {
    step: '01',
    title: 'Sopralluogo e analisi',
    text: 'Valutiamo spazi, misure indicative, vincoli tecnici e priorità del cliente prima di impostare il lavoro.',
  },
  {
    step: '02',
    title: 'Preventivo e organizzazione',
    text: 'Prepariamo una proposta ordinata e definiamo tempi, materiali, accessi e fasi operative.',
  },
  {
    step: '03',
    title: 'Esecuzione lavori',
    text: 'Gestiamo il cantiere con protezioni, ordine, aggiornamenti e attenzione alla qualità delle finiture.',
  },
  {
    step: '04',
    title: 'Controllo e consegna',
    text: 'Verifichiamo lavorazioni, dettagli e pulizia finale per consegnare ambienti pronti alle fasi successive.',
  },
]

export const companyStats = [
  { value: '15+', label: 'anni di esperienza operativa' },
  { value: '80+', label: 'cantieri e interventi gestiti' },
  { value: '6', label: 'settori serviti' },
  { value: '4', label: 'fasi di lavoro documentate' },
]

export const homeTrustItems = [
  'Sopralluoghi e valutazioni',
  'Lavori per privati e aziende',
  'Cantieri documentati',
  'Metodo ordinato',
]

export const whyChooseUs = [
  {
    title: 'Metodo di lavoro ordinato',
    text: 'Ogni intervento viene seguito con sopralluogo, valutazione, lavorazione, controllo e consegna.',
  },
  {
    title: 'Attenzione ai dettagli',
    text: 'Quote, giunzioni, chiusure, protezioni e finiture vengono gestite con attenzione al risultato finale.',
  },
  {
    title: 'Gestione documentata del cantiere',
    text: 'Le fasi importanti vengono raccolte in modo chiaro, utile per cliente, tecnici e organizzazione interna.',
  },
  {
    title: 'Soluzioni per privati e aziende',
    text: 'Adattiamo tempi, comunicazione e lavorazioni al contesto: abitazioni, uffici, hotel, negozi e cantieri.',
  },
  {
    title: 'Finiture pulite e professionali',
    text: 'Dalle pareti in cartongesso ai controsoffitti, lavoriamo per ambienti funzionali e pronti all’uso.',
  },
  {
    title: 'Comunicazione chiara',
    text: 'Richieste, priorità e avanzamenti devono essere comprensibili, senza passaggi confusi o informazioni sparse.',
  },
]

function service({
  id,
  icon,
  title,
  imageRef,
  seoTitle,
  seoDescription,
  description,
  extended,
  when,
  benefits,
  examples,
  strengths,
}) {
  return {
    id,
    icon,
    title,
    image: imageRef.src,
    fallbackImage: placeholderImages.service.src,
    imageAlt: imageRef.alt,
    seoTitle,
    seoDescription,
    description,
    extended,
    when,
    benefits,
    examples,
    strengths,
  }
}
