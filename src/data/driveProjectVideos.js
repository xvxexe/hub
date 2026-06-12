const SUPABASE_VIDEO_BASE = 'https://qmdwfdfmhhhhghykfahfo.supabase.co/storage/v1/object/public/public-videos/uncat'

function makeSupabaseVideo(fileName, label) {
  return {
    id: fileName.replace('.mp4', ''),
    fileName,
    src: `${SUPABASE_VIDEO_BASE}/${fileName}`,
    title: label ?? fileName,
    alt: label ?? `Video pubblico ${fileName}`,
  }
}

export const uncatPublicVideos = [
  makeSupabaseVideo('IMG_7007.mp4', 'Video operativo Saint Laurent Napoli'),
  makeSupabaseVideo('IMG_7042.mp4', 'Video lavorazioni interne'),
  makeSupabaseVideo('IMG_7043.mp4', 'Video ristrutturazioni tecniche'),
  makeSupabaseVideo('IMG_7045.mp4', 'Video fasi di cantiere'),
  makeSupabaseVideo('IMG_7046.mp4', 'Video finiture interne'),
  makeSupabaseVideo('IMG_7224.mp4', 'Video cantiere estero'),
  makeSupabaseVideo('IMG_7229.mp4', 'Video avanzamento lavori'),
  makeSupabaseVideo('IMG_7444.mp4', 'Video cantiere Berlino'),
  makeSupabaseVideo('IMG_8744.mp4', 'Video cantiere hospitality'),
  makeSupabaseVideo('IMG_8746.mp4', 'Video lavorazioni Barcelò Roma'),
]

export const publicFeaturedVideos = {
  home: uncatPublicVideos[9],
  services: uncatPublicVideos[2],
  projects: uncatPublicVideos[8],
  about: uncatPublicVideos[0],
  contact: uncatPublicVideos[6],
  quote: uncatPublicVideos[4],
  international: uncatPublicVideos[7],
  hospitality: uncatPublicVideos[9],
}

export const projectVideosById = {}
