import { useCallback, useEffect, useRef, useState } from 'react'
import './Character.css'

const STICK_STYLES = ['classic', 'chalk', 'ink', 'neon', 'sketch']
const STYLE_ROTATE_MS = 2800

async function postCommand(message) {
  const res = await fetch('/api/character/command', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error(`command failed (${res.status})`)
  }
  const data = await res.json()
  return data.status || {}
}

async function fetchStatus() {
  const res = await fetch('/api/character/status', {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`status failed (${res.status})`)
  }
  return res.json()
}

function StickMan({ phase, talking, styleName }) {
  const pose = talking ? 'talking' : phase || 'idle'
  return (
    <svg
      className={`stick-man style-${styleName} pose-${pose}`}
      viewBox="0 0 80 120"
      role="img"
      aria-label={`Stick character, ${styleName}, ${pose}`}
    >
      <g className="stick-figure">
        {/* hat — ink / neon */}
        <path
          className="part accent hat"
          d="M22 14 Q40 2 58 14"
          fill="none"
        />
        <circle className="part head" cx="40" cy="20" r="11" />
        {/* eyes — sketch / chalk */}
        <circle className="part eye eye-l" cx="36" cy="18" r="1.4" />
        <circle className="part eye eye-r" cx="44" cy="18" r="1.4" />
        <line className="part torso" x1="40" y1="31" x2="40" y2="70" />
        <line className="part arm arm-l" x1="40" y1="42" x2="22" y2="58" />
        <line className="part arm arm-r" x1="40" y1="42" x2="58" y2="58" />
        <line className="part leg leg-l" x1="40" y1="70" x2="26" y2="104" />
        <line className="part leg leg-r" x1="40" y1="70" x2="54" y2="104" />
        {/* scarf — classic / neon */}
        <path
          className="part accent scarf"
          d="M34 32 Q40 38 46 32"
          fill="none"
        />
      </g>
    </svg>
  )
}

export default function Character() {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [target, setTarget] = useState(null)
  const [caption, setCaption] = useState('At home')
  const [talking, setTalking] = useState(false)
  const [styleIdx, setStyleIdx] = useState(0)
  const lastCaption = useRef(null)
  const talkTimer = useRef(null)

  const applyStatus = useCallback((status) => {
    if (!status) return
    setPhase(status.phase || 'idle')
    setTarget(status.target || null)
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
      const status = await fetchStatus()
      applyStatus(status)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load character')
    }
  }, [applyStatus])

  useEffect(() => {
    load()
    const id = setInterval(load, 2000)
    return () => {
      clearInterval(id)
      if (talkTimer.current) {
        window.clearTimeout(talkTimer.current)
      }
    }
  }, [load])

  useEffect(() => {
    const id = setInterval(() => {
      setStyleIdx((i) => (i + 1) % STICK_STYLES.length)
    }, STYLE_ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  async function onSend(e) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || sending) return

    setSending(true)
    setDraft('')
    try {
      const status = await postCommand(text)
      applyStatus(status)
      setError('')
    } catch (err) {
      setError(err.message || 'Command failed')
      await load()
    } finally {
      setSending(false)
    }
  }

  const styleName = STICK_STYLES[styleIdx]
  const fallbackLabel =
    phase === 'walking' && target
      ? `Walking to ${target}…`
      : phase === 'visiting' && target
        ? `At ${target}`
        : target
          ? `Waiting at ${target}`
          : 'At home'
  const statusLabel = caption || fallbackLabel

  return (
    <main className="character-shell">
      <header className="character-hero">
        <p className="character-brand">Stick</p>
        <h1>Character room</h1>
        <p className="character-lead">
          Commands only — go, read [n], send, wait, back. Replies stay on Stick.
        </p>
      </header>

      <section className="character-stage" aria-live="polite">
        <StickMan phase={phase} talking={talking} styleName={styleName} />
        <p className="character-status">{statusLabel}</p>
        <p className="character-style-tag">{styleName}</p>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <form onSubmit={onSend} className="character-composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="go lobby"
          aria-label="Command"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
    </main>
  )
}
