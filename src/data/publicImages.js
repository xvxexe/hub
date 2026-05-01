export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Ogni voce usa una URL diversa. Nessuna card pubblica deve condividere la stessa immagine.
// Evito fallback locali ripetuti: se una URL fallisce, la card non ricade più sulla stessa foto degli attrezzi.
const remote = {
  heroConstruction: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=82',
  workersPlanning: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=82',
  constructionFrame: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1800&q=82',
  siteEngineer: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1800&q=82',
  siteWide: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=82',
  safetyHelmet: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?auto=format&fit=crop&w=1800&q=82',
  materialsStack: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=82',
  blueprintDesk: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=1800&q=82',
  technicalOffice: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=82',
  hotelCorridor: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=82',
  interiorShell: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1800&q=82',
  interiorCeiling: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=82',
  interiorFinish: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=82',
  commercialInterior: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=82',
  facadeWork: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=82',
  concreteDetail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=82',
  teamMeeting: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=82',
  contractorTeam: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1800&q=82',
  industrialSite: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1800&q=82',
  constructionWorker: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1800&q=82',
  wallWork: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1800&q=82',
}

export const placeholderImages = {
  hero: image(remote.heroConstruction, 'Cantiere edile professionale', 'Cantiere edile'),
  service: image(remote.siteWide, 'Cantiere edile interno', 'Servizio edilizia'),
  project: image(remote.workersPlanning, 'Tecnici e operai in cantiere', 'Progetto cantiere'),
  sector: image(remote.blueprintDesk, 'Progettazione cantiere', 'Settore cliente'),
  document: image(remote.materialsStack, 'Materiali e documentazione cantiere', 'Materiali cantiere'),
  heroSvg: image(remote.heroConstruction, 'Cantiere edile professionale', 'Hero cantiere'),
  serviceSvg: image(remote.siteWide, 'Servizio edilizia', 'Servizio edilizia'),
  projectSvg: image(remote.workersPlanning, 'Progetto cantiere', 'Progetto cantiere'),
  sectorSvg: image(remote.blueprintDesk, 'Settori clienti', 'Settori clienti'),
  documentSvg: image(remote.materialsStack, 'Documento cantiere', 'Documento cantiere'),
}

export const heroImages = {
  main: image(remote.heroConstruction, 'Cantiere edile professionale con lavorazioni in corso', 'Cantiere edile professionale'),
  ceiling: image(remote.interiorCeiling, 'Interno con controsoffitto e finiture moderne', 'Controsoffitto e finiture'),
  building: image(remote.facadeWork, 'Edificio con lavorazioni e ponteggi', 'Edificio in lavorazione'),
  lobby: image(remote.interiorFinish, 'Interno in ristrutturazione con finiture', 'Interno in lavorazione'),
  planning: image(remote.workersPlanning, 'Tecnici in cantiere durante pianificazione lavori', 'Pianificazione cantiere'),
  blueprint: image(remote.blueprintDesk, 'Disegni tecnici e piano operativo di cantiere', 'Disegni tecnici cantiere'),
}

export const serviceImages = {
  cartongesso: image(remote.wallWork, 'Pareti e sistemi interni in lavorazione', 'Cartongesso e pareti interne'),
  controsoffitti: image(remote.interiorCeiling, 'Controsoffitti e lavorazioni interne', 'Controsoffitti cartongesso'),
  paretiDivisorie: image(remote.constructionFrame, 'Strutture interne per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: image(remote.interiorShell, 'Ambiente interno in ristrutturazione', 'Rasature e preparazione pareti'),
  finitureInterne: image(remote.interiorFinish, 'Finiture interne in ambiente ristrutturato', 'Finiture interne'),
  isolamenti: image(remote.materialsStack, 'Materiali tecnici per isolamento e sistemi a secco', 'Isolamenti e sistemi a secco'),
  ediliGenerali: image(remote.siteWide, 'Cantiere edile con lavorazioni generali', 'Lavori edili generali'),
  manutenzioni: image(remote.safetyHelmet, 'Operatore e attrezzatura di cantiere', 'Manutenzioni edili'),
  hotel: image(remote.hotelCorridor, 'Corridoio hotel e lavorazioni interne', 'Lavori interni hotel'),
  negozi: image(remote.commercialInterior, 'Spazio commerciale con lavorazioni interne', 'Spazio commerciale interno'),
  supportoCantieri: image(remote.siteEngineer, 'Tecnico in cantiere durante controllo operativo', 'Supporto operativo cantiere'),
  uffici: image(remote.technicalOffice, 'Ufficio tecnico e ambiente direzionale', 'Uffici e spazi tecnici'),
  tools: image(remote.industrialSite, 'Cantiere industriale con mezzi e attrezzature', 'Attrezzature cantiere'),
  materials: image(remote.concreteDetail, 'Dettaglio materiali e superficie edile', 'Materiali edilizia'),
}

export const projectImages = {
  barceloRoma: image(remote.hotelCorridor, 'Corridoio hotel con lavori interni e finiture', 'Hotel corridoio lavori interni'),
  residenzaVerdi: image(remote.interiorShell, 'Appartamento in ristrutturazione interna', 'Appartamento in ristrutturazione'),
  hotelInternoMilano: image(remote.interiorFinish, 'Interno hospitality con finiture moderne', 'Hotel interno finiture'),
  negozioCentro: image(remote.commercialInterior, 'Locale commerciale con finiture interne', 'Negozio finiture interne'),
  condominioBianchi: image(remote.facadeWork, 'Edificio residenziale con lavori in corso', 'Condominio lavori edili'),
  ufficiDirezionali: image(remote.technicalOffice, 'Uffici direzionali con spazi tecnici interni', 'Uffici direzionali'),
}

export const sectorImages = {
  privati: image(remote.interiorShell, 'Intervento residenziale interno', 'Lavori per privati'),
  aziende: image(remote.technicalOffice, 'Ambiente aziendale e uffici', 'Lavori per aziende'),
  hotel: image(remote.hotelCorridor, 'Struttura hotel con corridoi e finiture interne', 'Lavori per hotel'),
  negozi: image(remote.commercialInterior, 'Spazio retail con finiture interne', 'Lavori per negozi'),
  studiTecnici: image(remote.blueprintDesk, 'Tavolo tecnico con planimetrie e progetto', 'Studi tecnici'),
  generalContractor: image(remote.siteEngineer, 'Controllo cantiere per general contractor', 'General contractor'),
  amministratori: image(remote.concreteDetail, 'Dettaglio materiale e ripristino edilizio', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: image(remote.constructionWorker, 'Operatore tecnico in cantiere', 'Squadra edile cantiere'),
  meeting: image(remote.teamMeeting, 'Riunione operativa di squadra tecnica', 'Riunione operativa'),
  contractor: image(remote.contractorTeam, 'Team tecnico e referenti di progetto', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
