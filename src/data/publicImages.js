export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Immagini pubbliche generate come SVG locali, così non dipendono da stock esterni
// che possono rompersi, cambiare contenuto o ripetersi.
// Regola obbligatoria: ogni immagine ha un ID e una scena diversa.
// Tema consentito: solo cantieri, edilizia, cartongesso, rasature, ponteggi,
// materiali, interni in lavorazione e organizzazione operativa di cantiere.

const usedSources = new Set()

function svgData(id, title, scene) {
  const palettes = [
    ['#eef4ff', '#d9e8ff', '#0f2f4f', '#f2b705', '#1d5fbf'],
    ['#f7f8fb', '#e6edf5', '#10233c', '#d9902f', '#235789'],
    ['#f5efe6', '#e8dac8', '#172033', '#c76f2a', '#0b4ea2'],
    ['#eef3ef', '#dbe8df', '#10291f', '#e0a21b', '#145c9e'],
    ['#f4f1ee', '#e4ded8', '#1b2430', '#d78228', '#174a7c'],
  ]
  const p = palettes[id.length % palettes.length]
  const shapes = sceneShapes(scene, p)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1200" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${p[0]}"/>
          <stop offset="1" stop-color="${p[1]}"/>
        </linearGradient>
        <linearGradient id="floor-${id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.12"/>
        </linearGradient>
        <filter id="shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="28" stdDeviation="30" flood-color="#0f172a" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="1800" height="1200" fill="url(#bg-${id})"/>
      <rect y="780" width="1800" height="420" fill="url(#floor-${id})"/>
      <g opacity="0.18" stroke="${p[2]}" stroke-width="4">
        <path d="M0 780h1800"/>
        <path d="M120 900h1560"/>
        <path d="M260 1040h1280"/>
      </g>
      ${shapes}
      <g opacity="0.16" fill="none" stroke="${p[4]}" stroke-width="14">
        <path d="M130 180 C420 80, 760 120, 1040 58 S1500 62, 1690 162"/>
      </g>
    </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function sceneShapes(scene, p) {
  const wall = `<rect x="180" y="180" width="1080" height="600" rx="34" fill="#fff" opacity="0.78" filter="url(#shadow-${scene})"/><rect x="230" y="230" width="980" height="500" rx="22" fill="#f8fafc" stroke="#d8e0ea" stroke-width="8"/>`
  const studs = `<g stroke="${p[4]}" stroke-width="18" opacity="0.9"><path d="M360 250v480"/><path d="M520 250v480"/><path d="M680 250v480"/><path d="M840 250v480"/><path d="M1000 250v480"/><path d="M230 380h980"/><path d="M230 580h980"/></g>`
  const boards = `<g filter="url(#shadow-${scene})"><rect x="260" y="300" width="300" height="520" rx="18" fill="#f7f2e8" stroke="#d7c7ad" stroke-width="8"/><rect x="590" y="260" width="300" height="560" rx="18" fill="#fbf6ec" stroke="#d7c7ad" stroke-width="8"/><rect x="920" y="330" width="300" height="490" rx="18" fill="#f4ecd9" stroke="#d7c7ad" stroke-width="8"/></g>`
  const scaffold = `<g fill="none" stroke="${p[2]}" stroke-width="18" stroke-linecap="round"><path d="M260 820V260M620 820V260M980 820V260M1340 820V260"/><path d="M220 360h1160M220 540h1160M220 720h1160"/><path d="M260 820 620 260M620 820 980 260M980 820 1340 260"/></g><g fill="${p[3]}"><rect x="190" y="720" width="1220" height="64" rx="12"/><rect x="250" y="500" width="1040" height="54" rx="12"/></g>`
  const ceiling = `<g filter="url(#shadow-${scene})"><path d="M160 250h1420l-180 470H330z" fill="#ffffff" opacity="0.84"/><g stroke="${p[4]}" stroke-width="12" opacity="0.88"><path d="M250 360h1210M220 470h1200M190 590h1180"/><path d="M390 250l-80 470M620 250l-40 470M850 250v470M1080 250l40 470M1310 250l80 470"/></g></g>`
  const plaster = `<g filter="url(#shadow-${scene})"><rect x="200" y="230" width="980" height="610" rx="28" fill="#f4f0e8" stroke="#ded2c3" stroke-width="10"/><path d="M260 430c240-80 420 90 670-20 110-48 190-54 250-32v170c-210-80-340 92-560 30-180-52-320-20-360 28z" fill="#d9c5ae" opacity="0.74"/><rect x="1020" y="480" width="420" height="52" rx="26" fill="${p[3]}"/><rect x="1330" y="430" width="170" height="150" rx="28" fill="${p[2]}"/></g>`
  const tools = `<g filter="url(#shadow-${scene})"><rect x="300" y="650" width="560" height="170" rx="30" fill="${p[2]}"/><rect x="360" y="560" width="220" height="120" rx="24" fill="${p[3]}"/><circle cx="410" cy="850" r="46" fill="#27364a"/><circle cx="760" cy="850" r="46" fill="#27364a"/><path d="M980 360l260 260" stroke="${p[4]}" stroke-width="34" stroke-linecap="round"/><path d="M1215 600l-105 105" stroke="${p[3]}" stroke-width="48" stroke-linecap="round"/></g>`
  const blueprint = `<g filter="url(#shadow-${scene})"><rect x="220" y="230" width="1120" height="640" rx="30" fill="#ffffff"/><g stroke="${p[4]}" stroke-width="9" fill="none"><rect x="320" y="340" width="380" height="240"/><rect x="700" y="340" width="420" height="300"/><path d="M320 580h280v190H320zM1120 340v430H820"/><path d="M430 340v240M700 490h420M820 640v130"/></g><g stroke="${p[3]}" stroke-width="14"><path d="M1240 800l270-270"/><path d="M1470 520l80 80"/></g></g>`
  const materials = `<g filter="url(#shadow-${scene})"><rect x="260" y="680" width="1180" height="110" rx="20" fill="#b7791f"/><rect x="300" y="545" width="430" height="135" rx="20" fill="#f4e6cd" stroke="#d7bd90" stroke-width="8"/><rect x="770" y="500" width="430" height="180" rx="20" fill="#f9eed8" stroke="#d7bd90" stroke-width="8"/><rect x="470" y="390" width="430" height="155" rx="20" fill="#f5dfb9" stroke="#d7bd90" stroke-width="8"/><g fill="${p[2]}"><circle cx="420" cy="850" r="42"/><circle cx="1290" cy="850" r="42"/></g></g>`
  const siteInterior = `${wall}<g fill="${p[3]}" opacity="0.95"><rect x="300" y="720" width="980" height="64" rx="12"/><rect x="340" y="650" width="520" height="40" rx="10"/></g><g stroke="${p[4]}" stroke-width="14"><path d="M300 320h800M300 430h720M300 540h620"/></g>`
  const corridor = `<g filter="url(#shadow-${scene})"><path d="M220 210h1180l-220 660H420z" fill="#f8fafc" stroke="#dbe3ec" stroke-width="10"/><path d="M420 870 640 210M1180 870 980 210" stroke="${p[4]}" stroke-width="16" opacity="0.7"/><path d="M620 330h440M580 470h520M530 650h620" stroke="${p[2]}" stroke-width="14" opacity="0.3"/><rect x="1340" y="450" width="120" height="360" rx="18" fill="${p[3]}"/></g>`
  const exterior = `<g filter="url(#shadow-${scene})"><rect x="300" y="240" width="820" height="580" rx="20" fill="#eef2f7" stroke="#cad5e3" stroke-width="8"/><g fill="#dbeafe"><rect x="380" y="320" width="150" height="120"/><rect x="610" y="320" width="150" height="120"/><rect x="840" y="320" width="150" height="120"/><rect x="380" y="530" width="150" height="120"/><rect x="610" y="530" width="150" height="120"/><rect x="840" y="530" width="150" height="120"/></g></g>${scaffold}`
  const cleanRoom = `<g filter="url(#shadow-${scene})"><path d="M210 220h1160v650H210z" fill="#fff"/><path d="M210 760h1160v110H210z" fill="#e8edf3"/><rect x="760" y="360" width="310" height="400" fill="#f7f9fc" stroke="#cbd5e1" stroke-width="8"/><path d="M210 220l550 540M1370 220l-300 540" stroke="#dbe3ec" stroke-width="12"/><rect x="330" y="650" width="300" height="60" rx="14" fill="${p[3]}"/></g>`
  const variants = {
    drywall: `${wall}${studs}${boards}`,
    scaffold,
    ceiling,
    plaster,
    tools,
    blueprint,
    materials,
    interior: siteInterior,
    corridor,
    exterior,
    room: cleanRoom,
  }

  return variants[scene] ?? siteInterior
}

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]))
}

const photo = {
  placeholderHero: svgData('placeholder-hero', 'Cantiere interno con pareti e materiali', 'interior'),
  placeholderService: svgData('placeholder-service', 'Pareti in cartongesso in lavorazione', 'drywall'),
  placeholderProject: svgData('placeholder-project', 'Rilievo tecnico e progetto di cantiere', 'blueprint'),
  placeholderSector: svgData('placeholder-sector', 'Strutture interne da cantiere', 'ceiling'),
  placeholderDocument: svgData('placeholder-document', 'Materiali edili e pannelli', 'materials'),
  placeholderHeroSvg: svgData('placeholder-hero-svg', 'Interno edilizio in ristrutturazione', 'room'),
  placeholderServiceSvg: svgData('placeholder-service-svg', 'Rasatura parete in cantiere', 'plaster'),
  placeholderProjectSvg: svgData('placeholder-project-svg', 'Area di cantiere con strumenti', 'tools'),
  placeholderSectorSvg: svgData('placeholder-sector-svg', 'Ponteggio e lavori edili', 'scaffold'),
  placeholderDocumentSvg: svgData('placeholder-document-svg', 'Corridoio interno in lavorazione', 'corridor'),

  heroMain: svgData('hero-main', 'Ristrutturazione interna con lavorazioni a secco', 'drywall'),
  heroCeiling: svgData('hero-ceiling', 'Controsoffitto tecnico in fase di posa', 'ceiling'),
  heroBuilding: svgData('hero-building', 'Edificio con ponteggio e lavori esterni', 'exterior'),
  heroLobby: svgData('hero-lobby', 'Ambiente interno in finitura', 'room'),
  heroPlanning: svgData('hero-planning', 'Piano operativo e rilievo di cantiere', 'blueprint'),
  heroBlueprint: svgData('hero-blueprint', 'Disegno tecnico per lavorazioni interne', 'blueprint'),

  serviceCartongesso: svgData('service-cartongesso', 'Pareti divisorie in cartongesso', 'drywall'),
  serviceControsoffitti: svgData('service-controsoffitti', 'Struttura per controsoffitto tecnico', 'ceiling'),
  serviceParetiDivisorie: svgData('service-pareti-divisorie', 'Telaio metallico per pareti divisorie', 'drywall'),
  serviceRasature: svgData('service-rasature', 'Rasatura e preparazione parete', 'plaster'),
  serviceFinitureInterne: svgData('service-finiture-interne', 'Finiture interne pronte alla tinteggiatura', 'room'),
  serviceIsolamenti: svgData('service-isolamenti', 'Pannelli e materiali per isolamento', 'materials'),
  serviceEdiliGenerali: svgData('service-edili-generali', 'Cantiere interno edile organizzato', 'interior'),
  serviceManutenzioni: svgData('service-manutenzioni', 'Attrezzature per manutenzione edile', 'tools'),
  serviceHotel: svgData('service-hotel', 'Corridoio hospitality in lavorazione', 'corridor'),
  serviceNegozi: svgData('service-negozi', 'Spazio commerciale in ristrutturazione', 'room'),
  serviceSupportoCantieri: svgData('service-supporto-cantieri', 'Controllo operativo cantiere', 'blueprint'),
  serviceUffici: svgData('service-uffici', 'Ufficio in ristrutturazione interna', 'interior'),
  serviceTools: svgData('service-tools', 'Attrezzature e banco da cantiere', 'tools'),
  serviceMaterials: svgData('service-materials', 'Pannelli, profili e materiali a secco', 'materials'),

  projectBarceloRoma: svgData('project-barcelo-roma', 'Cantiere hospitality interno Barcelò Roma', 'corridor'),
  projectResidenzaVerdi: svgData('project-residenza-verdi', 'Ristrutturazione residenziale interna', 'room'),
  projectHotelMilano: svgData('project-hotel-milano', 'Hotel con controsoffitti e lavorazioni interne', 'ceiling'),
  projectNegozioCentro: svgData('project-negozio-centro', 'Negozio in fase di finitura interna', 'plaster'),
  projectCondominioBianchi: svgData('project-condominio-bianchi', 'Condominio con ponteggio e lavori edili', 'exterior'),
  projectUfficiDirezionali: svgData('project-uffici-direzionali', 'Uffici direzionali in cartongesso', 'drywall'),

  sectorPrivati: svgData('sector-privati', 'Interni privati in ristrutturazione', 'room'),
  sectorAziende: svgData('sector-aziende', 'Spazi aziendali in lavorazione', 'interior'),
  sectorHotel: svgData('sector-hotel', 'Ambiente hotel in ristrutturazione', 'corridor'),
  sectorNegozi: svgData('sector-negozi', 'Spazio retail in finitura', 'plaster'),
  sectorStudiTecnici: svgData('sector-studi-tecnici', 'Rilievo tecnico e misure', 'blueprint'),
  sectorGeneralContractor: svgData('sector-general-contractor', 'Coordinamento generale di cantiere', 'scaffold'),
  sectorAmministratori: svgData('sector-amministratori', 'Manutenzione edile condominiale', 'exterior'),

  teamSquadra: svgData('team-squadra', 'Squadra di cantiere e lavorazioni interne', 'tools'),
  teamMeeting: svgData('team-meeting', 'Riunione tecnica su planimetria', 'blueprint'),
  teamContractor: svgData('team-contractor', 'Impresa e controllo lavorazioni', 'interior'),
}

function uniqueImage(key, src, alt, title) {
  if (usedSources.has(src)) {
    throw new Error(`Immagine duplicata in publicImages.js: ${key}`)
  }
  usedSources.add(src)
  return image(src, alt, title)
}

export const placeholderImages = {
  hero: uniqueImage('placeholder.hero', photo.placeholderHero, 'Cantiere interno con pareti e materiali', 'Cantiere interno'),
  service: uniqueImage('placeholder.service', photo.placeholderService, 'Pareti in cartongesso in lavorazione', 'Servizio cartongesso e finiture'),
  project: uniqueImage('placeholder.project', photo.placeholderProject, 'Rilievo tecnico e progetto di cantiere', 'Progetto cantiere'),
  sector: uniqueImage('placeholder.sector', photo.placeholderSector, 'Strutture interne da cantiere', 'Settore cantiere'),
  document: uniqueImage('placeholder.document', photo.placeholderDocument, 'Materiali edili e pannelli', 'Materiali cantiere'),
  heroSvg: uniqueImage('placeholder.heroSvg', photo.placeholderHeroSvg, 'Interno edilizio in ristrutturazione', 'Hero cantiere'),
  serviceSvg: uniqueImage('placeholder.serviceSvg', photo.placeholderServiceSvg, 'Rasatura parete in cantiere', 'Servizio cartongesso'),
  projectSvg: uniqueImage('placeholder.projectSvg', photo.placeholderProjectSvg, 'Area di cantiere con strumenti', 'Progetto cantiere'),
  sectorSvg: uniqueImage('placeholder.sectorSvg', photo.placeholderSectorSvg, 'Ponteggio e lavori edili', 'Settori clienti'),
  documentSvg: uniqueImage('placeholder.documentSvg', photo.placeholderDocumentSvg, 'Corridoio interno in lavorazione', 'Documento cantiere'),
}

export const heroImages = {
  main: uniqueImage('hero.main', photo.heroMain, 'Ristrutturazione interna con lavorazioni a secco', 'Ristrutturazione interna'),
  ceiling: uniqueImage('hero.ceiling', photo.heroCeiling, 'Controsoffitto tecnico in fase di posa', 'Controsoffitto e struttura interna'),
  building: uniqueImage('hero.building', photo.heroBuilding, 'Edificio con ponteggio e lavori esterni', 'Lavori esterni e ponteggi'),
  lobby: uniqueImage('hero.lobby', photo.heroLobby, 'Ambiente interno in finitura', 'Finiture interne'),
  planning: uniqueImage('hero.planning', photo.heroPlanning, 'Piano operativo e rilievo di cantiere', 'Misurazione cantiere'),
  blueprint: uniqueImage('hero.blueprint', photo.heroBlueprint, 'Disegno tecnico per lavorazioni interne', 'Rilievo tecnico cantiere'),
}

export const serviceImages = {
  cartongesso: uniqueImage('service.cartongesso', photo.serviceCartongesso, 'Pareti divisorie in cartongesso', 'Cartongesso e pareti interne'),
  controsoffitti: uniqueImage('service.controsoffitti', photo.serviceControsoffitti, 'Struttura per controsoffitto tecnico', 'Controsoffitti e strutture interne'),
  paretiDivisorie: uniqueImage('service.paretiDivisorie', photo.serviceParetiDivisorie, 'Telaio metallico per pareti divisorie', 'Strutture pareti divisorie'),
  rasature: uniqueImage('service.rasature', photo.serviceRasature, 'Rasatura e preparazione parete', 'Rasature e finiture pareti'),
  finitureInterne: uniqueImage('service.finitureInterne', photo.serviceFinitureInterne, 'Finiture interne pronte alla tinteggiatura', 'Finiture interne'),
  isolamenti: uniqueImage('service.isolamenti', photo.serviceIsolamenti, 'Pannelli e materiali per isolamento', 'Isolamenti e sistemi a secco'),
  ediliGenerali: uniqueImage('service.ediliGenerali', photo.serviceEdiliGenerali, 'Cantiere interno edile organizzato', 'Lavori edili interni'),
  manutenzioni: uniqueImage('service.manutenzioni', photo.serviceManutenzioni, 'Attrezzature per manutenzione edile', 'Manutenzioni edili'),
  hotel: uniqueImage('service.hotel', photo.serviceHotel, 'Corridoio hospitality in lavorazione', 'Lavori interni hotel'),
  negozi: uniqueImage('service.negozi', photo.serviceNegozi, 'Spazio commerciale in ristrutturazione', 'Finiture spazio commerciale'),
  supportoCantieri: uniqueImage('service.supportoCantieri', photo.serviceSupportoCantieri, 'Controllo operativo cantiere', 'Supporto operativo cantiere'),
  uffici: uniqueImage('service.uffici', photo.serviceUffici, 'Ufficio in ristrutturazione interna', 'Uffici e spazi interni'),
  tools: uniqueImage('service.tools', photo.serviceTools, 'Attrezzature e banco da cantiere', 'Attrezzature e lavorazioni'),
  materials: uniqueImage('service.materials', photo.serviceMaterials, 'Pannelli, profili e materiali a secco', 'Materiali e finiture edilizie'),
}

export const projectImages = {
  barceloRoma: uniqueImage('project.barceloRoma', photo.projectBarceloRoma, 'Cantiere hospitality interno Barcelò Roma', 'Cantiere interno hospitality'),
  residenzaVerdi: uniqueImage('project.residenzaVerdi', photo.projectResidenzaVerdi, 'Ristrutturazione residenziale interna', 'Ristrutturazione interna residenziale'),
  hotelInternoMilano: uniqueImage('project.hotelInternoMilano', photo.projectHotelMilano, 'Hotel con controsoffitti e lavorazioni interne', 'Hotel interno in ristrutturazione'),
  negozioCentro: uniqueImage('project.negozioCentro', photo.projectNegozioCentro, 'Negozio in fase di finitura interna', 'Locale commerciale in finitura'),
  condominioBianchi: uniqueImage('project.condominioBianchi', photo.projectCondominioBianchi, 'Condominio con ponteggio e lavori edili', 'Condominio lavori edili'),
  ufficiDirezionali: uniqueImage('project.ufficiDirezionali', photo.projectUfficiDirezionali, 'Uffici direzionali in cartongesso', 'Uffici in ristrutturazione'),
}

export const sectorImages = {
  privati: uniqueImage('sector.privati', photo.sectorPrivati, 'Interni privati in ristrutturazione', 'Lavori per privati'),
  aziende: uniqueImage('sector.aziende', photo.sectorAziende, 'Spazi aziendali in lavorazione', 'Lavori per aziende'),
  hotel: uniqueImage('sector.hotel', photo.sectorHotel, 'Ambiente hotel in ristrutturazione', 'Lavori per hotel'),
  negozi: uniqueImage('sector.negozi', photo.sectorNegozi, 'Spazio retail in finitura', 'Lavori per negozi'),
  studiTecnici: uniqueImage('sector.studiTecnici', photo.sectorStudiTecnici, 'Rilievo tecnico e misure', 'Studi tecnici'),
  generalContractor: uniqueImage('sector.generalContractor', photo.sectorGeneralContractor, 'Coordinamento generale di cantiere', 'General contractor'),
  amministratori: uniqueImage('sector.amministratori', photo.sectorAmministratori, 'Manutenzione edile condominiale', 'Amministratori immobili'),
}

export const teamImages = {
  squadra: uniqueImage('team.squadra', photo.teamSquadra, 'Squadra di cantiere e lavorazioni interne', 'Squadra edile cantiere'),
  meeting: uniqueImage('team.meeting', photo.teamMeeting, 'Riunione tecnica su planimetria', 'Rilievo operativo'),
  contractor: uniqueImage('team.contractor', photo.teamContractor, 'Impresa e controllo lavorazioni', 'Team tecnico cantiere'),
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
