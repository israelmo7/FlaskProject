import { useEffect, useState } from 'react'
import './StickFigure.css'

export const STICK_STYLES = ['classic', 'chalk', 'ink', 'neon', 'sketch', 'runner']
export const STICK_GEAR = ['none', 'pack', 'lantern', 'map', 'hammer']

/**
 * Shared stick-man figure with style skins + optional gear.
 * size: 'full' | 'side' | 'mini'
 */
export default function StickFigure({
  phase = 'idle',
  talking = false,
  styleName = 'classic',
  gear = 'none',
  size = 'full',
  label = 'Stick',
}) {
  const pose = talking ? 'talking' : phase || 'idle'
  return (
    <svg
      className={`stick-man size-${size} style-${styleName} gear-${gear} pose-${pose}`}
      viewBox="0 0 100 140"
      role="img"
      aria-label={`${label}, ${styleName}, ${pose}`}
    >
      <g className="stick-figure">
        <path className="part accent hat" d="M28 22 Q50 6 72 22" fill="none" />
        <circle className="part head" cx="50" cy="28" r="14" />
        <circle className="part eye eye-l" cx="44" cy="26" r="1.8" />
        <circle className="part eye eye-r" cx="56" cy="26" r="1.8" />
        <line className="part torso" x1="50" y1="42" x2="50" y2="88" />
        <line className="part arm arm-l" x1="50" y1="56" x2="28" y2="74" />
        <line className="part arm arm-r" x1="50" y1="56" x2="72" y2="74" />
        <line className="part leg leg-l" x1="50" y1="88" x2="34" y2="124" />
        <line className="part leg leg-r" x1="50" y1="88" x2="66" y2="124" />
        <path className="part accent scarf" d="M42 44 Q50 52 58 44" fill="none" />
        <rect className="part gear pack" x="56" y="52" width="14" height="18" rx="2" />
        <g className="gear lantern">
          <line className="part" x1="72" y1="74" x2="72" y2="86" />
          <rect className="part accent" x="66" y="86" width="12" height="14" rx="2" />
        </g>
        <path className="part gear map accent" d="M24 70 L36 66 L36 84 L24 88 Z" />
        <g className="gear hammer">
          <line className="part" x1="72" y1="74" x2="84" y2="58" />
          <rect className="part accent" x="80" y="50" width="14" height="8" rx="1" />
        </g>
      </g>
    </svg>
  )
}

export function useRotatingStick(intervalMs = 2800) {
  const [styleIdx, setStyleIdx] = useState(0)
  const [gearIdx, setGearIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStyleIdx((i) => (i + 1) % STICK_STYLES.length)
      setGearIdx((i) => (i + 1) % STICK_GEAR.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return {
    styleName: STICK_STYLES[styleIdx],
    gear: STICK_GEAR[gearIdx],
  }
}
