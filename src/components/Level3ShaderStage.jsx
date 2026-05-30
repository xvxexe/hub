import { useEffect } from 'react'
import { ENABLE_LEVEL_3_SHADERS } from '../config/visualEffects'

export function Level3ShaderStage({ variant = 'ambient' }) {
  useEffect(() => {
    if (!ENABLE_LEVEL_3_SHADERS || variant !== 'hero') return undefined

    const root = document.documentElement
    let frame = 0
    let targetX = 0.5
    let targetY = 0.5
    let currentX = 0.5
    let currentY = 0.5

    function applyPointer() {
      frame = 0
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      root.style.setProperty('--level3-x', currentX.toFixed(4))
      root.style.setProperty('--level3-y', currentY.toFixed(4))
    }

    function onPointerMove(event) {
      targetX = event.clientX / window.innerWidth
      targetY = event.clientY / window.innerHeight
      if (!frame) frame = window.requestAnimationFrame(applyPointer)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    root.style.setProperty('--level3-x', '0.5')
    root.style.setProperty('--level3-y', '0.5')

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (frame) window.cancelAnimationFrame(frame)
      root.style.removeProperty('--level3-x')
      root.style.removeProperty('--level3-y')
    }
  }, [variant])

  if (!ENABLE_LEVEL_3_SHADERS || variant !== 'hero') return null

  return (
    <div className="level3-shader-stage level3-shader-global" aria-hidden="true">
      <div className="level3-orb level3-orb-a" />
      <div className="level3-orb level3-orb-b" />
      <div className="level3-orb level3-orb-c" />
      <div className="level3-grid" />
      <div className="level3-depth-lines" />
      <div className="level3-noise" />
      <div className="level3-cursor-light" />
    </div>
  )
}

export function withLevel3Class(className = '') {
  return ENABLE_LEVEL_3_SHADERS ? `${className} level3-enabled`.trim() : className
}
