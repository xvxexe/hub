function previewUrl(id) {
  return `https://drive.google.com/file/d/${id}/preview`
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

const iframeStyle = {
  display: 'block',
  width: '100%',
  height: '100%',
  border: 0,
  background: '#0f172a',
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
  if (!video?.id) return null

  return (
    <div style={{ ...frameStyle, aspectRatio: ratio }}>
      <iframe
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={false}
        aria-label={video.alt ?? video.title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={previewUrl(video.id)}
        style={iframeStyle}
        title={video.title ?? 'Video cantiere'}
      />
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
