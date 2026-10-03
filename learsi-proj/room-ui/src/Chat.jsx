import { useCallback, useEffect, useState } from 'react'
import StickFigure, { useRotatingStick } from './StickFigure'
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

function WanderRail({ phase, caption, side }) {
  const { styleName, gear } = useRotatingStick(3000)
  return (
    <aside className={`wander-rail wander-rail-${side}`} aria-live="polite">
      <StickFigure
        phase={phase || 'visiting'}
        talking={Boolean(caption)}
        styleName={styleName}
        gear={gear}
        size="side"
        label="Wander"
      />
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
    <main className={`chat ${wander ? 'chat-with-wander' : ''}`}>
      <header>
        <h1>Room chat</h1>
        <p className="meta">room {roomPath}</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <div className="chat-body">
        {wander ? (
          <WanderRail
            phase={wander.phase}
            caption={wander.caption}
            side="left"
          />
        ) : null}

        <div className="chat-main">
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
        </div>

        {wander ? (
          <WanderRail
            phase={wander.phase}
            caption={wander.caption}
            side="right"
          />
        ) : null}
      </div>
    </main>
  )
}
