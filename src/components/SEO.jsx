import { useEffect } from 'react'

const defaultDescription =
  'EuropaService realizza lavori di edilizia, cartongesso, controsoffitti, pareti divisorie, rasature e finiture interne per privati, aziende, hotel e negozi.'

export function SEO({ title, description = defaultDescription }) {
  useEffect(() => {
    document.title = title ? `${title} | EuropaService` : 'EuropaService'

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }, [description, title])

  return null
}
