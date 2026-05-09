export function asset(src) {
  if (!src || typeof src !== 'string') return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:') || src.startsWith('blob:')) return src

  const baseUrl = import.meta.env.BASE_URL || '/'
  if (!src.startsWith('/')) return src
  if (baseUrl === '/') return src

  return `${baseUrl.replace(/\/$/, '')}${src}`
}

// Immagini pubbliche.
// Regola attuale:
// - HERO di inizio pagina = foto reali prese da Internet, tema cantiere/edilizia.
// - Tutto il resto = wireframe/placeholder SVG locale, senza persone e senza stock esterni.
// - Nessuna sorgente deve essere riutilizzata due volte dentro questo file.

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
    hero: ['placeholder-hero', 'Placeholder cantiere interno', 'interior'],
    service: ['placeholder-service', 'Placeholder cartongesso', 'drywall'],
    project: ['placeholder-project', 'Placeholder rilievo cantiere', 'blueprint'],
    sector: ['placeholder-sector', 'Placeholder struttura interna', 'ceiling'],
    document: ['placeholder-document', 'Placeholder materiali edili', 'materials'],
    heroSvg: ['placeholder-hero-svg', 'Wireframe ristrutturazione interna', 'room'],
    serviceSvg: ['placeholder-service-svg', 'Wireframe rasatura parete', 'plaster'],
    projectSvg: ['placeholder-project-svg', 'Wireframe attrezzature cantiere', 'tools'],
    sectorSvg: ['placeholder-sector-svg', 'Wireframe ponteggio edile', 'scaffold'],
    documentSvg: ['placeholder-document-svg', 'Wireframe corridoio in lavorazione', 'corridor'],
  },
  heroWireframes: {
    main: ['hero-wire-main', 'Wireframe lavorazioni interne', 'drywall-wide'],
    ceiling: ['hero-wire-ceiling', 'Wireframe controsoffitto tecnico', 'ceiling-grid'],
    building: ['hero-wire-building', 'Wireframe ponteggio e facciata', 'exterior'],
    lobby: ['hero-wire-lobby', 'Wireframe ambiente interno in finitura', 'room'],
    planning: ['hero-wire-planning', 'Wireframe rilievo operativo', 'blueprint'],
    blueprint: ['hero-wire-blueprint', 'Wireframe tavola tecnica', 'blueprint'],
  },
  serviceImages: {
    cartongesso: ['service-cartongesso', 'Wireframe pareti divisorie in cartongesso', 'drywall'],
    controsoffitti: ['service-controsoffitti', 'Wireframe struttura controsoffitto', 'ceiling'],
    paretiDivisorie: ['service-pareti-divisorie', 'Wireframe telaio pareti divisorie', 'drywall-frame'],
    rasature: ['service-rasature', 'Wireframe rasatura e preparazione parete', 'plaster'],
    finitureInterne: ['service-finiture-interne', 'Wireframe finiture interne', 'room'],
    isolamenti: ['service-isolamenti', 'Wireframe pannelli e materiali isolamento', 'materials'],
    ediliGenerali: ['service-edili-generali', 'Wireframe cantiere interno organizzato', 'interior'],
    manutenzioni: ['service-manutenzioni', 'Wireframe attrezzature manutenzione edile', 'tools'],
    hotel: ['service-hotel', 'Wireframe corridoio hospitality in lavorazione', 'corridor'],
    negozi: ['service-negozi', 'Wireframe spazio commerciale in finitura', 'room-retail'],
    supportoCantieri: ['service-supporto-cantieri', 'Wireframe controllo operativo cantiere', 'blueprint-check'],
    uffici: ['service-uffici', 'Wireframe ufficio in ristrutturazione', 'interior-office'],
    tools: ['service-tools', 'Wireframe banco attrezzi da cantiere', 'tools-detail'],
    materials: ['service-materials', 'Wireframe pannelli profili e materiali', 'materials-board'],
  },
  projectImages: {
    barceloRoma: ['project-barcelo-roma', 'Wireframe cantiere hospitality Barcelò Roma', 'corridor'],
    barceloRomaDetail: ['project-barcelo-roma-detail', 'Wireframe dettaglio cantiere Barcelò Roma', 'blueprint'],
    barceloRomaGalleryOne: ['project-barcelo-roma-gallery-one', 'Wireframe galleria cartongesso hospitality', 'drywall'],
    barceloRomaGalleryTwo: ['project-barcelo-roma-gallery-two', 'Wireframe galleria finiture hospitality', 'plaster'],
    residenzaVerdi: ['project-residenza-verdi', 'Wireframe ristrutturazione residenziale', 'room'],
    hotelInternoMilano: ['project-hotel-milano', 'Wireframe hotel con controsoffitti', 'ceiling'],
    negozioCentro: ['project-negozio-centro', 'Wireframe negozio in finitura', 'plaster-retail'],
    condominioBianchi: ['project-condominio-bianchi', 'Wireframe condominio con lavori edili', 'exterior'],
    ufficiDirezionali: ['project-uffici-direzionali', 'Wireframe uffici direzionali in cartongesso', 'drywall-office'],
  },
  sectorImages: {
    privati: ['sector-privati', 'Wireframe interni privati in ristrutturazione', 'room-private'],
    aziende: ['sector-aziende', 'Wireframe spazi aziendali in lavorazione', 'interior-company'],
    hotel: ['sector-hotel', 'Wireframe ambiente hotel in ristrutturazione', 'corridor-sector'],
    negozi: ['sector-negozi', 'Wireframe spazio retail in finitura', 'plaster-sector'],
    studiTecnici: ['sector-studi-tecnici', 'Wireframe rilievo tecnico e misure', 'blueprint-technical'],
    generalContractor: ['sector-general-contractor', 'Wireframe coordinamento generale cantiere', 'scaffold'],
    amministratori: ['sector-amministratori', 'Wireframe manutenzione edile condominiale', 'exterior-maintenance'],
  },
  teamImages: {
    squadra: ['team-squadra', 'Wireframe squadra e lavorazioni interne', 'tools-team'],
    meeting: ['team-meeting', 'Wireframe riunione tecnica su planimetria', 'blueprint-meeting'],
    contractor: ['team-contractor', 'Wireframe controllo lavorazioni di cantiere', 'interior-control'],
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
      uniqueImage(`${groupName}.${key}`, wireframeData(id, title, scene), title, `${title} - wireframe placeholder`),
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
  const p = palette(hashString(id))
  const shapes = sceneShapes(scene, p)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1200" role="img" aria-label="${escapeXml(title)}">
      <defs>
        <pattern id="grid-${id}" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0v80" fill="none" stroke="${p.grid}" stroke-width="2"/>
        </pattern>
        <filter id="shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#0f172a" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="1800" height="1200" fill="${p.bg}"/>
      <rect width="1800" height="1200" fill="url(#grid-${id})" opacity="0.72"/>
      <g opacity="0.55" fill="none" stroke="${p.line}" stroke-width="4" stroke-dasharray="18 18">
        <rect x="92" y="84" width="1616" height="1032" rx="42"/>
        <path d="M92 260h1616M92 920h1616"/>
      </g>
      <text x="140" y="172" fill="${p.ink}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="900" letter-spacing="8">WIREFRAME CANTIERE</text>
      <text x="140" y="222" fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">${escapeXml(title)}</text>
      <text x="1270" y="172" fill="${p.accent}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" letter-spacing="5">PLACEHOLDER</text>
      <text x="1270" y="215" fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${escapeXml(sketchNote(scene))}</text>
      ${shapes}
      ${measurementMarks(p)}
    </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function sceneShapes(scene, p) {
  const frame = `<g filter="url(#shadow-${scene})"><rect x="220" y="330" width="1040" height="510" rx="24" fill="#ffffff" stroke="${p.line}" stroke-width="8"/><rect x="275" y="385" width="930" height="400" rx="12" fill="${p.fill}" stroke="${p.line}" stroke-width="4"/></g>`
  const studs = `<g stroke="${p.blue}" stroke-width="16" stroke-linecap="round"><path d="M360 385v400"/><path d="M520 385v400"/><path d="M680 385v400"/><path d="M840 385v400"/><path d="M1000 385v400"/><path d="M275 505h930"/><path d="M275 650h930"/></g>`
  const boards = `<g stroke="#c7b58f" stroke-width="7" fill="#fbf5e8"><rect x="315" y="460" width="250" height="430" rx="12"/><rect x="600" y="430" width="255" height="460" rx="12"/><rect x="890" y="480" width="260" height="410" rx="12"/></g>`
  const drywall = `${frame}${studs}${boards}`
  const ceiling = `<g filter="url(#shadow-${scene})"><path d="M180 350h1410l-190 430H360z" fill="#fff" stroke="${p.line}" stroke-width="8"/><g stroke="${p.blue}" stroke-width="12"><path d="M290 440h1180M260 550h1160M235 665h1110"/><path d="M410 350l-80 430M650 350l-45 430M890 350v430M1130 350l45 430M1350 350l80 430"/></g></g>`
  const plaster = `<g filter="url(#shadow-${scene})"><rect x="240" y="345" width="1030" height="550" rx="26" fill="#f8f1e8" stroke="#d8c8b5" stroke-width="8"/><path d="M310 520c230-70 400 86 650-20 120-50 220-45 285-20v160c-205-80-340 92-560 26-170-50-320-18-375 28z" fill="#d8c7b1"/><rect x="1035" y="560" width="420" height="46" rx="23" fill="${p.accent}"/><rect x="1310" y="505" width="170" height="145" rx="24" fill="${p.ink}"/></g>`
  const tools = `<g filter="url(#shadow-${scene})"><rect x="300" y="720" width="590" height="150" rx="24" fill="${p.ink}"/><rect x="370" y="625" width="230" height="120" rx="18" fill="${p.accent}"/><path d="M1000 420l250 250" stroke="${p.blue}" stroke-width="30" stroke-linecap="round"/><path d="M1225 650l-100 100" stroke="${p.accent}" stroke-width="42" stroke-linecap="round"/><rect x="1020" y="830" width="430" height="38" rx="19" fill="${p.blue}" opacity="0.72"/></g>`
  const blueprint = `<g filter="url(#shadow-${scene})"><rect x="230" y="340" width="1140" height="560" rx="26" fill="#fff" stroke="${p.line}" stroke-width="7"/><g stroke="${p.blue}" stroke-width="8" fill="none"><rect x="340" y="445" width="370" height="220"/><rect x="710" y="445" width="420" height="280"/><path d="M340 665h280v170H340zM1130 445v390H830"/><path d="M445 445v220M710 580h420M830 725v110"/></g><path d="M1225 820l270-270" stroke="${p.accent}" stroke-width="12"/></g>`
  const materials = `<g filter="url(#shadow-${scene})"><rect x="260" y="740" width="1180" height="95" rx="16" fill="#b7791f"/><rect x="300" y="595" width="430" height="130" rx="18" fill="#f4e6cd" stroke="#d7bd90" stroke-width="7"/><rect x="770" y="545" width="430" height="180" rx="18" fill="#f9eed8" stroke="#d7bd90" stroke-width="7"/><rect x="470" y="445" width="430" height="150" rx="18" fill="#f5dfb9" stroke="#d7bd90" stroke-width="7"/></g>`
  const scaffold = `<g fill="none" stroke="${p.ink}" stroke-width="16" stroke-linecap="round"><path d="M260 900V320M600 900V320M940 900V320M1280 900V320"/><path d="M210 420h1120M210 585h1120M210 750h1120"/><path d="M260 900 600 320M600 900 940 320M940 900 1280 320"/></g><g fill="${p.accent}"><rect x="180" y="748" width="1190" height="54" rx="10"/><rect x="250" y="565" width="1010" height="46" rx="10"/></g>`
  const corridor = `<g filter="url(#shadow-${scene})"><path d="M230 330h1180l-225 610H420z" fill="#fff" stroke="${p.line}" stroke-width="8"/><path d="M420 940 640 330M1185 940 985 330" stroke="${p.blue}" stroke-width="14"/><path d="M620 450h450M580 580h530M535 730h625" stroke="${p.ink}" stroke-width="12" opacity="0.28"/></g>`
  const exterior = `<g filter="url(#shadow-${scene})"><rect x="315" y="355" width="780" height="500" rx="18" fill="#eef2f7" stroke="${p.line}" stroke-width="8"/><g fill="#dbeafe"><rect x="390" y="425" width="140" height="105"/><rect x="615" y="425" width="140" height="105"/><rect x="840" y="425" width="140" height="105"/><rect x="390" y="610" width="140" height="105"/><rect x="615" y="610" width="140" height="105"/><rect x="840" y="610" width="140" height="105"/></g></g>${scaffold}`
  const room = `<g filter="url(#shadow-${scene})"><path d="M220 345h1160v560H220z" fill="#fff" stroke="${p.line}" stroke-width="8"/><path d="M220 805h1160v100H220z" fill="#e8edf3"/><rect x="750" y="470" width="300" height="335" fill="#f7f9fc" stroke="${p.line}" stroke-width="7"/><path d="M220 345l530 460M1380 345l-330 460" stroke="#dbe3ec" stroke-width="10"/></g>`
  const interior = `${frame}<g fill="${p.accent}"><rect x="300" y="755" width="980" height="55" rx="10"/><rect x="340" y="690" width="520" height="34" rx="8"/></g><g stroke="${p.blue}" stroke-width="12"><path d="M315 430h770M315 540h710M315 650h610"/></g>`

  if (scene.includes('ceiling')) return ceiling
  if (scene.includes('plaster')) return plaster
  if (scene.includes('materials')) return materials
  if (scene.includes('tools')) return tools
  if (scene.includes('blueprint')) return blueprint
  if (scene.includes('scaffold')) return scaffold
  if (scene.includes('corridor')) return corridor
  if (scene.includes('exterior')) return exterior
  if (scene.includes('room')) return room
  if (scene.includes('drywall')) return drywall
  return interior
}

function measurementMarks(p) {
  return `
    <g fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.36" stroke-linecap="round">
      <path d="M210 1010h520"/>
      <path d="M210 985v50M730 985v50"/>
      <path d="M250 992l-40 18 40 18M690 992l40 18-40 18"/>
    </g>
    <text x="335" y="978" fill="${p.muted}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800">quote / misure da confermare</text>`
}

function sketchNote(scene) {
  if (scene.includes('drywall')) return 'cartongesso / orditura'
  if (scene.includes('ceiling')) return 'controsoffitto'
  if (scene.includes('plaster')) return 'rasatura / finitura'
  if (scene.includes('materials')) return 'materiali e profili'
  if (scene.includes('tools')) return 'attrezzi'
  if (scene.includes('blueprint')) return 'rilievo e quote'
  if (scene.includes('scaffold') || scene.includes('exterior')) return 'edilizia / ponteggio'
  if (scene.includes('corridor')) return 'corridoio cantiere'
  return 'interno in lavorazione'
}

function palette(seed) {
  const palettes = [
    { bg: '#f6f8fb', fill: '#ffffff', ink: '#172033', accent: '#d78228', blue: '#235789', line: '#d7e0ea', grid: '#8fa3b8', muted: '#64748b' },
    { bg: '#f8f5ef', fill: '#fffaf0', ink: '#1b2430', accent: '#c76f2a', blue: '#0b4ea2', line: '#ddcdbb', grid: '#b9a997', muted: '#73675c' },
    { bg: '#f1f6f3', fill: '#ffffff', ink: '#10291f', accent: '#e0a21b', blue: '#145c9e', line: '#cdded3', grid: '#9fb7a8', muted: '#66756b' },
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
