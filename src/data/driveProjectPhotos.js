const drivePhotoUrl = (id, size = 1800) => `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`
const driveFileUrl = (id) => `https://drive.google.com/file/d/${id}/view`
const driveFolderUrl = (id) => `https://drive.google.com/drive/folders/${id}`

function makePhoto({ id, fileName, project, area, index }) {
  return {
    id,
    fileName,
    src: drivePhotoUrl(id),
    sourceUrl: driveFileUrl(id),
    alt: `${project} - foto cantiere ${index + 1}`,
    title: fileName,
    project,
    area,
    qualityStatus: 'Selezionata per uso pubblico da cartella Drive categorizzata',
  }
}

function makeGallery(project, area, seed) {
  return seed.map(([fileName, id], index) => makePhoto({ id, fileName, project, area, index }))
}

function srcByName(gallery, fileName, fallbackIndex = 0) {
  return gallery.find((photo) => photo.fileName === fileName)?.src ?? gallery[fallbackIndex]?.src
}

const projectFolders = {
  barceloRoma: '1g5wIRpzVqzWAzFg-g6hxXLXi661UFywb',
  capri: '1uqM3UHYCYDEktHJ8Z6ek7uVUBKIdP0C2',
  saintLaurentNapoli: '11Ly1iH3y06y9SoV8zTtRAFomudz9H-Dk',
  parigi: '1e2xgfHqjZPToOtZEBavx4UtEwpib6TX4',
  berlino: '137yo25zarPZUBgT9n4UDCxkrsk47G-oT',
}

const barceloRomaSeed = [
  ['IMG_8770.JPG', '1UBhHJ7K2eRJHZf02r2Xp7WvrufQ0fGDf'],
  ['IMG_8652.JPG', '1OUw2mwGYas441izcJxP6McZpjqQCY_Gc'],
  ['IMG_8863.JPG', '17XbPrSfbTZ3DbM39Y6wgH6lNP7AM6h7K'],
  ['IMG_8768.JPG', '1wB5gV2qb9ZMgnLK86D8vUFPC3mAdJ4HS'],
  ['IMG_8753.JPG', '1Foz8UG8vUXCnJae3QKb-tbNJd06gQlao'],
  ['IMG_8650.JPG', '19uuq3jd71Tny2IXHm8Ketyg3Jegyy1ZI'],
  ['IMG_8752.JPG', '1BwrqC52LSfD88gydbBGh2iFcnO7WclXc'],
  ['IMG_8605.JPG', '1jYrl38x7APJZEggpx0U8lF1TJt52NWe2'],
  ['IMG_8862.JPG', '1IRgQuq5M0Pn2LLIMrmuSAROB5P0qOeNs'],
]

const capriSeed = [
  ['IMG_8816.JPG', '1pb6cIgJm8U_Krr7n2_NLOPzNIQVsQKmy'],
  ['IMG_8834.JPG', '1Gqj2NNJ3tveDZIXt7SW1vn0Ta6E0G_GH'],
  ['IMG_8835.JPG', '19Xv0PRUItIa3-Zsq7CfDBkWpU078BPy6'],
  ['IMG_8850.JPG', '1nBCjANCii8ydzbPDmJpiWofnrMgvzcqs'],
  ['IMG_8849.JPG', '1AcX_MZfn7bGxeH37boIu5ldsHPXV6kf3'],
  ['IMG_8851.JPG', '1iVjrQZRVmLQllAZ4o0wNui2webplncF9'],
]

const saintLaurentNapoliSeed = [
  ['IMG_7499.JPG', '1h5_f5t9Dy36GPML2vnh0_hQvK-6fpLqE'],
  ['IMG_7127.JPG', '14Nt0zbCyc2HSn6JA0l2ZtrOKiaPgxGme'],
  ['IMG_7129.JPG', '1SH2LzM2yvjStBvppiRnTx_jztpKpR1ya'],
  ['IMG_7008.JPG', '1SJRuoHozy3koY-JkGbWEfwQOdbyThoNO'],
  ['IMG_7009.JPG', '1G6VVzfVjhQzQSlC36e4PvgcACTaXDZT6'],
  ['IMG_7498.JPG', '1p_ibCrNZPyV-PiBJMbG28N9AOnQmdLmG'],
  ['IMG_7500.JPG', '1zQ0bZ5gFoynqMIQI383dIQXXbD1lvgV2'],
  ['IMG_7503.JPG', '1ahLfnhDBYH37WhDIfdxWdeGe9cV5n3B0'],
  ['IMG_7011.JPG', '1tn4p-CsaNYhPvonpqHnFOwLJvTVMDnIg'],
]

const parigiSeed = [
  ['IMG_7226.JPG', '1eopvtwEMO6f9RV-JJQzduetweswqT5MJ'],
  ['IMG_7032.JPG', '1K_X4Jl9WIhRfCZxRf3xVA_0NT0Ed8rXb'],
  ['IMG_7160.JPG', '10EcA8R9cttQ8RMFIBXDydeXZqskE844r'],
  ['IMG_7161.JPG', '1SuXmDD6wrcmij4MA_QSMsx1_Lyga9BQO'],
  ['IMG_7281.JPG', '1r1edtCm-Jct35x3zuNhOJSf14QdV9Gj7'],
  ['IMG_7044.JPG', '1zE2wjV6EyKBOiIJEAGljLblcGX7M-bAf'],
  ['IMG_7041.JPG', '1VrETO8RR6_XiFSwpmQ1dkqKDeG66t0O3'],
  ['IMG_7230.JPG', '1mQY3l_csD1_DmotnP-AamtmvtmTag8l6'],
  ['IMG_7029.JPG', '1M4nJgHMmz8FFkdYv8x_Y8kg9W2nzvZ8a'],
]

const berlinoSeed = [
  ['IMG_7449.JPG', '1PafhzufGcVkI_WhfI8oLFauJOpPCG9LE'],
  ['IMG_7448.JPG', '1jielbpfr592JaKuKSTkvol095N53M_Hk'],
  ['IMG_7447.JPG', '1QLiNS8n_KcaDZeAZTQlDXGvbZGqOfV5q'],
  ['IMG_7349.JPG', '1s_nb3Aca8SqBo29XBrB_PvHP_kYJkSoE'],
  ['IMG_7328.JPG', '1BuGfvvucwQ20C6vLU1tMxJ_z_eGbQy_x'],
  ['IMG_7350.JPG', '1gBmWVKOtvQHCwuzhYobK9DmvA8NlGouS'],
  ['IMG_7327.JPG', '1AlJ5SpdPzKHn-ilhZVBz2ZfmNQF3gUzi'],
  ['IMG_7329.JPG', '1doRVeKc9yT65lNBjpX8KTD7UIVM-YNdo'],
  ['IMG_7406.JPG', '1fHiwfRVUuIbJ0_ohD_U9mb20IN4Fj0OE'],
  ['IMG_7407.JPG', '1tOdsUC616l6l5PZK6cO2jX_y9i-8tjER'],
  ['IMG_7330.JPG', '1HYEVII1GqpruOrPJCxfdx57UeiC9Qi9l'],
]

export const barceloRomaGallery = makeGallery('Barcelò Roma', 'Roma / hospitality', barceloRomaSeed)
export const capriGallery = makeGallery('Capri', 'Capri / hospitality', capriSeed)
export const capriPalaceGallery = capriGallery
export const saintLaurentNapoliGallery = makeGallery('Saint Laurent Napoli', 'Napoli / retail', saintLaurentNapoliSeed)
export const parigiGallery = makeGallery('Parigi', 'Parigi / cantiere internazionale', parigiSeed)
export const berlinoGallery = makeGallery('Berlino', 'Berlino / cantiere internazionale', berlinoSeed)
export const unassignedDriveGallery = []

export const allDriveProjectPhotos = [
  ...barceloRomaGallery,
  ...capriGallery,
  ...saintLaurentNapoliGallery,
  ...parigiGallery,
  ...berlinoGallery,
]

export const driveHeroImages = {
  home: srcByName(barceloRomaGallery, 'IMG_8770.JPG', 0),
  services: srcByName(berlinoGallery, 'IMG_7327.JPG', 0),
  projects: srcByName(capriGallery, 'IMG_8816.JPG', 0),
  about: srcByName(saintLaurentNapoliGallery, 'IMG_7129.JPG', 0),
  contact: srcByName(parigiGallery, 'IMG_7032.JPG', 0),
  caseStudy: srcByName(barceloRomaGallery, 'IMG_8768.JPG', 0),
  method: srcByName(berlinoGallery, 'IMG_7349.JPG', 0),
  documentation: srcByName(capriGallery, 'IMG_8834.JPG', 0),
}

export const driveServiceImages = {
  cartongesso: srcByName(berlinoGallery, 'IMG_7328.JPG', 0),
  ristrutturazioniTecniche: srcByName(parigiGallery, 'IMG_7044.JPG', 0),
  finitureInterne: srcByName(berlinoGallery, 'IMG_7330.JPG', 0),
  gestioneCantiere: srcByName(barceloRomaGallery, 'IMG_8652.JPG', 0),
  manutenzioni: srcByName(capriGallery, 'IMG_8843.JPG', 0),
  supportoOperativo: srcByName(saintLaurentNapoliGallery, 'IMG_7008.JPG', 0),
}

export const drivePublicProjects = [
  {
    id: 'barcelo-roma',
    title: 'Barcelò Roma',
    city: 'Roma',
    category: 'Hospitality',
    status: 'In corso',
    year: '2026',
    folderId: projectFolders.barceloRoma,
    folderUrl: driveFolderUrl(projectFolders.barceloRoma),
    image: srcByName(barceloRomaGallery, 'IMG_8770.JPG', 0),
    heroImage: srcByName(barceloRomaGallery, 'IMG_8768.JPG', 0),
    methodImage: srcByName(barceloRomaGallery, 'IMG_8652.JPG', 0),
    alt: 'Foto reale del cantiere Barcelò Roma',
    summary: 'Intervento hospitality a Roma con lavorazioni interne, finiture e supporto operativo in aree tecniche della struttura.',
    longText: 'Cantiere hospitality a Roma seguito per fasi operative, con documentazione fotografica ordinata per aree di lavoro. La scheda raccoglie interventi su spazi interni, passaggi tecnici e finiture collegate alla gestione del cantiere.',
    metrics: ['Hospitality', 'Roma', `${barceloRomaGallery.length} foto`],
    services: ['Cartongesso', 'Finiture interne', 'Gestione cantiere', 'Supporto operativo'],
    challenge: 'Cantiere hospitality con più zone operative, passaggi tecnici e lavorazioni da mantenere ordinate durante l’avanzamento.',
    solution: 'Esecuzione progressiva di cartongessi, chiusure, riprese e finiture con controllo fotografico delle aree trattate.',
    results: ['Aree operative documentate', 'Finiture tracciate', 'Portfolio aggiornato'],
    gallery: barceloRomaGallery,
    note: 'Documentazione ricavata dalla cartella Drive dedicata al cantiere Barcelo Roma.',
  },
  {
    id: 'capri',
    title: 'Capri',
    city: 'Capri',
    category: 'Hospitality',
    status: 'Pubblicato',
    year: '2026',
    folderId: projectFolders.capri,
    folderUrl: driveFolderUrl(projectFolders.capri),
    image: srcByName(capriGallery, 'IMG_8816.JPG', 0),
    heroImage: srcByName(capriGallery, 'IMG_8834.JPG', 0),
    methodImage: srcByName(capriGallery, 'IMG_8849.JPG', 0),
    alt: 'Foto reale del cantiere Capri',
    summary: 'Lavorazioni hospitality a Capri con preparazione aree, passaggi impiantistici, chiusure e finiture interne.',
    longText: 'Scheda dedicata alla località Capri, con immagini di cantiere selezionate dalla cartella Drive già categorizzata. Il lavoro viene presentato come intervento hospitality su ambienti interni, preparazioni e finiture coordinate.',
    metrics: ['Hospitality', 'Capri', `${capriGallery.length} foto`],
    services: ['Preparazione aree', 'Finiture interne', 'Gestione cantiere', 'Documentazione fotografica'],
    challenge: 'Aree interne in struttura ricettiva con lavorazioni da coordinare tra impianti, rivestimenti e finiture finali.',
    solution: 'Preparazione delle superfici, controllo dei passaggi tecnici e avanzamento ordinato delle chiusure prima delle finiture.',
    results: ['Ambienti preparati', 'Fasi fotografate', 'Materiale diviso per località'],
    gallery: capriGallery,
    note: 'Documentazione ricavata dalla cartella Drive dedicata alla località Capri.',
  },
  {
    id: 'saint-laurent-napoli',
    title: 'Saint Laurent Napoli',
    city: 'Napoli',
    category: 'Retail',
    status: 'Pubblicato',
    year: '2026',
    folderId: projectFolders.saintLaurentNapoli,
    folderUrl: driveFolderUrl(projectFolders.saintLaurentNapoli),
    image: srcByName(saintLaurentNapoliGallery, 'IMG_7499.JPG', 0),
    heroImage: srcByName(saintLaurentNapoliGallery, 'IMG_7129.JPG', 0),
    methodImage: srcByName(saintLaurentNapoliGallery, 'IMG_7008.JPG', 0),
    alt: 'Foto reale del cantiere Saint Laurent Napoli',
    summary: 'Intervento retail a Napoli con lavorazioni interne, assistenze tecniche e finiture per spazio commerciale.',
    longText: 'Cantiere retail a Napoli impostato per lavorazioni rapide e ordinate in ambiente commerciale. La scheda raccoglie foto di preparazioni, assistenze e finiture eseguite in una località distinta dal resto del portfolio.',
    metrics: ['Retail', 'Napoli', `${saintLaurentNapoliGallery.length} foto`],
    services: ['Retail fit-out', 'Finiture interne', 'Supporto operativo', 'Documentazione fotografica'],
    challenge: 'Spazio commerciale con lavorazioni concentrate, tempi stretti e necessità di mantenere pulizia e precisione esecutiva.',
    solution: 'Assistenze interne, predisposizioni, chiusure e finiture gestite per fasi, con documentazione fotografica del cantiere.',
    results: ['Cantiere retail documentato', 'Foto separate per località', 'Scheda pubblica più chiara'],
    gallery: saintLaurentNapoliGallery,
    note: 'Documentazione ricavata dalla cartella Drive dedicata a Saint Laurent Napoli.',
  },
  {
    id: 'parigi',
    title: 'Parigi',
    city: 'Parigi',
    category: 'Cantiere internazionale',
    status: 'Pubblicato',
    year: '2026',
    folderId: projectFolders.parigi,
    folderUrl: driveFolderUrl(projectFolders.parigi),
    image: srcByName(parigiGallery, 'IMG_7226.JPG', 0),
    heroImage: srcByName(parigiGallery, 'IMG_7032.JPG', 0),
    methodImage: srcByName(parigiGallery, 'IMG_7044.JPG', 0),
    alt: 'Foto reale del cantiere Parigi',
    summary: 'Lavori all’estero su cantiere Parigi con supporto operativo, preparazioni interne e finiture tecniche.',
    longText: 'Scheda dedicata ai lavori svolti all’estero nella località Parigi. Le immagini mostrano attività di cantiere, predisposizioni e avanzamenti interni organizzati come intervento internazionale separato dai cantieri italiani.',
    metrics: ['Internazionale', 'Parigi', `${parigiGallery.length} foto`],
    services: ['Finiture interne', 'Supporto operativo', 'Gestione cantiere', 'Documentazione fotografica'],
    challenge: 'Trasferta operativa all’estero con materiali, tempi e lavorazioni da coordinare fuori dalla sede abituale.',
    solution: 'Supporto di cantiere, preparazione degli ambienti e lavorazioni interne gestite con documentazione fotografica dedicata.',
    results: ['Lavoro estero documentato', 'Foto ordinate per località', 'Portfolio internazionale ampliato'],
    gallery: parigiGallery,
    note: 'Documentazione ricavata dalla cartella Drive dedicata a Parigi.',
  },
  {
    id: 'berlino',
    title: 'Berlino',
    city: 'Berlino',
    category: 'Cantiere internazionale',
    status: 'Pubblicato',
    year: '2026',
    folderId: projectFolders.berlino,
    folderUrl: driveFolderUrl(projectFolders.berlino),
    image: srcByName(berlinoGallery, 'IMG_7449.JPG', 0),
    heroImage: srcByName(berlinoGallery, 'IMG_7327.JPG', 0),
    methodImage: srcByName(berlinoGallery, 'IMG_7349.JPG', 0),
    alt: 'Foto reale del cantiere Berlino',
    summary: 'Cantiere estero a Berlino con cartongesso, preparazioni tecniche, supporto operativo e finiture interne.',
    longText: 'Scheda dedicata ai lavori svolti all’estero nella località Berlino. Il materiale fotografico è stato separato in una cartella propria per mostrare il cantiere internazionale senza mischiarlo con altri interventi.',
    metrics: ['Internazionale', 'Berlino', `${berlinoGallery.length} foto`],
    services: ['Cartongesso', 'Ristrutturazioni tecniche', 'Finiture interne', 'Supporto operativo'],
    challenge: 'Intervento fuori Italia con organizzazione di squadra, attrezzature e lavorazioni interne da mantenere allineate allo standard richiesto.',
    solution: 'Montaggi a secco, preparazioni, chiusure e riprese interne eseguite con controllo ordinato delle fasi operative.',
    results: ['Cantiere estero documentato', 'Foto separate per Berlino', 'Portfolio più completo'],
    gallery: berlinoGallery,
    note: 'Documentazione ricavata dalla cartella Drive dedicata a Berlino.',
  },
]
