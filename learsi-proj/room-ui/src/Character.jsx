import { useCallback, useEffect, useRef, useState } from 'react'
import StickFigure, { useRotatingStick } from './StickFigure'
import './Character.css'

function readRoomPath() {
  const fromDom = document.getElementById('root')?.dataset?.roomPath
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || 'character'
}

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

export default function Character() {
  const roomPath = readRoomPath()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [target, setTarget] = useState(null)
  const [caption, setCaption] = useState('At home')
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
    <main className="character-shell character-shell-wide">
      <header className="character-hero">
        <p className="character-brand">Stick</p>
        <h1>Character room</h1>
        <p className="character-lead">
          Commands: go · read [n] · say · send · wait · back · knock &lt;letters&gt;.
          Replies stay on the figure.
        </p>
      </header>

      <section className="character-stage character-stage-full" aria-live="polite">
        <StickFigure
          phase={phase}
          talking={talking}
          styleName={styleName}
          gear={gear}
          size="full"
          label="Stick"
          onExpression={onExpression}
        />
        <p className="character-status">{statusLabel}</p>
        <p className="character-style-tag">
          {mood} · {styleName}/{gear} · room {roomPath}
        </p>
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
