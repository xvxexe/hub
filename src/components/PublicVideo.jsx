import { useRef, useState } from 'react'
import './public-video.css'

function videoSourceUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`
}

export function PublicVideo({ video, className = '', ratio = '16 / 10' }) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!video?.id) return null

  const togglePlayback = async () => {
    const element = videoRef.current
    if (!element) return

    if (element.paused) {
      try {
        await element.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }

    element.pause()
    setIsPlaying(false)
  }

  return (
    <div className={`public-video-frame ${className}`} style={{ aspectRatio: ratio }}>
      <video
        aria-label={video.alt ?? video.title}
        className="public-video-media"
        loop
        muted
        onClick={togglePlayback}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        preload="metadata"
        ref={videoRef}
        src={video.src ?? videoSourceUrl(video.id)}
      />
      <button className="public-video-toggle" type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pausa video' : 'Riproduci video'}>
        {isPlaying ? 'Pausa' : 'Play'}
      </button>
    </div>
  )
}

export function PublicVideoGrid({ videos = [] }) {
  const visibleVideos = videos.filter(Boolean)
  if (!visibleVideos.length) return null

  return (
    <div className="public-video-grid">
      {visibleVideos.map((video) => <PublicVideo key={video.id} video={video} />)}
    </div>
  )
}

export function PublicVideoFeature({ eyebrow = 'Video cantiere', title, text, video, reverse = false }) {
  if (!video) return null

  return (
    <section className={reverse ? 'public-video-feature public-video-feature-reverse' : 'public-video-feature'}>
      <PublicVideo video={video} ratio="4 / 3" />
      <div className="public-video-copy">
        <p className="premium-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </section>
  )
}
