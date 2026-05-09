export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Immagini pubbliche.
// - HERO di inizio pagina = foto reali prese da Internet, tema cantiere/edilizia.
// - Sezioni interne/card/gallerie = wireframe architettonici SVG locali.
// - Niente persone random, niente foto stock nelle card sotto, nessuna sorgente duplicata.

const usedSources = new Set()
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1900&q=82`

const heroPhotoConfigs = {
  home: ['photo-1503387762-592deb58ef4e', 'Cantiere edile con struttura in lavorazione', 'Foto reale cantiere home'],
  services: ['photo-1504307651254-35680f356dfd', 'Cantiere edile con lavorazioni in corso', 'Foto reale servizi edilizia'],
  projects: ['photo-1541888946425-d81bb19240f5', 'Area di cantiere con struttura e materiali', 'Foto reale portfolio cantieri'],
  about: ['photo-1504917595217-d4dc5ebe6122', 'Cantiere con operatività edile', 'Foto reale azienda cantiere'],
  contact: ['photo-1581092160562-40aa08e78837', 'Tecnico in ambiente di lavoro edile', 'Foto reale contatti preventivo'],
  caseStudy: ['photo-1508450859948-4e04fabaa4ea', 'Cantiere tecnico e lavorazioni interne', 'Foto reale case study'],
}

const wireConfigs = {
  placeholderImages: {
    hero: ['placeholder-hero', 'Cantiere interno', 'interior'],
    service: ['placeholder-service', 'Cartongesso', 'drywall'],
    project: ['placeholder-project', 'Rilievo cantiere', 'blueprint'],
    sector: ['placeholder-sector', 'Struttura interna', 'ceiling'],
    document: ['placeholder-document', 'Materiali edili', 'materials'],
    heroSvg: ['placeholder-hero-svg', 'Ristrutturazione interna', 'room'],
    serviceSvg: ['placeholder-service-svg', 'Rasatura parete', 'plaster'],
    projectSvg: ['placeholder-project-svg', 'Attrezzature cantiere', 'tools'],
    sectorSvg: ['placeholder-sector-svg', 'Ponteggio edile', 'scaffold'],
    documentSvg: ['placeholder-document-svg', 'Corridoio in lavorazione', 'corridor'],
  },
  heroWireframes: {
    main: ['hero-wire-main', 'Lavorazioni interne', 'drywall-wide'],
    ceiling: ['hero-wire-ceiling', 'Controsoffitto tecnico', 'ceiling-grid'],
    building: ['hero-wire-building', 'Ponteggio e facciata', 'exterior'],
    lobby: ['hero-wire-lobby', 'Ambiente interno', 'room'],
    planning: ['hero-wire-planning', 'Rilievo operativo', 'blueprint'],
    blueprint: ['hero-wire-blueprint', 'Tavola tecnica', 'blueprint'],
  },
  serviceImages: {
    cartongesso: ['service-cartongesso', 'Pareti divisorie in cartongesso', 'drywall'],
    controsoffitti: ['service-controsoffitti', 'Struttura controsoffitto', 'ceiling'],
    paretiDivisorie: ['service-pareti-divisorie', 'Telaio pareti divisorie', 'drywall-frame'],
    rasature: ['service-rasature', 'Rasatura e preparazione parete', 'plaster'],
    finitureInterne: ['service-finiture-interne', 'Finiture interne', 'room'],
    isolamenti: ['service-isolamenti', 'Pannelli e isolamento', 'materials'],
    ediliGenerali: ['service-edili-generali', 'Cantiere interno organizzato', 'interior'],
    manutenzioni: ['service-manutenzioni', 'Attrezzature manutenzione edile', 'tools'],
    hotel: ['service-hotel', 'Corridoio hospitality in lavorazione', 'corridor'],
    negozi: ['service-negozi', 'Spazio commerciale in finitura', 'room-retail'],
    supportoCantieri: ['service-supporto-cantieri', 'Controllo operativo cantiere', 'blueprint-check'],
    uffici: ['service-uffici', 'Ufficio in ristrutturazione', 'interior-office'],
    tools: ['service-tools', 'Banco attrezzi da cantiere', 'tools-detail'],
    materials: ['service-materials', 'Pannelli profili e materiali', 'materials-board'],
  },
  projectImages: {
    barceloRoma: ['project-barcelo-roma', 'Cantiere hospitality Barcelò Roma', 'corridor'],
    barceloRomaDetail: ['project-barcelo-roma-detail', 'Dettaglio cantiere Barcelò Roma', 'blueprint'],
    barceloRomaGalleryOne: ['project-barcelo-roma-gallery-one', 'Galleria cartongesso hospitality', 'drywall'],
    barceloRomaGalleryTwo: ['project-barcelo-roma-gallery-two', 'Galleria finiture hospitality', 'plaster'],
    residenzaVerdi: ['project-residenza-verdi', 'Ristrutturazione residenziale', 'room'],
    hotelInternoMilano: ['project-hotel-milano', 'Hotel con controsoffitti', 'ceiling'],
    negozioCentro: ['project-negozio-centro', 'Negozio in finitura', 'plaster-retail'],
    condominioBianchi: ['project-condominio-bianchi', 'Condominio con lavori edili', 'exterior'],
    ufficiDirezionali: ['project-uffici-direzionali', 'Uffici direzionali in cartongesso', 'drywall-office'],
  },
  sectorImages: {
    privati: ['sector-privati', 'Interni privati in ristrutturazione', 'room-private'],
    aziende: ['sector-aziende', 'Spazi aziendali in lavorazione', 'interior-company'],
    hotel: ['sector-hotel', 'Ambiente hotel in ristrutturazione', 'corridor-sector'],
    negozi: ['sector-negozi', 'Spazio retail in finitura', 'plaster-sector'],
    studiTecnici: ['sector-studi-tecnici', 'Rilievo tecnico e misure', 'blueprint-technical'],
    generalContractor: ['sector-general-contractor', 'Coordinamento generale cantiere', 'scaffold'],
    amministratori: ['sector-amministratori', 'Manutenzione edile condominiale', 'exterior-maintenance'],
  },
  teamImages: {
    squadra: ['team-squadra', 'Squadra e lavorazioni interne', 'tools-team'],
    meeting: ['team-meeting', 'Riunione tecnica su planimetria', 'blueprint-meeting'],
    contractor: ['team-contractor', 'Controllo lavorazioni di cantiere', 'interior-control'],
  },
}

export const placeholderImages = makeWireGroup('placeholderImages')
export const serviceImages = makeWireGroup('serviceImages')
export const projectImages = makeWireGroup('projectImages')
export const sectorImages = makeWireGroup('sectorImages')
export const teamImages = makeWireGroup('teamImages')
export const heroImages = {
  ...makeHeroPhotoGroup(),
  ...makeWireGroup('heroWireframes'),
}

function makeHeroPhotoGroup() {
  return Object.fromEntries(
    Object.entries(heroPhotoConfigs).map(([key, [id, alt, title]]) => [
      key,
      uniqueImage(`heroImages.${key}`, photo(id), alt, title),
    ]),
  )
}

function makeWireGroup(groupName) {
  return Object.fromEntries(
    Object.entries(wireConfigs[groupName]).map(([key, [id, title, scene]]) => [
      key,
      uniqueImage(`${groupName}.${key}`, wireframeData(id, title, scene), title, `${title} - wireframe tecnico`),
    ]),
  )
}

function uniqueImage(key, src, alt, title) {
  if (usedSources.has(src)) {
    throw new Error(`Immagine duplicata in publicImages.js: ${key}`)
  }
  usedSources.add(src)
  return image(src, alt, title)
}

function wireframeData(id, title, scene) {
  const seed = hashString(id)
  const p = palette(seed)
  const sceneSvg = sceneShapes(scene, p, seed)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1200" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="paper-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${p.paper1}"/>
          <stop offset="1" stop-color="${p.paper2}"/>
        </linearGradient>
        <pattern id="paper-grid-${id}" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0v64" fill="none" stroke="${p.grid}" stroke-width="1.2" opacity="0.38"/>
        </pattern>
        <filter id="soft-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0f172a" flood-opacity="0.08"/>
        </filter>
      </defs>
      <rect width="1800" height="1200" fill="url(#paper-${id})"/>
      <rect width="1800" height="1200" fill="url(#paper-grid-${id})"/>
      <g fill="none" stroke="${p.line}" stroke-width="2.2" opacity="0.34">
        <path d="M90 90H1710V1110H90Z"/>
        <path d="M90 230H1710M90 965H1710"/>
      </g>
      <g fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" opacity="0.42">
        <text x="132" y="166" font-size="27" font-weight="800" letter-spacing="6">WIREFRAME / ${escapeXml(sketchNote(scene)).toUpperCase()}</text>
        <text x="132" y="204" font-size="21" font-weight="600">${escapeXml(title)}</text>
      </g>
      ${perspectiveGuide(p, seed)}
      ${sceneSvg}
      ${cartouche(id, title, p)}
    </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function perspectiveGuide(p, seed) {
  const vx = 1080 + (seed % 180)
  const vy = 520 + (seed % 70)
  return `
    <g fill="none" stroke="${p.guide}" stroke-width="1.8" opacity="0.46">
      ${[160, 300, 440, 580, 720, 860, 1000, 1140, 1280, 1420, 1560].map((x) => `<path d="M${x} 980L${vx} ${vy}"/>`).join('')}
      ${[330, 430, 530, 630, 730, 830, 930].map((y) => `<path d="M170 ${y}H1630"/>`).join('')}
    </g>`
}

function sceneShapes(scene, p, seed) {
  if (scene.includes('ceiling')) return ceilingWire(p)
  if (scene.includes('plaster')) return plasterWire(p)
  if (scene.includes('materials')) return materialsWire(p)
  if (scene.includes('tools')) return toolsWire(p)
  if (scene.includes('blueprint')) return planWire(p)
  if (scene.includes('scaffold')) return scaffoldWire(p)
  if (scene.includes('corridor')) return corridorWire(p)
  if (scene.includes('exterior')) return exteriorWire(p)
  if (scene.includes('room')) return roomWire(p)
  if (scene.includes('drywall')) return drywallWire(p, seed)
  return interiorWire(p)
}

function basePerspectiveRoom(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M230 885H1510L1270 338H505Z" stroke="${p.strong}" stroke-width="3.5" opacity="0.76"/>
      <path d="M505 338L230 885M1270 338L1510 885M505 338H1270" stroke="${p.mid}" stroke-width="2.8" opacity="0.72"/>
      ${[0, 1, 2, 3, 4, 5].map((n) => {
        const y = 430 + n * 82
        return `<path d="M${470 - n * 36} ${y}H${1300 + n * 44}" stroke="${p.thin}" stroke-width="1.8" opacity="0.56"/>`
      }).join('')}
      ${[310, 460, 610, 760, 910, 1060, 1210, 1360].map((x) => `<path d="M${x} 885L890 338" stroke="${p.thin}" stroke-width="1.8" opacity="0.48"/>`).join('')}
    </g>`
}

function drywallWire(p, seed) {
  const variant = seed % 2
  return `
    ${basePerspectiveRoom(p)}
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M365 415H860V812H300V520Z" stroke="${p.strong}" stroke-width="4"/>
      ${[400, 500, 600, 700, 800].map((x) => `<path d="M${x} 430V805" stroke="${p.accentLine}" stroke-width="3.2" opacity="0.82"/>`).join('')}
      ${[480, 620, 760].map((y) => `<path d="M335 ${y}H850" stroke="${p.accentLine}" stroke-width="2.5" opacity="0.72"/>`).join('')}
      <path d="M935 455H1260V790H900V525Z" stroke="${p.strong}" stroke-width="3.6"/>
      ${[980, 1060, 1140, 1220].map((x) => `<path d="M${x} 470V785" stroke="${p.mid}" stroke-width="2.6"/>`).join('')}
      ${variant ? '<path d="M250 770c190-70 310 36 480-28" stroke="#c4c8cf" stroke-width="2.2" opacity="0.55"/>' : ''}
    </g>`
}

function ceilingWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M190 330H1610L1370 815H410Z" stroke="${p.strong}" stroke-width="4"/>
      ${[320, 420, 520, 620, 720].map((y) => `<path d="M${240 - (y - 320) * 0.25} ${y}H${1560 - (y - 320) * 0.18}" stroke="${p.mid}" stroke-width="2.8"/>`).join('')}
      ${[340, 510, 680, 850, 1020, 1190, 1360, 1530].map((x) => `<path d="M${x} 330L${900 + (x - 900) * 0.22} 815" stroke="${p.mid}" stroke-width="2.5"/>`).join('')}
      <path d="M440 398h300v142H440Z" stroke="${p.accentLine}" stroke-width="4"/>
      <path d="M860 425h340v165H860Z" stroke="${p.accentLine}" stroke-width="4"/>
      <path d="M1210 520h210v120h-210Z" stroke="${p.accentLine}" stroke-width="3.6"/>
    </g>`
}

function plasterWire(p) {
  return `
    ${basePerspectiveRoom(p)}
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M310 385H1285V840H310Z" stroke="${p.strong}" stroke-width="3.8"/>
      <path d="M355 565c180-70 310 70 520 5 150-48 260-50 355 0" stroke="${p.mid}" stroke-width="3.2"/>
      <path d="M355 635c210-80 360 72 570 0 132-45 218-38 285 10" stroke="${p.thin}" stroke-width="2.4"/>
      <path d="M1185 510l185 120" stroke="${p.accentLine}" stroke-width="6"/>
      <path d="M1335 600l-78 96" stroke="${p.strong}" stroke-width="9"/>
      <path d="M1260 690h240" stroke="${p.accentLine}" stroke-width="10"/>
    </g>`
}

function materialsWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M280 780H1390" stroke="${p.strong}" stroke-width="5"/>
      ${[0, 1, 2].map((n) => `<path d="M${330 + n * 300} ${650 - n * 70}h430v135H${330 + n * 300}z" stroke="${p.strong}" stroke-width="3.6"/>`).join('')}
      ${[360, 470, 580, 690, 800, 910, 1020, 1130].map((x) => `<path d="M${x} 640l160 145" stroke="${p.thin}" stroke-width="1.9" opacity="0.56"/>`).join('')}
      <path d="M280 815h1080M350 850h960" stroke="${p.mid}" stroke-width="2.2"/>
      <path d="M1110 420h260v170h-260z" stroke="${p.accentLine}" stroke-width="3.5"/>
      <path d="M1130 455h220M1130 500h220M1130 545h160" stroke="${p.accentLine}" stroke-width="2.4"/>
    </g>`
}

function toolsWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M300 780h620v120H300z" stroke="${p.strong}" stroke-width="4"/>
      <path d="M345 660h220v120H345zM410 620h92v40" stroke="${p.strong}" stroke-width="3.5"/>
      <circle cx="405" cy="925" r="38" stroke="${p.mid}" stroke-width="4"/>
      <circle cx="790" cy="925" r="38" stroke="${p.mid}" stroke-width="4"/>
      <path d="M1030 470l245 245" stroke="${p.accentLine}" stroke-width="10"/>
      <path d="M1265 705l-92 92" stroke="${p.strong}" stroke-width="14"/>
      <path d="M1050 840h420M1120 790h265" stroke="${p.mid}" stroke-width="4"/>
      <path d="M1320 405v390M1270 455h100" stroke="${p.thin}" stroke-width="2" opacity="0.5"/>
    </g>`
}

function planWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M250 330H1350V900H250Z" stroke="${p.strong}" stroke-width="4"/>
      <path d="M360 450h370v215H360zM730 450h420v280H730zM360 665h280v165H360zM1150 450v380H820" stroke="${p.mid}" stroke-width="3"/>
      <path d="M470 450v215M730 580h420M820 730v100" stroke="${p.thin}" stroke-width="2.2"/>
      <path d="M1210 840l260-260M1440 570l72 72" stroke="${p.accentLine}" stroke-width="4"/>
      <path d="M310 385h980M310 865h980" stroke="${p.guide}" stroke-width="1.8" stroke-dasharray="14 14"/>
      <circle cx="520" cy="560" r="44" stroke="${p.accentLine}" stroke-width="3"/>
    </g>`
}

function scaffoldWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M380 330h620v550H380z" stroke="${p.strong}" stroke-width="3.8"/>
      ${[455, 600, 745, 890].map((x) => `<path d="M${x} 390v420" stroke="${p.thin}" stroke-width="2"/>`).join('')}
      ${[410, 550, 690].map((y) => `<path d="M420 ${y}h520" stroke="${p.thin}" stroke-width="2"/>`).join('')}
      ${[250, 520, 790, 1060, 1330].map((x) => `<path d="M${x} 900V285" stroke="${p.mid}" stroke-width="4"/>`).join('')}
      ${[385, 560, 735, 900].map((y) => `<path d="M220 ${y}h1180" stroke="${p.mid}" stroke-width="3.2"/>`).join('')}
      <path d="M250 900l270-615M520 900l270-615M790 900l270-615M1060 900l270-615" stroke="${p.accentLine}" stroke-width="2.6"/>
    </g>`
}

function corridorWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M235 320h1280l-270 620H480z" stroke="${p.strong}" stroke-width="4"/>
      <path d="M480 940 690 320M1245 940 1030 320" stroke="${p.mid}" stroke-width="3.6"/>
      ${[420, 520, 620, 720, 820].map((y) => `<path d="M${275 + (y - 420) * 0.26} ${y}h${1130 - (y - 420) * 0.46}" stroke="${p.thin}" stroke-width="2"/>`).join('')}
      ${[360, 520, 680, 840, 1000, 1160, 1320].map((x) => `<path d="M${x} 320L860 940" stroke="${p.guide}" stroke-width="1.8"/>`).join('')}
      <path d="M1160 470h155v300h-155z" stroke="${p.accentLine}" stroke-width="3.8"/>
      <path d="M420 520h165v310H420z" stroke="${p.accentLine}" stroke-width="3.2"/>
    </g>`
}

function exteriorWire(p) {
  return `
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M350 355h720v520H350z" stroke="${p.strong}" stroke-width="4"/>
      ${[430, 610, 790, 970].map((x) => `<path d="M${x} 420v375" stroke="${p.thin}" stroke-width="2"/>`).join('')}
      ${[455, 590, 725].map((y) => `<path d="M405 ${y}h600" stroke="${p.thin}" stroke-width="2"/>`).join('')}
      ${[240, 520, 800, 1080, 1360].map((x) => `<path d="M${x} 920V320" stroke="${p.mid}" stroke-width="3.8"/>`).join('')}
      ${[455, 615, 775, 920].map((y) => `<path d="M210 ${y}h1240" stroke="${p.mid}" stroke-width="3"/>`).join('')}
      <path d="M240 920l280-600M520 920l280-600M800 920l280-600M1080 920l280-600" stroke="${p.accentLine}" stroke-width="2.4"/>
    </g>`
}

function roomWire(p) {
  return `
    ${basePerspectiveRoom(p)}
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M480 420h300v430H480z" stroke="${p.accentLine}" stroke-width="3.5"/>
      <path d="M955 455h265v375H955z" stroke="${p.mid}" stroke-width="3"/>
      <path d="M300 780h1120M360 720h1000" stroke="${p.thin}" stroke-width="2.2"/>
      <path d="M360 490h220M360 548h190M360 606h230" stroke="${p.guide}" stroke-width="2"/>
    </g>`
}

function interiorWire(p) {
  return `
    ${basePerspectiveRoom(p)}
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M330 455h830v310H330z" stroke="${p.strong}" stroke-width="3.5"/>
      <path d="M330 560h830M330 660h830M520 455v310M700 455v310M880 455v310M1060 455v310" stroke="${p.mid}" stroke-width="2.4"/>
      <path d="M250 820h1120" stroke="${p.accentLine}" stroke-width="4"/>
    </g>`
}

function cartouche(id, title, p) {
  return `
    <g opacity="0.58" fill="none" stroke="${p.line}" stroke-width="2">
      <rect x="1180" y="998" width="440" height="78" rx="8"/>
      <path d="M1320 998v78M1450 998v78"/>
    </g>
    <g fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" opacity="0.58">
      <text x="1204" y="1028" font-size="18" font-weight="800">EUROPA SERVICE</text>
      <text x="1204" y="1055" font-size="16">bozza wireframe</text>
      <text x="1342" y="1045" font-size="15">${escapeXml(id)}</text>
      <text x="1470" y="1045" font-size="15">${escapeXml(title).slice(0, 26)}</text>
    </g>`
}

function sketchNote(scene) {
  if (scene.includes('drywall')) return 'cartongesso'
  if (scene.includes('ceiling')) return 'controsoffitto'
  if (scene.includes('plaster')) return 'rasatura'
  if (scene.includes('materials')) return 'materiali'
  if (scene.includes('tools')) return 'attrezzi'
  if (scene.includes('blueprint')) return 'rilievo'
  if (scene.includes('scaffold') || scene.includes('exterior')) return 'ponteggio'
  if (scene.includes('corridor')) return 'corridoio'
  return 'interno'
}

function palette(seed) {
  const palettes = [
    { paper1: '#fbfbf8', paper2: '#eef1f4', strong: '#2e333a', mid: '#69717c', thin: '#9aa2ad', guide: '#c4c9d0', line: '#d5d9df', grid: '#b9c0ca', muted: '#6b7280', accentLine: '#4a5568' },
    { paper1: '#f8fafc', paper2: '#eef4ff', strong: '#243247', mid: '#667085', thin: '#9aa6b2', guide: '#c9d2df', line: '#d7dee8', grid: '#b7c4d4', muted: '#64748b', accentLine: '#2f5f96' },
    { paper1: '#fbf8f1', paper2: '#f0ece4', strong: '#302f2c', mid: '#706b62', thin: '#a39b8f', guide: '#cbc4b9', line: '#ded8ce', grid: '#c8bfb1', muted: '#746b61', accentLine: '#9a6335' },
  ]
  return palettes[seed % palettes.length]
}

function hashString(value) {
  return String(value).split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) >>> 0, 0)
}

function escapeXml(text) {
  return String(text).replace(/[<>&"']/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]))
}

function image(src, alt, title) {
  return { src: asset(src), alt, title }
}
