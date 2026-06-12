const driveVideoUrl = (id) => `https://drive.google.com/uc?export=download&id=${id}`
const driveFileUrl = (id) => `https://drive.google.com/file/d/${id}/view`

function makeVideo({ id, fileName, project, area, index }) {
  return {
    id,
    fileName,
    src: driveVideoUrl(id),
    sourceUrl: driveFileUrl(id),
    title: fileName,
    alt: `${project} - video cantiere ${index + 1}`,
    project,
    area,
  }
}

function makeVideoGallery(project, area, seed) {
  return seed.map(([fileName, id], index) => makeVideo({ id, fileName, project, area, index }))
}

export const barceloRomaVideos = makeVideoGallery('Barcelò Roma', 'Roma / hospitality', [
  ['IMG_8773.MOV', '1oF-RO1oATiJTt6ApBGpsYcng5P0m6A5y'],
  ['IMG_8778.MOV', '1Jsu9GEAfb_nbhksqEj0uUSxPxeQnS0u4'],
  ['IMG_8746.MOV', '191NzvyPQYwz3asDi5B0afnaTEjgvn0BK'],
  ['IMG_8744.MOV', '1c4B2SsCygPaFmPqy1IscYp-F5D6xP0Aj'],
])

export const capriVideos = makeVideoGallery('Capri', 'Capri / hospitality', [
  ['IMG_8844.MOV', '1WuH1NtzKRrdWvCw6HmFxLDXfwddY6gYD'],
  ['IMG_8845.MOV', '1_pX97uyrs8F0FT4e7UQWhnFVa6HqGVwq'],
  ['IMG_8817.MOV', '1DfUgFYSPqNw8EDcnVa3tmtiugeq9beYY'],
])

export const saintLaurentNapoliVideos = makeVideoGallery('Saint Laurent Napoli', 'Napoli / retail', [
  ['IMG_7007.MOV', '140x5bYFEUW23UZcWo68NjQVq_RMpBoiG'],
])

export const parigiVideos = makeVideoGallery('Parigi', 'Parigi / cantiere internazionale', [
  ['IMG_7224.MOV', '1bW1wECi0uTfXYNmNfqy9DDnA6kRh02FI'],
  ['IMG_7043.MOV', '1imzLZEv8vjdU-wS2OyxuFI_vpfozD2Dw'],
  ['IMG_7046.MOV', '1xar0KaLz8LOBZCAhhwmzOqpuRHOxeZ5z'],
  ['IMG_7229.MOV', '1iDC33KSN9nKzA9888kiTt7QsRru3clrn'],
  ['IMG_7042.MOV', '1EyWOMDkBXuBAUOW9psCcNM6SBNZwbnuv'],
  ['IMG_7045.MOV', '1iE2NulHrdrhB4ZS0rPz5eGfz6Uv3xlG9'],
])

export const berlinoVideos = makeVideoGallery('Berlino', 'Berlino / cantiere internazionale', [
  ['IMG_7444.MOV', '15n_TE2y2sOXcn0NdHjgrY22H6IGf19Yp'],
])

export const projectVideosById = {
  'barcelo-roma': barceloRomaVideos,
  capri: capriVideos,
  'saint-laurent-napoli': saintLaurentNapoliVideos,
  parigi: parigiVideos,
  berlino: berlinoVideos,
}

export const publicFeaturedVideos = {
  home: barceloRomaVideos[0],
  services: parigiVideos[1],
  about: saintLaurentNapoliVideos[0],
  international: berlinoVideos[0],
  hospitality: capriVideos[0],
}
