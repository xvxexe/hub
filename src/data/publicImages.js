export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Foto pubbliche: solo immagini coerenti con cantieri, edilizia, cartongesso, rasature,
// ristrutturazioni interne e controllo operativo.
// Regola: ogni immagine esportata usa una sorgente diversa e diretta, senza generatori esterni
// che possono restituire placeholder rotti.
const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=82`

const photo = {
  placeholderHero: unsplash('photo-1503387762-592deb58ef4e'),
  placeholderService: unsplash('photo-1504917595217-d4dc5ebe6122'),
  placeholderProject: unsplash('photo-1504307651254-35680f356dfd'),
  placeholderSector: unsplash('photo-1541888946425-d81bb19240f5'),
  placeholderDocument: unsplash('photo-1581094794329-c8112a89af12'),
  placeholderHeroSvg: unsplash('photo-1517581177682-a085bb7ffb38'),
  placeholderServiceSvg: unsplash('photo-1586864387789-628af9feed72'),
  placeholderProjectSvg: unsplash('photo-1600566753190-17f0baa2a6c3'),
  placeholderSectorSvg: unsplash('photo-1600585154340-be6161a56a0c'),
  placeholderDocumentSvg: unsplash('photo-1600566752355-35792bedcfea'),

  heroMain: unsplash('photo-1523413651479-597eb2da0ad6'),
  heroCeiling: unsplash('photo-1486406146926-c627a92ad1ab'),
  heroBuilding: unsplash('photo-1494526585095-c41746248156'),
  heroLobby: unsplash('photo-1600607687939-ce8a6c25118c'),
  heroPlanning: unsplash('photo-1581092160562-40aa08e78837'),
  heroBlueprint: unsplash('photo-1586281380349-632531db7ed4'),

  serviceCartongesso: unsplash('photo-1621905252507-b35492cc74b4'),
  serviceControsoffitti: unsplash('photo-1600585154526-990dced4db0d'),
  serviceParetiDivisorie: unsplash('photo-1600566752734-2d6a5f0f0e8e'),
  serviceRasature: unsplash('photo-1562259949-e8e7689d7828'),
  serviceFinitureInterne: unsplash('photo-1600566753086-00f18fb6b3ea'),
  serviceIsolamenti: unsplash('photo-1570129477492-45c003edd2be'),
  serviceEdiliGenerali: unsplash('photo-1581858726788-75bc0f6a952d'),
  serviceManutenzioni: unsplash('photo-1508450859948-4e04fabaa4ea'),
  serviceHotel: unsplash('photo-1560448204-e02f11c3d0e2'),
  serviceNegozi: unsplash('photo-1564540583246-934409427776'),
  serviceSupportoCantieri: unsplash('photo-1454165804606-c3d57bc86b40'),
  serviceUffici: unsplash('photo-1497366811353-6870744d04b2'),
  serviceTools: unsplash('photo-1530124566582-a618bc2615dc'),
  serviceMaterials: unsplash('photo-1599707254554-027aeb4deacd'),

  projectBarceloRoma: unsplash('photo-1600607687920-4e2a09cf159d'),
  projectResidenzaVerdi: unsplash('photo-1600210492486-724fe5c67fb0'),
  projectHotelMilano: unsplash('photo-1566073771259-6a8506099945'),
  projectNegozioCentro: unsplash('photo-1524758631624-e2822e304c36'),
  projectCondominioBianchi: unsplash('photo-1448630360428-65456885c650'),
  projectUfficiDirezionali: unsplash('photo-1497366754035-f200968a6e72'),

  sectorPrivati: unsplash('photo-1600566753151-384129cf4e3e'),
  sectorAziende: unsplash('photo-1497366754035-f200968a6e72'),
  sectorHotel: unsplash('photo-1559599189-fe84dea4eb79'),
  sectorNegozi: unsplash('photo-1491933382434-500287f9b54b'),
  sectorStudiTecnici: unsplash('photo-1503389152951-9f343605f61e'),
  sectorGeneralContractor: unsplash('photo-1521790797524-b2497295b8a0'),
  sectorAmministratori: unsplash('photo-1581092918056-0c4c3acd3789'),

  teamSquadra: unsplash('photo-1521791136064-7986c2920216'),
  teamMeeting: unsplash('photo-1542744173-8e7e53415bb0'),
  teamContractor: unsplash('photo-1552664730-d307ca884978'),
}

export const placeholderImages = {
  hero: image(photo.placeholderHero, 'Operai durante una ristrutturazione interna', 'Cantiere interno'),
  service: image(photo.placeholderService, 'Operatore al lavoro su parete interna', 'Servizio cartongesso e finiture'),
  project: image(photo.placeholderProject, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sector: image(photo.placeholderSector, 'Struttura interna in fase di costruzione', 'Settore cantiere'),
  document: image(photo.placeholderDocument, 'Materiali e attrezzature in ristrutturazione', 'Materiali cantiere'),
  heroSvg: image(photo.placeholderHeroSvg, 'Operai durante una ristrutturazione interna', 'Hero cantiere'),
  serviceSvg: image(photo.placeholderServiceSvg, 'Operatore al lavoro su parete interna', 'Servizio cartongesso'),
  projectSvg: image(photo.placeholderProjectSvg, 'Tecnico in cantiere durante misurazione pareti', 'Progetto cantiere'),
  sectorSvg: image(photo.placeholderSectorSvg, 'Struttura interna in fase di costruzione', 'Settori clienti'),
  documentSvg: image(photo.placeholderDocumentSvg, 'Materiali e attrezzature in ristrutturazione', 'Documento cantiere'),
}

export const heroImages = {
  main: image(photo.heroMain, 'Operai con protezioni durante una ristrutturazione interna', 'Ristrutturazione interna'),
  ceiling: image(photo.heroCeiling, 'Struttura interna e soffitto in fase di lavorazione', 'Controsoffitto e struttura interna'),
  building: image(photo.heroBuilding, 'Operai su facciata e ponteggio durante ristrutturazione', 'Lavori esterni e ponteggi'),
  lobby: image(photo.heroLobby, 'Operatore durante preparazione e finitura pareti interne', 'Finiture interne'),
  planning: image(photo.heroPlanning, 'Misurazione parete e controllo operativo in cantiere', 'Misurazione cantiere'),
  blueprint: image(photo.heroBlueprint, 'Tecnico in cantiere durante rilievo e misurazione', 'Rilievo tecnico cantiere'),
}

export const serviceImages = {
  cartongesso: image(photo.serviceCartongesso, 'Operatore al lavoro su parete interna in cartongesso', 'Cartongesso e pareti interne'),
  controsoffitti: image(photo.serviceControsoffitti, 'Struttura interna e soffitto in lavorazione', 'Controsoffitti e strutture interne'),
  paretiDivisorie: image(photo.serviceParetiDivisorie, 'Telaio e struttura interna per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: image(photo.serviceRasature, 'Rasatura e finitura di superficie muraria', 'Rasature e finiture pareti'),
  finitureInterne: image(photo.serviceFinitureInterne, 'Applicazione primer e finitura su parete interna', 'Finiture interne'),
  isolamenti: image(photo.serviceIsolamenti, 'Materiali e struttura interna durante ristrutturazione', 'Isolamenti e sistemi a secco'),
  ediliGenerali: image(photo.serviceEdiliGenerali, 'Interno edificio in fase di ristrutturazione', 'Lavori edili interni'),
  manutenzioni: image(photo.serviceManutenzioni, 'Operatore con attrezzatura in ambiente interno', 'Manutenzioni edili'),
  hotel: image(photo.serviceHotel, 'Interno in ristrutturazione per struttura ricettiva', 'Lavori interni hotel'),
  negozi: image(photo.serviceNegozi, 'Operai durante finiture interne di uno spazio commerciale', 'Finiture spazio commerciale'),
  supportoCantieri: image(photo.serviceSupportoCantieri, 'Operatore in cantiere interno durante controllo lavori', 'Supporto operativo cantiere'),
  uffici: image(photo.serviceUffici, 'Operatore durante finitura di parete interna', 'Uffici e spazi interni'),
  tools: image(photo.serviceTools, 'Operatore applica pannelli e finiture in cantiere', 'Attrezzature e lavorazioni'),
  materials: image(photo.serviceMaterials, 'Posa e lavorazioni di finitura in interno', 'Materiali e finiture edilizie'),
}

export const projectImages = {
  barceloRoma: image(photo.projectBarceloRoma, 'Interno in ristrutturazione con apertura e lavorazioni in corso', 'Cantiere interno hospitality'),
  residenzaVerdi: image(photo.projectResidenzaVerdi, 'Struttura interna abitativa in fase di ristrutturazione', 'Ristrutturazione interna residenziale'),
  hotelInternoMilano: image(photo.projectHotelMilano, 'Interno con struttura e soffitto in lavorazione', 'Hotel interno in ristrutturazione'),
  negozioCentro: image(photo.projectNegozioCentro, 'Operai durante finiture interne di uno spazio commerciale', 'Locale commerciale in finitura'),
  condominioBianchi: image(photo.projectCondominioBianchi, 'Ristrutturazione esterna con ponteggio', 'Condominio lavori edili'),
  ufficiDirezionali: image(photo.projectUfficiDirezionali, 'Operatore al lavoro su parete interna', 'Uffici in ristrutturazione'),
}

export const sectorImages = {
  privati: image(photo.sectorPrivati, 'Ristrutturazione interna residenziale', 'Lavori per privati'),
  aziende: image(photo.sectorAziende, 'Lavorazioni interne per ambienti aziendali', 'Lavori per aziende'),
  hotel: image(photo.sectorHotel, 'Interno hospitality con strutture in lavorazione', 'Lavori per hotel'),
  negozi: image(photo.sectorNegozi, 'Finiture interne per spazio commerciale', 'Lavori per negozi'),
  studiTecnici: image(photo.sectorStudiTecnici, 'Rilievo e misurazione tecnica in cantiere', 'Studi tecnici'),
  generalContractor: image(photo.sectorGeneralContractor, 'Controllo operativo in cantiere interno', 'General contractor'),
  amministratori: image(photo.sectorAmministratori, 'Ripristino e finitura parete edile', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: image(photo.teamSquadra, 'Squadra durante ristrutturazione interna', 'Squadra edile cantiere'),
  meeting: image(photo.teamMeeting, 'Tecnico durante rilievo e controllo pareti', 'Rilievo operativo'),
  contractor: image(photo.teamContractor, 'Operatori durante lavorazione e finitura pareti', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
