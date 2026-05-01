import { useState } from 'react'
import { asset, placeholderImages } from '../data/publicImages'

export function SafeImage({
  src,
  alt,
  title,
  className,
  fallbackSrc = placeholderImages.project.src,
  finalFallbackSrc = placeholderImages.project.src,
  loading = 'lazy',
}) {
  const [failedSources, setFailedSources] = useState([])
  const candidates = [src, fallbackSrc, finalFallbackSrc].filter(Boolean).map(asset)
  const uniqueCandidates = [...new Set(candidates)]
  const currentSrc = uniqueCandidates.find((candidate) => !failedSources.includes(candidate)) ?? uniqueCandidates.at(-1)

  return (
    <img
      alt={alt || title || 'Immagine EuropaService'}
      className={className ? `safe-image ${className}` : 'safe-image'}
      decoding="async"
      loading={loading}
      onError={() => {
        setFailedSources((current) => (
          currentSrc && !current.includes(currentSrc) ? [...current, currentSrc] : current
        ))
      }}
      src={currentSrc}
    />
  )
}
