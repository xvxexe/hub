export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Foto pubbliche: solo immagini coerenti con cantieri, edilizia, cartongesso, rasature,
// ristrutturazioni interne e controllo operativo. Nessuna immagine corporate generica.
const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`

const remote = {
  heroConstruction: pexels('5493654'),
  workersPlanning: pexels('8488023'),
  constructionFrame: pexels('4642437'),
  siteEngineer: pexels('32990521'),
  siteWide: pexels('4756490'),
  safetyHelmet: pexels('5493666'),
  materialsStack: pexels('16767783'),
  blueprintDesk: pexels('8488023'),
  technicalOffice: pexels('5493658'),
  hotelCorridor: pexels('4756490'),
  interiorShell: pexels('32990521'),
  interiorCeiling: pexels('4642437'),
  interiorFinish: pexels('5493656'),
  commercialInterior: pexels('36153946'),
  facadeWork: pexels('19957208'),
  concreteDetail: pexels('29181494'),
  teamMeeting: pexels('5493665'),
  contractorTeam: pexels('5493654'),
  industrialSite: pexels('4756490'),
  constructionWorker: pexels('5493673'),
  wallWork: pexels('5493658'),
  plasteringWall: pexels('10383588'),
  skimCoating: pexels('4953232'),
}

export const placeholderImages = {
  hero: image(remote.heroConstruction, 'Operai durante una ristrutturazione interna', 'Cantiere interno'),
  service: image(remote.wallWork, 'Operatore al lavoro su parete interna', 'Servizio cartongesso e finiture'),
  project: image(remote.workersPlanning, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sector: image(remote.constructionFrame, 'Struttura interna in fase di costruzione', 'Settore cantiere'),
  document: image(remote.materialsStack, 'Materiali e attrezzature in ristrutturazione', 'Materiali cantiere'),
  heroSvg: image(remote.heroConstruction, 'Operai durante una ristrutturazione interna', 'Hero cantiere'),
  serviceSvg: image(remote.wallWork, 'Operatore al lavoro su parete interna', 'Servizio cartongesso'),
  projectSvg: image(remote.workersPlanning, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sectorSvg: image(remote.constructionFrame, 'Struttura interna in fase di costruzione', 'Settori clienti'),
  documentSvg: image(remote.materialsStack, 'Materiali e attrezzature in ristrutturazione', 'Documento cantiere'),
}

export const heroImages = {
  main: image(remote.heroConstruction, 'Operai con protezioni durante una ristrutturazione interna', 'Ristrutturazione interna'),
  ceiling: image(remote.interiorCeiling, 'Struttura interna e soffitto in fase di lavorazione', 'Controsoffitto e struttura interna'),
  building: image(remote.facadeWork, 'Operai su facciata e ponteggio durante ristrutturazione', 'Lavori esterni e ponteggi'),
  lobby: image(remote.interiorFinish, 'Operatore durante preparazione e finitura pareti interne', 'Finiture interne'),
  planning: image(remote.workersPlanning, 'Misurazione parete e controllo operativo in cantiere', 'Misurazione cantiere'),
  blueprint: image(remote.blueprintDesk, 'Tecnico in cantiere durante rilievo e misurazione', 'Rilievo tecnico cantiere'),
}

export const serviceImages = {
  cartongesso: image(remote.wallWork, 'Operatore al lavoro su parete interna in cartongesso', 'Cartongesso e pareti interne'),
  controsoffitti: image(remote.interiorCeiling, 'Struttura interna e soffitto in lavorazione', 'Controsoffitti e strutture interne'),
  paretiDivisorie: image(remote.constructionFrame, 'Telaio e struttura interna per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: image(remote.skimCoating, 'Rasatura e finitura di superficie muraria', 'Rasature e finiture pareti'),
  finitureInterne: image(remote.interiorFinish, 'Applicazione primer e finitura su parete interna', 'Finiture interne'),
  isolamenti: image(remote.materialsStack, 'Materiali e struttura interna durante ristrutturazione', 'Isolamenti e sistemi a secco'),
  ediliGenerali: image(remote.siteWide, 'Interno edificio in fase di ristrutturazione', 'Lavori edili interni'),
  manutenzioni: image(remote.safetyHelmet, 'Operatore con attrezzatura in ambiente interno', 'Manutenzioni edili'),
  hotel: image(remote.interiorShell, 'Interno in ristrutturazione per struttura ricettiva', 'Lavori interni hotel'),
  negozi: image(remote.commercialInterior, 'Operai durante finiture interne e tinteggiatura', 'Finiture spazio commerciale'),
  supportoCantieri: image(remote.siteEngineer, 'Operatore in cantiere interno durante controllo lavori', 'Supporto operativo cantiere'),
  uffici: image(remote.technicalOffice, 'Operatore durante finitura di parete interna', 'Uffici e spazi interni'),
  tools: image(remote.constructionWorker, 'Operatore applica pannelli e finiture in cantiere', 'Attrezzature e lavorazioni'),
  materials: image(remote.concreteDetail, 'Posa e lavorazioni di finitura in interno', 'Materiali e finiture edilizie'),
}

export const projectImages = {
  barceloRoma: image(remote.interiorShell, 'Interno in ristrutturazione con apertura e lavorazioni in corso', 'Cantiere interno hospitality'),
  residenzaVerdi: image(remote.constructionFrame, 'Struttura interna abitativa in fase di ristrutturazione', 'Ristrutturazione interna residenziale'),
  hotelInternoMilano: image(remote.interiorCeiling, 'Interno con struttura e soffitto in lavorazione', 'Hotel interno in ristrutturazione'),
  negozioCentro: image(remote.commercialInterior, 'Operai durante finiture interne di uno spazio commerciale', 'Locale commerciale in finitura'),
  condominioBianchi: image(remote.facadeWork, 'Ristrutturazione esterna con ponteggio', 'Condominio lavori edili'),
  ufficiDirezionali: image(remote.wallWork, 'Operatore al lavoro su parete interna', 'Uffici in ristrutturazione'),
}

export const sectorImages = {
  privati: image(remote.interiorShell, 'Ristrutturazione interna residenziale', 'Lavori per privati'),
  aziende: image(remote.wallWork, 'Lavorazioni interne per ambienti aziendali', 'Lavori per aziende'),
  hotel: image(remote.interiorCeiling, 'Interno hospitality con strutture in lavorazione', 'Lavori per hotel'),
  negozi: image(remote.commercialInterior, 'Finiture interne per spazio commerciale', 'Lavori per negozi'),
  studiTecnici: image(remote.workersPlanning, 'Rilievo e misurazione tecnica in cantiere', 'Studi tecnici'),
  generalContractor: image(remote.siteEngineer, 'Controllo operativo in cantiere interno', 'General contractor'),
  amministratori: image(remote.plasteringWall, 'Ripristino e finitura parete edile', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: image(remote.contractorTeam, 'Squadra durante ristrutturazione interna', 'Squadra edile cantiere'),
  meeting: image(remote.workersPlanning, 'Tecnico durante rilievo e controllo pareti', 'Rilievo operativo'),
  contractor: image(remote.teamMeeting, 'Operatori durante lavorazione e finitura pareti', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
