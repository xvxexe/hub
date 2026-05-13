const PUBLIC_VIEWPORT_STYLE_ID = 'europaservice-public-viewport-fix'

function injectPublicViewportFix() {
  if (typeof document === 'undefined') return

  const existingStyle = document.getElementById(PUBLIC_VIEWPORT_STYLE_ID)
  if (existingStyle) existingStyle.remove()

  const style = document.createElement('style')
  style.id = PUBLIC_VIEWPORT_STYLE_ID
  style.textContent = `
    html,
    body,
    #root,
    .app-shell,
    .public-main {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body {
      overflow-x: hidden !important;
    }

    .app-shell,
    .public-main,
    .site-header,
    .premium-hero,
    .premium-section,
    .premium-image-split,
    .premium-case-split,
    .premium-contact-layout,
    .premium-final-cta,
    .public-footer {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      inline-size: 100% !important;
      max-inline-size: none !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      transform: none !important;
      zoom: 1 !important;
    }

    .premium-hero-copy,
    .premium-section-heading,
    .premium-service-grid,
    .premium-project-grid,
    .premium-feature-grid,
    .premium-value-grid,
    .premium-testimonial-grid,
    .premium-contact-grid,
    .premium-gallery,
    .premium-stats,
    .premium-process,
    .premium-key-facts,
    .premium-featured-project,
    .premium-filter-pills,
    .premium-logo-row,
    .premium-sector-row,
    .premium-timeline,
    .premium-faq {
      width: min(100%, var(--pub-max, 1180px)) !important;
      max-width: var(--pub-max, 1180px) !important;
      min-width: 0 !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    @media (min-width: 761px) and (max-width: 1180px) {
      .premium-hero,
      .premium-section,
      .premium-image-split,
      .premium-case-split,
      .premium-contact-layout,
      .premium-final-cta {
        padding-left: clamp(1rem, 3vw, 1.5rem) !important;
        padding-right: clamp(1rem, 3vw, 1.5rem) !important;
      }

      .premium-service-grid,
      .premium-project-grid,
      .premium-feature-grid,
      .premium-value-grid,
      .premium-testimonial-grid,
      .premium-contact-grid,
      .premium-gallery,
      .premium-stats,
      .premium-process {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 760px) {
      .premium-service-grid,
      .premium-project-grid,
      .premium-feature-grid,
      .premium-value-grid,
      .premium-testimonial-grid,
      .premium-contact-grid,
      .premium-gallery,
      .premium-stats,
      .premium-process,
      .premium-image-split,
      .premium-case-split,
      .premium-contact-layout,
      .premium-final-cta {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      .premium-image-split-reverse .premium-split-image {
        order: initial !important;
      }
    }
  `

  document.head.appendChild(style)
}

function schedulePublicViewportFix() {
  if (typeof window === 'undefined') return

  injectPublicViewportFix()
  window.requestAnimationFrame?.(injectPublicViewportFix)
  window.setTimeout(injectPublicViewportFix, 0)
  window.setTimeout(injectPublicViewportFix, 250)
  window.addEventListener('resize', injectPublicViewportFix, { passive: true })
  window.visualViewport?.addEventListener('resize', injectPublicViewportFix, { passive: true })
}

schedulePublicViewportFix()

export { injectPublicViewportFix, schedulePublicViewportFix }
