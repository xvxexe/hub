import { heroImages, serviceImages } from './publicImages'
import { allDriveProjectPhotos, driveHeroImages, drivePublicProjects, driveServiceImages } from './driveProjectPhotos'

const drivePhotoBySrc = new Map(allDriveProjectPhotos.map((photo) => [photo.src, photo]))

function usageLocation({ route, pagina, sezione, componente, slot }) {
  return { route, pagina, sezione, componente, slot }
}

function uniqueUsageLocations(locations = []) {
  const seen = new Set()
  return locations.filter((location) => {
    const key = `${location.route}|${location.pagina}|${location.sezione}|${location.componente}|${location.slot}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function baseEntry({
  id,
  fileName,
  src,
  sourceUrl = null,
  origine = 'Sito pubblico',
  cantiere = 'DA VERIFICARE',
  areaAttuale = 'DA VERIFICARE',
  posizioneAttuale = 'DA VERIFICARE',
  categoria = 'DA VERIFICARE',
  pubblicabile = 'si',
  usataNelSito = false,
  usageLocations = [],
  note = '',
}) {
  return {
    id,
    fileName,
    src,
    sourceUrl,
    origine,
    cantiere,
    areaAttuale,
    posizioneAttuale,
    categoria,
    pubblicabile,
    usataNelSito,
    usageLocations: uniqueUsageLocations(usageLocations),
    note,
  }
}

function fromDriveSrc({
  id,
  src,
  fileName,
  cantiere,
  areaAttuale,
  posizioneAttuale,
  categoria,
  pubblicabile = 'si',
  usataNelSito = true,
  usageLocations = [],
  note = '',
}) {
  const driveMeta = drivePhotoBySrc.get(src)
  return baseEntry({
    id,
    fileName: fileName || driveMeta?.fileName || 'DA VERIFICARE',
    src,
    sourceUrl: driveMeta?.sourceUrl ?? null,
    cantiere,
    areaAttuale,
    posizioneAttuale,
    categoria,
    pubblicabile,
    usataNelSito,
    usageLocations,
    note,
  })
}

function fromPublicAsset({
  id,
  fileName,
  src,
  cantiere,
  areaAttuale,
  posizioneAttuale,
  categoria,
  pubblicabile = 'si',
  usataNelSito = true,
  usageLocations = [],
  note = '',
}) {
  return baseEntry({
    id,
    fileName,
    src,
    cantiere,
    areaAttuale,
    posizioneAttuale,
    categoria,
    pubblicabile,
    usataNelSito,
    usageLocations,
    note,
  })
}

function mergeEntries(entries) {
  const map = new Map()

  entries.forEach((entry) => {
    const existing = map.get(entry.src)
    if (!existing) {
      map.set(entry.src, { ...entry, usageLocations: [...entry.usageLocations] })
      return
    }

    existing.fileName = existing.fileName || entry.fileName
    existing.sourceUrl = existing.sourceUrl || entry.sourceUrl
    existing.origine = existing.origine || entry.origine
    existing.cantiere = joinUnique([existing.cantiere, entry.cantiere])
    existing.areaAttuale = joinUnique([existing.areaAttuale, entry.areaAttuale])
    existing.posizioneAttuale = joinUnique([existing.posizioneAttuale, entry.posizioneAttuale])
    existing.categoria = joinUnique([existing.categoria, entry.categoria])
    existing.pubblicabile = existing.pubblicabile || entry.pubblicabile
    existing.usataNelSito = existing.usataNelSito || entry.usataNelSito
    existing.usageLocations = uniqueUsageLocations([...existing.usageLocations, ...entry.usageLocations])
    existing.note = joinUnique([existing.note, entry.note])
  })

  return [...map.values()]
}

function joinUnique(values) {
  return [...new Set(values.filter((value) => Boolean(value) && value !== 'DA VERIFICARE'))].join(' · ') || 'DA VERIFICARE'
}

function driveProjectUsage(projectId, section, slot, component = 'PremiumProjectCard') {
  return [
    usageLocation({ route: '#/', pagina: 'Home', sezione: 'Portfolio / cantieri in evidenza', componente: component, slot }),
    usageLocation({ route: '#/cantieri', pagina: 'Cantieri', sezione: 'Cantiere in evidenza', componente: component, slot }),
    usageLocation({ route: '#/cantieri', pagina: 'Cantieri', sezione: 'Griglia case study', componente: component, slot }),
    usageLocation({ route: `#/cantieri/${projectId}`, pagina: 'Dettaglio cantiere', sezione: section, componente: 'PremiumHero', slot }),
  ]
}

function driveProjectSplitUsage(projectId, section, component = 'PremiumImageSplit') {
  return [
    usageLocation({ route: `#/cantieri/${projectId}`, pagina: 'Dettaglio cantiere', sezione: section, componente: component, slot: 'image' }),
  ]
}

function galleryUsage(projectId) {
  return [
    usageLocation({ route: `#/cantieri/${projectId}`, pagina: 'Dettaglio cantiere', sezione: 'Galleria', componente: 'SafeImage', slot: 'src' }),
  ]
}

function heroUsage(route, pagina, sezione, slot = 'image') {
  return [usageLocation({ route, pagina, sezione, componente: 'PremiumHero', slot })]
}

function splitUsage(route, pagina, sezione, component = 'PremiumImageSplit', slot = 'image') {
  return [usageLocation({ route, pagina, sezione, componente: component, slot })]
}

function serviceCardUsage(route, pagina, serviceTitle, slot = 'fallbackImage') {
  return [usageLocation({ route, pagina, sezione: `Card servizio / ${serviceTitle}`, componente: 'PremiumServiceCard', slot })]
}

function serviceSplitUsage(route, pagina, section, slot = 'image') {
  return [usageLocation({ route, pagina, sezione: section, componente: 'PremiumImageSplit', slot })]
}

function fallbackUsage(route, pagina, section, component, slot = 'fallbackImage') {
  return [usageLocation({ route, pagina, sezione: section, componente: component, slot })]
}

const siteImages = mergeEntries([
  fromDriveSrc({
    id: 'drive-home-hero',
    src: driveHeroImages.home,
    cantiere: 'Capri Palace',
    areaAttuale: 'Home',
    posizioneAttuale: 'Hero principale',
    categoria: 'Hero / immagine forte',
    usataNelSito: true,
    usageLocations: heroUsage('#/', 'Home', 'Hero principale'),
    note: 'Hero principale della home.',
  }),
  fromPublicAsset({
    id: 'fallback-home-hero',
    fileName: 'home-hero-unsplash.jpg',
    src: heroImages.home.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Home',
    posizioneAttuale: 'Hero principale',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/', 'Home', 'Hero principale', 'fallbackSrc'),
    note: 'Fallback hero home se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-services-hero',
    src: driveHeroImages.services,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usataNelSito: true,
    usageLocations: heroUsage('#/servizi', 'Servizi', 'Hero pagina'),
    note: 'Hero principale della pagina servizi.',
  }),
  fromPublicAsset({
    id: 'fallback-services-hero',
    fileName: 'services-hero-unsplash.jpg',
    src: heroImages.services.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/servizi', 'Servizi', 'Hero pagina', 'fallbackSrc'),
    note: 'Fallback hero servizi se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-projects-hero',
    src: driveHeroImages.projects,
    cantiere: 'Capri Palace',
    areaAttuale: 'Cantieri',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/cantieri', 'Cantieri', 'Hero pagina'),
    note: 'Hero principale della pagina cantieri.',
  }),
  fromPublicAsset({
    id: 'fallback-projects-hero',
    fileName: 'projects-hero-unsplash.jpg',
    src: heroImages.projects.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Cantieri',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/cantieri', 'Cantieri', 'Hero pagina', 'fallbackSrc'),
    note: 'Fallback hero cantieri se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-about-hero',
    src: driveHeroImages.about,
    cantiere: 'Capri Palace',
    areaAttuale: 'Chi siamo',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/chi-siamo', 'Chi siamo', 'Hero pagina'),
    note: 'Hero principale della pagina chi siamo.',
  }),
  fromPublicAsset({
    id: 'fallback-about-hero',
    fileName: 'about-hero-unsplash.jpg',
    src: heroImages.about.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Chi siamo',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/chi-siamo', 'Chi siamo', 'Hero pagina', 'fallbackSrc'),
    note: 'Fallback hero chi siamo se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-contact-hero',
    src: driveHeroImages.contact,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Contatti',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/contatti', 'Contatti', 'Hero pagina'),
    note: 'Hero principale della pagina contatti.',
  }),
  fromPublicAsset({
    id: 'fallback-contact-hero',
    fileName: 'contact-hero-unsplash.jpg',
    src: heroImages.contact.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Contatti',
    posizioneAttuale: 'Hero pagina',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/contatti', 'Contatti', 'Hero pagina', 'fallbackSrc'),
    note: 'Fallback hero contatti se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-case-study-hero',
    src: driveHeroImages.caseStudy,
    cantiere: 'Capri Palace',
    areaAttuale: 'Dettaglio cantiere',
    posizioneAttuale: 'Hero',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/cantieri/:projectId', 'Dettaglio cantiere', 'Hero'),
    note: 'Hero del dettaglio cantiere se presente.',
  }),
  fromPublicAsset({
    id: 'fallback-case-study-hero',
    fileName: 'case-study-hero-unsplash.jpg',
    src: heroImages.caseStudy.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Dettaglio cantiere',
    posizioneAttuale: 'Hero',
    categoria: 'Hero / immagine forte',
    usageLocations: heroUsage('#/cantieri/:projectId', 'Dettaglio cantiere', 'Hero', 'fallbackSrc'),
    note: 'Fallback hero dettaglio cantiere se il Drive non risponde.',
  }),
  fromDriveSrc({
    id: 'drive-home-approach',
    src: driveHeroImages.method,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Home · Chi siamo',
    posizioneAttuale: 'Sezione approccio / metodo',
    categoria: 'Lavorazione in corso',
    usageLocations: [
      ...splitUsage('#/', 'Home', 'Sezione approccio'),
      ...splitUsage('#/chi-siamo', 'Chi siamo', 'Sezione metodo'),
    ],
    note: 'Immagine usata nelle sezioni sull’approccio e sul metodo.',
  }),
  fromDriveSrc({
    id: 'drive-home-documentation',
    src: driveHeroImages.documentation,
    cantiere: 'Capri Palace',
    areaAttuale: 'Home · Servizi',
    posizioneAttuale: 'Sezione documentazione / controllo operativo',
    categoria: 'Dettaglio tecnico',
    usageLocations: [
      ...splitUsage('#/', 'Home', 'Sezione documentazione'),
      ...splitUsage('#/servizi', 'Servizi', 'Sezione ristrutturazioni / demolizioni'),
    ],
    note: 'Immagine usata nelle sezioni di documentazione e controllo.',
  }),
  fromDriveSrc({
    id: 'drive-service-cartongesso',
    src: driveServiceImages.cartongesso,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Card servizio / sezione cartongesso',
    categoria: 'Lavorazione in corso',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Cartongesso', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Cartongesso', 'image'),
      ...serviceSplitUsage('#/servizi', 'Servizi', 'Sezione cartongesso'),
    ],
    note: 'Immagine usata nel carousel home, nelle card servizi e nella sezione cartongesso.',
  }),
  fromDriveSrc({
    id: 'drive-service-ristrutturazioni',
    src: driveServiceImages.ristrutturazioniTecniche,
    cantiere: 'Capri Palace',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Card servizio / sezione ristrutturazioni',
    categoria: 'Lavorazione in corso',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Ristrutturazioni tecniche', 'image'),
      ...serviceCardUsage('#/', 'Home', 'Demolizioni', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Ristrutturazioni tecniche', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Demolizioni', 'image'),
    ],
    note: 'Usata in quattro card di servizio tra home e pagina servizi.',
  }),
  fromDriveSrc({
    id: 'drive-service-finiture-interne',
    src: driveServiceImages.finitureInterne,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Servizi · Settori',
    posizioneAttuale: 'Sezione finiture interne',
    categoria: 'Risultato finito',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Finiture interne', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Finiture interne', 'image'),
      usageLocation({ route: '#/settori', pagina: 'Settori', sezione: 'Uffici e residenziale', componente: 'PremiumImageSplit', slot: 'image' }),
    ],
    note: 'Usata per finiture interne e per la sezione settori.',
  }),
  fromDriveSrc({
    id: 'drive-service-gestione-cantiere',
    src: driveServiceImages.gestioneCantiere,
    cantiere: 'Capri Palace',
    areaAttuale: 'Servizi · Chi siamo',
    posizioneAttuale: 'Sezione gestione cantiere',
    categoria: 'Squadra / operatività',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Gestione cantiere', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Gestione cantiere', 'image'),
      ...splitUsage('#/chi-siamo', 'Chi siamo', 'Sezione come lavoriamo'),
    ],
    note: 'Usata come card di servizio e in chi siamo.',
  }),
  fromDriveSrc({
    id: 'drive-service-manutenzioni',
    src: driveServiceImages.manutenzioni,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Sezione manutenzioni',
    categoria: 'Materiali / attrezzatura',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Manutenzioni', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Manutenzioni', 'image'),
    ],
    note: 'Usata come card di servizio in home e in servizi.',
  }),
  fromDriveSrc({
    id: 'drive-service-supporto-operativo',
    src: driveServiceImages.supportoOperativo,
    cantiere: 'Barcelò Roma',
    areaAttuale: 'Servizi · Chi siamo',
    posizioneAttuale: 'Sezione supporto operativo',
    categoria: 'Squadra / operatività',
    usageLocations: [
      ...serviceCardUsage('#/', 'Home', 'Supporto operativo', 'image'),
      ...serviceCardUsage('#/servizi', 'Servizi', 'Supporto operativo', 'image'),
    ],
    note: 'Usata come card di servizio in home e in servizi.',
  }),
  fromPublicAsset({
    id: 'fallback-service-cartongesso',
    fileName: 'service-cartongesso.svg',
    src: serviceImages.cartongesso.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Hero / immagine forte',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
    ],
    note: 'Fallback delle card servizio cartongesso.',
  }),
  fromPublicAsset({
    id: 'fallback-service-edili-generali',
    fileName: 'service-edili-generali.svg',
    src: serviceImages.ediliGenerali.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Lavorazione in corso',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
    ],
    note: 'Fallback delle card servizi ristrutturazioni e demolizioni.',
  }),
  fromPublicAsset({
    id: 'fallback-service-rasature',
    fileName: 'service-rasature.svg',
    src: serviceImages.rasature.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Risultato finito',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
    ],
    note: 'Fallback delle card finiture interne.',
  }),
  fromPublicAsset({
    id: 'fallback-service-supporto-cantieri',
    fileName: 'service-supporto-cantieri.svg',
    src: serviceImages.supportoCantieri.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Squadra / operatività',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/cantieri/:projectId', 'Dettaglio cantiere', 'Metodo applicato', 'PremiumImageSplit', 'fallbackImage'),
    ],
    note: 'Fallback delle card supporto operativo e del metodo applicato nel dettaglio cantiere.',
  }),
  fromPublicAsset({
    id: 'fallback-service-manutenzioni',
    fileName: 'service-manutenzioni.svg',
    src: serviceImages.manutenzioni.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Materiali / attrezzatura',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
    ],
    note: 'Fallback delle card manutenzioni.',
  }),
  fromPublicAsset({
    id: 'fallback-service-tools',
    fileName: 'service-tools.svg',
    src: serviceImages.tools.src,
    cantiere: 'DA VERIFICARE',
    areaAttuale: 'Servizi',
    posizioneAttuale: 'Fallback card servizio',
    categoria: 'Materiali / attrezzatura',
    usageLocations: [
      ...fallbackUsage('#/', 'Home', 'Card servizi / carousel', 'PremiumServiceCard', 'fallbackImage'),
      ...fallbackUsage('#/servizi', 'Servizi', 'Card servizio', 'PremiumServiceCard', 'fallbackImage'),
    ],
    note: 'Fallback delle card supporto operativo.',
  }),
  ...drivePublicProjects.map((project) => {
    const imageMeta = drivePhotoBySrc.get(project.image)
    const heroMeta = drivePhotoBySrc.get(project.heroImage)
    const methodMeta = drivePhotoBySrc.get(project.methodImage)

    return [
      baseEntry({
        id: `project-${project.id}-image`,
        fileName: imageMeta?.fileName ?? project.title,
        src: project.image,
        sourceUrl: imageMeta?.sourceUrl ?? null,
        origine: 'Sito pubblico',
        cantiere: project.title,
        areaAttuale: 'Home · Cantieri',
        posizioneAttuale: 'Cantiere in evidenza / griglia case study',
        categoria: 'Portfolio / progetto',
        pubblicabile: 'si',
        usataNelSito: true,
        usageLocations: driveProjectUsage(project.id, 'Hero', 'image'),
        note: `Immagine principale del progetto ${project.title}.`,
      }),
      baseEntry({
        id: `project-${project.id}-hero`,
        fileName: heroMeta?.fileName ?? project.title,
        src: project.heroImage,
        sourceUrl: heroMeta?.sourceUrl ?? null,
        origine: 'Sito pubblico',
        cantiere: project.title,
        areaAttuale: 'Dettaglio cantiere',
        posizioneAttuale: 'Hero',
        categoria: 'Hero / immagine forte',
        pubblicabile: 'si',
        usataNelSito: true,
        usageLocations: driveProjectSplitUsage(project.id, 'Hero'),
        note: `Hero del dettaglio cantiere ${project.title}.`,
      }),
      baseEntry({
        id: `project-${project.id}-method`,
        fileName: methodMeta?.fileName ?? project.title,
        src: project.methodImage,
        sourceUrl: methodMeta?.sourceUrl ?? null,
        origine: 'Sito pubblico',
        cantiere: project.title,
        areaAttuale: 'Dettaglio cantiere',
        posizioneAttuale: 'Metodo applicato',
        categoria: 'Dettaglio tecnico',
        pubblicabile: 'si',
        usataNelSito: true,
        usageLocations: driveProjectSplitUsage(project.id, 'Metodo applicato'),
        note: `Immagine del metodo applicato per ${project.title}.`,
      }),
    ]
  }).flat(),
  ...allDriveProjectPhotos.map((photo) => {
    const project = drivePublicProjects.find((item) => item.gallery?.some((galleryPhoto) => galleryPhoto.src === photo.src))
    const isUsedInProject = Boolean(project)
    const galleryUsageLocations = project
      ? galleryUsage(project.id)
      : []

    return baseEntry({
      id: `gallery-${photo.id}`,
      fileName: photo.fileName,
      src: photo.src,
      sourceUrl: photo.sourceUrl,
      origine: 'Sito pubblico',
      cantiere: photo.project,
      areaAttuale: photo.area,
      posizioneAttuale: 'Galleria / portfolio pubblico',
      categoria: 'Portfolio / foto reale',
      pubblicabile: 'si',
      usataNelSito: isUsedInProject,
      usageLocations: galleryUsageLocations,
      note: isUsedInProject
        ? `Foto già collegata al progetto ${photo.project}.`
        : 'Foto presente nel catalogo Drive ma non ancora usata nel sito.',
    })
  }),
])

export { heroImages, serviceImages }
export { siteImages }
