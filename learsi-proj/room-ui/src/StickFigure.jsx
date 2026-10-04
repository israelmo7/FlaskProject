import { useEffect, useId, useState } from 'react'
import './StickFigure.css'

export const STICK_STYLES = ['classic', 'chalk', 'ink', 'neon', 'sketch', 'runner']
export const STICK_GEAR = ['none', 'pack', 'lantern', 'map', 'hammer']

/**
 * Discrete pose frames — classic animation feel (hold each frame, then change).
 * Angles in degrees. Limbs: [upper, lower] relative bends.
 */
const FRAMES = {
  idle: [
    { bob: 0, lean: -1.2, armL: [12, 8], armR: [-10, 6], legL: [3, 2], legR: [-2, 1], blink: false },
    { bob: 1.2, lean: -0.4, armL: [10, 10], armR: [-8, 8], legL: [2, 2], legR: [-2, 2], blink: false },
    { bob: 2.2, lean: 0.6, armL: [8, 12], armR: [-6, 10], legL: [1, 3], legR: [-1, 2], blink: false },
    { bob: 1.4, lean: 1.0, armL: [9, 10], armR: [-7, 8], legL: [2, 2], legR: [-2, 2], blink: true },
    { bob: 0.4, lean: 0.2, armL: [11, 8], armR: [-9, 6], legL: [3, 2], legR: [-2, 1], blink: false },
    { bob: -0.3, lean: -0.8, armL: [13, 6], armR: [-11, 5], legL: [3, 1], legR: [-3, 1], blink: false },
  ],
  walking: [
    { bob: 0, lean: 3, armL: [28, 12], armR: [-24, 10], legL: [-26, 18], legR: [22, 8], blink: false },
    { bob: -1.5, lean: 1, armL: [14, 8], armR: [-12, 6], legL: [-12, 10], legR: [10, 6], blink: false },
    { bob: 0.5, lean: -1, armL: [-6, 6], armR: [8, 8], legL: [4, 4], legR: [-6, 8], blink: false },
    { bob: -1.2, lean: -3, armL: [-26, 10], armR: [26, 12], legL: [22, 8], legR: [-26, 18], blink: false },
    { bob: 0.2, lean: -1, armL: [-12, 6], armR: [14, 8], legL: [10, 6], legR: [-12, 10], blink: false },
    { bob: -1.4, lean: 1, armL: [8, 8], armR: [-6, 6], legL: [-6, 8], legR: [4, 4], blink: false },
  ],
  visiting: [
    { bob: 0.4, lean: -5, armL: [18, 14], armR: [-4, 20], legL: [8, 4], legR: [-6, 6], blink: false },
    { bob: 1.2, lean: -4, armL: [16, 16], armR: [-2, 22], legL: [7, 5], legR: [-5, 6], blink: false },
    { bob: 0.6, lean: -5.5, armL: [20, 12], armR: [-6, 18], legL: [9, 3], legR: [-7, 5], blink: true },
    { bob: 1.0, lean: -4.2, armL: [17, 15], armR: [-3, 21], legL: [8, 4], legR: [-6, 6], blink: false },
  ],
  talking: [
    { bob: 0.5, lean: 2, armL: [8, 6], armR: [-38, 28], legL: [4, 2], legR: [-3, 2], blink: false },
    { bob: 1.8, lean: 3, armL: [10, 8], armR: [-48, 18], legL: [3, 2], legR: [-2, 2], blink: false },
    { bob: 0.8, lean: 1, armL: [6, 6], armR: [-30, 32], legL: [4, 2], legR: [-3, 2], blink: false },
    { bob: 2.0, lean: 2.5, armL: [9, 7], armR: [-52, 12], legL: [3, 2], legR: [-2, 2], blink: true },
    { bob: 1.0, lean: 1.5, armL: [7, 6], armR: [-34, 26], legL: [4, 2], legR: [-3, 2], blink: false },
  ],
}

const FRAME_MS = {
  idle: 220,
  walking: 95,
  visiting: 260,
  talking: 110,
}

const ANCHOR = {
  shoulder: { x: 60, y: 58 },
  hip: { x: 60, y: 98 },
  head: { x: 60, y: 30 },
}

function useStickFrame(pose) {
  const key = FRAMES[pose] ? pose : 'idle'
  const frames = FRAMES[key]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    const ms = FRAME_MS[key] || 200
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length)
    }, ms)
    return () => window.clearInterval(id)
  }, [key, frames.length])

  return frames[index % frames.length]
}

function polar(x, y, angleDeg, length) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: x + Math.sin(rad) * length,
    y: y + Math.cos(rad) * length,
  }
}

/** Two-segment stick limb (upper + lower) for knee/elbow life. */
function StickLimb({
  origin,
  angles,
  lengths,
  className,
  foot = false,
}) {
  const [a0, a1] = angles
  const [len0, len1] = lengths
  const mid = polar(origin.x, origin.y, a0, len0)
  const tip = polar(mid.x, mid.y, a0 + a1, len1)
  return (
    <g className={`limb ${className}`}>
      <line className="part seg upper" x1={origin.x} y1={origin.y} x2={mid.x} y2={mid.y} />
      <circle className="joint" cx={mid.x} cy={mid.y} r="2.1" />
      <line className="part seg lower" x1={mid.x} y1={mid.y} x2={tip.x} y2={tip.y} />
      {foot ? (
        <line
          className="part foot"
          x1={tip.x - 5}
          y1={tip.y}
          x2={tip.x + 6}
          y2={tip.y}
        />
      ) : null}
    </g>
  )
}

/**
 * Shared stick-man figure — frame-animated, still simple.
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
  const frame = useStickFrame(pose)
  const filterId = useId().replace(/:/g, '')
  const shoulder = ANCHOR.shoulder
  const hip = ANCHOR.hip
  const headY = ANCHOR.head.y + frame.bob * 0.35
  const bodyY = frame.bob
  const lean = frame.lean

  const neck = { x: shoulder.x, y: shoulder.y - 8 }
  const gearPack = {
    x: shoulder.x + 10,
    y: shoulder.y + 4 + bodyY * 0.2,
  }

  return (
    <svg
      className={`stick-man size-${size} style-${styleName} gear-${gear} pose-${pose}`}
      viewBox="0 0 120 180"
      role="img"
      aria-label={`${label}, ${styleName}, ${pose}`}
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.15" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse className="ground-shadow" cx="60" cy="168" rx="28" ry="5.5" />

      <g
        className="stick-figure"
        filter={`url(#${filterId})`}
        style={{
          transform: `translate(0px, ${bodyY}px) rotate(${lean}deg)`,
          transformOrigin: '60px 98px',
        }}
      >
        {/* head */}
        <g className="head-group" style={{ transform: `translate(0px, ${frame.bob * 0.2}px)` }}>
          <path
            className="part accent hat"
            d="M34 24 Q60 6 86 24"
            fill="none"
          />
          <circle className="part head" cx="60" cy={headY} r="16" />
          <circle
            className={`part eye eye-l${frame.blink ? ' blink' : ''}`}
            cx="53.5"
            cy={headY - 1}
            r="1.7"
          />
          <circle
            className={`part eye eye-r${frame.blink ? ' blink' : ''}`}
            cx="66.5"
            cy={headY - 1}
            r="1.7"
          />
        </g>

        {/* neck hint + torso */}
        <line className="part neck" x1={neck.x} y1={headY + 16} x2={shoulder.x} y2={shoulder.y} />
        <line className="part torso" x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y} />
        <path className="part accent scarf" d="M50 60 Q60 70 70 60" fill="none" />

        <StickLimb
          className="arm-l"
          origin={shoulder}
          angles={frame.armL}
          lengths={[22, 20]}
        />
        <StickLimb
          className="arm-r"
          origin={shoulder}
          angles={frame.armR}
          lengths={[22, 20]}
        />
        <StickLimb
          className="leg-l"
          origin={hip}
          angles={frame.legL}
          lengths={[26, 26]}
          foot
        />
        <StickLimb
          className="leg-r"
          origin={hip}
          angles={frame.legR}
          lengths={[26, 26]}
          foot
        />

        {/* gear — stays still relative to torso */}
        <rect
          className="part gear pack"
          x={gearPack.x}
          y={gearPack.y}
          width="15"
          height="20"
          rx="2.5"
        />
        <g className="gear lantern" transform={`translate(0 ${bodyY * 0.15})`}>
          <line className="part" x1="82" y1="82" x2="82" y2="96" />
          <rect className="part accent" x="75" y="96" width="14" height="16" rx="2.5" />
        </g>
        <path
          className="part gear map accent"
          d="M30 78 L44 73 L44 96 L30 101 Z"
        />
        <g className="gear hammer" transform={`translate(0 ${bodyY * 0.1})`}>
          <line className="part" x1="82" y1="82" x2="96" y2="64" />
          <rect className="part accent" x="90" y="56" width="16" height="9" rx="1.5" />
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
