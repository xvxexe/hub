export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Immagini pubbliche provvisorie: SVG locali in stile placeholder/sketch.
// Niente foto stock, niente persone, niente immagini esterne.
// Tema consentito: solo cantieri, edilizia, cartongesso, rasature, ponteggi,
// materiali, interni in lavorazione e organizzazione operativa di cantiere.
// Regola: ogni chiave usa un ID diverso e quindi una sorgente diversa.

const usedSources = new Set()

const configs = {
  placeholderImages: {
    hero: ['placeholder-hero', 'Placeholder cantiere interno', 'interior'],
    service: ['placeholder-service', 'Placeholder cartongesso', 'drywall'],
    project: ['placeholder-project', 'Placeholder rilievo cantiere', 'blueprint'],
    sector: ['placeholder-sector', 'Placeholder struttura interna', 'ceiling'],
    document: ['placeholder-document', 'Placeholder materiali edili', 'materials'],
    heroSvg: ['placeholder-hero-svg', 'Sketch ristrutturazione interna', 'room'],
    serviceSvg: ['placeholder-service-svg', 'Sketch rasatura parete', 'plaster'],
    projectSvg: ['placeholder-project-svg', 'Sketch attrezzature cantiere', 'tools'],
    sectorSvg: ['placeholder-sector-svg', 'Sketch ponteggio edile', 'scaffold'],
    documentSvg: ['placeholder-document-svg', 'Sketch corridoio in lavorazione', 'corridor'],
  },
  heroImages: {
    main: ['hero-main', 'Ristrutturazione interna a secco', 'drywall-wide'],
    ceiling: ['hero-ceiling', 'Controsoffitto tecnico in posa', 'ceiling-grid'],
    building: ['hero-building', 'Lavori esterni con ponteggio', 'exterior-scaffold'],
    lobby: ['hero-lobby', 'Ambiente interno in finitura', 'room-finish'],
    planning: ['hero-planning', 'Piano operativo di cantiere', 'blueprint-plan'],
    blueprint: ['hero-blueprint', 'Disegno tecnico lavorazioni interne', 'blueprint-measure'],
  },
  serviceImages: {
    cartongesso: ['service-cartongesso', 'Pareti divisorie in cartongesso', 'drywall-studs'],
    controsoffitti: ['service-controsoffitti', 'Struttura controsoffitto tecnico', 'ceiling-frame'],
    paretiDivisorie: ['service-pareti-divisorie', 'Telaio pareti divisorie', 'drywall-frame'],
    rasature: ['service-rasature', 'Rasatura e preparazione parete', 'plaster-wave'],
    finitureInterne: ['service-finiture-interne', 'Finiture interne pronte', 'room-finish'],
    isolamenti: ['service-isolamenti', 'Pannelli e materiali isolamento', 'materials-stack'],
    ediliGenerali: ['service-edili-generali', 'Cantiere interno organizzato', 'interior-grid'],
    manutenzioni: ['service-manutenzioni', 'Attrezzature manutenzione edile', 'tools-bench'],
    hotel: ['service-hotel', 'Corridoio hospitality in lavorazione', 'corridor-long'],
    negozi: ['service-negozi', 'Spazio commerciale in finitura', 'room-retail'],
    supportoCantieri: ['service-supporto-cantieri', 'Controllo operativo cantiere', 'blueprint-check'],
    uffici: ['service-uffici', 'Ufficio in ristrutturazione', 'interior-office'],
    tools: ['service-tools', 'Banco attrezzi da cantiere', 'tools-detail'],
    materials: ['service-materials', 'Pannelli profili e materiali', 'materials-board'],
  },
  projectImages: {
    barceloRoma: ['project-barcelo-roma', 'Cantiere hospitality Barcelò Roma', 'corridor-hotel'],
    residenzaVerdi: ['project-residenza-verdi', 'Ristrutturazione residenziale interna', 'room-residential'],
    hotelInternoMilano: ['project-hotel-milano', 'Hotel con controsoffitti interni', 'ceiling-hotel'],
    negozioCentro: ['project-negozio-centro', 'Negozio in fase di finitura', 'plaster-retail'],
    condominioBianchi: ['project-condominio-bianchi', 'Condominio con lavori edili', 'exterior-condo'],
    ufficiDirezionali: ['project-uffici-direzionali', 'Uffici direzionali in cartongesso', 'drywall-office'],
  },
  sectorImages: {
    privati: ['sector-privati', 'Interni privati in ristrutturazione', 'room-private'],
    aziende: ['sector-aziende', 'Spazi aziendali in lavorazione', 'interior-company'],
    hotel: ['sector-hotel', 'Ambiente hotel in ristrutturazione', 'corridor-sector'],
    negozi: ['sector-negozi', 'Spazio retail in finitura', 'plaster-sector'],
    studiTecnici: ['sector-studi-tecnici', 'Rilievo tecnico e misure', 'blueprint-technical'],
    generalContractor: ['sector-general-contractor', 'Coordinamento generale cantiere', 'scaffold-contractor'],
    amministratori: ['sector-amministratori', 'Manutenzione edile condominiale', 'exterior-maintenance'],
  },
  teamImages: {
    squadra: ['team-squadra', 'Squadra e lavorazioni interne', 'tools-team'],
    meeting: ['team-meeting', 'Riunione tecnica su planimetria', 'blueprint-meeting'],
    contractor: ['team-contractor', 'Controllo lavorazioni di cantiere', 'interior-control'],
  },
}

export const placeholderImages = makeGroup('placeholderImages')
export const heroImages = makeGroup('heroImages')
export const serviceImages = makeGroup('serviceImages')
export const projectImages = makeGroup('projectImages')
export const sectorImages = makeGroup('sectorImages')
export const teamImages = makeGroup('teamImages')

function makeGroup(groupName) {
  return Object.fromEntries(
    Object.entries(configs[groupName]).map(([key, [id, title, scene]]) => [
      key,
      uniqueImage(`${groupName}.${key}`, svgData(id, title, scene), title, `${title} - sketch placeholder`),
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

function svgData(id, title, scene) {
  const h = hashString(id)
  const p = palette(h)
  const shapes = sceneShapes(scene, p, h)
  const note = sketchNote(scene)
  const dash = 12 + (h % 9)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1200" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${p.bg1}"/>
          <stop offset="1" stop-color="${p.bg2}"/>
        </linearGradient>
        <pattern id="grid-${id}" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M72 0H0v72" fill="none" stroke="${p.ink}" stroke-width="2" opacity="0.08"/>
        </pattern>
        <filter id="shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#0f172a" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="1800" height="1200" fill="url(#bg-${id})"/>
      <rect width="1800" height="1200" fill="url(#grid-${id})"/>
      <path d="M0 820h1800" stroke="${p.ink}" stroke-width="5" opacity="0.12" stroke-dasharray="${dash} ${dash}"/>
      <path d="M120 960h1560M260 1080h1280" stroke="${p.ink}" stroke-width="4" opacity="0.09"/>
      ${blueprintFrame(id, title, note, p)}
      ${shapes}
      ${measurementMarks(id, p, h)}
      ${sketchScribbles(id, p, h)}
    </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function blueprintFrame(id, title, note, p) {
  return `
    <g filter="url(#shadow-${id})">
      <rect x="96" y="88" width="1608" height="132" rx="34" fill="#ffffff" opacity="0.72" stroke="${p.line}" stroke-width="5"/>
      <text x="152" y="146" fill="${p.ink}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" letter-spacing="8">PLACEHOLDER CANTIERE</text>
      <text x="152" y="188" fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${escapeXml(title)}</text>
      <text x="1260" y="146" fill="${p.accent}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" letter-spacing="5">SKETCH</text>
      <text x="1260" y="186" fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700">${escapeXml(note)}</text>
    </g>`
}

function sceneShapes(scene, p, h) {
  const offset = h % 42
  const wall = `<g filter="url(#shadow-${scene})"><rect x="210" y="270" width="1040" height="520" rx="30" fill="#fff" opacity="0.82" stroke="${p.line}" stroke-width="7"/><rect x="260" y="320" width="940" height="420" rx="18" fill="#f8fafc" stroke="${p.line}" stroke-width="4"/></g>`
  const studs = `<g stroke="${p.blue}" stroke-width="16" stroke-linecap="round" opacity="0.92"><path d="M360 320v420"/><path d="M520 320v420"/><path d="M680 320v420"/><path d="M840 320v420"/><path d="M1000 320v420"/><path d="M260 430h940"/><path d="M260 610h940"/></g>`
  const boards = `<g filter="url(#shadow-${scene})"><rect x="300" y="380" width="260" height="455" rx="16" fill="#fbf1dc" stroke="#d4b889" stroke-width="7"/><rect x="590" y="340" width="278" height="495" rx="16" fill="#fff7e7" stroke="#d4b889" stroke-width="7"/><rect x="900" y="405" width="278" height="430" rx="16" fill="#f5e3c3" stroke="#d4b889" stroke-width="7"/></g>`
  const screws = `<g fill="${p.ink}" opacity="0.22">${[360, 520, 680, 840, 1000].map((x) => `<circle cx="${x}" cy="370" r="8"/><circle cx="${x}" cy="700" r="8"/>`).join('')}</g>`
  const scaffold = `<g fill="none" stroke="${p.ink}" stroke-width="16" stroke-linecap="round"><path d="M260 870V275M600 870V275M940 870V275M1280 870V275"/><path d="M210 370h1120M210 540h1120M210 710h1120"/><path d="M260 870 600 275M600 870 940 275M940 870 1280 275"/></g><g fill="${p.accent}"><rect x="180" y="710" width="1190" height="58" rx="12"/><rect x="250" y="520" width="1010" height="48" rx="12"/></g>`
  const ceiling = `<g filter="url(#shadow-${scene})"><path d="M150 300h1460l-190 460H340z" fill="#ffffff" opacity="0.86" stroke="${p.line}" stroke-width="7"/><g stroke="${p.blue}" stroke-width="12" opacity="0.86"><path d="M250 398h1210M220 505h1200M195 620h1170"/><path d="M390 300l-82 460M620 300l-42 460M850 300v460M1080 300l44 460M1310 300l82 460"/></g><g fill="${p.accent}" opacity="0.9"><circle cx="520" cy="510" r="26"/><circle cx="920" cy="510" r="26"/><circle cx="1240" cy="510" r="26"/></g></g>`
  const plaster = `<g filter="url(#shadow-${scene})"><rect x="210" y="285" width="1030" height="565" rx="30" fill="#f7f0e6" stroke="#dfcdb6" stroke-width="9"/><path d="M280 470c230-76 410 88 650-18 130-58 220-54 285-28v172c-210-82-350 94-575 26-170-52-320-20-360 28z" fill="#d8c1a6" opacity="0.74"/><rect x="1015" y="520" width="420" height="48" rx="24" fill="${p.accent}"/><rect x="1310" y="468" width="170" height="145" rx="28" fill="${p.ink}"/></g>`
  const tools = `<g filter="url(#shadow-${scene})"><rect x="300" y="675" width="585" height="162" rx="28" fill="${p.ink}"/><rect x="365" y="585" width="225" height="118" rx="24" fill="${p.accent}"/><circle cx="420" cy="866" r="42" fill="#26364b"/><circle cx="775" cy="866" r="42" fill="#26364b"/><path d="M1000 388l252 252" stroke="${p.blue}" stroke-width="30" stroke-linecap="round"/><path d="M1225 618l-104 104" stroke="${p.accent}" stroke-width="44" stroke-linecap="round"/><rect x="1120" y="780" width="350" height="40" rx="20" fill="${p.blue}" opacity="0.72"/></g>`
  const blueprint = `<g filter="url(#shadow-${scene})"><rect x="225" y="285" width="1125" height="610" rx="30" fill="#ffffff"/><g stroke="${p.blue}" stroke-width="8" fill="none"><rect x="330" y="395" width="375" height="225"/><rect x="705" y="395" width="420" height="286"/><path d="M330 620h280v182H330zM1125 395v407H820"/><path d="M440 395v225M705 540h420M820 681v121"/></g><g stroke="${p.accent}" stroke-width="13"><path d="M1238 810l270-270"/><path d="M1465 530l82 82"/></g><g fill="${p.muted}" font-family="Arial" font-size="24" font-weight="700"><text x="350" y="370">quota</text><text x="900" y="760">fase 02</text></g></g>`
  const materials = `<g filter="url(#shadow-${scene})"><rect x="260" y="700" width="1180" height="104" rx="20" fill="#b7791f"/><rect x="300" y="560" width="430" height="132" rx="20" fill="#f4e6cd" stroke="#d7bd90" stroke-width="8"/><rect x="770" y="514" width="430" height="178" rx="20" fill="#f9eed8" stroke="#d7bd90" stroke-width="8"/><rect x="470" y="408" width="430" height="152" rx="20" fill="#f5dfb9" stroke="#d7bd90" stroke-width="8"/><g fill="${p.ink}"><circle cx="420" cy="862" r="40"/><circle cx="1290" cy="862" r="40"/></g><g stroke="${p.blue}" stroke-width="10"><path d="M320 604h380M800 570h360M500 462h360"/></g></g>`
  const corridor = `<g filter="url(#shadow-${scene})"><path d="M225 275h1180l-220 650H420z" fill="#f8fafc" stroke="#dbe3ec" stroke-width="10"/><path d="M420 925 640 275M1185 925 985 275" stroke="${p.blue}" stroke-width="15" opacity="0.72"/><path d="M625 400h440M585 535h520M535 700h620" stroke="${p.ink}" stroke-width="13" opacity="0.28"/><rect x="1338" y="500" width="122" height="350" rx="18" fill="${p.accent}"/></g>`
  const exterior = `<g filter="url(#shadow-${scene})"><rect x="310" y="292" width="785" height="540" rx="18" fill="#eef2f7" stroke="#cad5e3" stroke-width="8"/><g fill="#dbeafe"><rect x="385" y="365" width="142" height="112"/><rect x="610" y="365" width="142" height="112"/><rect x="835" y="365" width="142" height="112"/><rect x="385" y="560" width="142" height="112"/><rect x="610" y="560" width="142" height="112"/><rect x="835" y="560" width="142" height="112"/></g></g>${scaffold}`
  const room = `<g filter="url(#shadow-${scene})"><path d="M210 285h1160v600H210z" fill="#fff"/><path d="M210 775h1160v110H210z" fill="#e8edf3"/><rect x="755" y="420" width="305" height="355" fill="#f7f9fc" stroke="#cbd5e1" stroke-width="8"/><path d="M210 285l545 490M1370 285l-310 490" stroke="#dbe3ec" stroke-width="12"/><rect x="330" y="680" width="300" height="56" rx="14" fill="${p.accent}"/></g>`
  const interior = `${wall}<g fill="${p.accent}" opacity="0.95"><rect x="300" y="735" width="985" height="58" rx="12"/><rect x="340" y="670" width="525" height="36" rx="10"/></g><g stroke="${p.blue}" stroke-width="13"><path d="M300 378h800M300 488h720M300 595h620"/></g>`

  const map = { drywall: `${wall}${studs}${boards}${screws}`, scaffold, ceiling, plaster, tools, blueprint, materials, corridor, exterior, room, interior }
  const family = Object.keys(map).find((name) => scene.includes(name)) ?? 'interior'
  const base = map[family]
  const variant = scene.includes('wide') ? `<rect x="1240" y="345" width="245" height="390" rx="20" fill="${p.accent}" opacity="0.55"/>` : ''
  const badge = `<g transform="translate(${1240 + offset},${790 - (h % 55)})"><rect width="260" height="92" rx="26" fill="#fff" opacity="0.82" stroke="${p.line}" stroke-width="5"/><text x="28" y="40" font-family="Arial" font-size="22" font-weight="900" fill="${p.ink}">BOZZA VISIVA</text><text x="28" y="70" font-family="Arial" font-size="18" font-weight="700" fill="${p.muted}">non foto reale</text></g>`

  return `${base}${variant}${badge}`
}

function measurementMarks(id, p, h) {
  const x = 180 + (h % 150)
  const y = 940 + (h % 80)
  return `
    <g fill="none" stroke="${p.ink}" stroke-width="6" opacity="0.32" stroke-linecap="round">
      <path d="M${x} ${y}h460"/>
      <path d="M${x} ${y - 24}v48M${x + 460} ${y - 24}v48"/>
      <path d="M${x + 40} ${y - 18}l-40 18 40 18M${x + 420} ${y - 18}l40 18-40 18"/>
    </g>
    <text x="${x + 165}" y="${y - 22}" fill="${p.muted}" font-family="Arial" font-size="24" font-weight="800">misure da verificare</text>`
}

function sketchScribbles(id, p, h) {
  const y = 260 + (h % 60)
  return `
    <g opacity="0.22" fill="none" stroke="${p.blue}" stroke-width="10" stroke-linecap="round">
      <path d="M132 ${y} C420 ${y - 110}, 720 ${y - 70}, 1030 ${y - 150} S1500 ${y - 160}, 1680 ${y - 70}"/>
      <path d="M1260 930c72-38 150-38 220 0s142 38 220-8"/>
    </g>
    <g opacity="0.2" fill="${p.accent}">
      <circle cx="1500" cy="320" r="18"/><circle cx="1548" cy="320" r="18"/><circle cx="1596" cy="320" r="18"/>
    </g>`
}

function sketchNote(scene) {
  if (scene.includes('drywall')) return 'cartongesso / orditura'
  if (scene.includes('ceiling')) return 'controsoffitto'
  if (scene.includes('plaster')) return 'rasatura / finitura'
  if (scene.includes('materials')) return 'materiali e profili'
  if (scene.includes('tools')) return 'attrezzi e banco'
  if (scene.includes('blueprint')) return 'rilievo e quote'
  if (scene.includes('scaffold') || scene.includes('exterior')) return 'edilizia / ponteggio'
  if (scene.includes('corridor')) return 'corridoio cantiere'
  return 'interno in lavorazione'
}

function palette(seed) {
  const palettes = [
    { bg1: '#eef4ff', bg2: '#d9e8ff', ink: '#0f2f4f', accent: '#f2b705', blue: '#1d5fbf', line: '#cbd8e6', muted: '#64748b' },
    { bg1: '#f7f8fb', bg2: '#e6edf5', ink: '#10233c', accent: '#d9902f', blue: '#235789', line: '#d7e0ea', muted: '#6b778c' },
    { bg1: '#f5efe6', bg2: '#e8dac8', ink: '#172033', accent: '#c76f2a', blue: '#0b4ea2', line: '#ddcdbb', muted: '#73675c' },
    { bg1: '#eef3ef', bg2: '#dbe8df', ink: '#10291f', accent: '#e0a21b', blue: '#145c9e', line: '#cdded3', muted: '#66756b' },
    { bg1: '#f4f1ee', bg2: '#e4ded8', ink: '#1b2430', accent: '#d78228', blue: '#174a7c', line: '#d8d0c8', muted: '#6d737d' },
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
