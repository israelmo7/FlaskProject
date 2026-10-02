import { useCallback, useEffect, useRef, useState } from 'react'
import './Character.css'

function readRoomPath() {
  const fromDom = document.getElementById('root')?.dataset?.roomPath
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || 'character'
}

async function fetchMessages(roomPath) {
  const res = await fetch(`/api/${roomPath}/messages`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(`load failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
}

async function postMessage(roomPath, message) {
  const res = await fetch(`/api/${roomPath}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error(`send failed (${res.status})`)
  }
  const data = await res.json()
  return data.messages || []
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

function StickMan({ phase, talking }) {
  const pose = talking ? 'talking' : phase || 'idle'
  return (
    <svg
      className={`stick-man pose-${pose}`}
      viewBox="0 0 80 120"
      role="img"
      aria-label={`Stick character, ${pose}`}
    >
      <g className="stick-figure">
        <circle className="part head" cx="40" cy="18" r="12" />
        <line className="part torso" x1="40" y1="30" x2="40" y2="70" />
        <line className="part arm arm-l" x1="40" y1="42" x2="22" y2="58" />
        <line className="part arm arm-r" x1="40" y1="42" x2="58" y2="58" />
        <line className="part leg leg-l" x1="40" y1="70" x2="26" y2="104" />
        <line className="part leg leg-r" x1="40" y1="70" x2="54" y2="104" />
      </g>
    </svg>
  )
}

export default function Character() {
  const roomPath = readRoomPath()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [target, setTarget] = useState(null)
  const [talking, setTalking] = useState(false)
  const lastSeenLine = useRef(null)
  const talkTimer = useRef(null)

  const load = useCallback(async () => {
    try {
      const [lines, status] = await Promise.all([
        fetchMessages(roomPath),
        fetchStatus().catch(() => null),
      ])
      setMessages(lines)
      if (status) {
        setPhase(status.phase || 'idle')
        setTarget(status.target || null)
        if (status.last_line && status.last_line !== lastSeenLine.current) {
          lastSeenLine.current = status.last_line
          setTalking(true)
          if (talkTimer.current) {
            window.clearTimeout(talkTimer.current)
          }
          talkTimer.current = window.setTimeout(() => setTalking(false), 900)
        }
      }
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load character')
    }
  }, [roomPath])

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
    setMessages((prev) => [...prev, text])
    try {
      const lines = await postMessage(roomPath, text)
      setMessages(lines)
      setError('')
    } catch (err) {
      setError(err.message || 'Send failed')
      await load()
    } finally {
      setSending(false)
    }
  }

  const statusLabel =
    phase === 'walking' && target
      ? `Walking to ${target}…`
      : phase === 'visiting' && target
        ? `At ${target}`
        : target
          ? `Waiting at ${target}`
          : 'At home'

  return (
    <main className="character-shell">
      <header className="character-hero">
        <p className="character-brand">Stick</p>
        <h1>Character room</h1>
        <p className="character-lead">
          Command chat: go, read, send, wait, back. Stick moves on your word.
        </p>
      </header>

      <section className="character-stage" aria-live="polite">
        <StickMan phase={phase} talking={talking} />
        <p className="character-status">{statusLabel}</p>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <ul className="character-log" aria-live="polite">
        {messages.length === 0 ? (
          <li className="empty">Try: go lobby — then read, send hi, wait, back.</li>
        ) : (
          messages.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
          ))
        )}
      </ul>

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
