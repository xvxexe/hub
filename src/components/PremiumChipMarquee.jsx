export function PremiumChipMarquee({ items = [], className = 'premium-chip-row', ariaLabel = 'Elementi in evidenza', speed = 'normal' }) {
  const safeItems = items.filter(Boolean)
  const loopItems = [...safeItems, ...safeItems]

  if (!safeItems.length) return null

  return (
    <div className={`${className} premium-chip-marquee premium-chip-marquee-${speed}`} aria-label={ariaLabel}>
      <div className="premium-chip-marquee-track">
        {loopItems.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>
    </div>
  )
}
