import { useEffect } from 'react'

const REVEAL_SELECTOR = '.premium-scroll-reveal'

export function usePublicMotion(routeKey, enabled) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.remove('public-motion-ready')
      return undefined
    }

    document.documentElement.classList.add('public-motion-ready')
    return () => document.documentElement.classList.remove('public-motion-ready')
  }, [enabled])

  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const elements = new Set()
    const revealElements = (root) => {
      if (!(root instanceof Element)) return []
      return [
        ...(root.matches(REVEAL_SELECTOR) ? [root] : []),
        ...root.querySelectorAll(REVEAL_SELECTOR),
      ]
    }

    if (!('IntersectionObserver' in window)) {
      const showReveals = (root) => revealElements(root).forEach((element) => element.classList.add('is-visible'))
      showReveals(document.body)

      const mutationObserver = new MutationObserver((records) => {
        records.forEach((record) => record.addedNodes.forEach(showReveals))
      })
      mutationObserver.observe(document.body, { childList: true, subtree: true })
      return () => mutationObserver.disconnect()
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08,
    })

    function observeReveals(root) {
      revealElements(root).forEach((element) => {
        if (elements.has(element)) return
        elements.add(element)
        observer.observe(element)
      })
    }

    observeReveals(document.body)
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeReveals))
    })
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [enabled, routeKey])
}
