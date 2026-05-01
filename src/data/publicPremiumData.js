import { heroImages, projectImages, serviceImages, teamImages } from './publicImages'

export const premiumStats = [
  { value: '15+', label: 'anni di esperienza in lavorazioni interne' },
  { value: '250+', label: 'cantieri gestiti e documentati' },
  { value: '120+', label: 'tecnici e collaboratori qualificati' },
  { value: '98%', label: 'clienti soddisfatti sul risultato finale' },
]

export const premiumServices = [
  {
    id: 'cartongesso',
    title: 'Cartongesso',
    icon: 'cartongesso',
    image: serviceImages.cartongesso.src,
    alt: serviceImages.cartongesso.alt,
    summary: 'Pareti, contropareti, velette, nicchie, rivestimenti e sistemi a secco per interni tecnici, commerciali e residenziali.',
    benefits: ['Strutture precise e allineate', 'Integrazione con impianti e illuminazione', 'Finiture pronte alla tinteggiatura'],
    deliverables: ['Pareti divisorie', 'Velette', 'Contropareti', 'Nicchie'],
  },
  {
    id: 'ristrutturazioni-tecniche',
    title: 'Ristrutturazioni tecniche',
    icon: 'ristrutturazioni-tecniche',
    image: serviceImages.ediliGenerali.src,
    alt: serviceImages.ediliGenerali.alt,
    summary: 'Interventi coordinati su hotel, negozi, uffici, immobili residenziali e spazi ad alta percorrenza con fasi operative chiare.',
    benefits: ['Fasi pianificate prima dell’avvio', 'Assistenze edili coordinate', 'Riduzione interferenze con altri fornitori'],
    deliverables: ['Demolizioni leggere', 'Ripristini', 'Assistenze murarie', 'Consegna pulita'],
  },
  {
    id: 'finiture-interne',
    title: 'Finiture interne',
    icon: 'finiture-interne',
    image: serviceImages.rasature.src,
    alt: serviceImages.rasature.alt,
    summary: 'Rasature, ripristini, dettagli, superfici e chiusure finali curate per dare agli ambienti un aspetto ordinato e professionale.',
    benefits: ['Superfici uniformi', 'Dettagli puliti e leggibili', 'Controllo qualità prima della consegna'],
    deliverables: ['Rasature', 'Riprese', 'Stuccature', 'Dettagli finali'],
  },
  {
    id: 'gestione-cantiere',
    title: 'Gestione cantiere',
    icon: 'gestione-cantiere',
    image: heroImages.main.src,
    alt: heroImages.main.alt,
    summary: 'Coordinamento operativo, documentazione delle fasi, controllo accessi, priorità e avanzamento per lavorare senza caos.',
    benefits: ['Referente operativo unico', 'Aggiornamenti ordinati', 'Foto e note per ogni fase'],
    deliverables: ['Pianificazione', 'Controllo fasi', 'Report foto', 'Verifiche finali'],
  },
  {
    id: 'manutenzioni',
    title: 'Manutenzioni',
    icon: 'manutenzioni',
    image: serviceImages.manutenzioni.src,
    alt: serviceImages.manutenzioni.alt,
    summary: 'Ripristini rapidi e programmati per immobili, strutture ricettive, locali commerciali e uffici che devono restare operativi.',
    benefits: ['Interventi mirati', 'Disagi ridotti', 'Programmazione semplice e tracciabile'],
    deliverables: ['Ripristini', 'Piccoli interventi', 'Urgenze', 'Controlli periodici'],
  },
  {
    id: 'supporto-operativo',
    title: 'Supporto operativo',
    icon: 'supporto-operativo',
    image: serviceImages.supportoCantieri.src,
    alt: serviceImages.supportoCantieri.alt,
    summary: 'Squadre specializzate per imprese, studi tecnici e general contractor che cercano continuità, ordine e capacità esecutiva.',
    benefits: ['Pacchetti lavoro chiari', 'Coordinamento con DL e impresa', 'Documentazione ordinata'],
    deliverables: ['Squadre dedicate', 'Supporto imprese', 'Fasi extra', 'Presidio cantiere'],
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
    summary: 'Controsoffitti tecnici, cartongesso e finiture interne per camere, corridoi e aree comuni di una struttura ricettiva complessa.',
    longText: 'Un intervento hospitality richiede ordine, silenziosità operativa, protezioni e comunicazione costante. Il progetto è stato organizzato per zone, con controllo delle interferenze e priorità sulle aree più sensibili.',
    metrics: ['4.200 mq', '18 settimane', '12 tecnici'],
    services: ['Cartongesso', 'Controsoffitti', 'Finiture interne'],
    challenge: 'Lavorare in un contesto ricettivo con aree comuni, corridoi e camere da gestire senza creare dispersione operativa.',
    solution: 'Suddivisione per zone, avanzamenti fotografici, controllo accessi e verifiche intermedie su quote, allineamenti e dettagli finali.',
    results: ['Maggiore controllo delle fasi', 'Riduzione interferenze tra squadre', 'Finiture uniformi nelle aree comuni'],
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
    summary: 'Restyling tecnico di locale commerciale con pareti, controsoffitti, velette e dettagli per illuminazione architettonica.',
    longText: 'Nel retail il tempo è un costo. Il cantiere è stato impostato per arrivare alla riapertura con superfici finite, impianti integrati e dettagli coerenti con l’immagine del brand.',
    metrics: ['620 mq', '6 settimane', 'Apertura puntuale'],
    services: ['Retail', 'Finiture', 'Gestione cantiere'],
    challenge: 'Ridurre i tempi di chiusura del locale mantenendo una qualità visiva coerente con un ambiente commerciale premium.',
    solution: 'Sequenza lavori serrata, materiali pronti prima dell’avvio, controllo giornaliero delle priorità e pulizia finale coordinata.',
    results: ['Apertura rispettata', 'Immagine più moderna', 'Meno passaggi correttivi'],
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
    summary: 'Pareti curve, isolamento acustico e controsoffitti per spazi comuni ad alta percorrenza e corridoi tecnici.',
    longText: 'Il focus era migliorare comfort, immagine e funzionalità degli spazi interni senza perdere controllo su tempi e interferenze impiantistiche.',
    metrics: ['2.800 mq', '10 settimane', 'Acustica migliorata'],
    services: ['Isolamenti', 'Cartongesso', 'Controsoffitti'],
    challenge: 'Integrare elementi tecnici e acustici in un ambiente esistente con vincoli estetici e funzionali.',
    solution: 'Sistemi a secco, coordinamento con impiantisti, verifiche acustiche e chiusure progressive delle aree terminate.',
    results: ['Comfort acustico superiore', 'Spazi più puliti', 'Impianti integrati'],
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
    summary: 'Pareti divisorie, contropareti acustiche, rasature e ripristini per una palazzina residenziale in fase di riqualificazione.',
    longText: 'Un intervento residenziale richiede attenzione a comfort, pulizia e continuità tra le unità. La lavorazione è stata organizzata per ridurre varianti e mantenere coerenza tra ambienti.',
    metrics: ['28 unità', '14 settimane', 'Comfort acustico'],
    services: ['Pareti divisorie', 'Rasature', 'Isolamenti'],
    challenge: 'Gestire più unità abitative con esigenze ripetitive ma dettagli diversi da appartamento ad appartamento.',
    solution: 'Standard esecutivi replicabili, controllo dei materiali e verifiche progressive prima delle finiture.',
    results: ['Maggiore uniformità', 'Riduzione errori', 'Comfort migliorato'],
  },
  {
    id: 'uffici-direzionali',
    title: 'Uffici Direzionali',
    city: 'Brescia',
    category: 'Uffici',
    status: 'Completato',
    year: '2025',
    image: projectImages.ufficiDirezionali.src,
    alt: projectImages.ufficiDirezionali.alt,
    summary: 'Nuova distribuzione interna con pareti tecniche, controsoffitti, manutenzioni e finiture operative per uffici direzionali.',
    longText: 'Negli uffici serve equilibrio tra estetica, acustica e funzionalità. Il cantiere ha previsto fasi notturne e coordinamento per ridurre l’impatto sull’attività.',
    metrics: ['1.450 mq', '8 settimane', 'Fasi notturne'],
    services: ['Uffici', 'Cartongesso', 'Manutenzioni'],
    challenge: 'Ristrutturare senza interrompere completamente l’operatività degli uffici.',
    solution: 'Turni pianificati, aree isolate, comunicazione con facility manager e consegne per step.',
    results: ['Continuità operativa', 'Spazi più funzionali', 'Migliore percezione aziendale'],
  },
]

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

export const sectorsServed = ['Retail', 'Hospitality', 'Uffici', 'Residenziale', 'Spazi commerciali', 'Studi tecnici', 'General contractor', 'Facility manager']

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
    answer: 'Gestiamo cartongesso, controsoffitti, finiture, manutenzioni, assistenze edili e supporto operativo. Il valore è coordinare queste lavorazioni con un metodo unico.',
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

export const testimonials = [
  {
    quote: 'EuropaService ha gestito lavorazioni e tempi con un livello di ordine raro in cantiere.',
    author: 'Direzione lavori, progetto hospitality',
    role: 'Hotel e spazi comuni',
  },
  {
    quote: 'Comunicazione chiara, squadra presente e finiture curate. Il locale è stato consegnato nei tempi.',
    author: 'Responsabile retail, Verona',
    role: 'Boutique Centro',
  },
  {
    quote: 'La differenza si vede nella gestione: meno confusione, più controllo e un risultato finale più pulito.',
    author: 'Facility manager, uffici direzionali',
    role: 'Riorganizzazione interna',
  },
]

export const partners = ['Studio tecnico', 'Direzione lavori', 'General contractor', 'Fornitori certificati', 'Facility manager', 'Interior designer', 'Impiantisti', 'Amministratori immobili']

export const leadership = [
  { name: 'Gianni Europa', role: 'Direzione operativa', text: 'Coordina sopralluoghi, priorità di cantiere, squadre e qualità finale delle lavorazioni.' },
  { name: 'Sara Costa', role: 'Amministrazione e controllo', text: 'Segue documenti, avanzamenti, richieste cliente e tracciabilità operativa.' },
  { name: 'Marco Ferri', role: 'Responsabile squadre', text: 'Gestisce posa, ordine di cantiere, verifiche intermedie e consegne per zona.' },
]

export const contactCards = [
  { title: 'Telefono', value: '+39 045 000 0000', text: 'Per urgenze, sopralluoghi, prime valutazioni e richieste operative.' },
  { title: 'Email', value: 'info@europaservice.example', text: 'Per inviare planimetrie, capitolati, foto, richieste e documentazione.' },
  { title: 'Sede operativa', value: 'Verona, Veneto', text: 'Cantieri in Veneto, Lombardia, Roma e Nord Italia in base al progetto.' },
  { title: 'Orari', value: 'Lun-Ven 8:00-18:00', text: 'Sabato su appuntamento per sopralluoghi e urgenze programmate.' },
]

export const mainHeroImage = heroImages.main.src
export const teamImage = teamImages.squadra.src
