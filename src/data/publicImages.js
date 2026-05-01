export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

const remote = {
  modernLobby: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=82',
  modernInterior: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=82',
  office: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=82',
  building: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=82',
  cleanRoom: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=82',
  team: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=82',
}

export const placeholderImages = {
  hero: image('/assets/images/placeholders/placeholder-cantiere.jpg', 'Placeholder professionale per cantiere interno', 'Placeholder cantiere'),
  service: image('/assets/images/placeholders/placeholder-servizio.jpg', 'Placeholder professionale per lavori edili e strumenti', 'Placeholder servizio'),
  project: image('/assets/images/placeholders/placeholder-cantiere.jpg', 'Placeholder professionale per cantiere edile', 'Placeholder cantiere'),
  sector: image('/assets/images/placeholders/placeholder-cantiere.jpg', 'Placeholder professionale per settore cliente', 'Placeholder settore'),
  document: image('/assets/images/placeholders/documento-pubblico.svg', 'Placeholder professionale per documento pubblico', 'Placeholder documento'),
  heroSvg: image('/assets/images/placeholders/hero-edilizia-cartongesso.svg', 'Placeholder grafico per edilizia e cartongesso', 'Placeholder hero grafico'),
  serviceSvg: image('/assets/images/placeholders/service-cartongesso.svg', 'Placeholder grafico per servizio cartongesso', 'Placeholder servizio grafico'),
  projectSvg: image('/assets/images/placeholders/project-cantiere.svg', 'Placeholder grafico per cantiere', 'Placeholder cantiere grafico'),
  sectorSvg: image('/assets/images/placeholders/sector-clienti.svg', 'Placeholder grafico per settori clienti', 'Placeholder settori grafico'),
  documentSvg: image('/assets/images/placeholders/documento-pubblico.svg', 'Placeholder grafico per documento pubblico', 'Placeholder documento grafico'),
}

export const heroImages = {
  main: image('/assets/images/hero/edilizia-cartongesso-cantiere-hero.jpg', 'Cantiere interno con lavori di edilizia e cartongesso', 'Edilizia e cartongesso cantiere'),
  ceiling: image('/assets/images/hero/edilizia-cartongesso-cantiere-hero.jpg', 'Controsoffitto in lavorazione in cantiere interno', 'Controsoffitto cantiere interno'),
  building: image(remote.building, 'Edificio moderno per comunicazione premium EuropaService', 'Edificio moderno'),
  lobby: image(remote.modernLobby, 'Interno moderno e professionale per progetto hospitality', 'Interno hospitality moderno'),
}

export const serviceImages = {
  cartongesso: image('/assets/images/services/cartongesso-pareti-divisorie.jpg', 'Lavori in cartongesso e pareti divisorie interne', 'Cartongesso e pareti divisorie'),
  controsoffitti: image('/assets/images/services/controsoffitti-cartongesso.jpg', 'Controsoffitti in cartongesso per interni', 'Controsoffitti in cartongesso'),
  paretiDivisorie: image('/assets/images/services/cartongesso-pareti-divisorie.jpg', 'Pareti divisorie interne in cartongesso', 'Pareti divisorie'),
  rasature: image('/assets/images/services/rasature-finiture-interne.jpg', 'Rasature e finiture interne su pareti', 'Rasature e finiture interne'),
  finitureInterne: image(remote.modernInterior, 'Interno moderno con finiture curate', 'Finiture interne moderne'),
  isolamenti: image('/assets/images/services/controsoffitti-cartongesso.jpg', 'Isolamento interno con sistemi a secco e cartongesso', 'Isolamento interno'),
  ediliGenerali: image('/assets/images/services/lavori-edili-generali.jpg', 'Lavori edili generali in interno', 'Lavori edili generali'),
  manutenzioni: image('/assets/images/services/manutenzioni-edili.jpg', 'Manutenzioni edili con strumenti da cantiere', 'Manutenzioni edili'),
  hotel: image('/assets/images/sectors/lavori-per-hotel.jpg', 'Lavori interni in hotel con cartongesso e finiture', 'Lavori interni per hotel'),
  negozi: image(remote.cleanRoom, 'Ambiente commerciale pulito con finiture moderne', 'Finiture interne negozio'),
  supportoCantieri: image('/assets/images/hero/edilizia-cartongesso-cantiere-hero.jpg', 'Supporto operativo in cantiere con controsoffitti e cartongesso', 'Supporto cantieri e imprese'),
  uffici: image(remote.office, 'Uffici moderni con distribuzione interna professionale', 'Uffici moderni'),
}

export const projectImages = {
  barceloRoma: image('/assets/images/sectors/lavori-per-hotel.jpg', 'Lavori interni in hotel con cartongesso', 'Hotel lavori interni cartongesso'),
  residenzaVerdi: image('/assets/images/projects/appartamento-pareti-cartongesso.jpg', 'Appartamento in ristrutturazione con pareti in cartongesso', 'Appartamento pareti cartongesso'),
  hotelInternoMilano: image(remote.modernLobby, 'Interno hotel moderno con finiture professionali', 'Hotel interno moderno'),
  negozioCentro: image(remote.cleanRoom, 'Negozio con finiture interne in ristrutturazione', 'Negozio finiture interne'),
  condominioBianchi: image('/assets/images/projects/appartamento-pareti-cartongesso.jpg', 'Locale interno in ristrutturazione', 'Locale commerciale ristrutturazione'),
  ufficiDirezionali: image(remote.office, 'Uffici ristrutturati con pareti tecniche e finiture interne', 'Uffici ristrutturati'),
}

export const sectorImages = {
  privati: image('/assets/images/projects/appartamento-pareti-cartongesso.jpg', 'Lavori di ristrutturazione interna per abitazioni private', 'Lavori per privati'),
  aziende: image(remote.office, 'Ufficio aziendale in ristrutturazione interna', 'Lavori per aziende'),
  hotel: image(remote.modernLobby, 'Interni hotel con lavori di ristrutturazione', 'Lavori per hotel'),
  negozi: image(remote.cleanRoom, 'Negozio con lavori interni e finiture', 'Lavori per negozi'),
  studiTecnici: image(remote.building, 'Progettazione e pianificazione di cantiere per studi tecnici', 'Lavori per studi tecnici'),
  generalContractor: image('/assets/images/hero/edilizia-cartongesso-cantiere-hero.jpg', 'Cantiere organizzato per lavorazioni interne', 'Lavori per general contractor'),
  amministratori: image(remote.modernInterior, 'Interno ristrutturato per gestione immobiliare', 'Lavori per amministratori immobili'),
}

export const teamImages = {
  squadra: image('/assets/images/team/squadra-edile-cantiere.jpg', 'Squadra edile al lavoro in cantiere interno', 'Squadra edile cantiere'),
  meeting: image(remote.team, 'Team tecnico in riunione operativa', 'Team tecnico'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
