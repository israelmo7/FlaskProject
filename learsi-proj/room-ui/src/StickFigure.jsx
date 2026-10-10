import { useEffect, useId, useState } from 'react'
import './StickFigure.css'

export const STICK_STYLES = ['classic', 'chalk', 'ink', 'neon', 'sketch', 'runner']
export const STICK_GEAR = ['none', 'pack', 'lantern', 'map', 'hammer']

/** Mood expressions — not operations. Readable stick silhouettes. */
export const STICK_EXPRESSIONS = [
  'calm',
  'dreamy',
  'content',
  'chuckle',
  'laugh',
  'goofy',
  'curious',
  'wave',
  'shy',
  'proud',
  'bored',
  'think',
  'startle',
  'stretch',
  'fidget',
  'talk',
]

/** Alone-time weights — calm still common, but other moods get real stage time. */
const ALONE_WEIGHTS = {
  calm: 16,
  dreamy: 10,
  content: 9,
  bored: 9,
  think: 9,
  stretch: 8,
  fidget: 7,
  curious: 7,
  chuckle: 6,
  goofy: 5,
  shy: 4,
  proud: 4,
  wave: 4,
  laugh: 4,
  startle: 3,
}

/**
 * Discrete pose frames. Angles in degrees. Limbs: [upper, lower].
 * `walking` = locomotion only. Everything else = mood expression.
 */
const FRAMES = {
  walking: [
    { bob: 0, lean: 3, armL: [28, 12], armR: [-24, 10], legL: [-26, 18], legR: [22, 8], blink: false },
    { bob: -1.5, lean: 1, armL: [14, 8], armR: [-12, 6], legL: [-12, 10], legR: [10, 6], blink: false },
    { bob: 0.5, lean: -1, armL: [-6, 6], armR: [8, 8], legL: [4, 4], legR: [-6, 8], blink: false },
    { bob: -1.2, lean: -3, armL: [-26, 10], armR: [26, 12], legL: [22, 8], legR: [-26, 18], blink: false },
    { bob: 0.2, lean: -1, armL: [-12, 6], armR: [14, 8], legL: [10, 6], legR: [-12, 10], blink: false },
    { bob: -1.4, lean: 1, armL: [8, 8], armR: [-6, 6], legL: [-6, 8], legR: [4, 4], blink: false },
  ],

  calm: [
    { bob: 0, lean: -1, armL: [14, 10], armR: [-12, 8], legL: [14, 6], legR: [-14, 5], blink: false },
    { bob: 1.2, lean: -0.3, armL: [12, 12], armR: [-10, 10], legL: [13, 7], legR: [-13, 6], blink: false },
    { bob: 2.0, lean: 0.5, armL: [11, 13], armR: [-9, 11], legL: [12, 8], legR: [-12, 7], blink: false },
    { bob: 1.0, lean: 0.2, armL: [13, 11], armR: [-11, 9], legL: [14, 6], legR: [-14, 5], blink: true },
  ],

  dreamy: [
    { bob: 1.5, lean: -8, armL: [22, 18], armR: [-6, 28], legL: [18, 4], legR: [-8, 10], blink: false },
    { bob: 2.4, lean: -10, armL: [24, 16], armR: [-4, 30], legL: [17, 5], legR: [-7, 10], blink: false },
    { bob: 1.8, lean: -7, armL: [20, 20], armR: [-8, 26], legL: [18, 4], legR: [-8, 9], blink: true },
  ],

  content: [
    { bob: 0.6, lean: 3, armL: [8, 6], armR: [-8, 6], legL: [12, 5], legR: [-16, 8], blink: false },
    { bob: 1.4, lean: 4, armL: [6, 8], armR: [-6, 8], legL: [11, 6], legR: [-15, 9], blink: false },
    { bob: 0.8, lean: 2.5, armL: [9, 5], armR: [-9, 5], legL: [12, 5], legR: [-16, 8], blink: true },
  ],

  chuckle: [
    { bob: 0.5, lean: 2, armL: [16, 10], armR: [-16, 10], legL: [14, 5], legR: [-14, 5], blink: false },
    { bob: 3.2, lean: 6, armL: [20, 8], armR: [-20, 8], legL: [12, 6], legR: [-12, 6], blink: false },
    { bob: 0.8, lean: 1, armL: [14, 12], armR: [-14, 12], legL: [14, 5], legR: [-14, 5], blink: false },
    { bob: 2.8, lean: 5, armL: [18, 9], armR: [-18, 9], legL: [13, 6], legR: [-13, 6], blink: true },
  ],

  laugh: [
    { bob: 1, lean: -4, armL: [8, 4], armR: [4, -8], legL: [18, 4], legR: [-18, 6], blink: false },
    { bob: 4, lean: 8, armL: [30, 6], armR: [-8, -12], legL: [16, 6], legR: [-20, 8], blink: false },
    { bob: 0.5, lean: -2, armL: [10, 6], armR: [2, -6], legL: [18, 4], legR: [-18, 6], blink: false },
    { bob: 3.5, lean: 10, armL: [34, 4], armR: [-12, -10], legL: [14, 8], legR: [-22, 10], blink: true },
  ],

  goofy: [
    { bob: 0.4, lean: 12, armL: [40, 20], armR: [8, 30], legL: [6, 4], legR: [-22, 14], blink: false },
    { bob: 1.2, lean: 14, armL: [42, 18], armR: [10, 28], legL: [5, 5], legR: [-20, 16], blink: false },
    { bob: 0.6, lean: 10, armL: [36, 22], armR: [6, 32], legL: [8, 3], legR: [-24, 12], blink: true },
  ],

  curious: [
    { bob: 0.2, lean: 8, armL: [6, 4], armR: [-28, 16], legL: [8, 4], legR: [-18, 8], blink: false },
    { bob: 1.0, lean: 10, armL: [4, 6], armR: [-32, 14], legL: [7, 5], legR: [-17, 9], blink: false },
    { bob: 0.5, lean: 7, armL: [8, 4], armR: [-26, 18], legL: [9, 4], legR: [-18, 8], blink: true },
  ],

  wave: [
    { bob: 0.4, lean: 2, armL: [12, 8], armR: [-50, 8], legL: [14, 5], legR: [-14, 5], blink: false },
    { bob: 1.0, lean: 3, armL: [12, 8], armR: [-58, -6], legL: [14, 5], legR: [-14, 5], blink: false },
    { bob: 0.4, lean: 2, armL: [12, 8], armR: [-46, 14], legL: [14, 5], legR: [-14, 5], blink: false },
    { bob: 1.0, lean: 3, armL: [12, 8], armR: [-56, -2], legL: [14, 5], legR: [-14, 5], blink: true },
  ],

  shy: [
    { bob: 0.8, lean: -6, armL: [4, 28], armR: [-4, 28], legL: [8, 8], legR: [-8, 8], blink: false },
    { bob: 1.4, lean: -8, armL: [2, 32], armR: [-2, 32], legL: [7, 9], legR: [-7, 9], blink: true },
    { bob: 1.0, lean: -5, armL: [6, 26], armR: [-6, 26], legL: [9, 7], legR: [-9, 7], blink: false },
  ],

  proud: [
    { bob: 0, lean: -2, armL: [28, -6], armR: [-28, -6], legL: [16, 4], legR: [-16, 4], blink: false },
    { bob: 0.8, lean: -3, armL: [30, -8], armR: [-30, -8], legL: [15, 5], legR: [-15, 5], blink: false },
    { bob: 0.3, lean: -1.5, armL: [26, -4], armR: [-26, -4], legL: [16, 4], legR: [-16, 4], blink: true },
  ],

  bored: [
    { bob: 0.2, lean: 6, armL: [24, 30], armR: [-6, 4], legL: [4, 2], legR: [-20, 12], blink: false },
    { bob: 0.6, lean: 7, armL: [26, 28], armR: [-5, 6], legL: [3, 3], legR: [-19, 13], blink: false },
    { bob: 0.3, lean: 5, armL: [22, 32], armR: [-7, 3], legL: [5, 2], legR: [-21, 11], blink: true },
  ],

  think: [
    { bob: 0.5, lean: -3, armL: [10, 8], armR: [-18, -20], legL: [14, 5], legR: [-12, 6], blink: false },
    { bob: 1.2, lean: -4, armL: [10, 8], armR: [-16, -24], legL: [14, 5], legR: [-12, 6], blink: false },
    { bob: 0.7, lean: -2, armL: [10, 8], armR: [-20, -16], legL: [14, 5], legR: [-12, 6], blink: true },
  ],

  startle: [
    { bob: -1, lean: -12, armL: [36, 4], armR: [-36, 4], legL: [20, 2], legR: [-20, 2], blink: false },
    { bob: 2, lean: 4, armL: [20, 10], armR: [-20, 10], legL: [14, 6], legR: [-14, 6], blink: true },
    { bob: 0.5, lean: 0, armL: [14, 10], armR: [-14, 10], legL: [14, 6], legR: [-14, 5], blink: false },
  ],

  stretch: [
    { bob: -0.5, lean: -2, armL: [8, -40], armR: [-8, -40], legL: [12, 4], legR: [-12, 4], blink: false },
    { bob: -1.2, lean: 0, armL: [12, -48], armR: [-12, -48], legL: [10, 5], legR: [-10, 5], blink: false },
    { bob: 0.4, lean: 1, armL: [14, 8], armR: [-14, 8], legL: [14, 6], legR: [-14, 5], blink: true },
  ],

  fidget: [
    { bob: 0.2, lean: -2, armL: [16, 8], armR: [-10, 12], legL: [14, 4], legR: [-14, 8], blink: false },
    { bob: 0.8, lean: 2, armL: [10, 12], armR: [-16, 8], legL: [12, 8], legR: [-16, 4], blink: false },
    { bob: 0.3, lean: -1, armL: [18, 6], armR: [-8, 14], legL: [16, 3], legR: [-12, 9], blink: false },
    { bob: 0.9, lean: 1, armL: [8, 14], armR: [-18, 6], legL: [11, 9], legR: [-15, 5], blink: true },
  ],

  /** Brief caption / speak beat — still a mood, not a command. */
  talk: [
    { bob: 0.5, lean: 2, armL: [10, 8], armR: [-38, 28], legL: [14, 5], legR: [-12, 5], blink: false },
    { bob: 1.8, lean: 3, armL: [12, 10], armR: [-48, 18], legL: [13, 5], legR: [-11, 5], blink: false },
    { bob: 0.8, lean: 1, armL: [8, 8], armR: [-30, 32], legL: [14, 5], legR: [-12, 5], blink: false },
    { bob: 2.0, lean: 2.5, armL: [11, 9], armR: [-52, 12], legL: [13, 5], legR: [-11, 5], blink: true },
  ],
}

const FRAME_MS = {
  walking: 95,
  calm: 240,
  dreamy: 280,
  content: 260,
  chuckle: 120,
  laugh: 100,
  goofy: 180,
  curious: 200,
  wave: 130,
  shy: 260,
  proud: 240,
  bored: 300,
  think: 280,
  startle: 140,
  stretch: 220,
  fidget: 110,
  talk: 110,
}

const HOLD_MS = {
  calm: [3800, 5600],
  dreamy: [2800, 4200],
  content: [2600, 4000],
  bored: [3000, 4500],
  think: [2600, 4000],
  stretch: [2200, 3200],
  fidget: [1800, 2800],
  curious: [2200, 3400],
  chuckle: [1600, 2400],
  goofy: [1800, 2800],
  shy: [2200, 3400],
  proud: [2000, 3200],
  wave: [1600, 2400],
  laugh: [1600, 2400],
  startle: [1200, 1800],
}

const ANCHOR = {
  shoulder: { x: 60, y: 58 },
  hip: { x: 60, y: 98 },
  head: { x: 60, y: 30 },
}

function randBetween(min, max) {
  return min + Math.random() * (max - min)
}

function pickWeighted(weights) {
  const entries = Object.entries(weights)
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = Math.random() * total
  for (const [name, w] of entries) {
    roll -= w
    if (roll <= 0) return name
  }
  return entries[0][0]
}

function useStickFrame(pose) {
  const key = FRAMES[pose] ? pose : 'calm'
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

/**
 * When alone (not walking), randomly cycle mood expressions.
 * Calm is heavily weighted so the stage stays pleasant.
 */
export function useAloneExpression(alone) {
  const [expression, setExpression] = useState('calm')

  useEffect(() => {
    if (!alone) {
      setExpression('calm')
      return undefined
    }

    let timer = 0
    let cancelled = false

    function schedule(next) {
      setExpression(next)
      const [lo, hi] = HOLD_MS[next] || [2400, 3800]
      timer = window.setTimeout(() => {
        if (cancelled) return
        // Soft return toward calm between spicy beats.
        const pick =
          next !== 'calm' && Math.random() < 0.55
            ? 'calm'
            : pickWeighted(ALONE_WEIGHTS)
        schedule(pick)
      }, randBetween(lo, hi))
    }

    schedule(pickWeighted(ALONE_WEIGHTS))
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [alone])

  return expression
}

function polar(x, y, angleDeg, length) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: x + Math.sin(rad) * length,
    y: y + Math.cos(rad) * length,
  }
}

function StickLimb({ origin, angles, lengths, className, foot = false }) {
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
 * Shared stick-man — locomotion vs mood expressions.
 * size: 'full' | 'side' | 'mini'
 * alone (default true when not walking): random mood picks.
 */
export default function StickFigure({
  phase = 'idle',
  talking = false,
  expression: expressionProp = null,
  alone: aloneProp = null,
  styleName = 'classic',
  gear = 'none',
  size = 'full',
  label = 'Stick',
  onExpression,
}) {
  const walking = phase === 'walking'
  const alone =
    aloneProp == null ? !walking && !talking : Boolean(aloneProp) && !walking
  const aloneExpr = useAloneExpression(alone && !expressionProp)
  const expression = expressionProp || (talking ? 'talk' : aloneExpr)

  // Walking is the only operation pose; everything else is mood.
  const pose = walking ? 'walking' : expression

  useEffect(() => {
    if (typeof onExpression === 'function') onExpression(pose)
  }, [pose, onExpression])

  const frame = useStickFrame(pose)
  const filterId = useId().replace(/:/g, '')
  const shoulder = ANCHOR.shoulder
  const hip = ANCHOR.hip
  const headY = ANCHOR.head.y + frame.bob * 0.35
  const bodyY = frame.bob
  const lean = frame.lean

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
      data-expression={pose}
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
        <g className="head-group" style={{ transform: `translate(0px, ${frame.bob * 0.2}px)` }}>
          <path className="part accent hat" d="M34 24 Q60 6 86 24" fill="none" />
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

        <line
          className="part neck"
          x1={shoulder.x}
          y1={headY + 16}
          x2={shoulder.x}
          y2={shoulder.y}
        />
        <line className="part torso" x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y} />
        <path className="part accent scarf" d="M50 60 Q60 70 70 60" fill="none" />

        <StickLimb className="arm-l" origin={shoulder} angles={frame.armL} lengths={[22, 20]} />
        <StickLimb className="arm-r" origin={shoulder} angles={frame.armR} lengths={[22, 20]} />
        <StickLimb className="leg-l" origin={hip} angles={frame.legL} lengths={[26, 26]} foot />
        <StickLimb className="leg-r" origin={hip} angles={frame.legR} lengths={[26, 26]} foot />

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
        <path className="part gear map accent" d="M30 78 L44 73 L44 96 L30 101 Z" />
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
