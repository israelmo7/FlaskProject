import { useCallback, useEffect, useState } from 'react'
import './chat.css'

function readRoomPath() {
  const fromDom = document.getElementById('root')?.dataset?.roomPath
  if (fromDom) return fromDom
  const q = new URLSearchParams(window.location.search).get('room')
  return q || 'lobby'
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

async function fetchPresence(roomPath) {
  const res = await fetch(`/api/${roomPath}/presence`, {
    credentials: 'include',
  })
  if (!res.ok) {
    return null
  }
  const data = await res.json()
  return data.wander || null
}

function WanderVisitor({ phase, caption }) {
  const pose = phase || 'visiting'
  return (
    <aside className={`wander-visit pose-${pose}`} aria-live="polite">
      <svg
        className="wander-visit-stick"
        viewBox="0 0 80 120"
        role="img"
        aria-label="Wander is here"
      >
        <g className="wander-visit-figure">
          <circle className="wv-part wv-head" cx="40" cy="20" r="11" />
          <line className="wv-part" x1="40" y1="31" x2="40" y2="70" />
          <line className="wv-part wv-arm-l" x1="40" y1="42" x2="22" y2="58" />
          <line className="wv-part wv-arm-r" x1="40" y1="42" x2="58" y2="58" />
          <line className="wv-part wv-leg-l" x1="40" y1="70" x2="26" y2="104" />
          <line className="wv-part wv-leg-r" x1="40" y1="70" x2="54" y2="104" />
        </g>
      </svg>
      <div className="wander-visit-copy">
        <span className="wander-visit-name">Wander</span>
        <span className="wander-visit-caption">{caption || 'Looking around…'}</span>
      </div>
    </aside>
  )
}

export default function Chat() {
  const roomPath = readRoomPath()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [wander, setWander] = useState(null)

  const load = useCallback(async () => {
    try {
      const [lines, presence] = await Promise.all([
        fetchMessages(roomPath),
        fetchPresence(roomPath),
      ])
      setMessages(lines)
      setWander(presence && presence.present ? presence : null)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load messages')
    }
  }, [roomPath])

  useEffect(() => {
    load()
    const id = setInterval(load, 2000)
    return () => clearInterval(id)
  }, [load])

  async function handleOpenWindow() {
    const url = `/room/${roomPath}/app`
    window.open(url, '_blank', 'width=400,height=600')
  }

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

  return (
    <main className="chat">
      <header>
        <h1>Room chat</h1>
        <p className="meta">room {roomPath}</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      {wander ? (
        <WanderVisitor phase={wander.phase} caption={wander.caption} />
      ) : null}

      <ul className="log" aria-live="polite">
        {messages.length === 0 ? (
          <li className="empty">No messages yet. Say hello.</li>
        ) : (
          messages.map((line, i) => (
            <li key={`${i}-${line.slice(0, 24)}`}>{line}</li>
          ))
        )}
      </ul>

      <form onSubmit={onSend} className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder="Type a message…"
          aria-label="Message"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Send
        </button>
      </form>
      <button type="button" onClick={handleOpenWindow}>
        Open in new window
      </button>
    </main>
  )
}
