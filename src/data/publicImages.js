export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Set immagini pubblico: ogni chiave usa una sorgente diversa.
// Tema: edilizia reale, cantiere, cartongesso, controsoffitti, interni in lavorazione.
// Evitare duplicati visivi nel sito: non riusare la stessa URL per più sezioni.
const remote = {
  heroConstruction: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=82',
  workersPlanning: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=82',
  constructionFrame: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1800&q=82',
  siteEngineer: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1800&q=82',
  drywallRoom: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=82',
  renovationInterior: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=82',
  ceilingInterior: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=82',
  finishingInterior: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=82',
  toolsSite: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1800&q=82',
  workBoots: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?auto=format&fit=crop&w=1800&q=82',
  commercialInterior: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=82',
  hotelCorridor: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=82',
  apartmentRenovation: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1800&q=82',
  scaffoldingFacade: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=82',
  technicalOffice: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=82',
  safetyMeeting: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1800&q=82',
  contractorTeam: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1800&q=82',
  materialsStack: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=82',
  concreteDetail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=82',
  blueprintDesk: 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=1800&q=82',
}

export const placeholderImages = {
  hero: image('/assets/images/placeholders/placeholder-cantiere.jpg', 'Placeholder cantiere interno', 'Placeholder cantiere'),
  service: image('/assets/images/placeholders/placeholder-servizio.jpg', 'Placeholder servizio edilizia', 'Placeholder servizio'),
  project: image('/assets/images/placeholders/project-cantiere.svg', 'Placeholder progetto cantiere', 'Placeholder progetto'),
  sector: image('/assets/images/placeholders/sector-clienti.svg', 'Placeholder settore cliente', 'Placeholder settore'),
  document: image('/assets/images/placeholders/documento-pubblico.svg', 'Placeholder documento pubblico', 'Placeholder documento'),
  heroSvg: image('/assets/images/placeholders/hero-edilizia-cartongesso.svg', 'Placeholder grafico edilizia e cartongesso', 'Placeholder hero grafico'),
  serviceSvg: image('/assets/images/placeholders/service-cartongesso.svg', 'Placeholder grafico cartongesso', 'Placeholder servizio grafico'),
  projectSvg: image('/assets/images/placeholders/project-cantiere.svg', 'Placeholder grafico cantiere', 'Placeholder cantiere grafico'),
  sectorSvg: image('/assets/images/placeholders/sector-clienti.svg', 'Placeholder grafico settori clienti', 'Placeholder settori grafico'),
  documentSvg: image('/assets/images/placeholders/documento-pubblico.svg', 'Placeholder grafico documento pubblico', 'Placeholder documento grafico'),
}

export const heroImages = {
  main: image(remote.heroConstruction, 'Cantiere edile professionale con struttura e lavorazioni in corso', 'Cantiere edile professionale'),
  ceiling: image(remote.ceilingInterior, 'Interno con controsoffitto e finiture moderne', 'Controsoffitto e finiture'),
  building: image(remote.scaffoldingFacade, 'Edificio con lavorazioni esterne e ponteggi', 'Edificio in lavorazione'),
  lobby: image(remote.finishingInterior, 'Interno premium con finiture curate', 'Interno con finiture'),
  planning: image(remote.workersPlanning, 'Tecnici in cantiere durante pianificazione lavori', 'Pianificazione cantiere'),
  blueprint: image(remote.blueprintDesk, 'Disegni tecnici e piano operativo di cantiere', 'Disegni tecnici cantiere'),
}

export const serviceImages = {
  cartongesso: image('/assets/images/services/cartongesso-pareti-divisorie.jpg', 'Pareti divisorie e sistemi in cartongesso', 'Cartongesso pareti divisorie'),
  controsoffitti: image('/assets/images/services/controsoffitti-cartongesso.jpg', 'Controsoffitti in cartongesso in lavorazione', 'Controsoffitti cartongesso'),
  paretiDivisorie: image(remote.constructionFrame, 'Strutture interne e telai per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: image('/assets/images/services/rasature-finiture-interne.jpg', 'Rasature e finiture interne su pareti', 'Rasature finiture interne'),
  finitureInterne: image(remote.renovationInterior, 'Ambiente interno in ristrutturazione con finiture', 'Finiture interne cantiere'),
  isolamenti: image(remote.drywallRoom, 'Ambiente interno con sistemi a secco e isolamento', 'Sistemi a secco isolamento'),
  ediliGenerali: image('/assets/images/services/lavori-edili-generali.jpg', 'Lavori edili generali in cantiere interno', 'Lavori edili generali'),
  manutenzioni: image('/assets/images/services/manutenzioni-edili.jpg', 'Manutenzione edile con strumenti da cantiere', 'Manutenzioni edili'),
  hotel: image('/assets/images/sectors/lavori-per-hotel.jpg', 'Lavori interni per struttura hospitality', 'Lavori hotel cartongesso'),
  negozi: image(remote.commercialInterior, 'Spazio commerciale con lavorazioni interne', 'Spazio commerciale interno'),
  supportoCantieri: image(remote.siteEngineer, 'Tecnico in cantiere durante controllo operativo', 'Supporto operativo cantiere'),
  uffici: image(remote.technicalOffice, 'Ufficio tecnico e ambiente direzionale in lavorazione', 'Uffici e spazi tecnici'),
  tools: image(remote.toolsSite, 'Attrezzi e materiali per lavorazioni edili', 'Attrezzi cantiere'),
  materials: image(remote.materialsStack, 'Materiali da costruzione organizzati in cantiere', 'Materiali edilizia'),
}

export const projectImages = {
  barceloRoma: image(remote.hotelCorridor, 'Corridoio hotel con lavori interni e finiture', 'Hotel corridoio lavori interni'),
  residenzaVerdi: image('/assets/images/projects/appartamento-pareti-cartongesso.jpg', 'Appartamento in ristrutturazione con pareti in cartongesso', 'Appartamento pareti cartongesso'),
  hotelInternoMilano: image(remote.finishingInterior, 'Interno hospitality con finiture moderne', 'Hotel interno finiture'),
  negozioCentro: image(remote.commercialInterior, 'Locale commerciale con finiture interne', 'Negozio finiture interne'),
  condominioBianchi: image(remote.apartmentRenovation, 'Ristrutturazione residenziale interna', 'Residenziale ristrutturazione'),
  ufficiDirezionali: image(remote.technicalOffice, 'Uffici direzionali con spazi tecnici interni', 'Uffici direzionali'),
}

export const sectorImages = {
  privati: image(remote.apartmentRenovation, 'Intervento residenziale interno', 'Lavori per privati'),
  aziende: image(remote.technicalOffice, 'Ambiente aziendale e uffici in lavorazione', 'Lavori per aziende'),
  hotel: image(remote.hotelCorridor, 'Struttura hotel con corridoi e finiture interne', 'Lavori per hotel'),
  negozi: image(remote.commercialInterior, 'Spazio retail con finiture interne', 'Lavori per negozi'),
  studiTecnici: image(remote.blueprintDesk, 'Tavolo tecnico con planimetrie e progetto', 'Studi tecnici'),
  generalContractor: image(remote.siteEngineer, 'Controllo cantiere per general contractor', 'General contractor'),
  amministratori: image(remote.concreteDetail, 'Dettaglio materiale e ripristino edilizio', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: image('/assets/images/team/squadra-edile-cantiere.jpg', 'Squadra edile al lavoro in cantiere interno', 'Squadra edile cantiere'),
  meeting: image(remote.safetyMeeting, 'Riunione operativa di squadra tecnica', 'Riunione operativa'),
  contractor: image(remote.contractorTeam, 'Team tecnico e referenti di progetto', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
