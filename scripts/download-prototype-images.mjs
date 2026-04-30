import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const size = '1200/800'

const images = [
  ['public/assets/images/hero/edilizia-cartongesso-cantiere-hero.jpg', 'construction,interior,drywall'],
  ['public/assets/images/hero/controsoffitto-cantiere-interno.jpg', 'ceiling,construction,interior'],
  ['public/assets/images/services/cartongesso-pareti-divisorie.jpg', 'drywall,interior,construction'],
  ['public/assets/images/services/controsoffitti-cartongesso.jpg', 'ceiling,interior,construction'],
  ['public/assets/images/services/rasature-finiture-interne.jpg', 'plastering,wall,interior'],
  ['public/assets/images/services/isolamento-interno-cartongesso.jpg', 'insulation,wall,construction'],
  ['public/assets/images/services/lavori-edili-generali.jpg', 'renovation,construction,interior'],
  ['public/assets/images/services/manutenzioni-edili.jpg', 'construction,tools,maintenance'],
  ['public/assets/images/projects/hotel-lavori-interni-cartongesso.jpg', 'hotel,renovation,interior'],
  ['public/assets/images/projects/negozio-finiture-interne.jpg', 'retail,store,renovation'],
  ['public/assets/images/projects/appartamento-pareti-cartongesso.jpg', 'apartment,renovation,interior'],
  ['public/assets/images/projects/cantiere-controsoffitto.jpg', 'ceiling,drywall,construction'],
  ['public/assets/images/projects/locale-commerciale-ristrutturazione.jpg', 'commercial,renovation,interior'],
  ['public/assets/images/sectors/lavori-per-hotel.jpg', 'hotel,interior,renovation'],
  ['public/assets/images/sectors/lavori-per-negozi.jpg', 'shop,interior,renovation'],
  ['public/assets/images/sectors/lavori-per-aziende.jpg', 'office,renovation,interior'],
  ['public/assets/images/sectors/lavori-per-privati.jpg', 'home,renovation,interior'],
  ['public/assets/images/sectors/lavori-per-studi-tecnici.jpg', 'architecture,construction,planning'],
  ['public/assets/images/team/squadra-edile-cantiere.jpg', 'construction,workers,interior'],
  ['public/assets/images/placeholders/placeholder-cantiere.jpg', 'construction,site'],
  ['public/assets/images/placeholders/placeholder-servizio.jpg', 'construction,tools'],
  ['public/assets/images/placeholders/placeholder-documento.jpg', 'document,office'],
]

for (const [relativePath, keywords] of images) {
  const outputPath = join(rootDir, relativePath)
  await mkdir(dirname(outputPath), { recursive: true })

  try {
    const buffer = await downloadImage(keywords)
    await writeFile(outputPath, buffer)
    console.log(`scaricata: ${relativePath}`)
  } catch (error) {
    console.warn(`non scaricata: ${relativePath} (${error.message})`)
  }
}

async function downloadImage(keywords) {
  const random = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const loremFlickrUrl = `https://loremflickr.com/${size}/${keywords}?random=${random}`
  const picsumUrl = `https://picsum.photos/${size}?random=${random}`

  try {
    return await fetchImage(loremFlickrUrl)
  } catch (error) {
    console.warn(`fallback picsum per "${keywords}": ${error.message}`)
    return fetchImage(picsumUrl)
  }
}

async function fetchImage(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'EuropaService prototype image downloader',
    },
    redirect: 'follow',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    throw new Error(`risposta non immagine: ${contentType || 'content-type assente'}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
