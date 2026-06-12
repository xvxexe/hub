import { useRef, useState } from 'react'

function videoSourceUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`
}

const frameStyle = {
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  borderRadius: '1.25rem',
  background: '#0f172a',
  boxShadow: '0 22px 58px rgba(15, 23, 42, 0.14)',
}

const mediaStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'pointer',
}

const buttonStyle = {
  position: 'absolute',
  right: '0.85rem',
  bottom: '0.85rem',
  zIndex: 2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '4.25rem',
  minHeight: '2.35rem',
  border: '1px solid rgba(255, 255, 255, 0.32)',
  borderRadius: '999px',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#ffffff',
  fontSize: '0.78rem',
  fontWeight: 900,
  lineHeight: 1,
  padding: '0.65rem 0.85rem',
  cursor: 'pointer',
  backdropFilter: 'blur(14px) saturate(140%)',
  WebkitBackdropFilter: 'blur(14px) saturate(140%)',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
  width: 'min(100%, var(--pub-max))',
  gap: '1rem',
  marginInline: 'auto',
}

const featureStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.08fr) minmax(280px, 0.92fr)',
  alignItems: 'center',
  width: 'min(100%, var(--pub-max))',
  gap: 'clamp(1.2rem, 4vw, 3rem)',
  margin: 'clamp(3rem, 7vw, 6rem) auto',
  paddingInline: 'max(1rem, env(safe-area-inset-left))',
}

const copyStyle = {
  display: 'grid',
  gap: '0.85rem',
}

const headingStyle = {
  maxWidth: '11ch',
  color: 'var(--pub-ink, #111827)',
  fontSize: 'clamp(2rem, 5vw, 4rem)',
  letterSpacing: '-0.065em',
  lineHeight: 0.92,
  margin: 0,
}

const textStyle = {
  maxWidth: '58ch',
  color: 'var(--pub-muted, #64748b)',
  fontSize: '1rem',
  lineHeight: 1.75,
  margin: 0,
}

export function PublicVideo({ video, ratio = '16 / 10' }) {
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
    <div style={{ ...frameStyle, aspectRatio: ratio }}>
      <video
        aria-label={video.alt ?? video.title}
        loop
        muted
        onClick={togglePlayback}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        playsInline
        preload="metadata"
        ref={videoRef}
        src={video.src ?? videoSourceUrl(video.id)}
        style={mediaStyle}
      />
      <button style={buttonStyle} type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Pausa video' : 'Riproduci video'}>
        {isPlaying ? 'Pausa' : 'Play'}
      </button>
    </div>
  )
}

export function PublicVideoGrid({ videos = [] }) {
  const visibleVideos = videos.filter(Boolean)
  if (!visibleVideos.length) return null

  return (
    <div style={gridStyle}>
      {visibleVideos.map((video) => <PublicVideo key={video.id} video={video} />)}
    </div>
  )
}

export function PublicVideoFeature({ eyebrow = 'Video cantiere', title, text, video }) {
  if (!video) return null

  return (
    <section style={featureStyle}>
      <PublicVideo video={video} ratio="4 / 3" />
      <div style={copyStyle}>
        <p className="premium-eyebrow">{eyebrow}</p>
        <h2 style={headingStyle}>{title}</h2>
        <p style={textStyle}>{text}</p>
      </div>
    </section>
  )
}
