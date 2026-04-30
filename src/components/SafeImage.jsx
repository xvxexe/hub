import { useState } from 'react'
import { placeholderImages } from '../data/publicImages'

export function SafeImage({
  src,
  alt,
  title,
  className,
  fallbackSrc = placeholderImages.project.src,
  finalFallbackSrc = placeholderImages.projectSvg.src,
  loading = 'lazy',
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc)

  return (
    <img
      alt={alt || title || 'Immagine EuropaService'}
      className={className}
      loading={loading}
      onError={() => {
        if (currentSrc !== fallbackSrc && fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        } else if (currentSrc !== finalFallbackSrc) {
          setCurrentSrc(finalFallbackSrc)
        }
      }}
      src={currentSrc}
      title={title}
    />
  )
}
