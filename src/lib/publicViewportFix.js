const PUBLIC_VIEWPORT_STYLE_ID = 'europaservice-public-viewport-fix'

const PUBLIC_LAYOUT_SELECTORS = [
  '#root',
  '.app-shell',
  '.app-shell > main:not(.dashboard-main)',
  '.site-header',
  '.premium-hero',
  '.premium-section',
  '.premium-image-split',
  '.premium-case-split',
  '.premium-contact-layout',
  '.premium-final-cta',
  '.public-footer',
]

const PUBLIC_CONTAINER_SELECTORS = [
  '.premium-hero-copy',
  '.premium-section-heading',
  '.premium-service-grid',
  '.premium-project-grid',
  '.premium-feature-grid',
  '.premium-value-grid',
  '.premium-testimonial-grid',
  '.premium-contact-grid',
  '.premium-gallery',
  '.premium-stats',
  '.premium-process',
  '.premium-key-facts',
  '.premium-featured-project',
  '.premium-filter-pills',
  '.premium-logo-row',
  '.premium-sector-row',
  '.premium-timeline',
  '.premium-faq',
]

function setLightAsDefaultPublicTheme() {
  if (typeof window === 'undefined') return

  const savedTheme = window.localStorage.getItem('europaservice-public-theme')
  if (savedTheme === 'dark' || savedTheme === 'light') return

  window.localStorage.setItem('europaservice-public-theme', 'light')
  document.documentElement.dataset.publicTheme = 'light'
  document.documentElement.style.colorScheme = 'light'
}

function isPublicRoute() {
  if (typeof window === 'undefined') return false
  return !window.location.hash.startsWith('#/dashboard')
}

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
    .app-shell > main:not(.dashboard-main) {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      margin: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      overflow-x: hidden !important;
      transform: none !important;
      zoom: 1 !important;
    }

    .site-header,
    .app-shell > main:not(.dashboard-main),
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

function applyRuntimePublicLayoutFix() {
  if (typeof document === 'undefined' || !isPublicRoute()) return

  document.documentElement.style.width = '100%'
  document.documentElement.style.maxWidth = 'none'
  document.body.style.width = '100%'
  document.body.style.maxWidth = 'none'
  document.body.style.margin = '0'
  document.body.style.overflowX = 'hidden'

  PUBLIC_LAYOUT_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.style.width = '100%'
      node.style.minWidth = '0'
      node.style.maxWidth = 'none'
      node.style.marginLeft = '0'
      node.style.marginRight = '0'
      node.style.transform = 'none'
      node.style.zoom = '1'
    })
  })

  PUBLIC_CONTAINER_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.style.width = 'min(100%, var(--pub-max, 1180px))'
      node.style.maxWidth = 'var(--pub-max, 1180px)'
      node.style.minWidth = '0'
      node.style.marginLeft = 'auto'
      node.style.marginRight = 'auto'
    })
  })
}

function runPublicViewportFix() {
  setLightAsDefaultPublicTheme()
  injectPublicViewportFix()
  applyRuntimePublicLayoutFix()
}

function schedulePublicViewportFix() {
  if (typeof window === 'undefined') return

  runPublicViewportFix()
  window.requestAnimationFrame?.(runPublicViewportFix)
  window.setTimeout(runPublicViewportFix, 0)
  window.setTimeout(runPublicViewportFix, 150)
  window.setTimeout(runPublicViewportFix, 500)
  window.addEventListener('resize', runPublicViewportFix, { passive: true })
  window.addEventListener('hashchange', () => window.setTimeout(runPublicViewportFix, 60), { passive: true })
  window.visualViewport?.addEventListener('resize', runPublicViewportFix, { passive: true })
}

schedulePublicViewportFix()

export { injectPublicViewportFix, applyRuntimePublicLayoutFix, schedulePublicViewportFix }
