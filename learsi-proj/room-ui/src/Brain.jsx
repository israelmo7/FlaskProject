import { useCallback, useEffect, useRef, useState } from 'react'
import StickFigure, { useRotatingStick } from './StickFigure'
import './Character.css'

async function fetchBrainStatus() {
  const res = await fetch('/api/brain/status', {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`status failed (${res.status})`)
  }
  return res.json()
}

export default function Brain() {
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle')
  const [target, setTarget] = useState(null)
  const [caption, setCaption] = useState('Waking up…')
  const [lastCommand, setLastCommand] = useState(null)
  const [talking, setTalking] = useState(false)
  const [mood, setMood] = useState('calm')
  const { styleName, gear } = useRotatingStick(5200)
  const lastCaption = useRef(null)
  const talkTimer = useRef(null)
  const onExpression = useCallback((name) => setMood(name), [])

  const applyStatus = useCallback((status) => {
    if (!status) return
    setPhase(status.phase || 'idle')
    setTarget(status.target || null)
    setLastCommand(status.last_command || null)
    const nextCaption = status.caption || 'At home'
    setCaption(nextCaption)
    if (nextCaption && nextCaption !== lastCaption.current) {
      lastCaption.current = nextCaption
      setTalking(true)
      if (talkTimer.current) {
        window.clearTimeout(talkTimer.current)
      }
      talkTimer.current = window.setTimeout(() => setTalking(false), 900)
    }
  }, [])

  const load = useCallback(async () => {
    try {
      const status = await fetchBrainStatus()
      applyStatus(status)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load brain')
    }
  }, [applyStatus])

  useEffect(() => {
    load()
    const id = setInterval(load, 1500)
    return () => {
      clearInterval(id)
      if (talkTimer.current) {
        window.clearTimeout(talkTimer.current)
      }
    }
  }, [load])

  const placeLabel =
    phase === 'walking' && target
      ? `Walking to ${target}…`
      : target
        ? `Somewhere near ${target}`
        : 'At HQ'

  return (
    <main className="character-shell character-shell-wide">
      <header className="character-hero">
        <p className="character-brand">Wander</p>
        <h1>Brain room</h1>
        <p className="character-lead">
          Full-size Stick body. A mind rides the tools — goes, reads, knocks, says
          captions. You watch.
        </p>
      </header>

      <section className="character-stage character-stage-full" aria-live="polite">
        <StickFigure
          phase={phase}
          talking={talking}
          styleName={styleName}
          gear={gear}
          size="full"
          label="Wander"
          onExpression={onExpression}
        />
        <p className="character-status">{caption}</p>
        <p className="character-style-tag">
          {placeLabel}
          {lastCommand ? ` · ${lastCommand}` : ''}
          {` · ${mood} · ${styleName}/${gear}`}
        </p>
      </section>

      {error ? <p className="error">{error}</p> : null}
    </main>
  )
}
