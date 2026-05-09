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
// Regola: ogni immagine esportata usa una sorgente diversa. Non riutilizzare la stessa foto
// in più punti del sito: se serve una nuova immagine, aggiungere una nuova voce qui.
const stock = (query, signature) => (
  `https://source.unsplash.com/1800x1200/?${encodeURIComponent(query)}&sig=${signature}`
)

const photo = {
  placeholderHero: stock('construction site interior renovation workers', 'europa-placeholder-hero'),
  placeholderService: stock('drywall wall construction worker', 'europa-placeholder-service'),
  placeholderProject: stock('building renovation measurements worker', 'europa-placeholder-project'),
  placeholderSector: stock('interior construction metal studs', 'europa-placeholder-sector'),
  placeholderDocument: stock('construction materials drywall boards', 'europa-placeholder-document'),
  placeholderHeroSvg: stock('renovation site plasterboard worker', 'europa-placeholder-hero-svg'),
  placeholderServiceSvg: stock('interior wall finishing construction', 'europa-placeholder-service-svg'),
  placeholderProjectSvg: stock('construction worker measuring wall', 'europa-placeholder-project-svg'),
  placeholderSectorSvg: stock('building site interior framing', 'europa-placeholder-sector-svg'),
  placeholderDocumentSvg: stock('construction tools materials site', 'europa-placeholder-document-svg'),

  heroMain: stock('interior renovation construction workers', 'europa-hero-main'),
  heroCeiling: stock('drywall ceiling construction interior', 'europa-hero-ceiling'),
  heroBuilding: stock('building facade renovation scaffolding', 'europa-hero-building'),
  heroLobby: stock('wall plastering interior renovation', 'europa-hero-lobby'),
  heroPlanning: stock('construction site planning measuring', 'europa-hero-planning'),
  heroBlueprint: stock('construction blueprint site measurement', 'europa-hero-blueprint'),

  serviceCartongesso: stock('drywall installation plasterboard wall', 'europa-service-cartongesso'),
  serviceControsoffitti: stock('ceiling drywall frame installation', 'europa-service-controsoffitti'),
  serviceParetiDivisorie: stock('metal stud drywall partition construction', 'europa-service-pareti'),
  serviceRasature: stock('plastering wall skim coat construction', 'europa-service-rasature'),
  serviceFinitureInterne: stock('interior finishing wall renovation worker', 'europa-service-finiture'),
  serviceIsolamenti: stock('insulation drywall construction materials', 'europa-service-isolamenti'),
  serviceEdiliGenerali: stock('interior building renovation site', 'europa-service-edili'),
  serviceManutenzioni: stock('construction maintenance worker tools', 'europa-service-manutenzioni'),
  serviceHotel: stock('hotel renovation construction interior', 'europa-service-hotel'),
  serviceNegozi: stock('shop renovation construction interior', 'europa-service-negozi'),
  serviceSupportoCantieri: stock('construction site supervisor interior', 'europa-service-supporto'),
  serviceUffici: stock('office renovation construction drywall', 'europa-service-uffici'),
  serviceTools: stock('construction worker tools drywall', 'europa-service-tools'),
  serviceMaterials: stock('drywall boards construction materials', 'europa-service-materials'),

  projectBarceloRoma: stock('hotel interior renovation construction corridor', 'europa-project-barcelo'),
  projectResidenzaVerdi: stock('residential interior renovation drywall', 'europa-project-residenza'),
  projectHotelMilano: stock('hospitality drywall ceiling renovation', 'europa-project-hotel-milano'),
  projectNegozioCentro: stock('retail store renovation construction worker', 'europa-project-negozio'),
  projectCondominioBianchi: stock('apartment building renovation scaffolding', 'europa-project-condominio'),
  projectUfficiDirezionali: stock('office interior construction wall finishing', 'europa-project-uffici'),

  sectorPrivati: stock('home renovation drywall interior worker', 'europa-sector-privati'),
  sectorAziende: stock('commercial interior renovation construction', 'europa-sector-aziende'),
  sectorHotel: stock('hotel room renovation construction', 'europa-sector-hotel'),
  sectorNegozi: stock('retail interior fit out construction', 'europa-sector-negozi'),
  sectorStudiTecnici: stock('construction technical survey measurement', 'europa-sector-studi'),
  sectorGeneralContractor: stock('general contractor construction inspection', 'europa-sector-contractor'),
  sectorAmministratori: stock('building maintenance plaster repair', 'europa-sector-amministratori'),

  teamSquadra: stock('construction crew interior renovation', 'europa-team-squadra'),
  teamMeeting: stock('construction workers planning site', 'europa-team-meeting'),
  teamContractor: stock('contractor team construction site', 'europa-team-contractor'),
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
