import { heroImages } from './publicImages'
import { allDriveProjectPhotos, driveHeroImages, driveServiceImages } from './driveProjectPhotos'

function makeImageEntry({
  id,
  fileName,
  src,
  area,
  posizione,
  categoria,
  cantiere,
  usataNelSito = true,
  pubblicabile = 'si',
  note = '',
}) {
  return {
    id,
    fileName,
    src,
    area,
    posizione,
    categoria,
    cantiere,
    usataNelSito,
    pubblicabile,
    note,
    origin: 'Sito pubblico',
  }
}

function joinUnique(values) {
  return [...new Set(values.filter(Boolean))].join(' · ')
}

function mergeEntries(entries) {
  const map = new Map()

  entries.forEach((entry) => {
    const existing = map.get(entry.src)
    if (!existing) {
      map.set(entry.src, { ...entry })
      return
    }

    existing.area = joinUnique([existing.area, entry.area])
    existing.posizione = joinUnique([existing.posizione, entry.posizione])
    existing.categoria = joinUnique([existing.categoria, entry.categoria])
    existing.cantiere = joinUnique([existing.cantiere, entry.cantiere])
    existing.note = joinUnique([existing.note, entry.note])
    existing.usataNelSito = existing.usataNelSito || entry.usataNelSito
    if (existing.pubblicabile !== 'si' && entry.pubblicabile === 'si') {
      existing.pubblicabile = entry.pubblicabile
    }
  })

  return [...map.values()]
}

function publicHeroFallbackEntries() {
  return [
    makeImageEntry({
      id: 'public-hero-home-fallback',
      fileName: 'home-hero-unsplash.jpg',
      src: heroImages.home.src,
      area: 'Home',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato se il Drive non risponde.',
    }),
    makeImageEntry({
      id: 'public-hero-services-fallback',
      fileName: 'services-hero-unsplash.jpg',
      src: heroImages.services.src,
      area: 'Servizi',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato se il Drive non risponde.',
    }),
    makeImageEntry({
      id: 'public-hero-projects-fallback',
      fileName: 'projects-hero-unsplash.jpg',
      src: heroImages.projects.src,
      area: 'Cantieri',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato se il Drive non risponde.',
    }),
    makeImageEntry({
      id: 'public-hero-about-fallback',
      fileName: 'about-hero-unsplash.jpg',
      src: heroImages.about.src,
      area: 'Chi siamo',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato se il Drive non risponde.',
    }),
    makeImageEntry({
      id: 'public-hero-contact-fallback',
      fileName: 'contact-hero-unsplash.jpg',
      src: heroImages.contact.src,
      area: 'Contatti',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato anche per le pagine Contatti e Settori.',
    }),
    makeImageEntry({
      id: 'public-hero-case-study-fallback',
      fileName: 'case-study-hero-unsplash.jpg',
      src: heroImages.caseStudy.src,
      area: 'Cantieri',
      posizione: 'Hero dettaglio',
      categoria: 'Hero / immagine forte',
      cantiere: 'DA VERIFICARE',
      note: 'Fallback pubblico usato se il Drive non risponde.',
    }),
  ]
}

function driveHeroEntries() {
  return [
    makeImageEntry({
      id: 'drive-hero-home',
      fileName: 'IMG_8305.JPG',
      src: driveHeroImages.home,
      area: 'Home',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'Capri Palace',
      note: 'Usata come immagine hero nella Home.',
    }),
    makeImageEntry({
      id: 'drive-hero-services',
      fileName: 'IMG_7327.JPG',
      src: driveHeroImages.services,
      area: 'Servizi',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'Barcelò Roma',
      note: 'Usata come immagine hero nella pagina Servizi e come immagine di metodo.',
    }),
    makeImageEntry({
      id: 'drive-hero-projects',
      fileName: 'IMG_7940.JPG',
      src: driveHeroImages.projects,
      area: 'Cantieri',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'Capri Palace',
      note: 'Usata come hero della pagina Cantieri.',
    }),
    makeImageEntry({
      id: 'drive-hero-about',
      fileName: 'IMG_8330.JPG',
      src: driveHeroImages.about,
      area: 'Chi siamo',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'Capri Palace',
      note: 'Usata come hero della pagina Chi siamo.',
    }),
    makeImageEntry({
      id: 'drive-hero-contact',
      fileName: 'IMG_7350.JPG',
      src: driveHeroImages.contact,
      area: 'Contatti',
      posizione: 'Hero principale',
      categoria: 'Hero / immagine forte',
      cantiere: 'Barcelò Roma',
      note: 'Usata come hero della pagina Contatti e come hero di supporto in altre sezioni.',
    }),
    makeImageEntry({
      id: 'drive-hero-case-study',
      fileName: 'IMG_8326.JPG',
      src: driveHeroImages.caseStudy,
      area: 'Cantieri',
      posizione: 'Hero dettaglio',
      categoria: 'Hero / immagine forte',
      cantiere: 'Capri Palace',
      note: 'Usata come hero del dettaglio cantiere.',
    }),
    makeImageEntry({
      id: 'drive-hero-method',
      fileName: 'IMG_7327.JPG',
      src: driveHeroImages.method,
      area: 'Home · Servizi · Chi siamo',
      posizione: 'Sezione approccio / metodo',
      categoria: 'Lavorazione in corso',
      cantiere: 'Barcelò Roma',
      note: 'Usata nelle sezioni sul metodo operativo.',
    }),
    makeImageEntry({
      id: 'drive-hero-documentation',
      fileName: 'IMG_8413.JPG',
      src: driveHeroImages.documentation,
      area: 'Home · Servizi',
      posizione: 'Sezione documentazione / controllo operativo',
      categoria: 'Dettaglio tecnico',
      cantiere: 'Capri Palace',
      note: 'Usata nelle sezioni dedicate a documentazione e controllo operativo.',
    }),
  ]
}

function driveServiceEntries() {
  return [
    makeImageEntry({
      id: 'drive-service-cartongesso',
      fileName: 'IMG_7328.JPG',
      src: driveServiceImages.cartongesso,
      area: 'Servizi',
      posizione: 'Card / sezione cartongesso',
      categoria: 'Lavorazione in corso',
      cantiere: 'Barcelò Roma',
      note: 'Immagine usata per il servizio cartongesso.',
    }),
    makeImageEntry({
      id: 'drive-service-ristrutturazioni-tecniche',
      fileName: 'IMG_8306.JPG',
      src: driveServiceImages.ristrutturazioniTecniche,
      area: 'Servizi',
      posizione: 'Card / sezione ristrutturazioni tecniche',
      categoria: 'Lavorazione in corso',
      cantiere: 'Capri Palace',
      note: 'Immagine usata per il servizio ristrutturazioni tecniche.',
    }),
    makeImageEntry({
      id: 'drive-service-finiture-interne',
      fileName: 'IMG_7366.JPG',
      src: driveServiceImages.finitureInterne,
      area: 'Servizi · Settori',
      posizione: 'Sezione finiture interne',
      categoria: 'Risultato finito',
      cantiere: 'Barcelò Roma',
      note: 'Immagine usata per finiture interne e spazi in lavorazione.',
    }),
    makeImageEntry({
      id: 'drive-service-gestione-cantiere',
      fileName: 'IMG_8326.JPG',
      src: driveServiceImages.gestioneCantiere,
      area: 'Servizi · Chi siamo',
      posizione: 'Sezione gestione cantiere',
      categoria: 'Squadra / operatività',
      cantiere: 'Capri Palace',
      note: 'Immagine usata per la gestione cantiere.',
    }),
    makeImageEntry({
      id: 'drive-service-manutenzioni',
      fileName: 'IMG_7344.JPG',
      src: driveServiceImages.manutenzioni,
      area: 'Servizi',
      posizione: 'Sezione manutenzioni',
      categoria: 'Materiali / attrezzatura',
      cantiere: 'Barcelò Roma',
      note: 'Immagine usata per il servizio manutenzioni.',
    }),
    makeImageEntry({
      id: 'drive-service-supporto-operativo',
      fileName: 'IMG_7406.JPG',
      src: driveServiceImages.supportoOperativo,
      area: 'Servizi · Chi siamo',
      posizione: 'Sezione supporto operativo',
      categoria: 'Squadra / operatività',
      cantiere: 'Barcelò Roma',
      note: 'Immagine usata per il supporto operativo.',
    }),
  ]
}

function driveProjectEntries() {
  return allDriveProjectPhotos.map((photo) => makeImageEntry({
    id: `drive-photo-${photo.id}`,
    fileName: photo.fileName,
    src: photo.src,
    area: photo.area,
    posizione: 'Galleria / portfolio pubblico',
    categoria: 'Portfolio / foto reale',
    cantiere: photo.project,
    note: photo.project === 'Foto cantieri da classificare'
      ? 'Foto già presente nel portfolio pubblico ma ancora da classificare meglio.'
      : 'Foto già pubblicata nel portfolio pubblico.',
  }))
}

export const siteImages = mergeEntries([
  ...publicHeroFallbackEntries(),
  ...driveHeroEntries(),
  ...driveServiceEntries(),
  ...driveProjectEntries(),
])

