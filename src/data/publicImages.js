export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Foto pubbliche: solo cantieri, edilizia, cartongesso, ristrutturazioni, rasature,
// interni in lavorazione e controllo operativo.
// Regola obbligatoria: ogni chiave usa una sorgente diversa. Se una foto appare una volta,
// non deve essere riutilizzata in nessun altro punto del sito.
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=82`

const photo = {
  placeholderHero: img('photo-1503387762-592deb58ef4e'),
  placeholderService: img('photo-1504307651254-35680f356dfd'),
  placeholderProject: img('photo-1541888946425-d81bb19240f5'),
  placeholderSector: img('photo-1581094794329-c8112a89af12'),
  placeholderDocument: img('photo-1581092160562-40aa08e78837'),
  placeholderHeroSvg: img('photo-1504917595217-d4dc5ebe6122'),
  placeholderServiceSvg: img('photo-1508450859948-4e04fabaa4ea'),
  placeholderProjectSvg: img('photo-1523413651479-597eb2da0ad6'),
  placeholderSectorSvg: img('photo-1581092918056-0c4c3acd3789'),
  placeholderDocumentSvg: img('photo-1503389152951-9f343605f61e'),

  heroMain: img('photo-1517581177682-a085bb7ffb38'),
  heroCeiling: img('photo-1600585154526-990dced4db0d'),
  heroBuilding: img('photo-1448630360428-65456885c650'),
  heroLobby: img('photo-1600607687939-ce8a6c25118c'),
  heroPlanning: img('photo-1586281380349-632531db7ed4'),
  heroBlueprint: img('photo-1454165804606-c3d57bc86b40'),

  serviceCartongesso: img('photo-1621905252507-b35492cc74b4'),
  serviceControsoffitti: img('photo-1600566753086-00f18fb6b3ea'),
  serviceParetiDivisorie: img('photo-1600585154340-be6161a56a0c'),
  serviceRasature: img('photo-1562259949-e8e7689d7828'),
  serviceFinitureInterne: img('photo-1600566753190-17f0baa2a6c3'),
  serviceIsolamenti: img('photo-1570129477492-45c003edd2be'),
  serviceEdiliGenerali: img('photo-1581858726788-75bc0f6a952d'),
  serviceManutenzioni: img('photo-1581091012184-7e0cdfbb679e'),
  serviceHotel: img('photo-1560448204-e02f11c3d0e2'),
  serviceNegozi: img('photo-1564540583246-934409427776'),
  serviceSupportoCantieri: img('photo-1521790797524-b2497295b8a0'),
  serviceUffici: img('photo-1497366811353-6870744d04b2'),
  serviceTools: img('photo-1530124566582-a618bc2615dc'),
  serviceMaterials: img('photo-1599707254554-027aeb4deacd'),

  projectBarceloRoma: img('photo-1600607687920-4e2a09cf159d'),
  projectResidenzaVerdi: img('photo-1600210492486-724fe5c67fb0'),
  projectHotelMilano: img('photo-1566073771259-6a8506099945'),
  projectNegozioCentro: img('photo-1524758631624-e2822e304c36'),
  projectCondominioBianchi: img('photo-1494526585095-c41746248156'),
  projectUfficiDirezionali: img('photo-1600566752734-2d6a5f0f0e8e'),

  sectorPrivati: img('photo-1600566753151-384129cf4e3e'),
  sectorAziende: img('photo-1600566752355-35792bedcfea'),
  sectorHotel: img('photo-1559599189-fe84dea4eb79'),
  sectorNegozi: img('photo-1491933382434-500287f9b54b'),
  sectorStudiTecnici: img('photo-1581092162384-8987c1d64926'),
  sectorGeneralContractor: img('photo-1581092335397-9583eb92d232'),
  sectorAmministratori: img('photo-1581092334651-ddf26d9a09d0'),

  teamSquadra: img('photo-1581092160607-ee22621dd758'),
  teamMeeting: img('photo-1581092162384-8987c1d64718'),
  teamContractor: img('photo-1581092795360-fd1ca04f0952'),
}

const usedSources = new Set()
function uniqueImage(key, src, alt, title) {
  if (usedSources.has(src)) {
    throw new Error(`Immagine duplicata in publicImages.js: ${key}`)
  }
  usedSources.add(src)
  return image(src, alt, title)
}

export const placeholderImages = {
  hero: uniqueImage('placeholder.hero', photo.placeholderHero, 'Operai durante una ristrutturazione interna', 'Cantiere interno'),
  service: uniqueImage('placeholder.service', photo.placeholderService, 'Operatore al lavoro su parete interna', 'Servizio cartongesso e finiture'),
  project: uniqueImage('placeholder.project', photo.placeholderProject, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sector: uniqueImage('placeholder.sector', photo.placeholderSector, 'Struttura interna in fase di costruzione', 'Settore cantiere'),
  document: uniqueImage('placeholder.document', photo.placeholderDocument, 'Materiali e attrezzature in ristrutturazione', 'Materiali cantiere'),
  heroSvg: uniqueImage('placeholder.heroSvg', photo.placeholderHeroSvg, 'Operai durante una ristrutturazione interna', 'Hero cantiere'),
  serviceSvg: uniqueImage('placeholder.serviceSvg', photo.placeholderServiceSvg, 'Operatore al lavoro su parete interna', 'Servizio cartongesso'),
  projectSvg: uniqueImage('placeholder.projectSvg', photo.placeholderProjectSvg, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sectorSvg: uniqueImage('placeholder.sectorSvg', photo.placeholderSectorSvg, 'Struttura interna in fase di costruzione', 'Settori clienti'),
  documentSvg: uniqueImage('placeholder.documentSvg', photo.placeholderDocumentSvg, 'Materiali e attrezzature in ristrutturazione', 'Documento cantiere'),
}

export const heroImages = {
  main: uniqueImage('hero.main', photo.heroMain, 'Operai con protezioni durante una ristrutturazione interna', 'Ristrutturazione interna'),
  ceiling: uniqueImage('hero.ceiling', photo.heroCeiling, 'Struttura interna e soffitto in fase di lavorazione', 'Controsoffitto e struttura interna'),
  building: uniqueImage('hero.building', photo.heroBuilding, 'Operai su facciata e ponteggio durante ristrutturazione', 'Lavori esterni e ponteggi'),
  lobby: uniqueImage('hero.lobby', photo.heroLobby, 'Operatore durante preparazione e finitura pareti interne', 'Finiture interne'),
  planning: uniqueImage('hero.planning', photo.heroPlanning, 'Misurazione parete e controllo operativo in cantiere', 'Misurazione cantiere'),
  blueprint: uniqueImage('hero.blueprint', photo.heroBlueprint, 'Tecnico in cantiere durante rilievo e misurazione', 'Rilievo tecnico cantiere'),
}

export const serviceImages = {
  cartongesso: uniqueImage('service.cartongesso', photo.serviceCartongesso, 'Operatore al lavoro su parete interna in cartongesso', 'Cartongesso e pareti interne'),
  controsoffitti: uniqueImage('service.controsoffitti', photo.serviceControsoffitti, 'Struttura interna e soffitto in lavorazione', 'Controsoffitti e strutture interne'),
  paretiDivisorie: uniqueImage('service.paretiDivisorie', photo.serviceParetiDivisorie, 'Telaio e struttura interna per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: uniqueImage('service.rasature', photo.serviceRasature, 'Rasatura e finitura di superficie muraria', 'Rasature e finiture pareti'),
  finitureInterne: uniqueImage('service.finitureInterne', photo.serviceFinitureInterne, 'Applicazione primer e finitura su parete interna', 'Finiture interne'),
  isolamenti: uniqueImage('service.isolamenti', photo.serviceIsolamenti, 'Materiali e struttura interna durante ristrutturazione', 'Isolamenti e sistemi a secco'),
  ediliGenerali: uniqueImage('service.ediliGenerali', photo.serviceEdiliGenerali, 'Interno edificio in fase di ristrutturazione', 'Lavori edili interni'),
  manutenzioni: uniqueImage('service.manutenzioni', photo.serviceManutenzioni, 'Operatore con attrezzatura in ambiente interno', 'Manutenzioni edili'),
  hotel: uniqueImage('service.hotel', photo.serviceHotel, 'Interno in ristrutturazione per struttura ricettiva', 'Lavori interni hotel'),
  negozi: uniqueImage('service.negozi', photo.serviceNegozi, 'Operai durante finiture interne di uno spazio commerciale', 'Finiture spazio commerciale'),
  supportoCantieri: uniqueImage('service.supportoCantieri', photo.serviceSupportoCantieri, 'Operatore in cantiere interno durante controllo lavori', 'Supporto operativo cantiere'),
  uffici: uniqueImage('service.uffici', photo.serviceUffici, 'Operatore durante finitura di parete interna', 'Uffici e spazi interni'),
  tools: uniqueImage('service.tools', photo.serviceTools, 'Operatore applica pannelli e finiture in cantiere', 'Attrezzature e lavorazioni'),
  materials: uniqueImage('service.materials', photo.serviceMaterials, 'Posa e lavorazioni di finitura in interno', 'Materiali e finiture edilizie'),
}

export const projectImages = {
  barceloRoma: uniqueImage('project.barceloRoma', photo.projectBarceloRoma, 'Interno in ristrutturazione con apertura e lavorazioni in corso', 'Cantiere interno hospitality'),
  residenzaVerdi: uniqueImage('project.residenzaVerdi', photo.projectResidenzaVerdi, 'Struttura interna abitativa in fase di ristrutturazione', 'Ristrutturazione interna residenziale'),
  hotelInternoMilano: uniqueImage('project.hotelInternoMilano', photo.projectHotelMilano, 'Interno con struttura e soffitto in lavorazione', 'Hotel interno in ristrutturazione'),
  negozioCentro: uniqueImage('project.negozioCentro', photo.projectNegozioCentro, 'Operai durante finiture interne di uno spazio commerciale', 'Locale commerciale in finitura'),
  condominioBianchi: uniqueImage('project.condominioBianchi', photo.projectCondominioBianchi, 'Ristrutturazione esterna con ponteggio', 'Condominio lavori edili'),
  ufficiDirezionali: uniqueImage('project.ufficiDirezionali', photo.projectUfficiDirezionali, 'Operatore al lavoro su parete interna', 'Uffici in ristrutturazione'),
}

export const sectorImages = {
  privati: uniqueImage('sector.privati', photo.sectorPrivati, 'Ristrutturazione interna residenziale', 'Lavori per privati'),
  aziende: uniqueImage('sector.aziende', photo.sectorAziende, 'Lavorazioni interne per ambienti aziendali', 'Lavori per aziende'),
  hotel: uniqueImage('sector.hotel', photo.sectorHotel, 'Interno hospitality con strutture in lavorazione', 'Lavori per hotel'),
  negozi: uniqueImage('sector.negozi', photo.sectorNegozi, 'Finiture interne per spazio commerciale', 'Lavori per negozi'),
  studiTecnici: uniqueImage('sector.studiTecnici', photo.sectorStudiTecnici, 'Rilievo e misurazione tecnica in cantiere', 'Studi tecnici'),
  generalContractor: uniqueImage('sector.generalContractor', photo.sectorGeneralContractor, 'Controllo operativo in cantiere interno', 'General contractor'),
  amministratori: uniqueImage('sector.amministratori', photo.sectorAmministratori, 'Ripristino e finitura parete edile', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: uniqueImage('team.squadra', photo.teamSquadra, 'Squadra durante ristrutturazione interna', 'Squadra edile cantiere'),
  meeting: uniqueImage('team.meeting', photo.teamMeeting, 'Tecnico durante rilievo e controllo pareti', 'Rilievo operativo'),
  contractor: uniqueImage('team.contractor', photo.teamContractor, 'Operatori durante lavorazione e finitura pareti', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
