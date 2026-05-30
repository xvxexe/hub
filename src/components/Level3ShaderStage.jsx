import { ENABLE_LEVEL_3_SHADERS } from '../config/visualEffects'

export function Level3ShaderStage({ variant = 'ambient' }) {
  if (!ENABLE_LEVEL_3_SHADERS) return null

  return (
    <div className={`level3-shader-stage level3-shader-${variant}`} aria-hidden="true">
      <div className="level3-orb level3-orb-a" />
      <div className="level3-orb level3-orb-b" />
      <div className="level3-orb level3-orb-c" />
      <div className="level3-grid" />
      <div className="level3-noise" />
      <div className="level3-scan" />
    </div>
  )
}

export function withLevel3Class(className = '') {
  return ENABLE_LEVEL_3_SHADERS ? `${className} level3-enabled`.trim() : className
}
